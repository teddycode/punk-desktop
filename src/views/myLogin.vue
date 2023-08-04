<template>
    <div class="login-page">
        <el-container class="login-container">
            <el-card class="login-card">
                <h1 class="login-title">登录</h1>
                <el-form class="login-form" :model="loginForm" :rules="rules" ref="loginForm" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="loginForm.password" type="password" show-password prefix-icon="el-icon-lock"></el-input>
                    </el-form-item>
                    <el-button type="primary" @click="login" class="login-button">登录</el-button>
                    <p class="register-link">没有账号? <router-link to="/SignUp">点击注册!</router-link></p>
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
            loginForm: {
                username: '',
                password: '',
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        async login() {
            const valid = await this.$refs.loginForm.validate();
            if (!valid) return;

            try {
                const response = await axios.post('http://localhost:8080/myLogin', {
                    username: this.loginForm.username,
                    password: this.loginForm.password
                });

                if (response.status === 200) {
                    localStorage.setItem('token', response.data.token);
                    axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');
                    localStorage.setItem('userName', this.loginForm.username);
                    this.$store.commit('SET_TOKEN', response.data.token);
                    this.$router.push('/');
                } else {
                    this.$message.error('用户名或密码错误');
                }
            } catch (error) {
                console.error(error);
                this.$message.error('登录失败');
            }
        }
    }
};
</script>

<style scoped>
.login-page {
    background: url('@/assets/bg-2.jpg') no-repeat center center fixed;
    background-size: cover;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-card {
    width: 400px;
}

.login-title {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 1em;
}

.login-button {
    width: 100%;
    margin-top: 1em;
}
.register-link {
    margin-top: 20px;
}
</style>
