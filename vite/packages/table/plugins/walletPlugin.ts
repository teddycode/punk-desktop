import { App } from 'vue';
import { useWalletService } from '@table/composables/useWalletService';

/**
 * 钱包插件
 * 在 Vue 应用启动时注入钱包服务，使其在全局可用
 * 
 * 使用方法：
 * import walletPlugin from '@table/plugins/walletPlugin';
 * app.use(walletPlugin);
 */
export default {
    install(app: App) {
        const walletService = useWalletService();

        // 注入到全局属性，可以通过 this.$wallet 访问
        app.config.globalProperties.$wallet = walletService;

        // 提供给所有组件，可以通过 inject('wallet') 访问
        app.provide('wallet', walletService);

        console.log('钱包插件已安装');
    }
};
