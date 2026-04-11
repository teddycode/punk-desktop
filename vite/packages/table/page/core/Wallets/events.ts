import { h, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@punkos/ethers5/vue';
import { ethers } from 'ethers';
import { GetForLoginNonce, PostForAuthReq } from '@js/service/users';
import { message, Modal, Spin } from 'ant-design-vue';
import { appStore } from '../../../store';
import { ResponseType } from '@js/../../../typings/services';
import { comStore } from "../../../store/com";
import { useUserStore } from '../../../store/users';

// 认证的数据信息
declare interface SignMessage {
  address: string;
  signature: any;
  message: string;
}

export const setupWalletListener = (modal: any, calback: any, userInfo: any) => {
  const toast = useToast();
  
  // 在外部创建 account 实例，避免在事件回调中重复调用导致生命周期警告
  const w3mAccount = useWeb3ModalAccount();
  
  // 创建响应式事件对象（不使用 useWeb3ModalEvents 避免生命周期钩子问题）
  const w3mEvent = reactive(modal.getEvent());
  
  // 直接订阅 modal 的事件（不依赖 Vue 生命周期）
  const unsubscribe = modal.subscribeEvents(next => {
    w3mEvent.data = next.data;
    w3mEvent.timestamp = next.timestamp;
    
    // 处理事件
    console.log("🔔 [钱包事件]", w3mEvent.data.event, "时间戳:", w3mEvent.timestamp);
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
      case 'CONNECT_SUCCESS':
        console.log('✅ [CONNECT_SUCCESS] 钱包连接成功');
        toast.success('钱包连接成功！');
        break;
      case 'DISCONNECT_SUCCESS':
        console.log('测试事件响应：断开成功');
        useUserStore().setAuthenticated(false);
        break;
      case 'MODAL_CLOSE':
        // 注意：CONNECT_SUCCESS 事件可能不会触发（取决于连接方式）
        // 所以在 MODAL_CLOSE 时检查连接状态是最可靠的方式
        let connectStatus = w3mAccount.isConnected.value;
        console.log('🔔 [MODAL_CLOSE] 窗口关闭，连接状态:', connectStatus);
        if (userInfo) {
          console.log('登录后的钱包操作');
          if (connectStatus) {
            console.log('还是处于登录状态！');
          } else {
            console.log('已经断开钱包连接了！');
          }
        } else {
          const userStore = useUserStore();
          if (connectStatus) {
            console.log('钱包连接成功了');
            toast.success('钱包连接成功');
            // 检查是否已认证
            if (userStore.isAuthenticated) {
              console.log('已认证，无需重新认证');
              return;
            }
            // 向后端请求一个随机数
            GetForLoginNonce(useWeb3ModalAccount().address.value).then((res) => {
              console.log('获取后端数据：', res);
              if (res === undefined || res === null) {
                message.error('认证失败，请稍后重试');
                return;
              }
              // 向钱包请求签名
              toast.success('正在请求签名');
              const authModal = Modal.info({
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
                      useUserStore().setAuthenticated(true);
                      comStore()._updateUserInfo(resp.data.userInfo.id); //更新社交网络用户信息
                      calback(resp?.data);
                    } else {
                      message.error('认证失败：', resp?.msg);
                    }
                    authModal.destroy();
                  });
                })
                .catch((error) => {
                  if (error?.code === 5000) {
                    message.error('用户拒绝认证请求！');
                  }
                  authModal.destroy();
                });
            });
          } else {
            console.log('连接失败了，请重试');
          }
        }
        break;
      default:
        console.log('其他事件：', w3mEvent.data.event);
        break;
    }
  });
  
  // 返回事件对象和取消订阅函数
  return { event: w3mEvent, unsubscribe };
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
