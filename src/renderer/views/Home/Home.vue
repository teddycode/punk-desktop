<template>
    <div id="main" class="bg">
        <task-bar></task-bar>
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
                <div class="main-left">
                    <div class="main-left-top">
                        <div class="main-left-top-left">
                            <main-right-ad></main-right-ad>
                        </div>
                        <div class="main-left-top-right">
                            <main-center-button></main-center-button>
                        </div>
                    </div>
                    <div class="main-left-bottom">
                        <div class="bottom-div-left">
                            <desktop-management></desktop-management>
                        </div>
                        <div class="bottom-div-right">
                            <social-net></social-net>
                        </div>
                    </div>
                </div>
                <div class="main-right">
                    <div class="right-top-spacing"></div>
                    <main-right-swiper @featureClicked="onFeatureClicked"></main-right-swiper>
                    <div class="right-middle-spacing"></div>
                    <main-right-dapp></main-right-dapp>
                    <div class="right-bottom-spacing"></div>
                </div>
            </div>
            <div class="custom-div">
                <div class="custom-title">常用工具栏</div>
            </div>
        </div>
    </div>
</template>

<script>
import Topnav from "@/components/topnav/index.vue";
import LoginButton from "@/components/buttons/loginButton.vue";
import myWallet from "@/components/myWallet.vue";
import MainRightAd from "@/views/Home/components/main-right/messagebox.vue";
import MainRightSwiper from "@/views/Home/components/main-right/main-function-box.vue";
import DesktopManagement from "@/views/Home/components/main-left/center/index.vue";
import searchBar from "@/components/searchBar.vue";
import mainRightDapp from "@/views/Home/components/main-right/dapp-square.vue";
import MainCenterButton from "@/views/Home/components/main-center/bottom/index.vue";
import TaskBar from "@/views/TaskBar.vue";
import SocialNet from "@/views/SocialNet/index.vue";

export default {
    name: "myHeader",
    components: {
        MainCenterButton,
        mainRightDapp,
        DesktopManagement,
        searchBar,
        MainRightSwiper,
        MainRightAd,
        myWallet, LoginButton, Topnav,TaskBar,SocialNet
    },

    data(){
        return{
        }
    },
    computed: {
        openedPages() {
            return this.$store.state.openedPages;
        },
    },
    methods: {
        onFeatureClicked(feature) {
            console.log("onFeatureClicked received", feature);
            if (!this.openedPages.some(p => p.title === feature.title)) {
                this.$store.commit("ADD_PAGE",feature);
            }
            console.log("onFeatureClicked", this.openedPages);
        },
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
  background-image: url('@/assets/data/true.png');
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
    margin-left: 8%;
    height: 850px;
    padding-bottom: 20px;

    .data-main {
        width: calc(100% - 80px);
        margin-bottom: 40px;
        margin-left: 40px;
        height: 85%;

        .main-left {
            margin-right: 4%;
            float: left;
            width: 72%;
            height: 95%;
            .main-left-top {
                margin-bottom: 5%;
                height:65% ;
                display: flex;
                justify-content: space-between;
                .main-left-top-left {
                    width: 30%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-right: 5%; /* Added margin to the right side */
                }
                .main-left-top-right {
                    width: 65%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
            .main-left-bottom {
                height: 35%;
                display: flex;
                justify-content: space-between;
                .bottom-div {
                    width: 30%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
        .main-right {
            float: left;
            width: 24%;
            height: 95%;
            display: flex;
            flex-direction: column;

            .right-top-spacing,
            .right-bottom-spacing {
                flex: 1;  /* This represents 10% height */
            }

            main-right-swiper,
            main-right-dapp {
                flex: 3.5;  /* This represents 35% height */
            }

            .right-middle-spacing {
                flex: 1;  /* This represents 10% height */
            }
        }
    }
}
.custom-div {
    width: 80%;
    height: 10%;
    border: 1px solid white;
    border-radius: 10px;
    margin: 0 auto; /* Center the div */
    position: relative;

    .custom-title {
        font-size: 1.5rem;
        position: absolute;
        left: 10px;  // 你可以根据需要调整这个值
        top: 50%;
        transform: translateY(-50%);
        color: #5ab1ef;
    }
}
.bottom-div-right{
    width: 65%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>