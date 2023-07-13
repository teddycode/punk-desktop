<template>
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
                <p class="address">Address: {{ userAddress }}</p>
                <p>Balance: {{ userBalance }} GoerliETH</p>
                <button class="logout-btn" @click="logout">登出</button>
            </div>
        </div>
    </transition>
    <div v-if="showWalletSelector" class="overlay" @click="showWalletSelector = false"></div>
</template>

<script>
import {Web3} from "web3";

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
            showWalletSelector: true,
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
        async loadUserData() {
            console.log('loadUserData!!!');
            let loggedIn = this.$store.state.userLoggedIn;
            if (loggedIn) {
                this.userLoggedIn = true;
                this.userAddress = this.$store.state.userAddress;
                this.userBalance = await this.getBalance(this.userAddress);
            }
        },
        async openWalletLink(wallet) {
            console.log('openWalletLink1');
            if (wallet.name === 'Metamask') {
                try {
                    this.userLoggedIn = true;
                    this.$store.dispatch('setLoggedIn', true);
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    this.userAddress = accounts[0];
                    this.$store.dispatch('setAddress', this.userAddress);

                    // 请求用户余额
                    this.userBalance = await this.getBalance(this.userAddress);
                    this.$store.dispatch('setBalance', this.userBalance);

                    // 加载用户数据
                    this.loadUserData();
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

            // 加载用户数据
            this.$emit('walletLogout');
            this.loadUserData();
        }
    },
}
</script>

<style scoped>
/* Wallet Selector Styles */
.wallet-selector {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #fff;
    width: 300px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    z-index: 10;
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
    background-color: #34D399;  /* I've chosen a red color, feel free to change it */
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
    position: fixed; /* Fixed/sticky position */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
}
.address{
    word-break: break-all;
}
</style>