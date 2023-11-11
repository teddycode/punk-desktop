<template>
  <svg aria-hidden="true" class="icon group-icon">
    <use v-bind:xlink:href="'#icon-'+icon.name"></use>
  </svg>
</template>

<script>
export default {
  name: 'CustomIcon',
  props: ['icon'],

}
</script>

<style scoped>

</style>
