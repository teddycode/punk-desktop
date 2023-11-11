<!-- 可拖拽区域组件 -->
<script lang="ts" setup>


</script>

<template>
  <div :ref="drop" class="container">
    <DraggableBox
        v-for="data in getCurrentDesk"
        :id="data.id"
        :key="data.id"
        :currentDesk="currentDesk"
        :data="data"
        :left="data.left"
        :top="data.top"
    >
      <template #item="{ item }">
        <slot :item="item" name="item"> {{ item }}</slot>
      </template>
    </DraggableBox>
  </div>
</template>
