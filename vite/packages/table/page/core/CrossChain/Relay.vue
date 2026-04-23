<template>  
  <a-layout style="background-color: #f5f5f5; padding: 24px;">  
    <!-- 基础信息卡片 -->  
    <a-card   
      class="info-card"  
      title="跨链桥中继页面"   
      :bordered="true"  
    >  
      <template #extra>  
        <a-button type="primary" @click="refreshData">  
          <template #icon><ReloadOutlined /></template>  
          刷新  
        </a-button>  
      </template>  

      <a-divider>基础信息</a-divider>  
      
      <!-- 统计数据展示 -->  
      <div class="statistics-container">  
        <a-row :gutter="[16, 16]">  
          <a-col :xs="24" :sm="12" :md="6">  
            <a-card hoverable class="stat-card">  
              <a-statistic   
                title="源链编号"   
                :value="data_from_route.chain_id"  
                :loading="loading"  
              />  
            </a-card>  
          </a-col>  
          <a-col :xs="24" :sm="12" :md="6">  
            <a-card hoverable class="stat-card">  
              <a-statistic   
                title="源链符号"   
                :value="data_from_route.symbol"  
                :loading="loading"  
              />  
            </a-card>  
          </a-col>  
          <a-col :xs="24" :sm="12" :md="6">  
            <a-card hoverable class="stat-card">  
              <a-statistic   
                title="源链名称"   
                :value="data_from_route.name"  
                :loading="loading"  
              />  
            </a-card>  
          </a-col>  
          <a-col :xs="24" :sm="12" :md="6">  
            <a-card hoverable class="stat-card">  
              <a-tooltip :title="data_from_route.addr">  
                <a-statistic   
                  title="合约地址"   
                  :value="shortenAddress(data_from_route.addr)"  
                  :loading="loading"  
                />  
              </a-tooltip>  
            </a-card>  
          </a-col>  
          <a-col :xs="24" :sm="12" :md="6">  
            <a-card hoverable class="stat-card">  
              <a-tooltip :title="data_from_route.multi_addr">  
                <a-statistic   
                  title="管理员地址"   
                  :value="shortenAddress(data_from_route.multi_addr)"  
                  :loading="loading"  
                />  
              </a-tooltip>  
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
          </template>  
        </a-table>  
      </a-card>  
    </div>  
  </a-layout>  
</template>  

<script lang="ts" setup>  
import { ref, onMounted, computed, onUnmounted } from 'vue'  
import { useRouter, useRoute } from 'vue-router'  
import { message } from 'ant-design-vue'  
import { ethers } from 'ethers'  
import axios from 'axios'  
import { ReloadOutlined } from '@ant-design/icons-vue'  

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

const normalizeChainId = (value: unknown) => {
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : 0
}

const getBackendUrl = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const ipc = (window as any).ipcRenderer || (window as any).require?.('electron')?.ipcRenderer
      if (ipc) {
        const serviceInfo = await ipc.invoke('services.get', 'crosschain')
        if (serviceInfo && serviceInfo.status === 'running' && serviceInfo.gatewayPort) {
          return `http://127.0.0.1:${serviceInfo.gatewayPort}`
        }
        await ipc.invoke('services.resolvePage', 'crosschain')
      }
    } catch (e) {
      console.warn('[Relay] IPC call failed:', e)
    }
    if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return (window as any).crosschainBackendUrl || 'http://localhost:3020'
}

// 表格配置  
const tablePagination = {  
  pageSize: 10,  
  showSizeChanger: true,  
  showQuickJumper: true  
}  

// 路由数据  
const data_from_route = ref({  
  chain_id: normalizeChainId(route.params.chain_id || route.query.chain_id || routerState.chain_id),  
  rpc: route.query.rpc || routerState.rpc,  
  symbol: route.query.symbol || routerState.symbol,  
  name: route.query.name || routerState.name,  
  multi_addr: route.query.multi_addr || routerState.multi_addr,  
  addr: route.query.addr || routerState.addr,  
})  

// 表格数据  
const shadow_info = ref<ShadowData[]>([])  

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

// 工具函数  
const shortenAddress = (address: string) => {  
  if (!address) return '-'  
  return `${address.slice(0, 6)}...${address.slice(-4)}`  
}  

const shortenHash = (hash: string) => {  
  if (!hash) return '-'  
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`  
}  

// 数据获取函数  
const fetchShadowData = async () => {  
  try {  
    if (!data_from_route.value.chain_id) {
      shadow_info.value = []
      return
    }

    const baseUrl = await getBackendUrl()
    const response = await axios.get(`${baseUrl}/api/shadowBlocks/${data_from_route.value.chain_id}`)  
    if (Array.isArray(response.data)) {  
      shadow_info.value = response.data  
    } else {  
      shadow_info.value = [response.data]  
    }  
    console.log('Shadow blocks:', shadow_info.value)  
  } catch (err) {  
    console.error('获取影子区块数据失败:', err)  
    message.error('获取影子区块数据失败')  
  }  
}  

// 刷新函数  
const refreshData = async () => {  
  loading.value = true  
  try {  
    await fetchShadowData()  
    message.success('数据已更新')  
  } catch (err) {  
    console.error('数据刷新失败:', err)  
    message.error('数据刷新失败')  
  } finally {  
    loading.value = false  
  }  
}  

// 自动刷新  
let refreshTimer: ReturnType<typeof setInterval> | null = null  

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
  startAutoRefresh()  
})  

onUnmounted(() => {  
  stopAutoRefresh()  
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

      .stat-card {  
        height: 100%;  
        transition: all 0.3s;  

        &:hover {  
          transform: translateY(-2px);  
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);  
        }  
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
</style>