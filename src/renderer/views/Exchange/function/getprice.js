// @ts-ignore
//import { ethers } from "hardhat";
import {ethers} from "ethers";
import {poolManager} from "./address";
import Big from 'big.js';

async function getSlot0(poolKey) {
    let poolId = getPoolId(poolKey);
    console.log(`PoolId: ${poolId}`);
    let slot0 = await poolManager.getSlot0(poolId);
    console.log(`Returned slot0: ${JSON.stringify(slot0)}`);
    return slot0;
}

function getPoolId(poolKey) {
    return ethers.utils.solidityKeccak256(
        ["bytes"],
        [ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint24", "int24", "address"],
            [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks]
        )]
    );
}

export async function getPoolPrice(contract, poolKey) {
    let slot0 = await getSlot0(contract, poolKey);
    const bigNumberValue = slot0[0].toString();
    console.log("bigNumberValue:", bigNumberValue);

    // 使用 Big.js
    const valueBig = new Big(bigNumberValue);
    const divisor = new Big(2).pow(96);
    console.log("divisor:", divisor.toString());

    const dividedValue = valueBig.div(divisor);
    console.log("dividedValue:", dividedValue.toString());

    const result = dividedValue.mul(dividedValue);
    console.log("result:", result.toString());

    return result.toNumber(); // 注意，转换回数字可能导致精度丢失，如果这是一个问题，您可能需要返回字符串或Big对象
}

