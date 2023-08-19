
// @ts-ignore
import { ethers } from "ethers";
// import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "@/views/Transactions/function/address";
import {wallet} from "@/views/Transactions/function/address"
import {MyLiquidityProvider, token0, token1} from "@/views/Transactions/function/address"


async function approveERC20(contract, toAddress, amount) {
    // 批准ERC20代币
    let tx = await contract.approve(toAddress, amount);
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}

async function executeSwap(contract, poolKey, swapParams){

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
async function isapproved(contract, ownerAddress, spenderAddress, amount) {
    // Check the amount of tokens that an owner allowed to a spender
    let allowance = await contract.allowance(ownerAddress, spenderAddress);
    console.log(`Allowance: ${allowance.toString()}`);
    if (allowance >= amount) {
        return true;
    }
    else {
        return false;
    }

}

export async function swap(poolkey, fromamount ,zeroForOne){
    let sqrtPriceLimitX96 = zeroForOne?ethers.BigNumber.from('79228162514264337593543950336'):ethers.BigNumber.from('7922816251426433759354395033600');
    console.log("sqrtPriceLimitX96:",sqrtPriceLimitX96.toString())
    let swapParams = {
        zeroForOne: zeroForOne,
        amountSpecified: fromamount,
        sqrtPriceLimitX96: sqrtPriceLimitX96
    }
    //检查ERC20代币余额是否足够
    let balance0 = await token0.balanceOf(wallet.address);
    let balance1 = await token1.balanceOf(wallet.address);
    //待完成
    //检查是否批准足够ERC20代币
    if(await isapproved(token0, wallet.address, MyLiquidityProvider.address, ethers.utils.parseUnits("21000000", 18))===false){
        await approveERC20(token0,MyLiquidityProvider.address,ethers.utils.parseUnits("21000000", 18))
    }
    if(await isapproved(token1, wallet.address, MyLiquidityProvider.address, ethers.utils.parseUnits("21000000", 18))===false){
        await approveERC20(token1,MyLiquidityProvider.address,ethers.utils.parseUnits("21000000", 18))
    }
    //执行交易
    await executeSwap(MyLiquidityProvider, poolkey, swapParams);
    console.log("finish swap");
}

