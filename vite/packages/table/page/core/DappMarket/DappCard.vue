<template>
  <a-card hoverable class="dapp-card" @click="handleClick">
    <template #cover>
      <div class="image-container">
        <img :src="image" alt="Dapp Image" class="dapp-image" />
        <div class="overlay">
          <a-card-meta class="dapp-meta" :title="title">
            <template #description>
              <div class="description">{{ description }}</div>
            </template>
          </a-card-meta>
        </div>
      </div>
    </template>
  </a-card>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  image: string;
  title: string;
  description: string;
  id: number; // 添加 id 属性
}>();

const emits = defineEmits(['click']);

const handleClick = () => {
  emits('click', props.id);
};
</script>

<style scoped>
.dapp-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dapp-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  /*transform-origin: center;*/
}

.dapp-card:hover .dapp-image {
  transform: scale(1.02);
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.71);
  padding: 10px;
}

.description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
