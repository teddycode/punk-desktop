<template>
  <div class="header-info">
    <span>{{ title }}</span>
    <p>{{ value }}</p>
    <em v-if="bordered" />
  </div>
</template>

<script>
export default {
  name: 'Info',
  props: {
    title: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    bordered: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="less" scoped>
.header-info {
  position: relative;
  text-align: center;
  & > span {
    display: inline-block;
    margin-bottom: 4px;
    color: fade(black, 45%);
    font-size: 14px;
    line-height: 22px;
  }
  & > p {
    margin: 0;
    color: fade(#000, 85%);
    font-size: 24px;
    line-height: 32px;
  }
  & > em {
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 56px;
    background-color: hsv(0, 0, 91%);
  }
}
</style>
