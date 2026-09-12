const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createPunkosWalletRpc } = require('../src/main/punkosWalletRpc');

test('local RPC validates PunkOS, forwards reads and blocks signing and foreign origins', async t => {
  const calls = [];
  const upstream = http.createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw); calls.push(body.method);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: body.method === 'eth_chainId' ? '0x1352826' : '0x10' }));
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  t.after(() => { upstream.close(); upstream.closeIdleConnections?.(); });
  const rpc = `http://127.0.0.1:${upstream.address().port}`;
  await assert.rejects(createPunkosWalletRpc({ rpc, chainId: 1, port: 0 }), /Chain ID/);
  const proxy = await createPunkosWalletRpc({ rpc, chainId: 20260902, port: 0 });
  t.after(() => proxy.close());
  const post = (method, origin) => fetch(proxy.network.rpcUrls[0], { method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify({ jsonrpc: '2.0', id: 42, method, params: [] }) });
  assert.equal(new URL(proxy.network.rpcUrls[0]).hostname, '127.0.0.1');
  assert.equal((await (await post('eth_chainId')).json()).result, proxy.network.chainId);
  assert.equal((await (await post('eth_getBalance', 'chrome-extension://wallet')).json()).result, '0x10');
  assert.equal((await post('eth_sendTransaction')).status, 400);
  assert.equal((await post('personal_sign')).status, 400);
  assert.equal((await post('eth_getBalance', 'https://untrusted.example')).status, 403);
  assert.equal(calls.includes('eth_sendTransaction'), false);
});
