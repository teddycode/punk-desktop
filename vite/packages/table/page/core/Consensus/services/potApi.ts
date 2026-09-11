import dayjs from 'dayjs';

const FALLBACK_API_BASE = 'http://127.0.0.1:10000/api';

let apiBasePromise: Promise<string> | null = null;

function trimSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function shortHash(value?: string) {
  if (!value) return '-';
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

function formatTime(value?: string | number) {
  if (!value && value !== 0) return '-';
  const time = typeof value === 'number' ? dayjs.unix(value) : dayjs(value);
  return time.isValid() ? time.format('YYYY-MM-DD HH:mm:ss') : String(value);
}

function normalizeTxCount(block: any) {
  return Number(block?.transactionCount ?? block?.txCount ?? block?.transactionNum ?? 0);
}

function normalizeMicroBlockCount(block: any) {
  return Number(block?.microBlockCount ?? block?.microBlockNum ?? block?.uncleCount ?? 0);
}

async function resolvePotApiBase() {
  const ipc = (window as any).ipc || (window as any).ipcRenderer;
  if (ipc && typeof ipc.invoke === 'function') {
    const service = await ipc.invoke('services.resolvePage', 'pot-mock');
    if (service?.pageUrl) {
      return `${trimSlash(service.pageUrl)}/api`;
    }
  }

  return FALLBACK_API_BASE;
}

export async function getPotApiBase() {
  if (!apiBasePromise) {
    apiBasePromise = resolvePotApiBase().catch(() => FALLBACK_API_BASE);
  }

  return apiBasePromise;
}

export async function requestPotApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiBase = await getPotApiBase();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${apiBase}${normalizedPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POT API ${response.status}: ${text || response.statusText}`);
  }

  return response.json();
}

export function normalizePotBlock(block: any) {
  return {
    ...block,
    height: Number(block?.height ?? 0),
    hash: block?.hash || '-',
    hashShort: shortHash(block?.hash),
    owner: block?.owner || block?.miner || '-',
    miner: block?.miner || block?.owner || '-',
    microBlockCount: normalizeMicroBlockCount(block),
    transactionCount: normalizeTxCount(block),
    size: Number(block?.size ?? 0),
    parentHash: block?.parentHash || '-',
    uncleHashes: block?.uncleHashes || block?.uncleHash || [],
    mixDigest: block?.mixDigest || block?.mixdigest || '-',
    nonce: block?.nonce ?? '-',
    difficulty: block?.difficulty || '-',
    time: formatTime(block?.time || block?.timestamp),
    timestamp: block?.timestamp,
  };
}

export function normalizeBusinessBlock(block: any) {
  const committee = (block?.committee || []).map((member: any) => {
    if (typeof member === 'string') return member;
    return member?.name || member?.address || '-';
  });

  return {
    ...block,
    height: Number(block?.height ?? 0),
    hash: block?.hash || '-',
    hashShort: shortHash(block?.hash),
    leader: block?.leader || block?.leaderAddress || '-',
    transactionCount: normalizeTxCount(block),
    size: Number(block?.size ?? 0),
    parentHash: block?.parentHash || '-',
    committee,
    consensus: block?.consensus || 'HotStuff',
    time: formatTime(block?.time || block?.timestamp),
    timestamp: block?.timestamp,
  };
}

export function normalizeNode(node: any) {
  const role = node?.role || (node?.type === 'committee' ? '委员会节点' : 'PoT矿工节点');
  const status = node?.status === 'online' || node?.status === '在线' ? '在线' : '离线';

  return {
    ...node,
    id: node?.id,
    name: node?.name || node?.peerId || shortHash(node?.address),
    peerId: node?.peerId || node?.name || '-',
    url: node?.url || '-',
    address: node?.address || '-',
    location: node?.location || node?.region || '-',
    role,
    type: node?.type || (role.includes('委员会') ? 'committee' : 'pot'),
    status,
    blockNum: Number(node?.blockNum ?? node?.blocks ?? 0),
    latency: Number(node?.latency ?? 0),
    connections: Number(node?.connections ?? 0),
    isLeader: Boolean(node?.isLeader),
    lastSeen: formatTime(node?.lastSeen),
  };
}

export function normalizeTransaction(tx: any) {
  return {
    ...tx,
    id: tx?.id || tx?.hash || tx?.txid,
    txid: tx?.txid || tx?.hash || '-',
    txidShort: shortHash(tx?.txid || tx?.hash),
    typeName: tx?.typeName || tx?.type || '-',
    transactionFee: tx?.transactionFee ?? '0',
    inputCount: Number(tx?.inputCount ?? tx?.inputs?.length ?? 0),
    outputCount: Number(tx?.outputCount ?? tx?.outputs?.length ?? 0),
    status: tx?.status || 'accepted',
    timestamp: formatTime(tx?.timestamp || tx?.time),
    inputs: tx?.inputs || [],
    outputs: tx?.outputs || [],
  };
}

export { shortHash, formatTime };
