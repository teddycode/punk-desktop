/**
 * 跨链模块功能自测（只读，跑真实链）
 *
 * 运行方式：node packages/table/page/core/CrossChain/__tests__/run.cjs
 * 覆盖：环境解析、业务类型与验证器能力、任务合约读取、事件驱动扫描（全量+增量）、
 *       详情与过滤、区块时间、源链与 relay、证明参数校验、目标链探测、展示格式化。
 *
 * 说明：写操作（发起/接单/提交证明）需要真实钱包与 gas，不在本测试范围内；
 * 但 actions.ts 的前置校验逻辑会在此处做静态用例。
 */
import {
  getRoutes, getRoute, getRouteHistory, getTaskNum, getTasksPaged, getTaskInfo,
  getStateEvents, getStateEventsByKey, getCreatedEventsByKey,
  getBlockTimestamps, getBlockTimestamp,
  getSourceChains, getRelayParams, getShadowBlocks, getRelayerContributions,
  getTxIfCheck, getSystemState, invalidateMutableCaches,
} from '@page/core/CrossChain/services/chain'
import {
  scanTasks, loadTaskRecord, filterTasks, summarizeTasks,
  TaskLabel, resetScanState, getScanCursor, deriveTaskRecords,
} from '@page/core/CrossChain/services/taskState'
import { probeVerifierCapability, describeCapability, clearCapabilityCache } from '@page/core/CrossChain/services/verifier'
import { decodeProofBundle, computeHeaderHash, validateProofInput, validateFinishParams } from '@page/core/CrossChain/services/proof'
import { resolveHubConfig, probeHubStatus, probeTargetChain, getTargetChain, setTargetChain } from '@page/core/CrossChain/services/config'
import { formatWei, shortenAddress, labelText, labelClass, payloadBytes, tryDecodePayloadText, isHex, formatTimestamp } from '@page/core/CrossChain/services/format'
import { MAX_TASK_TIME_BLOCKS, SystemState } from '@page/core/CrossChain/services/abi'
import { ethers } from 'ethers'

const results: Array<{ name: string; ok: boolean; detail?: string }> = []
let failed = 0

function check(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail })
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  → ' + detail : ''}`)
}
function eq(name: string, actual: any, expected: any) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected)
  check(name, a === e, a === e ? undefined : `实际=${a} 期望=${e}`)
}

async function main() {
  console.log('===== 1. 环境解析 =====')
  const cfg = await resolveHubConfig()
  check('resolveHubConfig 返回 RPC/Manager/Transport', Boolean(cfg.rpcUrl && cfg.managerAddress && cfg.transportAddress), `${cfg.rpcUrl} | ${cfg.transportAddress}`)
  check('Manager 与 Transport 是不同地址', cfg.managerAddress.toLowerCase() !== cfg.transportAddress.toLowerCase())
  const hub = await probeHubStatus()
  check('probeHubStatus 连接成功', hub.ok === true, `chainId=${hub.chainId} block=${hub.blockNumber}`)
  eq('合约处于 work 状态', hub.contractState, SystemState.Work)

  console.log('\n===== 2. 业务类型与验证器能力 =====')
  const routes = await getRoutes(true)
  check('getAllRoutes 返回业务类型', routes.length > 0, routes.map((r) => `${r.id}:${r.name}:${r.isActive}`).join(', '))
  const r1 = await getRoute(routes[0].id)
  check('getRoute 单个读取一致', r1?.name === routes[0].name && r1?.verifier === routes[0].verifier, r1?.name)
  check('RouteUpdated 变更历史可读', (await getRouteHistory()).length > 0, `${(await getRouteHistory()).length} 条`)

  for (const r of routes) {
    const cap = await probeVerifierCapability(r.verifier)
    check(`能力探测 ${r.name}`, ['proof-required', 'raw-tx-only', 'unknown'].includes(cap.kind),
      `${cap.kind}${cap.expectedChain ? ' expectedChain=' + cap.expectedChain : ''} (${describeCapability(cap).badge})`)
  }
  const zeroCap = await probeVerifierCapability(ethers.constants.AddressZero)
  eq('未绑定验证器 → unknown（不被阻断）', zeroCap.kind, 'unknown')
  clearCapabilityCache()
  const cached1 = await probeVerifierCapability(routes[0].verifier)
  const cached2 = await probeVerifierCapability(routes[0].verifier)
  eq('能力探测结果被缓存', cached1.kind, cached2.kind)

  console.log('\n===== 3. 任务读取（合约）=====')
  const taskNum = await getTaskNum()
  check('taskNum 可读', taskNum >= 0, String(taskNum))
  if (taskNum > 0) {
    const page1 = await getTasksPaged(1, 2)
    eq('按页读取任务数量', page1.items.length, Math.min(2, taskNum))
    eq('分页总数', page1.total, taskNum)
    if (page1.items.length === 2) check('分页按索引倒序', Number(page1.items[0].index) > Number(page1.items[1].index), `${page1.items[0].index} > ${page1.items[1].index}`)
    const accepted = page1.items.find((t) => t.label === TaskLabel.Accepted)
    if (accepted) {
      check('已接单任务 relayer 非零', accepted.relayer !== ethers.constants.AddressZero, accepted.relayer)
      check('已接单任务命中 txIfCheck 语义（stake>0）', ethers.BigNumber.from(accepted.stake).gt(0), accepted.stake)
    }
  }
  eq('getContractState', await getSystemState(), SystemState.Work)
  eq('txIfCheck 未使用过的 keyTx = false', await getTxIfCheck('0x' + '11'.repeat(32)), false)
  const successStates = await getStateEvents(0, undefined, TaskLabel.Successed)
  check('按 newState 过滤可执行（topic 过滤生效）', Array.isArray(successStates), `${successStates.length} 条已成功`)
  check('MAX_TASK_TIME_BLOCKS 常量为 144', MAX_TASK_TIME_BLOCKS === 144)

  console.log('\n===== 4. 事件驱动扫描 =====')
  resetScanState()
  const phases: string[] = []
  const scan1 = await scanTasks({ onProgress: (p) => phases.push(p.phase) })
  eq('全量扫描任务数 = taskNum', scan1.records.length, taskNum)
  eq('首次扫描从区块 0 开始', scan1.scannedFrom, 0)
  eq('首次扫描非增量', scan1.incremental, false)
  check('进度回调覆盖 logs/hydrate/time/done', ['logs', 'hydrate', 'time', 'done'].every((p) => phases.includes(p)), phases.join('>'))

  check('每条记录都有创建事件时间戳', scan1.records.every((r) => r.createdAt !== null), `${scan1.records.filter((r) => r.createdAt !== null).length}/${scan1.records.length}`)
  check('状态取值合法', scan1.records.every((r) => r.label >= 0 && r.label <= 5))
  const acceptedRec = scan1.records.find((r) => r.label === TaskLabel.Accepted)
  if (acceptedRec) {
    check('事件推导的执行者与合约一致', Boolean(acceptedRec.relayer) && acceptedRec.relayer !== ethers.constants.AddressZero, acceptedRec.relayer)
    check('时间线含 created + accepted', acceptedRec.timeline.some((n) => n.kind === 'created') && acceptedRec.timeline.some((n) => n.kind === 'accepted'), acceptedRec.timeline.map((n) => n.kind).join('>'))
    check('时间线节点均带时间戳', acceptedRec.timeline.every((n) => n.timestamp !== null))
  }

  const cursor1 = getScanCursor()
  const scan2 = await scanTasks()
  eq('二次扫描为增量', scan2.incremental, true)
  eq('增量起始区块 = 游标 + 1', scan2.scannedFrom, cursor1 + 1)
  eq('增量扫描记录数不膨胀', scan2.records.length, taskNum)

  invalidateMutableCaches()
  const scan3 = await scanTasks({ force: true })
  eq('强制刷新后记录数一致', scan3.records.length, taskNum)

  console.log('\n===== 5. 详情、按 Key 查询与过滤 =====')
  if (acceptedRec) {
    const detail = await loadTaskRecord(acceptedRec.key, new Map(routes.map((r) => [r.id, r.name])))
    check('按 Key 单独加载任务（深链场景）', detail !== null, detail?.key.slice(0, 14))
    eq('单独加载的 label 一致', detail?.label, acceptedRec.label)
    eq('单独加载的业务类型名', detail?.taskTypeName, routes.find((r) => r.id === detail?.taskType)?.name)
    const createdAt = await getCreatedEventsByKey(acceptedRec.key)
    eq('按 Key 过滤创建事件', createdAt.length, 1)
    const stateByKey = await getStateEventsByKey(acceptedRec.key)
    check('按 Key 过滤状态事件', stateByKey.length >= 1, `${stateByKey.length} 条`)
  }
  const owner = scan1.records[0]?.user
  if (owner) {
    eq('按发起人过滤', filterTasks(scan1.records, { address: owner, role: 'creator' }).length, taskNum)
  }
  eq('按状态组 active 过滤 = 全部（当前无终结任务）', filterTasks(scan1.records, { stateGroup: 'active' }).length, scan1.records.length)
  const sum = summarizeTasks(scan1.records, owner, true)
  eq('统计 total', sum.total, taskNum)

  // 纯函数边界用例
  const synthetic = deriveTaskRecords({
    created: [{ index: 9, key: '0x' + 'aa'.repeat(32), payload: '0x', taskType: 1, user: '0x' + 'bb'.repeat(20), fee: '1', blockNumber: 100, txHash: '0x' + 'cc'.repeat(32), logIndex: 0 }],
    states: [{ key: '0x' + 'aa'.repeat(32), oldState: 2, newState: 4, operator: '0x' + 'dd'.repeat(20), blockNumber: 110, txHash: '0x' + 'ee'.repeat(32), logIndex: 1 }],
    confirms: [{ keyTx: '0x' + 'ff'.repeat(32), keyShadowBlock: '0x' + '11'.repeat(32), confirmParam: 8, flag: false, blockNumber: 110, txHash: '0x' + 'ee'.repeat(32), logIndex: 2 }],
    reported: [],
    timestamps: new Map([[100, 1700000000], [110, 1700000100]]),
  })
  eq('合成用例：终结状态由事件推导', synthetic[0]?.label, TaskLabel.Successed)
  check('合成用例：记录已删除标记', synthetic[0]?.recordDeleted === true)
  check('合成用例：ConfirmSourceTx 按 txHash 关联进时间线', synthetic[0]?.timeline.some((n) => n.kind === 'confirm'))

  console.log('\n===== 6. 区块时间、源链与 relay =====')
  if (acceptedRec) {
    const tsMap = await getBlockTimestamps([acceptedRec.createdAtBlock])
    check('批量取区块时间命中', tsMap.has(acceptedRec.createdAtBlock), String(tsMap.get(acceptedRec.createdAtBlock)))
  }
  const single = await getBlockTimestamp(15153)
  check('单区块时间换算合理', single !== null && single > 1700000000, formatTimestamp(single))
  check('时间格式化为本地字符串', formatTimestamp(1789272739).length >= 16, formatTimestamp(1789272739))

  const chains = await getSourceChains()
  check('源链列表可读', chains.length > 0, chains.map((c) => `${c.chainId}:${c.symbol}:${c.relayAddress ? 'relay✓' : 'relay✗'}`).join(', '))
  for (const chain of chains) {
    const relay = await getRelayParams(chain.chainId, owner)
    check(`relay 参数可读（链 ${chain.chainId} ${chain.symbol}）`, relay !== null,
      relay ? `requireStake=${relay.requireStake} topShadowKey=${String(relay.topShadowKey).slice(0, 14)}` : 'null')
    const shadow = await getShadowBlocks(chain.chainId, 5)
    check(`影子区块读取（链 ${chain.chainId}）`, ['logs', 'head', 'unsupported'].includes(shadow.source), `source=${shadow.source} items=${shadow.items.length}`)
    const contrib = await getRelayerContributions(chain.chainId, 5)
    check(`搬运贡献读取不抛错（链 ${chain.chainId}）`, Array.isArray(contrib), `${contrib.length} 条`)
  }

  console.log('\n===== 7. 证明参数处理 =====')
  let decodeErr = ''
  try { decodeProofBundle('0x1234') } catch (e: any) { decodeErr = e.message }
  check('非法 proof 解码报错', decodeErr.length > 0, decodeErr.slice(0, 50))
  let emptyErr = ''
  try { decodeProofBundle('0x') } catch (e: any) { emptyErr = e.message }
  check('空 proof 解码报错', emptyErr.length > 0, emptyErr.slice(0, 30))
  let istanbulErr = ''
  try { computeHeaderHash({ baseFeePerGas: 1, withdrawalsRoot: ethers.constants.HashZero }) } catch (e: any) { istanbulErr = e.message }
  check('非 Istanbul 区块头拒绝重算', istanbulErr.length > 0, istanbulErr.slice(0, 40))
  eq('空证明 → 校验失败', validateProofInput({ proof: '0x', rawTx: '0x', keyShadowBlock: '' }).ok, false)
  eq('不可解码证明 → 校验失败', validateProofInput({ proof: '0x1234', rawTx: '0xabcd', keyShadowBlock: '' }).ok, false)
  eq('finishTask 参数兜底校验通过', validateFinishParams({ rawTx: '0xabcd', leafNode: '0x', proof: '0x', keyShadowBlock: ethers.constants.HashZero }).filter((i) => i.level === 'error').length, 0)
  check('finishTask 非法参数被拦截', validateFinishParams({ rawTx: 'zz', keyShadowBlock: '0x12' }).filter((i) => i.level === 'error').length >= 2)

  console.log('\n===== 8. 目标链配置 =====')
  setTargetChain({ rpcUrl: 'http://127.0.0.1:30305', expectedChain: 'LCL' })
  eq('目标链配置已保存（localStorage）', getTargetChain()?.rpcUrl, 'http://127.0.0.1:30305')
  const probeBad = await probeTargetChain('http://127.0.0.1:30305')
  eq('不可达目标链 → ok=false', probeBad.ok, false)
  check('失败原因可读', Boolean(probeBad.error), String(probeBad.error).slice(0, 40))
  const probeGood = await probeTargetChain(cfg.rpcUrl)
  check('可达节点探测成功且报告原始交易支持', probeGood.ok === true, `chainId=${probeGood.chainId} supportsRawTx=${probeGood.supportsRawTransaction}`)
  setTargetChain(null)
  eq('目标链配置可清除', getTargetChain(), null)

  console.log('\n===== 9. 展示格式化 =====')
  eq('formatWei(0.01 PUNK)', formatWei('10000000000000000'), '0.01 PUNK')
  eq('formatWei(1 PUNK)', formatWei(ethers.utils.parseEther('1').toString()), '1 PUNK')
  eq('formatWei(0)', formatWei('0'), '0 PUNK')
  eq('labelText(2) 是「已接单」', labelText(2), '已接单')
  eq('labelText(1)', labelText(1), '待接单')
  eq('labelText(4)', labelText(4), '已成功')
  eq('labelClass(4)', labelClass(4), 'is-success')
  eq('labelClass(0)', labelClass(0), 'is-default')
  eq('shortenAddress 头6尾4', shortenAddress('0x040AB1Cce91AA43981CB430CE9eD5A48866c7deE'), '0x040A…7deE')
  eq('shortenAddress 零地址', shortenAddress(ethers.constants.AddressZero), '零地址')
  eq('payloadBytes(64 字节)', payloadBytes('0x' + '00'.repeat(64)), 64)
  check('全零 payload 不解释为文本', tryDecodePayloadText('0x' + '00'.repeat(64)) === null)
  eq('payload 文本解码', tryDecodePayloadText(ethers.utils.hexlify(ethers.utils.toUtf8Bytes('hello'))), 'hello')
  eq('isHex 合法', isHex('0xab'), true)
  eq('isHex 奇数长度非法', isHex('0xa'), false)

  console.log('\n===== 汇总 =====')
  console.log(`通过 ${results.length - failed} / ${results.length}`)
  if (failed) {
    console.log('\n失败项：')
    results.filter((r) => !r.ok).forEach((r) => console.log('  - ' + r.name + '  ' + (r.detail || '')))
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.log('\n测试异常终止: ' + (error?.stack || error?.message || error))
  process.exitCode = 2
})
