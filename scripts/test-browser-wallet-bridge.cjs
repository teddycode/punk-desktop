const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createWalletBridge } = require('../src/main/browserWalletBridge');
const { ethers } = require('../vite/node_modules/ethers');
const vm = require('node:vm');
const fs = require('node:fs');
const crypto = require('node:crypto');
const address = '0x040AB1Cce91AA43981CB430CE9eD5A48866c7deE';
const otherAddress = '0x0000000000000000000000000000000000000001';
const chainId = ethers.utils.hexValue(20260902);
const hash = '0x' + 'ab'.repeat(32);
async function setup(t, options = {}) {
  const bridge = await createWalletBridge(options);
  t.after(() => bridge.close());
  const url = new URL(bridge.url);
  const post = (route, body = {}, headers = {}) => fetch(url.origin + route, {
    method: 'POST', headers: { Origin: url.origin, 'Content-Type': 'application/json', 'X-Wallet-Session': url.hash.slice(1), ...headers },
    body: JSON.stringify({ clientId: 'c'.repeat(32), ...body })
  });
  const poll = async (extra = {}) => (await post('/poll', { accounts: [address], chainId, ...extra })).json();
  await poll();
  return { bridge, url, post, poll };
}

test('transaction is queued once, returns only the matching browser result', async t => {
  const { bridge, poll, post } = await setup(t);
  const pending = bridge.request({ method: 'eth_sendTransaction', params: [{ from: address, to: otherAddress, value: '0x0' }] });
  const { request } = await poll();
  assert.equal(request.expectedAccount, address);
  assert.equal(request.expectedChainId, chainId);
  assert.equal((await poll()).request, null);
  assert.equal((await post('/result', { id: 'wrong', result: hash })).status, 410);
  await post('/result', { id: request.id, result: hash });
  assert.equal(await pending, hash);
  assert.equal((await post('/result', { id: request.id, result: hash })).status, 410);
});

test('rejects other origins, sessions and consumers', async t => {
  const { post } = await setup(t);
  assert.equal((await post('/poll', {}, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await post('/poll', {}, { 'X-Wallet-Session': '' })).status, 403);
  assert.equal((await post('/poll', { clientId: 'd'.repeat(32) })).status, 409);
});

test('forbids unsupported signing, wrong account and wrong network', async t => {
  const { bridge } = await setup(t);
  await assert.rejects(bridge.request({ method: 'eth_sign', params: [] }), { code: 4200 });
  await assert.rejects(bridge.request({ method: 'eth_sendTransaction', params: [{ from: otherAddress }] }), { code: 4100 });
  await assert.rejects(bridge.request({ method: 'eth_sendTransaction', params: [{ from: address, chainId: '0x1' }] }), { code: 4901 });
});

test('MetaMask rejection preserves EIP-1193 error code', async t => {
  const { bridge, post, poll } = await setup(t);
  const pending = bridge.request({ method: 'eth_sendTransaction', params: [{ from: address }] });
  const rejected = assert.rejects(pending, { code: 4001 });
  const { request } = await poll();
  await post('/result', { id: request.id, error: { code: 4001, message: 'User rejected' } });
  await rejected;
});

test('busy browser polls preserve queue; timeout cannot replay or accept late success', async t => {
  const { bridge, post, poll } = await setup(t, { requestTimeoutMs: 80 });
  const pending = bridge.request({ method: 'eth_sendTransaction', params: [{ from: address }] });
  const rejected = assert.rejects(pending, /超时/);
  assert.equal((await poll({ busy: true })).request, null);
  const { request } = await poll();
  await rejected;
  assert.equal((await poll()).request, null);
  assert.equal((await post('/result', { id: request.id, result: hash })).status, 410);
});

test('account and network state follows browser; locking rejects pending work', async t => {
  const { bridge, poll } = await setup(t);
  await poll({ accounts: [otherAddress], chainId: '0x1' });
  assert.equal(bridge.snapshot().accounts[0], otherAddress);
  assert.equal(bridge.snapshot().chainId, '0x1');
  const pending = bridge.request({ method: 'eth_getBalance', params: [otherAddress, 'latest'] });
  const rejected = assert.rejects(pending, /锁定或断开/);
  await poll({ accounts: [] });
  await rejected;
  assert.equal(bridge.snapshot().connected, false);
});

test('missing heartbeat disconnects and rejects requests', async t => {
  const { bridge } = await setup(t, { heartbeatMs: 20 });
  await new Promise(resolve => setTimeout(resolve, 60));
  assert.equal(bridge.snapshot().connected, false);
  await assert.rejects(bridge.request({ method: 'eth_accounts' }), { code: 4900 });
});

test('ethers v5 signer can submit through the bridge provider', async t => {
  const { bridge, poll, post } = await setup(t);
  const provider = new ethers.providers.Web3Provider({ request: args => bridge.request(args) }, 'any');
  let done = false;
  const pump = async () => {
    while (!done) {
      const { request } = await poll();
      if (request) {
        let result;
        if (request.method === 'eth_chainId') result = chainId;
        else if (request.method === 'eth_accounts') result = [address];
        else if (request.method === 'eth_estimateGas') result = '0x5208';
        else if (request.method === 'eth_sendTransaction') {
          assert.equal(request.params[0].from.toLowerCase(), address.toLowerCase());
          assert.equal(BigInt(request.params[0].value), 10000000000000000n);
          assert.equal(request.params[0].data, new ethers.utils.Interface(['function becomeRelayer() payable']).encodeFunctionData('becomeRelayer'));
          result = hash;
        }
        else throw new Error('Unexpected method ' + request.method);
        await post('/result', { id: request.id, result });
      }
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  };
  const pumping = pump();
  try {
    const contract = new ethers.Contract(otherAddress, ['function becomeRelayer() payable'], provider.getSigner(address));
    const transaction = await contract.populateTransaction.becomeRelayer({ value: ethers.utils.parseEther('0.01') });
    const txHash = await provider.getSigner(address).sendUncheckedTransaction(transaction);
    assert.equal(txHash, hash);
  } finally { done = true; await pumping; provider.removeAllListeners(); }
});

async function browserUI(t, provider, autoConnect = true, options = {}) {
  const bridge = await createWalletBridge(options);
  t.after(() => bridge.close());
  const url = new URL(bridge.url);
  const elements = new Map();
  const el = id => {
    if (!elements.has(id)) elements.set(id, { value: '0', hidden: id === 'request', disabled: false, textContent: '', appendChild() {} });
    return elements.get(id);
  };
  let poll;
  const context = {
    location: { hash: url.hash }, crypto: crypto.webcrypto, Uint8Array, Event,
    window: { ethereum: provider, addEventListener() {}, dispatchEvent() {} },
    document: { getElementById: el, createElement: () => ({}) },
    setInterval: callback => { poll = callback; },
    setTimeout: (callback, ms) => ms === 500 ? 0 : setTimeout(callback, ms), clearTimeout,
    fetch: (route, opts) => fetch(url.origin + route, { ...opts, headers: { ...opts.headers, Origin: url.origin } })
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../pages/browserWalletBridge/wallet.js'), 'utf8'), context);
  if (autoConnect) await el('connect').onclick();
  return { bridge, el, poll: () => poll() };
}

test('browser requires explicit approval before calling MetaMask eth_sendTransaction', async t => {
  let sent = 0;
  const { bridge, el, poll } = await browserUI(t, { isMetaMask: true, request: async ({ method, params }) => {
    if (method === 'eth_chainId') return chainId;
    if (method === 'eth_sendTransaction') { sent++; assert.equal(params[0].chainId, chainId); assert.equal(BigInt(params[0].value), 10000000000000000n); return hash; }
    return [address];
  } });
  const pending = bridge.request({ method: 'eth_sendTransaction', params: [{ from: address, to: otherAddress, value: ethers.utils.parseEther('0.01').toHexString() }] });
  await poll();
  assert.equal(sent, 0);
  assert.equal(el('request').hidden, false);
  assert.match(el('details').textContent, /eth_sendTransaction/);
  assert.match(el('payment').textContent, /0.01 PUNK/);
  el('approve').onclick();
  assert.equal(await pending, hash);
  assert.equal(sent, 1);
});

test('browser rejects a changed account between review and approval', async t => {
  let current = address;
  let sent = 0;
  const { bridge, el, poll } = await browserUI(t, { isMetaMask: true, request: async ({ method }) => {
    if (method === 'eth_chainId') return chainId;
    if (method === 'eth_sendTransaction') { sent++; return hash; }
    return [current];
  } });
  const pending = bridge.request({ method: 'eth_sendTransaction', params: [{ from: address }] });
  const rejected = assert.rejects(pending, { code: 4100 });
  await poll();
  current = otherAddress;
  el('approve').onclick();
  await rejected;
  assert.equal(sent, 0);
});

test('browser reject button prevents wallet transaction', async t => {
  let sent = 0;
  const { bridge, el, poll } = await browserUI(t, { isMetaMask: true, request: async ({ method }) => {
    if (method === 'eth_chainId') return chainId;
    if (method === 'eth_sendTransaction') { sent++; return hash; }
    return [address];
  } });
  const pending = bridge.request({ method: 'eth_sendTransaction', params: [{ from: address }] });
  const rejected = assert.rejects(pending, { code: 4001 });
  await poll();
  el('reject').onclick();
  await rejected;
  assert.equal(sent, 0);
});

test('repeated connect clicks issue only one pending MetaMask authorization', async t => {
  let release;
  let prompts = 0;
  let authorized = false;
  const { el, bridge } = await browserUI(t, { isMetaMask: true, request: async ({ method }) => {
    if (method === 'eth_requestAccounts') {
      prompts++;
      return new Promise(resolve => { release = value => { authorized = true; resolve(value); }; });
    }
    return method === 'eth_chainId' ? chainId : authorized ? [address] : [];
  } }, false);
  const pending = el('connect').onclick();
  for (let attempt = 0; attempt < 100 && !release; attempt++) await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(el('connect').disabled, true);
  await el('connect').onclick();
  assert.equal(prompts, 1);
  release([address]);
  await pending;
  assert.equal(bridge.snapshot().connected, true);
});

test('existing MetaMask permission request shows guidance and syncs after approval', async t => {
  let accounts = [];
  const { el, bridge, poll } = await browserUI(t, { isMetaMask: true, request: async ({ method }) => {
    if (method === 'eth_requestAccounts') throw { code: -32002, message: 'already pending' };
    return method === 'eth_chainId' ? chainId : accounts;
  } });
  assert.match(el('status').textContent, /已有账户授权请求/);
  await poll();
  assert.equal(bridge.snapshot().connected, false);
  accounts = [address];
  await poll();
  assert.equal(bridge.snapshot().connected, true);
  assert.match(el('status').textContent, /账户已授权/);
  assert.equal(el('connect').disabled, true);
});

test('an already authorized wallet connects without asking MetaMask for permissions again', async t => {
  let prompts = 0;
  const { bridge } = await browserUI(t, { isMetaMask: true, request: async ({ method }) => {
    if (method === 'eth_requestAccounts') { prompts++; throw { code: -32002 }; }
    return method === 'eth_chainId' ? chainId : [address];
  } });
  assert.equal(bridge.snapshot().connected, true);
  assert.equal(prompts, 0);
});

test('recovery replaces a stuck session with a different origin and keeps desktop ownership', async t => {
  const { registerBrowserWalletBridge } = require('../src/main/browserWalletBridge');
  const { EventEmitter } = require('node:events');
  const app = new EventEmitter();
  const handlers = new Map();
  const owner = new EventEmitter();
  Object.assign(owner, { id: 1, isDestroyed: () => false, getURL: () => 'http://localhost:1600/html/table.html' });
  const api = registerBrowserWalletBridge({ app, ipcMain: { handle: (name, fn) => handlers.set(name, fn) }, shell: {} });
  t.after(() => app.emit('before-quit'));
  const original = new URL(await api.prepare(owner));
  const post = (url, route, body = {}) => fetch(url.origin + route, {
    method: 'POST', headers: { Origin: url.origin, 'Content-Type': 'application/json', 'X-Wallet-Session': url.hash.slice(1) },
    body: JSON.stringify({ clientId: 'c'.repeat(32), ...body })
  });
  const replacement = new URL((await (await post(original, '/reconnect')).json()).url);
  assert.notEqual(replacement.origin, original.origin);
  assert.notEqual(replacement.hash, original.hash);
  await assert.rejects(fetch(original.origin));
  await post(replacement, '/poll', { accounts: [address], chainId });
  assert.equal(handlers.get('browser-wallet:state')({ sender: owner }).connected, true);
  const pending = handlers.get('browser-wallet:request')({ sender: owner }, { method: 'eth_accounts' });
  assert.equal((await post(replacement, '/reconnect')).status, 409, 'do not replace a session with unfinished client requests');
  api.disconnect(owner);
  assert.equal((await pending).error.code, 4900);
});

test('browser connection adds PunkOS using local RPC and publishes only the correct network', async t => {
  const targetNetwork = { chainId, chainName: 'PunkOS', rpcUrls: ['http://127.0.0.1:18654/punkos'], nativeCurrency: { name: 'PUNK', symbol: 'PUNK', decimals: 18 } };
  let current = '0x1';
  let added = false;
  const { bridge, poll } = await browserUI(t, { isMetaMask: true, request: async ({ method, params }) => {
    if (method === 'eth_chainId') return current;
    if (method === 'wallet_switchEthereumChain') { if (!added) throw { code: 4902 }; current = params[0].chainId; return null; }
    if (method === 'wallet_addEthereumChain') { assert.equal(params[0].rpcUrls[0], targetNetwork.rpcUrls[0]); added = true; return null; }
    return [address];
  } }, true, { targetNetwork });
  assert.equal(added, true);
  assert.equal(bridge.snapshot().connected, true);
  assert.equal(bridge.snapshot().chainId, chainId);
  current = '0x1';
  await poll();
  assert.equal(bridge.snapshot().connected, false);
});
