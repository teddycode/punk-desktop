import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "hardhat";
import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "../lib/address";
import {wallet, provider} from "../lib/address"
import {poolManager, MyLiquidityProvider, hook, token0, token1} from "../lib/address"
import {limitOrderPoolKey} from "../lib/address"

async function transfereth(toAddress: string, amount: Number) {
    // 创建并发送交易
    let tx = await wallet.sendTransaction({
        to: toAddress,
        value: amount
    });
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
}
async function getBalance(address: string) {
    // 查询余额
    let balance = await provider.getBalance(address);
   //console.log(`Balance of ${address}: ${ethers.utils.formatEther(balance)};
    console.log(`Balance of ${address}: ${balance}`);
}
async function main() {
    // 查询某个地址的余额
    let address0 = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    let myaddress = wallet.address;
    await getBalance(myaddress);
    // 转账
    await transfereth(address0, 100);
    await getBalance(myaddress);
}

main().catch(console.error);
