"""LCL full node installer and foreground runner. Python 3.10+, standard library only."""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import platform
import re
import subprocess
import sys
import tarfile
import time
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent
NETWORK = json.loads((ROOT / 'network.json').read_text())


def target():
    arch = platform.machine().lower()
    arch = {'x86_64':'amd64', 'amd64':'amd64', 'aarch64':'arm64', 'arm64':'arm64'}.get(arch, arch)
    return platform.system().lower() + '-' + arch


def executable():
    return ROOT / 'bin' / ('geth.exe' if os.name == 'nt' else 'geth')


def check_version():
    result = subprocess.run([str(executable()), 'version'], capture_output=True, text=True, check=True)
    if not re.search(r'^Version: 1\.13\.15-stable', result.stdout, re.M):
        raise RuntimeError('Expected Geth 1.13.15-stable; run install in a fresh bundle directory')


def install():
    if executable().exists():
        check_version()
        print('Geth 1.13.15 already installed')
        return
    assets = json.loads((ROOT / 'downloads.json').read_text())
    if target() not in assets:
        raise RuntimeError(f'Unsupported platform: {target()}; see README')
    asset = assets[target()]
    print('Downloading:', asset['url'], flush=True)
    with urllib.request.urlopen(asset['url'], timeout=120) as response:
        data = response.read()
    # MD5 is the official archive integrity metadata, not a signature verification.
    if len(data) != asset['size'] or hashlib.md5(data).hexdigest() != asset['md5']:
        raise RuntimeError('Official archive size/checksum mismatch')
    name = 'geth.exe' if os.name == 'nt' else 'geth'
    if asset['url'].endswith('.zip'):
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            matches = [n for n in archive.namelist() if n.split('/')[-1] == name]
            if len(matches) != 1:
                raise RuntimeError('Unexpected Geth ZIP contents')
            binary = archive.read(matches[0])
    else:
        with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
            matches = [m for m in archive.getmembers() if m.isfile() and m.name.split('/')[-1] == name]
            if len(matches) != 1:
                raise RuntimeError('Unexpected Geth archive contents')
            binary = archive.extractfile(matches[0]).read()
    executable().parent.mkdir(exist_ok=True)
    temp = executable().with_suffix('.download')
    temp.write_bytes(binary)
    temp.chmod(0o755)
    temp.replace(executable())
    check_version()
    print('Installed:', executable())


def validate_files():
    if hashlib.sha256((ROOT/'genesis.json').read_bytes()).hexdigest() != NETWORK['genesisFileSha256']:
        raise RuntimeError('genesis.json changed; refusing to initialize/start')


def base(data):
    return [str(executable()), '--datadir', str(data), '--networkid', str(NETWORK['networkId']),
            '--syncmode', 'full', '--state.scheme', 'hash']


def initialize(data):
    check_version()
    validate_files()
    data.mkdir(parents=True, exist_ok=True)
    # Geth rejects incompatible existing databases; never reset or remove user data.
    subprocess.run(base(data) + ['init', str(ROOT/'genesis.json')], check=True)
    # Open the initialized chain without peers or RPC listeners to verify its actual hash.
    command = base(data) + ['--nodiscover', '--maxpeers', '0', '--port', '0',
        '--authrpc.port', '0', '--ipcdisable', '--exec', 'eth.getBlock(0).hash', 'console']
    result = subprocess.run(command, capture_output=True, text=True, timeout=60, check=True)
    if NETWORK['genesisHash'].lower() not in result.stdout.lower():
        raise RuntimeError('Genesis hash mismatch; no peer connection attempted. Inspect genesis.json and existing data')
    print('Verified genesis:', NETWORK['genesisHash'])


def start(data, rpc_port, p2p_port):
    initialize(data)
    # Explicit static connection: discport=0 means this peer cannot serve UDP discovery.
    config = data / 'lcl-static.toml'
    config.write_text('[Node.P2P]\nStaticNodes = [' + json.dumps(NETWORK['enode']) + ']\n', encoding='utf-8')
    command = base(data) + ['--config', str(config), '--nodiscover', '--port', str(p2p_port),
        '--maxpeers', '10', '--http', '--http.addr', '127.0.0.1', '--http.port', str(rpc_port),
        '--http.api', 'eth,net,web3', '--http.vhosts', 'localhost,127.0.0.1',
        '--authrpc.port', '0', '--ipcdisable', '--cache', '512']
    print(f'LCL source RPC: http://127.0.0.1:{rpc_port}\nPress Ctrl+C to stop. Data: {data}', flush=True)
    child = subprocess.Popen(command)
    try:
        return child.wait()
    except KeyboardInterrupt:
        # Foreground child receives the terminal's Ctrl+C as well; give Geth time to flush.
        print('Waiting for Geth to stop and flush its database...', flush=True)
        return child.wait(timeout=120)


def rpc(port, method, params=None):
    request = urllib.request.Request(f'http://127.0.0.1:{port}',
        data=json.dumps({'jsonrpc':'2.0', 'id':1, 'method':method, 'params':params or []}).encode(),
        headers={'Content-Type':'application/json'})
    # Local node traffic must not be sent to an HTTP proxy.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(request, timeout=10) as response:
        result = json.load(response)
    if 'error' in result:
        raise RuntimeError(result['error'])
    return result['result']


def status(port):
    chain = int(rpc(port, 'eth_chainId'), 16)
    network = int(rpc(port, 'net_version'))
    genesis = rpc(port, 'eth_getBlockByNumber', ['0x0', False])
    if chain != NETWORK['chainId'] or network != NETWORK['networkId'] or genesis['hash'].lower() != NETWORK['genesisHash']:
        raise RuntimeError('RPC belongs to a different chain; do not connect the relayer')
    syncing = rpc(port, 'eth_syncing')
    peers = int(rpc(port, 'net_peerCount'), 16)
    latest = rpc(port, 'eth_getBlockByNumber', ['latest', False])
    height = int(latest['number'], 16)
    age = int(time.time()) - int(latest['timestamp'], 16)
    ready = syncing is False and peers > 0 and height > 0 and -15 <= age <= 60
    print(json.dumps({'chainId':chain, 'networkId':network, 'genesisHash':genesis['hash'],
        'peers':peers, 'height':height, 'blockHash':latest['hash'], 'blockAgeSeconds':age,
        'syncing':syncing, 'readyForRelayer':ready}, indent=2))
    print('Ready for relayer checks' if ready else 'Not ready: wait for peers, sync and recent blocks')
    return 0 if ready else 2


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['install', 'init', 'start', 'status'])
    parser.add_argument('--data-dir', type=Path, default=ROOT/'data')
    parser.add_argument('--rpc-port', type=int, default=18545)
    parser.add_argument('--p2p-port', type=int, default=30304)
    args = parser.parse_args()
    if not all(1 <= p <= 65535 for p in [args.rpc_port, args.p2p_port]):
        parser.error('Ports must be 1..65535')
    if args.command == 'install':
        install()
    elif args.command == 'init':
        initialize(args.data_dir.resolve())
    elif args.command == 'start':
        return start(args.data_dir.resolve(), args.rpc_port, args.p2p_port)
    else:
        return status(args.rpc_port)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as error:
        print(f'ERROR: {error}', file=sys.stderr)
        sys.exit(1)
