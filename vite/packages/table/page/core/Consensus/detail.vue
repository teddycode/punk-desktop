<template>
  <a-layout style="background-color: #f5f5f5; padding: 20px;">
    <a-layout-header>
      <div>
        <a-page-header
          title="共识"
          sub-title="基础数据"
          style="border: 1px solid #cdcbcb; border-radius: 5px; padding: 20px;"
        >
          <template #extra>
            <a-statistic-countdown :valueStyle="{ fontSize: '20px' }" :value="deadline" format="HH:mm:ss:SSS"/>
          </template>
          <template #footer>
            <a-row :gutter="16">
              <a-col :span="6">
                <a-statistic title="PoT区块数目" :value="potBlockCount"/>
              </a-col>
              <a-col :span="6">
                <a-statistic title="业务区块数目" :value="businessBlockCount"/>
              </a-col>
              <a-col :span="6">
                <a-statistic title="共识算法" :value="'PoT'"/>
              </a-col>
              <a-col :span="6">
                <a-statistic title="全网算力" :value="networkHashRate" suffix="EH/s"/>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="6">
                <a-statistic title="全网难度" :value="networkDifficulty"/>
              </a-col>
              <a-col :span="6">
                <a-statistic title="委员会共识" :value="'Hotstuff'"/>
              </a-col>
            </a-row>
          </template>
        </a-page-header>
      </div>
    </a-layout-header>
    <a-layout-content style="margin-top: 20px; margin-bottom: 20px;">
      <a-row :gutter="16">
        <a-col :span="12">
          <div>
            <a-card title="PoT区块" size="small">
              <a-input-search
                placeholder="区块高度"
                style="width: 30%; margin-right: 10px"
                v-model:value="potSearchHeight"
              />
              <a-input-search
                placeholder="区块Hash"
                style="width: 30%"
                v-model:value="potSearchHash"
              />
              <a-button style="margin-left: 10px" @click="resetPotSearch"> 重置</a-button>
              <a-button type="primary" style="margin-left: 10px" @click="searchPotBlocks"> 搜索</a-button>
              <a-table
                :columns="potColumns"
                :data-source="potData"
                :rowKey="(record) => record.id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'action'">
                    <a href="javascript:;" @click="showPotBlockDetail(record)">详细</a>
                  </template>
                </template>
              </a-table>
              <a-modal v-model:visible="potModalVisible" title="区块详细" width="600px" @ok="potModalVisible = false">
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
          </div>
        </a-col>
        <a-col :span="12">
          <div>
            <a-card title="业务区块" size="small">
              <a-input-search
                placeholder="区块高度"
                style="width: 30%; margin-right: 10px"
                v-model:value="businessSearchHeight"
              />
              <a-input-search
                placeholder="区块Hash"
                style="width: 30%"
                v-model:value="businessSearchHash"
              />
              <a-button style="margin-left: 10px" @click="resetBusinessSearch"> 重置</a-button>
              <a-button type="primary" style="margin-left: 10px" @click="searchBusinessBlocks"> 搜索</a-button>
              <a-table
                :columns="businessColumns"
                :data-source="businessData"
                :rowKey="(record) => record.id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'action'">
                    <a href="javascript:;" @click="showBusinessBlockDetail(record)">详细</a>
                  </template>
                </template>
              </a-table>
              <a-modal v-model:visible="businessModalVisible" title="区块详细" width="600px"
                       @ok="businessModalVisible = false">
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
          </div>
        </a-col>
      </a-row>
    </a-layout-content>
    <a-layout-footer>
      <div style="color: #000;">数据更新时间: {{ currentDate }}</div>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { Button, Col, Descriptions, Input, Layout, Modal, PageHeader, Row, Statistic, Table } from 'ant-design-vue'

export default {
  setup () {
    const deadline = ref(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30)
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
        title: '微块数目',
        dataIndex: 'microBlockCount',
      },
      {
        title: '总交易数目',
        dataIndex: 'transactionCount',
      },
      {
        title: '时间',
        dataIndex: 'time',
      },
      {
        title: '区块大小(Bytes)',
        dataIndex: 'size',
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        slots: { customRender: 'action' },
      },
    ]
    const potData = ref([])
    const potModalVisible = ref(false)
    const potBlockDetail = ref({})
    const showPotBlockDetail = (record) => {
      potBlockDetail.value = { ...record }
      potModalVisible.value = true
    }
    const potSearchHeight = ref('')
    const potSearchHash = ref('')
    const searchPotBlocks = () => {
      const temp = potData.value.filter(
        (item) =>
          (potSearchHeight.value && item.height === potSearchHeight.value) ||
          (potSearchHash.value && item.hash === potSearchHash.value) ||
          (!potSearchHeight.value && !potSearchHash.value)
      )
      potData.value = temp
    }
    const resetPotSearch = () => {
      potSearchHeight.value = ''
      potSearchHash.value = ''
      potData.value = potDataBackup.value
    }
    const potDataBackup = ref([])
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
        title: '时间',
        dataIndex: 'time',
      },
      {
        title: '区块大小(Bytes)',
        dataIndex: 'size',
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        slots: { customRender: 'action' },
      },
    ]
    const businessData = ref([])
    const businessModalVisible = ref(false)
    const businessBlockDetail = ref({})
    const showBusinessBlockDetail = (record) => {
      businessBlockDetail.value = { ...record }
      businessModalVisible.value = true
    }
    const businessSearchHeight = ref('')
    const businessSearchHash = ref('')
    const searchBusinessBlocks = () => {
      const temp = businessData.value.filter(
        (item) =>
          (businessSearchHeight.value && item.height === businessSearchHeight.value) ||
          (businessSearchHash.value && item.hash === businessSearchHash.value) ||
          (!businessSearchHeight.value && !businessSearchHash.value)
      )
      businessData.value = temp
    }
    const resetBusinessSearch = () => {
      businessSearchHeight.value = ''
      businessSearchHash.value = ''
      businessData.value = businessDataBackup.value
    }
    const businessDataBackup = ref([])
    const currentDate = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))

    return {
      deadline,
      potColumns,
      potData,
      potModalVisible,
      potBlockDetail,
      showPotBlockDetail,
      potSearchHeight,
      potSearchHash,
      searchPotBlocks,
      resetPotSearch,
      potDataBackup,
      businessColumns,
      businessData,
      businessModalVisible,
      businessBlockDetail,
      showBusinessBlockDetail,
      businessSearchHeight,
      businessSearchHash,
      searchBusinessBlocks,
      resetBusinessSearch,
      businessDataBackup,
      currentDate,
    }
  },
  components: {
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
}
</script>

<style scoped>
a {
  color: #C1E3FF;
}
</style>
