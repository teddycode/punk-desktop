<template>
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
            <my-wallet></my-wallet>
            <!-- 插槽，这里将放入各个页面的内容 -->
            <slot/>
        </div>
</template>

<script>
import Topnav from "@/components/topnav/index.vue";
import LoginButton from "@/components/buttons/loginButton.vue";
import myWallet from "@/components/myWallet.vue";

export default {
    name: "myHeader",
    components: {myWallet, LoginButton, Topnav}
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
    width: 100%;
    min-height: 100vh;
}
</style>