<template>
  <a-layout class="layout-container">
    <a-card class="header-card">
      <div class="title-row">
        <h2>跨链桥 {{ data_from_route.symbol }}</h2>
      </div>
    </a-card>
    <!-- 概览信息 -->
    <a-card class="info-card">
      <a-row :gutter="[16, 24]">
        <a-col :span="12">
          <a-tag>编号:</a-tag>
          <span>{{ data_from_route.chain_id }}</span>
        </a-col>
        <a-col :span="12">
          <a-tag>名称:</a-tag>
          <span>{{ data_from_route.name }}</span>
        </a-col>
        <a-col :span="12">
          <a-tag>符号:</a-tag>
          <span>{{ data_from_route.symbol }}</span>
        </a-col>
        <a-col :span="12">
          <a-tag>跨链桥状态:</a-tag>
          <span>{{ data_from_rpc.state }}</span>
        </a-col>
        <a-col :span="12">
          <a-tag>中继合约地址:</a-tag>
          <span class="address-link disabled">
            <LinkOutlined />
            <SwapOutlined class="swap-icon" />
            {{ shortenAddress(data_from_rpc.relay_addr) }}
          </span>
          <CopyOutlined class="copy-icon" @click="copyAddress(data_from_rpc.relay_addr)" />
        </a-col>
        <a-col :span="12">
          <a-tag>传输合约地址:</a-tag>
          <span class="address-link disabled">
            <LinkOutlined />
            <SwapOutlined class="swap-icon" />
            {{ shortenAddress(data_from_rpc.transport_addr) }}
          </span>
          <CopyOutlined class="copy-icon" @click="copyAddress(data_from_rpc.transport_addr)" />
        </a-col>
        <a-col :span="12">
          <a-tag>注册高度:</a-tag>
          <span>{{ data_from_rpc.visit_block_height }}</span>
        </a-col>
        <a-col :span="12">
          <a-tag>注册交易:</a-tag>
          <span>{{ data_from_rpc.register_tx_hash }}</span>
        </a-col>
      </a-row>
    </a-card>
    <!-- 概览下方选项卡：业务交易、影子区块、传输任务、搬运工、控制交易 -->
    <a-tabs v-model:activeKey="activeTable" type="card" @change="handleTabChange" class="section-tabs">
      <a-tab-pane key="transactions" tab="业务交易">
        <a-table
          :columns="tx_columns"
          :data-source="txList"
          :loading="loading"
          :rowClassName="() => 'table-row'"
          class="custom-table"
        />
      </a-tab-pane>
      <a-tab-pane key="internal-tx" tab="影子区块">
        <a-table
          :columns="shadow_block_columns"
          :data-source="shadowBlockList"
          :loading="loading"
          :rowClassName="() => 'table-row'"
          class="custom-table"
        />
      </a-tab-pane>
      <a-tab-pane key="token-tx" tab="传输任务">
        <a-table
          :columns="transfer_task_columns"
          :data-source="transferTaskList"
          :loading="loading"
          :rowClassName="() => 'table-row'"
          class="custom-table"
        />
      </a-tab-pane>
      <a-tab-pane key="nft-tx" tab="搬运工">
        <a-table
          :columns="porter_columns"
          :data-source="porterList"
          :loading="loading"
          :rowClassName="() => 'table-row'"
          class="custom-table"
        />
      </a-tab-pane>
      <a-tab-pane key="unstake" tab="控制交易">
        <a-table
          :columns="control_tx_columns"
          :data-source="controlTxList"
          :loading="loading"
          :rowClassName="() => 'table-row'"
          class="custom-table"
        />
      </a-tab-pane>
    </a-tabs>

    <!-- 详情弹窗：哈希点击后展示，区块提供跳转按钮 -->
    <a-modal v-model:open="detailModalVisible" :title="detailTitle" width="800">
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="哈希">{{ detailHash }}</a-descriptions-item>
        <template v-for="item in detailItems" :key="item.label">
          <a-descriptions-item :label="item.label">{{ item.value }}</a-descriptions-item>
        </template>
      </a-descriptions>
      <template #footer>
        <a-button @click="detailModalVisible = false">关闭</a-button>
        <a-button v-if="detailType === 'block'" type="primary" @click="handleBlockClick(detailHash)">查看详情页</a-button>
      </template>
    </a-modal>
  </a-layout>

</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { formatEther } from 'ethers'
import axios from "axios";
import AddressText from '../commponents/AddressText.vue'
import { ethers } from "ethers";
import { h } from 'vue'
import { Tooltip } from 'ant-design-vue';
import type { TxOverview } from '../utils/type'
import { LinkOutlined, SwapOutlined, CopyOutlined } from '@ant-design/icons-vue';


const loading = ref(false);
const activeTable = ref('transactions'); // 概览固定在上方，默认显示业务交易
let provider: ethers.JsonRpcProvider;
const route = useRoute()
const router = useRouter()
const routerState = history.state
// 路由数据  
const data_from_route = ref({
  chain_id: Number(route.params.chain_id),
  rpc: route.query.rpc || routerState.rpc,
  symbol: route.query.symbol || routerState.symbol,
  name: route.query.name || routerState.name,
  multi_addr: route.query.multi_addr || routerState.multi_addr,
  addr: route.query.addr || routerState.addr,
})
const data_from_rpc = ref({
  state: 0,
  relay_addr: '',
  transport_addr: '',
  visit_block_height: 0,
  register_tx_hash: ''
})
const txList = ref<any[]>([])
const tx_columns = [
  { title: '编号', dataIndex: 'no', key: 'no' },
  {
    title: '交易哈希',
    dataIndex: 'tx_hash',
    key: 'tx_hash',
    customRender: ({ text }: { text?: string }) => shortenHashWithTooltipAndClick(text, 'tx')
  },
  {
    title: '区块哈希',
    dataIndex: 'block_hash',
    key: 'block_hash',
    customRender: ({ text }: { text?: string }) => shortenHashWithTooltipAndClick(text, 'block')
  },
  { title: '区块内索引', dataIndex: 'tx_index', key: 'tx_index' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
];

// 影子区块
const shadowBlockList = ref<any[]>([])
const shadow_block_columns = [
  { title: '编号', dataIndex: 'no', key: 'no' },
  { title: '影子键', dataIndex: 'shadow_key', key: 'shadow_key' },
  { title: '父键', dataIndex: 'prev_key', key: 'prev_key' },
  { title: '偏移高度', dataIndex: 'offset_height', key: 'offset_height' },
  { title: '打开事件类型', dataIndex: 'open_event_type', key: 'open_event_type' },
  { title: '打开结果', dataIndex: 'open_result', key: 'open_result' },
]

// 传输任务
const transferTaskList = ref<any[]>([])
const transfer_task_columns = [
  { title: '编号', dataIndex: 'no', key: 'no' },
  { title: '源链ID', dataIndex: 'source_chain_id', key: 'source_chain_id' },
  { title: '目标链ID', dataIndex: 'target_chain_id', key: 'target_chain_id' },
  {
    title: '源交易哈希',
    dataIndex: 'source_tx_hash',
    key: 'source_tx_hash',
    customRender: ({ text }: { text?: string }) => shortenHashWithTooltipAndClick(text, 'tx')
  },
  { title: '状态', dataIndex: 'state', key: 'state' },
  {
    title: '目标交易哈希',
    dataIndex: 'target_tx_hash',
    key: 'target_tx_hash',
    customRender: ({ text }: { text?: string }) => shortenHashWithTooltipAndClick(text, 'tx')
  },
]

// 搬运工（中继基础配置）
const porterList = ref<any[]>([])
const porter_columns = [
  { title: '链ID', dataIndex: 'chain_id', key: 'chain_id' },
  { title: 'Gas上限', dataIndex: 'gas_bound', key: 'gas_bound' },
  { title: '提交超时(s)', dataIndex: 'commit_time_out', key: 'commit_time_out' },
  { title: '质押要求', dataIndex: 'require_stake', key: 'require_stake' },
  { title: '已处理罚金', dataIndex: 'processed_penalty', key: 'processed_penalty' },
  { title: '未处理罚金', dataIndex: 'un_processed_penalty', key: 'un_processed_penalty' },
]

// 控制交易（事件）
const controlTxList = ref<any[]>([])
const control_tx_columns = [
  { title: '编号', dataIndex: 'no', key: 'no' },
  { title: '合约地址', dataIndex: 'contract_addr', key: 'contract_addr' },
  { title: '事件签名', dataIndex: 'event_sig', key: 'event_sig' },
  {
    title: '交易哈希',
    dataIndex: 'tx_hash',
    key: 'tx_hash',
    customRender: ({ text }: { text?: string }) => shortenHashWithTooltipAndClick(text, 'tx')
  },
  { title: '事件索引', dataIndex: 'event_index', key: 'event_index' },
  { title: '是否处理', dataIndex: 'if_process', key: 'if_process' },
]
const contract_columns = [
  {
    title: '序号',
    dataIndex: 'contract_id',
    key: 'contractID',
  },
  {
    title: '合约地址',
    dataIndex: 'contract_addr',
  },
  {
    title: '管理者地址',
    dataIndex: 'manager_addr',
  },
  {
    title: '合约状态',
    dataIndex: 'contract_state',
  },
  {  
    title: '所属链',  // 修改列标题  
    dataIndex: 'chainInfo',  // 使用新的dataIndex   
  }, 
  {  
    title: '合约类型',  // 修改列标题  
    dataIndex: 'contractType',  // 使用新的dataIndex    
  }
];

const handleTabChange = (activeKey: string) => {
  if (activeKey === 'transactions') {
    fetchBridgeTxInfo(); // 请求交易记录 
  }
};

const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const copyAddress = (address: string) => {
  navigator.clipboard.writeText(address).then(() => {
    message.success('地址已复制');
  });
};


const formatHash = (hash: string) => {
  return hash && hash.length > 15 ? `${hash.substring(0, 12)}...` : hash;
};

const detailModalVisible = ref(false)
const detailType = ref<'tx' | 'block' | ''>('')
const detailTitle = ref('')
const detailHash = ref('')
const detailItems = ref<{ label: string; value: any }[]>([])
const hubBlockList = ref<any[]>([])

const shortenHashWithTooltipAndClick = (hash: string | undefined | null, dataIndex: 'tx' | 'block') => {
  const val = typeof hash === 'string' ? hash : '';
  if (!val) {
    return h('span', { class: 'hash-text disabled' }, '—');
  }
  const shortened = `${val.slice(0, 6)}...${val.slice(-4)}`;
  return h(
    Tooltip,
    { title: val, placement: 'top' },
    () =>
      h(
        'span',
        { class: 'hash-text', onClick: () => openDetailModal(dataIndex, val) },
        shortened
      )
  );
};

const openDetailModal = async (dataIndex: string, hash: string) => {
  detailItems.value = []
  detailHash.value = hash
  if (dataIndex === 'block') {
    detailType.value = 'block'
    detailTitle.value = '区块详情'
    let block = hubBlockList.value.find((b: any) => b.block_hash === hash)
    if (!block) {
      const blocks = await loadAssetJSON('../crosschain/testdata/hub_block_info.json')
      hubBlockList.value = blocks || []
      block = hubBlockList.value.find((b: any) => b.block_hash === hash)
    }
    if (block) {
      detailItems.value = [
        { label: '区块号', value: block.block_number },
        { label: '父区块哈希', value: block.parent_hash },
        { label: '出块时间', value: block.timestamp },
        { label: '交易数量', value: block.tx_count }
      ]
    }
  } else if (dataIndex === 'tx') {
    detailType.value = 'tx'
    detailTitle.value = '交易详情'
    let tx = txList.value.find((t: any) => t.tx_hash === hash)
    if (!tx) {
      const hubTxs = await loadAssetJSON('../crosschain/testdata/hub_tx_info.json')
      txList.value = hubTxs || []
      tx = txList.value.find((t: any) => t.tx_hash === hash)
    }
    if (tx) {
      detailItems.value = [
        { label: '交易哈希', value: tx.tx_hash },
        { label: '区块哈希', value: tx.block_hash },
        { label: '区块内索引', value: tx.tx_index },
        { label: '创建时间', value: tx.created_at }
      ]
    }
  }
  detailModalVisible.value = true
}

const handleTxClick = (tx_hash: string) => {
  router.push({
    path: `/multi/tx/${tx_hash}`,
    state: {
      multi_addr: data_from_route.value.multi_addr,
      rpc: data_from_route.value.rpc,
    }
  })
}
const handleBlockClick = (block_hash: string) => {
  router.push({
    path: `/multi/block/${block_hash}`,
    state: {
      multi_addr: data_from_route.value.multi_addr,
      rpc: data_from_route.value.rpc,
    }
  })
}
const fetchBridgeTxInfo = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:3020/api/bridgeTxs')
    txList.value = response.data
    //console.log(txList)  
  } catch (err) {
    console.error('获取跨链区信息失败:', err)
    message.error('获取跨链区信息失败')
  } finally {
    loading.value = false;
  }
};
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
const fetchDataFromDB = async () => {
  await fetchBridgeTxInfo()
};
const fetchDataFromRPC = async () => {
  //await fetchDataFromDB();
  provider = new ethers.JsonRpcProvider(data_from_route.value['rpc']);
  let multiABI = [
    "function getSourceChainNum() view returns (uint256)",
    "function getSystemContractNum() view returns (uint256)",
    "function getSystemContractAddressByLevelID(uint256, uint256)view returns (address)",
    "function getSystemContractAddressByLevelID(uint256, uint256)view returns (address)",
    "function getSourceChainInfo(uint256) view returns (string, string, uint256, uint256, address[])"
  ];
  const multiContract = new ethers.Contract(data_from_route.value['multi_addr'], multiABI, provider);
  let res = await multiContract.getSourceChainInfo(data_from_route.value.chain_id);
  console.log(res)
  data_from_rpc.value = {
    'state': res[2],
    'relay_addr': res[4][0],
    'transport_addr': res[4][0],
  }
}
const fetchData = async () => {
  loading.value = true;
  const chainId = data_from_route.value.chain_id;

  // 概览数据
  const sourceChainInfo = await loadAssetJSON('../crosschain/testdata/source_chain_info.json');
  const systemContractInfo = await loadAssetJSON('../crosschain/testdata/system_contract_info.json');
  if (sourceChainInfo) {
    const chainInfo = sourceChainInfo.find((c: any) => c.chain_id === chainId);
    if (chainInfo) {
      data_from_rpc.value.state = chainInfo.state;
      data_from_rpc.value.visit_block_height = chainInfo.visit_block_height;
      data_from_rpc.value.register_tx_hash = chainInfo.register_tx_hash;
    }
  }
  if (systemContractInfo) {
    const byChain = systemContractInfo.filter((c: any) => c.chain_id === chainId);
    const relay = byChain.find((c: any) => c.level_id === 1);
    const transport = byChain.find((c: any) => c.level_id === 2);
    data_from_rpc.value.relay_addr = relay?.contract_addr || '';
    data_from_rpc.value.transport_addr = transport?.contract_addr || '';
  }

  // 业务交易
  const hubTxs = await loadAssetJSON('../crosschain/testdata/hub_tx_info.json');
  if (hubTxs) txList.value = hubTxs;

  // 影子区块
  const shadowBlocks = await loadAssetJSON('../crosschain/testdata/source_shadow_info_101.json');
  if (shadowBlocks) shadowBlockList.value = shadowBlocks;

  // 传输任务
  const transferTasks = await loadAssetJSON('../crosschain/testdata/transport_task_info_101.json');
  if (transferTasks) transferTaskList.value = transferTasks;

  // 搬运工（中继配置）
  const porterCfg = await loadAssetJSON('../crosschain/testdata/relay_basic_info.json');
  if (porterCfg) porterList.value = porterCfg;

  // 控制交易（事件数据）
  const controlTxs = await loadAssetJSON('../crosschain/testdata/event_info.json');
  if (controlTxs) controlTxList.value = controlTxs;

  // 区块数据（供弹窗使用）
  const hubBlocks = await loadAssetJSON('../crosschain/testdata/hub_block_info.json');
  if (hubBlocks) hubBlockList.value = hubBlocks;

  loading.value = false;
}
onMounted(fetchData)

</script>

<style lang="scss" scoped>
.layout-container {
  background-color: #f0f2f5;
  padding: 24px;
}

.header-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
  }
}

.info-card {
  .ant-tag {
    margin-right: 8px;
  }
}

.section-tabs { /* 概览与下方选项卡的垂直间距 */
  margin-top: 16px;
}

.address-link {
  position: relative;
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s;

  .swap-icon {
    margin-left: 4px;
    transition: transform 0.3s;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
    transition: width 0.3s ease-in-out;
  }

  &:hover {
    color: #40a9ff;

    .swap-icon {
      transform: rotate(180deg);
    }

    &::after {
      width: 100%;
    }
  }
}

.address-link.disabled {
  pointer-events: none;
  color: inherit;
  cursor: default;
}

.copy-icon {
  margin-left: 8px;
  cursor: pointer;
  color: #1890ff;
  transition: color 0.3s;

  &:hover {
    color: #40a9ff;
  }
}


a {
  color: #c1e3ff;
}

.hash-text {
  font-family: monospace;
  color: #1890ff;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #0958d9;
    text-decoration: underline;
  }
}
 .hash-text.disabled {
   color: #999;
   cursor: default;
   text-decoration: none;
 }

:deep(.ant-tooltip-inner) {
  max-width: 500px;
  /* 控制 Tooltip 的宽度 */
}

.custom-table :deep(.ant-table) {
  background: #fff; /* 表格主体背景改为白色 */
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f7fbff; /* 行悬停高亮 */
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa; /* 表头浅灰，提升对比度 */
}
</style>
