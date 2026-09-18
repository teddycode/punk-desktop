/**
 * 跨链区 · 合约 ABI 与事件定义（单一来源）
 *
 * 依据：D:\punkos2\sepCross3\src\HUB\abstracts\AbstractTransportContract.sol
 *      D:\punkos2\sepCross3\src\HUB\abstracts\AbstractSystemContract.sol
 *      D:\punkos2\sepCross3\src\clean\TransportTaskVerifier.sol / TransportTaskEventOnlyVerifier.sol
 *      D:\punkos2\sepCross3\src\LCL\lib\Types.sol
 *
 * 重要（每个字段都与已部署合约核对过）：
 *   1. createTask 是 3 参：createTask(bytes _payload, string _routeName, uint256 _taskType)
 *      旧代码里的 5 参声明与合约不符，调用必然失败。
 *   2. getTaskInfoByKey / getTaskInfoByIndex 返回 8 个字段（含 relayer/stake/label/time）。
 *   3. 任务完结（finishTask / withdrawTask）会 delete taskList[_taskKey]，
 *      读取已完结任务会得到全零，因此终结状态必须从 UpdateTaskState 事件推导。
 *   4. TransportTask.time 存的是 block.number，不是时间戳。
 *   5. 具体验证器的校验语义（计数器、拍卖等）不属于本文件，本文件只描述合约接口。
 */

/** 任务状态枚举，与合约 TransportTaskLabel 完全一致 */
export enum TaskLabel {
  Default = 0,
  Created = 1,
  Accepted = 2,
  Rejected = 3,
  Successed = 4,
  Failed = 5,
}

/** 界面文案。注意 2 = Accepted（已接单），不等于“执行中”。 */
export const TASK_LABEL_TEXT: Record<number, string> = {
  [TaskLabel.Default]: '未知',
  [TaskLabel.Created]: '待接单',
  [TaskLabel.Accepted]: '已接单',
  [TaskLabel.Rejected]: '已撤回',
  [TaskLabel.Successed]: '已成功',
  [TaskLabel.Failed]: '已失败',
};

/** 语义色 key，供界面映射到 token */
export const TASK_LABEL_COLOR: Record<number, string> = {
  [TaskLabel.Default]: 'default',
  [TaskLabel.Created]: 'waiting',
  [TaskLabel.Accepted]: 'processing',
  [TaskLabel.Rejected]: 'failed',
  [TaskLabel.Successed]: 'success',
  [TaskLabel.Failed]: 'failed',
};

/** 系统合约状态，与 AbstractSystemContract 一致 */
export enum SystemState {
  Default = 0,
  Init = 1,
  Work = 2,
  Pause = 3,
  Stop = 4,
}

export const SYSTEM_STATE_TEXT: Record<number, string> = {
  [SystemState.Default]: '未初始化',
  [SystemState.Init]: '初始化中',
  [SystemState.Work]: '运行中',
  [SystemState.Pause]: '已暂停',
  [SystemState.Stop]: '已停止',
};

/** 任务已接单后允许被重接/取回的区块数（合约常量 Max_Task_Time，非 public，无法从链上读取） */
export const MAX_TASK_TIME_BLOCKS = 144;

/**
 * Transport 合约 ABI。
 * 与 AbstractTransportContract.sol 逐条对应，请勿按旧代码“补参数”。
 */
export const TRANSPORT_ABI = [
  // —— 读取 ——
  'function taskNum() view returns (uint256)',
  'function taskIndex(uint256) view returns (bytes32)',
  'function getTaskKeyByIndex(uint256 _index) view returns (bytes32)',
  'function getTaskInfoByKey(bytes32 _taskKey) view returns (address user, uint256 fee, uint256 taskType, address relayer, uint256 stake, bytes payload, uint8 label, uint256 time)',
  'function getTaskInfoByIndex(uint256 _index) view returns (address user, uint256 fee, uint256 taskType, address relayer, uint256 stake, bytes payload, uint8 label, uint256 time)',
  'function getAllRoutes() view returns (uint256[] ids, string[] names, bool[] status, address[] verifiers)',
  'function routes(uint256) view returns (string name, bool isActive, bool isExist, address verifier)',
  'function getCrossFee(bytes rawTx) view returns (uint256)',
  'function getContractState() view returns (uint256)',
  'function getContractManager() view returns (address)',
  'function getSourceInfo() view returns (address relayContract, address txRuleContract)',
  'function delay() view returns (uint256)',
  'function txIfCheck(bytes32) view returns (bool)',

  // —— 质押（继承自 AbstractStakeManagement）——
  'function getRequireStake() view returns (uint256)',
  'function getMyStake() view returns (uint256)',

  // —— 写入（全部由钱包签名）——
  'function createTask(bytes _payload, string _routeName, uint256 _taskType) payable',
  'function acceptTask(bytes32 _taskKey)',
  'function finishTask(bytes32 _taskKey, bytes rawTx, bytes leafNode, bytes proof, bytes32 keyShadowBlock) returns (bool)',
  'function reAcceptTask(bytes32 _taskKey)',
  'function withdrawTask(bytes32 _taskKey)',
  'function setCrossChainRoute(uint256 _routeId, string _name, bool _isActive, address _verifier)',
  'function becomeRelayer() payable',
  'function withdrawStake(uint256 _amount)',
]

/**
 * Manager 合约 ABI。
 * 注意：注册源链 / 业务类型需经委员会，通过 operateSystemContract 代理调用。
 */
export const MANAGER_ABI = [
  'function contract_chain_index(uint256 _chainId, uint256 _levelId) view returns (address)',
  'function getSourceChainNum() view returns (uint256)',
  'function getSourceChainInfo(uint256 sourceID) view returns (string symbol, string name, uint256 state, uint256 contractNum, address[] contractAddressList)',
  'function addNewSourceChain(string _symbol, string _name)',
  'function operateSystemContract(address _address, bytes payload)',
  'function committeeMembers(address) view returns (bool)',
]

/**
 * Source Chain Relay 合约 ABI（LCL v2）。
 * 来源：vite/packages/table/page/core/CrossChain/relay-bundles/lcl_relay_bundle/out/RelayContract.sol/LCL_Relay.json
 * 其他链的 relay ABI 尚未确认，相关读取需先做能力探测（见 chain.getRelayCapability）。
 */
export const RELAY_ABI = [
  'function getMyStake() view returns (uint256)',
  'function getRequireStake() view returns (uint256)',
  'function getContractState() view returns (uint256)',
  'function getTopKeyFromShadowLedger() view returns (bytes32)',
  'function getTopKeyFromShadowLedger_slot() view returns (uint256)',
  'function getKeyFromShadowBlock(bytes rawShadowBlock) view returns (bytes32)',
  'function keyGenesisShadowBlock() view returns (bytes32)',
  'function getGenesisKey() view returns (bytes32)',
  'function getMaxOpenCommitDelay() view returns (uint256)',
  'function acceptedHeaders(bytes32) view returns (bytes32)',
  'function getCommitState(bytes32, bytes32) view returns (uint256)',
  'function becomeRelayer() payable',
  'function withdrawStake(uint256 _amount)',
]

/** 事件签名（human-readable），用于构造 topic 与解码 */
export const TRANSPORT_EVENTS = [
  'event NewTransportTask(uint256 indexed _index, bytes32 indexed _key, bytes _payload, uint256 _type, address user, uint fee)',
  'event UpdateTaskState(bytes32 indexed _key, uint8 oldState, uint8 indexed newState, address indexed operator)',
  'event ConfirmSourceTx(bytes32 indexed keyTx, bytes32 indexed keyShadowBlock, uint confirmParam, bool _type)',
  'event RouteUpdated(uint256 indexed routeId, string name, bool isActive, address verifier)',
]

export const RELAY_EVENTS = [
  'event UpdateShadowLedger(bytes32 indexed keyShadowBlock, bytes32 keyParentShadowBlock, bytes rawShadowBlock)',
  'event RecordRelayerContribution(bytes32 indexed keyShadowBlock, address indexed relayer, uint8 indexed label, uint256 value)',
  'event UpdateStake(address indexed relayer, uint8 indexed label, uint256 value)',
]

/** 未来事件型验证器上报事件（TransportTaskEventOnlyVerifier） */
export const TASK_REPORTED_EVENT =
  'event TaskReported(uint256 indexed txHeight, uint256 indexed confirmHeight, bytes32 indexed txHash, string taskTypeName)'

/**
 * 证明包（proof）的 ABI 类型。
 * 与 sepCross3/punkos_transport/Auction_finish.py 的 PROOF_BUNDLE_TYPE、
 * 以及 TransportTaskVerifier.ProofBundle 结构一致。
 */
export const PROOF_BUNDLE_TYPE =
  '(string,uint256,bytes32,' +
  '(bytes32,bytes32,address,bytes32,bytes32,bytes32,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes32,bytes,uint256,bytes32),' +
  '(uint256,bytes,uint256,bytes,(address,bytes[],bytes)[]),' +
  'bytes,bytes[])'

/** 完整型验证器用于声明其期望源链的方法；事件型/免证明型没有该方法 */
export const VERIFIER_EXPECTED_CHAIN_ABI = ['function EXPECTED_CHAIN() view returns (string)']

/** 已解码的事件结构 */
export interface NewTransportTaskEvent {
  index: number
  key: string
  payload: string
  taskType: number
  user: string
  fee: string // wei 字符串
  blockNumber: number
  txHash: string
  logIndex: number
}

export interface UpdateTaskStateEvent {
  key: string
  oldState: number
  newState: number
  operator: string
  blockNumber: number
  txHash: string
  logIndex: number
}

export interface ConfirmSourceTxEvent {
  keyTx: string
  keyShadowBlock: string
  confirmParam: number
  flag: boolean
  blockNumber: number
  txHash: string
  logIndex: number
}

export interface RouteUpdatedEvent {
  routeId: number
  name: string
  isActive: boolean
  verifier: string
  blockNumber: number
  txHash: string
  logIndex: number
}

export interface TaskReportedEvent {
  txHeight: string
  confirmHeight: string
  txHash: string
  taskTypeName: string
  blockNumber: number
  txHashLog: string
  logIndex: number
}

/** 任务完整字段（活跃任务可从合约读到） */
export interface TaskInfo {
  key: string
  index: number | null
  user: string
  fee: string // wei
  taskType: number
  relayer: string
  stake: string // wei
  payload: string
  label: number
  time: number // block.number（非时间戳）
}

/** 业务类型（链上路由） */
export interface RouteInfo {
  id: number
  name: string
  isActive: boolean
  isExist: boolean
  verifier: string
}
