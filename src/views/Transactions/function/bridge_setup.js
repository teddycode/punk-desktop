// contractSetup.js
const { ethers } = require('ethers');
const config = require("./config");
const ethVaultArtifact = require(config.abiPath + 'EthVault.json'); // Replace with the actual path
const erc20ShadowArtifact = require(config.abiPath + 'VaultShadow.json');

// console.log(ethVaultArtifact.abi)

// Connect to the Ethereum provider
const provider_main = new ethers.providers.JsonRpcProvider('/api');
const provider_side = new ethers.providers.JsonRpcProvider('/api');

// Set up the wallet using the private key
const privateKey = "6d11059e1d517f6880f8c8bbdc7ba81ba407226708cd21507b9b854a4ce5b18d"
const wallet_main = new ethers.Wallet(privateKey, provider_main);
const wallet_side = new ethers.Wallet(privateKey, provider_side);

// Initialize the contract instance
const ethVault = new ethers.Contract(config.contracts.ethVaultOnMainChain, ethVaultArtifact.abi, wallet_main);

module.exports = {
    ethVault,
    erc20ShadowArtifact,
    wallet_side,
};
