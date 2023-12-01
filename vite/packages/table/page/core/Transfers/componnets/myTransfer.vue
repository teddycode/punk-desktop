<template>
  <background>
    <div class="transaction-view">
      <div class="header-transaction">
        <router-link
          :class="{ active: $route.path === '/myTransfer/TransferMain' }"
          class="btn-transaction"
          to="/myTransfer/TransferMain"
          >转账
        </router-link>
        <router-link
          :class="{ active: $route.path === '/myTransfer/TransferRecord' }"
          class="btn-transaction"
          to="/myTransfer/TransferRecord"
          >转账记录
        </router-link>
      </div>
      <div class="content-transaction">
        <router-view></router-view>
      </div>
    </div>
  </background>
</template>

<script>
import Background from '@page/core/components/Background.vue';

export default {
  name: 'myTransfer',
  components: {
    Background,
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
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.btn-transaction {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  background-color: transparent;
  color: #1f2937;
  border-radius: 5px;
  margin-right: 15px;
  text-decoration: none; /* add this to remove the underline */
}

.btn-transaction.active {
  background-color: #34d399;
  color: #f9fafb;
}

.content-transaction {
  flex: 1;
}
</style>
