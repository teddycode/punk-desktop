<template>
  <div class="liquidity-wrapper">
    <div class="liquidity-container">
      <!-- <h1 class="liquidity-title">添加流动性</h1> -->
      <div class="liquidity-content-top">
        <!-- Left Section -->
        <div class="liquidity-left">
          <h2 class="h2-1">选择币对</h2>
          <div class="token-pair">
            <label class="token-label tokenA">代币A</label>
            <div class="select-wrapper">
              <select v-model="selectedTokenA" class="custom-select">
                <option v-for="token in tokens" :key="token.value" :value="token.value" class="select-option">
                  {{ token.label }}
                </option>
              </select>
              <i class="fas fa-chevron-down select-icon"></i>
            </div>
          </div>
          <div class="token-pair">
            <label class="token-label tokenB">代币B</label>
            <div class="select-wrapper">
              <select v-model="selectedTokenB" class="custom-select">
                <option v-for="token in tokens" :key="token.value" :value="token.value" class="select-option">
                  {{ token.label }}
                </option>
              </select>
              <i class="fas fa-chevron-down select-icon"></i>
            </div>
          </div>
        </div>
        <!-- Right Section -->
        <div class="liquidity-right">
          <h2 class="h2-2">添加数额</h2>
          <div class="token-input">
            <input id="tokenA" v-model.number="inputAmountA" autocomplete="off" class="custom-input" type="number">
          </div>
          <div class="token-input">
            <input id="tokenB" v-model.number="inputAmountB" autocomplete="off" class="custom-input" type="number">
          </div>
        </div>
      </div>
      <!-- <div class="divider"></div> -->
      <div class="price-range-section">
        <h2 class="price-range-title">价格区间</h2>
        <div class="input-group">
          <div class="input-wrapper">
            <input v-model.number="priceLow" class="custom-input range-input" pattern="\d*" type="text">
            <span class="input-hint">MIN</span>
          </div>
          <div class="input-wrapper">
            <input v-model.number="priceUpper" class="custom-input range-input" pattern="\d*" type="text">
            <span class="input-hint">MAX</span>
          </div>
        </div>
      </div>
      <!-- <div class="divider"></div> -->
      <div class="liquidity-content-bottom">
        <h2 class="h2-3">选择池信息</h2>
        <div class="pool-info">
          <label class="fee-label">手续费</label>
          <div class="select-wrapper fee-wrapper">
            <select v-model="selectedFee" class="custom-select fee-select">
              <option v-for="fee in fees" :key="fee" class="select-option">{{ fee }}</option>
            </select>
            <i class="fas fa-chevron-down select-icon"></i>
          </div>
          <input v-model="hookAddress" class="custom-input hook-address-longer" placeholder="钩子地址" type="text"
                 @input="validateHookAddress">
        </div>
        <p v-if="addressError" class="error-message">无效的地址格式</p>
      </div>
      <addnode-button class="add-liquidity-button" @click="validateAndAdd">Add</addnode-button>
    </div>
  </div>
</template>

<script>
import addnodeButton from "@renderer/components/buttons/addnodeButton.vue";
import {addLiq} from "@pages/Exchange/function/addLiquidity";
import {limitOrderPoolKey} from "@pages/Exchange/function/address.js";
import {ethers} from "ethers";
// import { initializeWallet } from "@pages/Exchange/function/address";
export default {
  components: {
    addnodeButton
  },
  data() {
    return {
      tokens: [
        {label: 'ETH', value: 'ETH'},
        {label: 'BTC', value: 'BTC'},
        {label: 'BNB', value: 'BNB'},
        {label: 'ADA', value: 'ADA'},
        {label: 'DOGE', value: 'DOGE'},
        {label: 'XRP', value: 'XRP'},
        {label: 'USDC', value: 'USDC'},
        {label: 'DAI', value: 'DAI'},
        {label: 'token0', value: 'token0'},
        {label: 'token1', value: 'token1'},
      ],
      fees: ["动态", "0.04%", "0.2%", "1%"],
      selectedTokenA: '',
      selectedTokenB: '',
      selectedFee: '',
      hookAddress: '',
      inputAmountA: '',
      inputAmountB: '',
      priceLow: null,
      priceUpper: null,
      addressError: false,
      isAddButtonClicked: false,
      // wallets:null,
      ModifyPositionParams: {
        tickLower: 0,
        tickUpper: 0,
        liquidityDelta: 0,
      }
    };
  },
  watch: {
    hookAddress(newVal) {
      if (newVal === '') {
        this.isAddButtonClicked = false;
        this.addressError = false;
      }
    },
  },
  methods: {
    validateHookAddress() {
      if (this.isAddButtonClicked) {
        const pattern = /^0x[a-fA-F0-9]{40}$/;
        this.addressError = !this.hookAddress.match(pattern);
      }
    },
    async validateAndAdd() {
      this.isAddButtonClicked = true;
      this.validateHookAddress();
      if (!this.addressError) {
        console.log('begin addLiq')
        console.log('priceLow: ', this.priceLow)
        console.log('priceUpper: ', this.priceUpper)
        if (this.selectedTokenA === 'token0' && this.selectedTokenB === 'token1') {
          console.log('inputAmountA:', this.inputAmountA);
          console.log('inputAmountB:', this.inputAmountB);
          try {
            await addLiq(this.priceLow, this.priceUpper, ethers.utils.parseUnits(this.inputAmountA.toString(), 18), ethers.utils.parseUnits(this.inputAmountB.toString(), 18), limitOrderPoolKey)
            alert("添加流动性成功")
          } catch (err) {
            console.log(err)
            alert("添加流动性失败")
          }
        } else if (this.selectedTokenA === 'token1' && this.selectedTokenB === 'token0') {
          console.log('inputAmountA:', this.inputAmountB);
          console.log('inputAmountB:', this.inputAmountA);
          try {
            await addLiq(this.priceLow, this.priceUpper, ethers.utils.parseUnits(this.inputAmountB.toString(), 18), ethers.utils.parseUnits(this.inputAmountA.toString(), 18), limitOrderPoolKey)
            alert("添加流动性成功")
          } catch (err) {
            console.log(err)
            alert("添加流动性失败")
          }
        } else {
          alert('暂时不支持tokenA,tokenB以外的代币对！')
        }
      }
    }
  }
}
</script>

<style scoped>
.liquidity-wrapper {
  border-radius: 10px;
  padding: 2%;
  max-width: 90%;
  margin: 1px auto;
  border: 1px solid white;
  background-color: transparent;
}

.liquidity-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.liquidity-title {
  color: white;
  font-size: 0.5rem;
  margin-bottom: 3%;
}

.liquidity-content-top {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 5%;
}

.liquidity-left, .liquidity-right {
  flex: 0.5;
  display: flex;
  flex-direction: column;
  gap: 2%;
  align-items: center; /* Added this to center the elements horizontally */
}

.h2-3 {
  color: white;
  font-size: 0.5rem;
  margin-bottom: 1%;
}

.h2-1 {
  color: white;
  font-size: 0.5rem;
  margin-bottom: 1%;
  text-align: left;
  margin-left: 20%;
}

.h2-2 {
  color: white;
  font-size: 0.5rem;
  margin-bottom: 1%;
  text-align: left;
  margin-left: -10%;
}

.token-pair, .token-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1%;
  margin-bottom: 5%;
}

.custom-select {
  margin-left: 5%;
  box-sizing: border-box; /* Ensures padding and border are included in the total width */
  width: 95%;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 5px;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.custom-input {
  box-sizing: border-box; /* Ensures padding and border are included in the total width */
  width: 90%;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 5px;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.custom-select {
  -webkit-appearance: none; /* Removes default chrome and safari appearance */
  -moz-appearance: none; /* Removes default Firefox appearance */
  appearance: none; /* Removes default appearance for rest of the browsers */
  padding-right: 30px; /* To account for the space taken by the dropdown arrow in select boxes */
  position: relative;
}

.select-icon {
  color: white;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* This makes sure the icon doesn't interfere with the select functionality */
}

.select-wrapper {
  width: 85%;
  position: relative;
  display: inline-block;
}

.fee-wrapper {
  width: 60%; /* Adjusted width for the fee select wrapper */
  position: relative;
  display: inline-block;
  /*margin-right: 5%;*/
}

.fee-select {
  width: 95%;
}

.hook-address-longer {
  width: 100%;
}

.custom-select:hover, .custom-input:hover {
  border-color: #007bff;
}

.custom-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.select-option {
  color: white;
  background-color: #2D3748;
}

.token-label {
  color: white;
  /*margin-right: 2%;*/
}

.divider {
  width: 80%;
  height: 1px;
  background-color: white;
  margin: 2% 0;
}

.liquidity-content-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2%;
  width: 100%;
  margin-bottom: 5%;
}

.pool-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 2%;
}

.fee-label {
  color: white;
  width: 12%;
  /*margin-right: 2%;*/
}

.error-message {
  color: red;
  font-size: 0.5rem;
  padding: 2px 0; /* 将 padding 调整为更小的值来适应文本内容 */
  width: 100%;
  text-align: center;
  line-height: 1.2; /* 调整行高 */
  display: inline-block; /* 设置为 inline-block 使其仅占据文本内容的空间 */
  margin-top: 5px;
}

.add-liquidity-button {
  margin-bottom: 1%;
}

.price-range-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2%;
  width: 100%;
  /*margin-bottom: 2%;*/
}

.price-range-title {
  color: white;
  font-size: 0.5rem;
  margin-bottom: 1%;
}

.input-wrapper {
  position: relative;
  width: 48%;
  margin-bottom: 2%;
}

.input-group {
  display: flex; /* 设置为 flex 布局，使两个输入框位于同一行 */
  justify-content: space-between; /* 在两个输入框之间留有一定的间距 */
  width: 80%; /* 宽度可以根据需要调整 */
}

.range-input {
  box-sizing: border-box;
  width: 100%;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 8px 12px 8px 12px;
  border-radius: 4px;
  font-size: 5px;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.input-hint {
  color: white;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.hook-address-longer {
  margin-right: 2%;
}
</style>
