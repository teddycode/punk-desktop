import { ethers } from 'ethers';
import { punkos } from '../../store/chains';
import { DEFAULT_STAKE_HUB_CONTRACT, formatPledgeRpcError } from './pledgeRpc';

export interface StakeDepositParams {
  /** 质押数量（wei），与 docs/stake-deposit-test.js 中 stakedAmount 一致 */
  stakedAmountWei: ethers.BigNumber;
  /** 质押年限等链上语义，与 docs/stake-deposit-test.js 中 stakedTime 一致 */
  stakedTime: number;
  deployerAddress: string;
  investorAddress: string;
  beneficiaryAddress: string;
  rpcUrl?: string;
  chainId?: number;
  gasLimitHex?: string;
  valueHex?: string;
  /** 覆盖默认质押入口合约地址（默认见 pledgeRpc.DEFAULT_STAKE_HUB_CONTRACT） */
  stakeHubOverride?: string;
}

async function resolveFeeData(provider: ethers.providers.JsonRpcProvider) {
  try {
    const feeData = await provider.getFeeData();
    if (feeData.maxPriorityFeePerGas && feeData.maxFeePerGas) {
      return {
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas
      };
    }
  } catch {
    /* fall through */
  }
  try {
    const gasPrice = await provider.getGasPrice();
    return { maxPriorityFeePerGas: gasPrice, maxFeePerGas: gasPrice };
  } catch {
    /* fall through */
  }
  const fallback = ethers.utils.parseUnits('1', 'gwei');
  return { maxPriorityFeePerGas: fallback, maxFeePerGas: fallback };
}

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function parseSendRawTxHash(result: unknown): string {
  if (typeof result === 'string' && result.startsWith('0x')) return result;
  if (result && typeof result === 'object' && 'hash' in result && typeof (result as { hash: string }).hash === 'string') {
    return (result as { hash: string }).hash;
  }
  throw new Error('eth_sendRawTransaction 返回格式异常');
}

/**
 * 构造 type=6 质押交易（与 docs/stake-deposit-test.js 字段一致）。
 * 签名与广播均通过 Web3Modal 注入的 EIP-1193 provider（eth_signTransaction + eth_sendRawTransaction）。
 */
export async function buildType6StakeDepositTx(
  walletProvider: Eip1193Provider,
  params: StakeDepositParams
): Promise<{ signedTx: string; txHash: string }> {
  const rpcUrl = params.rpcUrl || punkos.rpcUrl;
  const chainId = params.chainId ?? punkos.chainId;
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const feeData = await resolveFeeData(provider);

  const from = ethers.utils.getAddress(params.investorAddress);
  const nonce = await provider.getTransactionCount(from, 'pending');
  const to = ethers.utils.getAddress(params.stakeHubOverride || DEFAULT_STAKE_HUB_CONTRACT);

  const tx6: Record<string, unknown> = {
    type: 6,
    chainId,
    nonce,
    to,
    value: params.valueHex ?? '0x0',
    gasLimit: params.gasLimitHex ?? '0x100000',
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toHexString(),
    maxFeePerGas: feeData.maxFeePerGas.toHexString(),
    data: '0x',
    deployerAddress: ethers.utils.getAddress(params.deployerAddress),
    investorAddress: ethers.utils.getAddress(params.investorAddress),
    beneficiaryAddress: ethers.utils.getAddress(params.beneficiaryAddress),
    stakedAmount: params.stakedAmountWei.toHexString(),
    stakedTime: params.stakedTime
  };

  let signedTx: string;
  try {
    const raw = await walletProvider.request({
      method: 'eth_signTransaction',
      params: [tx6]
    });
    if (typeof raw !== 'string') throw new Error('eth_signTransaction 应返回已签名十六进制串');
    signedTx = raw;
  } catch (e) {
    throw new Error(`签名失败: ${formatPledgeRpcError(e)}`);
  }

  let txHash: string;
  try {
    const sent = await walletProvider.request({
      method: 'eth_sendRawTransaction',
      params: [signedTx]
    });
    txHash = parseSendRawTxHash(sent);
  } catch (e) {
    throw new Error(`发送交易失败: ${formatPledgeRpcError(e)}`);
  }

  return { signedTx, txHash };
}

export async function waitStakeTxMined(
  txHash: string,
  rpcUrl?: string,
  confirmations = 1
): Promise<ethers.providers.TransactionReceipt> {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl || punkos.rpcUrl);
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    if (!receipt) throw new Error('未收到交易回执');
    if (receipt.status === 0) throw new Error('交易执行失败（status=0）');
    return receipt;
  } catch (e) {
    throw new Error(`等待确认失败: ${formatPledgeRpcError(e)}`);
  }
}
