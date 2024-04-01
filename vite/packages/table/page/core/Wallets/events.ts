import { h, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useWeb3ModalAccount, useWeb3ModalEvents, useWeb3ModalProvider } from '@web3modal/ethers5/vue';
import { ethers } from 'ethers';
import { GetForLoginNonce, PostForAuthReq } from '@js/service/users';
import { message, Modal, Spin } from 'ant-design-vue';
import { appStore } from '../../../store';

// 认证的数据信息
declare interface SignMessage {
  address: string;
  signature: any;
  message: string;
}

export const signMessage = async (nonce: string): Promise<SignMessage> => {
  let w3p = useWeb3ModalProvider();
  const walletProvider = w3p.walletProvider.value;
  let account = useWeb3ModalAccount();
  if (!walletProvider) throw Error('钱包链接已断开，请重新连接');
  const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
  const signer = await ethersProvider.getSigner();
  const message = 'login#punkos#' + nonce;
  const signature = await signer.signMessage(message);
  console.log('签名信息：', signature);
  console.log('验证签名...');
  const isSignatureValid = ethers.utils.verifyMessage(message, signature);
  if (isSignatureValid) {
    console.log('签名有效');
  } else {
    console.log('签名无效');
  }
  return {
    message: message,
    signature: signature,
    address: account.address.value.toString(),
  };
};
