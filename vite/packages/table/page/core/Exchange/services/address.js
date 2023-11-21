// import { BigNumber, Contract } from "ethers";
// @ts-ignore
import {ethers} from "ethers";

//export this file to use in other files
export const token0Address = "0x19e8DdB00E1c132B6FC56c374FaAe87921538f05"
export const token1Address = "0xDBB7ECEFE6a3526797C1465E8fabe69b4d638b83"
export const hookAddress = '0xBC9474B034d6eb39BdEcf912B058F697cA2eB300'
export const myliquidityProviderAddress = "0xE251F565a1011B1271076f1643Bc7369a30e8e9A"
export const poolmanagerAddress = "0xA96Ec4c2f26B35263fC9b9Bc633FD0F61940eE74"

import poolmanagerAbi from './abi/PoolManager.json';
import erc20Abi from './abi/Token0.json';
import myliquidityproviderAbi from './abi/MyLiquidityProvider.json';
import hookAbi from './abi/LimitOrder.json';

// TODO please check your provider url.
export const provider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/b8feaebcfe234f0c83af0e97c070e5f5');
export const wallet = new ethers.Wallet("6d11059e1d517f6880f8c8bbdc7ba81ba407226708cd21507b9b854a4ce5b18d", provider)

// export const provider = new ethers.providers.Web3Provider(window.ethereum);
// export const wallets = provider.getSigner()

// export let wallets = null;
// export let token0, token1, poolManager, MyLiquidityProvider, hook;


// export async function initialize() {
//     if (typeof window.ethereum !== 'undefined') {
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         await window.ethereum.request({ method: 'eth_requestAccounts' });
//         wallets = provider.getSigner();
//     } else {
//         console.error('无法获取您的metamask账户！请重试');
//         return;
//     }
//
//     token0 = new ethers.Contract(token0Address, erc20Abi, wallets);
//     token1 = new ethers.Contract(token1Address, erc20Abi, wallets);
//     poolManager = new ethers.Contract(poolmanagerAddress, poolmanagerAbi, wallets);
//     MyLiquidityProvider = new ethers.Contract(myliquidityProviderAddress, myliquidityproviderAbi, wallets);
//     hook = new ethers.Contract(hookAddress, hookAbi, wallets);
//
//     console.log('token0:', token0);
//     console.log('token1:', token1);
//     console.log('poolManager:', poolManager);
//     console.log('MyLiquidityProvider:', MyLiquidityProvider);
//     console.log('hook:',hook);
// }
export const token0 = new ethers.Contract(token0Address, erc20Abi.abi, wallet);
export const token1 = new ethers.Contract(token1Address, erc20Abi.abi, wallet);
export const poolManager = new ethers.Contract(poolmanagerAddress, poolmanagerAbi.abi, wallet);
export const MyLiquidityProvider = new ethers.Contract(myliquidityProviderAddress, myliquidityproviderAbi.abi, wallet);
export const hook = new ethers.Contract(hookAddress, hookAbi.abi, wallet);
// const DYNAMIC_FEE_FLAG = 0x800000;
export let limitOrderPoolKey = {
  currency0: token0Address,
  currency1: token1Address,
  fee: 60,
  tickSpacing: 60,
  hooks: hookAddress,
};

