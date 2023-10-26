<template>
  <MainBackground>
    <div class="file-edit-container">
      <div class="file-info">
        <p v-if="fileName" style="color: white">当前文件：{{ fileName }}</p>
      </div>
      <div class="button-group">
        <button @click="openFile">打开文件</button>
        <button @click="saveFile">保存</button>
        <button @click="clearContent">清空</button>
      </div>
    </div>
  </MainBackground>
</template>

<script lang="ts">
import MainBackground from "@renderer/components/common/MainBackground.vue";

export default {
  name: "FileEdit",
  components: {
    MainBackground,
  },
  data() {
    return {
      filePath: null,
      fileContent: null,
      fileName: null
    };
  },
  mounted() {
    // 设置文件选择监听器
    window.electronAPI.onFileSelected((filePath, content) => {
      this.filePath = filePath;
      this.fileName = this.extractFileName(filePath);
      this.fileContent = content;
    });
  },
  methods: {
    openFile() {
      window.electronAPI.requestFileOpen();
    },
    saveFile() {
      if (this.filePath && this.fileContent) {
        window.electronAPI.saveFileContent(this.filePath, this.fileContent);
      }
    },
    clearContent() {
      this.fileContent = '';
    },
    extractFileName(fullPath) {
      return fullPath.split(/[\\/]/).pop(); // 使用正则表达式匹配Windows和Unix路径
    }
  }
}
</script>

<style scoped>
.file-edit-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.file-info {
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  gap: 10px; /* 两个按钮之间的间距 */
}
</style>
