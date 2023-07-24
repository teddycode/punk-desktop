<template>
    <div class="signup-page">
        <div class="signup-content">
            <h1>注册</h1>
            <form @submit.prevent="register" class="signup-form">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <input type="text" id="username" v-model="username" required>
                </div>
                <div class="form-group password-field">
                    <label for="password">密码</label>
                    <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required>
                    <i @click="togglePasswordVisibility" :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash' " class="password-icon"></i>
                </div>
                <div class="form-group password-field">
                    <label for="confirmPassword">确认密码</label>
                    <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword" required>
                    <i @click="toggleConfirmPasswordVisibility" :class="showConfirmPassword ? 'fas fa-eye' : 'fas fa-eye-slash' " class="password-icon"></i>
                </div>
                <div class="form-group">
                    <label for="email">邮箱</label>
                    <input type="email" id="email" v-model="email" required>
                </div>
                <div class="form-group">
                    <label for="company">公司 (选填)</label>
                    <input type="text" id="company" v-model="company">
                </div>
                <router-link to="/myLogin">已有账号?点击登录!</router-link>
                <button type="submit" class="submitSignUp">注册</button>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            company: '',
            showPassword: false,
            showConfirmPassword: false
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        toggleConfirmPasswordVisibility() {
            this.showConfirmPassword = !this.showConfirmPassword;
        },
        async register() {
            if (this.password !== this.confirmPassword) {
                alert('两次输入的密码不一致，请检查并重新输入');
                return;
            }
            try {
                const response = await axios.post('http://localhost:8080/SignUp', {
                    username: this.username,
                    password: this.password,
                    email: this.email,
                    company: this.company
                });

                if (response.status === 200) {
                    console.log("注册成功！");
                    this.$router.push('/myLogin');
                } else {
                    alert('注册失败');
                }
            } catch (error) {
                console.error(error);
                alert('注册失败');
            }
        }
    }
};
</script>

<style scoped>
.signup-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f1f1f1;
}

.signup-content {
    width: 400px;
    margin-top: -100px;
}

h1 {
    font-size: 28px;
    margin-bottom: 40px;
}

.signup-form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.form-group {
    margin-bottom: 20px;
    position: relative; /* make the div relative so the icon can be positioned absolutely inside it */
}

label {
    display: block;
    margin-bottom: 5px;
    font-size: 18px;
}

input {
    width: 100%;
    height: 40px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    font-size: 16px;
}

button {
    width: 100px;
    height: 40px;
    background-color: #3aafa9;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.password-icon {
    position: absolute;
    right: -50px;
    top: 60px;
    cursor: pointer;
    transform: translateY(-50%);
}
.submitSignUp{
     margin-top: 20px;
 }
</style>
