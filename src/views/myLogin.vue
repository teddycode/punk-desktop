<template>
    <div class="login-page">
        <div class="login-content">
            <h1>登录</h1>
            <form @submit.prevent="login" class="login-form">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <input type="text" id="username" v-model="username" required>
                </div>
                <div class="form-group password-field">
                    <label for="password">密码</label>
                    <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required>
                    <i @click="togglePasswordVisibility" :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash' " class="password-icon"></i>
                </div>
                <router-link to="/SignUp">没有账号?点击注册!</router-link>
                <button type="submit" class="submitLogIn">登录</button>
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
            showPassword: false,
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        async login() { // 声明为异步函数
            try {
                // 将输入的用户名和密码作为POST请求的数据发送到后端
                const response = await axios.post('http://localhost:8080/myLogin', {
                    username: this.username,
                    password: this.password
                });

                // 检查返回的状态码
                if (response.status === 200) {
                    // 登录成功，存储 JWT 到 localStorage
                    localStorage.setItem('token', response.data.token);
                    axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');
                    localStorage.setItem('userName', this.username);

                    // 更新Vuex中的token状态
                    this.$store.commit('SET_TOKEN', response.data.token);

                    console.log("response name:" + this.username);
                    this.$root.isLoggedIn = true;
                    console.log("登陆成功！");
                    this.$router.push('/');
                } else {
                    alert('用户名或密码错误');
                }
            } catch (error) {
                console.error(error);
                alert('登录失败');
            }
        }
    }
};
</script>


<style scoped>
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f1f1f1;
}

.login-content {
    width: 400px;
    margin-top: -200px;
}

h1 {
    font-size: 28px;
    margin-bottom: 40px;
}

.login-form {
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
    top: 50px;
    cursor: pointer;
}
.submitLogIn{
    margin-top: 20px;
}
</style>

