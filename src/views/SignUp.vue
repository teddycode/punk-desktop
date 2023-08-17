<template>
    <MainBackground>
        <div class="signup-page">
            <div class="signup-card">
                <h1 class="signup-title">注册</h1>
                <form class="signup-form" @submit.prevent="register" autocomplete="off">
                    <div class="form-item" :class="{ 'input-error': usernameError }">
                        <label for="username">用户名</label>
                        <div class="input-with-icon">
                            <font-awesome-icon icon="user" class="input-icon" />
                            <input id="username" v-model="signupForm.username" type="text" placeholder="必填" @input="checkUsername"/>
                        </div>
                    </div>
                    <div class="form-item" :class="{ 'input-error': passwordError }">
                        <label for="password">密码</label>
                        <div class="input-with-icon">
                            <font-awesome-icon icon="lock" class="input-icon" />
                            <input v-model="signupForm.password" :type="showPassword ? 'text' : 'password'" placeholder="必填" @input="checkPassword"/>
                            <font-awesome-icon :icon="showPassword ? 'eye' : 'eye-slash'" class="toggle-icon" @click="togglePasswordVisibility" />
                        </div>
                    </div>
                    <div class="form-item" :class="{ 'input-error': confirmPasswordError }">
                        <label for="confirmPassword">密码确认</label>
                        <div class="input-with-icon">
                            <font-awesome-icon icon="lock" class="input-icon" />
                            <input v-model="signupForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="必填"  @input="checkConfirmPassword"/>
                            <font-awesome-icon :icon="showConfirmPassword ? 'eye' : 'eye-slash'" class="toggle-icon" @click="toggleConfirmPasswordVisibility" />
                        </div>
                    </div>
                    <div class="form-item" :class="{ 'input-error': emailError }">
                        <label for="email">邮箱</label>
                        <div class="input-with-icon">
                            <font-awesome-icon icon="envelope" class="input-icon" />
                            <input id="email" v-model="signupForm.email" type="email" placeholder="必填"  @input="checkEmail"/>
                        </div>
                    </div>
                    <div class="form-item">
                        <label for="company">公司</label>
                        <div class="input-with-icon">
                            <font-awesome-icon icon="building" class="input-icon" />
                            <input id="company" v-model="signupForm.company" type="text" />
                        </div>
                    </div>
                    <addnode-button type="submit" class="signup-button">注册</addnode-button>
                    <p class="login-link">已有账号? <router-link to="/myLogin">点击登录!</router-link></p>
                </form>
            </div>
        </div>
    </MainBackground>
</template>

<script>
import axios from "axios";
import MainBackground from "@/components/MainBackground.vue";
import addnodeButton from "@/components/buttons/addnodeButton.vue";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faLock, faEnvelope, faBuilding, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
library.add(faUser, faLock, faEnvelope, faBuilding, faEye, faEyeSlash)

export default {
    components: { MainBackground, addnodeButton },
    data() {
        return {
            signupForm: {
                username: '',
                password: '',
                confirmPassword: '',
                email: '',
                company: null,
            },
            showPassword: false,
            showConfirmPassword: false,
            usernameError: false,
            passwordError: false,
            confirmPasswordError: false,
            emailError: false
        };
    },
    methods: {
        checkUsername() {
            this.usernameError = this.signupForm.username.trim() === '';
        },
        checkPassword() {
            this.passwordError = this.signupForm.password.trim() === '';
        },
        checkConfirmPassword() {
            this.confirmPasswordError = this.signupForm.confirmPassword.trim() === '';
        },
        checkEmail() {
            this.emailError = this.signupForm.email.trim() === '';
        },
        async register() {
            this.usernameError = this.signupForm.username.trim() === '';
            this.passwordError = this.signupForm.password.trim() === '';
            this.confirmPasswordError = this.signupForm.confirmPassword.trim() === '';
            this.emailError = this.signupForm.email.trim() === '';

            if (this.usernameError || this.passwordError || this.confirmPasswordError || this.emailError) {
                alert('请确保所有必填项都已填写！');
                return;
            }

            if (this.signupForm.password !== this.signupForm.confirmPassword) {
                alert('两次输入的密码不一致，请检查并重新输入');
                return;
            }

            try {
                const response = await axios.post('http://localhost:8080/SignUp', {
                    username: this.signupForm.username,
                    password: this.signupForm.password,
                    email: this.signupForm.email,
                    company: this.signupForm.company
                });

                if (response.status === 200) {
                    this.$message.success('注册成功！');
                    this.$router.push('/myLogin');
                } else {
                    this.$message.error('注册失败');
                }
            } catch (error) {
                console.error(error);
                this.$message.error('注册失败');
            }
        },
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        toggleConfirmPasswordVisibility() {
            this.showConfirmPassword = !this.showConfirmPassword;
        }
    }
};
</script>

<style scoped>
.signup-page {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.signup-card {
    width: 400px;
    background-color: transparent;
    border: 1px solid white;
    padding: 20px;
    border-radius: 10px;
}

.signup-title {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 1em;
}

.form-item {
    margin-bottom: 20px;
}

.form-item label {
    display: block;
    margin-bottom: 10px;
}

.form-item input {
    width: 100%;
    padding: 10px;
    border: 1px solid white;
    background-color: transparent;
    color: white;
    border-radius: 4px;
}

.register-link {
    margin-top: 20px;
    text-align: center;
}

.input-with-icon {
    position: relative;
}

.input-icon, .toggle-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.7);
}

.input-icon {
    left: 10px;
}

.toggle-icon {
    right: 10px;
    cursor: pointer;
}

.form-item input {
    padding-left: 30px;
    padding-right: 30px;
}

.input-error input {
    border-color: red;
}
</style>
