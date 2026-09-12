"""Build the desktop LCL download from an explicit, secret-free file list."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
BUNDLES = ROOT / 'vite/packages/table/page/core/CrossChain/relay-bundles'
BUNDLE = BUNDLES / 'lcl_relay_bundle'
FILES = [
    'README.md', '.env.example', 'requirements.txt', 'lcl_relay_runner.py',
    'script/LCL/relay_batch.py', 'script/LCL/get_LCL_Header.py',
    'script/LCL/clique_header.py', 'out/RelayContract.sol/LCL_Relay.json',
    'data/dev/LCL.address', 'data/dev/Manager.address',
    'data/test/LCL.address', 'data/test/Manager.address',
]


def main():
    payload = {name: (BUNDLE / name).read_bytes() for name in FILES}
    abi = json.loads(payload['out/RelayContract.sol/LCL_Relay.json'])['abi']
    required = {'HEADER_VERSION', 'initialized', 'sourceGenesisHash',
                'getTopKeyFromShadowLedger_slot', 'getTopKeyFromShadowLedger',
                'getContractState', 'getRequireStake', 'getMyStake', 'getPenalty',
                'getCommitInfo', 'updateShadowLedgerByRelayer'}
    assert required <= {item.get('name') for item in abi}, 'Incomplete LCL ABI'
    # Configuration and private keys are filled locally after extraction.
    assert not any(line.strip().split('=', 1)[-1] for line in
                   payload['.env.example'].decode().splitlines()
                   if line.startswith(('DEV_PRIVATE_KEY=', 'TEST_PRIVATE_KEY=')))
    for name in FILES:
        if name.endswith('.address'):
            assert not payload[name].strip(), 'Release address templates must be empty'
    for name, content in payload.items():
        if name.endswith('.py'):
            compile(content, name, 'exec')
    manifest = {'format': 1, 'relay': 'LCL v2', 'sha256': {
        name: hashlib.sha256(data).hexdigest() for name, data in payload.items()}}
    payload['manifest.json'] = (json.dumps(manifest, indent=2) + '\n').encode()
    output = BUNDLES / 'lcl_relay_bundle.zip'
    with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
        for name, content in sorted(payload.items()):
            info = ZipInfo('lcl_relay_bundle/' + name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, content)
    # Retain the old source path without leaving a stale Forge launcher behind.
    (BUNDLES.parent / 'relay-scripts/lcl_relay_runner.py').write_bytes(payload['lcl_relay_runner.py'])
    print(f'Built {output} ({len(payload)} files)')


if __name__ == '__main__':
    main()
