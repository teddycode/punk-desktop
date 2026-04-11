import { tokens } from './config';
import { ethers } from 'ethers';
import erc20ShadowArtifact from './abi/VaultShadow.json';

import { ethVault, wallet_side } from './bridge_setup';

export async function deposit(chainId, token, amount, receiver) {
  // todo: chainId unused

  if (token === tokens.eth) {
    const input = ethers.utils.defaultAbiCoder.encode(['address'], [receiver]);
    const tx = await ethVault.deposit(input, { value: ethers.utils.parseEther(amount) });
    console.log(tx.hash);
  } else {
    console.log('');
  }
}

export async function burn(chainId, token, amount, receiver) {
  // todo: chainId unused

  const ethShadow = new ethers.Contract(token, erc20ShadowArtifact.abi, wallet_side);
  await ethShadow.approve(token, ethers.utils.parseEther(amount));
  const tx = await ethShadow.burn(receiver, ethers.utils.parseEther(amount));
  console.log('Burning transaction sent:', tx.hash);
}
