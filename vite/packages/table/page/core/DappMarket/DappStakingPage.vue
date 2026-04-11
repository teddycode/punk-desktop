<template>
  <div class="dapp-staking-page" v-if="dapp">
    <!-- 顶部 DApp 信息 -->
    <div class="dapp-info-card">
      <div class="info-left">
        <img :src="dapp.logo" :alt="dapp.name" class="dapp-logo" />
        <div>
          <h2 class="dapp-name">{{ dapp.name }}</h2>
          <p class="dapp-description">{{ dapp.description }}</p>
        </div>
      </div>
      <div class="info-stats">
        <div class="stat-item">
          <span class="stat-label">总质押额</span>
          <span class="stat-value">{{ dapp.totalStaked || 0 }} PUNK</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">质押人数</span>
          <span class="stat-value">{{ dapp.stakersCount || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总收益</span>
          <span class="stat-value success">+{{ dapp.revenue || 0 }} PUNK</span>
        </div>
      </div>
    </div>

    <!-- 质押总额输入 -->
    <div class="staking-input-card">
      <h3 class="card-title">
        <WalletOutlined />
        质押投资总额
      </h3>
      <div class="input-section">
        <a-input-number
          v-model:value="totalStakeAmount"
          :min="0"
          :max="userBalance"
          :precision="2"
          size="large"
          class="amount-input"
          @change="handleTotalAmountChange"
        >
          <template #addonAfter>
            <span>PUNK</span>
          </template>
        </a-input-number>
        <div class="balance-info">
          <span>可用余额: {{ userBalance }} PUNK</span>
          <a-button type="link" size="small" @click="setMaxAmount">使用全部</a-button>
        </div>
      </div>
    </div>

    <!-- 合约分配 -->
    <div class="contracts-allocation-card">
      <h3 class="card-title">
        <FileTextOutlined />
        按合约分配投资额度 ({{ contracts.length }} 个合约)
      </h3>

      <div class="contracts-list">
        <div
          v-for="(contract, index) in contracts"
          :key="contract.address"
          class="contract-allocation-item"
        >
          <div class="contract-header">
            <div class="contract-info">
              <div class="contract-index">{{ index + 1 }}</div>
              <div>
                <div class="contract-name">{{ contract.name || `合约 ${index + 1}` }}</div>
                <div class="contract-address" @click="viewContractDetails(contract.address)">
                  {{ contract.address }}
                  <LinkOutlined />
                </div>
              </div>
            </div>
            <div class="contract-stats">
              <div class="stat-mini">
                <span class="label">当前质押:</span>
                <span class="value">{{ formatNumber(contract.totalStaked || 0) }} PUNK</span>
              </div>
              <div class="stat-mini">
                <span class="label">上限:</span>
                <span class="value">{{ formatNumber(contract.stakingCap || 0) }} PUNK</span>
              </div>
            </div>
          </div>

          <div v-if="contract.chainRpc" class="contract-rpc-strip">
            <span class="rpc-pill" title="eth_getStakeFlag">{{ contract.chainRpc.stakeFlag }}</span>
            <span class="rpc-pill" title="eth_getAnnualFee">年费 {{ contract.chainRpc.annualFee }}</span>
            <span class="rpc-pill" title="eth_getLastAnnualFeeTime">上次年费 {{ contract.chainRpc.lastFeeTime }}</span>
            <span class="rpc-pill" title="eth_getBeneficiaryAddress">受益人 {{ contract.chainRpc.beneficiary }}</span>
            <span class="rpc-pill" title="eth_getContractCallCount">调用 {{ contract.chainRpc.callCount }}</span>
          </div>

          <div class="allocation-controls">
            <div class="slider-container">
              <a-slider
                v-model:value="contract.allocationPercent"
                :min="0"
                :max="100"
                :step="1"
                @change="handleAllocationChange"
              />
              <div class="percentage-display">{{ contract.allocationPercent }}%</div>
            </div>
            <a-input-number
              v-model:value="contract.allocatedAmount"
              :min="0"
              :max="totalStakeAmount"
              :precision="2"
              size="large"
              class="allocation-input"
              @change="() => handleDirectAmountChange(index)"
            >
              <template #addonAfter>
                <span>PUNK</span>
              </template>
            </a-input-number>
          </div>

          <!-- 合约质押进度 -->
          <div class="staking-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: getStakingProgress(contract) + '%' }"
              ></div>
            </div>
            <span class="progress-text">
              {{ getStakingProgress(contract).toFixed(1) }}% 已质押
            </span>
          </div>
        </div>
      </div>

      <!-- 快速分配按钮 -->
      <div class="quick-allocation">
        <span class="quick-label">快速分配:</span>
        <a-button size="small" @click="allocateEvenly">平均分配</a-button>
        <a-button size="small" @click="allocateByStaking">按现有质押比例</a-button>
        <a-button size="small" @click="resetAllocation">重置</a-button>
      </div>
    </div>

    <!-- 质押摘要 -->
    <div class="staking-summary-card">
      <h3 class="card-title">
        <BarChartOutlined />
        质押摘要
      </h3>
      <div class="summary-content">
        <div class="summary-item">
          <span class="label">投资总额:</span>
          <span class="value">{{ totalStakeAmount }} PUNK</span>
        </div>
        <div class="summary-item">
          <span class="label">已分配:</span>
          <span class="value" :class="{ warning: !isFullyAllocated }">
            {{ totalAllocated.toFixed(2) }} PUNK
          </span>
        </div>
        <div class="summary-item">
          <span class="label">未分配:</span>
          <span class="value">{{ (totalStakeAmount - totalAllocated).toFixed(2) }} PUNK</span>
        </div>
        <div class="summary-item">
          <span class="label">预计年化收益率:</span>
          <span class="value success">{{ estimatedAPY }}%</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <a-button size="large" @click="handleCancel">取消</a-button>
      <a-button
        type="primary"
        size="large"
        :loading="staking"
        :disabled="!canStake"
        @click="handleStake"
      >
        确认质押
      </a-button>
    </div>

    <!-- 质押须知 -->
    <div class="staking-notice">
      <ExclamationCircleOutlined />
      <div class="notice-content">
        <h4>质押须知</h4>
        <ul>
          <li>质押后资金将锁定在智能合约中，可随时申请退出</li>
          <li>收益每日结算，自动复投</li>
          <li>提前退出可能需要支付一定的手续费</li>
          <li>请确保已仔细阅读智能合约代码和审计报告</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  WalletOutlined,
  FileTextOutlined,
  LinkOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue';
import { ethers } from 'ethers';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@punkos/ethers5/vue';
import {
  createPledgeReadProvider,
  formatPledgeRpcError,
  getAllInvestorsInterest,
  getAnnualFeeWei,
  getBeneficiaryAddress,
  getContractCallCountWei,
  getLastAnnualFeeTimeWei,
  getPledgeInfo,
  getStakeFlag,
  normalizeToBigNumber,
  formatPunkAmount
} from '../../../js/service/pledgeRpc';
import { buildType6StakeDepositTx, waitStakeTxMined } from '../../../js/service/stakeDeposit';
import { upsertStakePosition } from '../../../js/service/stakePositionsStorage';

/** 与 docs/stake-deposit-test.js 默认一致 */
const DEFAULT_STAKED_TIME = 2;

const w3mAccount = useWeb3ModalAccount();
const w3mProvider = useWeb3ModalProvider();

interface ContractAllocation {
  address: string;
  name?: string;
  allocationPercent: number;
  allocatedAmount: number;
  totalStaked?: number;
  stakingCap?: number;
  /** 合约级 RPC 摘要，用于分配卡片展示 */
  chainRpc?: {
    stakeFlag: string;
    annualFee: string;
    lastFeeTime: string;
    beneficiary: string;
    callCount: string;
  };
}

const props = defineProps<{
  dappId?: number;
  contractAddress?: string; // 如果从合约详情页进入，只质押单个合约
}>();

const emit = defineEmits(['back', 'success', 'viewContract']);

const dapp = ref<any>(null);
const contracts = ref<ContractAllocation[]>([]);
const totalStakeAmount = ref(0);
const userBalance = ref(100000); // Mock 用户余额
const staking = ref(false);
const estimatedAPY = ref(12.5); // Mock APY

// 计算已分配总额
const totalAllocated = computed(() => {
  return contracts.value.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
});

// 是否完全分配
const isFullyAllocated = computed(() => {
  return Math.abs(totalStakeAmount.value - totalAllocated.value) < 0.01;
});

// 是否可以质押
const canStake = computed(() => {
  return totalStakeAmount.value > 0 && isFullyAllocated.value && !staking.value;
});

onMounted(() => {
  loadDappInfo();
});

function shortAddr(a: string) {
  if (!a || a.length < 12) return a || '—';
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

async function enrichContractsFromRpc() {
  const read = createPledgeReadProvider();
  for (const c of contracts.value) {
    if (!c.address || !/^0x[a-fA-F0-9]{40}$/.test(c.address)) continue;
    try {
      const info = await getPledgeInfo(c.address, read);
      const pledgeBn = normalizeToBigNumber(info.pledgeAmount as string | number);
      c.totalStaked = parseFloat(formatPunkAmount(pledgeBn)) || c.totalStaked;
      const investors = await getAllInvestorsInterest(c.address, read);
      if (props.contractAddress && contracts.value.length === 1) {
        (dapp.value as { stakersCount?: number }).stakersCount = investors.length;
      }
    } catch {
      /* RPC 不可用时保留 Mock */
    }

    const safe = async <T, F>(fn: () => Promise<T>, fallback: F) => {
      try {
        return await fn();
      } catch {
        return fallback;
      }
    };
    const flag = await safe(() => getStakeFlag(c.address, read), null as boolean | null);
    const feeBn = await safe(() => getAnnualFeeWei(c.address, read), ethers.BigNumber.from(0));
    const lastBn = await safe(() => getLastAnnualFeeTimeWei(c.address, read), ethers.BigNumber.from(0));
    const ben = await safe(() => getBeneficiaryAddress(c.address, read), '');
    const ccBn = await safe(() => getContractCallCountWei(c.address, read), ethers.BigNumber.from(0));
    c.chainRpc = {
      stakeFlag: flag === null ? '—' : flag ? '已质押' : '未质押',
      annualFee: feeBn.gt(0) ? `${formatPunkAmount(feeBn)} PUNK` : '—',
      lastFeeTime: lastBn.gt(0) ? lastBn.toString() : '—',
      beneficiary: ben && ben !== ethers.constants.AddressZero ? shortAddr(ben) : '—',
      callCount: ccBn.gt(0) ? ccBn.toString() : '—'
    };
  }
}

const loadDappInfo = async () => {
  // Mock 加载 DApp 信息
  if (props.contractAddress) {
    // 单合约质押
    dapp.value = {
      name: '单合约质押',
      description: '直接对选定的智能合约进行质押投资',
      logo: '',
      totalStaked: 5000000,
      stakersCount: 8500,
      revenue: 250000
    };
    contracts.value = [
      {
        address: props.contractAddress,
        name: 'Selected Contract',
        allocationPercent: 100,
        allocatedAmount: 0,
        totalStaked: 5000000,
        stakingCap: 10000000
      }
    ];
  } else {
    // Mock DApp 数据（从后端获取）
    dapp.value = {
      id: props.dappId,
      name: 'Uniswap',
      description: '去中心化交易协议',
      logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
      totalStaked: 15000000,
      stakersCount: 25000,
      revenue: 750000
    };

    // Mock 合约列表
    contracts.value = [
      {
        address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        name: 'Uniswap V3 Router',
        allocationPercent: 0,
        allocatedAmount: 0,
        totalStaked: 8500000,
        stakingCap: 10000000
      },
      {
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        name: 'Uniswap V3 Factory',
        allocationPercent: 0,
        allocatedAmount: 0,
        totalStaked: 4500000,
        stakingCap: 6000000
      },
      {
        address: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        name: 'Position Manager',
        allocationPercent: 0,
        allocatedAmount: 0,
        totalStaked: 2000000,
        stakingCap: 4000000
      }
    ];
  }
  enrichContractsFromRpc().catch(() => {});
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const getStakingProgress = (contract: ContractAllocation) => {
  if (!contract.stakingCap || contract.stakingCap === 0) return 0;
  return ((contract.totalStaked || 0) / contract.stakingCap) * 100;
};

const setMaxAmount = () => {
  totalStakeAmount.value = userBalance.value;
  handleTotalAmountChange();
};

const handleTotalAmountChange = () => {
  // 按当前比例重新分配
  if (totalAllocated.value > 0) {
    contracts.value.forEach(contract => {
      const ratio = contract.allocatedAmount / totalAllocated.value;
      contract.allocatedAmount = totalStakeAmount.value * ratio;
      contract.allocationPercent = ratio * 100;
    });
  }
};

const handleAllocationChange = () => {
  // 根据百分比更新分配金额
  contracts.value.forEach(contract => {
    contract.allocatedAmount = (totalStakeAmount.value * contract.allocationPercent) / 100;
  });
};

const handleDirectAmountChange = (index: number) => {
  // 根据金额更新百分比
  const contract = contracts.value[index];
  if (totalStakeAmount.value > 0) {
    contract.allocationPercent = (contract.allocatedAmount / totalStakeAmount.value) * 100;
  }
};

const allocateEvenly = () => {
  const count = contracts.value.length;
  const percentPerContract = 100 / count;
  const amountPerContract = totalStakeAmount.value / count;

  contracts.value.forEach(contract => {
    contract.allocationPercent = percentPerContract;
    contract.allocatedAmount = amountPerContract;
  });
};

const allocateByStaking = () => {
  const totalCurrentStaked = contracts.value.reduce((sum, c) => sum + (c.totalStaked || 0), 0);

  if (totalCurrentStaked === 0) {
    allocateEvenly();
    return;
  }

  contracts.value.forEach(contract => {
    const ratio = (contract.totalStaked || 0) / totalCurrentStaked;
    contract.allocationPercent = ratio * 100;
    contract.allocatedAmount = totalStakeAmount.value * ratio;
  });
};

const resetAllocation = () => {
  contracts.value.forEach(contract => {
    contract.allocationPercent = 0;
    contract.allocatedAmount = 0;
  });
};

const viewContractDetails = (address: string) => {
  emit('viewContract', address);
};

const handleStake = async () => {
  if (!canStake.value) {
    message.warning('请完整分配投资额度');
    return;
  }

  const walletProvider = w3mProvider.walletProvider.value as { request: (a: { method: string; params?: unknown[] }) => Promise<string> } | null | undefined;
  if (!walletProvider) {
    message.error('请先连接钱包');
    return;
  }

  const investor = w3mAccount.address?.value;
  if (!investor) {
    message.error('无法获取当前钱包地址');
    return;
  }

  staking.value = true;

  try {
    let sumWei = ethers.BigNumber.from(0);
    for (const c of contracts.value) {
      if ((c.allocatedAmount || 0) <= 0) continue;
      sumWei = sumWei.add(ethers.utils.parseEther(String(c.allocatedAmount)));
    }
    if (sumWei.lte(0)) {
      message.warning('质押总额须大于 0');
      return;
    }

    const { txHash } = await buildType6StakeDepositTx(walletProvider, {
      stakedAmountWei: sumWei,
      stakedTime: DEFAULT_STAKED_TIME,
      deployerAddress: investor,
      investorAddress: investor,
      beneficiaryAddress: investor
    });

    await waitStakeTxMined(txHash);

    for (const c of contracts.value) {
      if ((c.allocatedAmount || 0) <= 0) continue;
      upsertStakePosition({
        contractAddress: ethers.utils.getAddress(c.address),
        investorAddress: ethers.utils.getAddress(investor),
        principalPunk: c.allocatedAmount,
        dappId: dapp.value?.id,
        dappName: dapp.value?.name,
        logo: dapp.value?.logo,
        category: 'DeFi',
        lastTxHash: txHash
      });
    }

    const stakingData = {
      txHash,
      totalAmount: totalStakeAmount.value,
      allocations: contracts.value.map((c) => ({
        contractAddress: c.address,
        amount: c.allocatedAmount
      }))
    };

    message.success('质押交易已确认');
    emit('success', stakingData);
  } catch (error: unknown) {
    message.error('质押失败: ' + formatPledgeRpcError(error));
  } finally {
    staking.value = false;
  }
};

const handleCancel = () => {
  emit('back');
};
</script>

<style scoped>
.dapp-staking-page {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  color: var(--primary-text);
}

.dapp-info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--secondary-bg);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-left {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
}

.dapp-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
}

.dapp-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.dapp-description {
  color: var(--secondary-text);
  margin: 0;
}

.info-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--secondary-text);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
}

.stat-value.success {
  color: #52c41a;
}

.staking-input-card,
.contracts-allocation-card,
.staking-summary-card {
  background: var(--secondary-bg);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--primary-text);
}

.card-title .anticon {
  color: #a7d9fe;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-input {
  width: 100%;
  font-size: 24px;
}

.amount-input :deep(.ant-input-number-input) {
  font-size: 24px;
  font-weight: 600;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--secondary-text);
  font-size: 14px;
}

.contracts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.contract-allocation-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.contract-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.contract-index {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(167, 217, 254, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #a7d9fe;
}

.contract-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.contract-address {
  font-family: monospace;
  font-size: 12px;
  color: var(--secondary-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.contract-address:hover {
  color: #a7d9fe;
}

.contract-stats {
  display: flex;
  gap: 24px;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stat-mini .label {
  font-size: 12px;
  color: var(--secondary-text);
}

.stat-mini .value {
  font-size: 14px;
  font-weight: 600;
}

.contract-rpc-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.rpc-pill {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(167, 217, 254, 0.25);
  color: var(--secondary-text);
}

.allocation-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}

.slider-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.percentage-display {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  color: #a7d9fe;
}

.allocation-input {
  width: 200px;
}

.staking-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a7d9fe 0%, #8ab4f8 100%);
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: var(--secondary-text);
  min-width: 80px;
  text-align: right;
}

.quick-allocation {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-label {
  color: var(--secondary-text);
  font-size: 14px;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item .label {
  font-size: 13px;
  color: var(--secondary-text);
}

.summary-item .value {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text);
}

.summary-item .value.warning {
  color: #faad14;
}

.summary-item .value.success {
  color: #52c41a;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.action-buttons :deep(.ant-btn) {
  min-width: 120px;
  height: 44px;
  border-radius: 10px;
}

.action-buttons :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  border: none;
}

.staking-notice {
  display: flex;
  gap: 12px;
  background: rgba(250, 173, 20, 0.1);
  border: 1px solid rgba(250, 173, 20, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #faad14;
}

.staking-notice .anticon {
  font-size: 20px;
  flex-shrink: 0;
}

.notice-content h4 {
  margin: 0 0 8px 0;
  color: var(--primary-text);
}

.notice-content ul {
  margin: 0;
  padding-left: 20px;
  color: var(--secondary-text);
}

.notice-content li {
  margin-bottom: 4px;
}
</style>
