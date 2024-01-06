<template>
  <a-layout class="layout">
    <a-layout-header>
      <layoutHeader :style="'position: fixed;zIndex:10;width:100%;'"></layoutHeader>
    </a-layout-header>
    <a-layout-content>
      <!--      <path-bar :style="{ position: 'fixed', zIndex: 10 }"></path-bar>-->
      <div :style="{ background: '#fffffa', padding: '20px', minHeight: '280px' }">
        <keep-alive>
          <router-view />
        </keep-alive>
      </div>
    </a-layout-content>
    <layout-footer />
  </a-layout>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import layoutHeader from '../Layouts/components/layout-header.vue';
import pathBar from '../Layouts/components/pathBar.vue';
import LayoutFooter from '@page/core/Layouts/components/layout-footer.vue';

export default defineComponent({
  components: {
    LayoutFooter,
    layoutHeader,
    pathBar,
  },
  setup() {
    return {
      selectedKeys: ref<string[]>(['2']),
    };
  },
});
</script>
<style>
.site-layout-content {
  min-height: 280px;
  padding: 24px;
  background: #fff;
}

#components-layout-demo-top .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

[data-theme='dark'] .site-layout-content {
  background: #141414;
}
</style>
