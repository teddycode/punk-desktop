<template>
    <div class="login-page">
        <div class="login-content">
            <h1>登录</h1>
            <form @submit.prevent="login" class="login-form">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <input type="text" id="username" v-model="username" required>
                </div>
                <div class="form-group">
                    <label for="password">密码</label>
                    <input type="password" id="password" v-model="password" required>
                </div>
                <button type="submit">登录</button>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            password: ''
        };
    },
    methods: {
        login() {
            // 执行登录逻辑
            // 示例：验证用户名和密码，若验证通过则更新登录状态和导航栏标签，并跳转到主界面
            if (this.username === 'admin' && this.password === '123456') {
                this.$root.isLoggedIn = true;
                this.$router.push('/');
            } else {
                alert('用户名或密码错误');
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
    margin-bottom: 20px;
}

.login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.form-group {
    margin-bottom: 20px;
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

</style>
