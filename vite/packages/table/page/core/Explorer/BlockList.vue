<template>
  <a-layout class="Explorer">
    <a-layout-header class="header-box">
      <!-- 搜索框 -->
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
      <div style="font-size: 32px; text-align: center; font-weight: bold; padding-bottom: 10px">区块信息</div>
      <a-row>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px; padding-right: 10px">
          <a-card>
            <div class="key-data">
              <div class="title">当前区块</div>
              <div class="data-card-data">{{ blockStats.currentBlock }}</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px; padding-right: 10px">
          <a-card>
            <div class="key-data">
              <div class="title">LAST SAFE BLOCK</div>
              <div class="data-card-data">{{ blockStats.lastSafeBlock }}</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px; padding-right: 10px">
          <a-card>
            <div class="key-data">
              <div class="title">当前出块奖励</div>
              <div class="data-card-data">{{ blockStats.blockReward }}</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px; padding-right: 10px">
          <a-card>
            <div class="key-data">
              <div class="title">10分钟内产生区块数</div>
              <div class="data-card-data">{{ blockStats.blocks10m }}</div>
            </div>
          </a-card>
        </a-col>
      </a-row>
      <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px;">
        Total of {{ pagination.total.toLocaleString() }} blocks
      </div>
      <a-table
        class="ant-table-custom"
        size="middle"
        :columns="block_columns"
        :data-source="data"
        :pagination="pagination"
        @change="handleTableChange"
        :row-class-name="() => 'custom-row'"
        :style="{ fontSize: '16px' }"
      >
        <template v-slot:bodyCell="{ column, record }">
          <template v-if="column.key === 'blockNumber'">
            <span style="color: #1890ff; cursor: pointer" @click="navigateToBlockInfo(record)">{{ record.blockNumber }}</span>
          </template>
          <template v-if="column.key === 'blockHash'">
             <div class="address-container">
                <a-tooltip :title="record.blockHash">
                  <span class="address-link" style="cursor: pointer; color: #1890ff;" @click="navigateToBlockInfoByHash(record.blockHash)">{{ formatHash(record.blockHash) }}</span>
                </a-tooltip>
                <CopyOutlined class="copy-icon" @click.stop="copyToClipboard(record.blockHash)" />
             </div>
          </template>
          <template v-if="column.key === 'timestamp'">
             <span>{{ formatTime(record.timestamp) }}</span>
          </template>
          <template v-if="column.key === 'transactionCount'">
             <span style="color: #1890ff;">{{ record.transactionCount }}</span>
          </template>
          <template v-if="column.key === 'miner'">
             <div class="address-container">
                <a-tooltip :title="record.miner">
                  <span class="address-link" style="cursor: pointer; color: #1890ff;">{{ formatHash(record.miner) }}</span>
                </a-tooltip>
                <CopyOutlined class="copy-icon" @click.stop="copyToClipboard(record.miner)" />
             </div>
          </template>
          <template v-if="column.key === 'gasUsedVal'">
             <span>{{ Number(record.gasUsed).toLocaleString() }}</span>
          </template>
          <template v-if="column.key === 'gasLimitVal'">
             <span>{{ Number(record.gasLimit).toLocaleString() }}</span>
          </template>
          <template v-if="column.key === 'gas'">
            <div>
              <div>{{ Number(record.gasUsed).toLocaleString() }} / {{ Number(record.gasLimit).toLocaleString() }} <span style="color: #999; font-size: 12px;">({{ ((Number(record.gasUsed) / Number(record.gasLimit)) * 100).toFixed(2) }}%)</span></div>
              <a-progress :percent="(Number(record.gasUsed) / Number(record.gasLimit)) * 100" :show-info="false" size="small" stroke-color="#1890ff" />
            </div>
          </template>
        </template>
      </a-table>
    </a-layout-content>
    <a-layout-footer class="footer-box"> </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import { RightOutlined, ClockCircleOutlined, BlockOutlined, TransactionOutlined, UserOutlined, FireOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { getBlocks, getBlockByHash, getBlockByNumber } from '../../../js/service/explorerBlocks';
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
const router = useRouter();
// 可以在此添加数据、方法等
const blockStats = ref({
  currentBlock: 0,
  lastSafeBlock: 0,
  blockReward: '0 ETH',
  blocks10m: 0,
});

const block_columns = [
  {
    title: '区块号',
    dataIndex: 'blockNumber',
    key: 'blockNumber',
    width: 100,
  },
  {
    title: '区块哈希',
    dataIndex: 'blockHash',
    key: 'blockHash',
    width: 150,
  },
  {
    title: '时间戳',
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: 180,
  },
  {
    title: '矿工',
    dataIndex: 'miner',
    key: 'miner',
    width: 150,
  },
  {
    title: '交易数量',
    dataIndex: 'transactionCount',
    key: 'transactionCount',
    width: 100,
  },
  {
    title: 'Gas消耗',
    dataIndex: 'gasUsed',
    key: 'gasUsedVal',
    width: 120,
  },
  {
    title: 'Gas上限',
    dataIndex: 'gasLimit',
    key: 'gasLimitVal',
    width: 120,
  },
  {
    title: 'Gas使用情况',
    key: 'gas',
    width: 200,
  },
];
const data = ref([]);

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
});

const fetchData = async (page = 1, size = 10) => {
  try {
    // API is 0-indexed, so we subtract 1 from the page number
    const res: any = await getBlocks(page - 1, size);
    // 兼容可能的分页结构或直接数组结构
    if (Array.isArray(res)) {
      data.value = res;
      pagination.value.total = res.length;
    } else if (res && Array.isArray(res.content)) {
      data.value = res.content;
      pagination.value.total = res.totalElements || res.total || 0;
    } else if (res && Array.isArray(res.records)) {
      data.value = res.records;
      pagination.value.total = res.total || 0;
    } else {
      console.warn('Unknown response structure', res);
      data.value = [];
      pagination.value.total = 0;
    }
    pagination.value.current = page;
    pagination.value.pageSize = size;

    // Update stats based on the first page of data (latest blocks)
    if (data.value.length > 0 && page === 1) {
      const latestBlock = data.value[0];
      const oldestBlockInPage = data.value[data.value.length - 1];
      
      // 1. Current Block
      blockStats.value.currentBlock = latestBlock.blockNumber;
      
      // 2. Last Safe Block (Assume current - 32 as a heuristic for finality if not provided)
      blockStats.value.lastSafeBlock = Math.max(0, latestBlock.blockNumber - 32);
      
      // 3. Block Reward
      // Use 'incentive' field from the provided JSON structure
      if (latestBlock.incentive !== undefined) {
        blockStats.value.blockReward = `${latestBlock.incentive} ETH`;
      } else {
         blockStats.value.blockReward = '0 ETH'; 
      }

      // 4. Blocks in last 10 minutes
      // Calculate average block time from the page and extrapolate
      if (data.value.length > 1) {
        const latestTime = new Date(latestBlock.timestamp.replace ? latestBlock.timestamp.replace(' ', 'T') : latestBlock.timestamp).getTime();
        const oldestTime = new Date(oldestBlockInPage.timestamp.replace ? oldestBlockInPage.timestamp.replace(' ', 'T') : oldestBlockInPage.timestamp).getTime();
        
        const timeDiff = Math.abs(latestTime - oldestTime); // milliseconds
        if (timeDiff > 0) {
          const avgBlockTimeMs = timeDiff / (data.value.length - 1);
          // 10 minutes = 10 * 60 * 1000 ms
          const blocksIn10m = Math.round((10 * 60 * 1000) / avgBlockTimeMs);
          blockStats.value.blocks10m = blocksIn10m;
        } else {
             // If timeDiff is 0 (all blocks in same second?), avoid division by zero
             blockStats.value.blocks10m = 0;
        }
      }
    }

  } catch (error) {
    console.error('Fetch blocks error:', error);
  }
};

const handleTableChange = (pag: any) => {
  fetchData(pag.current, pag.pageSize);
};

const formatHash = (hash: string) => {
  if (!hash) return '';
  return hash.substring(0, 6) + '...' + hash.substring(hash.length - 4);
};

const formatTime = (timestamp: number | string) => {
  if (!timestamp) return '';
  
  // 1. Try to parse as a number (Unix timestamp)
  const num = Number(timestamp);
  if (!isNaN(num)) {
    // If < 100 billion, assume seconds (valid until year 5138)
    if (num < 100000000000) {
      return new Date(num * 1000).toLocaleString();
    }
    return new Date(num).toLocaleString();
  }

  // 2. If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    // Handle "YYYY-MM-DD HH:mm:ss" format by replacing space with T
    // This makes it "YYYY-MM-DDTHH:mm:ss" which is more reliably parsed
    const isoString = timestamp.replace(' ', 'T');
    const date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString();
    }
    
    // If standard parsing fails, it might already be a formatted string
    // just return it as is
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
  if (diff < 1000) return 'Just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)} secs ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hrs ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
};

const calculateBurntFees = (baseFee: any, gasUsed: any) => {
  // Assuming baseFee is in Gwei (since example showed 0.099 Gwei) or Wei.
  // The provided JSON showed baseFee: 0. 
  // If baseFee is in Wei: Burnt = BaseFee * GasUsed (Wei) -> / 1e18 (ETH)
  // If baseFee is in Gwei: Burnt = BaseFee * GasUsed (Gwei) -> / 1e9 (ETH)
  // Let's assume input might be raw Wei or Gwei. For now, just display a safe calculation.
  // If baseFee is 0, burnt is 0.
  const bf = Number(baseFee || 0);
  const gu = Number(gasUsed || 0);
  if (!bf || !gu) return '0 ETH';
  
  // Heuristic: if baseFee is small integer like 0-1000, likely Gwei. If huge, likely Wei.
  // But given the JSON "baseFee": 0, we'll just multiply.
  // Standard EIP-1559: BaseFee (Wei) * GasUsed.
  // Let's assume result is Wei and convert to ETH.
  const burntWei = bf * gu;
  return (burntWei / 1e18).toFixed(6) + ' ETH'; 
};

const copyToClipboard = (text: string) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
};

const fallbackCopy = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed"; // Avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      message.success('Copied to clipboard');
    } else {
      message.error('Failed to copy');
    }
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    message.error('Failed to copy');
  }
  document.body.removeChild(textArea);
};

const navigateToBlockInfo = (record) => {
  router.push({ name: 'BlockInfo', params: { number: record.blockNumber } });
};

const navigateToBlockInfoByHash = async (blockHash: string) => {
  try {
    const res: any = await getBlockByHash(blockHash);
    const num = res?.number ?? res?.blockNumber;
    if (num !== undefined && num !== null) {
      router.push({ name: 'BlockInfo', params: { number: String(num) } });
    } else {
      message.error('无法解析区块号');
    }
  } catch (err) {
    console.error('根据哈希获取区块失败:', err);
    message.error('未找到该区块');
  }
};

onMounted(() => fetchData(1, 10));
</script>

<style scoped>
/* 在此处添加样式 */
.Explorer {
  width: 100%;
  margin: 0 auto;
}
.header-box,
.middle-box,
.footer-box {
  margin-left: 2%; /* Reduced margin to give more space for content */
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
.ant-dropdown-link {
  color: black;
}
.navigation {
  font-size: large;
}
.ant-table-custom :deep(.ant-table-thead > tr > th) {
  background-color: white;
}

.ant-table-custom :deep(.custom-row) td {
  background-color: white;
  user-select: text; /* Ensure text selection */
}

.address-container {
  display: flex;
  align-items: center;
  gap: 8px; /* Space between address and copy button */
}

.address-link {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.address-link:hover {
  background-color: #fff7e6;
  border: 1px dashed #ffa940;
}

.copy-icon {
  cursor: pointer;
  color: #999;
  font-size: 14px;
  transition: color 0.2s;
}

.copy-icon:hover {
  color: #1890ff;
}

.key-data .title {
  color: #a3a3a3;
  margin-bottom: 8px;
}
.key-data {
  text-align: center;
}
.data-card-data {
  font-size: large;
  font-weight: bold;
}

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
</style>








