#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const { stdin, stdout } = require('process');
const { ethers } = require('ethers');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const ZERO_ADDRESS = ethers.ZeroAddress || ethers.constants.AddressZero;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const REVERSE_RESULT_MARKER = '__PUNKOS_REVERSE_RESULT__';
const DEFAULT_REVERSE_CONTRACT_ADDRESS = '0x93Eb1d3d42eACdee41894FDF0420Ae22266578c6';
const REVERSE_CHAIN_CONFIG = {
  SEP: {
    rpcUrl: process.env.TEST_RPC_URL || 'http://47.243.174.71:36054',
    privateKey: process.env.TEST_PRIVATE_KEY || process.env.DEST_PRIVATE_KEY || '',
    contractAddress: process.env.DEST_CONTRACT_ADDRESS || '0xaDEEeEb9d0eed7BAfe099B2A371671BAa2255B0A',
    gasLimit: 300000
  }
};

const isAddress = (value) => ethers.isAddress
  ? ethers.isAddress(value)
  : ethers.utils.isAddress(value);

const parseUnits = (value, unit) => ethers.parseUnits
  ? ethers.parseUnits(value, unit)
  : ethers.utils.parseUnits(value, unit);

const getAddress = (value) => ethers.getAddress
  ? ethers.getAddress(value)
  : ethers.utils.getAddress(value);

const TRANSPORT_ABI = [
  {
    type: 'function',
    name: 'createTask',
    inputs: [
      { name: '_payload', type: 'bytes' },
      { name: '_routeName', type: 'string' },
      { name: '_taskType', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'event',
    name: 'NewTransportTask',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'key', type: 'bytes32' },
      { indexed: false, name: 'payload', type: 'bytes' },
      { indexed: false, name: 'taskType', type: 'uint256' },
      { indexed: false, name: 'user', type: 'address' },
      { indexed: false, name: 'fee', type: 'uint256' }
    ]
  }
];

const MANAGER_ABI = [
  {
    type: 'function',
    name: 'getSystemContractAddressByLevelID',
    inputs: [
      { name: '_chainID', type: 'uint256' },
      { name: '_levelID', type: 'uint256' }
    ],
    outputs: [{ name: '_address', type: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'contract_chain_index',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view'
  }
];

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error('找不到 config.json，请先复制 config.example.json 并完成配置');
  }

  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const config = JSON.parse(raw);

  return config;
}

function resolveAddressFilePath(fileTemplate, deployEnv) {
  const relativeTemplate = fileTemplate || '../data/{env}/Manager.address';
  const withEnv = relativeTemplate.replaceAll('{env}', deployEnv);
  return path.resolve(__dirname, withEnv);
}

function readAddressFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`地址文件不存在: ${filePath}`);
  }

  const address = fs.readFileSync(filePath, 'utf8').trim();
  if (!isAddress(address)) {
    throw new Error(`地址文件内容无效: ${filePath}`);
  }

  return address;
}

function validateContractConfig(config) {
  if (!config.contractAddress || !isAddress(config.contractAddress)) {
    throw new Error('config.json 中 contractAddress 无效');
  }

  if (!Array.isArray(config.contractAbi) || config.contractAbi.length === 0) {
    throw new Error('config.json 中 contractAbi 无效');
  }
}

function parseOptionalGwei(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return undefined;
  }

  return parseUnits(normalized, 'gwei');
}

function parsePayloadInput(input) {
  const trimmed = String(input ?? '').trim();
  if (!trimmed) {
    throw new Error('上链内容不能为空');
  }

  if (trimmed.startsWith('0x')) {
    if (!ethers.isHexString(trimmed)) {
      throw new Error('十六进制 payload 非法，请检查是否为 0x 开头的有效 bytes');
    }
    return trimmed;
  }

  const isPlainHex = /^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0;
  if (isPlainHex) {
    return `0x${trimmed}`;
  }

  return ethers.hexlify(ethers.toUtf8Bytes(trimmed));
}

function buildTxOptions(config) {
  const txOptions = {};

  if (config.gasLimit) {
    txOptions.gasLimit = BigInt(config.gasLimit);
  }

  const forceLegacy = config.forceLegacy !== false;

  if (forceLegacy) {
    txOptions.type = 0; // 强制 legacy 交易类型

    // 使用 gasPriceGwei 或 maxGasPrice 配置
    const gasPrice = parseOptionalGwei(config.gasPriceGwei ?? config.gasPrice ?? config.maxGasPrice);
    if (!gasPrice) {
      throw new Error('forceLegacy 为 true 时，必须在配置中提供 gasPriceGwei 或 maxGasPrice');
    }
    txOptions.gasPrice = gasPrice;

    // 确保不会混入 maxFeePerGas 或 maxPriorityFeePerGas 参数
    return txOptions;
  }

  // 不强制 legacy，使用 EIP-1559 参数
  const maxFeePerGas = parseOptionalGwei(config.maxFeePerGasGwei ?? config.maxFeePerGas ?? config.maxGasPrice);
  if (maxFeePerGas) {
    txOptions.maxFeePerGas = maxFeePerGas;
    txOptions.maxPriorityFeePerGas = parseOptionalGwei(config.maxPriorityFeePerGasGwei) ?? maxFeePerGas;
  }

  return txOptions;
}

function readArgValue(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return '';
  return String(args[index + 1] || '').trim();
}

function parseReverseExecuteOutput(stdoutText) {
  const text = String(stdoutText || '');
  const txHashMatch = text.match(/(?:Transaction Hash|交易 Hash|Hash):\s*(0x[a-fA-F0-9]{64})/i) || text.match(/\b(0x[a-fA-F0-9]{64})\b/);
  const blockNumberMatch = text.match(/Block Number:\s*(\d+)/i) || text.match(/区块高度[:：\s]+(\d+)/);

  return {
    txHash: txHashMatch ? txHashMatch[1] : '',
    blockNumber: blockNumberMatch ? Number(blockNumberMatch[1]) : null,
    stdout: text
  };
}

function readConfigByPath(source, pathText) {
  if (!source || !pathText) return '';
  const value = pathText.split('.').reduce((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return current[key];
  }, source);
  return value === undefined || value === null ? '' : String(value).trim();
}

function loadOptionalConfig() {
  try {
    return loadConfig();
  } catch {
    return {};
  }
}

function normalizeHexPayload(payload) {
  const value = String(payload || '').trim();
  if (!value) {
    throw new Error('Missing --payload');
  }

  const normalized = value.startsWith('0x') ? value : `0x${value}`;
  if (!/^0x([0-9a-fA-F]{2})+$/.test(normalized)) {
    throw new Error(`Invalid payload hex: ${payload}`);
  }
  return normalized;
}

function resolveReverseChainConfig(chainSymbol) {
  const symbol = String(chainSymbol || '').toUpperCase();
  const defaults = REVERSE_CHAIN_CONFIG[symbol];
  if (!defaults) {
    throw new Error(`Unsupported reverse execution target: ${symbol}`);
  }

  const config = loadOptionalConfig();
  const configPrefix = `reverseChains.${symbol}`;
  const rpcUrl = readConfigByPath(config, `${configPrefix}.rpcUrl`) || defaults.rpcUrl;
  const privateKey = readConfigByPath(config, `${configPrefix}.privateKey`) || defaults.privateKey;
  const contractAddress = readConfigByPath(config, `${configPrefix}.contractAddress`) || defaults.contractAddress;
  const gasLimit = Number(readConfigByPath(config, `${configPrefix}.gasLimit`) || defaults.gasLimit || 300000);

  if (!rpcUrl) {
    throw new Error(`Missing RPC for reverse target ${symbol}`);
  }
  if (!privateKey) {
    throw new Error(`Missing private key for reverse target ${symbol}. Set TEST_PRIVATE_KEY or config reverseChains.${symbol}.privateKey.`);
  }
  if (!privateKey.startsWith('0x')) {
    throw new Error(`Invalid private key for reverse target ${symbol}: must start with 0x`);
  }
  if (!isAddress(contractAddress)) {
    throw new Error(`Invalid target contract address for ${symbol}: ${contractAddress}`);
  }

  return {
    symbol,
    rpcUrl,
    privateKey,
    contractAddress: getAddress(contractAddress),
    gasLimit
  };
}

async function getLegacyGasPrice(provider) {
  if (typeof provider.getFeeData === 'function') {
    const feeData = await provider.getFeeData();
    if (feeData?.gasPrice) {
      return feeData.gasPrice;
    }
  }

  if (typeof provider.getGasPrice === 'function') {
    return provider.getGasPrice();
  }

  return undefined;
}

function bumpGasPrice(gasPrice) {
  if (!gasPrice) return gasPrice;
  if (typeof gasPrice === 'bigint') {
    return gasPrice * 110n / 100n;
  }
  if (typeof gasPrice.mul === 'function') {
    return gasPrice.mul(110).div(100);
  }
  return gasPrice;
}

async function executeReverseTarget({ payload, chainSymbol }) {
  const normalizedPayload = normalizeHexPayload(payload);
  const target = resolveReverseChainConfig(chainSymbol);
  const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
  const provider = new Provider(target.rpcUrl);
  const wallet = new ethers.Wallet(target.privateKey, provider);
  const gasPrice = bumpGasPrice(await getLegacyGasPrice(provider));
  const txRequest = {
    to: target.contractAddress,
    data: normalizedPayload,
    gasLimit: target.gasLimit,
    type: 0
  };

  if (gasPrice) {
    txRequest.gasPrice = gasPrice;
  }

  const tx = await wallet.sendTransaction(txRequest);

  console.log(`Target chain transaction sent: ${tx.hash}`);
  const receipt = await tx.wait(1);
  if (!receipt) {
    throw new Error('Target chain receipt is empty');
  }
  if (receipt.status !== undefined && Number(receipt.status) !== 1) {
    throw new Error(`Target chain transaction reverted: ${tx.hash}`);
  }

  console.log(`Block Number: ${receipt.blockNumber}`);

  return {
    chainSymbol: target.symbol,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
}

async function runReverseExecuteFromArgs() {
  const payload = readArgValue(process.argv, '--payload');
  const chainSymbol = (readArgValue(process.argv, '--chain') || 'SEP').toUpperCase();

  if (!payload) {
    throw new Error('Missing --payload');
  }

  const jsResult = await executeReverseTarget({ payload, chainSymbol });
  console.log(`${REVERSE_RESULT_MARKER}${JSON.stringify({
    chainSymbol: jsResult.chainSymbol,
    txHash: jsResult.txHash,
    blockNumber: jsResult.blockNumber
  })}`);
  return;

}


async function resolveManagerAddress(config) {
  if (config.managerAddress && isAddress(config.managerAddress)) {
    return config.managerAddress;
  }

  const deployEnv = String(config.deployEnv ?? 'dev').trim();
  const managerFile = resolveAddressFilePath(config.managerAddressFile, deployEnv);
  return readAddressFromFile(managerFile);
}

async function resolveTransportAddress({ config, provider, wallet }) {
  const managerAddress = await resolveManagerAddress(config);
  const manager = new ethers.Contract(managerAddress, MANAGER_ABI, provider);

  const hubChainId = Number(config.hubChainId ?? 0);
  const transportLevelId = Number(config.transportLevelId ?? 1);
  let transportAddress = ZERO_ADDRESS;

  try {
    transportAddress = await manager.getSystemContractAddressByLevelID(hubChainId, transportLevelId);
  } catch {
    transportAddress = ZERO_ADDRESS;
  }

  if (!isAddress(transportAddress) || transportAddress === ZERO_ADDRESS) {
    try {
      transportAddress = await manager.contract_chain_index(hubChainId, transportLevelId);
    } catch {
      transportAddress = ZERO_ADDRESS;
    }
  }

  if (isAddress(transportAddress) && transportAddress !== ZERO_ADDRESS) {
    return transportAddress;
  }

  throw new Error('无法通过 Manager 解析 Transport 地址，请检查 Manager 地址、chainID、levelID 配置');
}

async function askCredentials(rl) {
  const rpcUrl = (await rl.question('请输入 RPC 节点 URL: ')).trim();
  if (!rpcUrl) {
    throw new Error('RPC 节点 URL 不能为空');
  }

  const privateKey = (await rl.question('请输入中继者私钥(0x 开头): ')).trim();
  if (!privateKey) {
    throw new Error('私钥不能为空');
  }

  if (!privateKey.startsWith('0x')) {
    throw new Error('私钥格式不正确，必须以 0x 开头');
  }

  return { rpcUrl, privateKey };
}

async function waitAndPrintReceipt({ tx, config, provider }) {
  console.log(`交易已发送，tx hash: ${tx.hash}`);

  const confirmations = Number(config.confirmations ?? 1);
  const receipt = await tx.wait(confirmations);
  if (!receipt) {
    throw new Error('交易回执为空');
  }

  const block = await provider.getBlock(receipt.blockNumber);
  const blockHash = block?.hash ?? receipt.blockHash ?? '未知';

  console.log(`交易已确认，区块高度: ${receipt.blockNumber}`);
  console.log(`区块哈希: ${blockHash}`);
  console.log(`确认数要求: ${confirmations}`);

  return receipt;
}

async function handleCreateTask({ rl, wallet, config, provider }) {
  const transportAddress = await resolveTransportAddress({ config, provider, wallet });
  const transportContract = new ethers.Contract(transportAddress, TRANSPORT_ABI, wallet);

  console.log(`已使用 Transport 合约地址: ${transportAddress}`);

  const payloadInput = await rl.question('请输入要上链的内容(支持 utf8 文本/0x十六进制): ');
  const payload = parsePayloadInput(payloadInput);

  const routeName = (await rl.question('请输入 routeName (例如 SEP): ')).trim();
  if (!routeName) {
    throw new Error('routeName 不能为空');
  }

  const taskTypeText = (await rl.question('请输入 taskType (uint256，例如 4): ')).trim();
  if (!/^\d+$/.test(taskTypeText)) {
    throw new Error('taskType 必须是非负整数');
  }
  const taskType = BigInt(taskTypeText);

  const feeEthText = (await rl.question('请输入手续费 fee(ETH，默认 0): ')).trim();
  const value = feeEthText ? ethers.parseEther(feeEthText) : 0n;

  const txOptions = {
    ...buildTxOptions(config),
    value
  };

  const tx = await transportContract.createTask(payload, routeName, taskType, txOptions);
  const receipt = await waitAndPrintReceipt({ tx, config, provider });

  try {
    const parsed = receipt.logs
      .map((log) => {
        try {
          return transportContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((item) => item && item.name === 'NewTransportTask');

    if (parsed) {
      console.log(`任务已创建，taskId: ${parsed.args.id.toString()}`);
      console.log(`任务 key: ${parsed.args.key}`);
    }
  } catch {
  }
}

async function handleGetBlockByTxHash({ rl, provider }) {
  const txHash = (await rl.question('请输入交易哈希: ')).trim();
  if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
    throw new Error('交易哈希格式无效');
  }

  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    console.log('交易未找到或尚未上链');
    return;
  }

  const block = await provider.getBlock(receipt.blockNumber);
  const blockHash = block?.hash ?? receipt.blockHash ?? '未知';

  console.log(`交易哈希: ${txHash}`);
  console.log(`区块高度: ${receipt.blockNumber}`);
  console.log(`区块哈希: ${blockHash}`);
}

async function handleGetBlockHeight(provider) {
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  console.log(`当前区块高度: ${blockNumber}`);
  console.log(`当前区块哈希: ${block?.hash ?? '未知'}`);
}

async function runInteractive() {
  const config = loadConfig();
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    console.log('欢迎使用 ETH Relayer 交互程序');
    console.log('每次启动都需要输入 RPC 节点和中继者私钥\n');

    const { rpcUrl, privateKey } = await askCredentials(rl);

    const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
    const provider = new Provider(rpcUrl, undefined, {
      staticNetwork: false,
      batchMaxCount: 1
    });

    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();
    console.log(`中继地址: ${address}`);

    // 打印当前交易参数配置，方便调试 (确保forceLegacy=true且使用gasPrice)
    try {
      const txOptionsDebug = buildTxOptions(config);
      console.log('当前交易参数:', txOptionsDebug);
    } catch (e) {
      console.warn('交易参数构造失败：', e.message);
    }

    while (true) {
      console.log('\n请选择操作:');
      console.log('1) 跨链任务上链 (createTask, 通过 Manager 解析 Transport 地址)');
      console.log('2) 查询当前区块高度与哈希');
      console.log('3) 根据交易哈希查询区块高度与哈希');
      console.log('4) 退出');

      const choice = (await rl.question('输入选项(1/2/3/4): ')).trim();

      if (choice === '1') {
        await handleCreateTask({ rl, wallet, config, provider });
      } else if (choice === '2') {
        await handleGetBlockHeight(provider);
      } else if (choice === '3') {
        await handleGetBlockByTxHash({ rl, provider });
      } else if (choice === '4') {
        console.log('已退出');
        break;
      } else {
        console.log('无效选项，请输入 1、2、3 或 4');
      }
    }
  } finally {
    rl.close();
  }
}


function runTest() {
  const config = loadConfig();
  const deployEnv = String(config.deployEnv ?? 'dev').trim();
  const managerFile = resolveAddressFilePath(config.managerAddressFile, deployEnv);

  if (config.managerAddress && isAddress(config.managerAddress)) {
    console.log(`Manager 地址配置检查通过: ${config.managerAddress}`);
  } else if (fs.existsSync(managerFile)) {
    const managerAddress = readAddressFromFile(managerFile);
    console.log(`Manager 地址文件检查通过: ${managerAddress}`);
  } else {
    throw new Error(`Manager 地址缺失，且地址文件不存在: ${managerFile}`);
  }

  console.log('配置检查通过');
}

async function main() {
  try {
    if (process.argv.includes('--reverse-execute')) {
      await runReverseExecuteFromArgs();
      return;
    }

    if (process.argv.includes('--test')) {
      runTest();
      return;
    }

    await runInteractive();
  } catch (error) {
    console.error(`执行失败: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
