const token = location.hash.slice(1);
const clientId = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
const el = id => document.getElementById(id);
const wallets = [];
let provider;
let stopped = false;
let polling = false;
let active = false;
let connecting = false;
let awaitingAuthorization = false;
let targetNetwork;
let promptDecision;
const promptMethods = new Set(['eth_requestAccounts', 'eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4', 'wallet_switchEthereumChain', 'wallet_addEthereumChain']);
function formatNativeAmount(value) {
  const wei = BigInt(value || '0x0');
  const whole = wei / 1000000000000000000n;
  const fraction = (wei % 1000000000000000000n).toString().padStart(18, '0').replace(/0+$/, '');
  return whole.toString() + (fraction ? '.' + fraction : '');
}
function addWallet(p, name) {
  if (!p || wallets.includes(p)) return;
  wallets.push(p);
  const option = document.createElement('option'); option.value = String(wallets.length - 1); option.textContent = name; el('wallet').appendChild(option);
}
window.addEventListener('eip6963:announceProvider', event => { if (event.detail?.info?.rdns === 'io.metamask') addWallet(event.detail.provider, event.detail.info.name || 'MetaMask'); });
function detect() {
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  (window.ethereum?.providers || [window.ethereum]).filter(p => p?.isMetaMask && !p.isCoinbaseWallet && !p.isBraveWallet).forEach(p => addWallet(p, 'MetaMask'));
}
async function post(route, body = {}) {
  const res = await fetch(route, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Wallet-Session': token }, body: JSON.stringify({ ...body, clientId }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '钱包连接失败');
  return data;
}
async function readState() {
  const accounts = await provider.request({ method: 'eth_accounts' });
  const chainId = await provider.request({ method: 'eth_chainId' });
  el('account').textContent = accounts[0] ? '交易账户：' + accounts[0] : '钱包已锁定或未授权';
  el('network').textContent = '网络 Chain ID：' + Number(chainId) + (Number(chainId) === 20260902 ? ' · PunkOS' : ' · 跨链操作需要切换到 PunkOS');
  return { accounts, chainId };
}
async function handleRequest(request) {
  active = true;
  let expired;
  try {
    if (promptMethods.has(request.method)) {
      el('request').hidden = false;
      if (request.method === 'eth_sendTransaction') {
        const tx = request.params[0];
        const symbol = Number(request.expectedChainId) === 20260902 ? 'PUNK' : [1, 11155111, 42161].includes(Number(request.expectedChainId)) ? 'ETH' : '原生币';
        el('payment').textContent = `本笔交易随附金额：${formatNativeAmount(tx.value)} ${symbol}，另需支付 Gas。合约中的其他代币支出以业务内容和 MetaMask 确认详情为准。`;
      } else el('payment').textContent = request.method.startsWith('wallet_') ? '此请求用于添加或切换网络，不会转账。' : '请核对本次钱包授权或签名的内容。';
      el('details').textContent = JSON.stringify({ method: request.method, account: request.expectedAccount, chainId: Number(request.expectedChainId), params: request.params }, null, 2);
      el('status').textContent = '请核对客户端请求，再打开 MetaMask 确认';
      const allowed = await new Promise(resolve => {
        promptDecision = resolve;
        expired = setTimeout(() => resolve(false), Math.max(0, request.deadline - Date.now()));
      });
      clearTimeout(expired);
      promptDecision = null;
      if (!allowed || stopped || Date.now() >= request.deadline) throw Object.assign(new Error('用户拒绝请求或请求已过期'), { code: 4001 });
    }
    const current = await readState();
    if (stopped || Date.now() >= request.deadline) throw Object.assign(new Error('请求已过期，请重新发起'), { code: 4001 });
    if (['eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4'].includes(request.method)) {
      if (current.accounts[0]?.toLowerCase() !== request.expectedAccount?.toLowerCase()) throw Object.assign(new Error('账户已切换，请从客户端重新发起操作'), { code: 4100 });
      if (Number(current.chainId) !== Number(request.expectedChainId)) throw Object.assign(new Error('网络已切换，请从客户端重新发起操作'), { code: 4901 });
    }
    const params = request.method === 'eth_sendTransaction' ? [{ ...request.params[0], chainId: request.expectedChainId }] : request.params;
    const result = await provider.request({ method: request.method, params });
    await post('/result', { id: request.id, result: result === undefined ? null : result });
    if (promptMethods.has(request.method)) el('status').textContent = request.method === 'eth_sendTransaction' ? '交易已发送：' + result : '钱包请求已完成';
  } catch (err) {
    try { await post('/result', { id: request.id, error: { code: err.code || -32000, message: err.message || '钱包请求失败' } }); } catch { /* Never retry a submitted transaction. */ }
    el('status').textContent = err.message || '钱包请求失败';
  } finally {
    clearTimeout(expired); promptDecision = null; active = false; el('request').hidden = true;
  }
}
async function poll() {
  if (!provider || stopped || polling) return;
  polling = true;
  try {
    const state = await readState();
    const ready = !targetNetwork || Number(state.chainId) === Number(targetNetwork.chainId);
    const data = await post('/poll', { ...state, accounts: ready ? state.accounts : [], busy: active });
    if (!connecting) {
      el('connect').disabled = Boolean(state.accounts.length);
      el('wallet').disabled = Boolean(state.accounts.length);
      if (state.accounts.length && ready && awaitingAuthorization) {
        awaitingAuthorization = false;
        el('reconnect').hidden = true;
        el('connect').textContent = '已连接 MetaMask';
        el('status').textContent = '账户已授权，请返回客户端；若网络不是 PunkOS，请在客户端请求切换网络。保持此页打开。';
      } else if (!state.accounts.length) {
        el('connect').textContent = '连接 MetaMask';
      }
      if (!ready) {
        el('connect').disabled = false;
        el('connect').textContent = '连接 PunkOS 网络';
        el('status').textContent = '尚未进入 PunkOS，请点击连接并在 MetaMask 确认网络。';
      }
    }
    if (data.request) void handleRequest(data.request);
  } catch (err) {
    stopped = true;
    promptDecision?.(false);
    el('status').textContent = '连接已中断，请回客户端重新连接。' + (err.message || '');
  } finally { polling = false; }
}
async function connect(interactive) {
  if (connecting || stopped) return;
  detect();
  provider = wallets[Number(el('wallet').value || 0)];
  if (!provider) { el('status').textContent = '未检测到 MetaMask，请将完整网址复制到已安装插件的浏览器。'; return; }
  connecting = true;
  el('connect').disabled = true;
  el('wallet').disabled = true;
  el('connect').textContent = '等待 MetaMask 授权…';
  el('status').textContent = '请打开浏览器右上角的 MetaMask，解锁并处理账户连接请求。';
  let connected = false;
  const waitingTimer = setTimeout(() => { if (connecting && !stopped) el('reconnect').hidden = false; }, 15000);
  try {
    targetNetwork = (await post('/network')).network;
    let accounts = await provider.request({ method: 'eth_accounts' });
    if (!accounts.length) {
      if (!interactive) { el('status').textContent = '请点击连接 MetaMask 并授权账户'; provider = null; return; }
      accounts = await provider.request({ method: 'eth_requestAccounts' });
    }
    if (stopped) return;
    if (!accounts.length) throw new Error('MetaMask 未授权账户，请重新连接');
    if (targetNetwork && Number(await provider.request({ method: 'eth_chainId' })) !== Number(targetNetwork.chainId)) {
      el('status').textContent = '请在 MetaMask 中确认进入 PunkOS 网络…';
      try {
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetNetwork.chainId }] });
      } catch (error) {
        if (Number(error.code) !== 4902) throw error;
        await provider.request({ method: 'wallet_addEthereumChain', params: [targetNetwork] });
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetNetwork.chainId }] });
      }
      if (Number(await provider.request({ method: 'eth_chainId' })) !== Number(targetNetwork.chainId)) throw new Error('未完成 PunkOS 网络切换，请重试');
    }
    if (stopped) return;
    connected = true;
    awaitingAuthorization = false;
    el('reconnect').hidden = true;
    el('wallet').disabled = true;
    el('connect').disabled = true;
    el('connect').textContent = '已连接 MetaMask';
    el('status').textContent = '已连接，请回客户端发起跨链操作，并保持此页面打开。';
    await poll();
  } catch (err) {
    if (stopped) return;
    awaitingAuthorization = Number(err.code) === -32002 || /already pending/i.test(err.message || '');
    el('reconnect').hidden = !awaitingAuthorization;
    el('status').textContent = awaitingAuthorization
      ? 'MetaMask 中已有账户授权请求等待处理。请打开插件处理；如果没有弹窗或一直无法完成，点击下方“重新建立连接”，然后在新页面连接。'
      : Number(err.code) === 4001 ? '已取消授权，可以重试' : err.message;
  } finally {
    clearTimeout(waitingTimer);
    connecting = false;
    el('connect').disabled = connected && !stopped;
    el('wallet').disabled = connected && !stopped;
    if (!connected) el('connect').textContent = '连接 MetaMask';
  }
}
el('reconnect').onclick = async () => {
  if (active) return;
  el('reconnect').disabled = true;
  try {
    const { url } = await post('/reconnect');
    stopped = true;
    el('status').textContent = '正在打开新的钱包连接，请在新页面连接 MetaMask。';
    window.location.assign(url);
  } catch (err) {
    el('status').textContent = err.message || '重建失败，请从客户端菜单重新连接';
    el('reconnect').disabled = false;
  }
};
el('connect').onclick = () => connect(true);
el('approve').onclick = () => promptDecision?.(true);
el('reject').onclick = () => promptDecision?.(false);
el('disconnect').onclick = async () => { stopped = true; promptDecision?.(false); try { await post('/disconnect'); } catch {} el('status').textContent = '已断开交易钱包，可以关闭此页'; };
detect();
setTimeout(() => { if (!/^[a-f0-9]{64}$/.test(token)) { stopped = true; el('status').textContent = '链接无效，请从客户端连接钱包'; return; } void connect(false); }, 500);
setInterval(poll, 1500);
window.addEventListener('pagehide', () => {
  void fetch('/disconnect', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', 'X-Wallet-Session': token }, body: JSON.stringify({ clientId }) }).catch(() => {});
});
