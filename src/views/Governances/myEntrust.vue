<template>
    <div class="main">
        <router-link to="/myGovernance" class="back-button">
            <img src="@/assets/left-arrow.jpg" alt="Back">
            <span>返回</span>
        </router-link>
        <div class="input">
            <div class="input-wrapper">
                <h3>委托给</h3>
                <input type="text" id="wallet-address" class="input-address" v-model="walletAddress" @input="validateInput" placeholder="请输入正确的钱包地址">
                <p v-if="inputError" class="error-message">{{errorMessage}}</p>
            </div>
            <div class="hint-wrapper">
                <p>找不到您的委托人和代委托？请确保您已经连接到正确的网络。</p>
            </div>
            <button :disabled="!isValid" @click="submitInput">确认</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "myEntrust",
    data() {
        return {
            walletAddress: '',
            isValid: false,
            inputError: false,
            errorMessage: ''
        }
    },
    methods: {
        validateInput() {
            const pattern = /^0x[a-fA-F0-9]{40}$/;
            this.inputError = false;
            if (!pattern.test(this.walletAddress)) {
                this.inputError = true;
                this.isValid = false;
                this.errorMessage = '请输入正确的钱包地址';
            } else if (this.walletAddress === this.$store.state.userAddress) {
                this.inputError = true;
                this.isValid = false;
                this.errorMessage = '委托人不能是自己！';
            } else {
                this.isValid = true;
            }
            if(this.walletAddress.length===0){
                this.inputError = false;
            }
        },
        submitInput() {
            if (this.isValid) {
                // 执行后续操作
            }
        }
    }
}
</script>

<style scoped>
.main {
    min-height: 100vh;
    padding: 40px;
    background: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.back-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 20px;
    text-decoration: none;
    color: inherit;
    position: absolute;
    top: 20px;
    left: 20px;
}

.back-button img {
    width: 20px;
    height: 20px;
}

.back-button span {
    margin-left: 5px;
}
.input {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    width: 50%;
}

.input h3, p {
    text-align: center;
}

.input-wrapper, .hint-wrapper {
    border-radius: 20px;
    border: 1px solid #ccc;
    margin-bottom: 10px;
}

.input-wrapper {
    padding: 10px;
}

.input input[type="text"] {
    border: none;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 15px;
    margin-bottom: 10px;
    outline: none;
    border: 1px solid #ccc;
}

.input button {
    padding: 10px;
    border-radius: 20px;
    border: none;
    background-color: #007BFF;
    color: white;
    cursor: pointer;
    margin-top: 20px;
    opacity: 0.5;
    transition: opacity 0.3s;
}

.input button:disabled {
    cursor: not-allowed;
}

.input button:not(:disabled) {
    opacity: 1;
}

.error-message {
    color: red;
    border-top: 2px solid red;
    padding-top: 5px;
}
.input-address{
    font-size: large;
}
</style>
