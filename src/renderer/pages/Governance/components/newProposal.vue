<template>
    <div class="main">
      <!-- <router-link to="/myGovernance" class="back-button">
          <img src="@renderer/assets/left-arrow.jpg" alt="Back">
          <span>返回</span>
      </router-link> -->
      <form @submit.prevent="submitProposal">
        <!-- <div class="input-group">
            <label for="title">标题</label>
            <input class="custom-input" v-model="title" required>
        </div> -->
        <!-- <div class="input-group">
            <label for="description">简介</label>
            <textarea class="custom-input" v-model="description"></textarea>
        </div> -->
        <div class="input-group">
          <label for="title">类型</label>
          <input v-model="type" class="custom-input" required>
        </div>
        <div class="input-group">
          <label for="title">执行器</label>
          <input v-model="executor" class="custom-input" required>
        </div>
        <div class="input-group">
          <label for="title">目标</label>
          <input v-model="target" class="custom-input" required>
        </div>
        <div class="input-group">
          <label for="title">金额</label>
          <input v-model="value" class="custom-input" required>
        </div>
        <div class="input-group">
          <label for="title">签名</label>
          <input v-model="signature" class="custom-input" required>
        </div>
        <div class="input-group">
          <label for="title">载荷数据</label>
          <input v-model="calldata" class="custom-input" required>
        </div>
        <div class="input-group">
          <label for="title">代理调用</label>
          <input v-model="withdelgateCall" class="custom-input" required>
        </div>
        <div class="input-group">
          <label for="title">ipfs哈希</label>
          <input v-model="ipfsHash" class="custom-input" required>
        </div>
        <button type="submit">提交</button>
      </form>
    </div>
</template>

<script>
import MainBackground from "@components/common/MainBackground.vue";
import selfInfo from "./selfInfo.vue";
import {governance} from "@pages/Governance/services/address";
import {BigNumber} from "ethers";

export default {
  name: "NewProposal",
  components: {
    MainBackground, selfInfo,
  },
  data() {
    return {
      type: "",
      executor: "",
      target: "",
      value: "",
      signature: "",
      calldata: "",
      withdelgateCall: "",
      ipfsHash: "",
    }
  },
  methods: {
    async submitProposal() {
      // 检查用户是否已经登录
      if (!localStorage.getItem('userLoggedIn')) {
        // 用户未登录，显示提示
        alert("请先登录钱包，然后才能上传提案");
        return;
      }
      const tx = await governance.create(BigNumber.from(this.type), this.executor, this.target, this.value, this.signature, this.calldata, this.withdelgateCall, this.ipfsHash);
      const receipt = await tx.wait();
      // // 处理提交提案的逻辑
      // const endDate = new Date();
      // endDate.setDate(endDate.getDate() + 5);
      // const startDate = new Date();
      // axios.post("http://localhost:8080/Governances/newProposal", {
      //     author: this.$store.state.userAddress,
      //     title: this.title,
      //     content: this.description,
      //     status: "Waiting",
      //     votesPass: 0,
      //     votesAgainst: 0,
      //     endTime: endDate.toISOString().slice(0, 10),// 将日期转化为 'YYYY-MM-DD' 格式
      //     startTime: startDate.toISOString().slice(0, 10)
      // })
      //     .then(response => {
      //         console.log(response);
      //         this.$router.push('/myGovernance');
      //     })
      //     .catch(error => {
      //         console.log(error);
      //     });
    }
  }
}
</script>

<style scoped>
.main {
  min-height: 100vh;
  padding: 40px;
  background: transparent;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 20px;
  text-decoration: none;
  color: inherit;
}

.custom-input {
  box-sizing: border-box;
  /* Ensures padding and border are included in the total width */
  width: 70%;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 5px;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.back-button img {
  width: 20px;
  height: 20px;
}

.back-button span {
  margin-left: 5px;
}

.input-group {
  width: 80%;
  color: white;
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.input-group textarea {
  min-height: 200px;
}

button {
  padding: 10px 20px;
  background-color: #00a86b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #008552;
}
</style>
