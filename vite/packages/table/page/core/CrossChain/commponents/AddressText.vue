<template>  
    <a-tooltip :title="text">  
      <span class="truncated-text">{{ truncatedText }}</span>  
    </a-tooltip>  
  </template>  
  
  <script setup lang="ts">  
  import { computed } from 'vue'  
  
  const props = defineProps<{  
    text: string  
    startLength?: number  
    endLength?: number  
  }>()  
  
  const truncatedText = computed(() => {  
    const start = props.startLength || 6  
    const end = props.endLength || 4  
    if (props.text && props.text.length > (start + end)) {  
      return `${props.text.slice(0, start)}...${props.text.slice(-end)}`  
    }  
    return props.text  
  })  
  </script>  
  
  <style scoped>  
  .truncated-text {  
    font-family: monospace;  
  }  
  </style> 