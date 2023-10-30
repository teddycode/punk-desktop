<template>
  <MainBackground>
    <div class="login-page">
      <div class="login-card">
        <h1 class="login-title">登录</h1>
        <form autocomplete="off" class="login-form" @submit.prevent="login">
          <div class="form-item">
            <label for="username">用户名</label>
            <div class="input-with-icon">
              <font-awesome-icon class="input-icon" icon="user"/>
              <input id="username" v-model="loginForm.username" type="text"/>
            </div>
          </div>
          <div class="form-item">
            <label for="password">密码</label>
            <div class="input-with-icon">
              <font-awesome-icon class="input-icon" icon="lock"/>
              <input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'"/>
              <font-awesome-icon :icon="showPassword ? 'eye' : 'eye-slash'" class="toggle-icon"
                                 @click="showPassword = !showPassword"/>
            </div>
          </div>
          <shape-button class="login-button" type="submit">登录</shape-button>
          <p class="register-link">没有账号?
            <router-link to="/SignUp">点击注册!</router-link>
          </p>
        </form>
      </div>
    </div>
  </MainBackground>
</template>

<script>
import axios from "axios";
import MainBackground from "@components/common/MainBackground.vue";
import ShapeButton from "@components/buttons/ShapeButton.vue";
import {library} from '@fortawesome/fontawesome-svg-core'
import {faEye, faEyeSlash, faLock, faUser} from '@fortawesome/free-solid-svg-icons'
import {useUserStore} from "@store/users";
import {useRouter} from "vue-router";

library.add(faUser, faLock, faEye, faEyeSlash)
export default {
  components: {MainBackground, ShapeButton},
  data() {
    return {
      store: useUserStore(),
      route: useRouter(),
      loginForm: {
        username: '',
        password: '',
      },
      showPassword: false,
    };
  },
  methods: {
    async login() {
      if (!this.loginForm.username || !this.loginForm.password) {
        alert('请输入用户名和密码');
        return;
      }
      try {
        const response = await axios.post('http://localhost:8080/myLogin', {
          username: this.loginForm.username,
          password: this.loginForm.password
        });
        if (response.status === 200) {
          localStorage.setItem('token', response.data.token);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');
          localStorage.setItem('userName', this.loginForm.username);
          store.setToken(response.data.token);
          await route.push('/');
        } else {
          alert('用户名或密码错误');
        }
      } catch (error) {
        console.error(error);
        alert('用户名或密码错误，登陆失败！');
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.login-card {
  width: 400px;
  background-color: transparent;
  border: 1px solid white;
  padding: 20px;
  border-radius: 10px;
}

.login-title {
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

.form-item input::placeholder {
  color: rgba(255, 255, 255, 0.7);
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
  padding-left: 30px; /* Adjusted to make space for the icon */
  padding-right: 30px; /* Adjusted for the toggle icon in password input */
}
</style>
