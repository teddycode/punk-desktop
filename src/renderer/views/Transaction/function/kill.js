// @ts-ignore
import {wallet} from "@/views/Transaction/function/address"
import {hook, token0, token1} from "@/views/Transaction/function/address"
import {limitOrderPoolKey} from "@/views/Transaction/function/address"
import {calculateTickFromPriceWithSpacing} from "@/views/Transaction/function/cauculateliq"


async function killLimitOrder(contract, poolKey, tickLower, zeroForOne, to) {
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
export async function killLimitOrderFrontend(tokenup, tokendown, price, poolkey, myaddress){
    let tick = calculateTickFromPriceWithSpacing(price)
    let zeroForOne = tokenup < tokendown
    console.log("zeroForOne:" , zeroForOne)
    let tx = await hook.kill(poolkey, tick, zeroForOne, myaddress);
    await tx.wait();
    console.log("kill successfully");
}

// async function approveERC20(contract:Contract, toAddress: string, amount: ethers.BigNumber) {
//     // 批准ERC20代币
//     let tx = await contract.approve(toAddress, amount);
//     // 等待交易被挖矿
//     let receipt = await tx.wait();
//     console.log(`Transaction hash: ${receipt.transactionHash}`);
// }


// async function main(){
//     //approve ERC20 token to limitOrder
//     //await approveERC20(token0,hook.address,ethers.utils.parseUnits("21000000", 18))
//     //await approveERC20(token1,hook.address,ethers.utils.parseUnits("21000000", 18))
//
//     //kill limit order
//     // let ticklower = 46080
//     // let zeroforone = true
//     // await killLimitOrder(hook, limitOrderPoolKey, ticklower, zeroforone, wallets.address);
//     let price = 60
//     await killLimitOrderFrontend(token1.address,token0.address,price,limitOrderPoolKey,wallets.address)
// }
// main()


