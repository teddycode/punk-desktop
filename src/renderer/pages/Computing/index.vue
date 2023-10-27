<template>
  <main-background>
    <div class="main">
      <h2>this is calculation page</h2>
    </div>
  </main-background>
</template>

<script>
import MainBackground from "@components/common/MainBackground.vue";

export default {
  name: "myCalculation",
  components: {MainBackground}
}
</script>

<style scoped>
.main {
  padding: 40px;
}
</style>
