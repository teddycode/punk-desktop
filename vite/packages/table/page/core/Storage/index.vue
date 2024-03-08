<template>
  <div class="transaction-view">
    <div class="header-transaction">
      <router-link to="Market" class="btn-transaction" :class="{ active: this.$route.name === 'MarketPage' }"
        >链下存储区状态</router-link
      >
      <router-link to="Resource" class="btn-transaction" :class="{ active: this.$route.name === 'ResourcePage' }"
        >链下存储区资源提供者</router-link
      >
      <router-link to="Orders" class="btn-transaction" :class="{ active: this.$route.name === 'OrdersPage' }"
        >链下存储区用户</router-link
      >
    </div>
    <div class="content-transaction">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'offChainStorage',
  components: {},
};
</script>

<style scoped>
.transaction-view {
  display: flex;
  flex-direction: column;
  /*min-height: 100vh;*/
}
.header-transaction {
  margin: 20px;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  background-color: #2d3748;
}

.btn-transaction {
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  background-color: transparent;
  border-radius: 5px;
  margin-right: 15px;
  text-decoration: none; /* add this to remove the underline */
}

.btn-transaction.active {
  background-color: #4fd1c5; /* Use a brighter color for the active button */
  color: #f7fafc; /* Use a darker color for the text to make it stand out */
}
.content-transaction {
  flex: 1;
}
</style>
