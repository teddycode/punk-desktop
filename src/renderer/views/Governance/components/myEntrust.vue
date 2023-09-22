<template>
  <div class="entrust-container">
    <h1 class="entrust-title">委托</h1>
    <div class="input">
      <p class="text">输入地址</p>
      <input v-model="inputAddress" class="custom-input" type="text">
    </div>

    <addnode-button @click="delegate">委托</addnode-button>
  </div>
</template>

<script>
import addnodeButton from "@/components/buttons/addnodeButton.vue"; // 请确保路径是正确的
import {tokenPower} from "@//views/Governance/components/function/address";

export default {
  name: "myEntrust",
  components: {
    addnodeButton
  },
  data() {
    return {
      inputAddress: "",
    }
  },
  methods: {
    async delegate() {
      await tokenPower.delegate(this.inputAddress);
      alert("委托成功");
    }
  }
}
</script>

<style scoped>
.entrust-container {
  text-align: center;
}

.entrust-title {
  color: white;
  font-size: 1.5rem;
  margin-top: 5%;
  margin-bottom: 5%;
}

.input {
  color: white;
  font-size: 1rem;
}

.custom-input {
  box-sizing: border-box; /* Ensures padding and border are included in the total width */
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

.text {
  display: inline-block;
  margin-right: 10px;
}

.entrust-person {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 2%;
}
</style>
