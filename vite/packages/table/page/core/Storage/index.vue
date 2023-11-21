<template>
  <background>
    <div class="main">
      <h2>this is storage page</h2>
    </div>
  </background>
</template>

<script>
import Background from '@page/core/components/Background.vue'

export default {
  name: 'myStorage',
  components: { Background }
}
</script>

<style scoped>
.main {
  padding: 40px;
  color: white;
}
</style>
