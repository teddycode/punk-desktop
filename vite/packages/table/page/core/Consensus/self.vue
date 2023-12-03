<template>
  <a-layout style="background-color: #f5f5f5">
    <a-card size="default" title="我的共识数据" :bordered="true">
      <a-card-meta :title="'我的产出'"></a-card-meta>
      <a-card-body>
        <a-row :gutter="16">
          <a-col :span="4">
            <a-statistic title="PoT区块数" :value="5" />
          </a-col>
          <a-col :span="4">
            <a-statistic title="业务区块数" :value="33" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="地址" :value="'1NvTaPya8mMC47fLrtfTZ5F4zWGseaj8ek'" />
          </a-col>
          <a-col :span="4">
            <a-statistic title="挖矿奖励" :value="60" suffix="Token" />
          </a-col>
          <a-col :span="4">
            <a-statistic title="网络ID" value="2a9fc4123b" />
          </a-col>
        </a-row>
      </a-card-body>
    </a-card>
    <a-layout-content style="margin-top: 10px; margin-bottom: 20px">
      <a-row :gutter="[16, 16]">
        <a-col :span="24">
          <a-card title="PoT区块产出" size="small">
            <div style="margin-bottom: 10px">
              <a-row justify="space-between">
                <a-col :offset="1" :span="8">
                  <a-input-search placeholder="区块高度" style="width: 60%" v-model:value="potSearchHeight" />
                </a-col>
                <a-col :span="8">
                  <a-input-search placeholder="区块Hash" style="width: 60%" v-model:value="potSearchHash" />
                </a-col>
                <a-col :span="4">
                  <a-button style="margin-right: 10px" @click="resetPotSearch"> 重置</a-button>
                  <a-button type="primary" style="margin-right: 10px" @click="searchPotBlocks"> 搜索</a-button>
                </a-col>
              </a-row>
            </div>
            <a-table :columns="potColumns" :data-source="potData" :rowKey="(record) => record.height">
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'action'">
                  <span>
                    <EyeOutlined />
                    <a href="javascript:;" @click="showPotBlockDetail(record)">详细</a>
                  </span>
                </template>
              </template>
            </a-table>
            <a-modal v-model:visible="potModalVisible" title="区块详情" width="800px" @ok="potModalVisible = false">
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="区块高度">{{ potBlockDetail.height }}</a-descriptions-item>
                <a-descriptions-item label="区块哈希">{{ potBlockDetail.hash }}</a-descriptions-item>
                <a-descriptions-item label="出块人">{{ potBlockDetail.owner }}</a-descriptions-item>
                <a-descriptions-item label="微块数目">{{ potBlockDetail.microBlockCount }}</a-descriptions-item>
                <a-descriptions-item label="交易数目">{{ potBlockDetail.transactionCount }}</a-descriptions-item>
                <a-descriptions-item label="大小(Bytes)">{{ potBlockDetail.size }}</a-descriptions-item>
                <a-descriptions-item label="父区块哈希">{{ potBlockDetail.parentHash }}</a-descriptions-item>
                <a-descriptions-item label="叔区块哈希">
                  <div v-for="uncleHash in potBlockDetail.uncleHashes">{{ uncleHash }}</div>
                </a-descriptions-item>
                <a-descriptions-item label="mixDigest">{{ potBlockDetail.mixDigest }}</a-descriptions-item>
                <a-descriptions-item label="nonce">{{ potBlockDetail.nonce }}</a-descriptions-item>
                <a-descriptions-item label="难度">{{ potBlockDetail.difficulty }}</a-descriptions-item>
                <a-descriptions-item label="时间">{{ potBlockDetail.time }}</a-descriptions-item>
              </a-descriptions>
            </a-modal>
          </a-card>
        </a-col>
        <a-col :span="24">
          <a-card title="业务区块产出" size="small">
            <div style="margin-bottom: 10px">
              <a-row justify="space-between">
                <a-col :offset="1" :span="8">
                  <a-input-search placeholder="区块高度" style="width: 60%" v-model:value="businessSearchHeight" />
                </a-col>
                <a-col :span="8">
                  <a-input-search placeholder="区块Hash" style="width: 60%" v-model:value="businessSearchHash" />
                </a-col>
                <a-col :span="4">
                  <a-button style="margin-left: 10px" @click="resetBusinessSearch"> 重置</a-button>
                  <a-button type="primary" style="margin-left: 10px" @click="searchBusinessBlocks"> 搜索</a-button>
                </a-col>
              </a-row>
            </div>
            <a-table :columns="businessColumns" :data-source="businessData" :rowKey="(record) => record.height">
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'action'">
                  <span>
                    <EyeOutlined />
                    <a @click="showBusinessBlockDetail(record)">详细</a>
                  </span>
                </template>
              </template>
            </a-table>
            <a-modal
              v-model:visible="businessModalVisible"
              title="区块详情"
              width="800px"
              @ok="businessModalVisible = false"
            >
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="区块高度">{{ businessBlockDetail.height }}</a-descriptions-item>
                <a-descriptions-item label="区块哈希">{{ businessBlockDetail.hash }}</a-descriptions-item>
                <a-descriptions-item label="leader">{{ businessBlockDetail.leader }}</a-descriptions-item>
                <a-descriptions-item label="交易数目">{{ businessBlockDetail.transactionCount }}</a-descriptions-item>
                <a-descriptions-item label="大小(Bytes)">{{ businessBlockDetail.size }}</a-descriptions-item>
                <a-descriptions-item label="父区块哈希">{{ businessBlockDetail.parentHash }}</a-descriptions-item>
                <a-descriptions-item label="委员会">
                  <div v-for="committeeMember in businessBlockDetail.committee">{{ committeeMember }}</div>
                </a-descriptions-item>
                <a-descriptions-item label="时间">{{ businessBlockDetail.time }}</a-descriptions-item>
              </a-descriptions>
            </a-modal>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
    <a-layout-footer>
      <div style="text-align: right; color: #000">数据更新时间: {{ currentDate }}</div>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { Button, Col, Descriptions, Input, Layout, Modal, PageHeader, Row, Statistic, Table } from 'ant-design-vue';
import { blockData } from './data/block.js';
import { myBlockData } from './data/myBlock.js';
import { EyeOutlined } from '@ant-design/icons-vue';

export default {
  setup() {
    const potColumns = [
      {
        title: '区块高度',
        dataIndex: 'height',
      },
      {
        title: '出块人',
        dataIndex: 'owner',
      },
      {
        title: '业务区块数',
        dataIndex: 'microBlockCount',
      },
      {
        title: '总交易数目',
        dataIndex: 'transactionCount',
      },
      {
        title: '区块大小(Bytes)',
        dataIndex: 'size',
      },
      {
        title: '时间',
        dataIndex: 'time',
      },
      {
        title: '操作',
        dataIndex: 'action',
      },
    ];
    const potData = ref([]);
    const potModalVisible = ref(false);
    const potBlockDetail = ref({});
    const showPotBlockDetail = (record) => {
      potBlockDetail.value = { ...record };
      potModalVisible.value = true;
    };
    const potSearchHeight = ref('');
    const potSearchHash = ref('');
    const searchPotBlocks = () => {
      const temp = potData.value.filter(
        (item) =>
          (potSearchHeight.value && item.height === potSearchHeight.value) ||
          (potSearchHash.value && item.hash === potSearchHash.value) ||
          (!potSearchHeight.value && !potSearchHash.value),
      );
      potData.value = temp;
    };
    const resetPotSearch = () => {
      potSearchHeight.value = '';
      potSearchHash.value = '';
      potData.value = potDataBackup.value;
    };
    const potDataBackup = ref([]);
    const businessColumns = [
      {
        title: '区块高度',
        dataIndex: 'height',
      },
      {
        title: 'leader',
        dataIndex: 'leader',
      },
      {
        title: '总交易数目',
        dataIndex: 'transactionCount',
      },
      {
        title: '区块大小(Bytes)',
        dataIndex: 'size',
      },
      {
        title: '时间',
        dataIndex: 'time',
      },
      {
        title: '操作',
        dataIndex: 'action',
      },
    ];
    const businessData = ref([]);
    const businessModalVisible = ref(false);
    const businessBlockDetail = ref({});
    const showBusinessBlockDetail = (record) => {
      businessBlockDetail.value = { ...record };
      businessModalVisible.value = true;
    };
    const businessSearchHeight = ref('');
    const businessSearchHash = ref('');
    const searchBusinessBlocks = () => {
      const temp = businessData.value.filter(
        (item) =>
          (businessSearchHeight.value && item.height === businessSearchHeight.value) ||
          (businessSearchHash.value && item.hash === businessSearchHash.value) ||
          (!businessSearchHeight.value && !businessSearchHash.value),
      );
      businessData.value = temp;
    };
    const resetBusinessSearch = () => {
      businessSearchHeight.value = '';
      businessSearchHash.value = '';
      businessData.value = businessDataBackup.value;
    };
    const businessDataBackup = ref([]);
    const currentDate = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));

    // 获取共识概览数据
    async function getPotBlocks() {
      //  TODO From Remote request
    }

    // 获取我的共识数据
    async function getMyBlocks() {
      //  TODO From Remote request
    }

    onMounted(async () => {
      potDataBackup.value = blockData;
      potData.value = blockData;
      businessDataBackup.value = myBlockData;
      businessData.value = myBlockData;
      // console.log(potData.value);
      // console.log(businessData.value);
      //   TODO 字段似乎对不上，微块数目、总交易数、leder未知
    });

    return {
      potColumns,
      potData,
      potModalVisible,
      potBlockDetail,
      showPotBlockDetail,
      potSearchHeight,
      potSearchHash,
      searchPotBlocks,
      resetPotSearch,
      businessColumns,
      businessData,
      businessModalVisible,
      businessBlockDetail,
      showBusinessBlockDetail,
      businessSearchHeight,
      businessSearchHash,
      searchBusinessBlocks,
      resetBusinessSearch,
      currentDate,
    };
  },
  components: {
    EyeOutlined,
    Statistic,
    PageHeader,
    Layout,
    Row,
    Col,
    Input,
    Button,
    Table,
    Modal,
    Descriptions,
  },
};
</script>

<style lang="scss" scoped>
a {
  color: #c1e3ff;
}
</style>
