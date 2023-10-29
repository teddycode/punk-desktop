<template>
  <dv-border-box10 class="box">
    <div class="main-left-top-title">节点管理</div>
    <div v-if="loggedIn" class="content">
      <div class="node-content">
        当前节点数: {{ user.onlineNodes }}
      </div>
      <shape-button @click="addNode">添加节点</shape-button>
    </div>
    <div v-else class="content">
      <div class="main-left-top-tip">
        <font-awesome-icon class="icon" icon="exclamation-circle"/>
        您还没有登录！
      </div>
    </div>
  </dv-border-box10>
</template>

<script lang="ts">
import {ref, watch, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import ShapeButton from "@components/buttons/ShapeButton.vue";
import {useUserStore} from "@store/users";

library.add(faExclamationCircle);

export default {
  name: "NodeManager",
  components: {
    FontAwesomeIcon,
    ShapeButton,
  },
  setup() {
    const store = useUserStore();
    const router = useRouter();
    const user = ref({
      nickname: 'User Name',
      onlineNodes: 10
    });
    const loggedIn = ref(checkUserLoggedIn());

    function checkUserLoggedIn() {
      const token = localStorage.getItem('token');
      console.log(token);
      return !!token;
    }

    function navigateToLogin() {
      router.push({name: 'UserLoginPage'});
    }

    function navigateToNodeManagement() {
      router.push({name: 'NodeManagerPage'});
    }

    watch(() => store.state.token, () => {
      loggedIn.value = checkUserLoggedIn();
    });

    onMounted(() => {
      loggedIn.value = checkUserLoggedIn();
    });

    return {
      user,
      loggedIn,
      navigateToLogin,
      navigateToNodeManagement
    }
  },
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
