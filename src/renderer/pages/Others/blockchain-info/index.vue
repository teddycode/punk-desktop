<template>
  <div class="blockchain-information">
    <div v-for="info in blockchainInfo" :key="info.title" class="info-box">
      <div class="icon-box">
        <i :class="info.icon" :style="{ color: info.iconColor }"></i>
      </div>
      <div class="text-box">
        <div class="title">{{ info.title }}</div>
        <div :style="{ color: info.iconColor }" class="number">{{ formatter(info.number) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "main-center-blockchain-info",
  data() {
    return {
      timers: [],
      blockchainInfo: [
        {title: "上一次出块时间", number: 10, icon: "fas fa-clock", iconColor: "yellow"},
        {title: "当前区块高度", number: 678932, icon: "fas fa-sort-amount-up", iconColor: "lightblue"},
        {title: "交易数量", number: 897328, icon: "fas fa-exchange-alt", iconColor: "red"},
      ],
    };
  },
  created() {
    let storedBlockchainInfo = localStorage.getItem('blockchainInfo');
    if (storedBlockchainInfo) {
      this.blockchainInfo = JSON.parse(storedBlockchainInfo);
    }

    this.timers.push(setInterval(this.updateData, 1000));
    let randomInterval = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
    setTimeout(this.updateTransaction, randomInterval);
  },
  beforeUnmount() {
    this.timers.forEach(timer => clearInterval(timer));
  },
  methods: {
    formatter(number) {
      const numbers = number.toString().split('').reverse()
      const segs = []
      while (numbers.length) segs.push(numbers.splice(0, 3).join(''))
      return segs.join(',').split('').reverse().join('')
    },
    updateData() {
      this.blockchainInfo[0].number = (this.blockchainInfo[0].number + 1) % 60;
      if (this.blockchainInfo[0].number === 0) {
        this.blockchainInfo[1].number += 1;
      }
      localStorage.setItem('blockchainInfo', JSON.stringify(this.blockchainInfo));
    },
    updateTransaction() {
      this.blockchainInfo[2].number += 1;
      localStorage.setItem('blockchainInfo', JSON.stringify(this.blockchainInfo));
      let randomInterval = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
      setTimeout(this.updateTransaction, randomInterval);
    }
  },
};
</script>
<style scoped>
.blockchain-information {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  height: 15%;
  color: white;
  gap: 10px; /* Add gaps between the boxes */
}

.info-box {
  display: flex;
  width: 30%;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: rgba(35, 72, 135, 0.4); /* Slightly lighter than the background */
  border-radius: 5px; /* Optional, add some rounded corners */
}

.icon-box {
  width: 40%;
  display: flex;
  justify-content: center;
  font-size: 2em;
}

.text-box {
  width: 60%;
}

.text-box .title {
  text-align: center;
}

.text-box .number {
  text-align: center;
  font-size: 2em;
}
</style>
