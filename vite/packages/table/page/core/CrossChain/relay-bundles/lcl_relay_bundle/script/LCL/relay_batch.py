#!/usr/bin/env python3
"""Pipeline ordered LCL relay transactions using the existing contract and encoder."""
import argparse
import atexit
import json
import logging
import os
import signal
import time
from pathlib import Path

import rlp
from requests.exceptions import RequestException
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
from get_LCL_Header import ETHBlockHeaderManager

RUNNING = True
_PROCESS_LOCK = None
ZERO = bytes(32)


def stop(*_):
    global RUNNING
    RUNNING = False


def rpc_batch(w, calls):
    responses = w.provider.make_batch_request(calls)
    if not isinstance(responses, list) or len(responses) != len(calls):
        raise RuntimeError(f'Invalid batch response: {responses}')
    ids = [r.get('id') for r in responses]
    if any(not isinstance(i, int) for i in ids) or len(set(ids)) != len(ids):
        raise RuntimeError('Invalid batch response IDs')
    return sorted(responses, key=lambda r: r['id'])


def results(w, calls):
    responses = rpc_batch(w, calls)
    for response in responses:
        if 'error' in response:
            raise RuntimeError(response['error'])
    return [r['result'] for r in responses]


def snapshot(w, contract, account, tag):
    functions = [contract.functions.getTopKeyFromShadowLedger_slot(),
                 contract.functions.getTopKeyFromShadowLedger(),
                 contract.functions.getContractState(),
                 contract.functions.getRequireStake(),
                 contract.functions.getMyStake(), contract.functions.getPenalty()]
    values = results(w, [('eth_call', [{'to': contract.address, 'from': account,
        'data': fn._encode_transaction_data()}, tag]) for fn in functions])
    return dict(zip(['height', 'key', 'state', 'required', 'stake', 'penalty'],
                    [int(values[0], 16), bytes.fromhex(values[1][2:])] +
                    [int(v, 16) for v in values[2:]]))


def check_headers(payloads, start, anchor):
    from clique_header import validate_header
    keys = []
    previous = None
    for i, raw in enumerate(payloads):
        fields, key = validate_header(raw, start + i)
        if i == 0 and key != anchor:
            raise ValueError('Source differs from the on-chain checkpoint')
        if previous is not None:
            if fields[0] != keys[-1] or int.from_bytes(fields[11], 'big') < int.from_bytes(previous[11], 'big') + 3:
                raise ValueError('Non-contiguous parent or timestamp')
            limit = int.from_bytes(previous[9], 'big')
            if abs(int.from_bytes(fields[9], 'big') - limit) >= limit // 1024:
                raise ValueError('Invalid gas limit change')
        previous = fields
        keys.append(key)
    return keys


def acquire_lock(path):
    file = path.open('a+b')
    try:
        if os.name == 'nt':
            import msvcrt
            file.seek(0)
            if not file.read(1):
                file.write(b'0'); file.flush()
            file.seek(0)
            msvcrt.locking(file.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(file, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except Exception:
        file.close()
        raise
    return file


def plan_parents(top, end, has_commit):
    # One lookahead block supplies the next commitment; all revealed heights remain consecutive.
    return range(top + (1 if has_commit else 0), end + 1)


def save_pending(path, data):
    temp = path.with_suffix('.new')
    with temp.open('w') as file:
        os.chmod(temp, 0o600)
        json.dump(data, file)
        file.flush()
        os.fsync(file.fileno())
    temp.replace(path)


def settle(w, contract, account, pending):
    """Resend identical signed transactions after interruption, never create nonce replacements."""
    hashes = [Web3.to_hex(Web3.keccak(hexstr=raw)) for raw in pending['raw']]
    sent_at = time.monotonic()
    # RPC batches may be executed out of order; enqueue ascending nonces without waiting for receipts.
    for raw in pending['raw']:
        reply = w.provider.make_request('eth_sendRawTransaction', [raw])
        error = reply.get('error')
        if error and not any(s in str(error).lower() for s in ['already known', 'nonce too low']):
            raise RuntimeError(f'Broadcast failed; pending journal retained: {error}')
    logging.info('Enqueued %d transactions in %.2fs', len(hashes), time.monotonic()-sent_at)
    deadline = time.monotonic() + 180
    while True:
        receipts = results(w, [('eth_getTransactionReceipt', [h]) for h in hashes])
        if all(receipts):
            break
        if time.monotonic() >= deadline:
            raise TimeoutError('Batch confirmation timed out; restart to resume the saved batch')
        time.sleep(1)
    if any(int(r['status'], 16) != 1 for r in receipts):
        raise RuntimeError('A transaction reverted; journal retained for inspection')
    block = max(int(r['blockNumber'], 16) for r in receipts)
    state = snapshot(w, contract, account, hex(block))
    if state['height'] != pending['height'] or state['key'].hex() != pending['key']:
        raise RuntimeError('Confirmed transactions did not produce the expected checkpoint')
    if state['penalty'] != pending['penalty'] or state['stake'] != pending['stake']:
        raise RuntimeError('Unexpected stake or penalty change; stopping')
    gas = sum(int(r['gasUsed'], 16) for r in receipts)
    logging.info('Confirmed %d transactions, height=%d, gas=%d, last_tx=%s',
                 len(hashes), state['height'], gas, hashes[-1])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--env', choices=['dev', 'test'], default='dev')
    parser.add_argument('--rpc-url', default='')
    parser.add_argument('--batch-size', type=int, default=32)
    parser.add_argument('--confirmations', type=int, default=2, help='Source blocks to wait before committing')
    parser.add_argument('--interval', type=float, default=1)
    parser.add_argument('--once', action='store_true')
    args = parser.parse_args()
    if not 1 <= args.batch_size <= 32 or args.confirmations < 0 or args.interval <= 0:
        parser.error('batch-size must be 1..32; confirmations >= 0; interval > 0')
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    root = Path(__file__).resolve().parents[2]
    load_dotenv(root / '.env')
    work = root / 'tmp/lcl-relayer' / args.env
    work.mkdir(parents=True, exist_ok=True)
    global _PROCESS_LOCK
    if _PROCESS_LOCK is None:
        _PROCESS_LOCK = acquire_lock(work / 'batch.lock')
        atexit.register(_PROCESS_LOCK.close)
    source = ETHBlockHeaderManager('', '', 0, '', '', logging.getLogger('LCL'))
    w = Web3(Web3.HTTPProvider(args.rpc_url or os.environ[f'{args.env.upper()}_RPC_URL'],
                              request_kwargs={'timeout': 30}))
    w.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
    account = w.eth.account.from_key(os.environ[f'{args.env.upper()}_PRIVATE_KEY'])
    chain_id = w.eth.chain_id
    abi = json.loads((root / 'out/RelayContract.sol/LCL_Relay.json').read_text())['abi']
    contract = w.eth.contract(address=(root / f'data/{args.env}/LCL.address').read_text().strip(), abi=abi)
    if contract.functions.HEADER_VERSION().call() != 2:
        raise RuntimeError('Requires newly deployed LCL header v2 contract')
    manager_abi = [
        {'type':'function','name':'getSourceChainIDBySymbol','stateMutability':'view',
         'inputs':[{'name':'symbol','type':'string'}],'outputs':[{'name':'id','type':'uint256'}]},
        {'type':'function','name':'getSystemContractAddressByLevelID','stateMutability':'view',
         'inputs':[{'name':'id','type':'uint256'},{'name':'level','type':'uint256'}],
         'outputs':[{'name':'addr','type':'address'}]}]
    manager = w.eth.contract(address=(root / f'data/{args.env}/Manager.address').read_text().strip(), abi=manager_abi)
    source_id = manager.functions.getSourceChainIDBySymbol('LCL').call()
    if source_id == 0 or manager.functions.getSystemContractAddressByLevelID(source_id, 0).call() != contract.address:
        raise RuntimeError('LCL address differs from Manager registration; finish migration first')
    genesis = source.web3.eth.get_block(0).hash
    if not contract.functions.initialized().call() or contract.functions.sourceGenesisHash().call() != genesis:
        raise RuntimeError('Uninitialized relay or wrong LCL genesis')
    identity = {'chain_id': chain_id, 'contract': contract.address, 'account': account.address,
                'source_chain_id': source.web3.eth.chain_id}
    journal = work / 'pending.json'
    logging.info('Starting batch relayer: %s, batch_size=%d', identity, args.batch_size)
    if journal.exists():
        pending = json.loads(journal.read_text())
        if pending['identity'] != identity:
            raise RuntimeError('Pending batch belongs to another chain, contract or account')
        if source.web3.eth.get_block(pending['height']).hash.hex() != pending['key']:
            raise RuntimeError('Source changed since the pending batch was signed')
        settle(w, contract, account.address, pending)
        journal.replace(work / 'last-batch.json')
    while RUNNING:
        started = time.monotonic()
        tag = hex(w.eth.block_number)
        state = snapshot(w, contract, account.address, tag)
        if state['state'] != 2 or state['stake'] < state['required']:
            raise RuntimeError('Relay is inactive or stake insufficient; no automatic top-up')
        if source.web3.eth.syncing is not False:
            raise RuntimeError('Source node is still syncing')
        head = source.web3.eth.block_number
        end = min(state['height'] + args.batch_size, head - args.confirmations - 1)
        if end <= state['height']:
            logging.info('Caught up: height=%d source=%d lag=%d', state['height'], head, head-state['height'])
            if args.once:
                break
            time.sleep(args.interval)
            continue
        top = state['height']
        payloads = [bytes.fromhex(source.get_shadow_payload_RPC(h)[2:]) for h in range(top, end + 2)]
        keys = check_headers(payloads, top, state['key'])
        target_time = w.eth.get_block(int(tag, 16)).timestamp
        if any(int.from_bytes(rlp.decode(raw)[11], 'big') > target_time for raw in payloads):
            raise RuntimeError('Source headers are ahead of target-chain clock; wait before signing')
        owner, locked, commit, _ = contract.functions.getCommitInfo(keys[1], keys[0]).call(block_identifier=int(tag, 16))
        has_commit = commit != ZERO
        if has_commit and (owner != account.address or locked != state['required'] or
                           commit != Web3.keccak(payloads[1] + bytes.fromhex(account.address[2:]))):
            raise RuntimeError('Existing next-block commitment differs; stopping before revealing it')
        if not has_commit and state['stake'] < 2 * state['required']:
            raise RuntimeError('Bootstrap needs two stakes; no automatic top-up')
        # ponytail: one bounded batch in flight; add a deeper pipeline only if batch throughput is insufficient.
        nonces = results(w, [('eth_getTransactionCount', [account.address, tag]),
                             ('eth_getTransactionCount', [account.address, 'pending'])])
        if nonces[0] != nonces[1]:
            raise RuntimeError('Account has other pending transactions; refusing nonce collision')
        nonce = int(nonces[1], 16)
        raw_txs = []
        for h in plan_parents(top, end, has_commit):
            i = h - top
            commit = Web3.keccak(payloads[i+1] + bytes.fromhex(account.address[2:]))
            fn = contract.functions.updateShadowLedgerByRelayer(payloads[i], keys[i+1], commit)
            tx = {'chainId': chain_id, 'nonce': nonce + len(raw_txs), 'gasPrice': 10_000_000_000,
                  'gas': 1_000_000, 'to': contract.address, 'value': 0, 'data': fn._encode_transaction_data()}
            if not raw_txs:
                w.eth.call({**tx, 'from': account.address}, block_identifier=int(tag, 16))
            raw_txs.append(Web3.to_hex(account.sign_transaction(tx).raw_transaction))
        pending = {'identity': identity, 'raw': raw_txs, 'height': end, 'key': keys[end-top].hex(),
                   'penalty': state['penalty'],
                   'stake': state['stake'] - (0 if has_commit else state['required'])}
        save_pending(journal, pending)
        logging.info('Prepared %d transactions in %.2fs', len(raw_txs), time.monotonic()-started)
        settle(w, contract, account.address, pending)
        journal.replace(work / 'last-batch.json')
        latest = source.web3.eth.block_number
        logging.info('Progress %d -> %d in %.2fs, source=%d lag=%d -> %d',
                     top, end, time.monotonic()-started, latest, head-top, latest-end)
        if args.once:
            break
    logging.info('Batch relayer stopped after confirming its in-flight batch')


if __name__ == '__main__':
    while RUNNING:
        try:
            main()
            break
        except (RequestException, TimeoutError, ConnectionError) as error:
            logging.error('RPC interrupted; saved batch will be resumed: %s', error)
            if RUNNING:
                time.sleep(5)
