const crypto = require('crypto');
const http = require('http');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 10000);
const POT_NODE_COUNT = Number(process.env.POT_NODE_COUNT || 4);
const COMMITTEE_NODE_COUNT = 4;
const BLOCK_INTERVAL_MS = 5000;
const START_TIME = Date.now();
const BASE_HEIGHT = 12345;

const wsClients = new Map();
let wsClientId = 0;

function nowIso() {
  return new Date().toISOString();
}

function currentHeight() {
  return BASE_HEIGHT + Math.floor((Date.now() - START_TIME) / BLOCK_INTERVAL_MS);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function wave(min, max, periodMs, offset = 0) {
  const phase = Date.now() / periodMs + offset;
  return min + ((Math.sin(phase) + 1) / 2) * (max - min);
}

function hex(seed, length) {
  let output = '';
  let index = 0;

  while (output.length < length) {
    output += crypto.createHash('sha256').update(`${seed}:${index}`).digest('hex');
    index += 1;
  }

  return `0x${output.slice(0, length)}`;
}

function seededInt(seed, min, max) {
  const digest = crypto.createHash('sha256').update(String(seed)).digest('hex');
  const value = Number.parseInt(digest.slice(0, 8), 16);
  return min + (value % (max - min + 1));
}

function seededChoice(seed, values) {
  return values[seededInt(seed, 0, values.length - 1)];
}

function normalizePath(requestUrl) {
  const parsed = new URL(requestUrl, `http://${HOST}:${PORT}`);
  const pathname = parsed.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
  return { pathname, searchParams: parsed.searchParams };
}

function getBlockTimestamp(height, latestHeight = currentHeight()) {
  return Math.floor((Date.now() - Math.max(0, latestHeight - height) * BLOCK_INTERVAL_MS) / 1000);
}

function getBlockInfo(height, latestHeight = currentHeight()) {
  return {
    height,
    hash: hex(`block:${height}`, 64),
    timestamp: getBlockTimestamp(height, latestHeight),
    txCount: seededInt(`tx-count:${height}`, 16, 180),
    size: seededInt(`block-size:${height}`, 64000, 480000),
    miner: `peer-pot-${seededInt(`miner:${height}`, 0, POT_NODE_COUNT - 1)}`,
  };
}

function getBlockDetail(height) {
  const info = getBlockInfo(height);
  const txCount = Math.min(info.txCount, 32);
  const uncleCount = seededInt(`uncle-count:${height}`, 0, 2);

  return Object.assign({}, info, {
    parentHash: hex(`block:${height - 1}`, 64),
    difficulty: `0x${seededInt(`difficulty:${height}`, 0x130000, 0x2fffff).toString(16)}`,
    nonce: seededInt(`nonce:${height}`, 100000, 999999),
    mixdigest: hex(`mixdigest:${height}`, 64),
    uncleHashes: Array.from({ length: uncleCount }, (_, index) => hex(`uncle:${height}:${index}`, 64)),
    transactions: Array.from({ length: txCount }, (_, index) => hex(`tx:${height}:${index}`, 64)),
    committeePubkey: hex(`committee-pubkey:${height}`, 128),
  });
}

function getSystemOverview() {
  const totalNodes = COMMITTEE_NODE_COUNT + POT_NODE_COUNT;
  const utilization = round(wave(46, 74, 14000));

  return {
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    totalNodes,
    onlineNodes: totalNodes,
    consensusTypes: ['POT', 'SimpleWhirly'],
    networkStatus: utilization > 68 ? 'warning' : 'healthy',
    networkUtilization: utilization,
    currentHeight: currentHeight(),
    avgBlockTime: round(wave(4.6, 5.8, 11000)),
    lastBlockTime: nowIso(),
    currentTPS: round(wave(18, 62, 9000)),
    executorStatus: 'active',
  };
}

function getPotStatus() {
  const height = currentHeight();

  return {
    consensusType: 'POT',
    epoch: 89 + Math.floor(height / 100),
    difficulty: `0x${seededInt(`pot-difficulty:${height}`, 0x1a0000, 0x2fffff).toString(16)}`,
    currentHeight: height,
    workFlag: true,
    timestamp: nowIso(),
    nonce: seededInt(`pot-nonce:${height}:${Math.floor(Date.now() / 2000)}`, 10000, 999999),
    uncleCount: seededInt(`pot-uncle:${height}`, 0, 2),
    avgMiningTime: round(wave(2.4, 4.9, 10000)),
    miningSuccessRate: round(wave(82, 96, 15000)),
  };
}

function vdfWorker(seed, offset = 0) {
  const progress = (Date.now() / 100 + offset * 17) % 100;
  const status = progress > 92 ? 'done' : 'computing';

  return {
    progress: round(progress),
    iterations: Math.floor(progress * 1200 + seededInt(seed, 1000, 9000)),
    status,
    channelBuffer: seededInt(`${seed}:buffer:${Math.floor(Date.now() / 3000)}`, 1, 8),
  };
}

function getVDFStatus() {
  const workers = Array.from({ length: 4 }, (_, workerId) => {
    const worker = vdfWorker(`vdf1:${workerId}`, workerId + 1);
    return {
      workerId,
      progress: worker.progress,
      iterations: worker.iterations,
      status: worker.status,
    };
  });

  return {
    vdf0: vdfWorker('vdf0'),
    vdf1: workers,
    vdfHalf: vdfWorker('vdf-half', 3),
    vdfChecker: {
      status: 'active',
      verifyFailCount: seededInt(`verify:${Math.floor(Date.now() / 30000)}`, 0, 1),
    },
    abortStatus: false,
    avgComputeTime: round(wave(28, 64, 13000)),
    totalIterations: workers.reduce((sum, worker) => sum + worker.iterations, 0),
    cpuCounter: 4,
  };
}

function getCommitteeMembers() {
  return Array.from({ length: COMMITTEE_NODE_COUNT }, (_, index) => ({
    address: hex(`committee-address:${index}`, 40),
    publicKey: hex(`committee-public-key:${index}`, 64),
    isLeader: index === 0,
  }));
}

function getCommitteeStatus() {
  const height = currentHeight();
  const committee = getCommitteeMembers();
  const leaderAddress = committee[0].address;

  return {
    consensusType: 'SimpleWhirly',
    committeeSize: COMMITTEE_NODE_COUNT,
    committeeCount: COMMITTEE_NODE_COUNT,
    confirmDelay: 6,
    workHeight: height - 6,
    batchSize: seededInt(`batch:${Math.floor(Date.now() / 5000)}`, 3, 9),
    inCommittee: true,
    role: 'member',
    committee,
    committeePublicKey: hex(`committee-public-key:${Math.floor(height / 100)}`, 64),
    shardings: [
      {
        name: 'Shard-0',
        id: 0,
        leaderAddress,
        committeeMembers: COMMITTEE_NODE_COUNT,
        status: 'active',
      },
    ],
    workStage: seededChoice(Math.floor(Date.now() / 4000), ['init', 'shuffle', 'draw', 'share', 'consensus']),
    timeout: 5000,
    messageQueueLength: seededInt(`committee-queue:${Math.floor(Date.now() / 2000)}`, 3, 18),
    electionHeight: height - 100,
  };
}

function getBCIStatus() {
  const height = currentHeight();

  return {
    totalReward: 65536,
    lockedReward: seededInt(`locked:${height}`, 6000, 16000),
    totalInterest: seededInt(`interest:${height}`, 1800, 6400),
    rewardRatio: {
      exchequer: 30,
      miner: 50,
      uncleBlockMiner: 2,
      committeeLeader: 20,
      committeeMember: 10,
    },
    lockRates: {
      saving: 0.1,
      halfYear: 0.5,
      oneYear: 1,
      threeYears: 2,
      tenYears: 5,
    },
    coinbaseLock: 6,
    executeHeight: height,
    incentiveHeight: height - 1,
    pendingRewards: seededInt(`pending:${height}`, 20, 120),
    utxoCount: seededInt(`utxo:${height}`, 700, 1800),
    totalDistributed: 50000 + (height - BASE_HEIGHT) * 256,
  };
}

function getMempoolStatus() {
  const totalSize = seededInt(`mempool:${Math.floor(Date.now() / 3000)}`, 48, 130);
  const markedTxs = Math.floor(totalSize * 0.62);
  const bci = Math.floor(totalSize * 0.18);
  const devastate = Math.floor(totalSize * 0.07);

  return {
    totalSize,
    markedTxs,
    unmarkedTxs: totalSize - markedTxs,
    txTypes: {
      normal: totalSize - bci - devastate,
      bci,
      devastate,
    },
    avgConfirmTime: round(wave(5, 13, 12000)),
    verifySuccessRate: round(wave(93, 99, 16000)),
    memoryUsage: seededInt(`memory:${Math.floor(Date.now() / 5000)}`, 5 * 1024 * 1024, 16 * 1024 * 1024),
    recentTxs: Array.from({ length: 5 }, (_, index) => ({
      hash: hex(`recent-tx:${Math.floor(Date.now() / 5000)}:${index}`, 64),
      type: seededChoice(index + Math.floor(Date.now() / 5000), ['normal', 'bci', 'devastate']),
      timestamp: new Date(Date.now() - index * 9000).toISOString(),
      status: index < 2 ? 'pending' : 'confirmed',
    })),
  };
}

function getNetworkTopology() {
  const committeeNodes = Array.from({ length: COMMITTEE_NODE_COUNT }, (_, index) => ({
    id: index,
    peerId: `peer-committee-${index}`,
    address: hex(`committee-node:${index}`, 40),
    status: 'online',
    connections: COMMITTEE_NODE_COUNT - 1 + POT_NODE_COUNT,
    latency: seededInt(`committee-latency:${index}:${Math.floor(Date.now() / 6000)}`, 8, 32),
    type: 'committee',
    isLeader: index === 0,
  }));

  const potNodes = Array.from({ length: POT_NODE_COUNT }, (_, index) => ({
    id: COMMITTEE_NODE_COUNT + index,
    peerId: `peer-pot-${index}`,
    address: hex(`pot-node:${index}`, 40),
    status: 'online',
    connections: 3,
    latency: seededInt(`pot-latency:${index}:${Math.floor(Date.now() / 6000)}`, 18, 88),
    type: 'pot',
    isLeader: false,
  }));

  const edges = [];

  for (let source = 0; source < COMMITTEE_NODE_COUNT; source += 1) {
    for (let target = source + 1; target < COMMITTEE_NODE_COUNT; target += 1) {
      edges.push({
        source,
        target,
        latency: seededInt(`edge:${source}:${target}`, 8, 30),
        messageCount: seededInt(`messages:${source}:${target}:${Math.floor(Date.now() / 10000)}`, 300, 1200),
      });
    }
  }

  for (let index = 0; index < POT_NODE_COUNT; index += 1) {
    const source = COMMITTEE_NODE_COUNT + index;
    edges.push({
      source,
      target: index % COMMITTEE_NODE_COUNT,
      latency: seededInt(`pot-committee:${index}`, 18, 72),
      messageCount: seededInt(`pot-committee-msg:${index}:${Math.floor(Date.now() / 10000)}`, 120, 620),
    });
    edges.push({
      source,
      target: COMMITTEE_NODE_COUNT + ((index + 1) % POT_NODE_COUNT),
      latency: seededInt(`pot-ring:${index}`, 28, 96),
      messageCount: seededInt(`pot-ring-msg:${index}:${Math.floor(Date.now() / 10000)}`, 80, 380),
    });
  }

  return {
    nodes: [...committeeNodes, ...potNodes],
    edges,
    p2pAdaptorType: 'libp2p',
    subscribedTopics: ['blocks', 'transactions', 'consensus'],
    messageQueueLength: seededInt(`network-queue:${Math.floor(Date.now() / 3000)}`, 8, 46),
    networkBandwidth: seededInt(`bandwidth:${Math.floor(Date.now() / 3000)}`, 512 * 1024, 2 * 1024 * 1024),
  };
}

function getRecentBlocks(count) {
  const latestHeight = currentHeight();
  const safeCount = Math.max(1, Math.min(Number(count) || 10, 50));
  const startHeight = Math.max(1, latestHeight - safeCount + 1);

  return Array.from({ length: latestHeight - startHeight + 1 }, (_, index) =>
    getBlockInfo(startHeight + index, latestHeight)
  );
}

function createLockTransaction(body) {
  const tx = body && body.transaction ? body.transaction : {};
  const seed = JSON.stringify(body || {}) || String(Date.now());
  return {
    code: 200,
    message: 'ok',
    data: {
      txid: tx.Txid || hex(`submitted:${seed}`, 64),
      status: 'accepted',
      type: String((body && body.type) || '1'),
      inputCount: Array.isArray(tx.TxInputs) ? tx.TxInputs.length : 0,
      outputCount: Array.isArray(tx.TxOutputs) ? tx.TxOutputs.length : 0,
      acceptedAt: nowIso(),
    },
  };
}

function routeRequest(method, requestUrl, body) {
  const { pathname, searchParams } = normalizePath(requestUrl);

  if (method === 'GET' && pathname === '/health') {
    return {
      status: 'ok',
      service: 'pot-api-mock',
      nodeCount: POT_NODE_COUNT,
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
    };
  }

  if (method === 'GET' && pathname === '/system/overview') return getSystemOverview();
  if (method === 'GET' && pathname === '/pot/status') return getPotStatus();
  if (method === 'GET' && pathname === '/pot/vdf') return getVDFStatus();
  if (method === 'GET' && pathname === '/committee/status') return getCommitteeStatus();
  if (method === 'GET' && pathname === '/bci/status') return getBCIStatus();
  if (method === 'GET' && pathname === '/mempool/status') return getMempoolStatus();
  if (method === 'GET' && pathname === '/network/topology') return getNetworkTopology();
  if (method === 'GET' && pathname === '/blocks/recent') {
    return getRecentBlocks(searchParams.get('count'));
  }

  const blockMatch = pathname.match(/^\/blocks\/(\d+)$/);
  if (method === 'GET' && blockMatch) {
    return getBlockDetail(Number(blockMatch[1]));
  }

  if (method === 'POST' && pathname === '/createlocktransaction') {
    return createLockTransaction(body);
  }

  const error = new Error(`Not Found: ${method} ${pathname}`);
  error.statusCode = 404;
  throw error;
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(body);
}

function handleHttpRequest(request, response) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
    });
    response.end();
    return;
  }

  const chunks = [];
  request.on('data', (chunk) => chunks.push(chunk));
  request.on('end', () => {
    try {
      const rawBody = Buffer.concat(chunks).toString('utf-8');
      const body = rawBody ? JSON.parse(rawBody) : null;
      const payload = routeRequest(request.method, request.url, body);
      sendJson(response, 200, payload);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      sendJson(response, statusCode, {
        code: statusCode,
        message: error.message || 'Internal Server Error',
      });
    }
  });
}

function encodeWsFrame(payload) {
  const body = Buffer.from(JSON.stringify(payload));

  if (body.length < 126) {
    return Buffer.concat([Buffer.from([0x81, body.length]), body]);
  }

  if (body.length < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
    return Buffer.concat([header, body]);
  }

  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(body.length), 2);
  return Buffer.concat([header, body]);
}

function decodeWsFrame(buffer) {
  if (buffer.length < 2) return null;

  const opcode = buffer[0] & 0x0f;
  if (opcode === 0x8) return { close: true };
  if (opcode !== 0x1) return null;

  const masked = Boolean(buffer[1] & 0x80);
  let length = buffer[1] & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < offset + 2) return null;
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    if (buffer.length < offset + 8) return null;
    length = Number(buffer.readBigUInt64BE(offset));
    offset += 8;
  }

  let mask;
  if (masked) {
    if (buffer.length < offset + 4) return null;
    mask = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + length) return null;

  const payload = Buffer.from(buffer.slice(offset, offset + length));
  if (masked && mask) {
    for (let index = 0; index < payload.length; index += 1) {
      payload[index] ^= mask[index % 4];
    }
  }

  return { text: payload.toString('utf-8') };
}

function sendWs(socket, payload) {
  if (!socket.destroyed) {
    socket.write(encodeWsFrame(payload));
  }
}

function handleWsUpgrade(request, socket) {
  const { pathname } = normalizePath(request.url);
  if (pathname !== '/ws') {
    socket.end('HTTP/1.1 404 Not Found\r\n\r\n');
    return;
  }

  const key = request.headers['sec-websocket-key'];
  if (!key) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    return;
  }

  const accept = crypto
    .createHash('sha1')
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest('base64');

  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '\r\n',
    ].join('\r\n')
  );

  const id = ++wsClientId;
  wsClients.set(id, { socket, topics: new Set(['system', 'pot', 'vdf']) });

  socket.on('data', (buffer) => {
    const frame = decodeWsFrame(buffer);
    if (!frame) return;
    if (frame.close) {
      socket.end();
      return;
    }

    try {
      const message = JSON.parse(frame.text);
      const topics = message.topics || message.types;
      if (Array.isArray(topics)) {
        const client = wsClients.get(id);
        if (client) {
          client.topics = new Set(topics);
        }
      }
    } catch (error) {
      console.warn('[pot-api] invalid websocket message:', error.message);
    }
  });

  socket.on('close', () => wsClients.delete(id));
  socket.on('error', () => wsClients.delete(id));

  sendWs(socket, {
    type: 'system',
    timestamp: nowIso(),
    data: getSystemOverview(),
  });
}

function getTopicData() {
  return {
    system: getSystemOverview(),
    pot: getPotStatus(),
    vdf: getVDFStatus(),
    committee: getCommitteeStatus(),
    mempool: getMempoolStatus(),
    network: getNetworkTopology(),
    bci: getBCIStatus(),
  };
}

function broadcastWsUpdates() {
  if (!wsClients.size) return;

  const dataByTopic = getTopicData();
  wsClients.forEach((client) => {
    client.topics.forEach((topic) => {
      if (!dataByTopic[topic]) return;
      sendWs(client.socket, {
        type: topic,
        timestamp: nowIso(),
        data: dataByTopic[topic],
      });
    });
  });
}

const server = http.createServer(handleHttpRequest);
server.on('upgrade', handleWsUpgrade);

const broadcastTimer = setInterval(broadcastWsUpdates, 1000);

server.listen(PORT, HOST, () => {
  console.log(`[pot-api] mock service listening on http://${HOST}:${PORT}`);
});

function shutdown() {
  clearInterval(broadcastTimer);
  wsClients.forEach((client) => client.socket.end());
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
