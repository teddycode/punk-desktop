import { defineStore } from 'pinia';
import { defaultConfig, Web3ModalOptions } from '@web3modal/ethers5';

// @ts-ignore
export const walletStore = defineStore('walletStore', {
  state: () => ({
    projectId: '01c174cab89954d2942216e56549d410',
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#00BB7F',
      '--w3m-color-mix-strength': 20,
    },
    chains: [
      {
        chainId: 1,
        name: 'Ethereum',
        currency: 'ETH',
        explorerUrl: 'https://etherscan.io',
        rpcUrl: 'https://cloudflare-eth.com',
      },
      {
        chainId: 42161,
        name: 'Arbitrum',
        currency: 'ETH',
        explorerUrl: 'https://arbiscan.io',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
      },
    ],
    isConnected: false,
    ethersConfigOptions: {
      metadata: {
        name: 'PunkOS',
        description: 'Web3Modal Laboratory',
        url: 'https://web3modal.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      defaultChainId: 1,
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
