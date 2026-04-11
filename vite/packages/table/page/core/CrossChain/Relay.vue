<template>  
  <a-layout style="background-color: #f5f5f5; padding: 24px;">  
    <!-- 基础信息卡片 -->  
    <a-card   
      class="info-card"  
      title="跨链桥中继页面"   
      :bordered="true"  
    >  
      <template #extra>  
        <a-radio-group v-model:value="selectedChainId" @change="handleChainChange" button-style="solid" class="chain-switch">
          <a-radio-button :value="1"><span class="chain-dot btc"></span>比特币</a-radio-button>
          <a-radio-button :value="2"><span class="chain-dot eth"></span>以太坊</a-radio-button>
          <a-radio-button :value="3"><span class="chain-dot cosmos"></span>Cosmos</a-radio-button>
        </a-radio-group>
      </template>  

      <a-divider>基础信息</a-divider>  
      
      <!-- 统计数据展示 -->  
      <div class="statistics-container">  
        <a-row :gutter="[16, 16]">  
          <a-col v-for="(stat, index) in computedBaseStats" :key="index" :xs="24" :sm="12" :md="6" class="stat-col">  
            <a-card hoverable class="stat-card">  
              <a-statistic   
                :title="stat.title"   
                :value="stat.value"  
                :loading="loading"  
              />  
            </a-card>  
          </a-col>  
        </a-row>  
      </div>  
    </a-card>  

    <!-- 表格切换区域 -->  
    <div class="table-section">  
      <a-card :bordered="false">  
        <template #extra>  
        <a-radio-group   
          v-model:value="activeTable"   
          button-style="solid"  
          class="table-switch"  
        >  
          <a-radio-button value="shadow">影子区块信息</a-radio-button>  
          <a-radio-button value="relay">搬运工信息</a-radio-button>  
        </a-radio-group>  
      </template>  

      <!-- 影子区块表格 -->  
      <a-table  
        v-show="activeTable === 'shadow'"  
        :columns="shadow_columns"  
        :data-source="shadow_info"  
        :loading="loading"  
        :pagination="tablePagination"  
        class="custom-table"  
      >  
        <template #bodyCell="{ column, record }">  
          <template v-if="['commit_relayer_addr', 'open_relayer_addr'].includes(column.dataIndex)">  
            <a-tooltip :title="record[column.dataIndex]">  
              <a-typography-text copyable>  
                {{ shortenAddress(record[column.dataIndex]) }}  
              </a-typography-text>  
            </a-tooltip>  
          </template>  
          <template v-else-if="['shadow_key', 'prev_key'].includes(column.dataIndex)">  
            <a-tooltip :title="record[column.dataIndex]">  
              {{ shortenHash(record[column.dataIndex]) }}  
            </a-tooltip>  
          </template>  
          <template v-else-if="column.dataIndex === 'raw_data'">  
            <a-tooltip title="查看原始数据">  
              <EyeOutlined class="view-icon" @click="openRawModal(record.raw_data)" />
            </a-tooltip>
          </template>
        </template>  
      </a-table>  

        <!-- 搬运工（中继基础配置）表格布局 -->
        <a-table
          v-show="activeTable === 'relay'"
          :columns="porter_columns"
          :data-source="porter_info"
          :loading="loading"
          :pagination="tablePagination"
          :scroll="{ x: 'max-content' }"
          class="custom-table"
        >
          <template #bodyCell="{ column, text }">
            <template v-if="['genesis_key','require_stake','processed_penalty','un_processed_penalty'].includes(column.dataIndex)">
              <div class="scroll-strip">{{ String(text) }}</div>
            </template>
          </template>
        </a-table>
      </a-card>  
    </div>  

    <!-- 原始数据弹窗 -->
    <a-modal v-model:open="rawModalVisible" title="原始数据" width="800">
      <pre class="raw-pre">{{ rawModalContent }}</pre>
      <template #footer>
        <a-button @click="rawModalVisible = false">关闭</a-button>
      </template>
    </a-modal>
  </a-layout>  
</template>  

<script lang="ts" setup>  
import { ref, onMounted, computed } from 'vue'  
import { useRouter, useRoute } from 'vue-router'  
import { message } from 'ant-design-vue'  
import { ethers } from 'ethers'  
import { EyeOutlined } from '@ant-design/icons-vue'  

// 接口定义  
interface ShadowData {  
  no: number  
  shadow_key: string  
  prev_key: string  
  offset_height?: number  
  commit_event_no: number  
  commit_relayer_addr: string  
  commit_value: string  
  open_event_no: number  
  open_event_type?: number  
  open_relayer_addr: string  
  open_result: boolean  
  raw_data?: string  
}  

// 状态定义  
const loading = ref(false)  
const activeTable = ref('shadow')  
const router = useRouter()  
const route = useRoute()  
const routerState = history.state  

// 表格配置  
const tablePagination = {  
  pageSize: 10,  
  showSizeChanger: true,  
  showQuickJumper: true  
}  

// 路由数据  
const data_from_route = ref({  
  chain_id: Number(route.params.chain_id || (routerState && routerState.chain_id) || route.query.chain_id),  
  rpc: route.query.rpc || routerState.rpc,  
  symbol: route.query.symbol || routerState.symbol,  
  name: route.query.name || routerState.name,  
  multi_addr: route.query.multi_addr || routerState.multi_addr,  
  addr: route.query.addr || routerState.addr,  
})  

// 表格数据  
const shadow_info = ref<ShadowData[]>([])  
const porter_info = ref<any[]>([])

// 选择器：默认展示比特币
const selectedChainId = ref<number>(1)

// 顶部展示所需数据
const currentSourceChain = ref<any | null>(null)
const currentRelayAddr = ref('')
const currentTransportAddr = ref('')

const computedBaseStats = computed(() => [
  { title: '源链编号', value: selectedChainId.value },
  { title: '源链符号', value: currentSourceChain.value?.symbol || '-' },
  { title: '源链名称', value: currentSourceChain.value?.name || '-' },
  {
    title: '中继合约地址',
    value: shortenAddress(currentRelayAddr.value),
    fullValue: currentRelayAddr.value,
  },
  {
    title: '传输合约地址',
    value: shortenAddress(currentTransportAddr.value),
    fullValue: currentTransportAddr.value,
  },
])

// 表格列定义  
const shadow_columns = [  
  { title: '编号', dataIndex: 'no', key: 'no' },  
  { title: '影子区块KEY', dataIndex: 'shadow_key', key: 'shadow_key' },  
  { title: '影子父区块KEY', dataIndex: 'prev_key', key: 'prev_key' },  
  { title: '提交事件编号', dataIndex: 'commit_event_no', key: 'commit_event_no' },  
  { title: '提交验证者', dataIndex: 'commit_relayer_addr', key: 'commit_relayer_addr' },  
  { title: '承诺值', dataIndex: 'commit_value', key: 'commit_value' },  
  { title: '打开事件编号', dataIndex: 'open_event_no', key: 'open_event_no' },  
  { title: '打开验证者', dataIndex: 'open_relayer_addr', key: 'open_relayer_addr' },  
  {   
    title: '验证结果',   
    dataIndex: 'open_result',   
    key: 'open_result',  
    customRender: ({ text }: { text: boolean }) => text ? '成功' : '失败'  
  },  
  {   
    title: '原始数据',   
    dataIndex: 'raw_data',   
    key: 'raw_data',  
    ellipsis: true   
  }  
]  

// 搬运工表格列定义（自适应 + 长文本省略）
const porter_columns = [
  { title: '链ID', dataIndex: 'chain_id', key: 'chain_id', width: 90, fixed: 'left' },
  { title: '创世键', dataIndex: 'genesis_key', key: 'genesis_key', width: 320 },
  { title: 'Gas上限', dataIndex: 'gas_bound', key: 'gas_bound', width: 120 },
  { title: '提交超时(s)', dataIndex: 'commit_time_out', key: 'commit_time_out', width: 140 },
  { title: '质押要求', dataIndex: 'require_stake', key: 'require_stake', width: 240 },
  { title: '已处理罚金', dataIndex: 'processed_penalty', key: 'processed_penalty', width: 240 },
  { title: '未处理罚金', dataIndex: 'un_processed_penalty', key: 'un_processed_penalty', width: 240 },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
  { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', width: 180 },
]

// 原始数据弹窗状态
const rawModalVisible = ref(false)
const rawModalContent = ref('')
const openRawModal = (text: string) => {
  rawModalContent.value = text || ''
  rawModalVisible.value = true
}

// 工具函数  
const shortenAddress = (address: string) => {  
  if (!address) return '-'  
  return `${address.slice(0, 6)}...${address.slice(-4)}`  
}  

const shortenHash = (hash: string) => {  
  if (!hash) return '-'  
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`  
}  

// 长文本缩略显示（用于表格自适应）
const shortenLong = (val: string, prefix = 10, suffix = 6) => {
  if (!val) return '-'
  const s = String(val)
  return s.length > prefix + suffix + 3 ? `${s.slice(0, prefix)}...${s.slice(-suffix)}` : s
}

// 使用相对资源路径加载（Vite 会正确解析）
const loadAssetJSON = async (relativePath: string) => {
  try {
    const url = new URL(relativePath, import.meta.url).href;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`加载 ${relativePath} 失败:`, error);
    return null;
  }
};

// 数据获取函数（改为 testdata）
const fetchShadowData = async () => {
  try {
    // 仅比特币有影子区块示例数据
    if (selectedChainId.value === 1) {
      const data = await loadAssetJSON('../crosschain/testdata/source_shadow_info_101.json')
      shadow_info.value = Array.isArray(data) ? data : (data ? [data] : [])
    } else {
      shadow_info.value = []
    }
  } catch (err) {
    console.error('加载影子区块数据失败:', err)
    shadow_info.value = []
  }
}

const fetchPorterData = async () => {
  try {
    const data = await loadAssetJSON('../crosschain/testdata/relay_basic_info.json')
    porter_info.value = Array.isArray(data)
      ? data.filter((d: any) => d.chain_id === selectedChainId.value)
      : []
  } catch (err) {
    console.error('加载搬运工数据失败:', err)
    porter_info.value = []
  }
}

const fetchTopInfo = async () => {
  // 源链信息
  const sourceChains = await loadAssetJSON('../crosschain/testdata/source_chain_info.json')
  currentSourceChain.value = Array.isArray(sourceChains)
    ? sourceChains.find((c: any) => c.chain_id === selectedChainId.value) || null
    : null

  // 系统合约地址（中继 / 传输）
  const contracts = await loadAssetJSON('../crosschain/testdata/system_contract_info.json')
  if (Array.isArray(contracts)) {
    const byChain = contracts.filter((c: any) => c.chain_id === selectedChainId.value)
    const relay = byChain.find((c: any) => c.level_id === 1)
    const transport = byChain.find((c: any) => c.level_id === 2)
    currentRelayAddr.value = relay?.contract_addr || ''
    currentTransportAddr.value = transport?.contract_addr || ''
  } else {
    currentRelayAddr.value = ''
    currentTransportAddr.value = ''
  }
}

// 刷新函数  
const refreshData = async () => {  
  loading.value = true  
  try {  
    await Promise.all([fetchTopInfo(), fetchShadowData(), fetchPorterData()])
    message.success('数据已更新')  
  } catch (err) {  
    console.error('数据刷新失败:', err)  
    message.error('数据刷新失败')  
  } finally {  
    loading.value = false  
  }  
}  

const handleChainChange = async () => {
  // 切换链后刷新页面数据
  await refreshData()
}

// 自动刷新  
let refreshTimer: NodeJS.Timer | null = null  

const startAutoRefresh = () => {  
  if (!refreshTimer) {  
    refreshTimer = setInterval(refreshData, 30000) // 30秒刷新一次  
  }  
}  

const stopAutoRefresh = () => {  
  if (refreshTimer) {  
    clearInterval(refreshTimer)  
    refreshTimer = null  
  }  
}  

// 生命周期钩子  
onMounted(() => {  
  console.log("这是中继界面")
  refreshData()  
})  
</script>  

<style lang="scss" scoped>  
.dashboard-layout {  
  padding: 24px;  
  background-color: #f5f5f5;  

  .info-card {  
    margin-bottom: 24px;  

    .statistics-container {  
      margin-top: 24px;  

      .stat-col {
        flex: 1 1 20%; // 弹性布局，每行最多5个
        max-width: 20%;
      }

      .stat-card {
        min-height: 100px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }

        :deep(.ant-statistic-title) {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.65);
        }

        :deep(.ant-statistic-content) {
          font-size: 24px;
          font-weight: 500;
          color: #333;
        }
      }

      // 应用渐变背景
      .stat-col:nth-child(5n + 1) .stat-card {
        background: linear-gradient(135deg, #f6f9ff 0%, #eef4ff 100%);
      }
      .stat-col:nth-child(5n + 2) .stat-card {
        background: linear-gradient(135deg, #f9f6ff 0%, #f3eefe 100%);
      }
      .stat-col:nth-child(5n + 3) .stat-card {
        background: linear-gradient(135deg, #fffaf6 0%, #fff2e9 100%);
      }
      .stat-col:nth-child(5n + 4) .stat-card {
        background: linear-gradient(135deg, #f6fff6 0%, #e6f7e6 100%);
      }
      .stat-col:nth-child(5n + 5) .stat-card {
        background: linear-gradient(135deg, #f6f6f6 0%, #e8e8e8 100%);
      }
    }  
  }  

  .table-section {  
    .table-switch {  
      margin-bottom: 16px;  
    }  

    .custom-table {  
      :deep(.ant-table-thead > tr > th) {  
        background-color: #fafafa;  
      }  

      :deep(.ant-table-tbody > tr:hover > td) {  
        background-color: #f0f7ff;  
      }  
    }  
  }  
}  

// 链选择器
.chain-switch {
  margin-right: 12px;

  :deep(.ant-radio-button-wrapper) {
    height: 40px;
    line-height: 38px;
    padding: 0 20px;
    font-size: 16px;
    border-radius: 20px !important;
    margin: 0 5px;
    border: 1px solid #d9d9d9;
    transition: all 0.3s;

    &:first-child {
      border-radius: 20px !important;
    }
    &:last-child {
      border-radius: 20px !important;
    }

    &::before {
      content: none; // 移除 Ant Design 的伪元素
    }

    &:hover {
      color: #0958d9;
      border-color: #0958d9;
    }
  }

  :deep(.ant-radio-button-wrapper-checked) {
    background-color: #e6f7ff;
    border-color: #91d5ff;
    color: #0958d9;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(64, 169, 255, 0.2);
  }
}

.chain-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;

  &.btc { background-color: #f7931a; }
  &.eth { background-color: #627eea; }
  &.cosmos { background-color: #5064fb; }
}

// 响应式布局  
@media (max-width: 768px) {  
  .dashboard-layout {  
    padding: 12px;  

    .info-card {  
      margin-bottom: 16px;  
    }  

    .stat-card {  
      margin-bottom: 12px;  
    }  
  }  
}  

// 链接样式  
a {  
  color: #1890ff;  

  &:hover {  
    color: #40a9ff;  
  }  
}  

// 工具提示样式  
:deep(.ant-tooltip) {  
  max-width: 500px;  
}  

// 加载状态样式  
:deep(.ant-spin) {  
  max-height: none;  
}  

.view-icon {
  cursor: pointer;
  color: #1890ff;
}
.view-icon:hover {
  color: #0958d9;
}
.mono-ellipsis {
  display: inline-block;
  font-family: monospace;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.scroll-strip {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}
.raw-pre {
  background: #fafafa;
  border-radius: 4px;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 60vh;
  overflow: auto;
}
</style>