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
  background: var(--secondary-bg);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dapp-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.dapp-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.dapp-card:hover .dapp-image {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 10px;
  color: var(--primary-text);
}

:deep(.dapp-meta .ant-card-meta-title) {
  color: var(--primary-text);
}

:deep(.dapp-meta .ant-card-meta-description) {
  color: rgba(255, 255, 255, 0.8);
}

.description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
