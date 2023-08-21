// @ts-ignore
import { ethers } from "ethers";
import {wallet} from "@/views/Transactions/function/address"
import {poolManager, hook, token0, token1} from "@/views/Transactions/function/address"
import { limitOrderPoolKey } from "@/views/Transactions/function/address"
import {caculateLiqDetla2,calculateTickFromPriceWithSpacing,calculatePriceFromTick} from "@/views/Transactions/function/cauculateliq"
import Big from "big.js";


async function killLimitOrder(contract, poolKey, tickLower, zeroForOne, to) {
    let tx = await contract.kill(poolKey, tickLower, zeroForOne, to);
    await tx.wait();
    console.log("kill successfully");
    //emit Kill(msg.sender, epoch, key, tickLower, zeroForOne, liquidity);
    await contract.on("Kill", (owner, epoch, key, tickLower, zeroForOne, liquidity, event) => {
        console.log("Kill event emitted:");
        console.log("Owner: ", owner);
        console.log("Epoch: ", epoch.toString());
        console.log("Key: ", key);
        console.log("TickLower: ", tickLower.toString());
        console.log("ZeroForOne: ", zeroForOne);
        console.log("Liquidity: ", liquidity.toString());
        // Handle event here
    });
}

async function placeLimitOrder(contract, poolKey, tickLower, zeroForOne, liquidity) {
    let tx = await contract.place(poolKey, tickLower, zeroForOne, liquidity);
    await tx.wait();
    console.log("成功设置限价订单");

    let eventResult = await new Promise((resolve, reject) => {
        contract.once("Place", (owner, epoch, key, tickLower, zeroForOne, liquidity, event) => {
            let resultData = {
                owner: owner,
                epoch: epoch.toString(),
                key: key,
                tickLower: tickLower.toString(),
                zeroForOne: zeroForOne,
                liquidity: liquidity.toString()
            };
            resolve(resultData); // 返回整个数据对象
        });
    });
    return eventResult.epoch;
}

async function withdrawLimitOrder(contract, epoch, to) {
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

async function approveERC20(contract, toAddress, amount) {
    // 批准ERC20代币
    let tx = await contract.approve(toAddress, amount);
    // 等待交易被挖矿
    let receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
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
export async function placeLimitOrderFrontend(poolkey,price,tokenup,tokendown,amount0){
    let zeroForOne = tokenup < tokendown;
    console.log(zeroForOne)
    let tick = calculateTickFromPriceWithSpacing(price);
    //检查ERC20代币余额是否足够
    //let balance0 = await token0.balanceOf(wallet.address);
    //let balance1 = await token1.balanceOf(wallet.address);
    //待完成
    //检查是否批准足够ERC20代币
    if(await isapproved(token0, wallet.address, hook.address, ethers.utils.parseUnits("21000000", 18))===false){
        await approveERC20(token0,hook.address,ethers.utils.parseUnits("21000000", 18))
    }
    if(await isapproved(token1, wallet.address, hook.address, ethers.utils.parseUnits("21000000", 18))===false){
        await approveERC20(token1,hook.address,ethers.utils.parseUnits("21000000", 18))
    }
    //place limit order
    let pricecur = await getPoolPrice(poolManager, poolkey);
    console.log("cur:",pricecur)

    if(pricecur>price && zeroForOne===true){console.log("price is too low");return 1;}
    if(pricecur<price && zeroForOne===false){console.log("price is too high");return 1;}
    let liquidity = "0"
    console.log("pricecur:",pricecur.toString())
    if(zeroForOne===true)
    {
        liquidity = caculateLiqDetla2(price,pricecur,calculatePriceFromTick(tick+poolkey.tickSpacing),amount0,0).toString();
    }
    else{
        liquidity = caculateLiqDetla2(calculatePriceFromTick(tick-poolkey.tickSpacing),pricecur,price,0,amount0).toString();
    }
    console.log("liquidity:",liquidity)
    let epoch = await placeLimitOrder(hook, poolkey, tick, zeroForOne,liquidity);
    console.log("epochfront:",epoch)
    return epoch;
}
async function getSlot0(contract, poolKey) {
    let poolId = getPoolId(poolKey);

    console.log(`PoolId: ${poolId}`);
    let slot0 = await contract.getSlot0(poolId);
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
async function getPoolPrice(contract, poolKey) {
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
async function getERC20Balance(contract, address) {
    // 查询ERC20余额
    let balance = await contract.balanceOf(address);
    console.log(`ERC20 Balance: ${balance.toString()}`);
    return balance;
}



