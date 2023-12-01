// contractSetup.js
import { ethers } from 'ethers';
import { development } from './config';

import ethVaultArtifact from './abi/EthVault.json'; // Replace with the actual path
import erc20ShadowArtifact from './abi/VaultShadow.json';

// console.log(ethVaultArtifact.abi)

// Connect to the Ethereum provider
const provider_main = new ethers.providers.JsonRpcProvider(
  'https://goerli.infura.io/v3/b8feaebcfe234f0c83af0e97c070e5f5',
);
const provider_side = new ethers.providers.JsonRpcProvider(
  'https://goerli.infura.io/v3/b8feaebcfe234f0c83af0e97c070e5f5',
);

// Set up the wallets using the private key
const privateKey = '6d11059e1d517f6880f8c8bbdc7ba81ba407226708cd21507b9b854a4ce5b18d';
const wallet_main = new ethers.Wallet(privateKey, provider_main);
export const wallet_side = new ethers.Wallet(privateKey, provider_side);

// Initialize the contract instance
export const ethVault = new ethers.Contract(
  development.contracts.ethVaultOnMainChain,
  ethVaultArtifact.abi,
  wallet_main,
);
