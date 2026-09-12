const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// A short-lived loopback server. Authentication tokens never enter the browser.
async function createBrowserLogin({ openExternal, requestNonce, authenticate, onAuthenticated, targetNetwork, timeoutMs = 300000 }) {
  const secret = crypto.randomBytes(32).toString('hex');
  let origin;
  let challenge = null;
  let busy = false;
  let finished = false;
  let handedOff = false;
  let timer;
  let settle;
  const result = new Promise(resolve => { settle = resolve; });
  const finish = value => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    if (!handedOff) {
      server.close();
      if (server.closeIdleConnections) server.closeIdleConnections();
    }
    settle(value);
  };
  const json = (res, status, value) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(value));
  };
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    if (!origin || req.headers.host !== new URL(origin).host) return json(res, 403, { error: '无效的访问地址' });
    if (req.method === 'GET' && ['/', '/login.js', '/login.css'].includes(req.url)) {
      const file = req.url === '/' ? 'index.html' : req.url.slice(1);
      res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8');
      res.end(fs.readFileSync(path.join(__dirname, '../../pages/browserWalletLogin', file)));
      return;
    }
    if (req.method !== 'POST' || req.headers.origin !== origin || req.headers['x-login-session'] !== secret || !String(req.headers['content-type']).startsWith('application/json')) {
      return json(res, 403, { error: '登录会话无效，请回客户端重新发起登录' });
    }
    if (finished || busy) return json(res, 409, { error: '登录请求正在处理或已经结束' });
    if (!['/nonce', '/complete', '/cancel'].includes(req.url)) return json(res, 404, { error: '无效请求' });
    busy = true;
    try {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 8192) throw new Error('请求内容过长');
      }
      const body = JSON.parse(raw || '{}');
      if (finished) return json(res, 410, { error: '登录已过期' });
      if (req.url === '/cancel') {
        json(res, 200, { ok: true });
        finish({ ok: false, error: '已取消浏览器登录' });
        return;
      }
      if (req.url === '/nonce') {
        challenge = null;
        if (!/^0x[0-9a-fA-F]{40}$/.test(body.address)) throw new Error('钱包地址无效');
        const nonce = await requestNonce(body.address);
        if (!['string', 'number'].includes(typeof nonce) || String(nonce).length === 0) throw new Error('认证服务器未返回有效的登录随机数');
        if (finished) return json(res, 410, { error: '登录已过期' });
        challenge = { address: body.address, message: 'login#punkos#' + nonce };
        json(res, 200, { ...challenge, ...(targetNetwork ? { network: targetNetwork } : {}) });
      } else {
        const current = challenge;
        challenge = null; // Consume the nonce even if the backend rejects it.
        if (!current || typeof body.address !== 'string' || body.address.toLowerCase() !== current.address.toLowerCase() || !/^0x[0-9a-fA-F]{130}$/.test(body.signature)) throw new Error('签名或账户不匹配，请重新连接并签名');
        const data = await authenticate({ ...current, signature: body.signature });
        if (finished) return json(res, 410, { error: '登录已过期' });
        if (!data?.userInfo?.id) throw new Error('认证服务器未返回有效的用户信息');
        const walletUrl = onAuthenticated ? await onAuthenticated({ loginServer: server }) : undefined;
        handedOff = Boolean(walletUrl && new URL(walletUrl).origin === origin);
        if (finished) return json(res, 410, { error: '登录已取消或过期' });
        json(res, 200, { ok: true, ...(walletUrl ? { walletUrl } : {}) });
        finish({ ok: true, data, address: current.address, ...(walletUrl ? { browserWallet: true } : {}) });
      }
    } catch (error) {
      json(res, 400, { error: error.message || '登录失败，请重试' });
    } finally {
      busy = false;
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
  timer = setTimeout(() => finish({ ok: false, error: '浏览器登录已超时，请重新登录' }), timeoutMs);
  try {
    await openExternal(`${origin}/#${secret}`);
  } catch {
    finish({ ok: false, error: '无法打开默认浏览器，请检查 Windows 默认浏览器设置' });
  }
  return { result, cancel: () => finish({ ok: false, error: '已取消浏览器登录' }) };
}

function registerBrowserWalletLogin({ ipcMain, app, shell, BrowserWindow, apiBaseUrl, walletBridge }) {
  const axios = require('axios');
  const sessions = new Map();
  const client = axios.create({ baseURL: apiBaseUrl, timeout: 15000 });
  const readResponse = response => {
    if (response.data?.code !== 200) throw new Error(response.data?.msg || '认证服务器拒绝了登录请求');
    return response.data.data;
  };
  ipcMain.handle('browser-wallet-login:start', async event => {
    if (process.platform !== 'win32') return { ok: false, error: '此入口目前仅支持 Windows' };
    const owner = event.sender;
    const url = owner.getURL();
    // Only the desktop workbench, never an embedded third-party web page.
    const parsed = new URL(url);
    if (!((parsed.protocol === 'file:' || (parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname) && parsed.port === '1600')) && parsed.pathname.endsWith('/html/table.html')) || (event.senderFrame && event.senderFrame !== owner.mainFrame)) {
      return { ok: false, error: '请从客户端登录页发起登录' };
    }
    if (sessions.has(owner.id)) return { ok: false, error: '已有浏览器登录正在进行' };
    const entry = { cancel: null, cancelled: false };
    sessions.set(owner.id, entry);
    const cancel = () => { entry.cancelled = true; entry.cancel?.(); };
    owner.once('destroyed', cancel);
    owner.on('did-start-navigation', cancel);
    try {
      const targetNetwork = walletBridge ? await walletBridge.getNetwork() : undefined;
      const session = await createBrowserLogin({
        targetNetwork,
        openExternal: url => shell.openExternal(url),
        requestNonce: async address => readResponse(await client.get('/users/login/nonce', { params: { address } })),
        authenticate: async payload => readResponse(await client.post('/users/login/auth', null, { params: payload })),
        onAuthenticated: walletBridge ? async options => {
          if (entry.cancelled) throw new Error('登录已取消');
          const url = await walletBridge.prepare(owner, { ...options, targetNetwork });
          if (entry.cancelled) { walletBridge.disconnect(owner); throw new Error('登录已取消'); }
          return url;
        } : undefined
      });
      entry.cancel = session.cancel;
      if (entry.cancelled) session.cancel();
      const result = await session.result;
      if (!owner.isDestroyed()) {
        const window = BrowserWindow.fromWebContents(owner);
        window?.show();
        window?.focus();
      }
      return result;
    } catch (error) {
      return { ok: false, error: error.message || '浏览器登录失败' };
    } finally {
      owner.removeListener('destroyed', cancel);
      owner.removeListener('did-start-navigation', cancel);
      sessions.delete(owner.id);
    }
  });
  ipcMain.handle('browser-wallet-login:cancel', event => {
    const entry = sessions.get(event.sender.id);
    if (entry) { entry.cancelled = true; entry.cancel?.(); }
  });
  app.on('before-quit', () => {
    for (const entry of sessions.values()) { entry.cancelled = true; entry.cancel?.(); }
  });
}

module.exports = { createBrowserLogin, registerBrowserWalletLogin };
