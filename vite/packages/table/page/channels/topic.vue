<template>
  <!--  <div>这里是文章详情页面啦啦啦啦,id:{{ route.query.id }}</div>-->
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 60%;">
      <div class="flex justify-between h-[40px] mb-3">
        <div  class="xt-text font-16" style="line-height: 40px;">
          话题
        </div>
      </div>
      <div style="height: 100%;">
        <a-list item-layout="horizontal" :data-source="topicData" >
          <template #renderItem="{ item }">
            <a-list-item  class="xt-bg" style="padding: 10px;margin-bottom: 5px;border-radius: 10px">
              <a-list-item-meta>
                <template #description>
                  <p>{{item.description}}</p>
                </template>
                <template #title>
                  <a href="https://www.antdv.com/">{{ item.title }}</a>
                </template>
              </a-list-item-meta>
              <div>
<!--                <trend-->
<!--                  :data="[1, 5, 2, 10, 4]"-->
<!--                  :gradient="['#000000']"-->
<!--                  auto-draw-->
<!--                  smooth-->
<!--                  height="60"-->
<!--                  width="60"-->
<!--                >-->
<!--                </trend>-->
              </div>
            </a-list-item>
          </template>
        </a-list>
      </div>

    </div>
    <div class="pl-3 pr-3" style="width: 30%;">
      <a-card title="热搜话题" class="xt-bg" :bordered="false" style="width: 300px;border-radius: 10px">
        <template #extra><router-link :to="{name: 'topic'}">more</router-link></template>
        <div v-for="(item,index) in topicData">
          <div v-if="index<3" class="spacebetween">
            <a-card-meta>
              <template #title>
                <router-link :to="{name: 'topic'}">{{ item.title }}</router-link>
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
      <a-card class="xt-bg" title="公告" :bordered="false" style="width: 300px;border-radius: 10px;margin-top: 80px">
        <template #extra><router-link :to="{name: 'notification'}">more</router-link></template>
        <p>welcome！磐古</p>
        <p>项目说明</p>
      </a-card>
    </div>
  </div>
</template>
<script lang='ts' setup>
import {topicData} from './mock';
import { useRoute,useRouter } from 'vue-router';
import { ref, reactive } from 'vue';

const route  = useRoute()
const router = useRouter()

</script>
<style lang="scss" scoped>
.spacebetween{
  display: flex;
  justify-content: space-between;
}
</style>
