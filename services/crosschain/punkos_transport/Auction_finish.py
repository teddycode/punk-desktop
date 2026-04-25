import os
import sys
from pathlib import Path

import rlp
from dotenv import load_dotenv
from hexbytes import HexBytes
from trie import HexaryTrie
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

try:
    from contract_resolver import resolve_transport_address
except ImportError:
    from punkos_transport.contract_resolver import resolve_transport_address

def debug_print(msg):
    """输出到 stderr，不影响 stdout 的 JSON"""
    print(msg, file=sys.stderr)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

TASK_KEY = "0x31ae4219f0a072acf7ba3abd25ef9dc743cf9a3cae7f75d1c3fe24e76c58cbfa" 

PROOF_BUNDLE_TYPE = "(string,uint256,bytes32,(bytes32,bytes32,address,bytes32,bytes32,bytes32,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes32,bytes,uint256,bytes32),(uint256,bytes,uint256,bytes,(address,bytes[],bytes)[]),bytes,bytes[])"


def _to_bytes(value):
    if value is None:
        return b""
    if isinstance(value, bytes):
        return value
    if isinstance(value, str):
        if value.startswith('0x'):
            return bytes.fromhex(value[2:])
        return bytes.fromhex(value)
    return bytes(HexBytes(value))


def _status_to_post_state_or_status(receipt):
    if receipt.get("root") is not None:
        return _to_bytes(receipt["root"])

    status = int(receipt.get("status", 0))
    return b"\x01" if status == 1 else b""


def _build_header_tuple(block):
    return (
        HexBytes(block["parentHash"]),
        HexBytes(block["sha3Uncles"]),
        Web3.to_checksum_address(block["miner"]),
        HexBytes(block["stateRoot"]),
        HexBytes(block["transactionsRoot"]),
        HexBytes(block["receiptsRoot"]),
        _to_bytes(block["logsBloom"]),
        int(block["difficulty"]),
        int(block["number"]),
        int(block["gasLimit"]),
        int(block["gasUsed"]),
        int(block["timestamp"]),
        _to_bytes(block.get("extraData", b"")),
        HexBytes(block["mixHash"]),
        _to_bytes(block.get("nonce", b"")),
        int(block.get("baseFeePerGas") or 0),
        HexBytes(block.get("withdrawalsRoot") or bytes(32)),
    )


def _build_receipt_tuple(receipt):
    logs = []
    for entry in receipt["logs"]:
        logs.append(
            (
                Web3.to_checksum_address(entry["address"]),
                [_to_bytes(topic) for topic in entry["topics"]],
                _to_bytes(entry["data"]),
            )
        )

    return (
        int(receipt.get("type", 0)),
        _status_to_post_state_or_status(receipt),
        int(receipt["cumulativeGasUsed"]),
        _to_bytes(receipt["logsBloom"]),
        logs,
    )


def _encode_receipt_for_trie(receipt):
    payload = [
        _status_to_post_state_or_status(receipt),
        int(receipt["cumulativeGasUsed"]),
        _to_bytes(receipt["logsBloom"]),
        [
            [
                Web3.to_bytes(hexstr=entry["address"]),
                [_to_bytes(topic) for topic in entry["topics"]],
                _to_bytes(entry["data"]),
            ]
            for entry in receipt["logs"]
        ],
    ]

    encoded = rlp.encode(payload)
    receipt_type = int(receipt.get("type", 0))
    if receipt_type != 0:
        encoded = bytes([receipt_type]) + encoded

    return encoded


def _receipt_key_nibbles(tx_index):
    key = rlp.encode(int(tx_index))
    nibbles = bytearray()
    for item in key:
        nibbles.append(item >> 4)
        nibbles.append(item & 0x0F)
    return key, bytes(nibbles)


def _compute_key_shadow_block_from_header_tuple(header_tuple):
    withdrawals_root = HexBytes(header_tuple[16])

    fields = [
        HexBytes(header_tuple[0]),
        HexBytes(header_tuple[1]),
        Web3.to_bytes(hexstr=header_tuple[2]),
        HexBytes(header_tuple[3]),
        HexBytes(header_tuple[4]),
        HexBytes(header_tuple[5]),
        _to_bytes(header_tuple[6]),
        int(header_tuple[7]),
        int(header_tuple[8]),
        int(header_tuple[9]),
        int(header_tuple[10]),
        int(header_tuple[11]),
        _to_bytes(header_tuple[12]),
        HexBytes(header_tuple[13]),
        _to_bytes(header_tuple[14]),
        int(header_tuple[15]),
    ]

    if withdrawals_root != HexBytes(bytes(32)):
        fields.append(withdrawals_root)

    return HexBytes(Web3.keccak(rlp.encode(fields)))


def _fetch_block_receipts(web3, block_number):
    if hasattr(web3.eth, "get_block_receipts"):
        return list(web3.eth.get_block_receipts(block_number))

    block = web3.eth.get_block(block_number, full_transactions=False)
    return [web3.eth.get_transaction_receipt(tx_hash) for tx_hash in block["transactions"]]


def build_lcl_proof_bundle(w3_dest, dest_tx_hash):
    receipt = w3_dest.eth.get_transaction_receipt(dest_tx_hash)
    if receipt is None:
        raise ValueError("目标交易未确认或未找到")

    block_number = int(receipt["blockNumber"])
    block_hash = HexBytes(receipt["blockHash"])
    
    block_hash_hex = HexBytes(block_hash).to_0x_hex()
    raw_block_response = w3_dest.provider.make_request("eth_getBlockByHash", [block_hash_hex, False])
    raw_block = raw_block_response.get("result") if isinstance(raw_block_response, dict) else None
    if not raw_block:
        raw_block = w3_dest.manager.request_blocking("eth_getBlockByHash", [block_hash_hex, False])
    
    if not raw_block:
        raise ValueError(f"无法获取区块 {block_hash.hex()}")
    
    raw_extra_data = raw_block.get("extraData")
    if raw_extra_data is None:
        raw_extra_data = raw_block.get("proofOfAuthorityData")

    debug_print(f"🔍 DEBUG: raw_block extraData = {raw_block.get('extraData', 'MISSING')}")
    debug_print(f"🔍 DEBUG: raw_block proofOfAuthorityData = {raw_block.get('proofOfAuthorityData', 'MISSING')}")
    if raw_extra_data:
        debug_print(f"🔍 DEBUG: raw extraData length = {len(raw_extra_data)}")
    
    block = {
        "parentHash": HexBytes(raw_block["parentHash"]),
        "sha3Uncles": HexBytes(raw_block["sha3Uncles"]),
        "miner": Web3.to_checksum_address(raw_block["miner"]),
        "stateRoot": HexBytes(raw_block["stateRoot"]),
        "transactionsRoot": HexBytes(raw_block["transactionsRoot"]),
        "receiptsRoot": HexBytes(raw_block["receiptsRoot"]),
        "logsBloom": _to_bytes(raw_block.get("logsBloom", b"")),
        "difficulty": int(raw_block["difficulty"], 16)
        if isinstance(raw_block["difficulty"], str)
        else int(raw_block["difficulty"]),
        "number": int(raw_block["number"], 16)
        if isinstance(raw_block["number"], str)
        else int(raw_block["number"]),
        "gasLimit": int(raw_block["gasLimit"], 16)
        if isinstance(raw_block["gasLimit"], str)
        else int(raw_block["gasLimit"]),
        "gasUsed": int(raw_block["gasUsed"], 16)
        if isinstance(raw_block["gasUsed"], str)
        else int(raw_block["gasUsed"]),
        "timestamp": int(raw_block["timestamp"], 16)
        if isinstance(raw_block["timestamp"], str)
        else int(raw_block["timestamp"]),
        "extraData": _to_bytes(raw_extra_data or b""),
        "mixHash": HexBytes(raw_block.get("mixHash") or raw_block.get("mixDigest") or bytes(32)),
        "nonce": _to_bytes(raw_block.get("nonce", b"")),
        "baseFeePerGas": int(raw_block.get("baseFeePerGas", "0x0"), 16)
        if isinstance(raw_block.get("baseFeePerGas", 0), str)
        else int(raw_block.get("baseFeePerGas", 0) or 0),
        "withdrawalsRoot": HexBytes(raw_block.get("withdrawalsRoot") or bytes(32)),
    }
    
    debug_print(f"🔍 DEBUG: block['extraData'] = {block['extraData'].hex() if block['extraData'] else 'EMPTY'}")
    debug_print(f"🔍 DEBUG: block['extraData'] length = {len(block['extraData'])}")
    
    receipts = sorted(
        _fetch_block_receipts(w3_dest, block_number),
        key=lambda item: int(item["transactionIndex"]),
    )

    trie = HexaryTrie(db={})
    target_receipt = None
    target_leaf = None
    trie_key = None

    for item in receipts:
        encoded_receipt = _encode_receipt_for_trie(item)
        raw_key, nibble_key = _receipt_key_nibbles(item["transactionIndex"])
        trie.set(raw_key, encoded_receipt)

        if HexBytes(item["transactionHash"]) == HexBytes(dest_tx_hash):
            target_receipt = item
            target_leaf = encoded_receipt
            trie_key = raw_key
            _ = nibble_key

    if target_receipt is None or target_leaf is None or trie_key is None:
        raise ValueError("未能在目标区块 receipts trie 中定位交易")

    if HexBytes(trie.root_hash) != HexBytes(block["receiptsRoot"]):
        raise ValueError("本地构建的 receiptsRoot 与链上区块头不一致")

    proof_nodes = trie.get_proof(trie_key)
    receipt_proof = [rlp.encode(node) for node in proof_nodes]

    proof_bundle = (
        "LCL",
        block_number,
        HexBytes(dest_tx_hash),
        _build_header_tuple(block),
        _build_receipt_tuple(target_receipt),
        trie_key,
        receipt_proof,
    )

    key_shadow_block = _compute_key_shadow_block_from_header_tuple(proof_bundle[3])

    return {
        "receipt": target_receipt,
        "block_hash": block_hash,
        "key_shadow_block": key_shadow_block,
        "block_number": block_number,
        "proof_bundle": proof_bundle,
    }

def main():
    src_rpc = os.getenv("DEV_RPC_URL")
    src_key = os.getenv("DEV_PRIVATE_KEY")
    dest_rpc = os.getenv("TEST_RPC_URL")
    deploy_env = os.getenv("DEPLOY_ENV", "dev")

    if not src_rpc or not src_key or not dest_rpc:
        print("❌ 环境变量缺失")
        return

    try:
        with open(PROJECT_ROOT / "dest_tx_hash.txt", "r", encoding="utf-8") as f:
            dest_tx_hash = f.read().strip()
            if not dest_tx_hash.startswith("0x"): dest_tx_hash = "0x" + dest_tx_hash
    except FileNotFoundError:
        print(f"❌ 找不到文件: {PROJECT_ROOT / 'dest_tx_hash.txt'}")
        return

    print(f"🎯 结算任务 TaskKey: {TASK_KEY[:10]}...")
    print(f"🔎 目标交易 Hash: {dest_tx_hash}")
    
    w3_src = Web3(Web3.HTTPProvider(src_rpc))
    w3_dest = Web3(Web3.HTTPProvider(dest_rpc))
    w3_dest.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
    
    if not w3_src.is_connected() or not w3_dest.is_connected():
        print("❌ 节点连接失败")
        return
    
    relayer = w3_src.eth.account.from_key(src_key).address
    transport_contract_address = resolve_transport_address(w3_src, deploy_env=deploy_env)
    print(f"📍 Transport 地址: {transport_contract_address}")

    print("📦 正在从目标链抓取收据证明...")
    try:
        proof_context = build_lcl_proof_bundle(w3_dest, dest_tx_hash)
        block_hash = proof_context["block_hash"]
        key_shadow_block = proof_context["key_shadow_block"]
        block_number = proof_context["block_number"]
        print(f"📦 目标区块 Hash: {block_hash.hex()}")
        print(f"🧩 keyShadowBlock: {key_shadow_block.hex()}")
        print(f"📏 目标区块高度: {block_number}")
        print(f"🧾 收据证明节点数: {len(proof_context['proof_bundle'][6])}")
        
    except Exception as e:
        print(f"❌ 从链上获取数据失败: {e}")
        print("请检查 TEST_RPC_URL 是否正常，或交易是否已上链。")
        return

    abi = [{
        "inputs": [
            {"internalType": "bytes32", "name": "_taskKey", "type": "bytes32"},
            {"internalType": "bytes", "name": "rawTx", "type": "bytes"},
            {"internalType": "bytes", "name": "leafNode", "type": "bytes"},
            {"internalType": "bytes", "name": "proof", "type": "bytes"},
            {"internalType": "bytes32", "name": "keyShadowBlock", "type": "bytes32"}
        ],
        "name": "finishTask",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }]
    contract = w3_src.eth.contract(address=transport_contract_address, abi=abi)

    print("🚀 提交 finishTask...")
    try:
        tx_params = {
            'chainId': w3_src.eth.chain_id,
            'from': relayer,
            'nonce': w3_src.eth.get_transaction_count(relayer),
            'gas': 3000000, 
            'gasPrice': int(w3_src.eth.gas_price * 1.2)
        }

        proof_bytes = w3_src.codec.encode(
            [PROOF_BUNDLE_TYPE],
            [proof_context["proof_bundle"]]
        )
        func = contract.functions.finishTask(
            TASK_KEY,
            b"",
            b"",
            proof_bytes,
            key_shadow_block
        )

        try:
            print("Running Simulation...")
            func.call({'from': relayer})
            print("✅ 模拟验证通过！LCL 收据证明可用。")
        except Exception as e:
            print(f"⚠️ 模拟失败: {e}")
            print("请确认你已经部署了 `TransportTaskVerifier`、更新了路由，并且目标交易所在区块可被 RPC 正确返回。")
            check = input("是否强行发送交易? (y/n): ")
            if check.lower() != 'y':
                return

        tx_build = func.build_transaction(tx_params)
        signed_tx = w3_src.eth.account.sign_transaction(tx_build, src_key)

        raw_signed_tx = getattr(signed_tx, "raw_transaction", None)
        if raw_signed_tx is None:
            raw_signed_tx = signed_tx[0]

        tx_hash = w3_src.eth.send_raw_transaction(raw_signed_tx)
        print(f"🔗 交易 Hash: {tx_hash.hex()}")
        print("⏳ 等待确认...")
        
        receipt = w3_src.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            print("\n🎉🎉🎉 结算成功！任务完成！")
        else:
            print("\n❌交易 Revert。")

    except Exception as e:
        print(f"❌ 执行出错: {e}")

if __name__ == "__main__":
    main()
