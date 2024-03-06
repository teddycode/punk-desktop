import { defineStore } from 'pinia';
import { defaultConfig, Web3ModalOptions } from '@web3modal/ethers5';
import { goerli, mainnet, arbitrum, punkos } from './chains';

export const walletConfig = (): Web3ModalOptions => {
  //   1. set projectId
  const projectId = '01c174cab89954d2942216e56549d410';
  // 2. Set chains
  const chains = [punkos, goerli, mainnet, arbitrum]; // TODO 在这里添加网络支持
  const ethersConfig = defaultConfig({
    metadata: {
      name: 'PunkOS client',
      description: 'A cross chain system with state of the art',
      url: 'https://www.punkos.com',
      icons: ['https://pic.imgdb.cn/item/65e292ac9f345e8d03288770.png'],
    },
    defaultChainId: punkos.chainId,
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
