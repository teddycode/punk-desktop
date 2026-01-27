<template>
  <div class="overview-page">
    <h1>概览</h1>
    <div class="overview-content">
      <p>欢迎来到 DApp 市场管理中心！</p>
      <p>在这里您可以管理您的 DApp 项目、查看收藏和进行其他操作。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Overview'
}
</script>

<style scoped>
.overview-page {
  padding: 10px;
  height: 100%;
}

.overview-content {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.overview-content p {
  font-size: 18px;
  margin: 20px 0;
}
</style>
