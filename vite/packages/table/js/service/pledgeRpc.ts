import { ethers } from 'ethers';
import { punkos } from '../../store/chains';

/** 与 docs/stake-deposit-test.js 默认质押入口合约一致；调用方可传 stakeHubOverride */
export const DEFAULT_STAKE_HUB_CONTRACT = '0x5FcfE7D2aA7fd0f66Fbfe8bD50aDfa30E7D8f995';

const BLOCK = 'latest' as const;

export function createPledgeReadProvider(rpcUrl?: string) {
  const url = rpcUrl || punkos.rpcUrl;
  return new ethers.providers.JsonRpcProvider(url);
}

export function formatPledgeRpcError(err: unknown): string {
  if (err == null) return '未知错误';
  if (typeof err === 'string') return err;
  const e = err as { message?: string; error?: { message?: string; code?: number }; body?: string };
  if (e.body) {
    try {
      const j = JSON.parse(e.body);
      if (j?.error?.message) return String(j.error.message);
    } catch {
      /* ignore */
    }
  }
  if (e.error?.message) return String(e.error.message);
  if (e.message) return String(e.message);
  return String(err);
}

async function rpcSend<T>(provider: ethers.providers.JsonRpcProvider, method: string, params: unknown[]): Promise<T> {
  try {
    return (await provider.send(method, params)) as T;
  } catch (err) {
    const msg = formatPledgeRpcError(err);
    throw new Error(msg);
  }
}

/** 文档返回可能是 number 或 hex 字符串 */
export function normalizeToBigNumber(val: string | number | bigint | undefined | null): ethers.BigNumber {
  if (val == null || val === '') return ethers.BigNumber.from(0);
  if (typeof val === 'bigint') return ethers.BigNumber.from(val.toString());
  if (typeof val === 'number') return ethers.BigNumber.from(Math.floor(val));
  const s = String(val).trim();
  if (s.startsWith('0x') || s.startsWith('0X')) return ethers.BigNumber.from(s);
  return ethers.BigNumber.from(s);
}

export function formatPunkAmount(weiBn: ethers.BigNumber): string {
  try {
    return ethers.utils.formatEther(weiBn);
  } catch {
    return weiBn.toString();
  }
}

export interface PledgeInfoResult {
  pledgeAmount?: string | number;
  pledgeYear?: string | number;
  startTime?: string | number;
  interestRate?: string | number;
  earnInterest?: string | number;
  annualFee?: string | number;
  lastAnnualFeeTime?: string | number;
  contractAddress?: string;
  deployedAddress?: string;
  investorAddress?: string;
  beneficiaryAddress?: string;
  isStaked?: boolean;
}

export async function getPledgeInfo(
  contractAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<PledgeInfoResult> {
  const p = provider || createPledgeReadProvider();
  return rpcSend<PledgeInfoResult>(p, 'eth_getPledgeInfo', [ethers.utils.getAddress(contractAddress), BLOCK]);
}

export interface InvestorInterestResult {
  investorAddress?: string;
  pledgeAmount?: string;
  pledgeYear?: string;
  interestRate?: string;
  startTime?: string;
  accruedInterest?: string;
  totalInterest?: string;
  elapsedRatio?: string;
  isMatured?: boolean;
  currentBlock?: string;
}

export async function getInvestorInterest(
  contractAddress: string,
  investorAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<InvestorInterestResult> {
  const p = provider || createPledgeReadProvider();
  return rpcSend<InvestorInterestResult>(p, 'eth_getInvestorInterest', [
    ethers.utils.getAddress(contractAddress),
    ethers.utils.getAddress(investorAddress),
    BLOCK
  ]);
}

export type InvestorInterestRow = InvestorInterestResult;

export async function getAllInvestorsInterest(
  contractAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<InvestorInterestRow[]> {
  const p = provider || createPledgeReadProvider();
  const raw = await rpcSend<InvestorInterestRow[]>(p, 'eth_getAllInvestorsInterest', [
    ethers.utils.getAddress(contractAddress),
    BLOCK
  ]);
  return Array.isArray(raw) ? raw : [];
}

export interface BeneficiaryInfoRow {
  beneficiaryAddress: string;
  alphaIndex: string;
}

export async function getBeneficiariesInfo(
  contractAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<BeneficiaryInfoRow[]> {
  const p = provider || createPledgeReadProvider();
  const raw = await rpcSend<BeneficiaryInfoRow[]>(p, 'eth_getBeneficiariesInfo', [
    ethers.utils.getAddress(contractAddress),
    BLOCK
  ]);
  return Array.isArray(raw) ? raw : [];
}

export async function getStakeFlag(
  contractAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<boolean> {
  const p = provider || createPledgeReadProvider();
  return rpcSend<boolean>(p, 'eth_getStakeFlag', [ethers.utils.getAddress(contractAddress), BLOCK]);
}

function addr(contractOrInvestor: string) {
  return ethers.utils.getAddress(contractOrInvestor);
}

/** 三参：合约 + 投资人 + 区块 */
async function rpcHexScalar(
  method: string,
  contractAddress: string,
  investorAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<ethers.BigNumber> {
  const p = provider || createPledgeReadProvider();
  const raw = await rpcSend<string | number>(p, method, [addr(contractAddress), addr(investorAddress), BLOCK]);
  return normalizeToBigNumber(raw);
}

export function getPledgeAmountWei(
  contractAddress: string,
  investorAddress: string,
  provider?: ethers.providers.JsonRpcProvider
) {
  return rpcHexScalar('eth_getPledgeAmount', contractAddress, investorAddress, provider);
}

export function getPledgeYearWei(
  contractAddress: string,
  investorAddress: string,
  provider?: ethers.providers.JsonRpcProvider
) {
  return rpcHexScalar('eth_getPledgeYear', contractAddress, investorAddress, provider);
}

export function getStartTimeWei(
  contractAddress: string,
  investorAddress: string,
  provider?: ethers.providers.JsonRpcProvider
) {
  return rpcHexScalar('eth_getStartTime', contractAddress, investorAddress, provider);
}

export function getInterestRateWei(
  contractAddress: string,
  investorAddress: string,
  provider?: ethers.providers.JsonRpcProvider
) {
  return rpcHexScalar('eth_getInterestRate', contractAddress, investorAddress, provider);
}

export function getEarnInterestWei(
  contractAddress: string,
  investorAddress: string,
  provider?: ethers.providers.JsonRpcProvider
) {
  return rpcHexScalar('eth_getEarnInterest', contractAddress, investorAddress, provider);
}

export function getCurrentInterestWei(
  contractAddress: string,
  investorAddress: string,
  provider?: ethers.providers.JsonRpcProvider
) {
  return rpcHexScalar('eth_getCurrentInterest', contractAddress, investorAddress, provider);
}

/** 单受益人（旧版字段） */
export async function getBeneficiaryAddress(
  contractAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<string> {
  const p = provider || createPledgeReadProvider();
  return rpcSend<string>(p, 'eth_getBeneficiaryAddress', [addr(contractAddress), BLOCK]);
}

export interface BeneficiarySingleRpc {
  beneficiaryAddress?: string;
  alphaIndex?: string;
}

export async function getBeneficiaryInfo(
  contractAddress: string,
  beneficiaryAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<BeneficiarySingleRpc> {
  const p = provider || createPledgeReadProvider();
  return rpcSend<BeneficiarySingleRpc>(p, 'eth_getBeneficiaryInfo', [
    addr(contractAddress),
    addr(beneficiaryAddress),
    BLOCK
  ]);
}

async function rpcHexScalar2(method: string, contractAddress: string, provider?: ethers.providers.JsonRpcProvider) {
  const p = provider || createPledgeReadProvider();
  const raw = await rpcSend<string | number>(p, method, [addr(contractAddress), BLOCK]);
  return normalizeToBigNumber(raw);
}

export function getAnnualFeeWei(contractAddress: string, provider?: ethers.providers.JsonRpcProvider) {
  return rpcHexScalar2('eth_getAnnualFee', contractAddress, provider);
}

export function getLastAnnualFeeTimeWei(contractAddress: string, provider?: ethers.providers.JsonRpcProvider) {
  return rpcHexScalar2('eth_getLastAnnualFeeTime', contractAddress, provider);
}

export async function getDeployedAddress(
  contractAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<string> {
  const p = provider || createPledgeReadProvider();
  return rpcSend<string>(p, 'eth_getDeployedAddress', [addr(contractAddress), BLOCK]);
}

export async function getInvestorAddressLegacy(
  contractAddress: string,
  provider?: ethers.providers.JsonRpcProvider
): Promise<string> {
  const p = provider || createPledgeReadProvider();
  return rpcSend<string>(p, 'eth_getInvestorAddress', [addr(contractAddress), BLOCK]);
}

export function getTotalNumberOfGasWei(contractAddress: string, provider?: ethers.providers.JsonRpcProvider) {
  return rpcHexScalar2('eth_getTotalNumberOfGas', contractAddress, provider);
}

export function getContractCallCountWei(contractAddress: string, provider?: ethers.providers.JsonRpcProvider) {
  return rpcHexScalar2('eth_getContractCallCount', contractAddress, provider);
}

export function getTotalValueTxWei(contractAddress: string, provider?: ethers.providers.JsonRpcProvider) {
  return rpcHexScalar2('eth_getTotalValueTx', contractAddress, provider);
}

/** 文档：账户地址 + 区块 */
export function getSecurityLevelWei(accountAddress: string, provider?: ethers.providers.JsonRpcProvider) {
  return rpcHexScalar2('eth_getSecurityLevel', accountAddress, provider);
}
