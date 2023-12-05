<template>
  <div class="common-layout">
    <a-row>
      <a-col :span="6">
        <div class="layoutheader_Title">
          <img v-maxImg src="/img/punkos-logo.png" class="header_logo" tatile="磐古OS" />
          <span class="project-name">
            <span class="dynamicText">磐古OS</span>
          </span>
        </div>
      </a-col>
      <a-col :span="13">
        <template v-if="!isMenu">
          <a-config-provider prefixCls="ant">
            <a-menu mode="horizontal" @select="selectChange" v-model:selectedKeys="selectedKeys">
              <template v-for="(value, index) in munePath" :key="index">
                <template :index="value.name" v-if="value && value.children">
                  <a-sub-menu :key="value.name" :index="value.path" v-if="value && value.children">
                    <template #title>
                      <span class="anticon anticon-desktop">
                        <!--                        <a-icon type="user"></a-icon>-->
                      </span>
                      <span>{{ value?.meta?.title }}</span>
                    </template>
                    <a-menu-item v-for="item in value.children" :key="item.name">
                      <span class="anticon anticon-desktop">
                        <!--                        <a-icon type="user"></a-icon>-->
                      </span>
                      <span>{{ value?.meta?.title }}</span>
                    </a-menu-item>
                  </a-sub-menu>
                </template>
                <template v-else>
                  <a-menu-item :key="value.name">
                    <span class="anticon anticon-desktop">
                      <!--                      <a-icon type="user"></a-icon>-->
                    </span>
                    <span>{{ value?.meta?.title }}</span>
                  </a-menu-item>
                </template>
              </template>
            </a-menu>
          </a-config-provider>
        </template>
      </a-col>
      <a-col :span="4">
        <div class="flex row-reverse">
          <div class="layout-header-userBox">
            <a-dropdown>
              <div class="layout-header-user">
                <span>当前钱包:0x1NvT...j8ek</span>
                <img src="/img/wallet.png" class="header_logo" tatile="钱包" />
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item>切换钱包</a-menu-item>
                  <a-menu-item>钱包信息</a-menu-item>
                  <a-menu-item>个人信息</a-menu-item>
                  <a-menu-item @click="LogOut">退出登录</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useLayoutStore } from '@store/baseSettings.ts'; // 导入你的 Pinia store
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { EyeOutlined } from '@ant-design/icons-vue';

// 获取 Pinia store
const store = useLayoutStore();

// 其他逻辑
const router = useRouter();
const { locale } = useI18n();

const isMenu = computed(() => store.isMenu);
// 获取父亲路由所有的平行路由作为菜单列表
const munePath = computed(() => {
  const currentRoute = router.currentRoute.value;
  if (currentRoute.matched.length < 2) return [];
  const parentRoute = currentRoute.matched[currentRoute.matched.length - 2];
  return parentRoute ? parentRoute.children : [];
});
console.log('current router:', router.currentRoute.value);
console.log('menu path:', munePath.value);
// 系统设置
const direction = computed(() => (store.direction ? 'rtl' : 'ltr'));

const visible = ref(false);

const selectedKeys = ref([]);
const activeTagView = computed(() => store.activeTagView);
selectedKeys.value = [activeTagView.value];

const selectChange = (item) => {
  console.log('切换菜单：', item);
  router.push({ name: item?.key || 'home' });
};

const LogOut = () => {
  window.localStorage.removeItem('token');
  router.push('/');
  // window.location.reload()
};
</script>

<style scoped>
body .a-drawer {
  padding: none;
}

.common-layout >>> .ant-menu {
  background: none !important;
  color: #fff;
  line-height: inherit;
}

.common-layout >>> .ant-menu-horizontal {
  border: none;
}
</style>
<style scoped lang="less">
.common-layout {
  margin-left: -50px;
  width: 110%;
  height: 64px;
  max-height: 64px;
  background: #8080803d;
  color: #fff;
  z-index: 1;
}

.layoutheader_Title {
  margin-left: 20px;
  display: flex;
  align-items: center;
  height: 64px;
  overflow: hidden;
}

.a-menu-demo {
  background: none;
  color: #fff !important;
  height: 62px;
  border: none;
  margin: 0 auto;
  justify-content: center;
}

.header_logo {
  height: 50px;
  width: auto;
  margin: 10px;
}

.project-name {
  font-size: 20px;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微软雅黑';
}

.layout-header-userBox {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  padding-right: 10px;

  span {
    color: #fff;
  }
}

.layout-header-user {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  cursor: pointer;
  padding-left: 12px;
}
</style>
