<template>
  <div class="card" style="height: 12em; text-align: center ;cursor:pointer" @click="addCard">
    <div class="title">
      <Icon
          icon="tianjia1"
          style="
          width: 3em;
          height: 3em;
          margin-right: 10px;
          vertical-align: middle;
        "
      ></Icon
      >
      <br/>添加个性化卡片
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddMore',
  methods: {
    addCard () {
      this.$router.push({ name: 'addCard' })
    },
  },
}
</script>

<style scoped>

</style>
