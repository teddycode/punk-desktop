// import { BigNumber, Contract } from "ethers";
import { ethers } from 'ethers';

//export this file to use in other files
export const conditionalTokensAddr = '0x52e974A29aCe3759a9d81aA304a1e68EB13A3F54';
export const ctHelperAddr = '0x10FFE38b77991C535fdD2D1107968A7425c50CE4';
export const governTokenAddr = '0x886F379aB7872308d52f8204DA4b7A614A3F9f81';
export const tokenPowerAddr = '0x59a811896A41873E58F5F237FC6302Dc00148f57';
export const factoryAddr = '0x7C0100e730f85CCe18bCd09C3FE8E27195DF60B6';
export const reviewAddr = '0x906EeCadACE82b56D7F30b3C3B22Acb491457eD6';
export const governanceAddr = '0x35434437FDEF676F3b74810D523E34A110CBc8dA';
export const executorAddr = '0x022EadA8399B66C8f1CDcC68abbd0BeA87f45456';
export const TargetAddr = '0xc03645416e0CC718117F71fEaEa83d595C564f77';

import conditionalTokensAbi from './abi/market/ConditionalTokens.sol/ConditionalTokens.json';
import ctHelperAbi from './abi/market/CTHelpers.sol/CTHelpers.json';
import governTokenAbi from './abi/token/GovernToken.sol/GovernToken.json';
import tokenPowerAbi from './abi/token/TokenPower.sol/TimeTokenPower.json';
import factoryAbi from './abi/factory/VoteFactory.sol/VoteFactory.json';
import reviewAbi from './abi/governance/Review.sol/Review.json';
import governanceAbi from './abi/governance/Governance.sol/Governance.json';
import executorAbi from './abi/governance/Executor.sol/Executor.json';
import TargetAbi from './abi/target.sol/Target.json';

export const provider = new ethers.providers.JsonRpcProvider(
  'https://goerli.infura.io/v3/b8feaebcfe234f0c83af0e97c070e5f5',
);
export const wallet = new ethers.Wallet('6d11059e1d517f6880f8c8bbdc7ba81ba407226708cd21507b9b854a4ce5b18d', provider);
export const adminAddr = '0x437807Ec925c82eD00f9960d80C0de504c3640E5';
export const userAddr = '0x643AC6aFeFdC7E9E66648262C67247e1166946f9';
// export const provider = new ethers.providers.Web3Provider(window.ethereum);
// export const wallet = provider.getSigner()

export const conditionalTokens = new ethers.Contract(conditionalTokensAddr, conditionalTokensAbi.abi, wallet);
export const ctHelper = new ethers.Contract(ctHelperAddr, ctHelperAbi.abi, wallet);
export const governToken = new ethers.Contract(governTokenAddr, governTokenAbi.abi, wallet);
export const tokenPower = new ethers.Contract(tokenPowerAddr, tokenPowerAbi.abi, wallet);
export const factory = new ethers.Contract(factoryAddr, factoryAbi.abi, wallet);
export const review = new ethers.Contract(reviewAddr, reviewAbi.abi, wallet);
export const governance = new ethers.Contract(governanceAddr, governanceAbi.abi, wallet);
export const executor = new ethers.Contract(executorAddr, executorAbi.abi, wallet);
export const Target = new ethers.Contract(TargetAddr, TargetAbi.abi, wallet);
