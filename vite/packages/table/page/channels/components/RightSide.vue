<template>
  <div class="pl-3 pr-3">
    <a-card title="热搜话题"  style="width: 300px;border-radius: 10px">
      <template #extra><router-link :to="{name: 'topic'}">more</router-link></template>
      <div v-for="(item,index) in topicData">
        <div v-if="index<3" style="display: flex;justify-content: space-between">
          <a-card-meta>
            <template #title>
              <router-link style="text-decoration-color: #0c0c0c" :to="{name: 'topic'}">{{ item.title }}</router-link>
            </template>
            <template #description>
              <p>{{ item.description }}</p>
            </template>

          </a-card-meta>
          <!--            <trend-->
          <!--              :data="[1, 5, 2, 10, 4]"-->
          <!--              :gradient="['#000000']"-->
          <!--              auto-draw-->
          <!--              smooth-->
          <!--              height="50"-->
          <!--              width="50"-->
          <!--            >-->
          <!--            </trend>-->
        </div>
      </div>
    </a-card>
    <a-card  title="公告"  style="width: 300px;border-radius: 10px;margin-top: 80px">
      <template #extra><router-link :to="{name: 'notification'}">more</router-link></template>
      <p>welcome！磐古</p>
      <p>项目说明</p>
    </a-card>
  </div>
</template>
<script setup lang="ts">

import {topicData} from "@page/channels/mock";
</script>

<style scoped lang="scss">

</style>
