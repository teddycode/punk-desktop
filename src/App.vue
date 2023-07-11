<template>
    <div class="app">
        <header class="header">
            <img class="logo" src="./assets/logo.png" alt="Ethereum">
            <nav class="nav">
                <ul>
                    <li v-for="item in menuItems" :key="item.id" :class="{ active: item.isActive }">
                        <a v-if="item.label === '钱包'" href="#" @click="toggleWalletSelector">{{ item.label }}</a>
                        <router-link v-else :to="item.url">{{ item.label }}</router-link>
                    </li>
                    <li v-if="isLoggedIn">
                        <a href="#" @click="logout">登出</a>
                    </li>
                    <li v-else>
                        <router-link to="/myLogin">登录</router-link>
                    </li>
                </ul>
            </nav>
        </header>
        <div class="content">
            <div class="help-box" @mouseover="floatLeft" @mouseout="floatRight">
                <span class="help-text">Can I help you?</span>
            </div>
        </div>
        <router-view></router-view>
        <div v-if="showWalletSelector" class="overlay" @click="showWalletSelector = false">
            <myWallet></myWallet>
        </div>
        <footer class="footer">
            <p>&copy; 2023 Ethereum Foundation. All rights reserved.</p>
        </footer>
    </div>
</template>

<script>
import myWallet from "@/components/myWallet.vue";
export default {
    name: 'App',
    components: {
        myWallet
    },
    data() {
        return {
            menuItems: [
                { id: 1, label: '主页', url: '/' },
                { id: 2, label: '关于', url: '/myAbout' },
                { id: 3, label: '社区', url: '#' },
                { id: 4, label: '语言选择', url: '#' },
                { id: 5, label: '钱包', url: '#' },
                { id: 6, label: '系统设置', url: '#' },
            ],
            isLoggedIn:false,
            showWalletSelector: false,
        };
    },
    methods: {
        floatLeft() {
            const helpBox = document.querySelector('.help-box');
            helpBox.classList.add('float-left');
        },
        floatRight() {
            const helpBox = document.querySelector('.help-box');
            helpBox.classList.remove('float-left');
        },
        logout() {
            this.isLoggedIn = false;
            this.$router.push('/');
        },
        toggleWalletSelector() {
            this.showWalletSelector = !this.showWalletSelector;
        },
    },
};
</script>

<style>
body, html {
    height: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
}
.app {
    font-family: Arial, sans-serif;
    text-align: center;
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
}
.content {
    flex: 1;
}
.header {
    background-color: #383b47;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo {
    width: 100px;
    height: auto;
}

.nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
}

.nav li {
    margin-right: 20px;
}

.nav a {
    text-decoration: none;
    color: #fff;
    font-size: 16px;
    transition: color 0.3s;
}

.nav a:hover {
    color: #ccc;
}

.nav .active a {
    color: #ccc;
}
.help-box {
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    padding: 10px;
    background-color: #3aafa9;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: right 0.3s;
}

.help-box.float-left {
    right: 20px;
}

.help-text {
    color: #fff;
}

.footer {
    display: grid;
    background-color: #f8f8f8;
    padding: 20px;
    text-align: center;
    color: #888;
;
}

</style>

