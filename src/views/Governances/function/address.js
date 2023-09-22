// import { BigNumber, Contract } from "ethers";
// @ts-ignore
import {ethers} from "ethers";

//export this file to use in other files
export const conditionalTokensAddr = "0x6Bc8a795EAD1A713cDF69B78cdd7aFa810e66212";
export const ctHelperAddr = "0x68Bf42Ee4c703c4B285e701F1d18d488fc384419";
export const governTokenAddr = "0x483EaEb6614E534f4dC4B89081b32E74111a637a";
export const tokenPowerAddr = "0xA391C1CDf022B934359601b22Da181109bB10D37";
export const factoryAddr = "0x0818af0234209C87d3aB822C6D3c946fedE09c0B";
export const reviewAddr = "0x6A9886E69922B2CcC8b9f2BfCcF953C12a9a0e74";
export const governanceAddr = "0x86EaDE0E297f83568A44056A87e8FB2e75e51df2";
export const executorAddr = "0x2c74158B46b891c57A24e190CA0ccBDeDA1a87C7";
export const targetAddr = "0x11FDA58E1d06c2D2F9C243738FF6B0a3b25fD35A";
export const implementationAddr = "0x334d6716cf14E166C8c9e2c14641f8f858D6F0a3";

const conditionalTokensAbi = require("./abi/market/ConditionalTokens.sol/ConditionalTokens.json").abi;
const ctHelperAbi = require("./abi/market/CTHelpers.sol/CTHelpers.json").abi;
const governTokenAbi = require("./abi/token/GovernToken.sol/GovernToken.json").abi;
const tokenPowerAbi = require("./abi/token/TokenPower.sol/TimeTokenPower.json").abi;
const factoryAbi = require("./abi/factory/VoteFactory.sol/VoteFactory.json").abi;
const reviewAbi = require("./abi/governance/Review.sol/Review.json").abi;
const governanceAbi = require("./abi/governance/Governance.sol/Governance.json").abi;
const executorAbi = require("./abi/governance/Executor.sol/Executor.json").abi;
const targetAbi = require("./abi/target.sol/Target.json").abi;
const implementationAbi = require("./abi/factory/TimeTokenVote.sol/TimeTokenVote.json").abi;

export const provider = new ethers.providers.JsonRpcProvider('/api');
export const wallet = new ethers.Wallet("6d11059e1d517f6880f8c8bbdc7ba81ba407226708cd21507b9b854a4ce5b18d", provider)
export const adminAddr = "0x437807Ec925c82eD00f9960d80C0de504c3640E5";
export const userAddr = "0x643AC6aFeFdC7E9E66648262C67247e1166946f9";
// export const provider = new ethers.providers.Web3Provider(window.ethereum);
// export const wallet = provider.getSigner()


export const conditionalTokens = new ethers.Contract(conditionalTokensAddr,conditionalTokensAbi,wallet);
export const ctHelper = new ethers.Contract(ctHelperAddr,ctHelperAbi,wallet);
export const governToken = new ethers.Contract(governTokenAddr,governTokenAbi,wallet);
export const tokenPower = new ethers.Contract(tokenPowerAddr,tokenPowerAbi,wallet);
export const factory = new ethers.Contract(factoryAddr,factoryAbi,wallet);
export const review = new ethers.Contract(reviewAddr,reviewAbi,wallet);
export const governance = new ethers.Contract(governanceAddr,governanceAbi,wallet);
export const executor = new ethers.Contract(executorAddr,executorAbi,wallet);
export const target = new ethers.Contract(targetAddr,targetAbi,wallet);
export const implementation = new ethers.Contract(implementationAddr,implementationAbi,wallet);