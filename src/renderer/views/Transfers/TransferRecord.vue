<template>
  <div class="transfer-record">
    <h2>转账记录</h2>
    <ul>
      <li v-for="record in transferRecords" :key="record.id">
        <div class="record-item">
          <div class="record-field">From:</div>
          <div>{{ record.blockchainFrom }}</div>
        </div>
        <div class="record-item">
          <div class="record-field">To:</div>
          <div>{{ record.blockchainTo }} - {{ record.addressTo }}</div>
        </div>
        <div class="record-item">
          <div class="record-field">Token:</div>
          <div>{{ record.tokenFrom }}</div>
        </div>
        <div class="record-item">
          <div class="record-field">Amount:</div>
          <div>{{ record.amountFrom }}</div>
        </div>
        <div class="record-item">
          <div class="record-field">Date:</div>
          <div>{{ record.date }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  computed: {
    transferRecords() {
      return this.$store.state.transferRecords;
    },
  },
};
</script>

<style scoped>
.transfer-record {
  margin-top: 30px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background-color: #f5f7fa;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.record-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.record-field {
  font-weight: bold;
  margin-right: 5px;
}
</style>
