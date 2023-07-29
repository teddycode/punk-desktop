<template>
    <div class="dropdown-container-wallet">
        <el-dropdown trigger="click" size="small">
            <el-button class="btn btn-moving-gradient btn-moving-gradient--blue" type="primary" @click="buttonClick">
                {{ buttonLabel }}
            </el-button>
            <template #dropdown v-if="userLoggedIn">
                <el-dropdown-menu class="el-dropdown-menu-login">
                    <el-dropdown-item class="el-dropdown-menu__item" @click="navigateToUserProfile">个人信息</el-dropdown-item>
                    <el-dropdown-item class="el-dropdown-menu__item" @click="logout">登出</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
    <transition name="slide">
        <div v-if="showWalletSelector" class="wallet-selector" @click.stop>
            <h3 v-if="!userLoggedIn">选择钱包</h3>
            <ul class="wallet-list" v-if="!userLoggedIn">
                <li v-for="wallet in wallets" :key="wallet.name" @click="openWalletLink(wallet)" :class="{ 'selected-wallet': selectedWallet === wallet, 'hovered-wallet': hoveredWallet === wallet }">
                    <img :src="require(`@/assets/${wallet.icon}`)" alt="wallet-icon">
                    {{ wallet.name }}
                </li>
            </ul>
            <div v-else>
                <h4>Connected to MetaMask</h4>
                <p class="address">
                    Address: {{ userAddress }}
                    <button class="copy-btn" @click="copyToClipboard(userAddress)">复制</button>
                </p>
                <p>Balance: {{ userBalance }} GoerliETH
                    <button class="copy-btn" @click="copyToClipboard(userBalance)">复制</button>
                </p>
                <button class="logout-btn" @click="logout">登出</button>
            </div>
        </div>
    </transition>
    <div v-if="showWalletSelector" class="overlay" @click="toggleWalletSelector"></div>
</template>

<script>
import {Web3} from "web3";
import {mapGetters} from "vuex";

export default {
    name: "myWallet",
    props: {
        show: {
            type: Boolean,
            required: true
        }
    },
    emits: ['close','walletLogout','walletLogin'],
    data() {
        return{
            showWalletSelector: false,
            wallets: [
                { name: 'Metamask', icon: 'metamask.jpeg',link: 'https://metamask.io' },
                { name: 'imToken', icon: 'imtoken.jpeg',link: 'https://token.im' },
                { name: 'Trust Wallet', icon: 'trustwallet.png', link: 'https://trustwallet.com' }
            ],
            userAddress: '',
            userBalance: '0',
            userLoggedIn:false,
            web3: null,
        }
    },
    computed: {
        ...mapGetters([
            "userAddress",
            "userLoggedIn"
        ]),
        buttonLabel() {
            if (this.userLoggedIn && this.userAddress) {
                return this.userAddress.slice(0,6) + '...' + this.userAddress.slice(-4);
            } else {
                return '连接钱包';
            }
        }
    },
    beforeRouteEnter(to, from, next) {
        if (typeof window.ethereum !== 'undefined') {
            const web3 = new Web3(window.ethereum);
            next(vm => {
                vm.web3 = web3;
                vm.loadUserData();
            });
        }
    },
    beforeMount() {
        // Create a Web3 instance and connect to the network
        this.web3 = new Web3('https://goerli.infura.io/v3/b8feaebcfe234f0c83af0e97c070e5f5');
        //this.$store.state.userLoggedIn = localStorage.getItem('userLoggedIn');
    },
    created:function() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            this.loadUserData();
        } else {
            alert('Metamask is not installed. Please consider installing it: https://metamask.io');
        }
    },
    methods:{
        buttonClick() {
            if (!this.userLoggedIn) {
                this.toggleWalletSelector();
            }
        },
        toggleWalletSelector() {
            this.showWalletSelector = !this.showWalletSelector;
        },
        async loadUserData() {
            console.log('loadUserData!!!');
            let loggedIn = this.$store.state.userLoggedIn;
            if (loggedIn) {
                console.log("重新登录123")
                this.userLoggedIn = true;
                this.userAddress = this.$store.state.userAddress;
                this.userBalance = await this.getBalance(this.userAddress);
            } else {
                // 尝试从localStorage中获取用户数据
                const storedAddress = localStorage.getItem('userAddress');
                if (storedAddress) {
                    this.userLoggedIn = true;
                    this.userAddress = storedAddress;
                    console.log("loadUserData:this.userAddress =" + this.userAddress);
                    console.log("loadUserData:this.userLoggedIn =" + this.userLoggedIn);
                    this.$store.dispatch('setLoggedIn', true);
                    this.$store.dispatch('setAddress', this.userAddress);
                    // 直接从网络获取用户余额，保证余额的实时性
                    this.userBalance = await this.getBalance(this.userAddress);
                    this.$store.dispatch('setBalance', this.userBalance);
                }
            }
        },
        async openWalletLink(wallet) {
            console.log('openWalletLink1');
            if (wallet.name === 'Metamask') {
                try {
                    this.userLoggedIn = true;
                    this.$store.dispatch('setLoggedIn', true);
                    localStorage.setItem('userLoggedIn', this.userLoggedIn);
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    this.userAddress = accounts[0];
                    localStorage.setItem('userAddress', this.userAddress);
                    this.$store.dispatch('setAddress', this.userAddress);

                    // 请求用户余额
                    this.userBalance = await this.getBalance(this.userAddress);
                    this.$store.dispatch('setBalance', this.userBalance);

                    // 加载用户数据
                    await this.loadUserData();
                    console.log('openWalletLink2');
                    this.$emit('walletLogin');
                } catch (error) {
                    console.error(error);
                    console.log('openWalletLink3');
                }
            } else {
                console.log('openWalletLink4');
                window.open(wallet.link, '_blank');
            }
            //this.showWalletSelector = false;
        },
        async getBalance(address) {
            try {
                this.web3.eth.net.isListening().then(() => {
                    this.web3.eth.getChainId().then((chainId) => {
                        if (chainId !== 5) {  // Chain ID for Goerli Test Network is 5
                            window.ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: '0x5' }]  // Switch to Goerli Test Network
                            }).catch((error) => console.log(error));
                        }
                    });
                });
                // 请求用户余额
                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [address, 'latest'],
                });
                // 将余额从wei转换为eth并保存
                return this.web3.utils.fromWei(balance, 'ether');
            } catch (error) {
                console.error(error);
            }
        },
        logout() {
            this.userLoggedIn = false;
            this.userAddress = '';
            this.userBalance = '0';
            this.$store.dispatch('setLoggedIn', false);
            this.$store.dispatch('setAddress', '');
            this.$store.dispatch('setBalance', '0');
            // 清除localStorage中的用户数据
            localStorage.removeItem('userAddress');
            // localStorage.removeItem('userLoggedIn');
            console.log("logout: " + this.$store.state.userLoggedIn);
            this.$emit('walletLogout');
            this.loadUserData();
            // this.showWalletSelector = false;
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                console.log('Copying to clipboard was successful!');
            }, function(err) {
                console.error('Could not copy text: ', err);
            });
        },
        closeWalletSelector() {
            this.$emit('close');
        },
    },
}
</script>

<style scoped>
/* Wallet Selector Styles */
.dropdown-container-wallet{
    top: 20px;
    right: 20px;
    position: absolute;
    margin-right: 10px;
}
.btn {
    font-family: Arial, Helvetica, sans-serif;
    text-transform: uppercase;
}

.btn:hover .btn-slide-show-text1 {
    margin-left: 65px;
}

.btn-moving-gradient {
    height: 35px;
    font-weight: 600;
    color: rgb(255, 255, 255);
    cursor: pointer;
    border: medium none;
    background-size: 300% 100%;
    border-radius: 50px;
}

.btn-moving-gradient:hover {
    transition: all 0.5s ease-in-out 0s;
    background-position: 100% 0px;
}

.btn-moving-gradient--blue {
    background-image: linear-gradient(90deg, rgb(61, 135, 255), rgb(190, 61, 255), rgb(126, 61, 255), rgb(58, 134, 255));
    box-shadow: rgb(190, 61, 255) 0px 4px 15px 0px;
}
.wallet-selector {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #F9FAFB;
    width: 300px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    z-index: 10;
    border-radius: 15px;
    max-height: 90vh;
    overflow-y: auto;
}

.wallet-selector h3 {
    margin: 0 0 20px;
    font-size: 18px;
}

.wallet-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.hovered-wallet {
    background-color: #f5f5f5;
}

.selected-wallet {
    background-color: #d4d4d4;
}
.wallet-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 10px;
    transition: background-color 0.3s;
}

.wallet-list li:hover,
.wallet-list li.selected-wallet {
    background-color: #d4d4d4;
}


.wallet-list img {
    width: 24px;
    height: 24px;
}
.logout-btn {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    background-color: #34D399;
    color: #F9FAFB;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    margin-top: 20px;
}
@keyframes slide-in {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

@keyframes slide-out {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(100%);
    }
}
.overlay {
    position: fixed;
    z-index: 5;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}
.address{
    word-break: break-all;
}
.copy-btn {
    margin-left: 5px;
    padding: 2px 6px;
    font-size: 14px;
    color: #fff;
    background-color: #34D399;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>