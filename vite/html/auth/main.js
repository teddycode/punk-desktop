import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { ethers } from 'ethers';
import { arbitrum, goerli, mainnet, punkos } from './chains.js';
import axios from 'axios';

const walletConfig = () => {
  //   1. set projectId
  const projectId = '01c174cab89954d2942216e56549d410';
  // 2. Set chains
  const chains = [punkos, goerli, mainnet, arbitrum];
  const ethersConfig = defaultConfig({
    metadata: {
      name: 'PunkOS client',
      description: 'A cross chain system with state of the art',
      url: 'https://www.punkos.com',
      icons: ['https://pic.imgdb.cn/item/65e292ac9f345e8d03288770.png'],
    },
    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    rpcUrl: 'https://cloudflare-eth.com', // used for the Coinbase SDK
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
  return options;
};

// 5. Create a Web3Modal instance
const modal = createWeb3Modal(walletConfig());

modal.open();
modal.watchWalletConnect();

modal.subscribeEvents((event) => {
  console.log('新的事件：', event.data.event);
  switch (event.data.event) {
    case 'MODAL_OPEN':
      console.log('测试事件响应：打开了窗口');
      break;
    case 'SELECT_WALLET':
      console.log('测试事件响应：选择了钱包');
      break;
    case 'CONNECT_ERROR':
      console.log('测试事件响应：连接失败');
      break;
    case 'CONNECT_SUCCESS': // TODO Bug here, no events emitted when connect or disconnect
      console.log('钱包连接成功');
      break;
    case 'DISCONNECT_SUCCESS':
      console.log('测试事件响应：断开成功');
      break;
    case 'MODAL_CLOSE':
      console.log('测试事件响应：断开成功');
      if (modal.getIsConnected()) {
        console.log('钱包已经连接好了');
        //  获取后端的nonce
        const address = modal.getAddress();
        axios // TODO 这里需要更新服务器地址
          .get('http://123.157.213.104:18081/api/users/login/nonce', {
            params: { address: address },
          })
          .then((res) => {
            console.log('获取后端数据：', res);
            if (res === undefined || res === null) {
              console.error('认证失败，请稍后重试');
              return;
            }
            const nonce = res?.data?.data;
            signMessage(nonce).then((data) => {
              window.location.href = '/html/auth/loading.html?code=' + nonce + '#=#' + data;
            });
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } else {
        console.log('钱包没连接呢！');
        modal.open();
      }
      break;
  }
});

const signMessage = async (nonce) => {
  const walletProvider = modal.getWalletProvider();
  const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
  const signer = await ethersProvider.getSigner();
  const message = 'login#punkos#' + nonce;
  const signature = await signer.signMessage(message);
  return signature;
};
