<template>
  <a-layout class="dashboard-layout">
    <!-- 统计信息卡片 -->
    <a-card class="info-card" :bordered="true">
      <div class="statistics-container">
        <a-row :gutter="[16, 16]" justify="center" type="flex" align="middle">
          <a-col
            :xs="24"
            :sm="12"
            :md="8"
            :lg="3"
            v-for="(stat, index) in computedZoneColumns"
            :key="index"
            class="stat-col"
          >
            <a-card hoverable class="stat-card">
              <a-statistic
                :title="stat.title"
                :value="stat.value"
                :loading="loading"
              />
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-card>

    <!-- 链信息展示 -->
    <a-row :gutter="[24, 24]" class="chain-container">
      <!-- 加载状态 -->
      <a-col :span="24" v-if="loading">
        <a-skeleton active :paragraph="{ rows: 4 }" />
      </a-col>

      <!-- 数据展示 -->
      <template v-else>
        <a-col
          :xs="24"
          :sm="12"
          :lg="8"
          v-for="chain in computedSourceInfo"
          :key="chain.chain_id + (apiAvailable ? '' : '-mock')"
        >
          <a-card
            hoverable
            class="source-card"
            :class="{ 'mock-card': !apiAvailable }"
            @click="handleBridgeClick(chain)"
          >
            <div class="chain-header">
              <img
                :src="getChainLogo(chain.symbol)"
                alt="chain-logo"
                class="chain-logo"
                @error="handleImageError"
              />
              <div>
                <div class="chain-name">{{ chain.name }}</div>
                <div class="chain-symbol">{{ chain.symbol }}</div>
              </div>
            </div>
            <div class="chain-info">
              <div class="info-item">
                <span class="label">中继合约:</span>
                <a-tooltip :title="chain.relay_addr">
                  <span class="address-link" @click.stop="handleRelayClick(chain)">
                    {{ shortenAddress(chain.relay_addr) }}
                  </span>
                </a-tooltip>
                <span class="block-height">区块: {{ chain.block || '--' }}</span>
              </div>

              <div class="info-item">
                <span class="label">传输合约:</span>
                <a-tooltip :title="chain.transport_addr">
                  <span class="address-link" @click.stop="handleTransportClick(chain)">
                    {{ shortenAddress(chain.transport_addr) }}
                  </span>
                </a-tooltip>
                <span class="task-count">任务: {{ chain.fee || '--' }}</span>
              </div>
            </div>
            <div v-if="!apiAvailable" class="mock-overlay">
              <a-tag color="orange" class="mock-tag">模拟数据</a-tag>
            </div>
          </a-card>
        </a-col>
      </template>

      <!-- 错误提示 -->
      <a-col :span="24" v-if="showError">
        <a-alert
          message="数据加载异常"
          description="已显示模拟数据，实时数据获取失败"
          type="warning"
          show-icon
          closable
          class="error-alert"
        />
      </a-col>
    </a-row>
  </a-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { ethers } from 'ethers';
import axios from 'axios';
import {
  ReloadOutlined,
  LinkOutlined,
  ApiOutlined,
  SwapOutlined
} from '@ant-design/icons-vue';

// 类型定义
interface HubData {
  symbol: string;
  name: string;
  sourceNum: number;
  contractNum: number;
  blockNum: number;
  relayTxNum: number;
  transportTxNum: number;
  relayNodeNum: number;
  transportNodeNum: number;
  userNodeNum: number;
}

interface SourceData {
  chain_id: number;
  symbol: string;
  name: string;
  block?: number;
  fee?: number;
}

interface ContractData {
  contract_id: number;
  contract_addr: string;
  manager_addr: string;
  contract_state: number;
  chain_id: number;
  level_id: number;
}

interface CrosschainzoneData {
  zone_type: number;
  rpc: string;
  multi_addr: string;
}

interface ChainInfo {
  chain_id: number;
  symbol: string;
  name: string;
  relay_addr: string;
  transport_addr: string;
  block?: number;
  fee?: number;
}

export default defineComponent({
  name: 'DashboardView',
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const apiAvailable = ref(true);
    const showError = ref(false);

    // 真实数据状态
    const hubInfo = ref<HubData>({
      symbol: 'HC',
      name: 'Default Name',
      sourceNum: 0,
      contractNum: 0,
      blockNum: 0,
      relayTxNum: 0,
      transportTxNum: 0,
      relayNodeNum: 0,
      transportNodeNum: 0,
      userNodeNum: 0
    });

    const crosschainzoneInfo = ref<CrosschainzoneData>({
      zone_type: -1,
      rpc: '',
      multi_addr: '0x'
    });

    const data_from_rpc = ref({
      block_number: 0,
      source_num: 0,
      contract_num: 0,
    });

    const sourceInfo = ref<SourceData[]>([]);
    const contractInfo = ref<ContractData[]>([]);

    // 模拟数据
    const mockChains = [
      {
        chain_id: 1,
        symbol: 'BTC',
        name: 'Bitcoin',
        relay_addr: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        transport_addr: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        block: 123456,
        fee: 42
      },
      {
        chain_id: 2,
        symbol: 'ETH',
        name: 'Ethereum',
        relay_addr: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
        transport_addr: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b',
        block: 654321,
        fee: 36
      }
    ];

    const mockZoneColumns = [
      { title: "最新区块", value: 123456 },
      { title: "源链数量", value: 2 },
      { title: "系统合约数量", value: 4 },
      { title: "交易单数量", value: "42" },
      { title: "搬运工数量", value: "8" },
      { title: "跨链补贴", value: "0.5 ETH" },
      { title: "跨链用户数量", value: "128" },
      { title: "跨链手续费", value: "0.002 ETH" },
    ];

    // 计算属性
    const computedZoneColumns = computed(() => {
      return apiAvailable.value ?
        [
          { title: "最新区块", value: data_from_rpc.value.block_number },
          { title: "源链数量", value: data_from_rpc.value.source_num },
          { title: "系统合约数量", value: data_from_rpc.value.contract_num },
          { title: "交易单数量", value: "0" },
          { title: "搬运工数量", value: "0" },
          { title: "跨链补贴", value: "0" },
          { title: "跨链用户数量", value: "0" },
          { title: "跨链手续费", value: "0" },
        ] : mockZoneColumns;
    });

    const chainSymbolMap = computed(() => {
      const map = new Map<number, string>();
      map.set(0, hubInfo.value.symbol);
      sourceInfo.value.forEach(source => {
        map.set(source.chain_id, source.symbol);
      });
      return map;
    });

    const chainContractMap = computed(() => {
      const map = new Map<number, { relay: string; transport: string }>();
      contractInfo.value.forEach(contract => {
        const chainId = contract.chain_id;
        if (!map.has(chainId)) {
          map.set(chainId, { relay: '-', transport: '-' });
        }
        const contractData = map.get(chainId)!;
        if (contract.level_id === 0) {
          contractData.relay = contract.contract_addr;
        } else if (contract.level_id === 2) {
          contractData.transport = contract.contract_addr;
        }
      });
      return map;
    });

    const computedSourceInfo = computed<ChainInfo[]>(() => {
      if (apiAvailable.value) {
        return sourceInfo.value.map(source => {
          const contracts = chainContractMap.value.get(source.chain_id) || {
            relay: '-',
            transport: '-'
          };
          return {
            ...source,
            relay_addr: contracts.relay,
            transport_addr: contracts.transport
          };
        });
      } else {
        return mockChains;
      }
    });

    // 方法定义
    const shortenAddress = (address: string) => {
      if (!address || address === '-') return address;
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getChainLogo = (symbol: string) => {
      const logos: { [key: string]: string } = {
        BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        HC: 'https://via.placeholder.com/24'
      };
      return logos[symbol.toUpperCase()] || 'https://via.placeholder.com/24';
    };

    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.src = 'https://via.placeholder.com/24';
    };

    // API 调用方法
    const fetchHubInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3020/api/hubChain');
        hubInfo.value = response.data[0];
      } catch (err) {
        console.error('获取Hub信息失败:', err);
        message.error('获取Hub信息失败');
      }
    };

    const fetchCrosschainzoneInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3020/api/crosschainzone');
        crosschainzoneInfo.value = response.data[0];
      } catch (err) {
        console.error('获取跨链区信息失败:', err);
        message.error('获取跨链区信息失败');
        throw err;
      }
    };

    const fetchSourceInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3020/api/sourceChains');
        sourceInfo.value = response.data;
      } catch (err) {
        console.error('获取源链信息失败:', err);
        sourceInfo.value = mockChains;
        apiAvailable.value = false;
      }
    };

    const fetchContractInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3020/api/systemContracts');
        contractInfo.value = response.data;
      } catch (err) {
        console.error('获取合约信息失败:', err);
        contractInfo.value = mockChains.map(chain => ({
          contract_id: chain.chain_id,
          contract_addr: chain.relay_addr,
          manager_addr: '0x0000000000000000000000000000000000000000',
          contract_state: 1,
          chain_id: chain.chain_id,
          level_id: 0
        }));
        apiAvailable.value = false;
      }
    };

    const fetchDataFromDB = async () => {
      loading.value = true;
      try {
        await Promise.all([
          fetchCrosschainzoneInfo(),
          fetchSourceInfo(),
          fetchContractInfo()
        ]);
      } catch (err) {
        console.error('数据库连接失败:', err);
        showError.value = true;
        apiAvailable.value = false;
      } finally {
        loading.value = false;
      }
    };

    const fetchDataFromRPC = async () => {
      try {
        await fetchDataFromDB();

        if (!crosschainzoneInfo.value.rpc) {
          throw new Error('RPC地址未设置');
        }

        const provider = new ethers.providers.JsonRpcProvider(
          crosschainzoneInfo.value.rpc
        );

        // 测试连接
        await provider.getNetwork();

        // 获取区块高度
        const blockNumber = await provider.getBlockNumber();

        // 合约交互
        const multiABI = [
          "function getSourceChainNum() view returns (uint256)",
          "function getSystemContractNum() view returns (uint256)"
        ];

        const multiContract = new ethers.Contract(
          crosschainzoneInfo.value.multi_addr,
          multiABI,
          provider
        );

        const [sourceNum, contractNum] = await Promise.all([
          multiContract.getSourceChainNum(),
          multiContract.getSystemContractNum()
        ]);

        data_from_rpc.value = {
          block_number: Number(blockNumber),
          source_num: Number(sourceNum),
          contract_num: Number(contractNum)
        };

      } catch (err) {
        console.error('RPC连接失败:', err);
        showError.value = true;
        apiAvailable.value = false;
        data_from_rpc.value = {
          block_number: mockZoneColumns[0].value,
          source_num: mockZoneColumns[1].value,
          contract_num: mockZoneColumns[2].value
        };
      }
    };

    // 事件处理
    const handleBridgeClick = (record: ChainInfo) => {
      if (!apiAvailable.value) return;
      router.push({
        path: `/multi/bridge/${record.chain_id}`,
        state: {
          multi_addr: crosschainzoneInfo.value.multi_addr,
          rpc: crosschainzoneInfo.value.rpc,
          symbol: record.symbol,
          name: record.name
        }
      });
    };

    const handleRelayClick = (record: ChainInfo) => {
      if (!apiAvailable.value) return;
      router.push({
        path: `/multi/bridge/${record.chain_id}/relay`,
        state: {
          multi_addr: crosschainzoneInfo.value.multi_addr,
          rpc: crosschainzoneInfo.value.rpc,
          symbol: record.symbol,
          name: record.name,
          addr: record.relay_addr
        }
      });
    };

    const handleTransportClick = (record: ChainInfo) => {
      if (!apiAvailable.value) return;
      router.push({
        path: `/multi/bridge/${record.chain_id}/transport`,
        query: {
          symbol: record.symbol,
          relay: record.relay_addr
        }
      });
    };

    // 初始化
    onMounted(async () => {
      try {
        await fetchDataFromRPC();
      } catch (err) {
        console.error('初始化失败:', err);
      }
    });

    return {
      loading,
      apiAvailable,
      showError,
      computedZoneColumns,
      computedSourceInfo,
      shortenAddress,
      getChainLogo,
      handleImageError,
      handleBridgeClick,
      handleRelayClick,
      handleTransportClick
    };
  }
});
</script>

<style lang="scss" scoped>
.dashboard-layout {
  padding: 24px;
  background-color: #f5f5f5;

  /* 信息卡片样式 */
  .info-card {
    margin-bottom: 24px;

    .statistics-container {
      margin: 24px 0;

      .stat-col {
        display: flex;
        justify-content: center;
        align-items: center; // 垂直居中
        padding: 8px;
      }

      .stat-card {
        width: 100%;
        max-width: 240px;
        min-height: 120px; // 保证卡片的固定高度
        transition: all 0.3s;

        .ant-statistic-title {
          font-size: 14px;
          color: #666;
          text-align: center;
        }

        .ant-statistic-content {
          font-size: 20px;
          font-weight: bold;
          text-align: center;
        }

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
  .chain-header {
    display: flex; /* 让 LOGO 和文字部分在同一行显示 */
    align-items: center; /* 确保 LOGO 和文字保持垂直居中对齐 */

    img {
      width: 24px; /* 调整 LOGO 的宽度 */
      height: 24px; /* 调整 LOGO 的高度 */
      margin-right: 12px; /* LOGO 和文字的间距 */
      object-fit: cover; /* 确保 LOGO 保持比例缩放且无变形 */
      border-radius: 50%; /* 如果需要让 LOGO 显示为圆形，可以添加 */
    }

    .chain-name {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      line-height: 1.2;
    }

    .chain-price {
      font-size: 12px;
      color: #666;
      margin-top: 4px; /* 给符号名称与链名称一个间距 */
    }
  }
}
/* 响应式设计 */
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
</style>
