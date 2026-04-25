<template>
  <a-layout class="dashboard-layout">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <div class="page-title">源链搬运工脚本中心</div>
        <div class="page-desc">当前页面固定表示本链的中继入口，并根据浏览器里的源链列表，为每一条源链分发独立的 Python 静态脚本。</div>
      </div>
      <div class="hero-badge" style="padding: 4px 10px; border-radius: 999px; background: #e6f7ff; color: #1890ff; font-size: 12px; font-weight: 600; border: 1px solid rgba(24, 144, 255, 0.2);">当前链：punkos</div>
    </div>

    <a-alert
      class="page-alert"
      type="info"
      show-icon
      message="成为搬运工的第一步：运行全节点"
      style="margin-bottom: 24px; border-radius: 12px;"
    >
      <template #description>
        <p style="margin-bottom: 8px">
          作为跨链搬运工，理论上需要先运行对应源链的全节点来独立获取并验证区块数据。您可以下载并运行相应的客户端，同步完成后通过本地 RPC 端口供搬运脚本调用。
        </p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <a href="https://geth.ethereum.org/downloads/" target="_blank" style="color: #1890ff;">下载 Geth 客户端 (适用于 ETH, SEP 等 EVM 链)</a>
          <a href="https://bitcoin.org/en/download" target="_blank" style="color: #1890ff;">下载 Bitcoin Core (适用于 BTC 链)</a>
        </div>
      </template>
    </a-alert>

    <a-spin :spinning="loading">
      <div v-if="relayCards.length" class="section-header">
        <div class="section-title">搬运脚本列表</div>
        <div class="section-subtitle">选择对应源链下载或运行脚本</div>
      </div>

      <a-row :gutter="[24, 24]" v-if="relayCards.length">
        <a-col
          v-for="chain in relayCards"
          :key="chain.chain_id"
          :xs="24"
          :sm="12"
          :xl="8"
        >
          <a-card hoverable class="source-card">
            <div class="chain-header">
              <div class="chain-logo-placeholder">
                {{ getChainLogoText(chain.symbol) }}
              </div>
              <div class="chain-title-group">
                <div class="chain-name">{{ chain.name || chain.symbol }}</div>
                <div class="chain-symbol">{{ chain.symbol }}</div>
              </div>
              <div class="chain-id-tag">
                #{{ chain.chain_id }}
              </div>
              <div style="margin-left: auto; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;" :style="{ backgroundColor: chain.supported ? '#f6ffed' : '#fffbe6', color: chain.supported ? '#52c41a' : '#faad14', border: '1px solid', borderColor: chain.supported ? '#b7eb8f' : '#ffe58f' }">
                {{ chain.supported ? '已配置' : '待补充' }}
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
                  <span class="meta-hash">{{ shortenValue(chain.latest_raw_hash || '-') }}</span>
                </a-tooltip>
              </div>
            </div>

            <div class="chain-info">
              <div class="info-block">
                <div class="info-label">中继合约</div>
                <div style="font-family: monospace; font-size: 14px; color: #333;">{{ shortenValue(chain.relay_addr || '-') }}</div>
              </div>
              <div class="info-block">
                <div class="info-label">{{ chain.scriptLabel }}</div>
                <div style="font-family: monospace; font-size: 12px; color: #666; word-break: break-all;">{{ chain.forgeScript }}</div>
              </div>
              <div class="info-block">
                <div class="info-label">{{ chain.headerLabel }}</div>
                <div style="font-family: monospace; font-size: 12px; color: #666; word-break: break-all;">{{ chain.headerScript }}</div>
              </div>
              <div class="info-block">
                <div class="info-label">环境变量</div>
                <div style="font-family: monospace; font-size: 12px; color: #666;">{{ chain.envKey }}</div>
              </div>
              
              <div class="info-block" style="display: flex; flex-direction: column; gap: 10px; padding-top: 12px;">
                <a-tooltip v-if="chain.nodeClientUrl" placement="top" title="作为搬运工，理论上需要先运行该链的全节点客户端以独立获取并验证区块数据。">
                  <a-button block :href="chain.nodeClientUrl" target="_blank">{{ chain.nodeClientLabel || '下载全节点客户端' }}</a-button>
                </a-tooltip>
                <a-button
                  type="primary"
                  block
                  :disabled="!chain.supported"
                  @click="downloadRelayScript(chain)"
                >
                  {{ chain.symbol === 'SEP' ? '下载 SEP 完整压缩包' : `下载 ${chain.symbol} 搬运脚本` }}
                </a-button>
                <a-typography-paragraph v-if="chain.supported" style="margin-bottom: 0; padding: 8px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px; font-size: 12px;" copyable>
                  {{ chain.symbol === 'SEP' ? '解压后执行：python sep_relay_runner.py --env dev --interval 5 --finality-depth 8 --verify-window 16' : `python ${chain.fileName} --env dev --interval 5` }}
                </a-typography-paragraph>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-empty
        v-else
        class="empty-state"
        description="暂无可用源链数据"
        style="margin-top: 72px;"
      />
    </a-spin>
  </a-layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { ethers } from 'ethers'

import sepBundleUrl from './relay-bundles/sep_relay_bundle.zip?url'
import sscScriptUrl from './relay-scripts/ssc_relay_runner.py?url'
import btcScriptUrl from './relay-scripts/btc_relay_runner.py?url'
import btrScriptUrl from './relay-scripts/btr_relay_runner.py?url'
import ethScriptUrl from './relay-scripts/eth_relay_runner.py?url'
import lclScriptUrl from './relay-scripts/lcl_relay_runner.py?url'

interface SourceData {
  chain_id: number
  symbol: string
  name: string
  latest_raw_height?: number | null
  latest_raw_hash?: string | null
}

interface ContractData {
  contract_addr: string
  chain_id: number
  level_id: number
}

interface RelayScriptPreset {
  scriptLabel?: string
  forgeScript: string
  headerLabel?: string
  envKey: string
  headerScript: string
  downloadUrl?: string
  downloadFileName?: string
  rpcPort?: string
}

interface RelayCardData extends SourceData, RelayScriptPreset {
  relay_addr: string
  fileName: string
  downloadUrl: string
  scriptLabel: string
  headerLabel: string
  supported: boolean
  nodeClientUrl?: string
  nodeClientLabel?: string
}

const loading = ref(false)
const sourceInfo = ref<SourceData[]>([])
const contractInfo = ref<ContractData[]>([])

const relayScriptConfigMap: Record<string, RelayScriptPreset> = {
  SEP: {
    scriptLabel: '运行方式',
    forgeScript: '纯 Python 直连合约执行，无需 Forge',
    headerLabel: '核心取头脚本',
    envKey: 'SEPOLIA_RPC_URL',
    headerScript: 'script/get_SEP_Header.py',
    downloadUrl: sepBundleUrl,
    downloadFileName: 'sep_relay_bundle.zip',
    rpcPort: '8545'
  },
  SSC: {
    forgeScript: 'script/SSC/SSC_Relay.s.sol',
    envKey: 'DEV_RPC_URL',
    headerScript: '内置生成，无额外头脚本',
    downloadUrl: sscScriptUrl,
    downloadFileName: 'ssc_relay_runner.py',
    rpcPort: '8545'
  },
  BTC: {
    forgeScript: 'script/BTC/BTC_Relay.s.sol',
    envKey: 'BTC_RPC_URL',
    headerScript: 'script/BTC/get_BTC_Header.py',
    downloadUrl: btcScriptUrl,
    downloadFileName: 'btc_relay_runner.py',
    rpcPort: '8332'
  },
  BTR: {
    forgeScript: 'script/BTR/BTR_Relay.s.sol',
    envKey: 'BTR_RPC_URL',
    headerScript: 'script/BTR/get_BTR_Header.py',
    downloadUrl: btrScriptUrl,
    downloadFileName: 'btr_relay_runner.py',
    rpcPort: '8545'
  },
  ETH: {
    forgeScript: 'script/ETH/ETH_Relay.s.sol',
    envKey: 'ETH_RPC_URL',
    headerScript: 'script/ETH/get_ETH_Header.py',
    downloadUrl: ethScriptUrl,
    downloadFileName: 'eth_relay_runner.py',
    rpcPort: '8545'
  },
  LCL: {
    forgeScript: 'script/LCL/LCL_Relay.d.sol',
    envKey: 'LCL_RPC_URL',
    headerScript: 'script/LCL/get_LCL_Header.py',
    downloadUrl: lclScriptUrl,
    downloadFileName: 'lcl_relay_runner.py',
    rpcPort: '8545'
  }
}

const chainContractMap = computed(() => {
  const map = new Map<number, string>()
  contractInfo.value.forEach(contract => {
    if (contract.level_id === 0) {
      map.set(contract.chain_id, contract.contract_addr)
    }
  })
  return map
})

const relayCards = computed<RelayCardData[]>(() => {
  return sourceInfo.value.map(source => {
    const symbol = String(source.symbol || '').toUpperCase()
    const preset = relayScriptConfigMap[symbol]

    return {
      ...source,
      relay_addr: chainContractMap.value.get(source.chain_id) || '-',
      scriptLabel: preset?.scriptLabel || 'Forge 脚本',
      forgeScript: preset?.forgeScript || `script/${symbol}/${symbol}_Relay.s.sol`,
      headerLabel: preset?.headerLabel || '取头脚本',
      envKey: preset?.envKey || `${symbol}_RPC_URL`,
      headerScript: preset?.headerScript || `script/${symbol}/get_${symbol}_Header.py`,
      fileName: preset?.downloadFileName || `${symbol.toLowerCase()}_relay_runner.py`,
      downloadUrl: preset?.downloadUrl || '',
      supported: Boolean(preset?.downloadUrl),
      rpcPort: preset?.rpcPort || '8545'
    }
  })
})

const getChainLogoText = (symbol?: string) => {
  if (!symbol) return 'C'
  return symbol.trim().charAt(0).toUpperCase()
}

const shortenValue = (value: string) => {
  if (!value || value === '-') return value
  if (value.length <= 18) return value
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

const fallbackRpcUrl = 'http://47.243.174.71:36054'
const fallbackManagerAddr = '0x6d811bf404DaE8Df3d39b15604e32eF040d3D236'

const managerABI = [
  'function getSourceChainNum() view returns (uint256)',
  'function getSourceChainInfo(uint256 sourceID) view returns (string symbol, string name, uint256 state, uint256 contractNum, address[] contractAddressList)'
]

const relayABI = [
  'function getTopKeyFromShadowLedger_slot() view returns (bytes32)',
  'function getTopKeyFromShadowLedger() view returns (bytes32)'
]

const fetchRelayData = async () => {
  loading.value = true
  try {
    const rpcUrl = fallbackRpcUrl
    const managerAddr = fallbackManagerAddr

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
            contract_addr: relayAddr,
            chain_id: chainId,
            level_id: 0
          })
        }

        onchainSources.push({
          chain_id: chainId,
          symbol,
          name,
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
    console.error('获取搬运工页面数据失败:', err)
    message.error('获取搬运工页面数据失败')
  } finally {
    loading.value = false
  }
}

const downloadRelayScript = (chain: RelayCardData) => {
  if (!chain.downloadUrl) {
    message.warning(`${chain.symbol} 暂未配置下载资源`)
    return
  }

  try {
    const link = document.createElement('a')
    link.href = chain.downloadUrl
    link.download = chain.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success(`已开始下载 ${chain.fileName}`)
  } catch (err) {
    console.error('下载搬运脚本失败:', err)
    message.error('下载搬运脚本失败')
  }
}

onMounted(() => {
  fetchRelayData()
})
</script>

<style src="@assets/CrossChain/multichain.scss"></style>
