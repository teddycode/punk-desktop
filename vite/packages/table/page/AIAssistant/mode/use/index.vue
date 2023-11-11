<template>
  <div class="flex w-full h-full justify-between" style="border: 1px solid red">
    <XtTextarea v-model:data="a" style="width: 49%"></XtTextarea>
    <!-- <XtTextarea style="width: 49%;"></XtTextarea> -->
    <XtState
        :text="{
        null: '在左侧输入框输入内容后点击「更新模板」按钮，即可优化当前模板',
      }"
        bg="xt-bg-2"
        state="null"
        style="width: 49%"
        zoom="28"
    ></XtState>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped></style>
