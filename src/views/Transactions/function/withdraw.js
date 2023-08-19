import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "ethers";
import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "@/views/Transactions/function/address";
import {wallet, provider} from "@/views/Transactions/function/address"
import {poolManager, MyLiquidityProvider, hook, token0, token1} from "@/views/Transactions/function/address"
import { limitOrderPoolKey } from "@/views/Transactions/function/address"

async function withdrawLimitOrder(epoch, to) {
    let tx = await hook.withdraw(epoch, to);
    await tx.wait();
    console.log("limit order withdraw successfully");
    await hook.once("Withdraw", (owner, epoch, liquidity, event) => {
        console.log("Withdraw event emitted:");
        console.log("Owner: ", owner);
        console.log("Epoch: ", epoch.toString());
        console.log("Liquidity: ", liquidity.toString());
    });
}

export async function withdraw_main(epoch){
    // let epoch = 6
    let to = wallet.address
    await withdrawLimitOrder(epoch, to);
}
