<template>
  <main-background>
    <div class="main">
      <h2>this is collection details page</h2>
    </div>
  </main-background>
</template>

<script lang="ts">
import MainBackground from "@components/common/MainBackground.vue";

export default {
  name: "details",
  components: {
    MainBackground
  }
}
</script>

<style scoped>
.main {
  padding: 40px;
}
</style>
