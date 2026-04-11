"use strict";

/**
 * 质押 type=6 交易调试脚本。
 *
 * 用途：
 * - 验证本地私钥是否能正确构造并签名质押交易
 * - 验证节点是否支持发送和查询 type=6 交易
 *
 * 常用环境变量：
 * - PUNKOS_RPC_URL
 * - PUNKOS_CHAIN_ID
 * - PUNKOS_PRIVATE_KEY
 * - PUNKOS_EXPECTED_ADDRESS
 * - PUNKOS_STAKE_CONTRACT
 * - PUNKOS_DRY_RUN=1
 */

const assert = require("assert");
const { ethers } = require("ethers");

const DEFAULTS = Object.freeze({
    rpcUrl: "http://47.84.207.191:36056",
    chainId: 20260301,
    expectedAddress: "0x857fE492058E12BdE993D7Fd6D4aE6ca659c81d0",
    stakeContract: "0x5FcfE7D2aA7fd0f66Fbfe8bD50aDfa30E7D8f995",
    gasLimit: "0x100000",
    value: "0x0",
    stakedAmount: "0xDE0B6B3A7640000",
    stakedTime: 2,
    defaultFeeGwei: "1"
});

function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`missing required env: ${ name }`);
    }
    return value;
}

function getNumberEnv(name, fallback) {
    const value = process.env[name];
    if (value == null || value === "") {
        return fallback;
    }

    return Number(value);
}

function getAddressEnv(name, fallback) {
    const value = process.env[name];
    if (value == null || value === "") {
        return ethers.utils.getAddress(fallback);
    }
    return ethers.utils.getAddress(value);
}

function getBigNumberishEnv(name, fallback) {
    const value = process.env[name];
    if (value == null || value === "") {
        return fallback;
    }
    return value;
}

async function resolveFeeData(provider) {
    const envMaxPriorityFeePerGas = process.env.PUNKOS_MAX_PRIORITY_FEE_PER_GAS;
    const envMaxFeePerGas = process.env.PUNKOS_MAX_FEE_PER_GAS;

    if (envMaxPriorityFeePerGas && envMaxFeePerGas) {
        return {
            maxPriorityFeePerGas: ethers.BigNumber.from(envMaxPriorityFeePerGas),
            maxFeePerGas: ethers.BigNumber.from(envMaxFeePerGas)
        };
    }

    const feeData = await provider.getFeeData();
    if (feeData.maxPriorityFeePerGas && feeData.maxFeePerGas) {
        return {
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            maxFeePerGas: feeData.maxFeePerGas
        };
    }

    const gasPrice = await provider.getGasPrice().catch(() => null);
    if (gasPrice) {
        return {
            maxPriorityFeePerGas: gasPrice,
            maxFeePerGas: gasPrice
        };
    }

    const fallbackFee = ethers.utils.parseUnits(DEFAULTS.defaultFeeGwei, "gwei");
    return {
        maxPriorityFeePerGas: fallbackFee,
        maxFeePerGas: fallbackFee
    };
}

async function buildStakeDepositTransaction(wallet) {
    const provider = wallet.provider;
    const sender = await wallet.getAddress();
    const network = await provider.getNetwork();
    const feeData = await resolveFeeData(provider);

    const depositTx = {
        type: 6,
        chainId: network.chainId,
        nonce: await provider.getTransactionCount(sender, "pending"),
        to: getAddressEnv("PUNKOS_STAKE_CONTRACT", DEFAULTS.stakeContract),
        value: getBigNumberishEnv("PUNKOS_TX_VALUE", DEFAULTS.value),
        gasLimit: getBigNumberishEnv("PUNKOS_GAS_LIMIT", DEFAULTS.gasLimit),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas,
        data: "0x",
        deployerAddress: getAddressEnv("PUNKOS_DEPLOYER_ADDRESS", sender),
        investorAddress: getAddressEnv("PUNKOS_INVESTOR_ADDRESS", sender),
        beneficiaryAddress: getAddressEnv("PUNKOS_BENEFICIARY_ADDRESS", sender),
        stakedAmount: getBigNumberishEnv("PUNKOS_STAKED_AMOUNT", DEFAULTS.stakedAmount),
        stakedTime: getNumberEnv("PUNKOS_STAKED_TIME", DEFAULTS.stakedTime)
    };

    const signedTx = await wallet.signTransaction(depositTx);
    const parsedTx = ethers.utils.parseTransaction(signedTx);

    assert.equal(parsedTx.type, 6, "expected deposit tx type");
    assert.equal(parsedTx.chainId, depositTx.chainId, "unexpected chain id");
    assert.equal(parsedTx.to, depositTx.to, "unexpected deposit contract");
    assert.equal(parsedTx.from, sender, "unexpected signer address");
    assert.equal(parsedTx.deployerAddress, depositTx.deployerAddress, "unexpected deployerAddress");
    assert.equal(parsedTx.investorAddress, depositTx.investorAddress, "unexpected investorAddress");
    assert.equal(parsedTx.beneficiaryAddress, depositTx.beneficiaryAddress, "unexpected beneficiaryAddress");
    assert.ok(ethers.BigNumber.from(parsedTx.stakedAmount).eq(depositTx.stakedAmount), "unexpected stakedAmount");
    assert.equal(parsedTx.stakedTime, depositTx.stakedTime, "unexpected stakedTime");

    return { depositTx, parsedTx, signedTx, sender };
}

async function sendStakeDepositTransaction() {
    const rpcUrl = process.env.PUNKOS_RPC_URL || DEFAULTS.rpcUrl;
    const chainId = getNumberEnv("PUNKOS_CHAIN_ID", DEFAULTS.chainId);
    const privateKey = getRequiredEnv("PUNKOS_PRIVATE_KEY");
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
        name: "punkos-stake",
        chainId
    });
    const wallet = new ethers.Wallet(privateKey, provider);

    const expectedAddress = getAddressEnv("PUNKOS_EXPECTED_ADDRESS", DEFAULTS.expectedAddress);
    assert.equal(wallet.address, expectedAddress, "private key/address mismatch");

    const { depositTx, parsedTx, signedTx, sender } = await buildStakeDepositTransaction(wallet);

    console.log("network:", await provider.getNetwork());
    console.log("sender:", sender);
    console.log("stake contract:", depositTx.to);
    console.log("staked amount:", ethers.BigNumber.from(depositTx.stakedAmount).toString());
    console.log("staked time:", depositTx.stakedTime);
    console.log("type:", parsedTx.type);
    console.log("signed tx:", signedTx);

    if (process.env.PUNKOS_DRY_RUN === "1") {
        console.log("dry run only, transaction not sent");
        return;
    }

    const txResponse = await provider.sendTransaction(signedTx);
    console.log("tx hash:", txResponse.hash);

    const receipt = await txResponse.wait();
    assert.ok(receipt, "missing transaction receipt");
    assert.equal(receipt.status, 1, "deposit transaction failed");

    const fetchedTx = await provider.getTransaction(txResponse.hash);
    assert.ok(fetchedTx, "missing on-chain transaction");
    assert.equal(fetchedTx.type, 6, "unexpected on-chain tx type");
    assert.equal(fetchedTx.to, depositTx.to, "unexpected on-chain recipient");
    assert.equal(fetchedTx.from, sender, "unexpected on-chain sender");
    assert.equal(fetchedTx.deployerAddress, depositTx.deployerAddress, "unexpected on-chain deployerAddress");
    assert.equal(fetchedTx.investorAddress, depositTx.investorAddress, "unexpected on-chain investorAddress");
    assert.equal(fetchedTx.beneficiaryAddress, depositTx.beneficiaryAddress, "unexpected on-chain beneficiaryAddress");
    assert.ok(ethers.BigNumber.from(fetchedTx.stakedAmount).eq(depositTx.stakedAmount), "unexpected on-chain stakedAmount");
    assert.equal(fetchedTx.stakedTime, depositTx.stakedTime, "unexpected on-chain stakedTime");

    console.log("receipt status:", receipt.status);
    console.log("block number:", receipt.blockNumber);
}

sendStakeDepositTransaction().catch((error) => {
    console.error("stake deposit test failed");
    console.error(error);
    process.exitCode = 1;
});
