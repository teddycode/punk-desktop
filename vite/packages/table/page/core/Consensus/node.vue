<template>
  <div class="content">
    <a-card size="default" title="节点信息" :bordered="true">
      <a-card-meta :title="'节点共识数据'"></a-card-meta>
      <a-card-body>
        <a-row :gutter="16">
          <a-col :span="4">
            <a-statistic title="节点数" :value="5" />
          </a-col>
          <a-col :span="4">
            <a-statistic title="出块数" :value="33" />
          </a-col>
        </a-row>
      </a-card-body>
    </a-card>
    <a-layout-content style="margin-top: 10px; margin-bottom: 20px">
      <div style="margin-bottom: 10px">
        <a-row justify="space-between">
          <a-col :span="2">
            <a-button type="primary" shape="round" style="margin-left: 20px" @click="openAddModal = true">
              <template #icon>
                <PlusOutlined />
              </template>
              添加节点
            </a-button>
          </a-col>
          <a-col :offset="2" :span="8">
            <a-input-search placeholder="节点名称" style="width: 60%" v-model:value="nodeName" />
          </a-col>
          <a-col :span="8">
            <a-input-search placeholder="状态" style="width: 60%" v-model:value="nodeStatus" />
          </a-col>
          <a-col :span="4">
            <a-button style="margin-left: 10px" @click="resetSearch"> 重置</a-button>
            <a-button type="primary" style="margin-left: 10px" @click="searchBtn">
              <template #icon>
                <SearchOutlined />
              </template>
              搜索
            </a-button>
          </a-col>
        </a-row>
      </div>
      <a-table strick bordered :columns="columns" :data-source="data">
        <template #headerCell="{ column }">
          <template v-if="column.key === 'name'">
            <span> 名称 </span>
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="showDetailModal(record)"> {{ record.name }} </a>
          </template>
          <template v-else-if="column.key === 'status'">
            <span>
              <a-tag :key="record.status" :color="record.status === '在线' ? 'geekblue' : 'red'">
                {{ record.status }}
              </a-tag>
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <span>
              <EyeOutlined />
              <a @click="showDetailModal(record)">详情</a>
              <a-divider type="vertical" />
              <EditOutlined />
              <a v-if="record.status === '在线'" @click="setStatus(record, '离线')">下线</a>
              <a v-if="record.status === '离线'" @click="setStatus(record, '在线')">上线</a>
            </span>
          </template>
        </template>
      </a-table>
    </a-layout-content>
    <!--    详情信息-->
    <a-modal v-model:visible="openDetailModal" title="节点详情" width="800px" @ok="openDetailModal = false">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="节点名称">{{ nodeDetail?.name }}</a-descriptions-item>
        <a-descriptions-item label="节点地址">{{ nodeDetail?.url }}</a-descriptions-item>
        <a-descriptions-item label="所在位置">{{ nodeDetail?.address }}</a-descriptions-item>
        <a-descriptions-item label="身份">{{ nodeDetail?.role }}</a-descriptions-item>
        <a-descriptions-item label="出块数量">{{ nodeDetail?.blockNum }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ nodeDetail?.status }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
    <a-modal v-model:visible="openAddModal" title="添加节点" width="600px" @ok="handleNodeAdd">
      <a-space direction="vertical">
        节点名称 <a-input v-model:value="nodeAddInfo.name" addon-before="0x" /> 节点地址
        <a-input v-model:value="nodeAddInfo.url" addon-before="Http://" />
      </a-space>
    </a-modal>
  </div>
</template>
<script>
import {
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  SmileOutlined,
} from '@ant-design/icons-vue';
import { defineComponent, ref } from 'vue';

const columns = [
  {
    name: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '地址',
    dataIndex: 'url',
    key: 'url',
  },
  {
    title: '位置',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '身份',
    dataIndex: 'role',
    key: 'role',
  },
  {
    title: '出块数量',
    dataIndex: 'blockNum',
    key: 'blockNum',
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
  },
  {
    title: '操作',
    key: 'action',
  },
];

export default defineComponent({
  components: {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    SmileOutlined,
    DownOutlined,
    EditOutlined,
  },
  setup() {
    let data = ref([
      {
        name: '0x96cae35ce8a9b02441',
        url: 'http://127.0.0.1:7890/node0',
        address: '北京市海淀区',
        role: '共识节点',
        status: '在线',
        blockNum: 20,
      },
      {
        name: '0xa495c744797a0ab6aef',
        url: 'http://127.0.0.1:7891/node1',
        address: '北京市海淀区',
        role: '共识节点',
        status: '在线',
        blockNum: 25,
      },
      {
        name: '0x9cfbf1e37d8a884f',
        url: 'http://127.0.0.1:7892/node2',
        address: '浙江省杭州市',
        role: '共识节点',
        status: '在线',
        blockNum: 31,
      },
      {
        name: '0x22bce1a03dc11ecc0',
        url: 'http://127.0.0.1:7893/node3',
        address: '浙江省杭州市',
        role: '普通节点',
        status: '在线',
        blockNum: 44,
      },
      {
        name: '0x249d719cfbf1e3e3',
        url: 'http://127.0.0.1:7894/node4',
        address: '北京市海淀区',
        role: '普通节点',
        status: '离线',
        blockNum: 26,
      },
    ]);
    let openDetailModal = ref(false);
    let openAddModal = ref(false);
    let nodeDetail = ref({});
    let nodeAddInfo = ref({});
    let tempData = data.value;
    // 显示详情对话框
    const showDetailModal = (record) => {
      console.log('记录:', record);
      nodeDetail.value = { ...record };
      openDetailModal.value = true;
    };
    // 显示新增对话框
    const showAddModal = () => {
      openAddModal.value = true;
    };
    let nodeName = ref('');
    let nodeStatus = ref('');
    // 搜索
    const searchBtn = () => {
      tempData = data.value;
      data.value = tempData.filter(
        (item) =>
          (nodeName.value && item.name === nodeName.value) ||
          (nodeStatus.value && item.status === nodeStatus.value) ||
          (!nodeName.value && !nodeStatus.value),
      );
    };
    // 重置搜索
    const resetSearch = () => {
      nodeName.value = '';
      nodeStatus.value = '';
      data.value = tempData;
    };
    // 设置节点状态
    const setStatus = (record, status) => {
      console.log('待修改的值:', record, status);
      let temp = data.value;
      const obj = temp.find((item) => item?.name === record?.name);
      Object.assign(obj, { status: status });
      data.value = temp;
      console.log('修改后的数组：', data.value);
    };
    // 添加节点
    const handleNodeAdd = () => {};
    return {
      data,
      columns,
      nodeDetail,
      openAddModal,
      openDetailModal,
      showAddModal,
      showDetailModal,
      nodeName,
      nodeStatus,
      searchBtn,
      resetSearch,
      setStatus,
      nodeAddInfo,
      handleNodeAdd,
    };
  },
});
</script>
