<template>
  <XtTab
      v-model="selectTab"
      :list="tabList"
      boxClass="p-1 xt-bg-2"
      name="title"
      style="height: 52px"
  ></XtTab>
</template>

<script>
export default {
  data () {
    return {
      selectTab: 'config',
      tabList: [
        {
          title: '配置',
          value: 'config',
        },
        {
          title: '样式',
          value: 'style',
        },
      ],
    }
  },
  watch: {
    selectTab (newV) {
      console.log('newV :>> ', newV)
      this.$emit('update:data', newV)
    },
  },
}
</script>

<style lang="scss" scoped></style>
