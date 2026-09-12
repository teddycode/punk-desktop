const http = require('http');
const axios = require('axios');

const methods = new Set(['eth_chainId', 'net_version', 'web3_clientVersion', 'eth_blockNumber', 'eth_getBalance', 'eth_getCode', 'eth_getTransactionCount', 'eth_call', 'eth_estimateGas', 'eth_gasPrice', 'eth_getBlockByNumber', 'eth_getBlockByHash', 'eth_getTransactionByHash', 'eth_getTransactionReceipt', 'eth_getLogs', 'eth_feeHistory', 'eth_maxPriorityFeePerGas', 'eth_sendRawTransaction']);

// A fixed local RPC URL remains valid in MetaMask across client restarts.
async function createPunkosWalletRpc({ rpc, chainId, port = 18654 }) {
  const client = axios.create({ timeout: 15000, maxRedirects: 0, maxContentLength: 4 * 1024 * 1024 });
  const call = async payload => (await client.post(rpc, payload)).data;
  const chain = await call({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] });
  if (!chain.result || Number(chain.result) !== Number(chainId)) throw new Error('PunkOS RPC 不可用或 Chain ID 与部署配置不一致');
  let origin;
  const server = http.createServer(async (req, res) => {
    const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
    if (!origin || req.headers.host !== new URL(origin).host || req.url !== '/punkos') return json(403, { error: 'Invalid local RPC endpoint' });
    const source = req.headers.origin;
    if (source) {
      let allowed = false;
      try { const url = new URL(source); allowed = ['chrome-extension:', 'moz-extension:'].includes(url.protocol) || (url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname)); } catch {}
      if (!allowed) return json(403, { error: 'Origin not allowed' });
      res.setHeader('Access-Control-Allow-Origin', source);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return json(405, { error: 'POST required' });
    try {
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (raw.length > 262144) return json(413, { error: 'Request too large' }); }
      const payload = JSON.parse(raw);
      const requests = Array.isArray(payload) ? payload : [payload];
      if (!requests.length || requests.length > 32 || requests.some(item => !item || item.jsonrpc !== '2.0' || !methods.has(item.method) || !Array.isArray(item.params))) return json(400, { error: 'Unsupported RPC request' });
      // Forward only fixed-node RPC; no account unlocking, signing or unsigned transactions.
      return json(200, await call(payload));
    } catch { return json(502, { jsonrpc: '2.0', id: null, error: { code: -32000, message: 'PunkOS 节点请求失败，请检查节点连接' } }); }
  });
  server.requestTimeout = 20000;
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  return {
    network: { chainId: '0x' + Number(chainId).toString(16), chainName: 'PunkOS', rpcUrls: [origin + '/punkos'], nativeCurrency: { name: 'PUNK', symbol: 'PUNK', decimals: 18 } },
    close() { server.close(); server.closeIdleConnections?.(); }
  };
}
module.exports = { createPunkosWalletRpc };
