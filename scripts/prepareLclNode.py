"""Maintainer: pin official Geth downloads and generate public LCL network files."""
import base64
import hashlib
import json
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / 'vite/packages/table/page/core/CrossChain/node-bundles/lcl_node_bundle'
BUNDLE.mkdir(parents=True, exist_ok=True)
BASE = 'https://gethstore.blob.core.windows.net/builds/'
downloads = {}
for target in ('windows-amd64', 'linux-amd64', 'linux-arm64', 'darwin-amd64', 'darwin-arm64'):
    prefix = f'geth-{target}-1.13.15-'
    url = BASE.rstrip('/') + '?restype=container&comp=list&prefix=' + prefix
    root = ET.fromstring(urllib.request.urlopen(url, timeout=30).read())
    extension = '.zip' if target.startswith('windows') else '.tar.gz'
    matches = [b for b in root.findall('./Blobs/Blob') if b.findtext('Name').endswith(extension)]
    if len(matches) != 1:
        raise RuntimeError(f'Expected one official archive: {target}')
    blob = matches[0]
    downloads[target] = {'url': BASE + blob.findtext('Name'),
        'size': int(blob.findtext('Properties/Content-Length')),
        'md5': base64.b64decode(blob.findtext('Properties/Content-MD5')).hex()}
(BUNDLE / 'downloads.json').write_text(json.dumps(downloads, indent=2) + '\n')
genesis = {'config': {'chainId':3030, 'homesteadBlock':0, 'eip150Block':0,
    'eip150Hash':'0x'+'00'*32, 'eip155Block':0, 'eip158Block':0,
    'byzantiumBlock':0, 'constantinopleBlock':0, 'petersburgBlock':0,
    'istanbulBlock':0, 'clique':{'period':3, 'epoch':30000}},
    'nonce':'0x0', 'timestamp':'0x624ed1f0',
    'extraData':'0x'+'00'*32+'040ab1cce91aa43981cb430ce9ed5a48866c7dee'+'00'*65,
    'gasLimit':'0x47b760', 'difficulty':'0x1', 'mixHash':'0x'+'00'*32,
    'coinbase':'0x'+'00'*20, 'alloc':{
    '0000000000000000000000000000000000000000':{'balance':'0x1'},
    '040AB1Cce91AA43981CB430CE9eD5A48866c7deE':{'balance':'0x200000000000000000000000000000000000000000000000000000000000000'},
    '0431203914b6d1b50D7620C64b749E5310c5C85a':{'balance':'0x200000000000000000000000000000000000000000000000000000000000000'}},
    'number':'0x0', 'gasUsed':'0x0', 'parentHash':'0x'+'00'*32, 'baseFeePerGas':None}
raw = (json.dumps(genesis, indent=2)+'\n').encode()
(BUNDLE/'genesis.json').write_bytes(raw)
(BUNDLE/'network.json').write_text(json.dumps({'networkId':3030, 'chainId':3030,
    'genesisHash':'0xd141a7700d2a681d81b5b3e14326a64ce08e974c201fdcff778e2c4947dcae00',
    'genesisFileSha256':hashlib.sha256(raw).hexdigest(),
    'enode':'enode://35e4af9ab344079cdddbd32ac62915058326fa02cc468e0c06993c404a9fd7248bc1093c42ef31334c244c20ddffcf46afe9dee0048597742f4244134d408a5f@10.136.101.174:30303?discport=0'}, indent=2)+'\n')
print('Prepared pinned downloads and LCL configuration')
