<template>
  <!--  <div>这里是文章详情页面啦啦啦啦,id:{{ route.query.id }}</div>-->
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 100%;">
      <div class="flex justify-between h-[40px] mb-3">
        <div  class="xt-text font-16" style="line-height: 40px;">
          话题
        </div>
      </div>
      <div style="height: 100%;">
        <a-list item-layout="horizontal" :data-source="topicData" >
          <template #renderItem="{ item }">
            <a-list-item  style="padding: 10px;margin-bottom: 5px;border-radius: 10px;background-color: white">
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
