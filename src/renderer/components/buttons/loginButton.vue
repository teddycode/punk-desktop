<template>
  <div class="dropdown-container-login">
    <el-dropdown trigger="click" size="small">
      <el-button class="btn btn-moving-gradient btn-moving-gradient--blue" type="primary" @click="buttonClick">
        {{ isUserLoggedIn ? userName : '登录' }}
      </el-button>
      <template #dropdown v-if="isUserLoggedIn">
        <el-dropdown-menu class="el-dropdown-menu-login">
          <el-dropdown-item class="el-dropdown-menu__item" @click="navigateToUserProfile">个人信息</el-dropdown-item>
          <el-dropdown-item class="el-dropdown-menu__item" @click="logout">登出</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>


<script>
import axios from 'axios';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import {library} from "@fortawesome/fontawesome-svg-core";
import {useUserStore} from "@store/users";
import {useRoute} from "vue-router";

library.add(faSignOutAlt);

export default {
  name: "loginButton",
  components: {},
  data() {
    return {
      isUserLoggedIn: false,
      userName: '',
      store: useUserStore(),
      route: useRoute(),
    }
  },
  methods: {
    buttonClick() {
      if (!this.isUserLoggedIn) {
        this.navigateToLogin();
      }
    },
    async getLoggedInUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.isUserLoggedIn = false;
      } else {
        this.isUserLoggedIn = true;
        this.userName = localStorage.getItem('userName')
        console.log("username: " + this.userName)
        console.log("isLoggedIn!!!")
      }
    },
    navigateToLogin() {
      route.push({name: 'UserLoginPage'});
    },
    navigateToUserProfile() {
      route.push({name: 'UserInfoPage'});
    },
    async logout() {
      // Make a request to your server to logout
      try {
        const response = await axios.post('http://localhost:8080', null, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.status === 200) {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          store.removeToken();
          console.log("logout test:" + store.token)
          this.isUserLoggedIn = false;
          this.userName = 'username';
          route.push({name: 'UserLoginPage'});
          // TODO check 重定向至用户登录界面
        }
      } catch (error) {
        console.error('An error occurred while logging out:', error);
      }
    },
  },
  mounted() {
    this.getLoggedInUser();
  }
}
</script>

<style scoped>
.dropdown-container-login {
  position: absolute;
  right: 170px;
  top: 20px;
}

.btn {
  font-family: Arial, Helvetica, sans-serif;
  text-transform: uppercase;
  text-align: left;
}

.btn:hover .btn-slide-show-text1 {
  margin-left: 65px;
}

.btn-moving-gradient {
  height: 35px;
  font-weight: 600;
  color: rgb(255, 255, 255);
  cursor: pointer;
  border: medium none;
  background-size: 300% 100%;
  border-radius: 50px;
}

.btn-moving-gradient:hover {
  transition: all 0.5s ease-in-out 0s;
  background-position: 100% 0px;
}

.btn-moving-gradient--blue {
  background-image: linear-gradient(90deg, rgb(61, 135, 255), rgb(190, 61, 255), rgb(126, 61, 255), rgb(58, 134, 255));
  box-shadow: rgb(190, 61, 255) 0px 4px 15px 0px;
}

.el-dropdown-menu-login {
  background-image: linear-gradient(90deg, rgb(61, 135, 255), rgb(190, 61, 255), rgb(126, 61, 255), rgb(58, 134, 255));
  box-shadow: rgb(190, 61, 255) 0px 4px 15px 0px;
  /*background-color: #5ab1ef;*/
}

.el-dropdown-menu-login >>> .el-dropdown-menu__item {
  color: white;
}
</style>

