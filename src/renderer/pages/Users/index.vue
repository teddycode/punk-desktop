<template>
  <MainBackground>
    <div class="admin-page">
      <div class="user-profile">
        <img :src="userAvatar" alt="User Avatar" class="user-avatar"/>
        <input v-model="userName" class="transparent-input" placeholder="用户名"/>
        <input v-model="userSignature" class="transparent-input" placeholder="个性签名"/>
        <el-input v-model="dataInput" class="input-border-style" placeholder="请输入信息">
        </el-input>

        <el-upload
          :before-upload="beforeAvatarUpload"
          :on-success="handleAvatarUpload"
          accept="image/*"
          action="http://localhost:8080/api/upload"
          class="upload-demo">
          <el-button slot="trigger" type="primary">上传新头像</el-button>
        </el-upload>
        <button>hello</button>
      </div>
    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@components/common/MainBackground.vue";

export default {
  components: {
    MainBackground,
  },
  data() {
    return {
      userAvatar: '', // Your default avatar URL
      userName: '', // User name from loginButton component
      userSignature: '', // User signature from loginButton component
    };
  },
  methods: {
    handleAvatarUpload(response, file) {
      // Update user avatar URL with the returned URL from server after successful upload
      // You need to implement your own logic here based on the response format from your server
      this.userAvatar = response.url;
    },
    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error('只能上传图片文件!');
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!');
      }
      return isImage && isLt2M;
    },
  },
};
</script>

<style scoped>
.admin-page {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-avatar {
  width: 200px;
  height: 200px;
  border-radius: 100%;
  object-fit: cover;
}

.transparent-input {
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 10px;
  margin: 10px 0;
  font-size: 16px;
  border-radius: 4px;
  width: 200px;
}

.transparent-input::placeholder {
  color: white;
}

:deep(.el-input__inner) {
  background: url("@renderer/assets/images/main-backgroud.png") !important;
  border: 1px solid white !important;
  color: white !important;
}

</style>
