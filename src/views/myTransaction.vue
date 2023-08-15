<template>
    <MainBackground>
    <div class="transaction-view">
        <div class="header-transaction">
            <router-link to="/myTransaction/myExchange" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myExchange'}">兑换</router-link>
            <router-link to="/myTransaction/myToken" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myToken'}">代币</router-link>
            <router-link to="/myTransaction/myTrade" class="btn-transaction" :class="{active: $route.path === '/myTransaction/myTrade'}">流动性</router-link>
        </div>
        <div class="content-transaction">
            <router-view></router-view>
        </div>
    </div>
    </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
export default {
    name: 'myTransaction',
    components:{
        MainBackground
    },
};
</script>

<style scoped>
.transaction-view {
    display: flex;
    flex-direction: column;
    /*min-height: 100vh;*/
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
