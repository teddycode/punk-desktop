import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "hardhat";
import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "../lib/address";
import {wallet, provider} from "../lib/address"
//import {poolManager, MyLiquidityProvider, hook, token0, token1} from "../address"
//import {limitOrderPoolKey} from "../address"

interface PoolKey {
    currency0: string;
    currency1: string;
    fee: number;
    tickSpacing: number;
    hooks: string;
}

interface SwapParams {
    zeroForOne: boolean;
    amountSpecified: number;
    sqrtPriceLimitX96: number;
}

interface ModifyPositionParams {
    tickLower: number;
    tickUpper: number;
    liquidityDelta: number;
}

async function isdepolyed(address) {
    let code = await provider.getCode(address);
    if (code !== "0x") {
        console.log(`The contract ${address} has been deployed.`);
    } else {
        console.log(`The contract ${address} has not been deployed. `);
    }
}

async function initialize(contract:Contract, key:PoolKey ,sqrtPriceX96) {
    let tick = await contract.initialize(key, sqrtPriceX96);
    console.log(`Returned tick: ${JSON.stringify(tick)}`);
}

async function approveERC20(contract:Contract, toAddress: string, amount: ethers.BigNumber) {
    // 批准ERC20代币
    let tx = await contract.approve(toAddress, amount);
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}

function getPoolId(poolKey: PoolKey): string {
    return ethers.utils.solidityKeccak256(
        ["bytes"],
        [ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint24", "int24", "address"],
            [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks]
        )]
    );
}

async function getSlot0(contract:Contract, poolKey: PoolKey) {
    let poolId = getPoolId(poolKey);
    console.log(`PoolId: ${poolId}`);
    let slot0 = await contract.getSlot0(poolId);
    console.log(`Returned slot0: ${JSON.stringify(slot0)}`);
}

async function getLiquidity(contract:Contract, poolKey: PoolKey) {
    let poolId = getPoolId(poolKey);
    console.log(`PoolId: ${poolId}`);
    //let liq0 = await contract.getLiquidity(poolId);
    let liq0 = await contract.functions['getLiquidity(bytes32)'](poolId);

    console.log(`Returned liquidity: ${liq0}`);
}

async function getERC20Balance(contract:Contract, address: string) {
    // 查询ERC20余额
    let balance = await contract.balanceOf(address);
    console.log(`ERC20 Balance: ${balance.toString()}`);
    return balance;
}

async function executeSwap(contract:Contract, poolKey:PoolKey, swapParams:SwapParams){
    
    // Set position parameters
    console.log("begin swap")
    let to0params = {
        tickLower: 840000, // lower price 0.5
        tickUpper: 876600, // upper price 1.5
        liquidityDelta: 0
    }
    let tx1 = await contract.setPositionParameters(poolKey, to0params);
    await tx1.wait();
    let tx2 = await contract.setSwapParameters(poolKey, swapParams);
    console.log("begin swap1")
    await tx2.wait();
    console.log("Position parameters set successfully");
    // swap
    let tx3 = await contract.executeSwap();
    await tx3.wait();
}

async function getETHBalance(address: string) {
    // 查询余额
    let balance = await provider.getBalance(address);
    console.log(`Balance of ${address}: ${balance.toString()}`);
}

// async function depolyContractwithwallet(contractName: string, params?: any): Promise<Contract> {
//     const Factory = await ethers.getContractFactory(contractName, wallet);
//     let contract;
//     if (params === undefined) {
//         contract = await Factory.deploy();
//     } else {
//         console.log(`params: ${JSON.stringify(params)}`);
//         contract = await Factory.deploy(params);
//         //打印交易信息
//         console.log(`Transaction hash: ${contract.deployTransaction.hash}`);
//     }
//     await contract.deployed();
//     console.log(`${contractName} deployed to ${contract.address}`);
//     return contract;
// }

async function depolyContractwithwallet(contractName: string, params?: any): Promise<Contract> {
    const Factory = await ethers.getContractFactory(contractName, wallet);
    let contract;

    if (params === undefined) {
        contract = await Factory.deploy();
    } else {
        //console.log(`params: ${JSON.stringify(params)}`);
        contract = await Factory.deploy(params);
    }

    // 打印交易信息
    //console.log('tx:', {
    //   data: contract.deployTransaction.data
    // });
    // console.log(`Transaction hash: ${contract.deployTransaction.hash}`);

    await contract.deployed();

    // console.log(`${contractName} deployed to: ${contract.address}`);
    return contract;
}

async function transfereth(toAddress: string, amount: BigNumber) {
    // 创建并发送交易
    let tx = await wallet.sendTransaction({
        to: toAddress,
        value: amount
    });
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}

async function main () {
    let token0: Contract;
    let token1: Contract;
    let token0Address: string;
    let token1Address: string;
    let poolManager: Contract;
    let MyLiquidityProvider: Contract;
    let hook:Contract


    //depoly the contract before all test cases
    //depoly erc20 token0 and token1
    token0 = await depolyContractwithwallet("Token0");
    token1 = await depolyContractwithwallet("Token1");
    const totalSupply0 = await token0.totalSupply();
    console.log(`Token0 deployed to ${token0.address} with an initial supply ${totalSupply0}`);
    //const totalSupply1 = await token1.totalSupply();
    //console.log(`Token1 deployed to ${token1.address} with an initial supply ${totalSupply1}`);
    await getERC20Balance(token0,wallet.address);
    await getERC20Balance(token1,wallet.address);
    token0Address = token0.address<token1.address?token0.address:token1.address;
    token1Address = token0.address>token1.address?token0.address:token1.address;
    //await isdepolyed(token0Address);
    //await isdepolyed(token1Address);

    //depoly poolManager
    console.log("begin depoly poolManager")
    poolManager = await depolyContractwithwallet("PoolManager", 88888888888);
    await isdepolyed(poolManager.address);
    console.log("PoolManager Contract deployed to:", poolManager.address);

    //depoly MyLiquidityProvider
    MyLiquidityProvider = await depolyContractwithwallet("MyLiquidityProvider", poolManager.address);
    await isdepolyed(MyLiquidityProvider.address);
    //console.log("MyContract deployed to:", MyLiquidityProvider.address);
    //await isdepolyed(MyLiquidityProvider.address);

    //depoly hook
    hook = await depolyContractwithwallet("LimitOrder", poolManager.address);
    await isdepolyed(hook.address);

    console.log("token0address = ",token0Address)
    console.log("token1address = ",token1Address)
    console.log("hookaddress = ",hook.address)
    console.log("myliquidityProvideraddress = ",MyLiquidityProvider.address)
    console.log("poolmanagerAddress = ",poolManager.address)

    }
    main();