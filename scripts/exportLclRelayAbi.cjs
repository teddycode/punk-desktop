// Maintainer command: node scripts/exportLclRelayAbi.cjs ../sepCross3
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '../sepCross3');
const solc = require(path.join(root, '.tools/node_modules/solc'));
const file = 'src/LCL/RelayContract.sol';
const input = { language: 'Solidity', sources: {
  [file]: { content: fs.readFileSync(path.join(root, file), 'utf8') }
}, settings: { outputSelection: { '*': { '*': ['abi'] } } } };
const result = JSON.parse(solc.compile(JSON.stringify(input), { import: p => {
  const mapped = p.replace(/^bridge-std\//, 'src/HUB/abstracts/')
    .replace(/^forge-std\//, 'lib/forge-std/src/');
  try { return { contents: fs.readFileSync(path.join(root, mapped), 'utf8').replace(/^\uFEFF/, '') }; }
  catch (error) { return { error: error.message }; }
} }));
const errors = (result.errors || []).filter(e => e.severity === 'error');
if (errors.length) throw new Error(errors.map(e => e.formattedMessage).join('\n'));
const output = path.join(__dirname, '../vite/packages/table/page/core/CrossChain/relay-bundles/lcl_relay_bundle/out/RelayContract.sol/LCL_Relay.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ abi: result.contracts[file].LCL_Relay.abi }, null, 2) + '\n');
console.log(`Exported production LCL ABI with ${solc.version()}`);
