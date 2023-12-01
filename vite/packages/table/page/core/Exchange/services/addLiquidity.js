// import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from 'ethers';
//import { token0Address, token1Address, hookAddress, myliquidityProviderAddress, poolmanagerAddress  } from "../lib/address";
import { MyLiquidityProvider, poolManager, token0, token1, wallet } from './address';
//import {limitOrderPoolKey} from "./address"
import { caculateLiqDetla, calculateTickFromPriceWithSpacing } from './cauculateliq';

async function modifyPosition(contract, poolKey, modifyPositionParams) {
  // Set position parameters
  let tx = await contract.setPositionParameters(poolKey, modifyPositionParams);
  await tx.wait();
  console.log('Position parameters set successfully');
  // Add liquidity
  tx = await contract.addLiquidity();
  await tx.wait();
}

async function approveERC20(contract, toAddress, amount) {
  // 批准ERC20代币
  let tx = await contract.approve(toAddress, amount);
  // 等待交易被挖矿
  let receipt = await tx.wait();
  console.log(`Transaction hash: ${receipt.transactionHash}`);
}

async function mygetSlot0(contract, poolKey) {
  console.log('wallets:', wallet);
  let poolId = getPoolId(poolKey);
  console.log(`PoolId: ${poolId}`);
  let slot0 = await poolManager.getSlot0(poolId);
  console.log(`Returned slot0: ${JSON.stringify(slot0)}`);
  return slot0;
}

function getPoolId(poolKey) {
  return ethers.utils.solidityKeccak256(
    ['bytes'],
    [
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'uint24', 'int24', 'address'],
        [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks],
      ),
    ],
  );
}

async function getPoolPrice(contract, poolKey) {
  let slot0 = await mygetSlot0(poolManager, poolKey);
  const bigNumberValue = slot0[0].toString();
  console.log('bigNumberValue:', bigNumberValue);
  const divisor = ethers.BigNumber.from(2).pow(96);
  console.log('divisor:', divisor.toString());
  const dividedValue = slot0[0].div(divisor);
  console.log('dividedValue:', dividedValue.toString());
  const result = dividedValue.mul(dividedValue);
  console.log('result:', result.toString());
  return result;
}

async function isapproved(contract, ownerAddress, spenderAddress, amount) {
  // Check the amount of tokens that an owner allowed to a spender
  let allowance = await contract.allowance(ownerAddress, spenderAddress);
  console.log(`Allowance: ${allowance.toString()}`);
  if (allowance >= amount) {
    return true;
  } else {
    return false;
  }
}

export async function addLiq(priceLower, priceUpper, amount0, amount1, poolKey) {
  console.log(poolKey);
  console.log(poolManager);

  let pricecur = await getPoolPrice(poolManager, poolKey);
  let liqdelta = caculateLiqDetla(priceLower, pricecur, priceUpper, amount0, amount1).toString();
  console.log(liqdelta);

  let lowertick = calculateTickFromPriceWithSpacing(priceLower, poolKey.tickSpacing);
  let uppertick = calculateTickFromPriceWithSpacing(priceUpper, poolKey.tickSpacing);
  let modifyPositionParams = {
    tickLower: lowertick,
    tickUpper: uppertick,
    liquidityDelta: ethers.BigNumber.from(liqdelta),
  };
  //检查ERC20代币余额是否足够
  // let balance0 = await token0.balanceOf(wallets.address);
  // let balance1 = await token1.balanceOf(wallets.address);
  //待完成
  //检查是否批准足够ERC20代币
  if (
    (await isapproved(token0, wallet.address, MyLiquidityProvider.address, ethers.utils.parseUnits('21000000', 18))) ===
    false
  ) {
    await approveERC20(token0, MyLiquidityProvider.address, ethers.utils.parseUnits('21000000', 18));
  }
  if (
    (await isapproved(token1, wallet.address, MyLiquidityProvider.address, ethers.utils.parseUnits('21000000', 18))) ===
    false
  ) {
    await approveERC20(token1, MyLiquidityProvider.address, ethers.utils.parseUnits('21000000', 18));
  }
  //添加流动性
  await modifyPosition(MyLiquidityProvider, poolKey, modifyPositionParams);
  return 0;
}
