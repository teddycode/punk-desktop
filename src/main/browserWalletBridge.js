const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const READ_METHODS = new Set(['eth_chainId', 'eth_accounts', 'net_version', 'eth_blockNumber', 'eth_getBalance', 'eth_getCode', 'eth_getTransactionCount', 'eth_call', 'eth_estimateGas', 'eth_gasPrice', 'eth_getBlockByNumber', 'eth_getBlockByHash', 'eth_getTransactionByHash', 'eth_getTransactionReceipt', 'eth_getLogs', 'eth_feeHistory', 'eth_maxPriorityFeePerGas']);
const PROMPT_METHODS = new Set(['eth_requestAccounts', 'eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4', 'wallet_switchEthereumChain', 'wallet_addEthereumChain']);
const signing = method => ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4'].includes(method);

async function createWalletBridge({ onState = () => {}, requestTimeoutMs = 120000, heartbeatMs = 75000, loginServer, onReconnect, targetNetwork } = {}) {
  const secret = crypto.randomBytes(32).toString('hex');
  const pending = new Map();
  let origin;
  let closed = false;
  let lastSeen = 0;
  let clientId = '';
  let reconnecting = false;
  let state = { connected: false, accounts: [], chainId: '', pending: 0 };
  const snapshot = () => ({ ...state, pending: pending.size });
  const notify = () => onState(snapshot());
  const error = (message, code = 4900) => Object.assign(new Error(message), { code });
  const failPending = message => {
    for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(error(message)); }
    pending.clear();
  };
  const disconnect = message => {
    state = { connected: false, accounts: [], chainId: '', pending: 0 };
    failPending(message);
    notify();
  };
  const close = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    disconnect('浏览器钱包已断开；已弹出的交易请在 MetaMask 中取消，勿重复提交');
    server.close();
    server.closeIdleConnections?.();
  };
  const request = ({ method, params = [] }) => {
    if (!READ_METHODS.has(method) && !PROMPT_METHODS.has(method)) return Promise.reject(error('不支持的钱包方法：' + method, 4200));
    if (closed || !state.connected || Date.now() - lastSeen > heartbeatMs) return Promise.reject(error('浏览器钱包未连接，请打开钱包连接页'));
    if (!Array.isArray(params) || JSON.stringify(params).length > 120000) return Promise.reject(error('钱包请求参数无效', -32602));
    if (pending.size >= 32) return Promise.reject(error('钱包请求过多，请稍后重试', -32002));
    if (signing(method)) {
      const from = method === 'eth_sendTransaction' ? params[0]?.from : method === 'personal_sign' ? params[1] : params[0];
      if (typeof from !== 'string' || from.toLowerCase() !== state.accounts[0]?.toLowerCase()) return Promise.reject(error('交易账户与当前浏览器钱包不一致', 4100));
      if (method === 'eth_sendTransaction' && params[0]?.chainId && Number(params[0].chainId) !== Number(state.chainId)) return Promise.reject(error('交易网络与浏览器钱包不一致', 4901));
    }
    return new Promise((resolve, reject) => {
      const id = crypto.randomBytes(16).toString('hex');
      const entry = { id, method, params, expectedAccount: state.accounts[0], expectedChainId: state.chainId, deadline: Date.now() + requestTimeoutMs, delivered: false, resolve, reject };
      entry.timer = setTimeout(() => {
        pending.delete(id);
        reject(error('钱包请求超时；如已在 MetaMask 确认交易，请先检查链上记录，勿重复提交', -32000));
        notify();
      }, requestTimeoutMs);
      pending.set(id, entry);
      notify();
    });
  };
  const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
  const handleRequest = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    if (!origin || req.headers.host !== new URL(origin).host) return json(res, 403, { error: '无效访问地址' });
    if (req.method === 'GET' && ['/', '/wallet', '/wallet.js', '/wallet.css'].includes(req.url)) {
      const file = ['/', '/wallet'].includes(req.url) ? 'index.html' : req.url.slice(1);
      res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8');
      res.end(fs.readFileSync(path.join(__dirname, '../../pages/browserWalletBridge', file)));
      return;
    }
    if (closed || req.method !== 'POST' || req.headers.origin !== origin || req.headers['x-wallet-session'] !== secret || !String(req.headers['content-type']).startsWith('application/json')) return json(res, 403, { error: '钱包会话无效，请从客户端重新连接' });
    try {
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (raw.length > 131072) throw error('请求过长'); }
      const body = JSON.parse(raw || '{}');
      if (!/^[a-f0-9]{32}$/.test(body.clientId)) throw error('无效浏览器标识');
      if (clientId && body.clientId !== clientId) return json(res, 409, { error: '请使用已连接的钱包页面，不要重复打开' });
      clientId = body.clientId;
      lastSeen = Date.now();
      if (req.url === '/network') return json(res, 200, { network: targetNetwork || null });
      if (req.url === '/poll') {
        const accounts = Array.isArray(body.accounts) ? body.accounts.filter(a => typeof a === 'string' && /^0x[0-9a-fA-F]{40}$/.test(a)).slice(0, 1) : [];
        const chainId = /^0x[0-9a-fA-F]+$/.test(body.chainId || '') ? body.chainId : '';
        state = { connected: Boolean(accounts.length && chainId && (!targetNetwork || Number(chainId) === Number(targetNetwork.chainId))), accounts, chainId, pending: pending.size };
        if (!state.connected) failPending('MetaMask 已锁定或断开，请重新连接');
        const next = body.busy ? null : [...pending.values()].find(entry => !entry.delivered);
        // Delivery is at most once: a lost response must never replay a transaction.
        if (next) next.delivered = true;
        notify();
        return json(res, 200, { request: next ? { id: next.id, method: next.method, params: next.params, expectedAccount: next.expectedAccount, expectedChainId: next.expectedChainId, deadline: next.deadline } : null });
      }
      if (req.url === '/result') {
        const entry = pending.get(body.id);
        if (!entry || !entry.delivered) return json(res, 410, { error: '请求已结束，请不要重复确认交易' });
        clearTimeout(entry.timer);
        pending.delete(body.id);
        if (body.error) entry.reject(error(String(body.error.message || '钱包请求被拒绝'), Number(body.error.code) || -32000));
        else if (entry.method === 'eth_sendTransaction' && !/^0x[0-9a-fA-F]{64}$/.test(body.result || '')) entry.reject(error('钱包未返回有效交易哈希', -32603));
        else entry.resolve(body.result);
        notify();
        return json(res, 200, { ok: true });
      }
      if (req.url === '/reconnect') {
        if (!onReconnect) return json(res, 409, { error: '请从客户端菜单重新连接钱包' });
        if (reconnecting || pending.size) return json(res, 409, { error: '请先完成或取消当前钱包请求，再重新建立连接' });
        reconnecting = true;
        try { return json(res, 200, { url: await onReconnect() }); }
        finally { reconnecting = false; }
      }
      if (req.url === '/disconnect') { json(res, 200, { ok: true }); close(); return; }
      return json(res, 404, { error: '无效请求' });
    } catch (err) { json(res, 400, { error: err.message }); }
  };
  // Keep the login origin so MetaMask can reuse the account authorization.
  const server = loginServer || http.createServer();
  if (loginServer) server.removeAllListeners('request');
  server.on('request', handleRequest);
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  if (!loginServer) await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  const heartbeat = setInterval(() => {
    if (state.connected && Date.now() - lastSeen > heartbeatMs) disconnect('浏览器钱包页面无响应，请重新连接；如已确认交易，请先检查链上记录');
  }, Math.min(1000, heartbeatMs));
  return { url: `${origin}${loginServer ? '/wallet' : '/'}#${secret}`, request, snapshot, close };
}

function registerBrowserWalletBridge({ ipcMain, app, shell }) {
  let localRpc;
  let startingRpc;
  const getNetwork = async () => {
    if (!startingRpc) startingRpc = require('./punkosWalletRpc').createPunkosWalletRpc(require('../../services/crosschain/data/dev/deployment.json'))
      .then(value => { localRpc = value; return value.network; })
      .catch(error => { startingRpc = null; throw error; });
    return startingRpc;
  };
  const sessions = new Map();
  const preparing = new Map();
  const trusted = event => {
    const url = new URL(event.sender.getURL());
    const local = url.protocol === 'file:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '1600');
    if (!local || !url.pathname.endsWith('/html/table.html') || (event.senderFrame && event.senderFrame !== event.sender.mainFrame)) throw new Error('请从客户端工作台连接钱包');
  };
  const disconnect = owner => { sessions.get(owner.id)?.close(); sessions.delete(owner.id); };
  const createSession = async (owner, options) => {
    const bridge = await createWalletBridge({ ...options, onReconnect: () => {
      if (sessions.get(owner.id) !== bridge) throw new Error('旧钱包会话已失效，请使用最新页面');
      return prepare(owner, { targetNetwork: options?.targetNetwork });
    } });
    if (owner.isDestroyed()) { bridge.close(); throw new Error('客户端窗口已关闭'); }
    // Bind the replacement first, ensuring it has a different origin from the stuck session.
    disconnect(owner);
    sessions.set(owner.id, bridge);
    const cleanup = (_event, _url, inPlace, isMainFrame) => { if (isMainFrame === false || inPlace) return; if (sessions.get(owner.id) === bridge) disconnect(owner); };
    owner.once('destroyed', cleanup);
    owner.on('did-start-navigation', cleanup);
    const originalClose = bridge.close;
    bridge.close = () => { owner.removeListener('destroyed', cleanup); owner.removeListener('did-start-navigation', cleanup); originalClose(); };
    return bridge.url;
  };
  const prepare = (owner, options) => {
    if (preparing.has(owner.id)) return preparing.get(owner.id);
    const pending = createSession(owner, options).finally(() => preparing.delete(owner.id));
    preparing.set(owner.id, pending);
    return pending;
  };
  ipcMain.handle('browser-wallet:open', async event => {
    trusted(event);
    if (process.platform !== 'win32') throw new Error('此入口目前仅支持 Windows');
    if (sessions.get(event.sender.id)?.snapshot().connected) return sessions.get(event.sender.id).snapshot();
    const url = await prepare(event.sender, { targetNetwork: await getNetwork() });
    try { await shell.openExternal(url); } catch (err) { disconnect(event.sender); throw err; }
    return sessions.get(event.sender.id)?.snapshot();
  });
  ipcMain.handle('browser-wallet:state', event => { trusted(event); return sessions.get(event.sender.id)?.snapshot() || { connected: false, accounts: [], chainId: '', pending: 0 }; });
  ipcMain.handle('browser-wallet:network', event => { trusted(event); return getNetwork(); });
  ipcMain.handle('browser-wallet:disconnect', event => { trusted(event); disconnect(event.sender); });
  ipcMain.handle('browser-wallet:request', async (event, payload) => {
    trusted(event);
    try {
      const bridge = sessions.get(event.sender.id);
      if (!bridge) throw Object.assign(new Error('请先连接浏览器 MetaMask'), { code: 4900 });
      return { result: await bridge.request(payload) };
    } catch (err) { return { error: { code: err.code || -32000, message: err.message } }; }
  });
  app.on('before-quit', () => { for (const bridge of sessions.values()) bridge.close(); sessions.clear(); localRpc?.close(); });
  return { prepare, disconnect, getNetwork };
}

module.exports = { createWalletBridge, registerBrowserWalletBridge };
