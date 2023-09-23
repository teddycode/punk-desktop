<template>
  <MainBackground>
    <div class="main">
      <h2>this is storage page</h2>
    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@/components/MainBackground.vue";

export default {
  name: "myStorage",
  components: {MainBackground}
}
</script>

<style scoped>
.main {
  padding: 40px;
  color: white;
}
</style>