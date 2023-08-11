<template>
    <div id="main" class="bg">
        <div class="header">
            <div class="bg-header">
                <div class="t-title">磐古</div>
            </div>
            <topnav></topnav>
        </div>
        <login-button></login-button>
        <my-wallet></my-wallet>
        <div class="search-bar">
            <search-bar></search-bar>
        </div>
        <div class="data-content">
            <div class="data-main">
                <div :class="{'main-left': true, 'hidden': isLeftHidden}">
                    <!-- 左边栏开关 -->
                    <div class="main-left-top">
                        <mywallet-info></mywallet-info>
                    </div>
                    <div class="main-left-center">
                        <desktop-management></desktop-management>
                    </div>
                    <div class="main-left-bottom">
                        <together></together>
                    </div>
                </div>
                <div class="main-center" :style="{ width: mainCenterWidth }">
                    <dv-border-box10 class="main-center-transactions">
                        <div class="switch-container">
                            <div class="switch-left">
                                <el-switch v-model="isLeftHidden"  active-text="隐藏左边栏" inactive-text="显示左边栏"></el-switch>
                            </div>
                            <div class="switch-right">
                                <el-switch v-model="isRightHidden" active-text="隐藏右边栏" inactive-text="显示右边栏"></el-switch>
                            </div>
                        </div>
                        <main-center-button></main-center-button>
                    </dv-border-box10>
                </div>
                <div :class="{'main-right': true, 'hidden': isRightHidden}">
                    <!-- 右边栏开关 -->
                    <main-right-swiper></main-right-swiper>
                    <main-right-ad></main-right-ad>
                    <main-right-dapp></main-right-dapp>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Topnav from "@/components/topnav/index.vue";
import LoginButton from "@/components/buttons/loginButton.vue";
import myWallet from "@/components/myWallet.vue";
import MywalletInfo from "@/views/main-left/main-left-top/index.vue";
import Together from "@/views/main-left/main-left-bottom/index.vue";
import MainRightAd from "@/views/main-right/main-right-ad.vue";
import MainRightSwiper from "@/views/main-right/main-right-swiper.vue";
import DesktopManagement from "@/views/main-left/main-left-center/index.vue";
import searchBar from "@/components/searchBar.vue";
import mainRightDapp from "@/views/main-right/main-right-dapp.vue";
import {ElSwitch} from "element-plus";
import MainCenterButton from "@/views/main-center/main-center-bottom/index.vue";

export default {
    name: "myHeader",
    components: {
        MainCenterButton,
        mainRightDapp,
        DesktopManagement,
        searchBar,
        MainRightSwiper,
        MainRightAd,
        Together,
        myWallet, LoginButton, Topnav,MywalletInfo,ElSwitch
    },

    data(){
        return{
            isLeftHidden: false,
            isRightHidden: false
        }
    },
    computed: {
        mainCenterWidth() {
            if (this.isLeftHidden && this.isRightHidden) {
                return '100%';
            } else if (this.isLeftHidden || this.isRightHidden) {
                return '80%';
            }
            return '60%';
        }
    },
    methods: {
        toggleLeft() {
            this.isLeftHidden = !this.isLeftHidden;
        },
        toggleRight() {
            this.isRightHidden = !this.isRightHidden;
        }
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
    overflow: hidden;
    //min-width: 1600px;
    background-repeat: no-repeat; // 防止背景重复
    background-attachment: fixed; // 背景图像固定
    //min-width: 100vw;
    //min-height: 100vh; // 这确保主容器至少有视口的高度
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
.search-bar{
    display: flex;
    justify-content: center;
    align-items: center;
}
.data-content {
    height:850px;
    padding-bottom: 20px;
    .data-main {
        width: calc(100% - 40px);
        margin-bottom: 40px;
        margin-left: 20px;
        height: 850px;
        .main-left {
            overflow: hidden;
            width: 20%;
            float: left;
            height: 95%;
            transform: translateX(0);
            transition: transform 0.5s;
            &.hidden {
                transform: translateX(-110%);
                width: 0;
            }
        }
        .main-left-top{
            height: 30%;
            padding-bottom: 5%;
        }
        .main-left-center{
            height: 35%;
            padding-bottom: 5%;
            color: #3498da;
        }
        .main-left-bottom{
            height: 35%;
            color: #3498da;
        }
        .main-center {
            float: left;
            width: var(--main-center-width, 60%);
            transition: width 0.5s ease-in-out;
            padding: 0 20px 0 20px;
            height: 95%;
            .switch-container {
                margin: 10px  10px 0 10px;
                display: flex;
                justify-content: space-between;
                .switch-left {
                }
                .switch-right {
                }
            }
        }.main-center-transactions{
             overflow: auto;
             height: 100%;
         }
        .main-right {
            overflow: hidden;
            float: left;
            width: 20%;
            height: 95%;
            transform: translateX(0);
            transition: transform 0.5s;
            &.hidden {
                transform: translateX(110%);
                width: 0;
            }
        }
    }
}


</style>