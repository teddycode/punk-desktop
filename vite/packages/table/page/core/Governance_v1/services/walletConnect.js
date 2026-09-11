import { ethers } from 'ethers'
import { useWalletService } from '@table/composables/useWalletService'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@punkos/ethers5/vue'

const walletService = useWalletService()
let web3ModalAccount = null
let web3ModalProvider = null

const getWeb3ModalAccount = () => {
  if (!web3ModalAccount) {
    web3ModalAccount = useWeb3ModalAccount()
  }
  return web3ModalAccount
}

const getWeb3ModalProvider = () => {
  if (!web3ModalProvider) {
    web3ModalProvider = useWeb3ModalProvider()
  }
  return web3ModalProvider
}

const readWeb3ModalAccount = () => {
  if (!walletService.checkInitialized()) return null
  try {
    return getWeb3ModalAccount()
  } catch {
    return null
  }
}

export const shortAddress = (address) => {
  if (!address) return ''
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address
}

export const getWalletAccount = () => {
  const account = readWeb3ModalAccount()
  return {
    isConnected: Boolean(account?.isConnected?.value || walletService.isConnected.value),
    address: account?.address?.value || walletService.address.value || '',
    chainId: account?.chainId?.value || walletService.chainId.value || 0
  }
}

export const connectGovernanceWallet = async () => {
  if (!walletService.checkInitialized()) {
    await walletService.initWallet()
  }

  const current = getWalletAccount()
  if (current.isConnected && current.address) return current

  await walletService.openWallet()
  return getWalletAccount()
}

export const getGovernanceWalletProvider = async () => {
  const connected = await connectGovernanceWallet()
  if (!connected.address) return null
  return getWeb3ModalProvider().walletProvider.value || null
}

export const getGovernanceSigner = async () => {
  const walletProvider = await getGovernanceWalletProvider()
  if (!walletProvider) return null
  const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
  return ethersProvider.getSigner()
}
