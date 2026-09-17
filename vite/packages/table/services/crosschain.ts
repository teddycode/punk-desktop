import deployment from '../../../../services/crosschain/data/dev/deployment.json'
import { ethers } from 'ethers'
import { ref, watch } from 'vue'
import { browserWallet, browserWalletProvider } from './browserWallet'
import { ElMessage } from 'element-plus'

import { TRANSPORT_ABI } from '@page/core/CrossChain/services/abi'

const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (import.meta as any).env
  : {}

const readEnvString = (...values: any[]): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

const ENV_RPC_URL = readEnvString(
  viteEnv.VITE_RPC_URL,
  viteEnv.RPC_URL,
  (process as any)?.env?.VITE_RPC_URL,
  (process as any)?.env?.RPC_URL
)
const ENV_MANAGER_CONTRACT_ADDRESS = readEnvString(
  viteEnv.VITE_MANAGER_CONTRACT_ADDRESS,
  viteEnv.MANAGER_CONTRACT_ADDRESS,
  (process as any)?.env?.VITE_MANAGER_CONTRACT_ADDRESS,
  (process as any)?.env?.MANAGER_CONTRACT_ADDRESS
)
const ENV_HUB_CHAIN_ID = readEnvString(
  viteEnv.VITE_HUB_CHAIN_ID,
  viteEnv.HUB_CHAIN_ID,
  (process as any)?.env?.VITE_HUB_CHAIN_ID,
  (process as any)?.env?.HUB_CHAIN_ID
)
const ENV_TRANSPORT_LEVEL_ID = readEnvString(
  viteEnv.VITE_TRANSPORT_LEVEL_ID,
  viteEnv.TRANSPORT_LEVEL_ID,
  (process as any)?.env?.VITE_TRANSPORT_LEVEL_ID,
  (process as any)?.env?.TRANSPORT_LEVEL_ID
)

const FALLBACK_RPC_URL = deployment.rpc
const DEFAULT_RPC_URL = ENV_RPC_URL || FALLBACK_RPC_URL
const PUNKOS_CHAIN_ID = deployment.chainId
const PUNKOS_CHAIN_ID_HEX = ethers.utils.hexValue(PUNKOS_CHAIN_ID)
const DEFAULT_HUB_CHAIN_ID = ENV_HUB_CHAIN_ID ? Number(ENV_HUB_CHAIN_ID) : 0
const DEFAULT_TRANSPORT_LEVEL_ID = ENV_TRANSPORT_LEVEL_ID ? Number(ENV_TRANSPORT_LEVEL_ID) : undefined

/**
 * 合约 ABI 现统一由 @page/core/CrossChain/services/abi 提供（唯一来源）。
 * 历史上的 5 参 createTask 与 4 字段 getTaskInfoByKey 与已部署合约不符，已移除。
 */
export { TRANSPORT_ABI as CROSSCHAIN_TRANSPORT_ABI } from '@page/core/CrossChain/services/abi'
const ABI = TRANSPORT_ABI

const MANAGER_ABI = [
  'function contract_chain_index(uint256 _chainId, uint256 _levelId) external view returns (address)'
]

export interface TaskTypeInfo {
  typeId: number
  name: string
  isActive: boolean
  validator: string
}

export interface CreateTaskParams {
  /** 合约不存储源链/目标链，以下两项仅为兼容旧调用保留，不影响创建 */
  srcChainId?: number
  destChainId?: number
  payload: string
  taskType: number
  /** 必须与链上 routes(taskType).name 完全一致 */
  routeName: string
  fee: string
}

export interface FinishTaskParams {
  taskKey: string
  rawTx: string
  blockHash: string
  /** 可选：需要证明的业务类型由外部工具产出后提供 */
  leafNode?: string
  proof?: string
  keyShadowBlock?: string
}

export interface RegisterTaskTypeParams {
  typeId: number
  name: string
  isActive: boolean
  verifier: string
}

export interface ResolveTransportAddressParams {
  managerAddress: string
  rpcUrl?: string
  hubChainId?: number
  transportLevelId?: number
}

type LegacyGetTasksConfig = {
  rpcUrl: string
  contractAddress: string
  abi: any[]
}

type LegacyAcceptTaskConfig = {
  rpcUrl: string
  contractAddress: string
  abi: any[]
  privateKey: string | null
  taskKey: string
}

type LegacyRegisterTaskTypeConfig = {
  rpcUrl: string
  contractAddress: string
  abi: any[]
  privateKey: string | null
  params: {
    typeId: number
    name: string
    isActive: boolean
    verifier: string
  }
}

let cachedProvider: ethers.providers.Web3Provider | null = null
let cachedSigner: ethers.Signer | null = null
let isNetworkCorrect = false
let contractAddressCache: string | null = null
let managerAddressCache: string | null = null
let rpcUrlCache: string | null = null
let injectedWalletProviderRef: any = null
let injectedWalletAccountRef: any = null

const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address)



const normalizeNonNegativeInteger = (value: unknown): number | undefined => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return undefined
  }
  return Math.trunc(numeric)
}

export const setCrosschainWalletContext = (context: {
  walletProviderRef?: any
  walletAccountRef?: any
}) => {
  injectedWalletProviderRef = context?.walletProviderRef || null
  injectedWalletAccountRef = context?.walletAccountRef || null
}

const getWalletProvider = () => {
  if (browserWallet.selected) return browserWalletProvider
  try {
    const web3ModalProvider = injectedWalletProviderRef?.walletProvider?.value as any
    if (web3ModalProvider?.request) {
      console.info('[CrossChain][Service] using injected Web3Modal provider')
      return web3ModalProvider
    }
  } catch (error) {
    console.warn('读取 Web3Modal Provider 失败:', error)
  }

  throw new Error('未检测到钱包')
  const injectedEthereum = (window as any)?.ethereum
  if (injectedEthereum?.request) {
    console.info('[CrossChain][Service] fallback to window.ethereum provider')
    return injectedEthereum
  }

  throw new Error('No wallet provider available')
}

const getConnectedWalletAddress = (): string => {
  if (browserWallet.selected) return browserWallet.address
  try {
    return String(injectedWalletAccountRef?.address?.value || '').trim()
  } catch (error) {
    console.warn('读取 Web3Modal 账户地址失败:', error)
    return ''
  }
}

const getBaseContractConfig = async (): Promise<{
  rpcUrl: string
  managerAddress: string
}> => {
  let rpcUrl = rpcUrlCache || DEFAULT_RPC_URL
  let managerAddress = managerAddressCache || (ENV_MANAGER_CONTRACT_ADDRESS ? '' : deployment.contracts.Manager.address)

  if (!managerAddress && isValidAddress(ENV_MANAGER_CONTRACT_ADDRESS)) {
    managerAddress = ethers.utils.getAddress(ENV_MANAGER_CONTRACT_ADDRESS)
  }

  // 地址只从本地配置解析（环境变量 / deployment.json）。
  // 原先还会调用本地后端 /api/crosschainzone，按“所有数据来自链上”的决策已移除。
  if (!managerAddress) {
    throw new Error('未解析到 Manager 地址：请在环境变量配置 VITE_MANAGER_CONTRACT_ADDRESS，或确认 deployment.json 中的 Manager 地址')
  }

  rpcUrlCache = rpcUrl
  managerAddressCache = managerAddress

  return {
    rpcUrl,
    managerAddress
  }
}

export const getContractConfig = async () => {
  const rpcUrl = await getFinalRpcUrl()
  const contractAddress = await getFinalContractAddress()
  return {
    rpcUrl,
    contractAddress,
    abi: ABI
  }
}

export const resolveTransportAddressByManager = async (
  params: ResolveTransportAddressParams
): Promise<string> => {
  const managerAddress = params?.managerAddress || ''
  if (!ethers.utils.isAddress(managerAddress)) {
    throw new Error('Manager 地址格式错误')
  }

  const rpcUrl = params?.rpcUrl || await getFinalRpcUrl()
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const managerContract = new ethers.Contract(managerAddress, MANAGER_ABI, provider)

  const explicitHubChainId = normalizeNonNegativeInteger(params?.hubChainId)
  const envHubChainId = normalizeNonNegativeInteger(DEFAULT_HUB_CHAIN_ID)
  const network = await provider.getNetwork()
  const hubChainId = explicitHubChainId ?? envHubChainId ?? Number(network.chainId)

  const explicitTransportLevelId = normalizeNonNegativeInteger(params?.transportLevelId)
  const envTransportLevelId = normalizeNonNegativeInteger(DEFAULT_TRANSPORT_LEVEL_ID)
  const transportLevelId = explicitTransportLevelId ?? envTransportLevelId ?? 1

  const transportAddress = await managerContract.contract_chain_index(hubChainId, transportLevelId)
  if (!ethers.utils.isAddress(transportAddress) || transportAddress === ethers.constants.AddressZero) {
    throw new Error('Manager 返回的 Transport 地址无效')
  }

  return ethers.utils.getAddress(transportAddress)
}

export const useResolvedTransportAddressByManager = async (
  params: ResolveTransportAddressParams
): Promise<string> => {
  const transportAddress = await resolveTransportAddressByManager(params)
  contractAddressCache = transportAddress
  if (params?.rpcUrl) {
    rpcUrlCache = params.rpcUrl
  }
  return transportAddress
}

export const getFinalManagerAddress = async (): Promise<string> => {
  if (managerAddressCache) {
    return managerAddressCache
  }
  const { managerAddress } = await getBaseContractConfig()
  return managerAddress
}

export const getFinalContractAddress = async (): Promise<string> => {
  if (contractAddressCache) {
    return contractAddressCache
  }

  const { rpcUrl, managerAddress } = await getBaseContractConfig()
  const transportAddress = await resolveTransportAddressByManager({
    managerAddress,
    rpcUrl
  })
  contractAddressCache = transportAddress
  return transportAddress
}

export const getFinalRpcUrl = async (): Promise<string> => {
  const { rpcUrl } = await getBaseContractConfig()
  return rpcUrl
}

export const formatAddress = (address: string): string => {
  if (!address || address === ethers.constants.AddressZero) {
    return '默认验证器'
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const toHexPayload = (payload: string): string => {
  if (payload.startsWith('0x')) {
    return payload
  }
  const isHex = /^[0-9a-fA-F]+$/.test(payload) && payload.length % 2 === 0
  if (isHex) {
    return `0x${payload}`
  }
  return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(payload))
}

export const formatTxHash = (hash: string): string => {
  if (!hash) return ''
  let formatted = hash.trim()
  if (!formatted.startsWith('0x')) {
    formatted = `0x${formatted}`
  }
  return formatted
}

export const ensureNetwork = async (): Promise<void> => {
  if (isNetworkCorrect && !browserWallet.selected) return

  const ethereum = getWalletProvider()
  const currentChainId = await ethereum.request({ method: 'eth_chainId' })

  if (currentChainId === PUNKOS_CHAIN_ID_HEX) {
    isNetworkCorrect = true
    return
  }

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: PUNKOS_CHAIN_ID_HEX }]
    })
    if (Number(await ethereum.request({ method: 'eth_chainId' })) !== PUNKOS_CHAIN_ID) throw new Error('钱包尚未切换到 PunkOS 网络')
    isNetworkCorrect = true
    return
  } catch (error: any) {
    if (error?.code !== 4902 && error?.code !== 4901) {
      throw new Error(error?.message || '切换网络失败')
    }
  }

  const rpcUrl = browserWallet.selected
    ? (await (window as any).ipc.invoke('browser-wallet:network')).rpcUrls[0]
    : await getFinalRpcUrl()
  if (!browserWallet.selected && !/^https:\/\//i.test(rpcUrl)) {
    throw new Error(`当前钱包无法自动添加该链：rpcUrl 必须是 HTTPS，但当前配置为 ${rpcUrl}。请先在钱包中手动添加 chainId=${PUNKOS_CHAIN_ID}（hex=${PUNKOS_CHAIN_ID_HEX}）的链，或提供 HTTPS RPC。`)
  }

  const addChainParams: Record<string, unknown> = {
    chainId: PUNKOS_CHAIN_ID_HEX,
    chainName: 'PunkOS',
    rpcUrls: [rpcUrl],
    nativeCurrency: {
      name: 'PUNK',
      symbol: 'PUNK',
      decimals: 18
    }
  }

  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [addChainParams]
    })
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: PUNKOS_CHAIN_ID_HEX }] })
    if (Number(await ethereum.request({ method: 'eth_chainId' })) !== PUNKOS_CHAIN_ID) throw new Error('钱包尚未切换到 PunkOS 网络')
    isNetworkCorrect = true
  } catch (error: any) {
    if (/https url 'rpcUrls'/i.test(error?.message || '')) {
      throw new Error(`当前钱包只接受 HTTPS 的 rpcUrls，当前配置为 ${rpcUrl}。请先在钱包中手动添加 chainId=${PUNKOS_CHAIN_ID} 的链，或提供 HTTPS RPC。`)
    }
    throw new Error(error?.message || '添加网络失败')
  }
}

export const getSigner = async (): Promise<ethers.Signer> => {
  if (!browserWallet.selected) throw new Error('跨链交易必须先登录并选择 MetaMask 浏览器钱包')
  await ensureNetwork()
  const accounts = await browserWalletProvider.request({ method: 'eth_accounts' })
  if (!accounts?.[0]) throw new Error('MetaMask 没有授权账户')
  return new ethers.providers.Web3Provider(browserWalletProvider as any, 'any').getSigner(accounts[0])
}

export const getCurrentWalletAddress = async (): Promise<string> => {
  if (browserWallet.selected) {
    const accounts = await browserWalletProvider.request({ method: 'eth_accounts' })
    return accounts?.[0] || ''
  }
  const connectedAddress = getConnectedWalletAddress()
  if (connectedAddress) {
    return connectedAddress
  }

  const signer = await getSigner()
  return signer.getAddress()
}

export const getAllTaskTypes = async (): Promise<TaskTypeInfo[]> => {
  try {
    const contractAddress = await getFinalContractAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(contractAddress, ABI, provider)
    const [typeIds, names, isActiveArray, validators] = await contract.getAllRoutes()
    return typeIds.map((id: any, index: number) => ({
      typeId: Number(id),
      name: names[index] || `任务类型 ${id}`,
      isActive: !!isActiveArray[index],
      validator: validators[index]
    }))
  } catch (error: any) {
    console.error('加载任务类型失败:', error)
    return [
      {
        typeId: 1,
        name: 'Test Task',
        isActive: true,
        validator: ethers.constants.AddressZero
      }
    ]
  }
}

export const debugLoadTaskTypes = async () => {
  try {
    console.log('🔍 开始调试任务类型加载...')
    
    const rpcUrl = await getFinalRpcUrl()
    console.log('✅ RPC URL:', rpcUrl)

    // 测试 RPC 连接
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const network = await provider.getNetwork()
    console.log('✅ RPC 连接成功，链 ID:', network.chainId)

    // 获取合约地址
    const contractAddress = await getFinalContractAddress()
    console.log('✅ Transport 合约地址:', contractAddress)

    // 测试合约调用
    const contract = new ethers.Contract(contractAddress, ABI, provider)
    console.log('✅ 合约实例创建成功')

    const result = await contract.getAllRoutes()
    console.log('✅ getAllRoutes 调用成功:', result)

    const types = await getAllTaskTypes()
    console.log('✅ 处理后的任务类型列表:', types)

    return types
  } catch (err: any) {
    console.error('❌ 调试错误:', err)
    console.error('错误详情:', {
      message: err.message,
      code: err.code,
      reason: err.reason
    })
    throw err
  }
}




export const createTask = async (params: CreateTaskParams): Promise<string> => {
  // 合约方法为 createTask(bytes _payload, string _routeName, uint256 _taskType)。
  // 任务结构里没有源链/目标链字段；_routeName 必须与链上 routes[_taskType].name 完全一致，
  // 否则合约会以 "Route name mismatch" 回滚。
  const { payload, taskType, routeName, fee } = params

  if (!routeName || !routeName.trim()) {
    throw new Error('缺少业务类型名称：必须使用链上 routes(taskType).name 的原文')
  }

  await ensureNetwork()
  const signer = await getSigner()
  const contractAddress = await getFinalContractAddress()
  const payloadHex = toHexPayload(payload)
  const valueInWei = ethers.utils.parseEther(fee)
  const contract = new ethers.Contract(contractAddress, ABI, signer)

  try {
    const estimatedGas = await contract.estimateGas.createTask(payloadHex, routeName, taskType, {
      value: valueInWei
    })

    const tx = await contract.createTask(payloadHex, routeName, taskType, {
      value: valueInWei,
      gasLimit: estimatedGas.mul(120).div(100)
    })

    const receipt = await tx.wait()
    if (receipt?.status === 1) {
      return tx.hash
    }
    throw new Error('交易失败')
  } catch (error: any) {
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      throw new Error('用户取消了交易')
    }
    cachedSigner = null
    cachedProvider = null
    isNetworkCorrect = false
    const reason = error?.reason || error?.message || '交易失败'
    if (/Route invalid/i.test(reason)) {
      throw new Error('该业务类型不存在或已停用，请重新选择')
    }
    if (/Route name mismatch/i.test(reason)) {
      throw new Error('业务类型名称与链上记录不一致，请重新选择后再提交')
    }
    throw new Error(reason)
  }
}

export const getDestChainTxData = async (
  destTxHash: string,
  destRpcUrl: string
): Promise<{ rawTx: string; blockHash: string }> => {
  const formattedHash = formatTxHash(destTxHash)
  const destProvider = new ethers.providers.JsonRpcProvider(destRpcUrl)

  const rawTx = await destProvider.send('eth_getRawTransactionByHash', [formattedHash])
  if (!rawTx) {
    throw new Error('无法获取目标链交易数据，请确认交易已上链')
  }

  const receipt = await destProvider.getTransactionReceipt(formattedHash)
  if (!receipt?.blockHash) {
    throw new Error('交易未确认或未找到')
  }

  return {
    rawTx,
    blockHash: receipt.blockHash
  }
}

/**
 * finishTask 回滚原因 → 可理解文案。
 * 依据合约 require 分支：Invalid task / Verification failed / Tx already used /
 * Payload match check failed / Leaf node match check failed / SPV verify call failed / Get key failed。
 */
export const mapFinishTaskError = (rawMessage: string): string => {
  const msg = String(rawMessage || '')
  if (/Invalid task/i.test(msg)) return '任务状态不允许提交证明：仅已被你接单的任务可以提交。请确认任务未完成、未超时、且执行者是你'
  if (/Tx already used/i.test(msg)) return '该目标链交易已被用于完成其他任务，不能重复提交'
  if (/Custom verification execution failed/i.test(msg)) return '验证器在链上执行时报错，请确认证明参数与业务类型匹配'
  if (/Verification failed/i.test(msg)) return '证明未通过验证。请核对：目标链交易是否与证明一致、区块高度是否匹配、证明是否由对应工具导出'
  if (/Payload match check failed/i.test(msg)) return '提交的交易内容与任务约定的内容不匹配'
  if (/Leaf node match check failed/i.test(msg)) return 'leafNode 与提交的交易不匹配'
  if (/SPV verify call failed/i.test(msg)) return '轻客户端校验调用失败，可能是影子区块或证明格式不正确'
  if (/Get key failed/i.test(msg)) return '无法从原始交易中提取 key，请检查交易数据'
  return msg
}

export const finishTask = async (
  taskKey: string,
  destTxHash: string,
  destRpcUrl: string
): Promise<string> => {
  await ensureNetwork()
  const signer = await getSigner()
  const contractAddress = await getFinalContractAddress()
  const { rawTx, blockHash } = await getDestChainTxData(destTxHash, destRpcUrl)
  const contract = new ethers.Contract(contractAddress, ABI, signer)

  try {
    // 仅传目标链原始交易：leafNode / proof 传空。
    // 适用于不要求链上证明的验证器（例如事件型）；需要证明的业务请用 finishTaskWithParams。
    const tx = await contract.finishTask(taskKey, rawTx, '0x', '0x', blockHash, {
      gasLimit: 3000000
    })

    const receipt = await tx.wait()
    if (receipt?.status === 1) {
      return tx.hash
    }
    throw new Error('交易执行失败')
  } catch (error: any) {
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      throw new Error('你已取消本次签名')
    }
    cachedSigner = null
    cachedProvider = null
    isNetworkCorrect = false
    throw new Error(mapFinishTaskError(error?.reason || error?.message || '提交证明失败'))
  }
}

/**
 * 按显式参数提交证明（新执行页使用）。
 * 四个参数的含义完全由验证器决定，前端不做业务假设。
 */
export const finishTaskWithParams = async (params: {
  taskKey: string
  rawTx: string
  leafNode?: string
  proof?: string
  keyShadowBlock?: string
}): Promise<string> => {
  const { taskKey, rawTx } = params
  const leafNode = params.leafNode && params.leafNode !== '0x' ? params.leafNode : '0x'
  const proof = params.proof && params.proof !== '0x' ? params.proof : '0x'
  const keyShadowBlock =
    params.keyShadowBlock && /^0x[0-9a-fA-F]{64}$/.test(params.keyShadowBlock)
      ? params.keyShadowBlock
      : ethers.constants.HashZero

  if (!taskKey || !/^0x[0-9a-fA-F]{64}$/.test(taskKey)) throw new Error('任务 Key 格式不正确')
  if (!rawTx || rawTx === '0x') throw new Error('缺少目标链原始交易')

  await ensureNetwork()
  const signer = await getSigner()
  const contractAddress = await getFinalContractAddress()
  const contract = new ethers.Contract(contractAddress, ABI, signer)

  try {
    // 先做静态预检，把链上拒绝原因提前暴露，避免白花 gas
    await contract.callStatic.finishTask(taskKey, rawTx, leafNode, proof, keyShadowBlock)
  } catch (error: any) {
    throw new Error(mapFinishTaskError(error?.reason || error?.message || '静态预检失败'))
  }

  try {
    const tx = await contract.finishTask(taskKey, rawTx, leafNode, proof, keyShadowBlock, {
      gasLimit: 3000000
    })
    const receipt = await tx.wait()
    if (receipt?.status === 1) return tx.hash
    throw new Error('交易执行失败')
  } catch (error: any) {
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      throw new Error('你已取消本次签名')
    }
    cachedSigner = null
    cachedProvider = null
    isNetworkCorrect = false
    throw new Error(mapFinishTaskError(error?.reason || error?.message || '提交证明失败'))
  }
}

export const finishTaskWithData = async (params: FinishTaskParams): Promise<string> => {
  const { taskKey, rawTx, blockHash, leafNode, proof, keyShadowBlock } = params
  return finishTaskWithParams({
    taskKey,
    rawTx,
    leafNode,
    proof,
    keyShadowBlock: keyShadowBlock || blockHash
  })
}

export const registerTaskTypeOnChain = async (
  params: RegisterTaskTypeParams
): Promise<string> => {
  const { typeId, name, isActive, verifier } = params

  if (typeof typeId !== 'number' || Number.isNaN(typeId)) {
    throw new Error('typeId 格式错误')
  }
  if (!name || !name.trim()) {
    throw new Error('名称不能为空')
  }
  if (!ethers.utils.isAddress(verifier)) {
    throw new Error('验证器地址格式错误')
  }

  await ensureNetwork()
  const signer = await getSigner()
  const contractAddress = await getFinalContractAddress()
  const contract = new ethers.Contract(contractAddress, ABI, signer)

  await contract.callStatic.setCrossChainRoute(typeId, name, isActive, verifier)

  try {
    const estimatedGas = await contract.estimateGas.setCrossChainRoute(typeId, name, isActive, verifier)
    await sleep(300)

    const tx = await contract.setCrossChainRoute(typeId, name, isActive, verifier, {
      gasLimit: estimatedGas.mul(120).div(100)
    })

    const receipt = await tx.wait()
    if (receipt?.status === 1) {
      return tx.hash
    }
    throw new Error('交易失败')
  } catch (error: any) {
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      throw new Error('用户取消了交易')
    }

    cachedSigner = null
    cachedProvider = null
    isNetworkCorrect = false

    throw new Error(error?.reason || error?.message || '注册任务类型失败')
  }
}

export async function getTasks(config: LegacyGetTasksConfig) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl)
    const contract = new ethers.Contract(config.contractAddress, config.abi, provider)

    const total = await contract.taskNum()
    const tasks = []
    const limit = Math.min(Number(total), 10)

    for (let i = Number(total) - 1; i >= Number(total) - limit && i >= 0; i--) {
      const key = await contract.taskIndex(i)
      const info = await contract.getTaskInfoByKey(key)

      tasks.push({
        index: i,
        task_key: key,
        user: info.user,
        fee_eth: ethers.utils.formatEther(info.fee),
        payload: info.payload,
        label: Number(info.label)
      })
    }

    return { success: true, data: tasks }
  } catch (error: any) {
    console.error('获取任务列表失败:', error)
    return { success: false, error: error?.message || '获取任务列表失败' }
  }
}

export async function acceptTask(config: LegacyAcceptTaskConfig) {
  try {
    if (!config.privateKey) {
      return { success: false, error: 'Relayer 私钥未配置，无法接单' }
    }

    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl)
    const wallet = new ethers.Wallet(config.privateKey, provider)
    const contract = new ethers.Contract(config.contractAddress, config.abi, wallet)

    const gasEstimate = await contract.estimateGas.acceptTask(config.taskKey)
    const tx = await contract.acceptTask(config.taskKey, {
      gasLimit: gasEstimate.mul(120).div(100)
    })
    const receipt = await tx.wait()

    return {
      success: true,
      tx_hash: receipt.transactionHash,
      block_number: Number(receipt.blockNumber)
    }
  } catch (error: any) {
    console.error('接单失败:', error)
    let msg = error?.message || '接单失败'
    if (msg.includes('revert')) {
      msg = '交易被回滚 (Reverted)。可能原因：任务已被接单、Relayer 未注册或质押金不足。'
    }
    return { success: false, error: msg }
  }
}

export async function registerTaskType(config: LegacyRegisterTaskTypeConfig) {
  try {
    if (!config.privateKey) {
      return { success: false, error: 'Relayer 私钥未配置，无法注册任务类型' }
    }

    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl)
    const wallet = new ethers.Wallet(config.privateKey, provider)
    const contract = new ethers.Contract(config.contractAddress, config.abi, wallet)

    const { typeId, name, isActive, verifier } = config.params
    const gasEstimate = await contract.estimateGas.setCrossChainRoute(typeId, name, isActive, verifier)
    const tx = await contract.setCrossChainRoute(typeId, name, isActive, verifier, {
      gasLimit: gasEstimate.mul(120).div(100)
    })
    const receipt = await tx.wait()

    return {
      success: true,
      tx_hash: receipt.transactionHash,
      block_number: Number(receipt.blockNumber)
    }
  } catch (error: any) {
    console.error('注册任务类型失败:', error)
    return { success: false, error: error?.message || '注册任务类型失败' }
  }
}

export async function acceptTaskWithWallet(
  config: {
    contractAddress: string
    abi: any[]
    taskKey: string
  },
  walletProvider: any
) {
  try {
    if (!walletProvider) {
      return { success: false, error: '钱包未连接' }
    }

    const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
    const signer = ethersProvider.getSigner()
    const contract = new ethers.Contract(config.contractAddress, config.abi, signer)

    const gasEstimate = await contract.estimateGas.acceptTask(config.taskKey)
    const tx = await contract.acceptTask(config.taskKey, {
      gasLimit: gasEstimate.mul(120).div(100)
    })
    const receipt = await tx.wait()

    return {
      success: true,
      tx_hash: receipt.transactionHash,
      block_number: Number(receipt.blockNumber)
    }
  } catch (error: any) {
    console.error('接单失败:', error)
    let msg = error?.message || '接单失败'
    if (msg.includes('revert')) {
      msg = '交易被回滚 (Reverted)。可能原因：任务已被接单、Relayer 未注册或质押金不足。'
    }
    return { success: false, error: msg }
  }
}

export const resetCache = () => {
  cachedSigner = null
  cachedProvider = null
  isNetworkCorrect = false
  contractAddressCache = null
  managerAddressCache = null
  rpcUrlCache = null
}

watch(() => [browserWallet.selected, browserWallet.address, browserWallet.chainId, browserWallet.connected], () => resetCache())

export const useTaskContract = () => {
  const loading = ref(false)
  const submitting = ref(false)
  const registering = ref(false)
  const tasks = ref<TaskTypeInfo[]>([])

  const loadTasks = async () => {
    loading.value = true
    try {
      tasks.value = await getAllTaskTypes()
      ElMessage.success(`成功加载 ${tasks.value.length} 个任务类型`)
    } catch (error: any) {
      console.error('加载任务失败:', error)
      tasks.value = []
      ElMessage.error(error?.message || '加载业务类型失败')
    } finally {
      loading.value = false
    }
  }

  const submitTask = async (params: CreateTaskParams) => {
    submitting.value = true
    try {
      const txHash = await createTask(params)
      if (!txHash) {
        throw new Error('未获取到交易哈希')
      }

      ElMessage.success({
        message: `✅ 任务创建成功！\n交易哈希: ${txHash.slice(0, 18)}...`,
        duration: 8000,
        showClose: true
      })

      return txHash
    } catch (error: any) {
      console.error('提交任务失败:', error)
      ElMessage.error({
        message: error?.message || '任务创建失败',
        duration: 5000,
        showClose: true
      })
      throw error
    } finally {
      submitting.value = false
    }
  }

  const submitRegisterTaskType = async (
    paramsOrTypeId: RegisterTaskTypeParams | number,
    verifier?: string
  ) => {
    registering.value = true
    try {
      const params: RegisterTaskTypeParams =
        typeof paramsOrTypeId === 'number'
          ? {
              typeId: paramsOrTypeId,
              name: `Route-${paramsOrTypeId}`,
              isActive: true,
              verifier: verifier || ethers.constants.AddressZero
            }
          : paramsOrTypeId

      const txHash = await registerTaskTypeOnChain(params)
      if (!txHash) {
        throw new Error('未获取到交易哈希')
      }

      ElMessage.success({
        message: `✅ 任务类型注册成功！\n交易哈希: ${txHash.slice(0, 18)}...`,
        duration: 8000,
        showClose: true
      })

      await loadTasks()
      return txHash
    } catch (error: any) {
      console.error('注册任务类型失败:', error)
      ElMessage.error({
        message: error?.message || '注册任务类型失败',
        duration: 5000,
        showClose: true
      })
      throw error
    } finally {
      registering.value = false
    }
  }

  return {
    loading,
    submitting,
    registering,
    tasks,
    loadTasks,
    submitTask,
    submitRegisterTaskType
  }
}
