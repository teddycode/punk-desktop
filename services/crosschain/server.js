const path = require('path');
const fs = require('fs');
const http = require('http');
const { execFile } = require('child_process');

const optionalRequire = (moduleName) => {
    try {
        return require(moduleName);
    } catch (error) {
        return null;
    }
};

const express = optionalRequire('express');
const cors = optionalRequire('cors');
const mysql = optionalRequire('mysql2/promise');
const web3Pkg = optionalRequire('web3');
const web3Validator = optionalRequire('web3-validator');
const Web3 = web3Pkg ? (web3Pkg.Web3 || web3Pkg) : null;
const isAddress = (web3Validator && web3Validator.isAddress)
    ? web3Validator.isAddress
    : (value) => /^0x[a-fA-F0-9]{40}$/.test(String(value || ''));

const missingRuntimeDeps = [];
if (!express) missingRuntimeDeps.push('express');
if (!cors) missingRuntimeDeps.push('cors');
if (!mysql) missingRuntimeDeps.push('mysql2');
if (!Web3) missingRuntimeDeps.push('web3');
if (!web3Validator) missingRuntimeDeps.push('web3-validator');

let app = null;
if (express) {
    app = express();
    if (cors) app.use(cors());
    app.use(express.json());
}

// ================= 1. Configuration =================
const PORT = process.env.PORT || 3020;
const DEPLOY_ENV = process.env.DEPLOY_ENV || 'dev'; 
const PROJECT_ROOT = __dirname;
const PYTHON_BIN = process.env.PUNKOS_PYTHON || 'python';
const PUNKOS_ENV = process.env.PUNKOS_CONDA_ENV || 'punkos';

const MANAGER_NAME = 'Manager';
const CONTRACT_NAME = 'Transport';
const TASK_VERIFIER_NAME = 'TransportTaskVerifier';
const HUB_CHAIN_ID = 0;
const TRANSPORT_LEVEL_ID = 1;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// RPC URLs
const DEFAULT_RPC_URL = 'http://47.243.174.71:36054';
const RPC_URL = process.env.RPC_URL || DEFAULT_RPC_URL;
const LCL_RPC_URL = process.env.LCL_RPC_URL || RPC_URL;

const web3 = Web3 ? new Web3(RPC_URL) : null;

// Relayer Private Key Initialization
const DEFAULT_PRIVATE_KEY = '0xe64deb22655660a36b93ac2669c3bbf39730b2feeae6a6c34d49e40894872bb2';
const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY || DEFAULT_PRIVATE_KEY;

if (PRIVATE_KEY && web3) {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
        web3.eth.accounts.wallet.add(account);
        console.log(`👤 Relayer Address Loaded: ${account.address}`);
    } catch (error) {
        console.error("❌ Private key error:", error.message);
    }
} else if (!web3) {
    console.warn('⚠️ web3 not available, contract-related APIs may be degraded.');
}

// ================= 2. Database Connection =================
const dbConfig = {
    host: process.env.DB_HOST || '47.243.174.71',
    port: Number(process.env.DB_PORT) || 13306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'punkos@buaa',
    database: process.env.DB_NAME || 'CrossZone',
    waitForConnections: true,
    connectionLimit: 10
};

const pool = mysql
    ? mysql.createPool(dbConfig)
    : {
        query: async () => {
            throw new Error('mysql2 module is not available');
        }
    };

// ================= 3. Helpers =================

const runPythonScript = (scriptPath, args = []) =>
    new Promise((resolve, reject) => {
        const bin = PYTHON_BIN;
        const cmdArgs = [scriptPath, ...args];
        const command = process.env.PUNKOS_PYTHON
            ? { bin: bin, args: cmdArgs }
            : { bin: 'conda', args: ['run', '-n', PUNKOS_ENV, bin, ...cmdArgs] };

        execFile(command.bin, command.args, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error((stderr || stdout || error.message).trim()));
                return;
            }
            resolve(stdout.trim());
        });
    });

const readAddressFromFile = (contractName) => {
    const filePath = path.resolve(__dirname, `data/${DEPLOY_ENV}/${contractName}.address`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Contract address file not found: ${filePath}`);
    }
    const address = fs.readFileSync(filePath, 'utf8').trim();
    if (!isAddress(address)) {
        throw new Error(`Invalid contract address in file: ${filePath}`);
    }
    return address;
};

const MANAGER_ABI = [
    {
        inputs: [
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        name: 'contract_chain_index',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_address', type: 'address' },
            { internalType: 'bytes', name: 'payload', type: 'bytes' }
        ],
        name: 'operateSystemContract',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getSourceChainNum',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: 'sourceID', type: 'uint256' }],
        name: 'getSourceChainInfo',
        outputs: [
            { internalType: 'string', name: 'symbol', type: 'string' },
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'uint256', name: 'state', type: 'uint256' },
            { internalType: 'uint256', name: 'contractNum', type: 'uint256' },
            { internalType: 'address[]', name: 'contractAddressList', type: 'address[]' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getCommitteeMembers',
        outputs: [{ internalType: 'address[]', name: 'members', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_member', type: 'address' }],
        name: 'inviteCommitteeMember',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'committeeMembers',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    }
];

const TRANSPORT_ABI = [
    {"inputs": [], "name": "taskNum", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "taskIndex", "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "bytes32", "name": "_taskKey", "type": "bytes32"}], "name": "getTaskInfoByKey", "outputs": [{"internalType": "address","name": "user","type": "address"},{"internalType": "uint256","name": "fee","type": "uint256"},{"internalType": "uint256","name": "taskType","type": "uint256"},{"internalType": "address","name": "relayer","type": "address"},{"internalType": "uint256","name": "stake","type": "uint256"},{"internalType": "bytes","name": "payload","type": "bytes"},{"internalType": "uint8","name": "label","type": "uint8"},{"internalType": "uint256","name": "time","type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "getAllRoutes", "outputs": [{"internalType": "uint256[]", "name": "ids", "type": "uint256[]"}, {"internalType": "string[]", "name": "names", "type": "string[]"}, {"internalType": "bool[]", "name": "status", "type": "bool[]"}, {"internalType": "address[]", "name": "verifiers", "type": "address[]"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "getSystemContractNum", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "bytes32", "name": "_taskKey", "type": "bytes32"}], "name": "acceptTask", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "getContractState", "outputs": [{"internalType": "uint256", "name": "currentState", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "getRequireStake", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "getMyStake", "outputs": [{"internalType": "uint256", "name": "stake", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "becomeRelayer", "outputs": [], "stateMutability": "payable", "type": "function"}
];

const getManagerAddress = () => { try { return readAddressFromFile(MANAGER_NAME); } catch (e) { return ZERO_ADDRESS; } };

const resolveTransportAddress = async () => {
    if (!web3) {
        try { return readAddressFromFile(CONTRACT_NAME); } catch (e) { return ZERO_ADDRESS; }
    }

    const managerAddress = getManagerAddress();
    if (!isAddress(managerAddress) || managerAddress === ZERO_ADDRESS) {
        try { return readAddressFromFile(CONTRACT_NAME); } catch (e) { return ZERO_ADDRESS; }
    }
    try {
        const managerContract = new web3.eth.Contract(MANAGER_ABI, managerAddress);
        const address = await managerContract.methods.contract_chain_index(HUB_CHAIN_ID, TRANSPORT_LEVEL_ID).call();
        return (isAddress(address) && address !== ZERO_ADDRESS) ? address : readAddressFromFile(CONTRACT_NAME);
    } catch (error) {
        try { return readAddressFromFile(CONTRACT_NAME); } catch (e) { return ZERO_ADDRESS; }
    }
};

let transportAddressCache = null;
const getTransportAddress = async () => {
    if (!transportAddressCache) transportAddressCache = await resolveTransportAddress();
    return transportAddressCache;
};

const getSourceChainsFromManager = async () => {
    try {
        if (!web3) return [];
        const managerAddress = getManagerAddress();
        if (managerAddress === ZERO_ADDRESS) return [];
        const managerContract = new web3.eth.Contract(MANAGER_ABI, managerAddress);
        const sourceNum = Number(await managerContract.methods.getSourceChainNum().call());
        const chains = await Promise.all(Array.from({ length: sourceNum }, (_, i) => 
            managerContract.methods.getSourceChainInfo(i + 1).call().then(info => ({
                chain_id: i + 1,
                symbol: String(info?.[0] || '').trim(),
                name: String(info?.[1] || '').trim(),
                state: Number(info?.[2] || 0)
            })).catch(() => null)
        ));
        return chains.filter(Boolean);
    } catch (e) { return []; }
};

// ================= 4. API Endpoints =================
const router = express ? express.Router() : null;

const startFallbackServer = () => {
    const deps = missingRuntimeDeps.length > 0 ? missingRuntimeDeps : ['unknown'];
    const fallbackZone = {
        name: 'PunkOS Cross-Chain Zone',
        zone_type: 0,
        rpc: RPC_URL,
        multi_addr: ZERO_ADDRESS,
        transport_addr: ZERO_ADDRESS,
        manager_addr: ZERO_ADDRESS,
        degraded: true
    };

    const server = http.createServer((req, res) => {
        const requestPath = String((req.url || '').split('?')[0] || '/');
        const normalizedApiPath = requestPath.startsWith('/api/')
            ? requestPath.slice(4)
            : (requestPath === '/api' ? '/' : requestPath);

        if (req.method === 'GET' && normalizedApiPath === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ status: 'ok', degraded: true, missingDependencies: deps }));
            return;
        }

        if (req.method === 'GET' && normalizedApiPath === '/crosschainzone') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify([fallbackZone]));
            return;
        }

        if (req.method === 'GET' && normalizedApiPath === '/sourceChains') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify([]));
            return;
        }

        if (req.method === 'GET' && normalizedApiPath === '/manager-address') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ address: ZERO_ADDRESS, degraded: true }));
            return;
        }

        if (req.method === 'GET' && normalizedApiPath === '/contract-address') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ address: ZERO_ADDRESS, degraded: true }));
            return;
        }

        if (req.method === 'GET' && normalizedApiPath === '/task-verifier-address') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ name: TASK_VERIFIER_NAME, address: ZERO_ADDRESS, degraded: true }));
            return;
        }

        if (req.method === 'GET' && (normalizedApiPath === '/systemContracts' || normalizedApiPath === '/blocks' || normalizedApiPath === '/txs' || normalizedApiPath === '/tasks')) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify([]));
            return;
        }

        if (req.method === 'GET' && normalizedApiPath.startsWith('/shadowBlocks/')) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify([]));
            return;
        }

        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            error: 'Cross-chain service is running in degraded mode',
            missingDependencies: deps
        }));
    });

    server.listen(PORT, () => {
        console.warn(`⚠️ Cross-Chain Service degraded mode at http://localhost:${PORT}, missing deps: ${deps.join(', ')}`);
    });
};

if (router) {

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.get('/crosschainzone', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM crosschainzone_info LIMIT 1');
        const transportAddress = await getTransportAddress();
        const managerAddress = getManagerAddress();
        
        const formatRpc = (rpc) => {
            if (!rpc || rpc.includes('127.0.0.1')) return RPC_URL;
            return rpc;
        };

        const result = rows.length > 0 ? rows.map(item => ({
            ...item,
            rpc: formatRpc(item.rpc),
            multi_addr: item.multi_addr || transportAddress,
            transport_addr: transportAddress,
            manager_addr: managerAddress
        })) : [{ name: 'PunkOS Cross-Chain Zone', rpc: RPC_URL, multi_addr: transportAddress, transport_addr: transportAddress, manager_addr: managerAddress }];
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/sourceChains', async (req, res) => {
    try {
        const [dbRows] = await pool.query('SELECT * FROM source_chain_info');
        const managerRows = await getSourceChainsFromManager();
        const mergedMap = new Map();
        dbRows.forEach(r => mergedMap.set(Number(r.chain_id), r));
        managerRows.forEach(r => { if (!mergedMap.has(r.chain_id)) mergedMap.set(r.chain_id, r); });
        res.json(Array.from(mergedMap.values()).sort((a,b) => a.chain_id - b.chain_id));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/systemContracts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM system_contract_info');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/blocks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT no, block_hash, prev_hash, block_height, if_matter, created_at FROM hub_block_info ORDER BY block_height DESC LIMIT 20');
        res.json(rows.map(b => ({ block_number: b.block_height, block_hash: b.block_hash, prev_hash: b.prev_hash, if_matter: b.if_matter === 1 ? '是' : '否', created_at: b.created_at, no: b.no })));
    } catch (e) { res.status(500).json([]); }
});

router.get('/txs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT t.tx_hash, t.tx_index, t.created_at, b.block_height as block_number, b.block_hash FROM hub_tx_info t LEFT JOIN hub_block_info b ON t.block_hash = b.block_hash ORDER BY t.no DESC LIMIT 20');
        res.json(rows.map(tx => ({ tx_hash: tx.tx_hash, block_number: tx.block_number || '未知', tx_index: tx.tx_index, block_hash: tx.block_hash || '未知', created_at: tx.created_at, from_addr: '暂无', to_addr: '暂无', value: '0', gas_used: '0' })));
    } catch (e) { res.status(500).json([]); }
});

router.get('/tasks', async (req, res) => {
    try {
        const transportAddr = await getTransportAddress();
        const contract = new web3.eth.Contract(TRANSPORT_ABI, transportAddr);
        const total = Number(await contract.methods.taskNum().call());
        const tasks = [];
        const limit = Math.min(total, 10);
        for (let i = total - 1; i >= total - limit && i >= 0; i--) {
            const key = await contract.methods.taskIndex(i).call();
            const info = await contract.methods.getTaskInfoByKey(key).call();
            tasks.push({ index: i, task_key: key, user: info.user, fee_eth: web3.utils.fromWei(info.fee, 'ether'), payload: info.payload, label: Number(info.label) });
        }
        res.json(tasks);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/shadowBlocks/:chainId', async (req, res) => {
    try {
        const chainId = Number(req.params.chainId);
        if (!Number.isFinite(chainId) || chainId <= 0) {
            return res.json([]);
        }

        const [rows] = await pool.query(
            'SELECT * FROM source_shadow_info WHERE chain_id = ? ORDER BY no DESC LIMIT 200',
            [chainId]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/manager-address', (req, res) => res.json({ address: getManagerAddress() }));
router.get('/contract-address', async (req, res) => res.json({ address: await getTransportAddress() }));
router.get('/task-verifier-address', (req, res) => {
    try { res.json({ name: TASK_VERIFIER_NAME, address: readAddressFromFile(TASK_VERIFIER_NAME) }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/lcl-proof', async (req, res) => {
    const { destTxHash, txHeight, confirmHeight, taskTypeName } = req.body || {};
    if (!destTxHash || !txHeight) return res.status(400).json({ error: 'Missing parameters' });
    try {
        const scriptPath = path.resolve(PROJECT_ROOT, 'punkos_transport/build_lcl_finish_params.py');
        const stdout = await runPythonScript(scriptPath, ['--tx-hash', destTxHash, '--block-height', String(txHeight), '--rpc-url', LCL_RPC_URL]);
        res.json({ ...JSON.parse(stdout), chainName: 'LCL', taskTypeName: taskTypeName || '' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Use router for both /api and / to handle proxy stripping
app.use('/api', router);
app.use('/', router);

app.listen(PORT, () => console.log(`🚀 Cross-Chain Service running at http://localhost:${PORT}`));

} else {
    startFallbackServer();
}
