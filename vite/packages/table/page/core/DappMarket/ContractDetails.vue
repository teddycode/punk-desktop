<template>
  <div class="contract-details" v-if="contract">
    <!-- 头部信息 -->
    <div class="details-header">
      <div class="header-left">
        <img :src="contract.logo" :alt="contract.name" class="contract-logo-large" />
        <div class="header-info">
          <h1 class="contract-title">{{ contract.name }}</h1>
          <div class="contract-meta">
            <span class="category-badge">{{ getCategoryLabel(contract.category) }}</span>
            <a-rate :value="contract.certificationLevel" disabled allow-half style="font-size: 18px;" />
            <span class="version-badge">v{{ contract.version }}</span>
          </div>
          <div class="contract-address-full">
            <span class="label">合约地址:</span>
            <span class="address" @click="copyAddress">{{ contract.address }}</span>
            <CopyOutlined class="copy-icon" @click="copyAddress" />
          </div>
        </div>
      </div>
      <div class="header-actions">
        <a-button type="primary" size="large" @click="handleStake">
          质押投资
        </a-button>
        <a-button v-if="contract.website" size="large" @click="visitWebsite">
          访问官网
        </a-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :span="6">
        <div class="stat-card">
          <EyeOutlined class="stat-icon" />
          <div class="stat-content">
            <div class="stat-label">访问量</div>
            <div class="stat-value">{{ formatNumber(contract.visitCount) }}</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <UserOutlined class="stat-icon" />
          <div class="stat-content">
            <div class="stat-label">质押人数</div>
            <div class="stat-value">{{ formatNumber(contract.stakersCount) }}</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card highlight">
          <WalletOutlined class="stat-icon" />
          <div class="stat-content">
            <div class="stat-label">质押总额 / 上限</div>
            <div class="stat-value">{{ formatNumber(contract.totalStaked) }} / {{ formatNumber(contract.stakingCap) }} PUNK</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card success">
          <RiseOutlined class="stat-icon" />
          <div class="stat-content">
            <div class="stat-label">总收益</div>
            <div class="stat-value">+{{ formatNumber(contract.revenue) }} PUNK</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 链上质押扩展（文档 eth_* RPC） -->
    <div class="section-card chain-pledge-section" v-if="chainPledgeUi">
      <h3 class="section-title">
        <ApiOutlined class="title-icon" />
        链上质押扩展信息
      </h3>
      <p class="chain-pledge-hint">以下数据来自节点 RPC；若节点未实现对应方法则显示为「—」。</p>
      <a-descriptions bordered size="small" :column="2" class="chain-descriptions">
        <a-descriptions-item label="已质押 (eth_getStakeFlag)">{{ chainPledgeUi.stakeFlag }}</a-descriptions-item>
        <a-descriptions-item label="安全等级 (eth_getSecurityLevel)">{{ chainPledgeUi.securityLevel }}</a-descriptions-item>
        <a-descriptions-item label="年费 (eth_getAnnualFee)">{{ chainPledgeUi.annualFee }}</a-descriptions-item>
        <a-descriptions-item label="上次年费时间 (eth_getLastAnnualFeeTime)">{{ chainPledgeUi.lastAnnualFeeTime }}</a-descriptions-item>
        <a-descriptions-item label="部署者 (eth_getDeployedAddress)" :span="2">{{ chainPledgeUi.deployed }}</a-descriptions-item>
        <a-descriptions-item label="旧版投资人 (eth_getInvestorAddress)" :span="2">{{ chainPledgeUi.legacyInvestor }}</a-descriptions-item>
        <a-descriptions-item label="单受益人 (eth_getBeneficiaryAddress)" :span="2">{{ chainPledgeUi.singleBeneficiary }}</a-descriptions-item>
        <a-descriptions-item label="总 Gas (eth_getTotalNumberOfGas)">{{ chainPledgeUi.totalGas }}</a-descriptions-item>
        <a-descriptions-item label="调用次数 (eth_getContractCallCount)">{{ chainPledgeUi.callCount }}</a-descriptions-item>
        <a-descriptions-item label="总交易值 (eth_getTotalValueTx)" :span="2">{{ chainPledgeUi.totalValueTx }}</a-descriptions-item>
      </a-descriptions>
    </div>

    <!-- 合约描述 -->
    <div class="section-card">
      <h3 class="section-title">
        <FileTextOutlined class="title-icon" />
        合约描述
      </h3>
      <p class="contract-description">{{ contract.description }}</p>
    </div>

    <!-- 合约代码 -->
    <div class="section-card">
      <h3 class="section-title">
        <CodeOutlined class="title-icon" />
        合约代码
      </h3>
      <div class="code-container">
        <a-button size="small" class="copy-button" @click="copyCode">
          <CopyOutlined /> 复制代码
        </a-button>
        <pre class="code-block">{{ contract.code }}</pre>
      </div>
    </div>

    <!-- ABI 信息 -->
    <div class="section-card">
      <h3 class="section-title">
        <ApiOutlined class="title-icon" />
        ABI 接口
      </h3>
      <div class="code-container">
        <a-button size="small" class="copy-button" @click="copyABI">
          <CopyOutlined /> 复制 ABI
        </a-button>
        <pre class="code-block">{{ formatJSON(contract.abi) }}</pre>
      </div>
    </div>

    <!-- Bytecode -->
    <div class="section-card">
      <h3 class="section-title">
        <BinaryOutlined class="title-icon" />
        Bytecode
      </h3>
      <div class="code-container">
        <a-button size="small" class="copy-button" @click="copyBytecode">
          <CopyOutlined /> 复制 Bytecode
        </a-button>
        <div class="bytecode-display">{{ contract.bytecode }}</div>
      </div>
    </div>

    <!-- 关联合约 -->
    <div class="section-card" v-if="relatedContracts.length > 0">
      <h3 class="section-title">
        <LinkOutlined class="title-icon" />
        关联合约 ({{ relatedContracts.length }})
      </h3>
      <div class="related-contracts">
        <div
          v-for="addr in contract.relatedContracts"
          :key="addr"
          class="related-contract-item"
          @click="handleViewRelatedContract(addr)"
        >
          <div class="contract-address-item">
            <CodeOutlined />
            <span>{{ addr }}</span>
          </div>
          <RightOutlined />
        </div>
      </div>
    </div>

    <!-- 审计报告 -->
    <div class="section-card" v-if="contract.auditReports && contract.auditReports.length > 0">
      <h3 class="section-title">
        <SafetyOutlined class="title-icon" />
        审计报告
      </h3>
      <div class="audit-reports">
        <a
          v-for="(report, index) in contract.auditReports"
          :key="index"
          :href="report"
          target="_blank"
          class="audit-link"
        >
          <FileProtectOutlined />
          审计报告 {{ index + 1 }}
          <LinkOutlined />
        </a>
      </div>
    </div>

    <!-- 外部链接 -->
    <div class="section-card">
      <h3 class="section-title">
        <GlobalOutlined class="title-icon" />
        相关链接
      </h3>
      <div class="external-links">
        <a v-if="contract.website" :href="contract.website" target="_blank" class="external-link">
          <GlobalOutlined /> 官方网站
        </a>
        <a v-if="contract.github" :href="contract.github" target="_blank" class="external-link">
          <GithubOutlined /> GitHub 仓库
        </a>
        <a :href="`https://etherscan.io/address/${contract.address}`" target="_blank" class="external-link">
          <SearchOutlined /> Etherscan 查看
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { ethers } from 'ethers';
import {
  CopyOutlined,
  EyeOutlined,
  UserOutlined,
  WalletOutlined,
  RiseOutlined,
  FileTextOutlined,
  CodeOutlined,
  ApiOutlined,
  LinkOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  GlobalOutlined,
  GithubOutlined,
  SearchOutlined,
  RightOutlined
} from '@ant-design/icons-vue';
import { getContractByAddress, SmartContract } from '../../../data/mockContracts';
import {
  createPledgeReadProvider,
  formatPledgeRpcError,
  getAllInvestorsInterest,
  getAnnualFeeWei,
  getBeneficiaryAddress,
  getContractCallCountWei,
  getDeployedAddress,
  getInvestorAddressLegacy,
  getLastAnnualFeeTimeWei,
  getPledgeInfo,
  getSecurityLevelWei,
  getStakeFlag,
  getTotalNumberOfGasWei,
  getTotalValueTxWei,
  normalizeToBigNumber,
  formatPunkAmount
} from '../../../js/service/pledgeRpc';

const props = defineProps<{
  address: string;
}>();

const emit = defineEmits(['back', 'viewContract', 'stake']);

const contract = ref<SmartContract | null>(null);

interface ChainPledgeUiRow {
  stakeFlag: string;
  annualFee: string;
  lastAnnualFeeTime: string;
  deployed: string;
  legacyInvestor: string;
  singleBeneficiary: string;
  totalGas: string;
  callCount: string;
  totalValueTx: string;
  securityLevel: string;
}

const chainPledgeUi = ref<ChainPledgeUiRow | null>(null);

const ZERO = ethers.constants.AddressZero;

function displayAddr(a: string | undefined | null) {
  if (!a || a.toLowerCase() === ZERO.toLowerCase()) return '—';
  return a;
}

async function safeStr(fn: () => Promise<string>, fallback = '—') {
  try {
    const s = await fn();
    return displayAddr(s);
  } catch {
    return fallback;
  }
}

async function safeBnLabel(fn: () => Promise<ethers.BigNumber>, asPunk: boolean) {
  try {
    const bn = await fn();
    if (asPunk) return `${formatPunkAmount(bn)} PUNK`;
    return bn.toString();
  } catch {
    return '—';
  }
}

async function safeBool(fn: () => Promise<boolean>) {
  try {
    const v = await fn();
    return v ? '是' : '否';
  } catch {
    return '—';
  }
}

const categoryLabels = {
  finance: '金融',
  social: '社交',
  game: '游戏',
  tool: '工具',
  nft: 'NFT',
  dao: 'DAO'
};

const relatedContracts = computed(() => {
  return contract.value?.relatedContracts || [];
});

onMounted(() => {
  loadContractDetails();
});

const loadContractDetails = async () => {
  const foundContract = getContractByAddress(props.address);
  if (!foundContract) {
    message.error('合约不存在');
    contract.value = null;
    return;
  }
  contract.value = { ...foundContract };

  if (!/^0x[a-fA-F0-9]{40}$/.test(foundContract.address)) {
    chainPledgeUi.value = null;
    return;
  }

  const ca = foundContract.address;
  try {
    const read = createPledgeReadProvider();
    const info = await getPledgeInfo(ca, read);
    const pledgeBn = normalizeToBigNumber(info.pledgeAmount as string | number);
    const staked = parseFloat(formatPunkAmount(pledgeBn));
    if (staked > 0) contract.value.totalStaked = staked;

    const investors = await getAllInvestorsInterest(ca, read);
    if (investors.length > 0) contract.value.stakersCount = investors.length;

    const earnBn = normalizeToBigNumber(info.earnInterest as string | number);
    const earned = parseFloat(formatPunkAmount(earnBn));
    if (earned > 0) contract.value.revenue = earned;
  } catch (e) {
    console.warn('[ContractDetails] 链上质押概览不可用，使用 Mock:', formatPledgeRpcError(e));
  }

  try {
    const read = createPledgeReadProvider();
    const [stakeFlag, annualFee, lastFee, deployed, legacyInv, singleBen, totalGas, calls, txVal, sec] =
      await Promise.all([
        safeBool(() => getStakeFlag(ca, read)),
        safeBnLabel(() => getAnnualFeeWei(ca, read), true),
        safeBnLabel(() => getLastAnnualFeeTimeWei(ca, read), false),
        safeStr(() => getDeployedAddress(ca, read)),
        safeStr(() => getInvestorAddressLegacy(ca, read)),
        safeStr(() => getBeneficiaryAddress(ca, read)),
        safeBnLabel(() => getTotalNumberOfGasWei(ca, read), false),
        safeBnLabel(() => getContractCallCountWei(ca, read), false),
        safeBnLabel(() => getTotalValueTxWei(ca, read), true),
        safeBnLabel(() => getSecurityLevelWei(ca, read), false)
      ]);

    chainPledgeUi.value = {
      stakeFlag,
      annualFee,
      lastAnnualFeeTime: lastFee,
      deployed,
      legacyInvestor: legacyInv,
      singleBeneficiary: singleBen,
      totalGas,
      callCount: calls,
      totalValueTx: txVal,
      securityLevel: sec
    };
  } catch (e) {
    chainPledgeUi.value = null;
    console.warn('[ContractDetails] 链上扩展字段不可用:', formatPledgeRpcError(e));
  }
};

const getCategoryLabel = (category: string) => {
  return categoryLabels[category] || category;
};

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatJSON = (jsonString: string) => {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch {
    return jsonString;
  }
};

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(contract.value!.address);
    message.success('合约地址已复制');
  } catch {
    message.error('复制失败');
  }
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(contract.value!.code);
    message.success('合约代码已复制');
  } catch {
    message.error('复制失败');
  }
};

const copyABI = async () => {
  try {
    await navigator.clipboard.writeText(contract.value!.abi);
    message.success('ABI 已复制');
  } catch {
    message.error('复制失败');
  }
};

const copyBytecode = async () => {
  try {
    await navigator.clipboard.writeText(contract.value!.bytecode);
    message.success('Bytecode 已复制');
  } catch {
    message.error('复制失败');
  }
};

const handleStake = () => {
  emit('stake', props.address);
};

const visitWebsite = () => {
  if (contract.value?.website) {
    window.open(contract.value.website, '_blank');
  }
};

const handleViewRelatedContract = (address: string) => {
  emit('viewContract', address);
};
</script>

<style scoped>
.contract-details {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  color: var(--primary-text);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: var(--secondary-bg);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  gap: 20px;
  flex: 1;
}

.contract-logo-large {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
}

.header-info {
  flex: 1;
}

.contract-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-text);
  margin: 0 0 12px 0;
}

.contract-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.category-badge {
  padding: 4px 12px;
  background: rgba(167, 217, 254, 0.2);
  border-radius: 8px;
  font-size: 14px;
  color: #a7d9fe;
  font-weight: 600;
}

.version-badge {
  padding: 4px 12px;
  background: rgba(82, 196, 26, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #52c41a;
  font-weight: 600;
}

.contract-address-full {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 14px;
}

.contract-address-full .label {
  color: var(--secondary-text);
}

.contract-address-full .address {
  color: var(--primary-text);
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.contract-address-full .address:hover {
  background: rgba(255, 255, 255, 0.1);
}

.copy-icon {
  cursor: pointer;
  font-size: 16px;
  color: var(--secondary-text);
  transition: all 0.3s;
}

.copy-icon:hover {
  color: #a7d9fe;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions :deep(.ant-btn) {
  border-radius: 10px;
  height: 42px;
  padding: 0 24px;
}

.header-actions :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  border: none;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--secondary-bg);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.1) 0%, rgba(138, 180, 248, 0.05) 100%);
  border-color: rgba(167, 217, 254, 0.3);
}

.stat-card.success {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%);
  border-color: rgba(82, 196, 26, 0.3);
}

.stat-icon {
  font-size: 32px;
  color: #a7d9fe;
}

.stat-card.success .stat-icon {
  color: #52c41a;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--secondary-text);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-text);
}

.chain-pledge-hint {
  font-size: 12px;
  color: var(--secondary-text);
  margin: -8px 0 12px 0;
}

.chain-descriptions :deep(.ant-descriptions-item-label) {
  font-size: 12px;
  max-width: 280px;
}

.section-card {
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
  margin: 0 0 16px 0;
}

.title-icon {
  color: #a7d9fe;
}

.contract-description {
  font-size: 15px;
  line-height: 1.8;
  color: var(--secondary-text);
  margin: 0;
}

.code-container {
  position: relative;
}

.copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.code-block {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #a7d9fe;
  margin: 0;
}

.bytecode-display {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: var(--secondary-text);
  word-break: break-all;
}

.related-contracts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-contract-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.related-contract-item:hover {
  background: rgba(167, 217, 254, 0.1);
  border-color: rgba(167, 217, 254, 0.3);
}

.contract-address-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 13px;
  color: var(--primary-text);
}

.audit-reports {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audit-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 8px;
  color: #52c41a;
  text-decoration: none;
  transition: all 0.3s;
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.audit-link:hover {
  background: rgba(82, 196, 26, 0.2);
  transform: translateX(4px);
}

.external-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.external-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: var(--primary-text);
  text-decoration: none;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.external-link:hover {
  background: rgba(167, 217, 254, 0.1);
  border-color: rgba(167, 217, 254, 0.3);
  color: #a7d9fe;
}
</style>
