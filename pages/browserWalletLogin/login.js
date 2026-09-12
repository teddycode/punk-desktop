/* global document, window, fetch, TextEncoder */
const session = window.location.hash.slice(1);
const wallets = [];
const select = document.getElementById('wallet');
const connect = document.getElementById('connect');
const status = document.getElementById('status');
const account = document.getElementById('account');
let terminal = false;
function addWallet(provider, name) {
  if (!provider || wallets.some(wallet => wallet.provider === provider)) return;
  wallets.push({ provider, name });
  const option = document.createElement('option');
  option.value = String(wallets.length - 1);
  option.textContent = name;
  select.appendChild(option);
  if (!terminal) status.textContent = '已检测到 MetaMask。请选择账户并确认登录签名。';
}
window.addEventListener('eip6963:announceProvider', event => {
  if (event.detail?.info?.rdns === 'io.metamask') addWallet(event.detail.provider, event.detail.info.name || 'MetaMask');
});
function detect() {
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  const candidates = window.ethereum?.providers || [window.ethereum];
  candidates.filter(provider => provider?.isMetaMask && !provider.isCoinbaseWallet && !provider.isBraveWallet).forEach(provider => addWallet(provider, 'MetaMask'));
}
async function request(path, body) {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Login-Session': session }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '登录失败');
  return data;
}
async function ensureLoginNetwork(provider, network) {
  if (!network) return;
  if (Number(await provider.request({ method: 'eth_chainId' })) === Number(network.chainId)) return;
  status.textContent = '请在 MetaMask 中确认切换到 PunkOS 网络…';
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: network.chainId }] });
  } catch (error) {
    if (Number(error.code) !== 4902) throw error;
    status.textContent = '请在 MetaMask 中确认添加 PunkOS 网络…';
    try {
      await provider.request({ method: 'wallet_addEthereumChain', params: [network] });
    } catch (addError) {
      if (/https.*rpcUrls/i.test(addError.message || '')) {
        throw new Error(`无法添加 PunkOS：MetaMask 要求 HTTPS RPC，当前配置为 ${network.rpcUrls[0]}。请配置有效的 HTTPS RPC，或在 MetaMask 中手动添加该网络（Chain ID：${Number(network.chainId)}，币种：PUNK）后重试登录。`);
      }
      throw addError;
    }
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: network.chainId }] });
  }
  if (Number(await provider.request({ method: 'eth_chainId' })) !== Number(network.chainId)) {
    throw new Error('尚未切换到 PunkOS，请在 MetaMask 中完成切换后重试登录');
  }
}
connect.addEventListener('click', async () => {
  detect();
  if (!wallets.length) { status.textContent = '未检测到 MetaMask。请在已安装并启用 MetaMask 的浏览器中打开当前完整网址。'; return; }
  connect.disabled = true;
  select.disabled = true;
  try {
    const provider = wallets[Number(select.value)].provider;
    status.textContent = '请在 MetaMask 中解锁并选择账户…';
    const addresses = await provider.request({ method: 'eth_requestAccounts' });
    const address = addresses?.[0];
    if (!address) throw new Error('未选择钱包账户');
    account.textContent = '当前账户：' + address;
    const challenge = await request('/nonce', { address });
    await ensureLoginNetwork(provider, challenge.network);
    status.textContent = '请在 MetaMask 中确认登录签名…';
    const hex = '0x' + Array.from(new TextEncoder().encode(challenge.message), byte => byte.toString(16).padStart(2, '0')).join('');
    const signature = await provider.request({ method: 'personal_sign', params: [hex, address] });
    const current = await provider.request({ method: 'eth_accounts' });
    if (current?.[0]?.toLowerCase() !== address.toLowerCase()) throw new Error('签名期间账户已切换，请重新登录');
    if (challenge.network && Number(await provider.request({ method: 'eth_chainId' })) !== Number(challenge.network.chainId)) throw new Error('签名期间网络已切换，请切回 PunkOS 后重新登录');
    status.textContent = '正在验证登录签名…';
    const completion = await request('/complete', { address, signature });
    terminal = true;
    status.textContent = '登录成功，请返回 PunkOS 客户端。可以关闭此页面。';
    document.getElementById('cancel').disabled = true;
    if (completion.walletUrl) {
      status.textContent = '登录成功，正在进入跨链交易钱包连接页…';
      window.location.assign(completion.walletUrl);
    }
  } catch (error) {
    if (!terminal) status.textContent = error.code === 4001 ? '你已取消钱包授权或签名，可重新尝试。' : error.message === 'Failed to fetch' ? '客户端已关闭或登录会话已过期，请回客户端重新发起登录。' : error.message || '登录失败，请重试';
  } finally {
    connect.disabled = terminal;
    select.disabled = terminal;
  }
});
document.getElementById('cancel').addEventListener('click', async () => {
  terminal = true;
  connect.disabled = true;
  select.disabled = true;
  try { await request('/cancel', {}); } catch { /* Session may already be closed. */ }
  status.textContent = '已取消登录，可以关闭此页面。';
});
detect();
setTimeout(() => {
  detect();
  if (!wallets.length && !terminal) status.textContent = '未检测到 MetaMask。请打开插件，或将完整网址复制到已安装插件的浏览器。';
}, 500);
if (!/^[a-f0-9]{64}$/.test(session)) {
  terminal = true;
  connect.disabled = true;
  status.textContent = '登录链接无效，请从 PunkOS 客户端重新发起登录。';
}
