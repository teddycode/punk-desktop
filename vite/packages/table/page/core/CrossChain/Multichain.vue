<template>
  <a-layout class="dashboard-layout">
    <div class="page-container">
    <!-- 页面标题卡片 -->
    <a-card class="header-card" :bordered="true">
      <div class="title-row">
        <h2 class="page-title">跨链概览</h2>
      </div>
    </a-card>
    <!-- 统计信息卡片 -->
    <a-card class="info-card" :bordered="true">
      <div class="statistics-container">
        <a-row :gutter="[16, 16]" justify="space-between" type="flex" align="middle">
          <a-col
            :xs="24"
            :sm="12"
            :md="12"
            :lg="6"
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
    <!-- <div class="section-title">源链信息</div> -->
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
                <a-tag color="blue">中继</a-tag>
                <a-tooltip :title="chain.relay_addr">
                  <a-button type="link" size="small" class="address-link relay-link" @click.stop="handleRelayClick(chain)">
                    <LinkOutlined /> {{ shortenAddress(chain.relay_addr) }}
                  </a-button>
                </a-tooltip>
                <a-button type="text" size="small" class="copy-btn" @click.stop="copyAddress(chain.relay_addr)">
                  <CopyOutlined />
                </a-button>
                <span class="block-height">区块: {{ chain.block || '--' }}</span>
              </div>

              <div class="info-item">
                <a-tag color="geekblue">传输</a-tag>
                <a-tooltip :title="chain.transport_addr">
                  <a-button type="link" size="small" class="address-link transport-link" @click.stop="handleTransportClick(chain)">
                    <SwapOutlined /> {{ shortenAddress(chain.transport_addr) }}
                  </a-button>
                </a-tooltip>
                <a-button type="text" size="small" class="copy-btn" @click.stop="copyAddress(chain.transport_addr)">
                  <CopyOutlined />
                </a-button>
                <span class="task-count">任务: {{ chain.fee || '--' }}</span>
              </div>
            </div>
            <div v-if="!apiAvailable" class="mock-overlay">
              <a-tag color="orange" class="mock-tag">模拟数据</a-tag>
            </div>
          </a-card>
        </a-col>
      </template>
    </a-row>
    </div>
  </a-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  LinkOutlined,
  SwapOutlined,
  CopyOutlined
} from '@ant-design/icons-vue';
// 保留：后续真实 API 调用需要的依赖（暂时注释）
// import { ethers } from 'ethers';
// import axios from 'axios';

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
    // 从 testdata 读取 JSON 的通用方法
    const loadJSON = async <T>(relativePath: string): Promise<T> => {
      const url = new URL(relativePath, import.meta.url).href;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`读取 ${relativePath} 失败`);
      return res.json() as Promise<T>;
    };

    // 计算属性
    const computedZoneColumns = computed(() => {
      return [
        { title: "最新区块", value: data_from_rpc.value.block_number },
        { title: "源链数量", value: data_from_rpc.value.source_num },
        { title: "系统合约数量", value: data_from_rpc.value.contract_num },
        { title: "交易单数量", value: "0" },
        { title: "搬运工数量", value: "0" },
        { title: "跨链补贴", value: "0" },
        { title: "跨链用户数量", value: "0" },
        { title: "跨链手续费", value: "0" },
      ];
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
        // 兼容测试数据：level_id 为 1 视作中继合约，2 为传输合约
        if (contract.level_id === 0 || contract.level_id === 1) {
          contractData.relay = contract.contract_addr;
        } else if (contract.level_id === 2) {
          contractData.transport = contract.contract_addr;
        }
      });
      return map;
    });

    const computedSourceInfo = computed<ChainInfo[]>(() => {
      // 直接基于 JSON 数据计算展示项
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
        ATOM: 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
      };
      return logos[symbol.toUpperCase()] || 'https://via.placeholder.com/24';
    };

    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.src = 'https://via.placeholder.com/24';
    };

    // 使用本地 JSON 测试数据的读取方法
    const fetchDataFromTestdata = async () => {
      loading.value = true;
      try {
        // 读取跨链区信息（取第一个作为当前区）
        const zones = await loadJSON<Array<{
          no: number;
          zone_type: number;
          rpc: string;
          multi_addr: string;
          visit_block_height: number;
        }>>("./testdata/crosschainzone_info.json");
        crosschainzoneInfo.value = {
          zone_type: zones[0]?.zone_type ?? -1,
          rpc: zones[0]?.rpc ?? '',
          multi_addr: zones[0]?.multi_addr ?? '0x'
        };

        // 读取源链信息
        const sources = await loadJSON<Array<{
          chain_id: number;
          symbol: string;
          name: string;
          visit_block_height: number;
        }>>("./testdata/source_chain_info.json");
        sourceInfo.value = sources.map(s => ({
          chain_id: s.chain_id,
          symbol: s.symbol,
          name: s.name,
          block: s.visit_block_height
        }));

        // 读取系统合约信息
        const contracts = await loadJSON<Array<{
          contract_id: number;
          contract_addr: string;
          manager_addr: string;
          contract_state: number;
          chain_id: number;
          level_id: number;
        }>>("./testdata/system_contract_info.json");
        contractInfo.value = contracts.map(c => ({
          contract_id: c.contract_id,
          contract_addr: c.contract_addr,
          manager_addr: c.manager_addr,
          contract_state: c.contract_state,
          chain_id: c.chain_id,
          level_id: c.level_id
        }));

        // 读取区块信息以计算最新区块
        const hubBlocks = await loadJSON<Array<{ block_height: number }>>("./testdata/hub_block_info.json");
        const latestBlock = hubBlocks.reduce((max, b) => Math.max(max, b.block_height), 0);

        data_from_rpc.value = {
          block_number: latestBlock,
          source_num: sourceInfo.value.length,
          contract_num: contractInfo.value.length
        };

        // 使用测试数据展示，但允许交互
        apiAvailable.value = true;
        showError.value = false;
      } catch (err) {
        console.error('读取测试数据失败:', err);
        message.warning('测试数据读取失败，页面可能不完整');
        showError.value = true;
        apiAvailable.value = true; // 仍按 JSON 展示
      } finally {
        loading.value = false;
      }
    };

    // 事件处理
    const copyAddress = (addr: string) => {
      if (!addr || addr === '-') {
        message.warning('地址不可用');
        return;
      }
      navigator.clipboard?.writeText(addr)
        .then(() => message.success('已复制合约地址'))
        .catch(() => message.error('复制失败'));
    };
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
        path: `/relay`,
        state: {
          chain_id: record.chain_id,
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
        path: `/transport`,
        state: {
          chain_id: record.chain_id,
          multi_addr: crosschainzoneInfo.value.multi_addr,
          rpc: crosschainzoneInfo.value.rpc,
          symbol: record.symbol,
          name: record.name,
          relay: record.relay_addr,
          addr: record.transport_addr
        }
      });
    };

    // 初始化
    onMounted(async () => {
      try {
        await fetchDataFromTestdata();
      } catch (err) {
        console.error('初始化失败:', err);
      }
    });

    // 保留：真实数据库与 RPC 的读取逻辑（暂时注释，不删除，便于后续接入）
    /*
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
        apiAvailable.value = false;
      }
    };

    const fetchContractInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3020/api/systemContracts');
        contractInfo.value = response.data;
      } catch (err) {
        console.error('获取合约信息失败:', err);
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
        await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
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
      }
    };
    */

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
      handleTransportClick,
      crosschainzoneInfo,
      copyAddress
    };
  }
});
</script>

<style lang="scss" scoped>
.dashboard-layout {
  --header-height: 64px;
  --footer-height: 48px;
  padding: 24px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;

  /* 信息卡片样式 */
  .info-card {
    margin-bottom: 12px; /* 收紧与下方区块的距离 */

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
        min-height: 120px; // 保证卡片的固定高度
        transition: all 0.3s;
        border: none;
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);

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
      /* 每列不同的淡色背景，提升视觉层次 */
      /* 渐变加深，提升色彩存在感 */
      .stat-col:nth-child(1) .stat-card { background: linear-gradient(135deg,#ffffff,#e9f5ff); }
      .stat-col:nth-child(2) .stat-card { background: linear-gradient(135deg,#ffffff,#eef2ff); }
      .stat-col:nth-child(3) .stat-card { background: linear-gradient(135deg,#ffffff,#fff2e6); }
      .stat-col:nth-child(4) .stat-card { background: linear-gradient(135deg,#ffffff,#ecfff0); }
      .stat-col:nth-child(5) .stat-card { background: linear-gradient(135deg,#ffffff,#e6f2ff); }
      .stat-col:nth-child(6) .stat-card { background: linear-gradient(135deg,#ffffff,#efe6ff); }
      .stat-col:nth-child(7) .stat-card { background: linear-gradient(135deg,#ffffff,#ffe6f2); }
      .stat-col:nth-child(8) .stat-card { background: linear-gradient(135deg,#ffffff,#e6fff0); }
    }
  }

  /* 页面内容容器：占满视口高度，顶部对齐 */
  .page-container {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    min-height: calc(100vh - var(--header-height) - var(--footer-height) - 48px);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
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

  /* 链信息区域布局与交互样式 */
  .chain-container {
    margin-top: 4px; /* 收紧与“源链信息”标题的距离 */
  }

  .source-card {
    transition: all 0.25s ease-in-out;
    min-height: 160px;
    cursor: pointer; /* 整卡跳转到跨链桥 */

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.08);
      border-color: #1890ff;
    }
  }

  /* 页面标题样式 */
  .header-card { margin-bottom: 12px; }
  .page-header {
    margin-bottom: 12px;
    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-title { font-size: 20px; font-weight: 600; margin: 0; }
    .page-subtitle { display: none; }
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 4px 0 8px; /* 收紧上下间距 */
    text-align: center;
  }

  .chain-info {
    margin-top: 12px;
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 6px 0;
    }
    .label { color: #666; }
    .address-link.ant-btn-link {
      position: relative;
      padding: 2px 6px;
      font-size: 13px;
      border-radius: 6px;
      transition: color 0.2s ease, background-color 0.2s ease;
    }
    /* 通用下划线滑入效果 */
    .address-link.ant-btn-link::after {
      content: '';
      position: absolute;
      left: 6px;
      right: 6px;
      bottom: 2px;
      height: 2px;
      border-radius: 2px;
      width: 0;
      transition: width 0.25s ease;
    }
    .address-link .anticon { transition: transform 0.2s ease; }
    
    /* 中继：蓝-青 渐变，轻微位移 */
    .relay-link.ant-btn-link { color: #1668dc; }
    .relay-link.ant-btn-link:hover { background-color: rgba(22,104,220,0.08); }
    .relay-link.ant-btn-link::after { background: linear-gradient(90deg,#1668dc,#13c2c2); }
    .relay-link:hover .anticon { transform: translateX(2px); }

    /* 传输：紫-蓝 渐变，轻微旋转 */
    .transport-link.ant-btn-link { color: #2f54eb; }
    .transport-link.ant-btn-link:hover { background-color: rgba(47,84,235,0.10); }
    .transport-link.ant-btn-link::after { background: linear-gradient(90deg,#722ed1,#2f54eb); }
    .transport-link:hover .anticon { transform: rotate(8deg); }

    /* 激活下划线宽度动画 */
    .relay-link.ant-btn-link:hover::after,
    .transport-link.ant-btn-link:hover::after { width: calc(100% - 12px); }
    .block-height, .task-count { margin-left: auto; color: #999; }
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
