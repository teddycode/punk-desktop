<template>
    <div class="signup-page">
        <el-container class="signup-container">
            <el-card class="signup-card">
                <h1 class="signup-title">注册</h1>
                <el-form class="signup-form" :model="signupForm" :rules="rules" ref="signupForm" label-width="80px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="signupForm.username" prefix-icon="el-icon-user"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="signupForm.password" type="password" show-password prefix-icon="el-icon-lock"></el-input>
                    </el-form-item>
                    <el-form-item label="密码确认" prop="confirmPassword">
                        <el-input v-model="signupForm.confirmPassword" type="password" show-password prefix-icon="el-icon-lock"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="signupForm.email" prefix-icon="el-icon-message"></el-input>
                    </el-form-item>
                    <el-form-item label="公司" prop="company">
                        <el-input v-model="signupForm.company" prefix-icon="el-icon-office-building"></el-input>
                    </el-form-item>
                    <el-button type="primary" @click="register" class="signup-button">注册</el-button>
                    <p class="login-link">已有账号? <router-link to="/myLogin">点击登录!</router-link></p>
                </el-form>
            </el-card>
        </el-container>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            signupForm: {
                username: '',
                password: '',
                confirmPassword: '',
                email: '',
                company: ''
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请确认密码', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
                ],
                company: [
                    { required: false, message: '请输入公司名称', trigger: 'blur' }
                ]
            },
        };
    },
    methods: {
        async register() {
            if (this.signupForm.password !== this.signupForm.confirmPassword) {
                this.$message.error('两次输入的密码不一致，请检查并重新输入');
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
        }
    }
};
</script>

<style scoped>
.signup-page {
    background: url('@/assets/bg-2.jpg') no-repeat center center fixed;
    background-size: cover;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.signup-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.signup-card {
    width: 350px;
}

.signup-title {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 1em;
}

.signup-button {
    width: 100%;
    margin-top: 1em;
}
.login-link{
    margin-top: 20px;
}
</style>
