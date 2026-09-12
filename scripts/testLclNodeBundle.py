"""Offline package/status regression tests; no node is started and no network used."""
import contextlib
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
from unittest.mock import patch
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
archive_path = ROOT/'vite/packages/table/page/core/CrossChain/node-bundles/lcl_node_bundle.zip'
with tempfile.TemporaryDirectory() as directory:
    with ZipFile(archive_path) as archive:
        assert archive.testzip() is None
        names = archive.namelist()
        assert len(names) == 6
        assert all(n.startswith('lcl_node_bundle/') and '..' not in n for n in names)
        archive.extractall(directory)
    bundle = Path(directory)/'lcl_node_bundle'
    for name, digest in json.loads((bundle/'manifest.json').read_text()).items():
        assert hashlib.sha256((bundle/name).read_bytes()).hexdigest() == digest
    spec = importlib.util.spec_from_file_location('lcl_node', bundle/'node.py')
    node = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(node)
    node.validate_files()
    replies = {'eth_chainId':hex(3030), 'net_version':'3030', 'net_peerCount':'0x1', 'eth_syncing':False}
    def rpc(port, method, params=None):
        if method == 'eth_getBlockByNumber':
            if params[0] == '0x0':
                return {'hash':node.NETWORK['genesisHash']}
            return {'number':'0x100', 'hash':'0x'+'ab'*32, 'timestamp':hex(995)}
        return replies[method]
    with patch.object(node, 'rpc', side_effect=rpc), patch.object(node.time, 'time', return_value=1000), contextlib.redirect_stdout(io.StringIO()):
        assert node.status(18545) == 0
        replies['net_peerCount'] = '0x0'
        assert node.status(18545) == 2
        replies['net_peerCount'] = '0x1'
        replies['eth_syncing'] = {'currentBlock':'0x10'}
        assert node.status(18545) == 2
        replies['eth_syncing'] = False
        with patch.object(node.time, 'time', return_value=2000):
            assert node.status(18545) == 2
        replies['eth_chainId'] = '0x1'
        try:
            node.status(18545)
        except RuntimeError:
            pass
        else:
            raise AssertionError('Wrong-chain RPC accepted')
    (bundle/'genesis.json').write_text('{}')
    try:
        node.validate_files()
    except RuntimeError:
        pass
    else:
        raise AssertionError('Changed genesis accepted')
print('PASS: archive manifest, isolated extraction, wrong chain, no peers, syncing, stale blocks, changed genesis')
