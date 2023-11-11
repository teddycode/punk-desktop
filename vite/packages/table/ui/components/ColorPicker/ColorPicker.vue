<template>
  <tippy ref="tippyRef" :appendTo="body" :interactive="true" placement="bottom" trigger="click">
    <xtButton :h="h" :style="{backgroundColor:color}" :w="w">
      &nbsp;
    </xtButton>
    <template #content="{hide}">
      <XtColor v-model:color="selectColor" btnText="恢复默认主题颜色" title="主题" @onBtnClick="hide();"></XtColor>
    </template>

  </tippy>

</template>
<script lang="ts">
import {defineComponent} from 'vue'
import XtButton from "../../libs/Button/index.vue";
import Template from "../../../../user/pages/Template.vue";

export default defineComponent({
  name: "ColorPicker",
  components: {Template, XtButton},
  props: {
    color: {
      type: String,
    },
    defaultColor: {},
    w: {
      type: Number,
      default: 20
    },
    h: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      selectColor: '',
      body: document.body
    }
  },
  mounted() {
  }
  ,
  watch: {
    selectColor: {
      handler(newValue) {
        this.$emit('update:color', newValue)
        this.$refs.tippyRef.hide()
      }

    }
  },
  methods: {
    getColorFormat() {

    }
  }
})
</script>


<style lang="scss" scoped>

</style>
