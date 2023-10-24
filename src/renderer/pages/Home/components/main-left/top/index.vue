<template>
  <dv-border-box10 class="box">
    <div class="main-left-top-title">节点管理</div>
    <div v-if="loggedIn" class="content">
      <div class="node-content">
        当前节点数: {{ user.onlineNodes }}
      </div>
      <add-node-button @click="addNode">添加节点</add-node-button>
    </div>
    <div v-else class="content">
      <div class="main-left-top-tip">
        <font-awesome-icon class="icon" icon="exclamation-circle"/>
        您还没有登录！
      </div>
    </div>
  </dv-border-box10>
</template>

<script>
import {library} from '@fortawesome/fontawesome-svg-core';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import AddnodeButton from "@renderer/components/buttons/addnodeButton.vue";
import {mapGetters} from 'vuex';

library.add(faExclamationCircle);

export default {
  name: "mywallet-info",
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    'add-node-button': AddnodeButton,
  },
  data() {
    return {
      loggedIn: this.checkUserLoggedIn(),  // 初始化时检查用户的登录状态
      user: {
        nickname: 'User Name',
        onlineNodes: 10
      }
    }
  },
  watch: {
    '$store.state.token': function () {
      this.loggedIn = this.checkUserLoggedIn();
    },
  },
  methods: {
    checkUserLoggedIn() {
      const token = localStorage.getItem('token');
      console.log(token)
      console.log(this.loggedIn)
      return !!token;
    },
    navigateToLogin() {
      this.$router.push({name: 'UserLoginPage'});
    },
    navigateToNodeManagement() {
      this.$router.push({name: 'NodeManagerPage'});
    },
  },
  mounted() {
    this.loggedIn = this.checkUserLoggedIn();
  },
  computed: {
    ...mapGetters(['loggedIn'])
  }
};
</script>


<style scoped>
.box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.main-left-top-title {
  color: #5ab1ef;
  font-size: x-large;
}

.content {
  height: 80%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main-left-top-tip {
  height: 30%;
  font-size: x-large;
  margin-bottom: 20px;
  color: white;
  text-align: center;
}

.icon {
  color: deepskyblue;
}

.login-button {
  margin-top: 20px;
}

.node-content {
  height: 20%;
  font-size: x-large;
  margin-bottom: 20px;
  color: white;
  text-align: center;
}
</style>
