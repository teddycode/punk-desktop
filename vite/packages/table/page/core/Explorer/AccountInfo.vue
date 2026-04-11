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
        <div v-if="accountInfo" class="block-header">
          <div class="block-title-box">
            <span class="block-title">账户</span>
            <span class="block-number">{{ accountInfo.address }}</span>
            <CopyOutlined class="copy-icon" @click.stop="copyToClipboard(accountInfo.address)" />
          </div>
        </div>
        <h1 v-else>账户信息加载中...</h1>
      </a-row>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="信息总览">
          <div v-if="accountInfo">
            <a-list class="overview-list card-panel">
              <a-row v-for="([k, v], i) in baseEntries" :key="k + ':' + i">
                <a-list-item>
                  <strong class="label">{{ k }}:</strong>
                  <span class="value-text">{{ v }}</span>
                  <CopyOutlined v-if="isCopyableKey(k)" class="copy-icon" @click="copyToClipboard(String(v))" />
                </a-list-item>
              </a-row>
            </a-list>
            <div class="card-panel detail-card" v-if="!isContract">
              <div class="detail-card-header">
                <span class="label">EOA账户扩展信息</span>
                <a class="detail-link" @click="showEoa = !showEoa">{{ showEoa ? '— 点击收起' : '+ 点击展开' }}</a>
              </div>
              <div v-if="showEoa" class="detail-card-body">
                <a-list>
                  <a-row v-for="([k, v], i) in eoaEntries" :key="'eoa:'+k + ':' + i">
                    <a-list-item>
                      <strong class="label">{{ k }}:</strong>
                      <span class="value-text">{{ v }}</span>
                      <CopyOutlined v-if="isCopyableKey(k)" class="copy-icon" @click="copyToClipboard(String(v))" />
                    </a-list-item>
                  </a-row>
                </a-list>
              </div>
            </div>

            <div class="card-panel detail-card" v-if="isContract">
              <div class="detail-card-header">
                <span class="label">合约账户扩展信息</span>
                <a class="detail-link" @click="showContract = !showContract">{{ showContract ? '— 点击收起' : '+ 点击展开' }}</a>
              </div>
              <div v-if="showContract" class="detail-card-body">
                <a-list>
                  <a-row v-for="([k, v], i) in contractEntries" :key="'contract:'+k + ':' + i">
                    <a-list-item>
                      <strong class="label">{{ k }}:</strong>
                      <span class="value-text">{{ v }}</span>
                      <CopyOutlined v-if="isCopyableKey(k)" class="copy-icon" @click="copyToClipboard(String(v))" />
                    </a-list-item>
                  </a-row>
                </a-list>
              </div>
            </div>

            <div class="card-panel detail-card">
              <div class="detail-card-header">
                <span class="label">后量子安全信息</span>
                <a class="detail-link" @click="showPq = !showPq">{{ showPq ? '— 点击收起' : '+ 点击展开' }}</a>
              </div>
              <div v-if="showPq" class="detail-card-body">
                <a-list>
                  <a-row v-for="([k, v], i) in pqEntries" :key="'pq:'+k + ':' + i">
                    <a-list-item>
                      <strong class="label">{{ k }}:</strong>
                      <span class="value-text">{{ formatPqDisplay(v) }}</span>
                      <CopyOutlined v-if="isCopyableKey(k)" class="copy-icon" @click="copyToClipboard(String(v))" />
                    </a-list-item>
                  </a-row>
                </a-list>
              </div>
            </div>
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
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CopyOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { getAccountByAddress, getAccountBalance, getAccountSecurityLevel } from '../../../js/service/explorerAccounts';
import { getTransactionByHash } from '../../../js/service/explorerTransactions';
import { getBlockByNumber, getBlockByHash } from '../../../js/service/explorerBlocks';

const route = useRoute();
const router = useRouter();
const activeKey = ref('1');
const value = ref<string>('');
const searchType = ref<'accountAddress' | 'txHash' | 'blockNumber' | 'blockHash'>('accountAddress');
const formatPqDisplay = (v: any) => {
  if (v === '') return '""';
  if (v === undefined || v === null) return '无';
  return String(v);
};
const showEoa = ref(false);
const showContract = ref(false);
const showPq = ref(false);
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

const accountInfo = ref<any>(null);
const accountBalance = ref<any>(null);
const securityLevel = ref<any>(null);
const isContract = computed(() => {
  const a: any = accountInfo.value || {};
  return Boolean(a.isContract);
});

const loadAccount = async (address: string) => {
  try {
    const info: any = await getAccountByAddress(address);
    accountInfo.value = info?.data || info;
    const bal: any = await getAccountBalance(address);
    accountBalance.value = bal?.data || bal;
    const sec: any = await getAccountSecurityLevel(address);
    securityLevel.value = sec?.data || sec;
  } catch (err) {
    message.error('获取账户信息失败');
    accountInfo.value = null;
    accountBalance.value = null;
    securityLevel.value = null;
  }
};

onMounted(() => {
  const addr = String(route.params.address || '');
  if (addr) {
    loadAccount(addr);
  }
});

watch(
  () => route.params.address,
  async (newAddr) => {
    if (typeof newAddr === 'string' && newAddr) {
      await loadAccount(String(newAddr));
      activeKey.value = '1';
    }
  },
);

const shortHash = (s: string) => {
  const t = String(s || '');
  if (!t) return '';
  return t.length > 15 ? `${t.slice(0, 12)}...${t.slice(-6)}` : t;
};
const toEth = (wei: number | string) => {
  const n = Number(wei || 0);
  return `${(n / 1e18).toFixed(6)} ETH`;
};
const formatTime = (ts: number | string) => {
  if (!ts) return '';
  const num = Number(ts);
  if (!isNaN(num)) {
    const ms = num < 100000000000 ? num * 1000 : num;
    return new Date(ms).toLocaleString();
  }
  const s = String(ts).replace ? String(ts).replace(' ', 'T') : String(ts);
  const d = new Date(s);
  return isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
};
const formatBlockHeight = (v: any) => {
  if (v === undefined || v === null) return '无';
  return String(v);
};
const baseEntries = computed(() => {
  const a: any = accountInfo.value || {};
  const bal = accountBalance.value;
  const sec = securityLevel.value;
  const addr = a.address || route.params.address;
  return [
    ['address', shortHash(addr)],
    ['balance', toEth((bal && bal.balance !== undefined) ? bal.balance : (a.balance !== undefined ? a.balance : bal))],
    ['nonce', a.nonce],
    ['isContract', a.isContract ? '合约' : 'EOA'],
    ['securityLevel', (sec && sec.level !== undefined) ? sec.level : (a.securityLevel !== undefined ? a.securityLevel : sec)],
  ];
});
const eoaEntries = computed(() => {
  const a: any = accountInfo.value || {};
  return [
    ['pledgeAmount', a.pledgeAmount],
    ['pledgeYear', a.pledgeYear],
    ['startTime', formatBlockHeight(a.startTime)],
    ['interest', a.interest],
    ['currentInterest', a.currentInterest],
    ['earnInterest', a.earnInterest],
    ['totalNumberOfGas', a.totalNumberOfGas],
    ['totalValueTx', a.totalValueTx],
  ];
});
const contractEntries = computed(() => {
  const a: any = accountInfo.value || {};
  return [
    ['deployedAddress', a.deployedAddress],
    ['contractAddress', a.contractAddress],
    ['annualFee', a.annualFee],
    ['lastAnnualFeeTime', formatBlockHeight(a.lastAnnualFeeTime)],
    ['investorAddress', a.investorAddress],
    ['beneficiaryAddress', a.beneficiaryAddress],
  ];
});
const pqEntries = computed(() => {
  const a: any = accountInfo.value || {};
  return [
    ['lastPostQuanPub', a.lastPostQuanPub],
    ['postQuanCounter', a.postQuanCounter],
  ];
});

const stringifyValue = (v: any) => {
  if (v === undefined || v === null) return '';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
};

const isCopyableKey = (k: string) => {
  return ['address', 'deployedAddress', 'contractAddress', 'investorAddress', 'beneficiaryAddress', 'lastPostQuanPub'].includes(k);
};

const copyToClipboard = (text: string) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败');
      });
  }
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
  border-radius: 10px;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: transparent;
}
.header-box {
  height: auto;
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
.title-row { margin-bottom: 8px; }
.block-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.block-title-box { display: flex; align-items: baseline; gap: 8px; }

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
.overview-list :deep(.ant-list-item) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.more-details {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 6px;
}
.detail-card { margin-top: 12px; }
.detail-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.detail-card-body { margin-top: 8px; }
.no-data {
  color: #8c8c8c;
  padding: 6px 0;
}
.detail-link {
  color: #1890ff;
  cursor: pointer;
}
.detail-section {
  margin-bottom: 12px;
}
.section-header {
  font-weight: 600;
  margin-bottom: 8px;
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
.copy-icon {
  cursor: pointer;
  margin-left: 8px;
  color: #8c8c8c;
}
.copy-icon:hover {
  color: #1677ff;
}
</style>
