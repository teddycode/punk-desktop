<template>
  <a-layout class="Explorer">
    <!-- 头部布局 -->
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

    <!-- 中间内容区 -->
    <a-layout-content class="content-box middle-box">
      <div class="overall">
        <a-row align="middle" justify="space-between">
          <a-col>
            <h2 class="base-data-title">基础数据</h2>
          </a-col>
          <a-col>
            <a-switch
              v-model:checked="state.checked2"
              checked-children="全部数据"
              un-checked-children="收起"
              @click="toggleData"
            />
          </a-col>
        </a-row>
        <a-card class="data-card">
          <a-row :gutter="24" align="middle" justify="center">
            <a-col :span="3">
              <div class="key-data">
                <div class="title">市值</div>
                <div class="data-card-data">$46.58B</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">总交易量</div>
                <div class="data-card-data">5.26B txns</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">Gas 价格</div>
                <div class="data-card-data">3.9501 Gwei</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">TPS</div>
                <div class="data-card-data">49.21 笔/秒</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">24h交易量</div>
                <div class="data-card-data">3.02M</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">区块高度</div>
                <div class="data-card-data">12345870</div>
              </div>
            </a-col>
          </a-row>
          <a-divider />
          <!-- 详细数据 -->
          <div v-if="showAllData" class="detailed-data">
            <a-row :gutter="24" class="data-sections">
              <!-- 交易概览 -->
              <a-col :span="6">
                <div class="section-header">交易概览</div>
                <p class="value">总交易数: <a href="javascript:void(0)" class="value-link">5,262,493,431 txns</a></p>
                <p class="value">未确认交易数: <a href="javascript:void(0)" class="value-link">1,125 txns</a></p>
                <p>总交易费用: <span class="value">2.28B BNB</span></p>
                <p>24小时总交易数: <span class="value">3.02M BNB</span></p>
              </a-col>

              <!-- 地址概览 -->
              <a-col :span="6">
                <div class="section-header">地址概览</div>
                <p>地址数: <span class="value">596,559,656</span> <span class="text-green"></span></p>
                <p>合约地址数: <span class="value">298,293,161</span> <span class="text-green">+24,778</span></p>
                <p>普通地址数: <span class="value">298,266,495</span> <span class="text-green">+628,785</span></p>
                <p>持有BNB地址数: <span class="value">111,840,660</span> <span class="text-green">+34,589</span></p>
                <p>活跃地址数: <span class="value">2,255,133</span> <span class="text-green">+34,901</span></p>
              </a-col>

              <!-- 代币概览 -->
              <a-col :span="6">
                <div class="section-header">代币概览</div>
                <p>
                  代币数: <a href="javascript:void(0)" class="value-link">4,467,917</a>
                  <span class="text-green">+2,146</span>
                </p>
                <p>
                  BEP-20 代币: <a href="javascript:void(0)" class="value-link">3,883,921</a>
                  <span class="text-green">+2,057</span>
                </p>
                <p>BEP-721 代币: <span class="value">572,362</span> <span class="text-green">+88</span></p>
                <p>BEP-1155 代币: <span class="value">11,634</span> <span class="text-green">+1</span></p>
              </a-col>

              <!-- 链信息 -->
              <a-col :span="6">
                <div class="section-header">链信息</div>
                <p>发行日期: <span class="value">2024/1/10</span></p>
                <p>共识算法: <span class="value">PoT</span></p>
                <p>TPS: <span class="value">54.34 笔/秒</span></p>
                <p>已销毁总手续费: <span class="value">213,508.68 BNB</span></p>
                <p>Gas 价格: <span class="value">4.21 Gwei</span></p>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </div>
    </a-layout-content>
    <!-- 底部内容区：两列最新列表（左：区块，右：交易） -->
    <a-layout-footer class="footer-box">
      <a-row :gutter="16">
        <!-- 最新区块 -->
        <a-col :span="12">
          <div class="list-card">
            <div class="list-header">
              <span class="list-title">Latest Blocks</span>
            </div>
            <div class="list-body">
              <div v-for="(item, index) in latestBlocks" :key="item.blockNumber || item.number" class="list-item">
                <div class="item-left">
                  <div class="icon-box"><CodepenOutlined /></div>
                </div>
                <div class="item-middle two-col">
                  <div class="mid-left">
                    <a class="item-link item-number" @click="navigateToBlockInfoByNumber(item.blockNumber ?? item.number)">{{ item.blockNumber ?? item.number }}</a>
                    <span class="item-age age-under">{{ formatAge(item.timestamp) }}</span>
                  </div>
                  <div class="mid-right">
                    <div class="mid-right-top">
                      <span class="muted">Miner</span>
                      <a class="item-link">{{ formatHash(item.miner || item.feeRecipient) }}</a>
                    </div>
                    <div class="mid-right-bottom">
                      <a class="item-link">{{ getTxnCount(item) }} txns</a>
                      <span class="muted">in {{ secsBetween(index) }} secs</span>
                    </div>
                  </div>
                </div>
                <div class="item-right">
                  <span class="reward-badge">{{ formatIncentive(item.incentive) }}</span>
                </div>
              </div>
            </div>
            <div class="list-footer">
              <a-button type="link" @click="goToBlockList">查看所有区块 <span class="arrow-char">→</span></a-button>
            </div>
          </div>
        </a-col>
        <!-- 最新交易（示例/非真实数据） -->
        <a-col :span="12">
          <div class="list-card">
            <div class="list-header">
              <span class="list-title">Latest Transactions</span>
            </div>
            <div class="list-body">
              <div v-for="tx in latestTransactions" :key="tx.txHash || tx.txnHash" class="list-item">
                <div class="item-left">
                  <div class="icon-box"><FileTextOutlined /></div>
                </div>
                <div class="item-middle">
                  <div class="line-top">
                    <a class="item-link item-number" @click="navigateToTransactionInfo(tx)">{{ formatHash(tx.txHash || tx.txnHash) }}</a>
                  </div>
                  <div class="line-bottom">
                    <span class="muted">From</span>
                    <a class="item-link">{{ formatHash(tx.fromAddress || tx.from) }}</a>
                    <span class="muted">To</span>
                    <a class="item-link">{{ formatHash((tx.toAddress ?? tx.to) || '-') }}</a>
                  </div>
                </div>
                <div class="item-right">
                  <span class="item-age-inline">{{ tx.timestamp ? formatAge(tx.timestamp) : (tx.age || '') }}</span>
                  <span class="reward-badge">{{ tx.value !== undefined ? toEth(tx.value) : '0 ETH' }}</span>
                </div>
              </div>
            </div>
            <div class="list-footer">
              <a-button type="link" @click="goToTransactionList">查看所有交易 <span class="arrow-char">→</span></a-button>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { reactive } from 'vue';
import {
  DollarCircleFilled,
  CodepenOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue';
import { mockData } from './data/mock.js';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { getBlocks, getBlockByNumber, getBlockByHash } from '../../../js/service/explorerBlocks';
import { getTransactions, getTransactionByHash } from '../../../js/service/explorerTransactions';
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
const showAllData = ref(false);
const toggleData = () => {
  showAllData.value = !showAllData.value;
};
const state = reactive({
  checked1: true,
  checked2: false,
});
const activeKey = ref('1');
const block_columns = [
  {
    key: 'icon',
    dataIndex: 'icon',
    width: '20px',
  },
  {
    title: '区块高度',
    dataIndex: 'number',
    key: 'number',
  },
  {
    title: '出块时间',
    dataIndex: 'time',
  },
  {
    title: '地址',
    dataIndex: 'hash',
    key: 'hash',
  },
  {
    title: '打包交易数',
    dataIndex: 'transactions',
  },
  {
    title: '验证人',
    dataIndex: 'validator',
  },
  {
    key: 'more',
    dataIndex: 'more',
  },
];
const tx_columns = [
  {
    key: 'icon',
    dataIndex: 'icon',
    width: '20px',
  },
  {
    title: '交易地址',
    dataIndex: 'txnHash',
    key: 'txnHash',
    customRender: ({ text }) => formatHash(text),
  },
  {
    title: '打包区块',
    dataIndex: 'block',
  },
  {
    title: '交易时间',
    dataIndex: 'age',
  },
  {
    title: 'From',
    dataIndex: 'from',
    customRender: ({ text }) => formatHash(text),
  },
  {
    title: 'To',
    dataIndex: 'to',
    customRender: ({ text }) => formatHash(text),
  },
  {
    title: '交易数量',
    dataIndex: 'value',
  },
  {
    title: '手续费',
    dataIndex: 'txnFee',
  },
  {
    key: 'more',
    dataIndex: 'more',
  },
];
// 初始化区块数据（旧表使用的 mock）
const data = ref([]);
const fetchData = () => {
  data.value = mockData.blocks; // 保留旧逻辑（不再用于底部显示）
};

// 最新区块与交易（底部两列使用）
const latestBlocks = ref<any[]>([]);
const latestTransactions = ref<any[]>([]);

// 加载最新区块（真实数据）
const loadLatestBlocks = async () => {
  try {
    const res: any = await getBlocks(0, 6);
    // 兼容多种返回结构
    if (Array.isArray(res)) {
      latestBlocks.value = res;
    } else if (res && Array.isArray(res.content)) {
      latestBlocks.value = res.content;
    } else if (res && Array.isArray(res.records)) {
      latestBlocks.value = res.records;
    } else {
    latestBlocks.value = [];
    console.warn('Unknown blocks response structure', res);
  }
} catch (err) {
  console.error('加载最新区块失败', err);
  message.error('加载最新区块失败');
  latestBlocks.value = [];
}
};

// 加载最新交易（真实数据）
const loadLatestTransactions = async () => {
  try {
    const res: any = await getTransactions(0, 6);
    let list: any[] = [];
    if (Array.isArray(res)) {
      list = res;
    } else if (res && Array.isArray(res.content)) {
      list = res.content;
    } else if (res && Array.isArray(res.records)) {
      list = res.records;
    } else if (res && res.data && Array.isArray(res.data.content)) {
      list = res.data.content;
    } else {
      list = [];
      console.warn('Unknown transactions response structure', res);
    }
    latestTransactions.value = list.slice(0, 6);
  } catch (err) {
    console.error('加载最新交易失败', err);
    message.error('加载最新交易失败');
    latestTransactions.value = [];
  }
};

// 辅助：哈希缩写
const formatHash = (hash) => {
  return hash && hash.length > 15 ? `${hash.substring(0, 12)}...` : hash;
};
// 辅助：相对时间
const formatAge = (timestamp: number | string) => {
  if (!timestamp) return '';
  let ms: number;
  if (typeof timestamp === 'number') {
    ms = timestamp < 100000000000 ? timestamp * 1000 : timestamp;
  } else {
    const t = timestamp.replace ? timestamp.replace(' ', 'T') : timestamp;
    ms = new Date(t).getTime();
  }
  const diff = Math.max(0, Date.now() - ms);
  const secs = Math.round(diff / 1000);
  if (secs < 60) return `${secs} secs ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hrs ago`;
};
// 辅助：Wei 转 ETH
const toEth = (wei: number | string) => {
  const n = Number(wei || 0);
  return `${(n / 1e18).toFixed(6)} ETH`;
};
// 解析时间戳为毫秒
const parseTimestampMs = (ts: any): number => {
  if (!ts) return 0;
  if (typeof ts === 'number') {
    return ts < 100000000000 ? ts * 1000 : ts;
  }
  const t = ts.replace ? ts.replace(' ', 'T') : ts;
  return new Date(t).getTime();
};
// 计算相邻区块时间差（秒）
const secsBetween = (index: number) => {
  const cur = latestBlocks.value[index];
  const next = latestBlocks.value[index + 1];
  if (!cur || !next) return 0;
  const curMs = parseTimestampMs(cur.timestamp);
  const nextMs = parseTimestampMs(next.timestamp);
  if (!curMs || !nextMs) return 0;
  return Math.abs(Math.round((curMs - nextMs) / 1000));
};
// 辅助：交易数量
const getTxnCount = (b: any) => {
  if (!b) return 0;
  if (Array.isArray(b.transactions)) return b.transactions.length;
  return b.transactionCount ?? b.transactionsCount ?? b.commitTxLength ?? 0;
};
// 辅助：奖励显示
const formatIncentive = (val: any) => {
  if (val === undefined || val === null) return '0 Eth';
  const num = Number(val);
  if (isNaN(num)) return `${val}`;
  return `${num} Eth`;
};
const router = useRouter();

const goToBlockList = () => {
  router.push('./BlockList');
};
const goToTransactionList = () => {
  router.push('./TransactionList');
};
const navigateToBlockInfo = (record) => {
  router.push({ name: 'BlockInfo', params: { number: record.number } });
};
const navigateToBlockInfoByNumber = (num: number) => {
  router.push({ name: 'BlockInfo', params: { number: String(num) } });
};
const navigateToTransactionInfo = (record) => {
  const hash = record.txHash ?? record.txnHash;
  router.push({ name: 'TransactionInfo', params: { txnHash: hash } });
};
onMounted(() => {
  // 保留旧数据加载，避免其他区域依赖中断
  fetchData();
  // 底部使用真实区块列表
  loadLatestBlocks();
  // 底部使用真实交易列表
  loadLatestTransactions();
});
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
.list-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 12px;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 12px 12px;
}
.list-title {
  font-weight: 600;
  font-size: 16px;
}
.customize-btn {
  color: #8c8c8c;
}
.list-body {
  padding: 0 8px;
}
.list-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
}
.list-item:last-child {
  border-bottom: none;
}
.item-left {
  margin-right: 12px;
}
.icon-box {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f5f7fb;
  color: #1890ff;
  font-size: 20px;
}
.item-middle {
  flex: 1;
}
.two-col {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.mid-left {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}
.mid-right {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 160px;
}
.mid-right-top,
.mid-right-bottom {
  display: flex;
  gap: 8px;
  align-items: baseline;
}
.line-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.line-bottom {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-top: 4px;
}
.item-link {
  color: #1890ff;
  cursor: pointer;
}
.item-number {
  font-size: 16px;
  font-weight: 600;
}
.item-age {
  color: #8c8c8c;
  margin-left: auto;
  font-size: 12px;
}
.item-age-right {
  color: #8c8c8c;
  font-size: 12px;
  display: block;
  text-align: center;
  margin-top: 4px;
}
.item-age-inline {
  color: #8c8c8c;
  font-size: 12px;
  white-space: nowrap;
}
.age-under {
  margin-left: 0;
  margin-top: 2px;
}
.muted {
  color: #8c8c8c;
}
.item-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 160px;
  gap: 8px;
}
.reward-badge {
  background: #fff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  color: #111;
  font-weight: 600;
  font-size: 12px;
  border-radius: 8px;
  padding: 2px 8px;
}
.arrow-icon { display: none; }
.arrow-char {
  margin-left: 6px;
}
.list-footer {
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
  padding-top: 8px;
}
.list-footer {
  text-align: center;
  padding-top: 8px;
}
.navigation {
  font-size: large;
}
.ant-dropdown-link {
  color: black;
}
.overall {
  padding: 20px 30px;
}
.data-card {
  width: 100%;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.key-data .title {
  color: #a3a3a3;
  margin-bottom: 8px;
}

.key-data {
  text-align: center;
}

.vertical-line {
  background-color: #e8e8e8;
  width: 1px;
  height: 100px; /* Adjust the height as needed */
  margin: 0 auto; /* This will ensure the line is centered in the column */
}

.additional-data {
  margin-top: 20px;
  text-align: center;
}
.data-card-data {
  font-size: large;
  font-weight: bold;
}
.base-data-title {
  font-weight: bold;
}
.section-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.data-sections {
  margin-top: 20px;
}
.value-link {
  color: #2a9df4;
  font-weight: bold;
}

.text-green {
  color: #3f8600;
  font-weight: bold;
}

.value {
  font-weight: bold;
}
.ant-table-custom :deep(.ant-table-thead > tr > th) {
  background-color: white;
}

.ant-table-custom :deep(.custom-row) td {
  background-color: white;
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
.search-select { flex: none; }
.search-input { flex: 1; min-width: 300px; }
.search-select :deep(.ant-select-selector) {
  border-radius: 10px;
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
