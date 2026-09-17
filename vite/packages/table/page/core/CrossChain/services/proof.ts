/**
 * 跨链区 · 证明参数处理（粘贴 + 校验）
 *
 * 依据：
 *   TransportTaskVerifier.verifyTask 的参数要求
 *   TransportTaskVerifier.ProofBundle 结构
 *   SepCross3/punkos_transport/Auction_finish.py 的 PROOF_BUNDLE_TYPE
 *   LCL Helper.getBlockHash / RLPEncode（标准 RLP）
 *
 * 校验分级（重要）：
 *   硬性错误（禁止提交）：proof 无法解码、目标交易哈希不一致、区块高度与区块头不一致、链名与验证器期望链不一致。
 *   警告（可提交，由链上最终裁决）：keyShadowBlock 与本地重算的区块哈希不一致 ——
 *     本地重算依赖 LCL 特定的 RLP 规则，为避免实现差异误伤合法提交，此处只提示不阻断。
 */

import { ethers } from 'ethers'
import { PROOF_BUNDLE_TYPE } from './abi'
import { getRpcClient } from './rpc'

export interface DecodedProofBundle {
  chainName: string
  blockHeight: ethers.BigNumber
  destTxHash: string
  header: any
  txReceipt: any
  keyIndex: string
  receiptProof: string[]
}

export interface ProofIssue {
  level: 'error' | 'warning'
  field: string
  message: string
}

export interface ProofValidationResult {
  ok: boolean
  issues: ProofIssue[]
  bundle: DecodedProofBundle | null
  /** 本地按区块头重算出的区块哈希（LCL Istanbul 规则），无法计算时为 null */
  computedBlockHash: string | null
}

const proofInterface = new ethers.utils.Interface([`function dummy(${PROOF_BUNDLE_TYPE} bundle)`])

/** 解码证明包；失败抛错 */
export function decodeProofBundle(proof: string): DecodedProofBundle {
  if (!proof || proof === '0x') {
    throw new Error('证明数据为空')
  }
  const [decoded] = proofInterface.decodeFunctionData('dummy', proofInterface.encodeFunctionData('dummy', [proof]))
  const bundle: any = decoded
  return {
    chainName: String(bundle[0]),
    blockHeight: ethers.BigNumber.from(bundle[1]),
    destTxHash: String(bundle[2]),
    header: bundle[3],
    txReceipt: bundle[4],
    keyIndex: String(bundle[5]),
    receiptProof: bundle[6].map((item: string) => String(item)),
  }
}

/** uint256 → 最小大端字节（RLP 的整数编码规则，0 编码为空字节串） */
function uintToMinimalBytes(value: ethers.BigNumberish): Uint8Array {
  const bn = ethers.BigNumber.from(value)
  if (bn.isZero()) return new Uint8Array(0)
  let hex = bn.toHexString().slice(2)
  if (hex.length % 2) hex = '0' + hex
  return ethers.utils.arrayify('0x' + hex)
}

function toBytes(value: ethers.BytesLike): Uint8Array {
  return ethers.utils.arrayify(value)
}

/**
 * 按 LCL v2（Istanbul）规则重算区块哈希。
 * 与 Helper.getBlockHash 一致：15 个字段，且要求 baseFeePerGas == 0、withdrawalsRoot == 0。
 */
export function computeHeaderHash(header: any): string {
  const baseFee = ethers.BigNumber.from(header.baseFeePerGas ?? 0)
  const withdrawalsRoot = String(header.withdrawalsRoot ?? ethers.constants.HashZero)
  if (!baseFee.isZero() || withdrawalsRoot !== ethers.constants.HashZero) {
    throw new Error('区块头不是 LCL Istanbul 格式（baseFeePerGas 或 withdrawalsRoot 非零）')
  }

  const list: Uint8Array[] = [
    toBytes(header.parentHash),
    toBytes(header.sha3Uncles),
    toBytes(header.miner),
    toBytes(header.stateRoot),
    toBytes(header.transactionsRoot),
    toBytes(header.receiptsRoot),
    toBytes(header.logsBloom),
    uintToMinimalBytes(header.difficulty),
    uintToMinimalBytes(header.number),
    uintToMinimalBytes(header.gasLimit),
    uintToMinimalBytes(header.gasUsed),
    uintToMinimalBytes(header.timestamp),
    toBytes(header.extraData),
    toBytes(header.mixHash),
    toBytes(header.nonce),
  ]

  return ethers.utils.keccak256(ethers.utils.RLP.encode(list))
}

/**
 * 校验粘贴进来的证明参数。
 * @param params.proof            外部工具产出的证明（hex）
 * @param params.rawTx            目标链原始交易（hex）
 * @param params.keyShadowBlock   影子区块哈希（hex32）
 * @param params.expectedChain    验证器声明的期望源链名（可为空，空则跳过该检查）
 */
export function validateProofInput(params: {
  proof: string
  rawTx: string
  keyShadowBlock: string
  expectedChain?: string | null
}): ProofValidationResult {
  const issues: ProofIssue[] = []
  const { proof, rawTx, keyShadowBlock, expectedChain } = params

  if (!proof || proof === '0x') {
    return {
      ok: false,
      issues: [{ level: 'error', field: 'proof', message: '请粘贴外部工具产出的证明数据' }],
      bundle: null,
      computedBlockHash: null,
    }
  }
  if (!/^0x([0-9a-fA-F]{2})+$/.test(proof)) {
    return {
      ok: false,
      issues: [{ level: 'error', field: 'proof', message: '证明数据不是合法的十六进制（需 0x 开头且长度为偶数）' }],
      bundle: null,
      computedBlockHash: null,
    }
  }

  let bundle: DecodedProofBundle
  try {
    bundle = decodeProofBundle(proof)
  } catch (error: any) {
    return {
      ok: false,
      issues: [{ level: 'error', field: 'proof', message: `证明数据无法解析：${error?.message || '格式不匹配'}` }],
      bundle: null,
      computedBlockHash: null,
    }
  }

  if (!rawTx || rawTx === '0x') {
    issues.push({ level: 'error', field: 'rawTx', message: '请先获取目标链原始交易' })
  } else {
    const rawTxHash = ethers.utils.keccak256(rawTx)
    if (rawTxHash.toLowerCase() !== bundle.destTxHash.toLowerCase()) {
      issues.push({
        level: 'error',
        field: 'destTxHash',
        message: `证明中的目标交易与当前交易不一致（证明：${shorten(bundle.destTxHash)}，当前：${shorten(rawTxHash)}）`,
      })
    }
  }

  const headerNumber = ethers.BigNumber.from(bundle.header?.number ?? 0)
  if (!headerNumber.eq(bundle.blockHeight)) {
    issues.push({
      level: 'error',
      field: 'blockHeight',
      message: `证明中的区块高度（${bundle.blockHeight.toString()}）与区块头高度（${headerNumber.toString()}）不一致`,
    })
  }

  if (expectedChain && bundle.chainName && expectedChain.toLowerCase() !== bundle.chainName.toLowerCase()) {
    issues.push({
      level: 'error',
      field: 'chainName',
      message: `证明来自 ${bundle.chainName} 链，但该业务的验证器只接受 ${expectedChain}`,
    })
  }

  let computedBlockHash: string | null = null
  try {
    computedBlockHash = computeHeaderHash(bundle.header)
    if (keyShadowBlock && keyShadowBlock !== ethers.constants.HashZero) {
      if (computedBlockHash.toLowerCase() !== keyShadowBlock.toLowerCase()) {
        issues.push({
          level: 'warning',
          field: 'keyShadowBlock',
          message: `本地重算的区块哈希（${shorten(computedBlockHash)}）与填写的影子区块（${shorten(keyShadowBlock)}）不一致，请确认两者来自同一次导出；最终由链上验证器裁决`,
        })
      }
    }
  } catch (error: any) {
    issues.push({
      level: 'warning',
      field: 'keyShadowBlock',
      message: `无法本地重算区块哈希：${error?.message || '区块头格式不支持'}`,
    })
  }

  return {
    ok: !issues.some((issue) => issue.level === 'error'),
    issues,
    bundle,
    computedBlockHash,
  }
}

function shorten(value: string): string {
  if (!value) return '—'
  return value.length > 16 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value
}

/** 读取目标链原始交易（提交证明的前置条件） */
export async function fetchTargetChainTx(rpcUrl: string, txHash: string): Promise<{
  rawTx: string
  blockHash: string
  blockNumber: number
  status: number
  from: string
  to: string | null
}> {
  if (!rpcUrl) throw new Error('未配置目标链 RPC')
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) throw new Error('交易哈希格式不正确（需要 0x + 64 位十六进制）')

  const client = getRpcClient(rpcUrl, { timeoutMs: 20000 })
  const rawTx = await client.getRawTransaction(txHash)
  if (!rawTx) throw new Error('无法读取目标链原始交易，请确认交易已上链且该节点支持 eth_getRawTransactionByHash')

  const receipt = await client.getTransactionReceipt(txHash)
  if (!receipt?.blockHash) throw new Error('交易未确认或未找到')

  return {
    rawTx,
    blockHash: receipt.blockHash,
    blockNumber: parseInt(receipt.blockNumber, 16),
    status: Number(receipt.status),
    from: receipt.from,
    to: receipt.to,
  }
}

/** 校验 rawTx / leafNode / proof / keyShadowBlock 的格式，提交前兜底 */
export function validateFinishParams(params: {
  rawTx?: string
  leafNode?: string
  proof?: string
  keyShadowBlock?: string
}): ProofIssue[] {
  const issues: ProofIssue[] = []
  const check = (field: string, value: string | undefined, required: boolean) => {
    if (!value || value === '0x') {
      if (required) issues.push({ level: 'error', field, message: `${field} 不能为空` })
      return
    }
    if (!/^0x([0-9a-fA-F]{2})*$/.test(value)) {
      issues.push({ level: 'error', field, message: `${field} 不是合法的十六进制` })
    }
  }
  check('rawTx', params.rawTx, true)
  check('leafNode', params.leafNode, false)
  check('proof', params.proof, false)
  if (params.keyShadowBlock && params.keyShadowBlock !== ethers.constants.HashZero) {
    if (!/^0x[0-9a-fA-F]{64}$/.test(params.keyShadowBlock)) {
      issues.push({ level: 'error', field: 'keyShadowBlock', message: '影子区块必须是 32 字节哈希' })
    }
  }
  return issues
}
