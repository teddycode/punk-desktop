import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "hardhat";
import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "../lib/address";
import {wallet, provider} from "../lib/address"
import {poolManager, MyLiquidityProvider, hook, token0, token1} from "../lib/address"
import {limitOrderPoolKey} from "../lib/address"


async function isdepolyed(address: string) {
    let code = await provider.getCode(address);
    if (code !== "0x") {
        console.log("The contract has been deployed.");
    } else {
        console.log("The contract has not been deployed.");
    }
}
async function checkAllowance(contract:Contract, ownerAddress: string, spenderAddress: string) {
    // Check the amount of tokens that an owner allowed to a spender
    let allowance = await contract.allowance(ownerAddress, spenderAddress);
    console.log(`Allowance: ${allowance.toString()}`);
}

async function getERC20Balance(contract:Contract, address: string) {
    // 查询ERC20余额
    let balance = await contract.balanceOf(address);
    console.log(`ERC20 Balance: ${balance.toString()}`);
}

async function transferERC20(contract:Contract, toAddress: string, amount: ethers.BigNumber) {
    // 转账ERC20代币
    let tx = await contract.transfer(toAddress, amount);
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}
async function approveERC20(contract:Contract, toAddress: string, amount: ethers.BigNumber) {
    // 批准ERC20代币
    let tx = await contract.approve(toAddress, amount);
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}
async function isapproved(contract:Contract, ownerAddress: string, spenderAddress: string, amount: ethers.BigNumber) {
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
async function main() {
    //查询是否已经部署
    await isdepolyed(token0.address);
    // 查询某个地址的ERC20余额
    await getERC20Balance(token0, wallet.address);
    // 转账ERC20代币
    let hhzaddress = "0x643AC6aFeFdC7E9E66648262C67247e1166946f9"
    await transferERC20(token0, hhzaddress, ethers.utils.parseUnits("1000000", 18)); // 这里的数量需要根据你的代币的小数位进行调整
    await transferERC20(token1, hhzaddress, ethers.utils.parseUnits("1000000", 18)); // 这里的数量需要根据你的代币的小数位进行调整
    //await approveERC20(token0, poolManager.address, ethers.utils.parseUnits("1000000", 18)); // 这里的数量需要根据你的代币的小数位进行调整
    //await isapproved(token0, wallet.address, poolManager.address, ethers.utils.parseUnits("10000000", 18)); // 这里的数量需要根据你的代币的小数位进行调整
    //console.log(a);
    // 再次查询余额
    //await getERC20Balance(contract, wallet.address);
}

main().catch(console.error);
