<template>
    <MainBackground>
    <div class="transaction-view">
        <div class="header-transaction">
            <router-link to="/myTransfer/TransferMain" class="btn-transaction" :class="{active: $route.path === '/myTransfer/TransferMain'}">转账</router-link>
            <router-link to="/myTransfer/TransferRecord" class="btn-transaction" :class="{active: $route.path === '/myTransfer/TransferRecord'}">转账记录</router-link>
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
    name: 'myTransfer',
    components:{
        MainBackground
    }
};
</script>

<style scoped>
.transaction-view {
    display: flex;
    flex-direction: column;
    /*min-height: 100vh;*/
}
.header-transaction {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 20px;
}

.btn-transaction {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    background-color: transparent;
    color: #1F2937;
    border-radius: 5px;
    margin-right: 15px;
    text-decoration: none;  /* add this to remove the underline */
}

.btn-transaction.active {
    background-color: #34D399;
    color: #F9FAFB;
}
.content-transaction {
    flex: 1;
}
</style>
