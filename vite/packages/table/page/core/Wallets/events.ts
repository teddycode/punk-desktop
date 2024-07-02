import { h, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useWeb3ModalAccount, useWeb3ModalEvents, useWeb3ModalProvider } from '@web3modal/ethers5/vue';
import { ethers } from 'ethers';
import { GetForLoginNonce, PostForAuthReq } from '@js/service/users';
import { message, Modal, Spin } from 'ant-design-vue';
import { appStore } from '../../../store';
import { ResponseType } from '@js/../../../typings/services';
import { comStore } from "../../../store/com";

// 认证的数据信息
declare interface SignMessage {
  address: string;
  signature: any;
  message: string;
}

export const setupWalletListener = async (calback: any, userInfo: any) => {
  const toast = useToast();
  // 监听钱包事件
  const w3mEvent = useWeb3ModalEvents();
  watch(w3mEvent, () => {
    switch (w3mEvent.data.event) {
      case 'MODAL_OPEN':
        console.log('测试事件响应：打开了窗口');
        break;
      case 'SELECT_WALLET':
        console.log('测试事件响应：选择了钱包');
        break;
      case 'CONNECT_ERROR':
        console.log('测试事件响应：连接失败');
        toast.error('钱包连接失败，请重试！', null);
        break;
      case 'CONNECT_SUCCESS': // TODO Bug here, no events emitted when connect or disconnect
        console.log('钱包连接成功');
        toast.success('钱包连接成功！', this);
        break;
      case 'DISCONNECT_SUCCESS':
        console.log('测试事件响应：断开成功');
        break;
      case 'MODAL_CLOSE': // 只能通过监听close事件实现
        const w3mAccount = useWeb3ModalAccount();
        let connectStatus = w3mAccount.isConnected.value;
        console.log('测试事件响应：关闭了窗口');
        if (userInfo) {
          console.log('登录后的钱包操作');
          if (connectStatus) {
            console.log('还是处于登录状态！');
          } else {
            console.log('已经断开钱包连接了！');
          }
        } else {
          if (connectStatus) {
            console.log('钱包连接成功了');
            toast.success('钱包连接成功');
            // 向后端请求一个随机数
            GetForLoginNonce(useWeb3ModalAccount().address.value).then((res) => {
              console.log('获取后端数据：', res);
              if (res === undefined || res === null) {
                message.error('认证失败，请稍后重试');
                return;
              }
              // 向钱包请求签名
              toast.success('正在请求签名');
              const modal = Modal.info({
                title: '正在请求认证...',
                centered: true,
                content: h(
                  'div',
                  {
                    style: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
                  },
                  h(Spin, { size: 'large' }),
                ),
              });
              signMessage(res?.data)
                .then((data) => {
                  console.log('获取返回数据：', data);
                  // 返回签名到后端并获取登录结果
                  toast.success('请求验证');
                  PostForAuthReq(data).then((resp: ResponseType) => {
                    console.log('登录认证返回的数据：', resp);
                    if (resp?.code === 200 && resp?.data !== null) {
                      message.success('认证成功！');
                      comStore()._updateUserInfo(resp.data.userInfo.id); //更新社交网络用户信息
                      calback(resp?.data);
                    } else {
                      message.error('认证失败：', resp?.msg);
                    }
                    modal.destroy();
                  });
                })
                .catch((error) => {
                  if (error?.code === 5000) {
                    message.error('用户拒绝认证请求！');
                  }
                  modal.destroy();
                });
            });
          } else {
            console.log('连接失败了，请重试');
          }
        }
        break;
      default:
        break;
    }
  });
};

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
