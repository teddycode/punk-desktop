import { BigNumber, Contract } from "ethers";
// @ts-ignore
import { ethers } from "hardhat";
//export this file to use in other files
export const token0Address = "0x01e3C52AA1CdfaE2228A87bf18A408B18041E1A9"
export const token1Address =  "0x3ca6d0aa9a36cdA6869322e52caa0690398589b4"
export const hookAddress =  "0x9B6C21702e00fa2320989C5229b11B98F5819E21"
export const myliquidityProviderAddress =  "0xFC633551d65D134b3351814b1dB5628c8201056E"
export const poolmanagerAddress =  "0xFcB0388E07eDE5e457691915dee005A8b258C31b"

export const provider = new ethers.providers.JsonRpcProvider("http://10.130.157.196:3400");
export const wallet  = new ethers.Wallet("ba75c5fd16ae1151dc9f961e94e219994c6335a5b4148c624142243fb76306d6", provider)
//export const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
//export const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)

const poolmanagerAbi = require('../abi/PoolManager.json').abi;
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

//console.log(limitOrderPoolKey)