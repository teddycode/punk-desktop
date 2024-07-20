<template>
    <div class="content-wrapper">
      <input type="search" placeholder="搜索节点ID..." v-model="searchText" @search="onSearch"
        style="width: 300px; margin-bottom: 20px" />
      <a-table :columns="columns" :dataSource="filteredData" :pagination="{ pageSize: 5 }" rowKey="id" />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const data = ref([
  {
    id: '0x402C4B59b084122041fAdc826fD9e0FB61ce3CFd',
    totalStake: '1000',
    nodeScore: '980',
    roi: '5%',
  },
  {
    id: '0xc2c55ee8F428866b1929Fd34BC33cE2824Ad9E3a',
    totalStake: '2000',
    nodeScore: '960',
    roi: '4%',
  },
  {
    id: '0x7aF627b45581Dbd35b3d938e6C46F7852f9B2359',
    totalStake: '3000',
    nodeScore: '940',
    roi: '3%',
  }
]);

// 搜索文本
const searchText = ref('');

// 筛选后的数据
const filteredData = computed(() => {
  if (!searchText.value) {
    return data.value;
  }
  return data.value.filter(item => item.id.includes(searchText.value));
});

// 定义表格列
const columns = [
  {
    title: '节点ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '全部质押量',
    dataIndex: 'totalStake',
    key: 'totalStake',
  },
  {
    title: '节点评分',
    dataIndex: 'nodeScore',
    key: 'nodeScore',
  },
  {
    title: '预期收益率',
    dataIndex: 'roi',
    key: 'roi',
  },
];

// 搜索功能
const onSearch = value => {
  searchText.value = value;
};
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
}

a-table {
  width: 100%;
}

input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

input::placeholder {
  color: #d9d9d9;
}

input:focus {
  outline: none;
  border-color: #40a9ff;
}

input[type='search'] {
  width: 100%;
}

input[type='search']::placeholder {
  color: #d9d9d9;
}

input[type='search']:focus {
  outline: none;
  border-color: #40a9ff;
}

</style>
