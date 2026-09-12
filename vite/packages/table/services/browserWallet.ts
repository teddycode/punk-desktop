import { reactive, watch } from 'vue';

export const browserWallet = reactive({
  selected: sessionStorage.getItem('punkos-browser-wallet') === 'true',
  connected: false,
  address: '',
  chainId: '',
  pending: 0,
});

const events = new Map<string, Set<Function>>();
const emit = (name: string, value: any) => events.get(name)?.forEach(callback => callback(value));
let started = false;
let refreshing = false;
export async function refreshBrowserWallet() {
  if (refreshing) return;
  refreshing = true;
  try {
    const state = await (window as any).ipc.invoke('browser-wallet:state');
    browserWallet.connected = Boolean(state?.connected);
    browserWallet.address = state?.accounts?.[0] || '';
    browserWallet.chainId = state?.chainId || '';
    browserWallet.pending = state?.pending || 0;
  } catch {
    browserWallet.connected = false;
    browserWallet.address = '';
    browserWallet.chainId = '';
    browserWallet.pending = 0;
  } finally { refreshing = false; }
}
export function selectBrowserWallet() {
  browserWallet.selected = true;
  sessionStorage.setItem('punkos-browser-wallet', 'true');
  startBrowserWalletSync();
}
export function startBrowserWalletSync() {
  if (started) return;
  started = true;
  void refreshBrowserWallet();
  const timer = setInterval(() => { if (browserWallet.selected) void refreshBrowserWallet(); }, 1500);
  window.addEventListener('beforeunload', () => clearInterval(timer), { once: true });
}
export async function openBrowserWallet() {
  selectBrowserWallet();
  await (window as any).ipc.invoke('browser-wallet:open');
  await refreshBrowserWallet();
}
export async function disconnectBrowserWallet(deselect = false) {
  await (window as any).ipc.invoke('browser-wallet:disconnect');
  browserWallet.connected = false;
  browserWallet.address = '';
  browserWallet.chainId = '';
  if (deselect) {
    browserWallet.selected = false;
    sessionStorage.removeItem('punkos-browser-wallet');
  }
}
export const browserWalletProvider = {
  async request({ method, params = [] }: { method: string; params?: any[] }) {
    await refreshBrowserWallet();
    if (!browserWallet.connected) throw Object.assign(new Error('浏览器 MetaMask 未连接，请通过右上角菜单重新连接，并保持浏览器钱包页打开'), { code: 4900 });
    const response = await (window as any).ipc.invoke('browser-wallet:request', { method, params });
    if (response.error) throw Object.assign(new Error(response.error.message), { code: response.error.code });
    if (method === 'eth_sendTransaction') window.dispatchEvent(new Event('punkos:browser-wallet-transaction'));
    await refreshBrowserWallet();
    return response.result;
  },
  on(name: string, callback: Function) {
    if (!events.has(name)) events.set(name, new Set());
    events.get(name)!.add(callback);
    return this;
  },
  removeListener(name: string, callback: Function) { events.get(name)?.delete(callback); return this; },
};
watch(() => browserWallet.address, address => emit('accountsChanged', address ? [address] : []));
watch(() => browserWallet.chainId, chainId => { if (chainId) emit('chainChanged', chainId); });
watch(() => browserWallet.connected, connected => emit(connected ? 'connect' : 'disconnect', connected ? { chainId: browserWallet.chainId } : { code: 4900, message: '浏览器钱包已断开' }));
