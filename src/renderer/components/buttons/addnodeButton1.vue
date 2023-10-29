<template>
  <button class="btn btn-rect-to-round btn-rect-to-round--blue">
    <slot></slot>
  </button>

</template>

<script>
export default {
  name: "ShapeButton"
}
</script>

<style scoped>
.btn {
  font-family: Arial, Helvetica, sans-serif;
  text-transform: uppercase;
}

.btn:hover .btn-slide-show-text1 {
  margin-left: 65px;
}

.btn-rect-to-round {
  height: 55px;
  width: 200px;
  font-size: 20px;
  font-weight: 600;
  background: rgb(58, 134, 255);
  cursor: pointer;
  transition: all 0.4s ease-in 0s;
}

.btn-rect-to-round:hover {
  border-radius: 60px;
  color: rgb(255, 255, 255) !important;
}

.btn-rect-to-round--blue {
  color: white !important;
  border: 2px solid rgb(58, 134, 255);
}

.btn-rect-to-round--blue:hover {
  border-color: rgb(58, 134, 255);
  background: rgb(58, 134, 255);
}
</style>
