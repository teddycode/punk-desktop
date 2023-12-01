<template>
  <svg :style="style" aria-hidden="true" class="icon">
    <use v-bind:xlink:href="'#icons-' + icon"></use>
  </svg>
</template>

<script>
export default {
  name: 'Icon',
  props: ['icon', 'style'],
};
</script>

<style scoped></style>
