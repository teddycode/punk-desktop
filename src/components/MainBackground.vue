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
        <div class="data-content-main-background">
            <div class="data-main-main-background">
                <div class="main-center-main-background" >
                    <dv-border-box10 class="main-center-transactions">
                        <slot/>
                    </dv-border-box10>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Topnav from "@/components/topnav/index.vue";
import LoginButton from "@/components/buttons/loginButton.vue";
import myWallet from "@/components/myWallet.vue";
import searchBar from "@/components/searchBar.vue";
import TaskBar from "@/views/TaskBar.vue";

export default {
    name: "myHeader",
    components: {
        searchBar,
        myWallet, LoginButton, Topnav,TaskBar
    },
    computed:{
        openedPages() {
            return this.$store.state.openedPages;
        },
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
.data-content-main-background {
    margin-left: 8%;
    height:850px;
    padding-bottom: 20px;
    .data-main-main-background {
        width: calc(100% - 40px);
        margin-bottom: 40px;
        margin-left: 20px;
        height: 850px;
        .main-center-main-background {
            float: left;
            width: 100%;
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
    }
}

</style>