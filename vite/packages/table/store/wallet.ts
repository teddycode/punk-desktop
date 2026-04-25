import { defineStore } from 'pinia';
import { defaultConfig, Web3ModalOptions } from '@punkos/ethers5';
import { sepolia, mainnet, arbitrum, punkos } from './chains';

export const walletConfig = (): Web3ModalOptions => {
  //   1. set projectId
  const projectId = '01c174cab89954d2942216e56549d410';
  // 2. Set chains
  const chains = [punkos, sepolia, mainnet, arbitrum];
  const ethersConfig = defaultConfig({
    metadata: {
      name: 'PunkOS',
      description: 'A cross chain system with state of the art',
      url: 'https://www.punkos.com',
      icons: ['https://pic.imgdb.cn/item/65e292ac9f345e8d03288770.png'],
    },
    defaultChainId: punkos.chainId,
  });

  // 3. Create modal
  let options = {
    ethersConfig,
    projectId,
    chains,
    // 添加网络图标配置
    chainImages: {
      // Ethereum - 使用 WalletConnect CDN
      1: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/692ed6ba-e569-459a-556a-776476829e00/sm',
      // Sepolia - 使用 WalletConnect CDN（与 Ethereum 相同图标）
      11155111: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/692ed6ba-e569-459a-556a-776476829e00/sm',
      // Arbitrum - 使用 WalletConnect CDN  
      42161: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/600a9a04-c1b9-42ca-6785-9b4b6ff85200/sm',
      // PunkOS - 使用自定义图标
      20260418: 'https://pic.imgdb.cn/item/65e292ac9f345e8d03288770.png',
    },
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#00BB7F',
      '--w3m-color-mix-strength': 20,
    },
    relayConfig: {
      url: 'wss://relay.walletconnect.com'
    }
  };
  return options as Web3ModalOptions;
};

// @ts-ignore
export const walletStore = defineStore('walletStore', {
  state: () => ({
    // 钱包初始化状态
    isInitialized: false,
    walletInstance: null as any,

    // 钱包连接状态
    isConnected: false,
    address: '',
    chainId: 0,
    chainName: '',

    // 钱包信息
    balance: '0',
    ensName: '',

    // 连接历史
    lastConnectedTime: 0,
    connectionCount: 0,
  }),

  getters: {
    // 获取格式化的地址
    formattedAddress: (state) => {
      if (!state.address) return '';
      return `${state.address.slice(0, 6)}...${state.address.slice(-4)}`;
    },

    // 获取钱包地址
    getAddress: (state) => state.address,

    // 获取链ID
    getChainId: (state) => state.chainId,

    // 获取连接状态
    getIsConnected: (state) => state.isConnected,

    // 获取初始化状态
    getIsInitialized: (state) => state.isInitialized,

    // 获取完整状态
    getFullState: (state) => ({
      isInitialized: state.isInitialized,
      isConnected: state.isConnected,
      address: state.address,
      chainId: state.chainId,
      chainName: state.chainName,
      balance: state.balance,
      ensName: state.ensName,
    }),
  },

  actions: {
    /**
     * 设置初始化状态
     */
    setInitialized(status: boolean) {
      this.isInitialized = status;
      console.log('钱包初始化状态更新:', status);
    },

    /**
     * 设置钱包实例
     */
    setWalletInstance(instance: any) {
      this.walletInstance = instance;
    },

    /**
     * 更新钱包连接状态
     */
    updateWalletState(payload: {
      address: string;
      chainId: number;
      isConnected: boolean;
      chainName?: string;
      balance?: string;
      ensName?: string;
    }) {
      this.address = payload.address;
      this.chainId = payload.chainId;
      this.isConnected = payload.isConnected;

      if (payload.chainName) this.chainName = payload.chainName;
      if (payload.balance) this.balance = payload.balance;
      if (payload.ensName) this.ensName = payload.ensName;

      if (payload.isConnected) {
        this.lastConnectedTime = Date.now();
        this.connectionCount++;
      }

      console.log('钱包状态更新:', this.getFullState);
    },

    /**
     * 重置钱包状态
     */
    resetWalletState() {
      this.isConnected = false;
      this.address = '';
      this.chainId = 0;
      this.chainName = '';
      this.balance = '0';
      this.ensName = '';

      console.log('钱包状态已重置');
    },

    /**
     * 更新余额
     */
    updateBalance(balance: string) {
      this.balance = balance;
    },

    /**
     * 更新 ENS 名称
     */
    updateEnsName(ensName: string) {
      this.ensName = ensName;
    },

    /**
     * 获取钱包配置
     */
    getWalletOptions() {
      return walletConfig();
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ['address', 'chainId', 'lastConnectedTime', 'connectionCount'],
      },
    ],
  },
});
