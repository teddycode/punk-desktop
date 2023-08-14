import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "hardhat";
import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "../lib/address";
import {wallet, provider} from "../lib/address"
import {poolManager, MyLiquidityProvider, hook, token0, token1} from "../lib/address"
import {limitOrderPoolKey} from "../lib/address"

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

async function getSlot0(contract:Contract, poolKey: PoolKey) {
    let poolId = getPoolId(poolKey);
    
    console.log(`PoolId: ${poolId}`);
    let slot0 = await contract.getSlot0(poolId);
    console.log(`Returned slot0: ${JSON.stringify(slot0)}`);
    return slot0;
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
async function getPoolPrice(contract:Contract, poolKey: PoolKey): number {
    let slot0 = await getSlot0(contract, poolKey);
    const bigNumberValue = slot0[0].toString();
    //console.log("bigNumberValue:", bigNumberValue);
    const divisor = ethers.BigNumber.from(2).pow(96);
    //console.log("divisor:", divisor.toString());
    const dividedValue = slot0[0].div(divisor);
    //console.log("dividedValue:", dividedValue.toString());
    const result = dividedValue.mul(dividedValue);
    console.log("result:", result.toString());
    return result;
}

async function main(){
    // //设置pool参数
    // const DYNAMIC_FEE_FLAG = 0x800000;
    // let poolKey: PoolKey = {
    //     currency0: token0Address,
    //     currency1: token1Address,
    //     fee: DYNAMIC_FEE_FLAG,
    //     tickSpacing: 60,
    //     hooks:     hookAddress,
    // };
    // 添加流动性
    let modifyPositionParams: ModifyPositionParams = {
        tickLower: 45000, // lower price 90
        tickUpper: 46980, // upper price 110
        //liquidityDelta: 194868329805051412324060
        liquidityDelta: ethers.BigNumber.from('10000000000000000000000')// 10000token0 10000token1
        };
    //批准ERC20代币
    let slot0 = await getSlot0(poolManager, limitOrderPoolKey);

    //await approveERC20(token0,MyLiquidityProvider.address,ethers.utils.parseUnits("21000000", 18))
    //await approveERC20(token1,MyLiquidityProvider.address,ethers.utils.parseUnits("21000000", 18))
    //const hexValue = slot0[0];
    console.log(await getPoolPrice(poolManager, limitOrderPoolKey));


    

    //除2^96 然后开平方
    //const sqrtPriceX96 = ethers.BigNumber.from(hexValue).div(2**96).sqrt();
    // //打印
    //console.log ("sqrtPriceX96",sqrtPriceX96)
    // //const bigNumberValue = ethers.BigNumber.from(hexValue);
    // //const decimalValue = bigNumberValue.toString();
    // const slot0 = await getSlot0(poolManager, limitOrderPoolKey);
    //const number = ethers.BigNumber.from(100);
    //const result = bigNumberValue.mul(number);

    //添加流动性
    //await modifyPosition(MyLiquidityProvider, limitOrderPoolKey, modifyPositionParams);
}
main()

