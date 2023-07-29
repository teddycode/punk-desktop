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
        <my-wallet v-if="showWalletSelector && !userLoggedIn" @close="toggleWalletSelector"></my-wallet>
    </div>
</template>


<script>
import myWallet from "@/components/myWallet.vue";
import { mapGetters } from "vuex";

export default {
    name: "walletButton",
    components:{
        myWallet,
    },
    data(){
        return{
            showWalletSelector: false,
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
    methods: {
        buttonClick() {
            if (!this.userLoggedIn) {
                this.toggleWalletSelector();
            }
        },
        toggleWalletSelector() {
            this.showWalletSelector = !this.showWalletSelector;
        },
    }
}
</script>

<style scoped>
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
</style>
