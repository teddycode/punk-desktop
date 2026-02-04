import { ref, computed } from 'vue';
import { createWeb3Modal } from '@punkos/ethers5/vue';
import { useToast } from 'vue-toastification';
import { walletConfig } from '@store/wallet';
import { setupWalletListener } from '@table/page/core/Wallets/events';

// 生成唯一ID标识模块实例
const moduleId = Math.floor(Math.random() * 1000000);
console.log(`[useWalletService] Module Executing! ID: ${moduleId}`);

// 单例模式：确保全局只有一个钱包实例
let walletInstance: any = null;
let isInitialized = false;
let isConnecting = false; // 连接中标志，防止重复连接

// Web3Modal hooks 引用（延迟初始化）
let accountRef: any = null;
let modalRef: any = null;
let disconnectRef: any = null;

// Toast 实例（全局单例）
const toast = useToast();

// 使用 ref 来存储状态，确保响应式
const walletState = ref({
    isConnected: false,
    address: '',
    chainId: 0
});

// 基于 walletState 的 computed（全局单例）
const isConnected = computed(() => walletState.value.isConnected);
const address = computed(() => walletState.value.address);
const chainId = computed(() => walletState.value.chainId);

/**
 * 同步状态到 walletState
 */
function syncWalletState() {
    if (!accountRef) return;

    walletState.value = {
        isConnected: accountRef.isConnected?.value || false,
        address: accountRef.address?.value || '',
        chainId: accountRef.chainId?.value || 0
    };

    console.log('状态已同步到 walletState:', walletState.value);
}

/**
 * 初始化 Web3Modal hooks
 * 这个函数只在 createWeb3Modal 成功后调用
 */
async function initializeHooks() {
    if (!accountRef) {
        // 动态导入以避免在未初始化时调用
        const web3ModalVue = await import('@punkos/ethers5/vue');
        accountRef = web3ModalVue.useWeb3ModalAccount();
        modalRef = web3ModalVue.useWeb3Modal();
        disconnectRef = web3ModalVue.useDisconnect();

        console.log('Hooks 初始化完成，accountRef:', accountRef);

        // 初始化后立即同步状态
        syncWalletState();
    }
}

/**
 * 初始化钱包
 * @param processUserInfo 可选的用户信息处理回调
 * @param userInfo 可选的当前用户信息
 */
const initWallet = async (processUserInfo?: Function, userInfo?: any) => {
    if (isInitialized) {
        console.log('钱包已经初始化过了');
        return walletInstance;
    }

    try {
        // 先创建钱包实例
        console.log('正在创建 Web3Modal 实例...');
        walletInstance = await createWeb3Modal(walletConfig());
        isInitialized = true;

        // 钱包创建成功后，再初始化 hooks
        console.log('正在初始化钱包 hooks...');
        await initializeHooks();

        // 如果提供了回调函数，设置事件监听
        if (processUserInfo) {
            setupWalletListener(processUserInfo, userInfo);
        }

        console.log('钱包初始化成功');
        return walletInstance;
    } catch (e) {
        console.error('创建钱包错误：', e);
        isInitialized = false;
        throw e;
    }
};

/**
 * 打开钱包连接对话框
 * @returns Promise，连接成功返回账户信息，失败或超时返回 null
 */
const openWallet = async () => {
    try {
        // 防止重复连接
        if (isConnecting) {
            console.log('钱包连接正在进行中...');
            toast.warning('钱包连接正在进行中，请稍候');
            return null;
        }

        // 确保钱包已初始化
        if (!isInitialized) {
            console.log('钱包未初始化，开始自动初始化...');
            await initWallet();
        }

        if (!modalRef || !accountRef) {
            throw new Error('钱包 hooks 未初始化');
        }

        isConnecting = true;
        console.log('打开钱包连接对话框...');
        await modalRef.open();

        return new Promise((resolve) => {
            const checkConnection = setInterval(() => {
                // 确保连接状态、地址和链ID都已经准备好
                if (accountRef.isConnected.value &&
                    accountRef.address.value &&
                    accountRef.chainId.value) {
                    clearInterval(checkConnection);
                    isConnecting = false;

                    // 创建包含实际数据的对象
                    const walletData = {
                        address: accountRef.address.value,
                        chainId: accountRef.chainId.value,
                        isConnected: accountRef.isConnected.value
                    };

                    console.log('钱包连接成功！地址:', walletData.address, '链ID:', walletData.chainId);

                    // 关键：同步状态到 walletState，触发响应式更新
                    syncWalletState();

                    toast.success('钱包连接成功');

                    // 延迟关闭对话框并返回
                    setTimeout(() => {
                        console.log('关闭对话框，当前 walletState:', walletState.value);
                        modalRef.close();
                        resolve(walletData);
                    }, 500);
                }
            }, 300);

            // 30秒超时
            setTimeout(() => {
                clearInterval(checkConnection);
                isConnecting = false;
                console.log('钱包连接超时');
                resolve(null);
            }, 30000);
        });
    } catch (e: any) {
        isConnecting = false;
        console.error('打开钱包失败：', e);
        toast.error('打开钱包失败：' + e.message);
        throw e;
    }
};

/**
 * 断开钱包连接
 * @returns 是否成功断开
 */
const disconnectWallet = async () => {
    try {
        if (!isInitialized) {
            toast.warning('钱包未初始化');
            return false;
        }

        if (!disconnectRef) {
            throw new Error('disconnect hook 未初始化');
        }

        await disconnectRef.disconnect();

        // 同步状态
        syncWalletState();

        toast.success('钱包已断开');
        return true;
    } catch (e: any) {
        console.error('断开钱包失败：', e);
        toast.error('断开钱包失败：' + e.message);
        return false;
    }
};

/**
 * 获取钱包实例
 */
const getWalletInstance = () => {
    return walletInstance;
};

/**
 * 检查钱包是否已初始化
 */
const checkInitialized = () => {
    return isInitialized;
};

// 全局单例服务实例（只创建一次）
const serviceInstance = {
    // 状态（全局 computed）
    isConnected,
    address,
    chainId,

    // 方法
    initWallet,
    openWallet,
    disconnectWallet,
    getWalletInstance,
    checkInitialized,
};

/**
 * 全局钱包服务 Composable（单例模式）
 * 提供统一的钱包操作接口，支持在所有应用环境中使用
 */
export function useWalletService() {
    // 始终返回同一个实例
    return serviceInstance;
}
