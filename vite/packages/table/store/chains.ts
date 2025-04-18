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

// 以太坊sepolia测试网
// export const sepolia: ChainNetInfo = {
//   chainId: 11155111,
//   name: 'Sepolia',
//   currency: 'SepETH',
//   explorerUrl: 'https://sepolia.etherscan.io',
//   rpcUrl: 'https://sepolia.infura.io/v3/',
// };

// 磐古测试网
export const punkos: ChainNetInfo = {
  chainId: 20250226,
  name: 'PunkOS-XWK',
  currency: 'PUNK',
  explorerUrl: 'https://goerli.etherscan.io',
  rpcUrl: 'http://111.119.239.159:36054',
};

export const sepolia: ChainNetInfo = {
  chainId: 11155111,
  name: 'Sepolia Test Network',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://11155111.rpc.thirdweb.com',
};
