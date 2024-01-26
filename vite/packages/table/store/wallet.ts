import { defineStore } from 'pinia';
import { defaultConfig, Web3ModalOptions } from '@web3modal/ethers5';
import { goerli, mainnet, arbitrum } from './chains';

export const walletConfig = (): Web3ModalOptions => {
  //   1. set projectId
  const projectId = '01c174cab89954d2942216e56549d410';
  // 2. Set chains
  const chains = [goerli, mainnet, arbitrum]; // TODO 在这里添加网络支持
  const ethersConfig = defaultConfig({
    metadata: {
      name: '磐古跨链客户端',
      description: '一些简介',
      url: 'https://www.punkos.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
    defaultChainId: goerli.chainId, // 默认使用goerli测试网
    rpcUrl: 'https://cloudflare-eth.com',
  });

  // 3. Create modala
  let options = {
    ethersConfig,
    projectId,
    chains,
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#00BB7F',
      '--w3m-color-mix-strength': 20,
    },
  };
  return options as Web3ModalOptions;
};

// @ts-ignore
export const walletStore = defineStore('walletStore', {
  state: () => ({}),
  actions: {
    getWalletOptions() {},
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        // paths: ['projectId', 'chains', 'ethersConfig'],
      },
    ],
  },
});
