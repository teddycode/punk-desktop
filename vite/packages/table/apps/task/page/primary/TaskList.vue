<template>
  <xt-text class="mb-3 font-medium">
    <xt-new-icon
        bgClass="xt-bg-2"
        class="mr-3"
        icon="fluent:chevron-left-16-filled"
        w="40"
        @click="back()"
    />
    {{ task.chapter }}
    <template #right>
      {{ completedTask }}
    </template>
  </xt-text>
  <template v-if="getCompletedTasks.length">
    <xt-collapse v-for="data in getCompletedTasks">
      <template #title>
        <xt-text>
          <xt-new-icon class="mr-3" icon="fluent-emoji:star" size="20"/>
          {{ data.title }}
        </xt-text>
      </template>
      <xt-text class="mb-3" type="2">{{ data.intro }}</xt-text>
      <xt-text class="mb-3">任务说明</xt-text>
      <xt-text type="2">{{ data.description }}</xt-text>
      <div class="flex justify-center items-center flex-col">
        <xt-text class="my-3 h-4" title="完成奖励" type="2"/>
        <div class="xt-theme-text mb-3">
          暂无任务奖励，后续完工后，我们会自动补发奖励
        </div>
        <xt-text
            v-if="data.guide"
            class="mb-3 h-4"
            title="当前任务含有操作引导"
            type="2"
        />

        <StatrTask :isFirst="false" :task="data"/>
      </div>
    </xt-collapse>
  </template>
  <xt-text v-else title="暂无已完成任务"/>
</template>

<script setup>
import {computed} from "vue";
import {storeToRefs} from "pinia";
import {taskStore} from "../../store.ts";
import StatrTask from "./StatrTask.vue";

const sotre = taskStore();
const {list} = storeToRefs(sotre);

const props = defineProps({
  task: {},
  completedTask: {},
});

const getCompletedTasks = computed(() => {
  let array = [];
  let count = 0;
  props.task.tasks.forEach((item) => {
    if (list.value.includes(item.id)) {
      array.push(item);
    }
  });

  return array;
});

const emits = defineEmits(["back"]);
const back = () => {
  console.log("111 :>> ", 111);
  emits("back");
};
</script>

<style lang="scss" scoped></style>
