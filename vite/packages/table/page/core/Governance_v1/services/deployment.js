import { punkos } from '@store/chains'

export const GOVERNANCE_DEPLOYMENT_STORAGE_KEY = 'punkos.governance.deployment.v1'

const emptyAddress = ''

const defaultDeployment = {
  rpcUrl: punkos.rpcUrl,
  parameter: {
    paramRegistry: emptyAddress,
    parameterMap: {}
  },
  upgrade: {
    upgradeGovernance: emptyAddress,
    proxy: emptyAddress,
    newImplementation: emptyAddress
  },
  treasury: {
    treasury: emptyAddress
  }
}

const isObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value))

const mergeDeployment = (base, override) => {
  if (!isObject(override)) return base
  const treasuryOverride = typeof override.treasury === 'string'
    ? { treasury: override.treasury }
    : (override.treasury || {})

  return {
    ...base,
    ...override,
    parameter: {
      ...base.parameter,
      ...(override.parameter || {}),
      parameterMap: {
        ...base.parameter.parameterMap,
        ...(override.parameterMap || {}),
        ...(override.parameter?.parameterMap || {})
      }
    },
    upgrade: {
      ...base.upgrade,
      ...(override.upgrade || {})
    },
    treasury: {
      ...base.treasury,
      ...treasuryOverride
    }
  }
}

const readJson = (value) => {
  if (!value) return {}
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

const readWindowDeployment = () => {
  if (typeof window === 'undefined') return {}
  return window.__PUNK_GOVERNANCE_DEPLOYMENT__ || {}
}

const readStoredDeployment = () => {
  if (typeof window === 'undefined') return {}
  return readJson(window.localStorage?.getItem(GOVERNANCE_DEPLOYMENT_STORAGE_KEY))
}

export const getGovernanceDeployment = () => (
  mergeDeployment(
    mergeDeployment(defaultDeployment, readWindowDeployment()),
    readStoredDeployment()
  )
)

export const hasAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address || '')

export const getParameterRegistryAddress = () => {
  const deployment = getGovernanceDeployment()
  return deployment.parameter.paramRegistry || deployment.paramRegistry || emptyAddress
}

export const getUpgradeGovernanceAddress = () => {
  const deployment = getGovernanceDeployment()
  return deployment.upgrade.upgradeGovernance || deployment.upgradeGovernance || emptyAddress
}

export const getTreasuryAddress = () => {
  const deployment = getGovernanceDeployment()
  return deployment.treasury.treasury || deployment.treasuryAddress || emptyAddress
}
