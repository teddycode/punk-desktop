type ChainNetInfo = {
  chainId: number;
  name: string;
  currency: string;
  explorerUrl: string;
  rpcUrl: string;
};

export const mainnet: ChainNetInfo = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com',
};

export const arbitrum: ChainNetInfo = {
  chainId: 42161,
  name: 'Arbitrum',
  currency: 'ETH',
  explorerUrl: 'https://arbiscan.io',
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
};
// 以太坊测试网
export const goerli: ChainNetInfo = {
  chainId: 5,
  name: 'Goerli',
  currency: 'ETH',
  explorerUrl: 'https://goerli.etherscan.io',
  rpcUrl: 'https://endpoints.omniatech.io/v1/eth/goerli/public',
};

// 磐古测试网
export const punkos: ChainNetInfo = {
  chainId: 123456789,
  name: 'PunkOS Test Network',
  currency: 'ETH',
  explorerUrl: 'https://goerli.etherscan.io',
  rpcUrl: 'https://rpctest.byebyegfw.uk',
};
