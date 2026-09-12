"""Offline delivery smoke test. Run with the bundle's Python dependencies installed."""
import hashlib
import importlib.util
import json
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
from unittest.mock import patch
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'vite/packages/table/page/core/CrossChain/relay-bundles/lcl_relay_bundle.zip'
with tempfile.TemporaryDirectory(prefix='lcl-delivery-') as directory:
    with ZipFile(ARCHIVE) as archive:
        assert archive.testzip() is None
        assert all(n.startswith('lcl_relay_bundle/') and '..' not in n for n in archive.namelist())
        archive.extractall(directory)
    bundle = Path(directory) / 'lcl_relay_bundle'
    manifest = json.loads((bundle / 'manifest.json').read_text())
    assert {p.relative_to(bundle).as_posix() for p in bundle.rglob('*') if p.is_file()} == set(manifest['sha256']) | {'manifest.json'}
    for name, digest in manifest['sha256'].items():
        assert hashlib.sha256((bundle / name).read_bytes()).hexdigest() == digest
    launcher = bundle / 'lcl_relay_runner.py'
    help_result = subprocess.run([sys.executable, str(launcher), '--help'], capture_output=True)
    assert help_result.returncode == 0 and b'--check-config' in help_result.stdout
    empty_result = subprocess.run([sys.executable, str(launcher), '--check-config'], capture_output=True)
    assert empty_result.returncode == 1
    spec = importlib.util.spec_from_file_location('delivery_launcher', launcher)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    # Public test key 1; used only for local key-format validation, never broadcasting.
    private_key = '0x' + '0' * 63 + '1'
    from web3 import Web3
    address = Web3.to_checksum_address('0x' + '1' * 40)
    for env in ('dev', 'test'):
        for name in ('LCL', 'Manager'):
            (bundle / f'data/{env}/{name}.address').write_text(address)
        (bundle / '.env').write_text(f'LCL_RPC_URL=http://127.0.0.1:1\n{env.upper()}_RPC_URL=http://127.0.0.1:2\n{env.upper()}_PRIVATE_KEY={private_key}\n')
        with patch.object(sys, 'argv', [str(launcher), '--env', env, '--check-config']), \
             patch.object(socket.socket, 'connect', side_effect=AssertionError('Network access in config check')):
            assert module.main() == 0
    assert not (bundle / 'tmp').exists(), 'Config check created runtime state'
    values = module.load_env_file(bundle / '.env')
    (bundle / 'data/test/LCL.address').write_text('')
    try:
        module.validate(bundle, values, 'http://127.0.0.1:2', 'test')
    except ValueError:
        pass
    else:
        raise AssertionError('Empty deployment address accepted')
print('PASS: archive hashes, standalone extraction, help, missing config, dev/test offline preflight, invalid address')
