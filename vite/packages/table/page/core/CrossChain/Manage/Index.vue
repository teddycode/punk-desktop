<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">跨链管理</h1>
        <p class="cc-page-desc">
          业务类型与源链的变更需经委员会通过 Manager 代理调用，全部由钱包签名。仅浏览时不影响链上状态。
        </p>
      </div>
      <div class="cc-toolbar">
        <span class="cc-chip" :class="isMember === true ? 'is-success' : 'is-default'">
          {{ membershipText }}
        </span>
        <a-button :loading="loading" @click="load">刷新</a-button>
      </div>
    </div>

    <a-alert
      v-if="isMember === false"
      type="info"
      show-icon
      message="当前账户不是委员会成员，管理操作为只读"
      description="仍可浏览业务类型与源链；提交变更会在链上被权限校验拒绝。"
    />

    <a-tabs v-model:activeKey="tab">
      <!-- 业务类型 -->
      <a-tab-pane key="routes" tab="业务类型">
        <div class="cc-panel">
          <div class="cc-toolbar">
            <h2 class="cc-section-title" style="margin: 0">已注册业务类型</h2>
            <div class="cc-spacer"></div>
            <a-button size="small" @click="openRouteForm()">新增 / 更新业务类型</a-button>
          </div>
          <div v-if="!crossChainState.routes.length" class="cc-empty" style="margin-top: 10px">链上尚未注册业务类型。</div>
          <a-table
            v-else
            :columns="routeColumns"
            :data-source="crossChainState.routes"
            :pagination="false"
            row-key="id"
            size="small"
            style="margin-top: 10px"
            :scroll="{ x: 820 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">{{ record.name || `#${record.id}` }}</template>
              <template v-else-if="column.key === 'isActive'">
                <span class="cc-chip" :class="record.isActive ? 'is-success' : 'is-default'">
                  {{ record.isActive ? '可用' : '已停用' }}
                </span>
              </template>
              <template v-else-if="column.key === 'verifier'">
                <span class="cc-addr">{{ shortenAddress(record.verifier) }}</span>
              </template>
              <template v-else-if="column.key === 'capability'">
                <span v-if="capabilities[record.id]" class="cc-chip is-processing">
                  {{ describeCapability(capabilities[record.id]).badge }}
                </span>
                <span v-else class="cc-hint">检测中…</span>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="openRouteForm(record)">更新</a-button>
              </template>
            </template>
          </a-table>

          <div style="margin-top: var(--cc-gap)">
            <h2 class="cc-section-title">业务类型变更历史（RouteUpdated 事件）</h2>
            <div v-if="!routeHistory.length" class="cc-empty">暂无变更记录。</div>
            <a-table
              v-else
              :columns="historyColumns"
              :data-source="routeHistory"
              :pagination="{ pageSize: 10 }"
              row-key="txHash"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'verifier'">
                  <span class="cc-addr">{{ shortenAddress(record.verifier) }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </a-tab-pane>

      <!-- 链接入 -->
      <a-tab-pane key="chains" tab="链接入">
        <div class="cc-panel">
          <div class="cc-toolbar">
            <h2 class="cc-section-title" style="margin: 0">已注册源链</h2>
            <div class="cc-spacer"></div>
            <a-button size="small" @click="chainFormVisible = true">注册源链</a-button>
          </div>
          <div v-if="!chains.length" class="cc-empty" style="margin-top: 10px">链上尚未注册源链。</div>
          <a-table
            v-else
            :columns="chainColumns"
            :data-source="chains"
            :pagination="false"
            row-key="chainId"
            size="small"
            style="margin-top: 10px"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'relayAddress'">
                <span class="cc-addr">{{ record.relayAddress || '未配置' }}</span>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 委员会 -->
      <a-tab-pane key="committee" tab="委员会">
        <div class="cc-panel">
          <h2 class="cc-section-title">成员校验</h2>
          <div class="cc-hint">
            合约只提供 committeeMembers(address) 查询，链上无法枚举全部成员，因此这里不展示成员列表，只做地址校验。
          </div>
          <div class="cc-toolbar" style="margin-top: 12px">
            <a-input v-model:value="memberQuery" placeholder="输入地址查询是否为委员会成员" style="max-width: 420px" />
            <a-button :loading="memberQuerying" @click="checkMember">查询</a-button>
            <span v-if="memberQueryResult !== null" class="cc-chip" :class="memberQueryResult ? 'is-success' : 'is-default'">
              {{ memberQueryResult ? '是委员会成员' : '不是委员会成员' }}
            </span>
          </div>
          <div class="cc-hint" style="margin-top: 12px">
            当前连接账户：<span class="cc-addr">{{ crossChainState.walletAddress || '未连接' }}</span>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 业务类型表单 -->
    <a-modal v-model:open="routeFormVisible" title="新增 / 更新业务类型" @ok="submitRoute" :confirm-loading="submitting">
      <div style="display: flex; flex-direction: column; gap: 10px">
        <div>
          <div class="cc-hint">业务类型 ID（typeId）</div>
          <a-input-number v-model:value="routeForm.routeId" :min="0" style="width: 100%" />
        </div>
        <div>
          <div class="cc-hint">名称（创建任务时需与此完全一致）</div>
          <a-input v-model:value="routeForm.name" placeholder="例如 Auction" />
        </div>
        <div>
          <div class="cc-hint">验证器地址</div>
          <a-input v-model:value="routeForm.verifier" placeholder="0x..." />
        </div>
        <div>
          <a-checkbox v-model:checked="routeForm.isActive">启用该业务类型</a-checkbox>
        </div>
        <div class="cc-hint">
          变更将经 Manager.operateSystemContract 代理调用 Transport.setCrossChainRoute，需要委员会成员身份。
        </div>
      </div>
    </a-modal>

    <!-- 源链表单 -->
    <a-modal v-model:open="chainFormVisible" title="注册源链" @ok="submitChain" :confirm-loading="submitting">
      <div style="display: flex; flex-direction: column; gap: 10px">
        <div>
          <div class="cc-hint">符号（如 ETH）</div>
          <a-input v-model:value="chainForm.symbol" />
        </div>
        <div>
          <div class="cc-hint">名称（如 Ethereum Sepolia）</div>
          <a-input v-model:value="chainForm.name" />
        </div>
        <div class="cc-hint">注册后仍需另行部署并配置 relay 合约，界面会显示为“待补充”。</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { crossChainState, loadRoutes, loadWalletAddress } from '../services/store'
import { getRouteHistory, getSourceChains, type SourceChainInfo } from '../services/chain'
import type { RouteUpdatedEvent } from '../services/abi'
import { describeCapability, probeVerifierCapability, type VerifierCapability } from '../services/verifier'
import { shortenAddress } from '../services/format'
import { ActionError, addSourceChainAction, isCommitteeMember, setCrossChainRouteAction } from '../services/actions'
import type { RouteInfo } from '../services/abi'

const router = useRouter()
const route = useRoute()

const tab = ref<string>((route.query.tab as string) || 'routes')
const loading = ref(false)
const submitting = ref(false)
const isMember = ref<boolean | null>(null)
const memberQuery = ref('')
const memberQuerying = ref(false)
const memberQueryResult = ref<boolean | null>(null)

const capabilities = ref<Record<number, VerifierCapability>>({})
const routeHistory = ref<RouteUpdatedEvent[]>([])
const chains = ref<SourceChainInfo[]>([])

const routeFormVisible = ref(false)
const chainFormVisible = ref(false)
const routeForm = reactive({ routeId: 0, name: '', verifier: '', isActive: true })
const chainForm = reactive({ symbol: '', name: '' })

const routeColumns = [
  { title: '类型 ID', key: 'id', width: 100 },
  { title: '名称', key: 'name', width: 160 },
  { title: '状态', key: 'isActive', width: 110 },
  { title: '验证器', key: 'verifier', width: 160 },
  { title: '验证要求', key: 'capability', width: 140 },
  { title: '操作', key: 'action', width: 100 },
]

const historyColumns = [
  { title: '类型 ID', key: 'routeId', width: 100 },
  { title: '名称', key: 'name', width: 140 },
  { title: '启用', key: 'isActive', width: 90 },
  { title: '验证器', key: 'verifier', width: 160 },
  { title: '区块', key: 'blockNumber', width: 110 },
]

const chainColumns = [
  { title: '链 ID', key: 'chainId', width: 90 },
  { title: '符号', key: 'symbol', width: 120 },
  { title: '名称', key: 'name', width: 200 },
  { title: '状态', key: 'state', width: 90 },
  { title: 'relay', key: 'relayAddress', width: 200 },
]

const membershipText = computed(() => {
  if (isMember.value === null) return '成员身份未检测'
  return isMember.value ? '委员会成员' : '非委员会成员（只读）'
})

async function load() {
  loading.value = true
  try {
    await Promise.all([loadRoutes(true), loadWalletAddress()])
    const [history, chainList] = await Promise.all([
      getRouteHistory().catch(() => []),
      getSourceChains().catch(() => []),
    ])
    routeHistory.value = [...history].sort((a, b) => b.blockNumber - a.blockNumber)
    chains.value = chainList

    // 能力探测（仅用于展示）
    const map: Record<number, VerifierCapability> = {}
    await Promise.all(
      crossChainState.routes.map(async (item) => {
        map[item.id] = await probeVerifierCapability(item.verifier)
      }),
    )
    capabilities.value = map

    if (crossChainState.walletAddress) {
      isMember.value = await isCommitteeMember(crossChainState.walletAddress).catch(() => null)
    }
  } finally {
    loading.value = false
  }
}

function openRouteForm(item?: RouteInfo) {
  routeForm.routeId = item?.id ?? (crossChainState.routes.reduce((max, r) => Math.max(max, r.id), 0) + 1)
  routeForm.name = item?.name ?? ''
  routeForm.verifier = item?.verifier && item.verifier !== '0x0000000000000000000000000000000000000000' ? item.verifier : ''
  routeForm.isActive = item?.isActive ?? true
  routeFormVisible.value = true
}

async function submitRoute() {
  submitting.value = true
  try {
    const hash = await setCrossChainRouteAction({
      routeId: Number(routeForm.routeId),
      name: routeForm.name.trim(),
      isActive: routeForm.isActive,
      verifier: routeForm.verifier.trim(),
    })
    message.success(`交易已确认：${hash.slice(0, 12)}…`)
    routeFormVisible.value = false
    await load()
  } catch (error: any) {
    const hint = error instanceof ActionError && error.hint ? `（${error.hint}）` : ''
    message.error(`${error?.message || '提交失败'}${hint}`)
  } finally {
    submitting.value = false
  }
}

async function submitChain() {
  submitting.value = true
  try {
    const hash = await addSourceChainAction(chainForm.symbol, chainForm.name)
    message.success(`交易已确认：${hash.slice(0, 12)}…`)
    chainFormVisible.value = false
    chainForm.symbol = ''
    chainForm.name = ''
    await load()
  } catch (error: any) {
    const hint = error instanceof ActionError && error.hint ? `（${error.hint}）` : ''
    message.error(`${error?.message || '提交失败'}${hint}`)
  } finally {
    submitting.value = false
  }
}

async function checkMember() {
  memberQuerying.value = true
  memberQueryResult.value = null
  try {
    memberQueryResult.value = await isCommitteeMember(memberQuery.value.trim())
    if (memberQueryResult.value === null) message.warning('无法查询：地址格式不正确或链上调用失败')
  } finally {
    memberQuerying.value = false
  }
}

watch(tab, (value) => router.replace({ name: 'CrossChainManage', query: { tab: value } }))

onMounted(load)
</script>
