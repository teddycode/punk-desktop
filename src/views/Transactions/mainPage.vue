<template>
    <MainBackground>
        <div class="container">
        <div class="left-panel"></div>
        <div class="middle-panel">
            <div class="middle-top"></div>
            <div class="middle-bottom">
                <div class="transaction-view">
        <div class="header-transaction">
            <router-link to="/myTransaction/myExchange" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myExchange'}">兑换</router-link>
            <router-link to="/myTransaction/myToken" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myToken'}">代币</router-link>
            <router-link to="/myTransaction/myTrade" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myTrade'}">流动性</router-link>
            <router-link to="/myTransaction/limitOrder" class="btn-transaction" :class="{active: $route.path === '/myTransaction/limitOrder'}">限价单</router-link>
            <router-link to="/myTransaction/myOrder" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myOrder'}">订单</router-link>
            <router-link to="/myTransaction/mainPage" class="btn-transaction" :class="{active: $route.path === '/myTransaction/mainPage'}">全局</router-link>
        </div>
        <div class="content-transaction">
            <router-view></router-view>
        </div>
    </div>
            </div>
        </div>
        <div class="right-panel">
            <div class="right-top">
                <TokenPage class="full-size"></TokenPage>
            </div>
            <div class="right-bottom">
                <myOrder class="full-size"></myOrder>
            </div>
        </div>
    </div>
    </MainBackground>
</template>

<script>
//import myOrder from "./Transactions/myOrder.vue";
//import TokenPage from "./Transactions/myToken.vue";
import myOrder from "./myOrder.vue";
import TokenPage from "./myToken.vue";
import MainBackground from "@/components/MainBackground.vue";
export default {
    name: 'myTransaction',
    components:{
        MainBackground,
        myOrder,
        TokenPage,
    },
    //export div class="transaction-view" part

    //export div class="header-transaction" part
    
};
</script>

<style scoped>
.container {
    display: flex;
    height: 100vh;
    width: 100vw;
}
.left-panel {
    width: 20%;  /* 20% */
    /* background-color: #f5f5f5; */
    background-image: url('@/assets/leftpic.png');
    background-size: cover;
    display: flex;
    background-repeat: no-repeat;
}
.middle-panel {
    width: 60%;  /* 60% */
    display: flex;
    flex-direction: column;
}
.right-panel {
    width: 20%;  /* 20% */
    display: flex;
    flex-direction: column;
}
.middle-top {
    height: 50%;
    background-image: url('@/assets/middleup.png');
    background-size: cover;
    background-repeat: no-repeat;
    
}
.middle-bottom {
    /* flex: 1;  50% */
    height: 50%;
    /* background-color: #f5f5f5; */
}
.right-top {
    height: 50%;  /* 50% */
}
.right-bottom {
    height: 50%;  /* 50% */
}
.transaction-view {
    display: flex;
    flex-direction: column;
    /*min-height: 100vh;*/
}
.full-size {
    width: 100%;
    height: 100%;
}
.header-transaction {
    margin:20px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 20px;
    background-color: #2D3748;
}

.btn-transaction {
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    background-color: transparent;
    border-radius: 5px;
    margin-right: 15px;
    text-decoration: none;  /* add this to remove the underline */
}

.btn-transaction.active {
    background-color: #4FD1C5; /* Use a brighter color for the active button */
    color: #F7FAFC; /* Use a darker color for the text to make it stand out */
}
.content-transaction {
    flex: 1;
}
</style>
