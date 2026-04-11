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
        <div v-if="transactionInfo" class="block-header">
          <div class="block-title-box">
            <span class="block-title">交易</span>
            <span class="block-number">{{ transactionInfo.txHash }}</span>
            <CopyOutlined class="copy-icon" @click.stop="copyToClipboard(transactionInfo.txHash)" />
          </div>
        </div>
        <h1 v-else>交易信息加载中...</h1>
      </a-row>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="信息总览">
          <div v-if="transactionInfo">
            <a-list class="overview-list card-panel">
              <a-row v-for="([k, v], i) in overviewEntries" :key="k + ':' + i">
                <a-list-item>
                  <Tooltip :title="getFieldDescription(k)">
                    <QuestionCircleOutlined class="desc-icon" />
                  </Tooltip>
                  <strong class="label">{{ getLabel(k) }}:</strong>
                  <span v-if="k === 'txHash'" class="hash-text">{{ String(v) }}</span>
                  <span v-if="k === 'status'">
                    <a-tag :color="Number(v) === 0 ? 'green' : 'red'">{{ Number(v) === 0 ? '成功' : '失败' }}</a-tag>
                  </span>
                  <span v-if="k === 'blockNumber'" style="color: #1890ff; cursor: pointer" @click="navigateToBlockInfo(String(v))">{{ v }}</span>
                  <span v-if="k === 'blockHash'" class="hash-text">{{ v }}</span>
                  <span v-if="k === 'timestamp'" class="value-text">{{ formatTime(String(v)) }}</span>
                  <span v-if="k === 'createdAt'" class="value-text">{{ formatTime(String(v)) }}</span>
                  <span v-if="k === 'fromAddress'" class="hash-text">{{ String(v) }}</span>
                  <span v-if="k === 'toAddress'" class="hash-text">{{ v ? String(v) : '-' }}</span>
                  <span v-if="k === 'value'" class="value-text">{{ formatEthWithWei(String(v)) }}</span>
                  <span v-if="k === 'gasUsed'" class="value-text">{{ Number(v || 0).toLocaleString() }}</span>
                  <span v-if="k === 'gasPrice'" class="value-text">{{ toGwei(String(v)) }} Gwei</span>
                  <span v-if="k === 'nonce'" class="value-text">{{ v }}</span>
                  <div v-if="k === 'input'" class="input-inline">
                    <span class="hash-text ellipsis-one-line">{{ String(v) }}</span>
                    <span class="ellipsis-action" @click.stop="openInputDetails">...</span>
                  </div>
                  <span v-if="k === 'transactionIndex'" class="value-text">{{ v }}</span>
                  <span v-if="k === 'txType'" class="value-text">{{ formatTxType(String(v)) }}</span>
                  <span v-if="k === 'id'" class="value-text">{{ v }}</span>
                  <CopyOutlined v-if="isCopyableKey(k) && v" class="copy-icon" @click.stop="copyToClipboard(String(v))" />
                </a-list-item>
              </a-row>
            </a-list>
          </div>
          <div v-else>
            <p>加载中...</p>
          </div>
        </a-tab-pane>
      </a-tabs>
      <a-modal v-model:open="showInputModal" title="Input Details" width="800px" :footer="null">
        <pre class="modal-pre">{{ parsedInput ? JSON.stringify(parsedInput, null, 2) : currentInputHex }}</pre>
      </a-modal>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QuestionCircleOutlined, CopyOutlined, ThunderboltOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
import { Tooltip, message } from 'ant-design-vue';
import { getTransactionByHash } from '../../../js/service/explorerTransactions';
import { getBlockByNumber, getBlockByHash } from '../../../js/service/explorerBlocks';
import { getAccountByAddress } from '../../../js/service/explorerAccounts';

const route = useRoute();
const router = useRouter();
const transactionInfo = ref(null);
const activeKey = ref('1');
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

const showInputModal = ref(false);
const parsedInput = ref<any>(null);
const currentInputHex = computed(() => String((transactionInfo.value as any)?.input || ''));
const parseInputData = async (inputHex: string) => {
  return null;
};
const openInputDetails = async () => {
  const hex = String((transactionInfo.value as any)?.input || '');
  parsedInput.value = await parseInputData(hex);
  showInputModal.value = true;
};

const loadTransactionByHash = async (hash: string) => {
  try {
    const res: any = await getTransactionByHash(hash);
    transactionInfo.value = res?.data || res;
  } catch (err) {
    console.error('Transaction not found', err);
    transactionInfo.value = null;
  }
};

onMounted(() => {
  const txnHash = route.params.txnHash;
  loadTransactionByHash(txnHash);
});

watch(
  () => route.params.txnHash,
  async (newHash, oldHash) => {
    if (typeof newHash === 'string' && newHash) {
      await loadTransactionByHash(String(newHash));
      activeKey.value = '1';
    }
  },
);
const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('地址已复制到剪贴板');
      })
      .catch((err) => {
        console.error('复制失败:', err);
        message.error('复制失败');
      });
  } else {
    console.error('浏览器不支持剪贴板操作');
    message.error('浏览器不支持剪贴板操作');
  }
};

const formatHash = (hash: string) => {
  if (!hash) return '';
  return hash.substring(0, 6) + '...' + hash.substring(hash.length - 4);
};

const formatTime = (timestamp: number | string) => {
  if (!timestamp) return '';
  const num = Number(timestamp);
  if (!isNaN(num)) {
    if (num < 100000000000) {
      return new Date(num * 1000).toLocaleString();
    }
    return new Date(num).toLocaleString();
  }
  if (typeof timestamp === 'string') {
    const isoString = timestamp.replace(' ', 'T');
    const date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString();
    }
    return timestamp;
  }
  return '';
};

const convertWeiToEth = (wei: number | string) => {
  const n = Number(wei || 0);
  return (n / 1e18).toFixed(6);
};
const toGwei = (wei: number | string) => {
  const n = Number(wei || 0);
  return (n / 1e9).toFixed(6);
};
const formatEthWithWei = (wei: number | string) => {
  const n = Number(wei || 0);
  const eth = (n / 1e18).toFixed(6);
  if (eth === '0.000000') {
    return `${eth} ETH (${n} Wei)`;
  }
  return `${eth} ETH`;
};
const decodeInputBasic = (hex: string) => {
  const selector = hex.slice(0, 10);
  const data = hex.slice(10);
  const slots = data ? Math.ceil(data.length / 64) : 0;
  return { selector, slots };
};
const formatTxType = (t: string) => {
  const num = typeof t === 'string' && t.startsWith('0x') ? parseInt(t, 16) : Number(t);
  const map: Record<number, string> = {
    0: 'Legacy - 传统交易',
    1: 'AccessList - 访问列表交易',
    2: 'DynamicFee - 动态费用交易（EIP-1559）',
    3: 'Blob - Blob交易',
    4: 'Pow - PoW交易（磐古扩展）',
    5: 'DynamicCrypto - 动态加密交易（磐古扩展）',
    6: 'Deposit - 存款交易（磐古扩展）',
    7: 'Nested - 嵌套交易（磐古扩展）',
  };
  return map[num] ?? String(t);
};

const navigateToTransactionByHash = (hash: string) => {
  router.push({ name: 'TransactionInfo', params: { txnHash: hash } });
};

const navigateToBlockInfo = (blockNumber: number | string) => {
  router.push({ name: 'BlockInfo', params: { number: String(blockNumber) } });
};

const overviewEntries = computed(() => {
  const t: any = transactionInfo.value || {};
  return [
    ['txHash', t.txHash],
    ['status', t.status],
    ['blockNumber', t.blockNumber],
    ['blockHash', t.blockHash],
    ['timestamp', t.timestamp],
    ['createdAt', t.createdAt],
    ['fromAddress', t.fromAddress],
    ['toAddress', t.toAddress],
    ['value', t.value],
    ['gasUsed', t.gasUsed],
    ['gasPrice', t.gasPrice],
    ['nonce', t.nonce],
    ['input', t.input],
    ['transactionIndex', t.transactionIndex],
    ['txType', t.txType],
    ['id', t.id],
  ];
});

const isCopyableKey = (k: string) => {
  return ['txHash', 'blockHash', 'fromAddress', 'toAddress', 'input'].includes(k);
};

const getLabel = (k: string) => {
  const map: Record<string, string> = {
    txHash: 'Transaction Hash',
    status: 'Status',
    blockNumber: 'Block',
    blockHash: 'Block Hash',
    timestamp: 'Timestamp',
    createdAt: 'Created At',
    fromAddress: 'From',
    toAddress: 'To',
    value: 'Value',
    gasUsed: 'Gas Used',
    gasPrice: 'Gas Price',
    nonce: 'Nonce',
    input: 'Input',
    transactionIndex: 'Transaction Index',
    txType: 'Type',
    id: 'ID',
  };
  return map[k] || k;
};

const getFieldDescription = (k: string) => {
  const map: Record<string, string> = {
    txHash: 'Unique identifier of the transaction',
    status: 'Transaction status',
    blockNumber: 'Block number containing this transaction',
    blockHash: 'Block hash containing this transaction',
    timestamp: 'Blockchain timestamp',
    createdAt: 'Record creation time',
    fromAddress: 'Sender address',
    toAddress: 'Recipient address',
    value: 'Transfer amount',
    gasUsed: 'Gas used by execution',
    gasPrice: 'Price per unit of gas',
    nonce: 'Transaction counter',
    input: 'Transaction input data',
    transactionIndex: 'Index within the block',
    txType: 'Transaction type',
    id: 'Record ID',
  };
  return map[k] || k;
};

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

.title-row { margin-bottom: 8px; }
.block-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.block-title-box { display: flex; align-items: baseline; gap: 8px; }

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

.hash-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  padding: 2px 6px;
  border-radius: 6px;
}
.copy-icon {
  cursor: pointer;
  margin-left: 8px;
  color: #8c8c8c;
}
.copy-icon:hover {
  color: #1677ff;
}
.overview-list :deep(.ant-list-item) {
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
  user-select: text;
}
.label {
  min-width: 160px;
  color: #1f1f1f;
  user-select: text;
}
.value-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  user-select: text;
}
.desc-icon {
  color: #8c8c8c;
  margin-right: 6px;
}
.input-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ellipsis-one-line {
  max-width: 600px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
.ellipsis-action {
  cursor: pointer;
  color: #1677ff;
  font-weight: bold;
  padding: 0 4px;
}
.ellipsis-action:hover {
  color: #0958d9;
}
.modal-pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
