import { ethers } from 'ethers'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const ENV_RPC_URL = (process.env.RPC_URL || '').trim()
const ENV_CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS || '').trim()
const ENV_MANAGER_CONTRACT_ADDRESS = (process.env.MANAGER_CONTRACT_ADDRESS || '').trim()
const ENV_TRANSPORT_CONTRACT_ADDRESS = (process.env.TRANSPORT_CONTRACT_ADDRESS || '').trim()
const ENV_HUB_CHAIN_ID = process.env.HUB_CHAIN_ID
const ENV_TRANSPORT_LEVEL_ID = process.env.TRANSPORT_LEVEL_ID

const CROSSCHAIN_BACKEND_URL = process.env.CROSSCHAIN_BACKEND_URL || 'http://localhost:3020'
const DEFAULT_RPC_URL = ENV_RPC_URL || 'http://10.135.43.39:30305'
const DEFAULT_CONTRACT_ADDRESS = ENV_TRANSPORT_CONTRACT_ADDRESS || ENV_CONTRACT_ADDRESS || '0xb77e310A43CD9928aDe3c9E5d6254D23fA59eACD'
const PUNKOS_CHAIN_ID_HEX = '0xbd6'
const DEFAULT_HUB_CHAIN_ID = ENV_HUB_CHAIN_ID ? Number(ENV_HUB_CHAIN_ID) : undefined
const DEFAULT_TRANSPORT_LEVEL_ID = ENV_TRANSPORT_LEVEL_ID ? Number(ENV_TRANSPORT_LEVEL_ID) : undefined

const ABI = [
  'function getAllRoutes() external view returns (uint256[] memory typeIds, string[] memory names, bool[] memory isActive, address[] memory validators)',
  'function createTask(uint256 _srcChainId, uint256 _destChainId, bytes _payload, string _routeName, uint256 _taskType) external payable',
  'function finishTask(bytes32 _taskKey, bytes rawTx, bytes leafNode, bytes proof, bytes32 keyShadowBlock) external returns (bool)',
  'function setCrossChainRoute(uint256 _routeId, string _name, bool _isActive, address _verifier) external',
  'function taskNum() external view returns (uint256)',
  'function taskIndex(uint256) external view returns (bytes32)',
  'function getTaskInfoByKey(bytes32) external view returns (tuple(address user, uint256 fee, bytes payload, uint8 label))',
  'function acceptTask(bytes32 _taskKey) external'
]

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
  srcChainId: number
  destChainId: number
  payload: string
  taskType: number
  routeName: string
  fee: string
}

export interface FinishTaskParams {
  taskKey: string
  rawTx: string
  blockHash: string
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
let rpcUrlCache: string | null = null

const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address)



const normalizeNonNegativeInteger = (value: unknown): number | undefined => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return undefined
  }
  return Math.trunc(numeric)
}

const getEthereum = () => {
  const ethereum = (window as any)?.ethereum
  if (!ethereum?.request) {
    throw new Error('未检测到钱包')
  }
  return ethereum
}

const tryGetApiContractConfig = async () => {
  try {
    const response = await fetch(`${CROSSCHAIN_BACKEND_URL}/api/crosschainzone`)
    if (!response.ok) return null
    const data = await response.json()
    const first = Array.isArray(data) ? data[0] : null
    if (!first) return null
    const rpcUrl = first.rpc || DEFAULT_RPC_URL
    const transportAddress = [first.transport_addr, first.multi_addr]
      .find((address: string) => isValidAddress(address)) || null
    const managerAddress = [first.manager_addr, first.multi_addr]
      .find((address: string) => isValidAddress(address)) || null

    if (!transportAddress && !managerAddress) return null
    return {
      rpcUrl,
      transportAddress,
      managerAddress
    }
  } catch {
    return null
  }
}

export const getContractConfig = async () => {
  if (rpcUrlCache && contractAddressCache) {
    return {
      rpcUrl: rpcUrlCache,
      contractAddress: contractAddressCache,
      abi: ABI
    }
  }

  try {
    // 先从后端接口获取配置
    const apiConfig = await tryGetApiContractConfig()
    const rpcUrl = apiConfig?.rpcUrl || DEFAULT_RPC_URL

    // 后端已解析并返回 Transport 地址，优先直接使用
    if (apiConfig?.transportAddress) {
      rpcUrlCache = rpcUrl
      contractAddressCache = apiConfig.transportAddress
      return {
        rpcUrl: rpcUrlCache,
        contractAddress: contractAddressCache,
        abi: ABI
      }
    }

    // 后端未返回 Transport 地址时，再用 Manager 地址本地解析
    if (apiConfig?.managerAddress) {
      try {
        const transportAddress = await resolveTransportAddressByManager({
          managerAddress: apiConfig.managerAddress,
          rpcUrl: rpcUrl
        })
        rpcUrlCache = rpcUrl
        contractAddressCache = transportAddress
        console.log('✅ 后端未返回 Transport，前端通过 Manager 解析:', transportAddress)
        return {
          rpcUrl: rpcUrlCache,
          contractAddress: contractAddressCache,
          abi: ABI
        }
      } catch (error) {
        console.warn('通过 Manager 解析失败，使用降级地址:', error)
      }
    }
  } catch (error) {
    console.warn('从后端接口获取配置失败:', error)
  }

  // 降级方案：使用默认地址
  const fallbackRpcUrl = DEFAULT_RPC_URL
  const fallbackManagerAddress = ENV_MANAGER_CONTRACT_ADDRESS || ENV_CONTRACT_ADDRESS

  if (fallbackManagerAddress && isValidAddress(fallbackManagerAddress)) {
    try {
      const transportAddress = await resolveTransportAddressByManager({
        managerAddress: fallbackManagerAddress,
        rpcUrl: fallbackRpcUrl
      })
      rpcUrlCache = fallbackRpcUrl
      contractAddressCache = transportAddress
      return {
        rpcUrl: rpcUrlCache,
        contractAddress: contractAddressCache,
        abi: ABI
      }
    } catch {
    }
  }

  rpcUrlCache = fallbackRpcUrl
  contractAddressCache = DEFAULT_CONTRACT_ADDRESS

  return {
    rpcUrl: rpcUrlCache,
    contractAddress: contractAddressCache,
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

  const rpcUrl = params?.rpcUrl || DEFAULT_RPC_URL
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
  
  const config = await tryGetApiContractConfig()
  if (config?.managerAddress) {
    managerAddressCache = config.managerAddress
    return managerAddressCache
  }
  
  managerAddressCache = ENV_MANAGER_CONTRACT_ADDRESS || ENV_CONTRACT_ADDRESS || ethers.constants.AddressZero
  return managerAddressCache
}

export const getFinalContractAddress = async (): Promise<string> => {
  const config = await getContractConfig()
  return config.contractAddress
}

export const getFinalRpcUrl = async (): Promise<string> => {
  const config = await getContractConfig()
  return config.rpcUrl
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
  if (isNetworkCorrect) return

  const ethereum = getEthereum()
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
    isNetworkCorrect = true
    return
  } catch (error: any) {
    if (error?.code !== 4902 && error?.code !== 4901) {
      throw new Error('切换网络失败')
    }
  }

  const rpcUrl = await getFinalRpcUrl()
  await ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: PUNKOS_CHAIN_ID_HEX,
      chainName: 'PunkOS',
      rpcUrls: [rpcUrl],
      nativeCurrency: {
        name: 'PUNK',
        symbol: 'PUNK',
        decimals: 18
      }
    }]
  })
  isNetworkCorrect = true
}

export const getSigner = async (): Promise<ethers.Signer> => {
  if (cachedSigner) return cachedSigner

  const ethereum = getEthereum()
  await ethereum.request({ method: 'eth_requestAccounts' })

  cachedProvider = new ethers.providers.Web3Provider(ethereum)
  cachedSigner = cachedProvider.getSigner()

  return cachedSigner
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
  const { srcChainId, destChainId, payload, taskType, routeName, fee } = params

  await ensureNetwork()
  const signer = await getSigner()
  const contractAddress = await getFinalContractAddress()
  const payloadHex = toHexPayload(payload)
  const valueInWei = ethers.utils.parseEther(fee)
  const contract = new ethers.Contract(contractAddress, ABI, signer)

  try {
    const tx = await contract.createTask(
      srcChainId || 0,
      destChainId || 0,
      payloadHex,
      routeName,
      taskType,
      {
        value: valueInWei,
        gasLimit: 600000
      }
    )

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
    throw new Error(error?.reason || error?.message || '交易失败')
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
    const tx = await contract.finishTask(
      taskKey,
      rawTx,
      rawTx,
      '0x',
      blockHash,
      {
        gasLimit: 3000000
      }
    )

    const receipt = await tx.wait()
    if (receipt?.status === 1) {
      return tx.hash
    }
    throw new Error('交易执行失败')
  } catch (error: any) {
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      throw new Error('用户取消了交易')
    }
    cachedSigner = null
    cachedProvider = null
    isNetworkCorrect = false
    throw new Error(error?.reason || error?.message || '完成任务失败')
  }
}

export const finishTaskWithData = async (params: FinishTaskParams): Promise<string> => {
  const { taskKey, rawTx, blockHash } = params

  await ensureNetwork()
  const signer = await getSigner()
  const contractAddress = await getFinalContractAddress()
  const contract = new ethers.Contract(contractAddress, ABI, signer)

  try {
    const tx = await contract.finishTask(
      taskKey,
      rawTx,
      rawTx,
      '0x',
      blockHash,
      { gasLimit: 3000000 }
    )

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
    throw new Error(error?.reason || error?.message || '完成任务失败')
  }
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
  rpcUrlCache = null
}

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
      ElMessage.error(error?.message || '加载失败')
      tasks.value = [
        {
          typeId: 1,
          name: 'Auction',
          isActive: false,
          validator: ethers.constants.AddressZero
        }
      ]
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
