import { defineStore } from 'pinia';
import { defaultConfig, Web3ModalOptions } from '@web3modal/ethers5';
import { mainnet, arbitrum, goerli } from 'viem/chains';

// @ts-ignore
export const walletStore = defineStore('walletStore', {
  state: () => ({
    projectId: '01c174cab89954d2942216e56549d410',
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#00BB7F',
      '--w3m-color-mix-strength': 10,
    },
    chains: [goerli, mainnet, arbitrum], // TODO 在这里添加网络支持
    isConnected: false,
    ethersConfigOptions: {
      metadata: {
        name: '磐古跨链客户端',
        description: '一些简介',
        url: 'https://www.punkos.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      defaultChainId: goerli.id, // 默认使用goerli测试网
      rpcUrl: 'https://cloudflare-eth.com',
    },
  }),
  actions: {
    getWalletOptions(): Web3ModalOptions {
      let ethersConfig = defaultConfig(this.ethersConfigOptions);
      return {
        ethersConfig: ethersConfig,
        projectId: this.projectId,
        chains: this.chains,
        themeMode: this.themeMode,
        themeVariables: this.themeVariables,
      } as Web3ModalOptions;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ['isConnected', 'projectId', 'chains', 'ethersConfig'],
      },
    ],
  },
});
