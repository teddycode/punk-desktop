import { useWalletService } from '@table/composables/useWalletService';

/**
 * WalletBridge 类
 * 用于在父窗口和 iframe 之间建立钱包通信桥梁
 * 
 * 使用方法：
 * const bridge = new WalletBridge();
 */
export class WalletBridge {
    private walletService: any;
    private allowedOrigins: string[];

    constructor(allowedOrigins: string[] = ['*']) {
        this.walletService = useWalletService();
        this.allowedOrigins = allowedOrigins;
        this.setupMessageListener();
    }

    /**
     * 监听来自 iframe 的消息
     */
    private setupMessageListener() {
        window.addEventListener('message', async (event) => {
            // 验证消息来源
            if (!this.isValidOrigin(event.origin)) {
                console.warn('收到来自未授权源的消息：', event.origin);
                return;
            }

            const { type, data, requestId } = event.data;

            try {
                switch (type) {
                    case 'WALLET_CONNECT':
                        await this.handleConnect(event.source, requestId);
                        break;

                    case 'WALLET_DISCONNECT':
                        await this.handleDisconnect(event.source, requestId);
                        break;

                    case 'WALLET_STATUS':
                        await this.handleStatus(event.source, requestId);
                        break;

                    case 'WALLET_INIT':
                        await this.handleInit(event.source, requestId);
                        break;

                    default:
                        console.warn('未知的消息类型：', type);
                }
            } catch (error) {
                this.sendToIframe(event.source, {
                    type: `${type}_ERROR`,
                    requestId,
                    data: {
                        error: error.message
                    }
                });
            }
        });
    }

    /**
     * 处理连接请求
     */
    private async handleConnect(source: any, requestId: string) {
        console.log('处理钱包连接请求');
        const account = await this.walletService.openWallet();

        this.sendToIframe(source, {
            type: 'WALLET_CONNECT_RESPONSE',
            requestId,
            data: {
                isConnected: this.walletService.isConnected.value,
                address: this.walletService.address.value,
                chainId: this.walletService.chainId.value,
            }
        });
    }

    /**
     * 处理断开请求
     */
    private async handleDisconnect(source: any, requestId: string) {
        console.log('处理钱包断开请求');
        const success = await this.walletService.disconnectWallet();

        this.sendToIframe(source, {
            type: 'WALLET_DISCONNECT_RESPONSE',
            requestId,
            data: { success }
        });
    }

    /**
     * 处理状态查询
     */
    private async handleStatus(source: any, requestId: string) {
        console.log('处理钱包状态查询');
        this.sendToIframe(source, {
            type: 'WALLET_STATUS_RESPONSE',
            requestId,
            data: {
                isConnected: this.walletService.isConnected.value,
                address: this.walletService.address.value,
                chainId: this.walletService.chainId.value,
                isInitialized: this.walletService.checkInitialized(),
            }
        });
    }

    /**
     * 处理初始化请求
     */
    private async handleInit(source: any, requestId: string) {
        console.log('处理钱包初始化请求');
        if (!this.walletService.checkInitialized()) {
            await this.walletService.initWallet();
        }

        this.sendToIframe(source, {
            type: 'WALLET_INIT_RESPONSE',
            requestId,
            data: {
                isInitialized: this.walletService.checkInitialized(),
            }
        });
    }

    /**
     * 发送消息到 iframe
     */
    private sendToIframe(target: any, message: any) {
        target.postMessage(message, '*');
    }

    /**
     * 验证消息来源
     */
    private isValidOrigin(origin: string): boolean {
        // 如果允许所有源
        if (this.allowedOrigins.includes('*')) {
            return true;
        }

        // 检查是否在白名单中
        return this.allowedOrigins.some(allowed => {
            if (allowed.endsWith('*')) {
                const prefix = allowed.slice(0, -1);
                return origin.startsWith(prefix);
            }
            return origin === allowed;
        });
    }

    /**
     * 添加允许的源
     */
    public addAllowedOrigin(origin: string) {
        if (!this.allowedOrigins.includes(origin)) {
            this.allowedOrigins.push(origin);
        }
    }

    /**
     * 移除允许的源
     */
    public removeAllowedOrigin(origin: string) {
        const index = this.allowedOrigins.indexOf(origin);
        if (index > -1) {
            this.allowedOrigins.splice(index, 1);
        }
    }
}

/**
 * WalletClient 类
 * 用于在 iframe 页面中调用父窗口的钱包功能
 * 
 * 使用方法：
 * const client = new WalletClient();
 * await client.connect();
 */
export class WalletClient {
    private requestId: number = 0;
    private pendingRequests: Map<string, { resolve: Function, reject: Function }> = new Map();
    private statusCallbacks: Function[] = [];

    constructor() {
        this.setupMessageListener();
    }

    /**
     * 监听来自父窗口的响应
     */
    private setupMessageListener() {
        window.addEventListener('message', (event) => {
            const { type, data, requestId } = event.data;

            // 处理响应
            const pending = this.pendingRequests.get(requestId);
            if (pending) {
                if (type.endsWith('_ERROR')) {
                    pending.reject(new Error(data.error));
                } else {
                    pending.resolve(data);
                }
                this.pendingRequests.delete(requestId);
            }

            // 触发状态更新回调
            if (type === 'WALLET_STATUS_RESPONSE' || type === 'WALLET_CONNECT_RESPONSE') {
                this.statusCallbacks.forEach(callback => callback(data));
            }
        });
    }

    /**
     * 发送请求到父窗口
     */
    private sendRequest(type: string, data: any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            const reqId = `${type}_${++this.requestId}_${Date.now()}`;

            this.pendingRequests.set(reqId, { resolve, reject });

            window.parent.postMessage({
                type,
                data,
                requestId: reqId,
            }, '*');

            // 30秒超时
            setTimeout(() => {
                if (this.pendingRequests.has(reqId)) {
                    this.pendingRequests.delete(reqId);
                    reject(new Error('请求超时'));
                }
            }, 30000);
        });
    }

    /**
     * 初始化钱包
     */
    async init(): Promise<{ isInitialized: boolean }> {
        return this.sendRequest('WALLET_INIT');
    }

    /**
     * 连接钱包
     */
    async connect(): Promise<{ isConnected: boolean, address: string, chainId: number }> {
        return this.sendRequest('WALLET_CONNECT');
    }

    /**
     * 断开钱包
     */
    async disconnect(): Promise<{ success: boolean }> {
        return this.sendRequest('WALLET_DISCONNECT');
    }

    /**
     * 获取钱包状态
     */
    async getStatus(): Promise<{ isConnected: boolean, address: string, chainId: number, isInitialized: boolean }> {
        return this.sendRequest('WALLET_STATUS');
    }

    /**
     * 监听钱包状态变化
     */
    onStatusChange(callback: Function) {
        this.statusCallbacks.push(callback);
    }

    /**
     * 移除状态监听
     */
    offStatusChange(callback: Function) {
        const index = this.statusCallbacks.indexOf(callback);
        if (index > -1) {
            this.statusCallbacks.splice(index, 1);
        }
    }
}
