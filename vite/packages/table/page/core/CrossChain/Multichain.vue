<template>
  <a-layout class="dashboard-layout">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <div class="page-title">跨链专区概览</div>
        <div class="page-desc">展示跨链系统状态、源链信息与关联合约</div>
      </div>
    </div>

    <!-- 统计信息 -->
    <a-card class="info-card" :bordered="false">
      <div class="statistics-container">
        <a-row :gutter="[20, 20]" justify="center">
          <a-col
            v-for="(stat, index) in zoneColumns"
            :key="index"
            :xs="24"
            :sm="12"
            :md="8"
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

    <!-- 源链列表 -->
    <div class="section-header">
      <div class="section-title">源链列表</div>
      <div class="section-subtitle">点击卡片可进入对应链的跨链详情</div>
    </div>

    <a-row :gutter="[24, 24]">
      <a-col
        v-for="chain in sourceInfoWithContracts"
        :key="chain.chain_id"
        :xs="24"
        :sm="12"
        :xl="8"
      >
        <a-card hoverable class="source-card" @click="handleBridgeClick(chain)">
          <div class="chain-header">
            <div class="chain-logo-placeholder">
              {{ getChainLogoText(chain.symbol) }}
            </div>

            <div class="chain-title-group">
              <div class="chain-name">{{ chain.name }}</div>
              <div class="chain-symbol">{{ chain.symbol }}</div>
            </div>

            <div class="chain-id-tag">
              #{{ chain.chain_id }}
            </div>
          </div>

          <div class="chain-meta">
            <div class="meta-item">
              <span class="meta-label">最新区块</span>
              <span class="meta-value">{{ chain.latest_raw_height ?? '--' }}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label">最新区块哈希</span>
              <a-tooltip :title="chain.latest_raw_hash || '-'">
                <span class="meta-hash">
                  {{ shortenValue(chain.latest_raw_hash || '-') }}
                </span>
              </a-tooltip>
            </div>
          </div>

          <div class="chain-info">
            <div class="info-block">
              <div class="info-label">中继合约地址</div>
              <a-tooltip :title="chain.relay_addr">
                <div class="address-link" @click.stop="handleRelayClick(chain)">
                  {{ shortenValue(chain.relay_addr) }}
                </div>
              </a-tooltip>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ethers } from 'ethers'
import axios from 'axios'

interface SourceData {
  chain_id: number
  symbol: string
  name: string
  state?: number
  visit_block_height?: number
  register_tx_hash?: string | null
  created_at?: string
  updated_at?: string
  latest_raw_height?: number | null
  latest_raw_hash?: string | null
}

interface ContractData {
  contract_id: number
  contract_addr: string
  manager_addr: string
  contract_state: number
  chain_id: number
  level_id: number
}

interface CrosschainzoneData {
  zone_type: number
  rpc: string
  multi_addr: string
}

interface SourceCardData extends SourceData {
  relay_addr: string
}

const loading = ref(false)
let provider: ethers.providers.JsonRpcProvider
const router = useRouter()

const crosschainzoneInfo = ref<CrosschainzoneData>({
  zone_type: -1,
  rpc: '',
  multi_addr: '0x'
})

const managerAddress = ref('0x')

const dataFromRpc = ref({
  block_number: 0,
  source_num: 0,
  contract_num: 0
})

const sourceInfo = ref<SourceData[]>([])
const contractInfo = ref<ContractData[]>([])

const managerABI = [
  'function getSourceChainNum() view returns (uint256)',
  'function getSourceChainInfo(uint256 sourceID) view returns (string symbol, string name, uint256 state, uint256 contractNum, address[] contractAddressList)',
  'function getSystemContractNum() view returns (uint256)'
]

const relayABI = [
  'function getTopKeyFromShadowLedger_slot() view returns (bytes32)',
  'function getTopKeyFromShadowLedger() view returns (bytes32)'
]

const zoneColumns = computed(() => [
  { title: '最新区块', value: dataFromRpc.value.block_number },
  { title: '源链数量', value: dataFromRpc.value.source_num },
  { title: '系统合约数量', value: dataFromRpc.value.contract_num }
])

const chainContractMap = computed(() => {
  const map = new Map<number, { relay: string }>()

  contractInfo.value.forEach(contract => {
    const chainId = Number(contract.chain_id)
    if (!Number.isFinite(chainId) || chainId <= 0) return

    if (!map.has(chainId)) {
      map.set(chainId, { relay: '-' })
    }

    const contractData = map.get(chainId)!
    if (contract.level_id === 0) {
      contractData.relay = contract.contract_addr
    }
  })

  return map
})

const sourceInfoWithContracts = computed<SourceCardData[]>(() => {
  return sourceInfo.value.map(source => {
    const chainId = Number(source.chain_id)
    const contracts =
      Number.isFinite(chainId) && chainId > 0
        ? (chainContractMap.value.get(chainId) || { relay: '-' })
        : { relay: '-' }
    return {
      ...source,
      relay_addr: contracts.relay
    }
  })
})

const shortenValue = (value: string) => {
  if (!value || value === '-') return value
  if (value.length <= 14) return value
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

const getChainLogoText = (symbol?: string) => {
  if (!symbol) return 'C'
  return symbol.trim().charAt(0).toUpperCase()
}

const fallbackRpcUrl = 'http://47.243.174.71:36054'
const fallbackManagerAddr = '0x6d811bf404DaE8Df3d39b15604e32eF040d3D236'

const fetchCrosschainzoneInfo = async () => {
  crosschainzoneInfo.value = {
    zone_type: 0,
    rpc: fallbackRpcUrl,
    multi_addr: fallbackManagerAddr
  }
}

const fetchManagerAddress = async () => {
  managerAddress.value = fallbackManagerAddr
}

const supplementSourceInfoFromManager = async () => {
  try {
    const rpcUrl = crosschainzoneInfo.value.rpc || fallbackRpcUrl
    const managerAddr = managerAddress.value || fallbackManagerAddr

    if (!managerAddr || managerAddr === '0x' || !ethers.utils.isAddress(managerAddr)) return

    const rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, managerABI, rpcProvider)

    let rpcLatestHeight: number | null = null
    let rpcLatestHash: string | null = null
    try {
      const latestBlock = await rpcProvider.getBlock('latest')
      if (latestBlock) {
        rpcLatestHeight = Number(latestBlock.number)
        rpcLatestHash = latestBlock.hash ? String(latestBlock.hash) : null
      }
    } catch (latestErr) {
      console.warn('读取 RPC 最新区块失败:', latestErr)
    }

    const sourceNumRaw = await managerContract.getSourceChainNum()
    const sourceNum = Number(sourceNumRaw)
    if (!Number.isFinite(sourceNum) || sourceNum <= 0) return

    const onchainSources: SourceData[] = []
    const supplementedContracts: ContractData[] = []

    for (let chainId = 1; chainId <= sourceNum; chainId++) {
      try {
        const chainInfo = await managerContract.getSourceChainInfo(chainId)

        const symbol = String(chainInfo?.symbol ?? chainInfo?.[0] ?? '').trim()
        const name = String(chainInfo?.name ?? chainInfo?.[1] ?? '').trim()
        const state = Number(chainInfo?.state ?? chainInfo?.[2] ?? 0)
        const contractAddressList = (chainInfo?.contractAddressList ?? chainInfo?.[4] ?? []) as string[]
        const relayAddr = String(contractAddressList?.[0] ?? '').trim()

        let latestRawHeight: number | null = null
        let latestRawHash: string | null = null

        if (relayAddr && ethers.utils.isAddress(relayAddr)) {
          try {
            const relayContract = new ethers.Contract(relayAddr, relayABI, rpcProvider)
            const [topHeightRaw, topKeyRaw] = await Promise.all([
              relayContract.getTopKeyFromShadowLedger_slot(),
              relayContract.getTopKeyFromShadowLedger()
            ])

            latestRawHeight = Number(BigInt(topHeightRaw))
            latestRawHash = String(topKeyRaw)
          } catch (relayErr) {
            console.warn(`读取链 ${chainId} 中继 top 信息失败:`, relayErr)
          }

          supplementedContracts.push({
            contract_id: -chainId,
            contract_addr: relayAddr,
            manager_addr: managerAddr,
            contract_state: 2,
            chain_id: chainId,
            level_id: 0
          })
        }

        onchainSources.push({
          chain_id: chainId,
          symbol,
          name,
          state,
          latest_raw_height:
            symbol.toUpperCase() === 'LCL'
              ? (rpcLatestHeight ?? latestRawHeight)
              : latestRawHeight,
          latest_raw_hash:
            symbol.toUpperCase() === 'LCL'
              ? (rpcLatestHash ?? latestRawHash)
              : latestRawHash
        })
      } catch (innerErr) {
        console.warn(`读取链上 source chain ${chainId} 失败:`, innerErr)
      }
    }

    sourceInfo.value = onchainSources.sort((a, b) => Number(a.chain_id) - Number(b.chain_id))
    contractInfo.value = supplementedContracts
  } catch (err) {
    console.warn('链上读取 source chain 失败:', err)
  }
}

const fetchDataFromDB = async () => {
  loading.value = true
  try {
    await fetchCrosschainzoneInfo()
    await fetchManagerAddress()
    await supplementSourceInfoFromManager()
  } catch (err) {
    console.error('数据获取失败:', err)
    message.error('数据获取失败')
  } finally {
    loading.value = false
  }
}

const fetchDataFromRPC = async () => {
  try {
    await fetchDataFromDB()

    if (!crosschainzoneInfo.value.rpc) {
      throw new Error('RPC地址未设置')
    }

    provider = new ethers.providers.JsonRpcProvider(crosschainzoneInfo.value.rpc)

    try {
      await provider.getNetwork()
    } catch (error) {
      console.error('RPC连接测试失败:', error)
      throw new Error('无法连接到RPC节点')
    }

    const statsContractAddr = String(managerAddress.value || crosschainzoneInfo.value.multi_addr || '').trim()

    if (!statsContractAddr || statsContractAddr === '0x' || !ethers.utils.isAddress(statsContractAddr)) {
      throw new Error('合约地址无效')
    }

    let blockNumber: number
    try {
      blockNumber = await provider.getBlockNumber()
    } catch (error) {
      console.error('获取区块高度失败:', error)
      throw new Error('获取区块高度失败')
    }

    const multiABI = [
      'function getSourceChainNum() view returns (uint256)',
      'function getSystemContractNum() view returns (uint256)'
    ]

    const multiContract = new ethers.Contract(
      statsContractAddr,
      multiABI,
      provider
    )

    let sourceNum, contractNum
    try {
      ;[sourceNum, contractNum] = await Promise.all([
        multiContract.getSourceChainNum(),
        multiContract.getSystemContractNum()
      ])
    } catch (error) {
      console.error('获取合约数据失败:', error)
      throw new Error('获取合约数据失败')
    }

    dataFromRpc.value = {
      block_number: Number(blockNumber),
      source_num: Number(sourceNum),
      contract_num: Number(contractNum)
    }
  } catch (err) {
    console.error('RPC数据获取失败:', err)
    message.error(err instanceof Error ? err.message : '获取RPC数据失败')

    dataFromRpc.value = {
      block_number: -1,
      source_num: -1,
      contract_num: -1
    }
  }
}

const handleBridgeClick = (record: SourceCardData) => {
  router.push({
    path: `/multi/bridge/${record.chain_id}`,
    state: {
      multi_addr: crosschainzoneInfo.value.multi_addr,
      rpc: crosschainzoneInfo.value.rpc,
      symbol: record.symbol,
      name: record.name
    }
  })
}

const handleRelayClick = (record: SourceCardData) => {
  router.push({
    path: '/relayer',
    query: {
      chain_id: String(record.chain_id),
      multi_addr: crosschainzoneInfo.value.multi_addr,
      rpc: crosschainzoneInfo.value.rpc,
      symbol: record.symbol,
      name: record.name,
      addr: record.relay_addr
    }
  })
}

const refreshData = async () => {
  loading.value = true
  try {
    await fetchDataFromRPC()
  } catch (err) {
    console.error('数据刷新失败:', err)
    message.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const initializeRPC = async () => {
  try {
    await fetchCrosschainzoneInfo()

    if (!crosschainzoneInfo.value.rpc) {
      throw new Error('RPC地址未设置')
    }

    if (!crosschainzoneInfo.value.multi_addr || crosschainzoneInfo.value.multi_addr === '0x') {
      throw new Error('合约地址无效')
    }

    await fetchDataFromRPC()
  } catch (error) {
    console.error('初始化RPC失败:', error)
    message.error('初始化RPC连接失败')
  }
}

let pollingTimer: ReturnType<typeof setInterval> | null = null

const startPolling = () => {
  if (!pollingTimer) {
    pollingTimer = setInterval(refreshData, 30000)
  }
}

const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

onMounted(async () => {
  await initializeRPC()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style src="@assets/CrossChain/multichain.scss"></style>
