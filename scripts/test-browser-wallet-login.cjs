const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserLogin } = require('../src/main/browserWalletLogin');
const { ethers } = require('../vite/node_modules/ethers');
const fs = require('node:fs');
const vm = require('node:vm');

function browserPage({ opened, provider, request = fetch, navigate = () => {} }) {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: '0', disabled: false, textContent: '', handlers: {}, appendChild() {}, addEventListener(name, fn) { this.handlers[name] = fn; } });
    return elements.get(id);
  };
  const context = {
    window: { location: { hash: opened.hash, assign: navigate }, ethereum: provider, addEventListener() {}, dispatchEvent() {} },
    document: { getElementById: element, createElement: () => ({}) },
    TextEncoder, Event,
    setTimeout: fn => fn(),
    fetch: (route, options) => request(opened.origin + route, { ...options, headers: { ...options.headers, Origin: opened.origin } })
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../pages/browserWalletLogin/login.js'), 'utf8'), context);
  return { element, connect: () => element('connect').handlers.click() };
}

async function setup(t, overrides = {}) {
  let opened;
  const wallet = ethers.Wallet.createRandom();
  const session = await createBrowserLogin({
    openExternal: async url => { opened = new URL(url); },
    requestNonce: async () => 'one-use-nonce',
    authenticate: async payload => {
      assert.equal(ethers.utils.verifyMessage(payload.message, payload.signature), wallet.address);
      return { userInfo: { id: 42, address: wallet.address }, token: 'backend-token' };
    },
    ...overrides
  });
  t.after(() => session.cancel());
  const post = (route, body, extra = {}) => fetch(opened.origin + route, {
    method: 'POST',
    headers: { Origin: opened.origin, 'Content-Type': 'application/json', 'X-Login-Session': opened.hash.slice(1), ...extra },
    body: JSON.stringify(body)
  });
  return { wallet, session, opened, post };
}

test('browser signature is backend verified; token goes only to desktop', async t => {
  const { wallet, session, opened, post } = await setup(t);
  const page = await fetch(opened.origin);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /MetaMask/);
  const nonce = await (await post('/nonce', { address: wallet.address })).json();
  assert.equal(nonce.message, 'login#punkos#one-use-nonce');
  const signature = await wallet.signMessage(nonce.message);
  const response = await post('/complete', { address: wallet.address, signature });
  assert.deepEqual(await response.json(), { ok: true });
  const result = await session.result;
  assert.equal(result.data.token, 'backend-token');
  assert.equal(result.address, wallet.address);
});

test('rejects other origins, absent session token and wrong wallet', async t => {
  const { wallet, post } = await setup(t);
  assert.equal((await post('/nonce', { address: wallet.address }, { Origin: 'https://other.example' })).status, 403);
  assert.equal((await post('/nonce', { address: wallet.address }, { 'X-Login-Session': '' })).status, 403);
  assert.equal((await post('/nonce', { address: '../bad' })).status, 400);
  const challenge = await (await post('/nonce', { address: wallet.address })).json();
  assert.equal((await post('/complete', { address: ethers.Wallet.createRandom().address, signature: await wallet.signMessage(challenge.message) })).status, 400);
});

test('backend rejection cannot create a logged-in session; fresh nonce permits retry', async t => {
  let calls = 0;
  const { wallet, post, session } = await setup(t, { authenticate: async () => {
    if (++calls === 1) throw new Error('签名无效');
    return { userInfo: { id: 42 } };
  } });
  let challenge = await (await post('/nonce', { address: wallet.address })).json();
  let signed = { address: wallet.address, signature: await wallet.signMessage(challenge.message) };
  assert.equal((await post('/complete', signed)).status, 400);
  assert.equal((await post('/complete', signed)).status, 400);
  challenge = await (await post('/nonce', { address: wallet.address })).json();
  signed = { address: wallet.address, signature: await wallet.signMessage(challenge.message) };
  assert.equal((await post('/complete', signed)).status, 200);
  assert.equal((await session.result).ok, true);
});

test('cancel and expiry close login without authenticating', async t => {
  const { session, post } = await setup(t);
  assert.equal((await post('/cancel', {})).status, 200);
  assert.equal((await session.result).ok, false);
  const expiring = await setup(t, { timeoutMs: 20 });
  assert.match((await expiring.session.result).error, /超时/);
});

test('failed browser launch terminates the session', async t => {
  const { session } = await setup(t, { openExternal: async () => { throw new Error('failure'); } });
  assert.match((await session.result).error, /默认浏览器/);
});

test('cancellation during backend authentication discards late success', async t => {
  let release;
  const { wallet, session, post } = await setup(t, { authenticate: () => new Promise(resolve => { release = resolve; }) });
  const challenge = await (await post('/nonce', { address: wallet.address })).json();
  const pending = post('/complete', { address: wallet.address, signature: await wallet.signMessage(challenge.message) });
  while (!release) await new Promise(resolve => setTimeout(resolve, 5));
  session.cancel();
  release({ userInfo: { id: 42 } });
  assert.equal((await pending).status, 410);
  assert.equal((await session.result).ok, false);
});

test('browser page completes the actual personal_sign and loopback flow', async t => {
  const { wallet, session, opened } = await setup(t);
  const methods = [];
  const ui = browserPage({ opened, provider: { isMetaMask: true, request: async ({ method, params }) => {
    methods.push(method);
    if (method === 'personal_sign') {
      assert.equal(params[1], wallet.address);
      return wallet.signMessage(ethers.utils.arrayify(params[0]));
    }
    return [wallet.address];
  } } });
  await ui.connect();
  assert.equal((await session.result).ok, true);
  assert.match(ui.element('status').textContent, /登录成功/);
  assert.deepEqual(methods, ['eth_requestAccounts', 'personal_sign', 'eth_accounts']);
  assert.equal(ui.element('connect').disabled, true);
});

test('browser missing extension and rejected authorization are recoverable', async t => {
  const { opened } = await setup(t);
  const missing = browserPage({ opened });
  await missing.connect();
  assert.match(missing.element('status').textContent, /未检测到 MetaMask/);
  const rejected = browserPage({ opened, provider: { isMetaMask: true, request: async () => { throw { code: 4001 }; } } });
  await rejected.connect();
  assert.match(rejected.element('status').textContent, /取消钱包授权/);
  assert.equal(rejected.element('connect').disabled, false);
});

test('browser rejects account changes during signing before backend verification', async t => {
  let verified = false;
  const { wallet, opened } = await setup(t, { authenticate: async () => { verified = true; return { userInfo: { id: 42 } }; } });
  const ui = browserPage({ opened, provider: { isMetaMask: true, request: async ({ method, params }) => {
    if (method === 'personal_sign') return wallet.signMessage(ethers.utils.arrayify(params[0]));
    return [method === 'eth_accounts' ? ethers.Wallet.createRandom().address : wallet.address];
  } } });
  await ui.connect();
  assert.match(ui.element('status').textContent, /账户已切换/);
  assert.equal(verified, false);
});

test('login hands the same origin to the wallet page and reconnects without another authorization', async t => {
  const { createWalletBridge } = require('../src/main/browserWalletBridge');
  let bridge;
  const { wallet, session, opened, post } = await setup(t, {
    onAuthenticated: async options => {
      bridge = await createWalletBridge(options);
      t.after(() => bridge.close());
      return bridge.url;
    }
  });
  let destination;
  let authorizations = 0;
  const provider = { isMetaMask: true, request: async ({ method, params }) => {
    if (method === 'eth_requestAccounts') authorizations++;
    if (method === 'personal_sign') return wallet.signMessage(ethers.utils.arrayify(params[0]));
    if (method === 'eth_chainId') return '0x1';
    return [wallet.address];
  } };
  const login = browserPage({ opened, provider, navigate: url => { destination = new URL(url); } });
  await login.connect();
  assert.equal((await session.result).browserWallet, true);
  assert.equal(destination.origin, opened.origin);
  assert.notEqual(destination.pathname, opened.pathname, 'handoff must load a document, not just change the hash');
  assert.notEqual(destination.hash, opened.hash, 'wallet uses a fresh session credential');
  assert.match(await (await fetch(destination)).text(), /wallet.js/);
  assert.equal((await post('/nonce', { address: wallet.address })).status, 403, 'login credential is retired');

  const elements = new Map();
  const el = id => {
    if (!elements.has(id)) elements.set(id, { value: '0', disabled: false, textContent: '', appendChild() {} });
    return elements.get(id);
  };
  let initialize;
  vm.runInNewContext(await (await fetch(destination.origin + '/wallet.js')).text(), {
    location: { hash: destination.hash }, crypto: require('node:crypto').webcrypto, Uint8Array, Event,
    window: { ethereum: provider, addEventListener() {}, dispatchEvent() {} },
    document: { getElementById: el, createElement: () => ({}) },
    setTimeout: fn => { initialize = fn; }, setInterval() {}, clearTimeout,
    fetch: (route, options) => fetch(destination.origin + route, { ...options, headers: { ...options.headers, Origin: destination.origin } })
  });
  initialize();
  for (let attempts = 0; attempts < 100 && !bridge.snapshot().connected; attempts++) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.equal(bridge.snapshot().connected, true);
  assert.equal(bridge.snapshot().accounts[0], wallet.address);
  assert.equal(authorizations, 1, 'only the original login requests account authorization');
});

const targetNetwork = {
  chainId: '0x1352826', chainName: 'PunkOS', rpcUrls: ['http://47.243.174.71:36054'],
  nativeCurrency: { name: 'PUNK', symbol: 'PUNK', decimals: 18 }
};
for (const scenario of ['already on PunkOS', 'switch existing network', 'add missing network', 'HTTPS rejected', 'switch rejected', 'network changed during signature']) {
  test('login network: ' + scenario, async t => {
    let authenticated = false;
    const { wallet, opened } = await setup(t, { targetNetwork, authenticate: async () => {
      authenticated = true;
      return { userInfo: { id: 42 } };
    } });
    let chain = scenario === 'already on PunkOS' ? targetNetwork.chainId : '0x1';
    let added = false;
    const methods = [];
    const ui = browserPage({ opened, provider: { isMetaMask: true, request: async ({ method, params }) => {
      methods.push(method);
      if (method === 'eth_chainId') return chain;
      if (method === 'wallet_switchEthereumChain') {
        if (scenario === 'switch rejected') throw { code: 4001 };
        if (['add missing network', 'HTTPS rejected'].includes(scenario) && !added) throw { code: 4902 };
        chain = params[0].chainId;
        return null;
      }
      if (method === 'wallet_addEthereumChain') {
        if (scenario === 'HTTPS rejected') throw new Error("Expected valid HTTPS url 'rpcUrls'");
        added = true;
        return null;
      }
      if (method === 'personal_sign') {
        assert.equal(chain, targetNetwork.chainId);
        if (scenario === 'network changed during signature') chain = '0x1';
        return wallet.signMessage(ethers.utils.arrayify(params[0]));
      }
      return [wallet.address];
    } } });
    await ui.connect();
    const failed = ['HTTPS rejected', 'switch rejected', 'network changed during signature'].includes(scenario);
    assert.equal(authenticated, !failed);
    if (scenario === 'already on PunkOS') assert.equal(methods.includes('wallet_switchEthereumChain'), false);
    if (scenario === 'HTTPS rejected') {
      assert.match(ui.element('status').textContent, /HTTPS RPC/);
      assert.equal(methods.includes('personal_sign'), false);
    }
    if (failed) assert.equal(ui.element('connect').disabled, false);
  });
}
