import { ethers } from 'ethers'
import {
  ParameterRegistryArtifact,
  TreasuryArtifact,
  UpgradeGovernanceArtifact,
  UpgradeableCounterV2Artifact
} from './governanceArtifacts'
import {
  getGovernanceDeployment,
  getParameterRegistryAddress,
  getTreasuryAddress,
  getUpgradeGovernanceAddress,
  hasAddress
} from './deployment'

const getJsonRpcProvider = () => {
  const deployment = getGovernanceDeployment()
  return new ethers.providers.JsonRpcProvider(deployment.rpcUrl)
}

const getContract = (address, abi, signerOrProvider) => {
  if (!hasAddress(address)) return null
  return new ethers.Contract(address, abi, signerOrProvider || getJsonRpcProvider())
}

export const getParameterRegistryReadContract = () => (
  getContract(getParameterRegistryAddress(), ParameterRegistryArtifact.abi)
)

export const getParameterRegistryWriteContract = (signer) => (
  getContract(getParameterRegistryAddress(), ParameterRegistryArtifact.abi, signer)
)

export const getUpgradeGovernanceReadContract = () => (
  getContract(getUpgradeGovernanceAddress(), UpgradeGovernanceArtifact.abi)
)

export const getUpgradeGovernanceWriteContract = (signer) => (
  getContract(getUpgradeGovernanceAddress(), UpgradeGovernanceArtifact.abi, signer)
)

export const getTreasuryReadContract = () => (
  getContract(getTreasuryAddress(), TreasuryArtifact.abi)
)

export const getTreasuryWriteContract = (signer) => (
  getContract(getTreasuryAddress(), TreasuryArtifact.abi, signer)
)

export const getUpgradeableCounterV2Factory = (signer) => (
  new ethers.ContractFactory(
    UpgradeableCounterV2Artifact.abi,
    UpgradeableCounterV2Artifact.bytecode,
    signer
  )
)

export const encodeBytes32 = (value) => ethers.utils.formatBytes32String(String(value))
export const decodeBytes32 = (value) => ethers.utils.parseBytes32String(value)

export const getDeploymentStatus = () => ({
  parameterReady: hasAddress(getParameterRegistryAddress()),
  upgradeReady: hasAddress(getUpgradeGovernanceAddress()),
  treasuryReady: hasAddress(getTreasuryAddress())
})
