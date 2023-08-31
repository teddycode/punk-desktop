// import { BigNumber, Contract } from "ethers";
// @ts-ignore
import {ethers} from "ethers";

//export this file to use in other files
export const token0Address = "0x19e8DdB00E1c132B6FC56c374FaAe87921538f05"
export const token1Address =  "0xDBB7ECEFE6a3526797C1465E8fabe69b4d638b83"
export const hookAddress = '0xBC9474B034d6eb39BdEcf912B058F697cA2eB300'
export const myliquidityProviderAddress =  "0xE251F565a1011B1271076f1643Bc7369a30e8e9A"
export const poolmanagerAddress =  "0xA96Ec4c2f26B35263fC9b9Bc633FD0F61940eE74"

const poolmanagerAbi = require('./abi/PoolManager.json').abi;
const erc20Abi = require('./abi/Token0.json').abi;
const myliquidityproviderAbi = require('./abi/MyLiquidityProvider.json').abi;
const hookAbi = require('./abi/LimitOrder.json').abi;

export const provider = new ethers.providers.JsonRpcProvider('/api');
export const wallet = new ethers.Wallet("6d11059e1d517f6880f8c8bbdc7ba81ba407226708cd21507b9b854a4ce5b18d", provider)

// export const provider = new ethers.providers.Web3Provider(window.ethereum);
// export const wallet = provider.getSigner()

// export let wallet = null;
// export let token0, token1, poolManager, MyLiquidityProvider, hook;


// export async function initialize() {
//     if (typeof window.ethereum !== 'undefined') {
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         await window.ethereum.request({ method: 'eth_requestAccounts' });
//         wallet = provider.getSigner();
//     } else {
//         console.error('无法获取您的metamask账户！请重试');
//         return;
//     }
//
//     token0 = new ethers.Contract(token0Address, erc20Abi, wallet);
//     token1 = new ethers.Contract(token1Address, erc20Abi, wallet);
//     poolManager = new ethers.Contract(poolmanagerAddress, poolmanagerAbi, wallet);
//     MyLiquidityProvider = new ethers.Contract(myliquidityProviderAddress, myliquidityproviderAbi, wallet);
//     hook = new ethers.Contract(hookAddress, hookAbi, wallet);
//
//     console.log('token0:', token0);
//     console.log('token1:', token1);
//     console.log('poolManager:', poolManager);
//     console.log('MyLiquidityProvider:', MyLiquidityProvider);
//     console.log('hook:',hook);
// }
export const token0 = new ethers.Contract(token0Address, erc20Abi, wallet);
export const token1 = new ethers.Contract(token1Address, erc20Abi, wallet);
export const poolManager = new ethers.Contract(poolmanagerAddress, poolmanagerAbi, wallet);
export const MyLiquidityProvider = new ethers.Contract(myliquidityProviderAddress, myliquidityproviderAbi, wallet);
export const hook = new ethers.Contract(hookAddress, hookAbi, wallet);
// const DYNAMIC_FEE_FLAG = 0x800000;
export let limitOrderPoolKey = {
    currency0: token0Address,
    currency1: token1Address,
    fee: 60,
    tickSpacing: 60,
    hooks:     hookAddress,
};

