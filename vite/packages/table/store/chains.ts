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
  chainId: 1122334455,
  name: 'PunkOS Test Network',
  currency: 'PTH',
  explorerUrl: 'https://goerli.etherscan.io',
  rpcUrl: 'https://rpc.punkos.buaadcl.tech:18080',
};
export const sepolia: ChainNetInfo = {
  chainId: 11155111,
  name: 'Sepolia Test Network',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://11155111.rpc.thirdweb.com',
};
