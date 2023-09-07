// import { BigNumber, Contract } from "ethers";
// @ts-ignore
import {ethers} from "ethers";

//export this file to use in other files
export const conditionalTokensAddr = "0xD447a03FEfe94614917a25152D791cF8b49Aba4b";
export const ctHelperAddr = "0xb8fC250A0FD1097Ee5f037217DE2B8861B4695E5";
export const governTokenAddr = "0x68359Abd61dc29bB3c7405788e99BF692188dB26";
export const tokenPowerAddr = "0x11f660257c17F25B442aA97Bb2c0113cD5b3438a";
export const factoryAddr = "0x7aE5d234Cc497067cb01649A75A1c7420465d112";
export const reviewAddr = "0x8f7DF5F1aa0B1E35e8576FC207cb0d5FA06F9B56";
export const governanceAddr = "0x9a09327186135a1860423B89B00b91743fAaf3df";
export const executorAddr = "0x464ab90e0d9D33557B78BE476E8a18DB2293a5e5";
export const TargetAddr = "0xE1696f22a97FFF177447Bbaf8490A88787EA23A3";

const conditionalTokensAbi = require("./abi/market/ConditionalTokens.sol/ConditionalTokens.json").abi;
const ctHelperAbi = require("./abi/market/CTHelpers.sol/CTHelpers.json").abi;
const governTokenAbi = require("./abi/token/GovernToken.sol/GovernToken.json").abi;
const tokenPowerAbi = require("./abi/token/TokenPower.sol/TimeTokenPower.json").abi;
const factoryAbi = require("./abi/factory/VoteFactory.sol/VoteFactory.json").abi;
const reviewAbi = require("./abi/governance/Review.sol/Review.json").abi;
const governanceAbi = require("./abi/governance/Governance.sol/Governance.json").abi;
const executorAbi = require("./abi/governance/Executor.sol/Executor.json").abi;
const TargetAbi = require("./abi/target.sol/Target.json").abi;

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
export const Target = new ethers.Contract(TargetAddr,TargetAbi,wallet);
