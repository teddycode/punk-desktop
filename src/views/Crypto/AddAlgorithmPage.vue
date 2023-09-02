<template>
  <MainBackground>
    <div class="PageContent">
      <!-- 导航栏 -->
      <NavBar></NavBar>
      <!-- 注册表单区域 -->
      <div class="registerForm">
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerFormRules"
          label-width="0px"
          class="register_form"
        >
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              prefix-icon="el-icon-user"
              placeholder="用户名"
            ></el-input>
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              prefix-icon="el-icon-message"
              type="email"
              placeholder="邮箱"
            ></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password1">
            <el-input
              v-model="registerForm.password1"
              prefix-icon="el-icon-lock"
              type="password"
              placeholder="密码"
            ></el-input>
          </el-form-item>
          <!-- 确认密码 -->
          <el-form-item prop="password2">
            <el-input
              v-model="registerForm.password2"
              prefix-icon="el-icon-lock"
              type="password"
              placeholder="确认密码"
            ></el-input>
          </el-form-item>
          <!-- 按钮区域 -->
          <el-form-item>
            <!-- 注册按钮 -->
            <el-button class="register_btn" @click="register">注册</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";
import NavBar from "@/components/crypto/NavBar.vue";

export default {
  components: { MainBackground, NavBar },
  provide() {
    return {
      // 导航窗格内容
      navItem: {
        FirstLink: "/Crypto",
        FirstItem: "密码学库",
        ItemList: [],
      },
    };
  },
  data() {
    // 验证两次密码一致的函数
    var checkPassword2 = (rule, value, callback) => {
      if (value !== this.registerForm.password1) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    // 验证邮箱格式的函数
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱格式的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (!regEmail.test(value)) {
        callback(new Error("请输入合法的邮箱"));
      } else {
        callback();
      }
    };
    return {
      open: false,

      // 表单数据------------------------------------------------------------
      // 注册表单的数据绑定对象
      registerForm: {
        username: "",
        email: "",
        password1: "",
        password2: "",
      },
      // 验证规则------------------------------------------------------------
      // 注册表单的验证规则对象
      registerFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        // 验证邮箱是否合法
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        // 验证密码是否合法
        password1: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
        ],
        // 验证二次密码是否合法
        password2: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
          { validator: checkPassword2, trigger: "blur" },
        ],
      },
    };
  },
};
</script>

<style>
.PageContent {
  color: #ffffff;
  font-family: "Microsoft Yahei";
  margin-left: 10%;
  margin-right: 10%;
  text-align: left;
}

.PageTitle {
  font-size: 28px;
  text-align: left;
  margin-top: 10px;
  margin-bottom: 20px;
  font-weight: bold;
}

.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border: 1px #170397;
  border-radius: 4px;
  height: 150px;
  text-align: center;
}

.router-link-active {
  text-decoration: none;
  color: #fff;
  font-size: 20px;
}
a {
  text-decoration: none;
  color: #fff;
  font-size: 20px;
}

/* 表单 */
.registerForm {
  width: 100%;
  height: 400px;
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
