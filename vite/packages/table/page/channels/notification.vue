<template>
  <!--  <div>这里是文章详情页面啦啦啦啦,id:{{ route.query.id }}</div>-->
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 80%;">
      <div class="flex justify-between h-[40px] mb-3">
        <div  class="xt-text font-16" style="line-height: 40px;">
          通知公告
        </div>
      </div>
      <div style="height: 100%;">
        <a-list item-layout="horizontal" :data-source="data" >
          <template #renderItem="{ item }">
            <a-list-item  class="xt-bg" style="padding: 10px;margin-bottom: 5px;border-radius: 10px">
              <a-list-item-meta>
                <template #description>
                  <p>{{item.description}}</p>
                  <p>{{item.create_time}}</p>
                </template>
                <template #title>
                  <h1>{{ item.title }}</h1>
                </template>
              </a-list-item-meta>

            </a-list-item>
          </template>
        </a-list>
      </div>

    </div>
  </div>
</template>
<script lang='ts' setup>
import {comCards} from './mock';
import { useRoute,useRouter } from 'vue-router';
import { ref, reactive } from 'vue';
const data = [
  // {
  //   title: '项目说明',
  //   description: '本项目基于一些开源组件开发而成。最底层是基于 Electron 的 Min 浏览器，这是一个多标签浏览器，我们在此基础上增加了大量的优化和开发。\n' +
  //     '\n' +
  //     '包括开发了多功能左侧栏、标签组空间、密码管理器、收藏夹等等大量功能。\n' +
  //     '\n' +
  //     '其中浏览器插件部分，引用了一个基于 AGPL 的插件。大家可以自行查阅依赖，已经放置到/packages 目录下了。\n' +
  //     '\n' +
  //     '项目是磐古跨链客户端的客户端前端部分，是全部前端源码，基于开源 AGPL3.0 协议的想天工作台，后端未开源。',
  //   create_time: '2023-12-22 12:12:12',
  // },
  {
    title: 'welcome，Web3！',
    description: '欢迎来到去中心化社交网络，进入Web3的时代。在这里，我们致力于打造一个安全、隐私保护、去中心化的社交平台，让用户完全掌握自己的数据和权利。通过区块链技术，我们实现了数据的透明性和不可篡改性，确保每一位用户都能享有公平、开放的社交环境。加入我们，探索全新的社交方式，与全球用户共享见解、建立联系，并参与到这个充满创新和活力的社区中来。期待与您一同开启这段新的数字社交旅程！',
    create_time: '2023-10-22 22:29:12',
  },
];
</script>
