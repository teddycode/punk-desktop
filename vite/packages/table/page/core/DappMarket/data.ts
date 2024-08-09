export interface Dapp {
  id: number;
  title: string;
  description: string;
  chain: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  website: string;
  information: string;
  logo: string;
  images: string[];
  contracts: { name: string; address: string; }[];
}
export const userInfo = {
  uid: 1
}
export const dapps: Dapp[] = [
  {
    id: 6,
    title: 'Alien Worlds',
    description: '您可以收集和玩独特的数字项目。',
    chain: 'ETH',
    category: '游戏',
    createdAt: '2021-08-09 15:38:04',
    updatedAt: '2021-11-30 16:32:14',
    author: 'AlienWorlds Team',
    website: 'https://alienworlds.io',
    information: 'Alien Worlds 是定义 NFT 元宇宙，您可以在其中收集和玩独特的数字项目。它是唯一一个交叉计价的 ETH - WAX 项目，探索者可以通过玩游戏和参与 Planet DAO 来赚取或购买 NFT 和礼包。所有外星人世界的数字资产都在...',
    logo: 'https://gouhuo-1251775003.cos.ap-nanjing.myqcloud.com/media/4566f44fef32a6ae4d91df9ac5862c20.jpg',
    images: [
      'https://gouhuo-1251775003.cos.ap-nanjing.myqcloud.com/media/4566f44fef32a6ae4d91df9ac5862c20.jpg',
      'https://img0.baidu.com/it/u=924871919,1937938911&fm=253&fmt=auto&app=138&f=JPEG?w=1216&h=680'
    ],
    contracts: [
      { name: 'Alien Worlds Contract 1', address: '0x1234567890abcdef1234567890abcdef12345678' }
    ]
  },
  {
    id: 1,
    title: 'Sweat Economy',
    description: 'A next generation cryptocurrency that will bring the next billion people into Web 3.0.',
    chain: 'ETH',
    category: '金融',
    createdAt: '2022-01-20 11:22:10',
    updatedAt: '2022-03-10 14:22:34',
    author: 'Sweat Team',
    website: 'https://sweateconomy.io',
    information: 'Sweat Economy 是下一代加密货币，将把下一个十亿人带入 Web 3.0。',
    logo: 'https://img0.baidu.com/it/u=924871919,1937938911&fm=253&fmt=auto&app=138&f=JPEG?w=1216&h=680',
    images: [
      'https://img0.baidu.com/it/u=924871919,1937938911&fm=253&fmt=auto&app=138&f=JPEG?w=1216&h=680'
    ],
    contracts: [
      { name: 'Sweat Contract 1', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Sweat Contract 2', address: '0x1234567890abcdef1234567890abcdef12345678' }
    ]
  },
  {
    id: 2,
    title: 'Uniswap V3',
    description: 'Swap, earn, and build crypto trading protocol.',
    chain: 'ETH',
    category: '金融',
    createdAt: '2021-05-27 11:46:24',
    updatedAt: '2021-10-15 12:45:32',
    author: 'Uniswap Team',
    website: 'https://uniswap.org',
    information: 'Uniswap V3 是一个去中心化交易平台，用户可以在上面进行加密货币的交换、赚取收益，并且可以构建自己的交易协议。',
    logo: 'https://img0.baidu.com/it/u=924871919,1937938911&fm=253&fmt=auto&app=138&f=JPEG?w=1216&h=680',
    images: [
      'https://img0.baidu.com/it/u=924871919,1937938911&fm=253&fmt=auto&app=138&f=JPEG?w=1216&h=680'
    ],
    contracts: [
      { name: 'Uniswap Contract 1', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Uniswap Contract 2', address: '0x1234567890abcdef1234567890abcdef12345678' },
      { name: 'Uniswap Contract 3', address: '0xabcdef1234567890abcdef1234567890abcdef12' }
    ]
  },
  {
    id: 3,
    title: 'Splinterlands',
    description: 'Collectible trading card game.',
    chain: 'Hive',
    category: '游戏',
    createdAt: '2022-01-05 15:28:14',
    updatedAt: '2022-02-20 18:22:10',
    author: 'Splinterlands Team',
    website: 'https://splinterlands.io',
    information: 'Splinterlands 是一个可以收集和交易卡牌的游戏。',
    logo: 'https://img2.baidu.com/it/u=3751465784,2961894980&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=500',
    images: [
      'https://img2.baidu.com/it/u=3751465784,2961894980&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=500'
    ],
    contracts: []
  },
  {
    id: 4,
    title: 'Rarible',
    description: 'Explore the unexplored use cases for NFTs in Rarible.',
    chain: 'ETH',
    category: 'NFT',
    createdAt: '2021-04-11 09:17:52',
    updatedAt: '2021-12-05 10:15:45',
    author: 'Rarible Team',
    website: 'https://rarible.com',
    information: 'Rarible 是一个去中心化的 NFT 市场，用户可以在上面创建、出售和购买 NFT。',
    logo: 'https://gouhuo-1251775003.cos.ap-nanjing.myqcloud.com/media/4566f44fef32a6ae4d91df9ac5862c20.jpg',
    images: [
      'https://gouhuo-1251775003.cos.ap-nanjing.myqcloud.com/media/4566f44fef32a6ae4d91df9ac5862c20.jpg'
    ],
    contracts: [
      { name: 'Rarible Contract 1', address: '0x1234567890abcdef1234567890abcdef12345678' },
      { name: 'Rarible Contract 2', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 3', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 4', address: '0xabcdef1234567890abcdef1234567890abcdef12' }
    ]
  },
  {
    id: 5,
    title: 'PancakeSwap',
    description: 'The #1 AMM and yield farm on Binance Smart Chain.',
    chain: 'BSC',
    category: '金融',
    createdAt: '2021-03-15 08:12:47',
    updatedAt: '2021-09-25 11:30:20',
    author: 'PancakeSwap Team',
    website: 'https://pancakeswap.finance',
    information: 'PancakeSwap 是 Binance Smart Chain 上排名第一的自动化做市商（AMM）和收益农场。',
    logo: 'https://images.ali213.net/picfile/pic/2017/11/24/927_2017112451224843.jpg',
    images: [
      'https://images.ali213.net/picfile/pic/2017/11/24/927_2017112451224843.jpg'
    ],
    contracts: [
      { name: 'Rarible Contract 1', address: '0x1234567890abcdef1234567890abcdef12345678' },
      { name: 'Rarible Contract 2', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 3', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 4', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 1', address: '0x1234567890abcdef1234567890abcdef12345678' },
      { name: 'Rarible Contract 2', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 3', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 4', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 1', address: '0x1234567890abcdef1234567890abcdef12345678' },
      { name: 'Rarible Contract 2', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 3', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      { name: 'Rarible Contract 4', address: '0xabcdef1234567890abcdef1234567890abcdef12' }
    ]
  }
];
