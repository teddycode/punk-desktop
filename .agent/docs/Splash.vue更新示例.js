// 这是一个示例文件，展示如何更新 Splash.vue 使用新的钱包服务
// 请根据实际情况进行调整

/**
 * 步骤 1: 在 setup() 中获取钱包服务
 */
import { inject } from 'vue';

export default {
  name: 'Splash',

  setup() {
    // 获取全局钱包服务
    const wallet = inject('wallet');

    return {
      wallet,
    };
  },

  /**
   * 步骤 2: 更新 initWallet 方法
   */
  methods: {
    // 原来的方法：
    // async initWallet() {
    //   try {
    //     await createWeb3Modal(walletConfig());
    //     setupWalletListener(this.processUserInfo, this.userInfo);
    //   } catch (e) {
    //     console.log('创建钱包错误：', e.toString());
    //   }
    // },

    // 新的方法：
    async initWallet() {
      try {
        // 使用统一的钱包服务
        await this.wallet.initWallet(this.processUserInfo, this.userInfo);
        console.log('钱包初始化成功');
      } catch (e) {
        console.log('创建钱包错误：', e.toString());
      }
    },

    /**
     * 步骤 3: 更新 login 方法
     */
    // 原来的方法：
    // login() {
    //   const toast = useToast();
    //   let modal = useWeb3Modal();
    //   modal.open().then(() => {
    //     let account = useWeb3ModalAccount();
    //     if (account.isConnected.value) {
    //       toast.success(this.$t('toast.walletConnected'));
    //       setTimeout(() => {
    //         modal.close();
    //       }, 3000);
    //     }
    //   });
    // },

    // 新的方法：
    async login() {
      const toast = useToast();

      try {
        const account = await this.wallet.openWallet();

        if (account) {
          toast.success(this.$t('toast.walletConnected'));
          console.log('钱包连接成功:', this.wallet.address.value);
        } else {
          console.log('钱包连接超时或被取消');
        }
      } catch (e) {
        toast.error('钱包连接失败: ' + e.message);
      }
    },

    /**
     * 步骤 4: 更新 reLoginUser 方法
     */
    // 原来的方法：
    // async reLoginUser() {
    //   await this.deleteUserInfo();
    //   let res = await ipc.invoke('direct-logout', this.userInfo?.uid);
    //   if (res) {
    //     message.success(this.$t('message.logoutSuccess'));
    //     useDisconnect()
    //       .disconnect()
    //       .then(() => {
    //         this.login();
    //       });
    //   } else {
    //     message.error(this.$t('message.logoutFail'));
    //   }
    // },

    // 新的方法：
    async reLoginUser() {
      await this.deleteUserInfo();
      let res = await ipc.invoke('direct-logout', this.userInfo?.uid);

      if (res) {
        message.success(this.$t('message.logoutSuccess'));

        // 使用统一的断开方法
        const success = await this.wallet.disconnectWallet();

        if (success) {
          // 断开后重新登录
          this.login();
        }
      } else {
        message.error(this.$t('message.logoutFail'));
      }
    },

    /**
     * 步骤 5: 可选 - 添加钱包状态监听
     */
    setupWalletWatcher() {
      // 监听钱包连接状态变化
      watch(
        () => this.wallet.isConnected.value,
        (newVal, oldVal) => {
          console.log('钱包连接状态变化:', { 旧状态: oldVal, 新状态: newVal });

          if (newVal && !oldVal) {
            // 钱包刚连接
            console.log('钱包地址:', this.wallet.address.value);
            console.log('链ID:', this.wallet.chainId.value);
          } else if (!newVal && oldVal) {
            // 钱包断开
            console.log('钱包已断开');
          }
        },
      );

      // 监听地址变化
      watch(
        () => this.wallet.address.value,
        (newAddr) => {
          if (newAddr) {
            console.log('钱包地址更新:', newAddr);
          }
        },
      );
    },

    /**
     * 步骤 6: 在 mounted 中调用 setupWalletWatcher
     */
    // async mounted() {
    //   // ... 其他初始化代码
    //
    //   this.initWallet();
    //   this.setupWalletWatcher(); // 添加这行
    //
    //   // ... 其他代码
    // }
  },
};

/**
 * 完整的更新说明：
 *
 * 1. 移除直接导入的 Web3Modal hooks：
 *    - 删除: import { useWeb3Modal, useWeb3ModalAccount, useDisconnect, createWeb3Modal } from '@punkos/ethers5/vue';
 *
 * 2. 保留必要的导入：
 *    - 保留: import { setupWalletListener } from './core/Wallets/events';
 *    - 保留: import { walletConfig } from '@store/wallet';
 *    - 添加: import { inject, watch } from 'vue';
 *
 * 3. 在 setup() 中注入钱包服务：
 *    const wallet = inject('wallet');
 *    return { wallet };
 *
 * 4. 更新所有使用钱包的方法（如上所示）
 *
 * 5. 测试所有钱包相关功能：
 *    - 初始化钱包
 *    - 连接钱包
 *    - 断开钱包
 *    - 切换账户
 */
