const STORAGE_KEY = 'punkos.dappMarket.stakePositions.v1';

export interface StoredStakePosition {
  contractAddress: string;
  investorAddress: string;
  /** 用户在 UI 上分配到该合约的 PUNK 数额（质押入口为单合约时与链上一致；hub 汇总模式时作展示用） */
  principalPunk?: number;
  dappId?: number;
  dappName?: string;
  logo?: string;
  category?: string;
  lastTxHash?: string;
  updatedAt: number;
}

function readAll(): StoredStakePosition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as StoredStakePosition[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(list: StoredStakePosition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function keyOf(c: string, inv: string) {
  return `${c.toLowerCase()}|${inv.toLowerCase()}`;
}

export function upsertStakePosition(entry: Omit<StoredStakePosition, 'updatedAt'> & { updatedAt?: number }) {
  const list = readAll();
  const k = keyOf(entry.contractAddress, entry.investorAddress);
  const idx = list.findIndex(
    (x) => keyOf(x.contractAddress, x.investorAddress) === k
  );
  const row: StoredStakePosition = {
    ...entry,
    updatedAt: entry.updatedAt ?? Date.now()
  };
  if (idx >= 0) list[idx] = { ...list[idx], ...row };
  else list.push(row);
  writeAll(list);
}

export function listStakePositionsForInvestor(investorAddress: string): StoredStakePosition[] {
  const inv = investorAddress.toLowerCase();
  return readAll().filter((x) => x.investorAddress.toLowerCase() === inv);
}

export function removeStakePosition(contractAddress: string, investorAddress: string) {
  const k = keyOf(contractAddress, investorAddress);
  writeAll(
    readAll().filter((x) => keyOf(x.contractAddress, x.investorAddress) !== k)
  );
}
