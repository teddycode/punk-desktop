"""Package only public node configuration and scripts, never node data or keys."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

BASE = Path(__file__).resolve().parents[1] / 'vite/packages/table/page/core/CrossChain/node-bundles'
SOURCE = BASE/'lcl_node_bundle'
files = {name:(SOURCE/name).read_bytes() for name in
         ['node.py', 'README.md', 'genesis.json', 'network.json', 'downloads.json']}
compile(files['node.py'], 'node.py', 'exec')
network = json.loads(files['network.json'])
assert hashlib.sha256(files['genesis.json']).hexdigest() == network['genesisFileSha256']
files['manifest.json'] = (json.dumps({name:hashlib.sha256(data).hexdigest() for name,data in files.items()}, indent=2)+'\n').encode()
with ZipFile(BASE/'lcl_node_bundle.zip', 'w', ZIP_DEFLATED) as archive:
    for name, data in sorted(files.items()):
        entry = ZipInfo('lcl_node_bundle/'+name, (2026,1,1,0,0,0))
        entry.compress_type = ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, data)
print('Built LCL full node online installation bundle')
