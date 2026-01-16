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
      <div style="font-size: 32px; text-align: center; font-weight: bold; padding-bottom: 10px">交易信息</div>
      <a-row>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px; padding-right: 10px">
          <a-card>
            <a-statistic title="24小时交易量" :value="1173661"></a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px; padding-right: 10px">
          <a-card>
            <a-statistic title="平均交易费用" :value="5.77">
              <template #suffix>USD </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px; padding-right: 10px">
          <a-card>
            <a-statistic title="24小时网络交易费用" :value="456.45">
              <template #suffix>ETH </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px; padding-right: 10px">
          <a-card>
            <a-statistic title="24小时交易手续费" :value="0.1789">
              <template #suffix>ETH </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
      <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px;">
        Total of {{ pagination.total.toLocaleString() }} transactions
      </div>
      <a-table
        class="ant-table-custom"
        size="middle"
        :columns="tx_columns"
        :data-source="transactions"
        :pagination="pagination"
        @change="handleTableChange"
        :row-class-name="() => 'custom-row'"
        :style="{ fontSize: '16px' }"
      >
        <template v-slot:bodyCell="{ column, record }">
          <template v-if="column.key === 'txHash'">
            <div class="address-container">
              <a-tooltip :title="record.txHash">
                <span class="address-link" style="cursor: pointer; color: #1890ff;" @click="navigateToTransactionInfoByHash(record.txHash)">{{ formatHash(record.txHash) }}</span>
              </a-tooltip>
              <CopyOutlined class="copy-icon" @click.stop="copyToClipboard(record.txHash)" />
            </div>
          </template>
          <template v-if="column.key === 'blockNumber'">
            <span style="color: #1890ff; cursor: pointer" @click="router.push({ name: 'BlockInfo', params: { number: String(record.blockNumber) } })">{{ record.blockNumber }}</span>
          </template>
          <template v-if="column.key === 'fromAddress'">
            <div class="address-container">
              <a-tooltip :title="record.fromAddress">
                <span class="address-link" style="color: #1890ff;">{{ formatHash(record.fromAddress) }}</span>
              </a-tooltip>
              <CopyOutlined class="copy-icon" @click.stop="copyToClipboard(record.fromAddress)" />
            </div>
          </template>
          <template v-if="column.key === 'toAddress'">
            <div class="address-container">
              <a-tooltip :title="record.toAddress || '-'">
                <span class="address-link" style="color: #1890ff;">{{ record.toAddress ? formatHash(record.toAddress) : '-' }}</span>
              </a-tooltip>
              <CopyOutlined v-if="record.toAddress" class="copy-icon" @click.stop="copyToClipboard(record.toAddress)" />
            </div>
          </template>
          <template v-if="column.key === 'value'">
            <span>{{ convertWeiToEth(record.value) }} ETH</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '成功' : '失败' }}</a-tag>
          </template>
          <template v-if="column.key === 'timestamp'">
            <span>{{ formatTime(record.timestamp) }}</span>
          </template>
          <template v-if="column.key === 'gasUsed'">
            <span>{{ Number(record.gasUsed).toLocaleString() }}</span>
          </template>
        </template>
      </a-table>
    </a-layout-content>
    <a-layout-footer class="footer-box"> </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import { CopyOutlined } from '@ant-design/icons-vue';
import { h, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { getTransactions, getTransactionByHash } from '../../../js/service/explorerTransactions';
import { getBlockByNumber, getBlockByHash } from '../../../js/service/explorerBlocks';
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
const tx_columns = [
  {
    title: '交易哈希',
    dataIndex: 'txHash',
    key: 'txHash',
    width: 150,
  },
  {
    title: '区块号',
    dataIndex: 'blockNumber',
    key: 'blockNumber',
    width: 100,
  },
  {
    title: '发送方',
    dataIndex: 'fromAddress',
    key: 'fromAddress',
    width: 150,
  },
  {
    title: '接收方',
    dataIndex: 'toAddress',
    key: 'toAddress',
    width: 150,
  },
  {
    title: '转账金额',
    dataIndex: 'value',
    key: 'value',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '时间戳',
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: 180,
  },
  {
    title: 'Gas使用量',
    dataIndex: 'gasUsed',
    key: 'gasUsed',
    width: 120,
  },
];
const transactions = ref([]);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
});

const fetchData = async (page = 1, size = 10) => {
  try {
    const res: any = await getTransactions(page - 1, size);
    if (Array.isArray(res)) {
      transactions.value = res;
      pagination.value.total = res.length;
    } else if (res && Array.isArray(res.content)) {
      transactions.value = res.content;
      pagination.value.total = res.totalElements || res.total || 0;
    } else if (res && Array.isArray(res.records)) {
      transactions.value = res.records;
      pagination.value.total = res.total || 0;
    } else if (res && res.data && Array.isArray(res.data.content)) {
      transactions.value = res.data.content;
      pagination.value.total = res.data.totalElements || res.data.total || 0;
    } else {
      transactions.value = [];
      pagination.value.total = 0;
    }
    pagination.value.current = page;
    pagination.value.pageSize = size;
  } catch (error) {
    console.error('Fetch transactions error:', error);
  }
};

const handleTableChange = (pag: any) => {
  fetchData(pag.current, pag.pageSize);
};

const convertWeiToEth = (wei: number | string) => {
  const n = Number(wei || 0);
  return (n / 1e18).toFixed(6);
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
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
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
    console.error('Fallback copy error', err);
    message.error('Failed to copy');
  }
  document.body.removeChild(textArea);
};

const navigateToTransactionInfoByHash = (hash: string) => {
  router.push({ name: 'TransactionInfo', params: { txnHash: hash } });
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
  user-select: text;
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

.address-container {
  display: flex;
  align-items: center;
  gap: 8px;
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
</style>
