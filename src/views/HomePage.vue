<template>
    <dv-full-screen-container>
    <div id="main" class="bg">
        <div class="header">
            <div class="bg-header">
                <div class="t-title">
                    磐古
                </div>
            </div>
        </div>
        <topnav></topnav>
        <login-button></login-button>
        <wallet-button></wallet-button>
        <div class="data-content">
            <div class="data-main">
                <div class="main-left">
                    <div class="main-left-top">
                        <mywallet-info></mywallet-info>
                    </div>
                    <div class="main-left-bottom">
                    <dv-border-box10>left</dv-border-box10>
                    </div>
                </div>
                <div class="main-center">
                    <main-center-blockchain-info class="main-center-info"></main-center-blockchain-info>
                    <dv-border-box10 class="main-center-transactions">center</dv-border-box10>
                </div>
                <div class="main-right">
                    <main-right-swiper></main-right-swiper>
                    <main-right-ad></main-right-ad>
                </div>
            </div>
        </div>
    </div>
    </dv-full-screen-container>
</template>

<script>

import Topnav from "@/components/topnav/index.vue";
import MainRightSwiper from "@/views/main-right/main-right-swiper.vue";
import MainCenterBlockchainInfo from "@/views/main-center/main-center-blockchain-info/index.vue";
import MywalletInfo from "@/views/main-left/main-left-top/index.vue";
import WalletButton from "@/components/buttons/walletButton.vue";
import MainRightAd from "@/views/main-right/main-right-ad.vue";
import LoginButton from "@/components/buttons/loginButton.vue";

export default {
    name: 'HomePage',
    components: {LoginButton, MainRightAd, WalletButton, MywalletInfo, MainCenterBlockchainInfo, MainRightSwiper, Topnav,},

    data() {
        return {
            isSearchActive:false,
        }
    },
    methods: {
    }
}
</script>

<style lang="scss">
.header {
    width: 100%;
    height: 80px;
    padding: 0 20px;
    .bg-header {
        width: 100%;
        height: 80px;
        background: url(@/assets/data/title.png) no-repeat;
        background-size: 100% 100%;
        .t-title {
            width: 100%;
            height: 100%;
            text-align: center;
            font-size: 2em;
            line-height: 80px;
            color: #fff;
        }
    }
}

#main {
    background-image: url('../assets/data/true.png');
    background-size: cover;
    width: 100%;
    height: 100%;
}

.host-body {
    padding: 1rem;
}
.title-text{
    color: white;
    font-size: xx-large;
}
.data-content {
    padding-bottom: 20px;
    .data-main {
        width: calc(100% - 40px);
        margin-bottom: 40px;
        margin-left: 20px;
        height: 720px;

        .main-left {
            width: 24%;
            float: left;
            height: 95%;
        }
        .main-left-top{
            height: 30%;
            padding-bottom: 5%;
        }
        .main-left-bottom{
            height: 70%;
        }
        .main-center {
            float: left;
            width: 52%;
            padding: 0 20px 0 20px;
            height: 95%;
        }.main-center-transactions{
             height: 85%;
         }
        .main-center-info{
            height: 15%;
        }
        .main-right {
            float: left;
            width: 24%;
            height: 80%;
        }
    }
}
.ad{
    color: white;
    height: 80%;
}

</style>