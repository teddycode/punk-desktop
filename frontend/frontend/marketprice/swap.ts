import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "hardhat";
import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "../address";
import {wallet, provider} from "../address"
import {poolManager, MyLiquidityProvider, hook, token0, token1} from "../address"
import {poolKey} from "../address"

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

async function modifyPosition(contract:Contract, poolKey:PoolKey, modifyPositionParams:ModifyPositionParams) {
    // Set position parameters
    let tx = await contract.setPositionParameters(poolKey, modifyPositionParams);
    await tx.wait();
    console.log("Position parameters set successfully");
    // Add liquidity
    tx = await contract.addLiquidity();
    await tx.wait();
}

async function approveERC20(contract:Contract, toAddress: string, amount: ethers.BigNumber) {
    // 批准ERC20代币
    let tx = await contract.approve(toAddress, amount);
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
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

async function main(){
    //批准ERC20代币
    await approveERC20(token0,MyLiquidityProvider.address,ethers.utils.parseUnits("21000000", 18))
    await approveERC20(token1,MyLiquidityProvider.address,ethers.utils.parseUnits("21000000", 18))
    //设置参数
    let sqrtpricelimit=ethers.BigNumber.from('7922816251426433759354395033600')//price = 10000
    let amountswap = ethers.BigNumber.from('123456789101112134')
    let swapParams = {
        zeroForOne: false,
        amountSpecified: amountswap,
        sqrtPriceLimitX96: sqrtpricelimit
    }
    //执行交易
    console.log("begin swap")
    await executeSwap(MyLiquidityProvider, poolKey, swapParams);
    console.log("end swap")
}
main()


