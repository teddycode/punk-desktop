<template>
  <div class="s-bg rounded-lg xt-text" style="height: 100%">
    <div class="back-btn ml-2" @click="goBack">
      <Icon icon="xiangzuo" style="font-size: 2em"></Icon>
    </div>
  </div>
</template>

<!--TODO 删除该文件 -->
<script>
export default {
  name: 'Background',
  data() {
    return {};
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped></style>
