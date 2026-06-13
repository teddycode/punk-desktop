import ParameterRegistryArtifact from '@governance-fronted/scripts/artifacts/contracts/ParameterRegistry.sol/ParameterRegistry.json'
import TreasuryArtifact from '@governance-fronted/scripts/artifacts/contracts/Treasury.sol/Treasury.json'
import UpgradeGovernanceArtifact from '@governance-fronted/scripts/artifacts/contracts/UpgradeGovernance.sol/UpgradeGovernance.json'
import UpgradeableCounterV2Artifact from '@governance-fronted/scripts/artifacts/contracts/mocks/UpgradeableCounterV2.sol/UpgradeableCounterV2.json'

export {
  ParameterRegistryArtifact,
  TreasuryArtifact,
  UpgradeGovernanceArtifact,
  UpgradeableCounterV2Artifact
}

export const hasGovernanceArtifacts = Boolean(
  ParameterRegistryArtifact?.abi &&
  TreasuryArtifact?.abi &&
  UpgradeGovernanceArtifact?.abi &&
  UpgradeableCounterV2Artifact?.abi
)
