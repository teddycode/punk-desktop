import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "hardhat";
import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "../address";
import {wallet, provider} from "../address"
import {poolManager, MyLiquidityProvider, hook, token0, token1} from "../address"
import { poolKey } from "../address"

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

async function killLimitOrder(contract:Contract, poolKey:PoolKey, tickLower:number, zeroForOne:boolean, to:string) {
    let tx = await contract.kill(poolKey, tickLower, zeroForOne, to);
    await tx.wait();
    console.log("kill successfully");
    //emit Kill(msg.sender, epoch, key, tickLower, zeroForOne, liquidity);
    // await contract.on("Kill", (owner, epoch, key, tickLower, zeroForOne, liquidity, event) => {
    //     console.log("Kill event emitted:");
    //     console.log("Owner: ", owner);
    //     console.log("Epoch: ", epoch.toString());
    //     console.log("Key: ", key);
    //     console.log("TickLower: ", tickLower.toString());
    //     console.log("ZeroForOne: ", zeroForOne);
    //     console.log("Liquidity: ", liquidity.toString());
    
    //     // Handle event here
    // });
}

async function placeLimitOrder(contract:Contract, poolKey:PoolKey, tickLower:number, zeroForOne:boolean, liquidity:number) {
    let tx = await contract.place(poolKey, tickLower, zeroForOne, liquidity);
    await tx.wait();
    console.log("limit order set successfully");

    await contract.on("Place", (owner, epoch, key, tickLower, zeroForOne, liquidity, event) => {
        console.log("Place event emitted:");
        console.log("Owner: ", owner);
        console.log("Epoch: ", epoch.toString());
        console.log("Key: ", key);
        console.log("TickLower: ", tickLower.toString());
        console.log("ZeroForOne: ", zeroForOne);
        console.log("Liquidity: ", liquidity.toString());
    
        // Handle event here
    });
}

async function withdrawLimitOrder(contract:Contract, epoch:number, to:string) {
    let tx = await contract.withdraw(epoch, to);
    await tx.wait();
    console.log("limit order withdraw successfully");
    await contract.on("Withdraw", (owner, epoch, liquidity, event) => {
        console.log("Withdraw event emitted:");
        console.log("Owner: ", owner);
        console.log("Epoch: ", epoch.toString());
        console.log("Liquidity: ", liquidity.toString());
    });
}

async function approveERC20(contract:Contract, toAddress: string, amount: ethers.BigNumber) {
    // 批准ERC20代币
    let tx = await contract.approve(toAddress, amount);
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}


async function main(){
    //approve ERC20 token to limitOrder
    await approveERC20(token0,hook.address,ethers.utils.parseUnits("21000000", 18))
    await approveERC20(token1,hook.address,ethers.utils.parseUnits("21000000", 18))

    //withdraw limit order after swap 
    let epoch = 1
    let to = wallet.address 
    withdrawLimitOrder(hook, epoch, to);
}
main()


