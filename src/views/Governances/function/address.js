// import { BigNumber, Contract } from "ethers";
// @ts-ignore
import {ethers} from "ethers";

//export this file to use in other files
export const conditionalTokensAddr = "0x905aE7B1090D38a90E6B5c8A9563f4B10Afd6eAA";
export const ctHelperAddr = "0xb8cC6fFec7dFEfaA46c65a3A3D388B2Fe92DBe3f";
export const governTokenAddr = "0x36f2870d09481dc594ED0EA16b58D798b372d142";
export const tokenPowerAddr = "0x870e82464b519903059624509abb17e38a00a6F6";
export const factoryAddr = "0x75716c4d00CbF4A3287F5368623C10B415B4ba4f";
export const reviewAddr = "0xc24B923dCF8e835C5327FE5b8ee791b8ca9544A0";
export const governanceAddr = "0x2D2d2f7Dd22a42db54de7F07d9fDAd0D5cC0aE47";
export const executorAddr = "0x0766351681868f3cb6ddf811b4F4Aaf49E12848c";
export const targetAddr = "0xcE507CaA18574F83bbd420C745FA639fC76c299B";
export const implementationAddr = "0x3F817f199d6617484DA609EA06d417280eac30DA";

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