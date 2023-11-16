<template>
  <textarea
      v-model="searchValue"
      :class="border"
      :placeholder="placeholder"
      class="rounded-xl xt-bg-2 xt-scrollbar w-full p-2 no-darg"
      rows="1"
      spellcheck="false"
      style="
      resize: none;
      background-color: transparent;
      outline: 0px solid transparent;
      outline-offset: 0px;
    "
      @blur="handleBlur"
      @change="handleChange"
      @focus="handleFocus"
      @keydown.enter.exact.prevent="handleEnter"
  ></textarea>
</template>

<script>
export default {
  name: 'XtTextarea',
  props: {
    data: {},
    placeholder: {
      default: '',
    },
    border: {
      default: 'xt-border',
    },
  },
  data () {
    return {
      searchValue: this.data,
    }
  },
  watch: {
    searchValue (newV) {
      this.$emit('update:data', newV)
    },
    data (newV) {
      this.searchValue = newV
    },
  },
  methods: {
    // 按下回车
    handleEnter (e) {
      this.$emit('enter', e)
    },
    // 内容改变
    handleChange (e) {
      this.$emit('change', e)
    },
    // 获取焦点
    handleFocus (e) {
      this.$emit('focus', e)
    },
    // 失去焦点
    handleBlur (e) {
      this.$emit('blur', e)
    },
  },
}
</script>

<style lang="scss" scoped>
textarea::placeholder {
  color: var(--secondary-text);
}
</style>
