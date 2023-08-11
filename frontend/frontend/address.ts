import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "hardhat";
//export this file to use in other files
export const token0Address = "0x520ce45DF6d14334257BFdD360a5C22B06E309c7"
export const token1Address =  "0xf3023593D14c860f05cCE109981CD65C479b01d1"
export const hookAddress =  "0x3971E0Ac098e633Ac132221297121Bee399bE56F"
export const myliquidityProviderAddress =  "0xB831c4456629CE48e4C3786Fb453Bf5ED36be2C3"
export const poolmanagerAddress =  "0xB067379bDF6C0f5012229C97f3862F827152370a"

export const provider = new ethers.providers.JsonRpcProvider("http://10.130.157.196:3400");
export const wallet  = new ethers.Wallet("ba75c5fd16ae1151dc9f961e94e219994c6335a5b4148c624142243fb76306d6", provider)

//export const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
//export const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)



const poolmanagerAbi = require('../abi/LimitOrder.json').abi;
const erc20Abi = require('../abi/Token0.json').abi;
const myliquidityproviderAbi = require('../abi/MyLiquidityProvider.json').abi;
const hookAbi = require('../abi/LimitOrder.json').abi;

export let token0 = new ethers.Contract(token0Address, erc20Abi, wallet);
export let token1 = new ethers.Contract(token1Address, erc20Abi, wallet);
export let poolManager = new ethers.Contract(poolmanagerAddress,poolmanagerAbi,wallet);
export let MyLiquidityProvider = new ethers.Contract(myliquidityProviderAddress,myliquidityproviderAbi,wallet);
export let hook = new ethers.Contract(hookAddress,hookAbi,wallet);

const DYNAMIC_FEE_FLAG = 0x800000;
export let limitOrderPoolKey = {
    currency0: token0Address,
    currency1: token1Address,
    fee: 60,
    tickSpacing: 60,
    hooks:     hookAddress,
};
// export let dynamicFeePoolKey = {
//     currency0: token0Address,
//     currency1: token1Address,
//     fee: DYNAMIC_FEE_FLAG,
//     tickSpacing: 60,
//     hooks:     hookAddressfee,
// }
