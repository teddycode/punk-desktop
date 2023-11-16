<template>
  <a-modal
      :visible="visible"
      :wrap-style="{ overflow: 'hidden' }"
      @cancel="handleCancel" @ok="handleOk"
  >
    <p style="font-size: 20px">{{ content }}</p>
    <p>
      <a-input v-model:value="inputValue" :placeholder="placeholder" @keyup.enter="handleOk"></a-input>
    </p>
    <template #title>
      <div ref="modalTitleRef" style="width: 100%; cursor: move">{{ title }}</div>
    </template>

  </a-modal>
</template>

<script>
export default {
  name: 'Prompt',
  data () {
    return {
      inputValue: ''
    }
  },
  emits: ['changeValue'],
  props: [
    'content',
    'title',
    'placeholder',
    'visible'
  ],
  methods: {
    handleOk () {
      this.$emit('changeValue', { value: this.inputValue })

    },
    handleCancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>

</style>
