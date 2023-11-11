<template>
  <a-empty :description="text" :image="simpleImage"/>
</template>

<script>
export default {
  props: ['text'],
  data() {
    return {
      simpleImage: '/img/state/null.png'
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
