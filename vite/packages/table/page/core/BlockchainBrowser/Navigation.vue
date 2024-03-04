<template>
  <!-- 导航栏 -->
  <a-row class="navigation">
    <a-col :span="4">logo</a-col>
    <a-col :span="2">
      <a-button type="text" style="font-size: large" @click="goToHome">主页</a-button>
    </a-col>
    <a-col :span="2">
      <!-- 区块链下拉列表 -->
      <a-dropdown >
        <a class="ant-dropdown-link">
          区块链
          <DownOutlined />
        </a>
        <template #overlay>
          <a-menu arrow="true">
            <a-menu-item key="0">
              <router-link to="./TransactionList">交易列表</router-link>
            </a-menu-item>
            <a-menu-item key="1">
              <router-link to="./BlockList">区块列表</router-link>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-col>
    <a-col :span="2">
      <a-button type="text" style="font-size: large">代币</a-button>
    </a-col>
    <a-col :span="2">
      <a-button type="text" style="font-size: large">更多</a-button>
    </a-col>
    <a-col :span="8">
      <a-input-group >
        <a-input-search
          v-model:value="value"
          style="width: 90%;padding: 16px"
          placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
          @search="onSearch"
        />
      </a-input-group>
    </a-col>
    <a-col :span="4" class="language-dropdown">
      <!-- 语言选择下拉列表 -->
      <a-radio-group v-model:value="LanguageChoice">
        <a-radio-button value="Chinese">中文</a-radio-button>
        <a-radio-button value="English">English</a-radio-button>
      </a-radio-group>
    </a-col>
  </a-row>
  <a-divider />
</template>

<script lang="ts" setup>
import {DownOutlined} from "@ant-design/icons-vue";
import {useRouter} from "vue-router";
import {ref} from "vue";
const value = ref<string>('');
const selectedOption = ref<string>('All Filters');
const LanguageChoice = ref<string>('中文');
const onSearch = (searchValue: string) => {
  console.log('use value', searchValue);
  console.log('or use this.value', value.value);
};
const router = useRouter();
// 可以在此添加数据、方法等
const goToHome = () => {
  router.push('./index');
};
</script>

<style scoped>
.ant-dropdown-link{
  color: black;
}
.navigation{
  font-size: large;
}
</style>
