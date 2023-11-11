<template>
  <div class="flex flex-col">
    <XtInput
        v-model="search"
        class="my-4"
        placeholder="请输入名称"
        style="width: 400px; height: 48px"
    ></XtInput>
    <XtTextarea
        v-model:data="text"
        placeholder="请输入描述"
        style="height: 160px"
    ></XtTextarea>
  </div>
  <div class="flex justify-center mt-3">
    <div class="xt-btn mr-3" style="width: 120px; height: 48px">取消</div>
    <div class="xt-active-btn" style="width: 120px; height: 48px">
      创建并使用
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      search: "",
      text: "",
    };
  },
};
</script>

<style lang="scss" scoped></style>
