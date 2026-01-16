<template>
  <a-layout class="Explorer">
    <a-layout-header class="header-box">
      <div class="searchbar-container">
        <div class="search-row">
          <a-select v-model:value="searchType" size="large" class="search-select" style="width: 130px">
            <a-select-option value="accountAddress">账户地址</a-select-option>
            <a-select-option value="txHash">交易哈希</a-select-option>
            <a-select-option value="blockNumber">区块号</a-select-option>
            <a-select-option value="blockHash">区块哈希</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="value"
            size="large"
            :allow-clear="true"
            class="search-input"
            placeholder="请输入查询值"
            @search="onSearch"
          >
            <template #enterButton>
              <a-button type="default" size="large">Search</a-button>
            </template>
          </a-input-search>
        </div>
      </div>
    </a-layout-header>
    <a-layout-content class="content-box middle-box">
      <a-row class="title-row">
        <div v-if="blockInfo" class="block-header">
          <div class="block-title-box">
            <span class="block-title">区块</span>
            <span class="block-number">#{{ blockInfo.number }}</span>
            <a-button class="nav-btn" type="default" size="small" shape="circle" :disabled="blockInfo.number <= 0" @click="goToPrevBlock" title="前一区块" ghost>
              <LeftOutlined />
            </a-button>
            <a-button class="nav-btn" type="default" size="small" shape="circle" @click="goToNextBlock" title="后一区块" ghost>
              <RightOutlined />
            </a-button>
          </div>
        </div>
        <h1 v-else>区块信息加载中...</h1>
      </a-row>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="信息总览">
          <div v-if="blockRaw">
            <!-- 动态展示：除共识相关外的所有 JSON 字段 -->
            <a-list class="overview-list card-panel">
              <a-row v-for="([k, v], i) in overviewEntries" :key="k + ':' + i">
                <a-list-item>
                  <Tooltip :title="getFieldDescription(k)">
                    <QuestionCircleOutlined class="desc-icon" />
                  </Tooltip>
                  <strong class="label">{{ k }}:</strong>
                  <span v-if="k !== 'gasUsed'" class="value-text">{{ stringifyValue(v) }}</span>
                  <CopyOutlined v-if="isCopyableKey(k)" class="copy-icon" @click="copyToClipboard(String(v))" />
                  <div v-if="k === 'gasUsed'" class="gas-usage">
                    <div class="gas-numbers">{{ gasUsedDisplay }} / {{ gasLimitDisplay }} <span class="gas-percent">({{ gasPercent }}%)</span></div>
                  </div>
                </a-list-item>
              </a-row>
            </a-list>
          </div>
          <div v-else>
            <p>加载中...</p>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="共识信息">
          <div v-if="blockRaw">
            <a-list class="consensus-list card-panel">
              <a-row v-for="([k, v], i) in consensusEntries" :key="k + ':' + i">
                <a-list-item>
                  <Tooltip :title="getFieldDescription(k)">
                    <QuestionCircleOutlined class="desc-icon" />
                  </Tooltip>
                  <strong class="label">{{ k }}:</strong>
                  <span v-if="k !== 'posVoting'" class="value-text">{{ stringifyValue(v) }}</span>
                  <span v-else class="value-text pos-inline">{{ posVotingDisplay }}</span>
                  <a v-if="k === 'posVoting' && !posVotingExpanded" class="detail-link" @click="posVotingExpanded = true">详情</a>
                  <a v-if="k === 'posVoting' && posVotingExpanded" class="detail-link" @click="posVotingExpanded = false">收起</a>
                  <CopyOutlined v-if="isCopyableKey(k)" class="copy-icon" @click="copyToClipboard(String(v))" />
                </a-list-item>
              </a-row>
            </a-list>
            
          </div>
          <div v-else>
            <p>加载中...</p>
          </div>
        </a-tab-pane>
        
      </a-tabs>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, h, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LeftOutlined, RightOutlined, CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';
import { message, Tooltip } from 'ant-design-vue';
import { getBlockByNumber, getBlockByHash } from '../../../js/service/explorerBlocks';
import { getTransactionByHash } from '../../../js/service/explorerTransactions';
import { getAccountByAddress } from '../../../js/service/explorerAccounts';

const value = ref<string>('');
const searchType = ref<'accountAddress' | 'txHash' | 'blockNumber' | 'blockHash'>('txHash');
const onSearch = async (searchValue: string) => {
  const input = String(searchValue || value.value || '').trim();
  if (!input) {
    message.warning('请输入查询值');
    return;
  }
  try {
    if (searchType.value === 'accountAddress') {
      await getAccountByAddress(input);
      router.push({ name: 'AccountInfo', params: { address: input } });
      return;
    }
    if (searchType.value === 'txHash') {
      await getTransactionByHash(input);
      router.push({ name: 'TransactionInfo', params: { txnHash: input } });
      return;
    }
    if (searchType.value === 'blockNumber') {
      const num = Number(input);
      if (isNaN(num)) {
        message.error('请输入有效的区块号');
        return;
      }
      await getBlockByNumber(String(num));
      router.push({ name: 'BlockInfo', params: { number: String(num) } });
      return;
    }
    if (searchType.value === 'blockHash') {
      await getBlockByHash(input);
      router.push({ name: 'BlockInfo', params: { number: '0' }, query: { hash: input } });
      return;
    }
  } catch (err) {
    message.error('未找到匹配的结果');
  }
};
const route = useRoute();
const router = useRouter();
const blockInfo = ref<any>(null);
const blockRaw = ref<any>(null);
const activeKey = ref('1'); // 默认设置为 '1'，即您的第一个 tab

const normalizeBlock = (res: any) => {
  if (!res) return null;
  return {
    number: res.number ?? res.blockNumber,
    hash: res.hash ?? res.blockHash,
    timestamp: res.timestamp,
    miner: res.miner ?? res.feeRecipient,
    feeRecipient: res.feeRecipient ?? res.miner,
    transactions: Array.isArray(res.transactions) ? res.transactions.length : res.transactionCount ?? res.transactionsCount ?? 0,
    gasLimit: res.gasLimit,
    gasUsed: res.gasUsed,
    parentHash: res.parentHash ?? res.parentBlockHash,
    size: res.size ?? res.blockSize,
    nonce: res.nonce,
    baseFee: res.baseFee,
    incentive: res.incentive,
    commitTxLength: res.commitTxLength,
    posLeader: res.posLeader,
    posVoting: res.posVoting,
    powDifficulty: res.powDifficulty ?? res.difficulty,
    powGas: res.powGas,
    powPrice: res.powPrice,
  };
};

const loadBlockByNumber = async (number: number) => {
  try {
    const res: any = await getBlockByNumber(String(number));
    blockInfo.value = normalizeBlock(res);
    blockRaw.value = res;
  } catch (err) {
    console.error('获取区块失败(按高度):', err);
    message.error('获取区块失败');
    blockInfo.value = null;
  }
};

const loadBlockByHash = async (hash: string) => {
  try {
    const res: any = await getBlockByHash(hash);
    blockInfo.value = normalizeBlock(res);
    blockRaw.value = res;
  } catch (err) {
    console.error('获取区块失败(按哈希):', err);
    message.error('获取区块失败');
    blockInfo.value = null;
  }
};

const initLoad = async () => {
  const paramNumber = Number(route.params.number);
  const paramHash = route.query?.hash as string | undefined;
  if (paramHash) {
    await loadBlockByHash(paramHash);
  } else if (!isNaN(paramNumber)) {
    await loadBlockByNumber(paramNumber);
  }
};

onMounted(initLoad);

watch(
  () => ({ number: route.params.number, hash: route.query?.hash }),
  async (newParams) => {
    const num = Number(newParams.number);
    if (newParams.hash) {
      await loadBlockByHash(String(newParams.hash));
    } else if (!isNaN(num)) {
      await loadBlockByNumber(num);
    }
  },
);
const goToHome = () => {
  router.push('../index');
};
const goToBlock = async (newNumber: number) => {
  if (newNumber >= 0) {
    router.push({ name: 'BlockInfo', params: { number: String(newNumber) } });
    activeKey.value = '1';
  }
};

const goToPrevBlock = () => {
  if (blockInfo.value?.number !== undefined) {
    goToBlock(blockInfo.value.number - 1);
  }
};
const goToNextBlock = () => {
  if (blockInfo.value?.number !== undefined) {
    goToBlock(blockInfo.value.number + 1);
  }
};
const copyToClipboard = (text: string) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('已复制到剪贴板');
      })
      .catch((err) => {
        console.error('复制失败:', err);
        fallbackCopy(text);
      });
  } else {
    fallbackCopy(text);
  }
};

const fallbackCopy = (text: string) => {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    const ok = document.execCommand('copy');
    if (ok) message.success('已复制到剪贴板');
    else message.error('复制失败');
  } catch (e) {
    message.error('复制失败');
  }
  document.body.removeChild(ta);
};
const parentBlockHash = computed(() => {
  if (blockInfo.value) {
    if (blockInfo.value.number === 0) return '创世区块';
    return blockInfo.value.parentHash ?? '未知';
  }
  return null;
});

// 字段分组（英文键名）
const consensusKeys = [
  'parentHash',
  'posLeader',
  'posVoting',
  'powDifficulty',
  'powGas',
  'powPrice',
  'difficulty',
  'randomNumber',
  'randomRoot',
];

const consensusEntries = computed(() => {
  if (!blockRaw.value) return [];
  return Object.entries(blockRaw.value).filter(([k]) => consensusKeys.includes(k as string));
});

const overviewEntries = computed(() => {
  if (!blockRaw.value) return [];
  return Object.entries(blockRaw.value).filter(([k]) => !consensusKeys.includes(k as string));
});

const stringifyValue = (v: any) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  }
  return String(v);
};

const isCopyableKey = (k: string) => {
  return ['blockHash', 'miner', 'parentHash', 'posLeader', 'randomNumber', 'randomRoot'].includes(k);
};

// 字段说明：用于 Tooltip 展示
const fieldDescriptions: Record<string, string> = {
  baseFee: 'EIP-1559 基础费，每个 Gas 的基础价格',
  blockHash: '区块头哈希（唯一标识该区块）',
  blockNumber: '区块高度（从创世区块起计数）',
  commitTxLength: '该区块中已提交的交易数量',
  createdAt: '区块创建时间（服务端记录）',
  difficulty: '共识难度值（通常用于 PoW）',
  gasLimit: '该区块允许的最大 Gas 总量',
  gasUsed: '该区块内所有交易实际消耗的 Gas',
  id: '内部标识（数据库主键或索引）',
  incentive: '区块奖励/费用收入总和',
  miner: '打包区块的矿工或费用接收者',
  nonce: 'PoW 随机数（用于满足难度要求）',
  parentHash: '父区块哈希（指向前一个区块）',
  posLeader: 'PoS 领导者地址（当前轮次提议者）',
  posVoting: 'PoS 投票原始数据（JSON/Hex 编码）',
  powDifficulty: '工作量证明的难度值',
  powGas: 'PoW 相关 Gas 配置',
  powPrice: 'PoW 单价或费用配置',
  randomNumber: '随机数（可能来自 VRF）',
  randomRoot: '随机根哈希（随机性链的根）',
  tainted: '污染标记或附加说明',
  timestamp: '区块时间戳（链上记录）',
  transactionCount: '该区块中的交易总数量',
};

const getFieldDescription = (k: string) => fieldDescriptions[k] || '该字段的原始值';

const formatTime = (timestamp: number | string) => {
  if (!timestamp) return '';
  const num = Number(timestamp);
  if (!isNaN(num)) {
    const timeMs = num < 100000000000 ? num * 1000 : num;
    const date = new Date(timeMs);
    return date.toLocaleString();
  }
  if (typeof timestamp === 'string') {
    const isoString = timestamp.replace(' ', 'T');
    const date = new Date(isoString);
    if (!isNaN(date.getTime())) return date.toLocaleString();
    return timestamp;
  }
  return '';
};

const formatAge = (timestamp: number | string) => {
  if (!timestamp) return '';
  let timeMs: number;
  const num = Number(timestamp);
  if (!isNaN(num)) {
    timeMs = num < 100000000000 ? num * 1000 : num;
  } else if (typeof timestamp === 'string') {
    const isoString = timestamp.replace(' ', 'T');
    timeMs = new Date(isoString).getTime();
  } else {
    return '';
  }
  const diff = Date.now() - timeMs;
  if (diff < 1000) return '刚刚';
  if (diff < 60000) return `${Math.floor(diff / 1000)} 秒前`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return `${Math.floor(diff / 86400000)} 天前`;
};

const formatNumber = (val: any) => {
  const num = Number(val ?? 0);
  if (Number.isNaN(num)) return String(val ?? '');
  return num.toLocaleString();
};

// 安全解析数值（支持十六进制字符串/BigNumber/普通数字）
const toNumberSafe = (val: any): number => {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const s = val.trim();
    if (s.startsWith('0x') || s.startsWith('0X')) {
      const parsed = Number.parseInt(s, 16);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    const parsed = Number(s);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof val === 'object') {
    const hex = (val as any)?._hex;
    if (typeof hex === 'string') {
      const parsed = Number.parseInt(hex, 16);
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

// 统一 gas 数值来源
const gasUsedNumber = computed(() => {
  const used = blockRaw.value?.gasUsed;
  return toNumberSafe(used);
});
const gasLimitNumber = computed(() => {
  const limit = blockRaw.value?.gasLimit;
  return toNumberSafe(limit);
});
const gasUsedDisplay = computed(() => gasUsedNumber.value.toLocaleString());
const gasLimitDisplay = computed(() => gasLimitNumber.value.toLocaleString());

const gasPercent = computed(() => {
  const used = gasUsedNumber.value;
  const limit = gasLimitNumber.value;
  if (!limit) return '0.00';
  return ((used / limit) * 100).toFixed(2);
});

const gasPercentNum = computed(() => {
  const p = parseFloat(String(gasPercent.value));
  return Number.isFinite(p) ? p : 0;
});

// 仪表盘颜色（与示例图红色一致）
const gasGaugeColor = '#f5222d';

// posVoting 原地展开显示
const posVotingExpanded = ref(false);
const shortPosVoting = computed(() => {
  const s = String(blockRaw.value?.posVoting ?? '');
  if (!s) return '';
  return s.length > 96 ? s.slice(0, 96) + '...' : s;
});
const formatPosVoting = (v: any) => {
  try {
    if (typeof v === 'string') return v;
    return JSON.stringify(v, null, 2);
  } catch (e) {
    return String(v ?? '');
  }
};
const posVotingDisplay = computed(() => (posVotingExpanded.value ? formatPosVoting(blockRaw.value?.posVoting) : shortPosVoting.value));

// 去掉父地址跳转，不做导航
</script>

<style scoped>
.Explorer {
  width: 100%;
  margin: 0 auto;
}
.header-box,
.middle-box,
.footer-box {
  margin-left: 2%;
  margin-right: 2%;
  /*border: 1px solid black;*/
  border-radius: 10px;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: transparent;
}
.header-box {
  height: auto; /* 根据内容调整高度 */
}

.middle-box {
  height: auto;
}

.footer-box {
  height: auto;
}
.block-title {
  color: black;
  font-weight: bold;
  font-size: x-large;
}

.block-number {
  color: #131313;
  font-size: medium;
}
.ant-dropdown-link {
  color: black;
}
.navigation {
  font-size: large;
}

/* 标题与导航按钮布局 */
.title-row { margin-bottom: 8px; }
.block-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.block-title-box h1, .block-title-box { display: flex; align-items: baseline; gap: 8px; }
.block-nav { display: flex; gap: 8px; }

/* 搜索框样式与位置优化 */
.searchbar-container {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 12px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 60%;
  max-width: 720px;
}

.search-select {
  flex: none;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.search-input :deep(.ant-input-affix-wrapper) {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  border-color: #d9d9d9;
  transition: all 0.2s ease-in-out;
}

.search-input :deep(.ant-input-affix-wrapper-focused) {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.search-input :deep(.ant-input-search-button),
.search-input :deep(.ant-input-group-addon .ant-btn) {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  background-color: #ffffff;
  color: rgba(0, 0, 0, 0.88);
  border-color: #d9d9d9;
}

.search-input :deep(.ant-input-group-addon .ant-btn:hover),
.search-input :deep(.ant-input-search-button:hover) {
  border-color: #1677ff;
  color: #1677ff;
}

/* 信息列表美化 */
.overview-list :deep(.ant-list-item),
.consensus-list :deep(.ant-list-item) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-panel {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  user-select: text; /* 允许选择文本 */
}

.label {
  min-width: 160px;
  color: #1f1f1f;
  user-select: text;
}

.hash-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  padding: 2px 6px;
  border-radius: 6px;
}

.value-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  user-select: text;
}
.pos-inline { white-space: pre-wrap; word-break: break-word; }

.desc-icon {
  color: #8c8c8c;
  margin-right: 6px;
}

.copy-icon {
  cursor: pointer;
  margin-left: 8px;
  color: #8c8c8c;
}
.copy-icon:hover {
  color: #1677ff;
}

.detail-link {
  margin-left: 8px;
  color: #1890ff;
  cursor: pointer;
}
</style>
