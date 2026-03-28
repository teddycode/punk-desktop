/**
 * 智能合约 Mock 数据
 * 包含以太坊主流智能合约信息
 */

export interface SmartContract {
  id: number;
  name: string;
  address: string;
  category: 'finance' | 'social' | 'game' | 'tool' | 'nft' | 'dao';
  description: string;
  logo: string;
  code: string;
  abi: string;
  bytecode: string;
  version: string;
  certificationLevel: number; // 1-5 星级认证
  visitCount: number;
  stakersCount: number;
  totalStaked: number; // PUNK
  stakingCap: number; // PUNK
  revenue: number; // PUNK
  relatedContracts: string[]; // 关联合约地址
  website?: string;
  github?: string;
  auditReports?: string[];
}

export const mockContracts: SmartContract[] = [
  // ========== 金融类 (Finance) ==========
  {
    id: 1,
    name: 'Uniswap V3 Router',
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    category: 'finance',
    description: 'Uniswap V3 核心路由合约，支持多跳交易和精确流动性管理',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    code: `// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';

contract SwapRouter is ISwapRouter, PeripheryImmutableState, PeripheryValidation {
    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountOut) {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"internalType":"address","name":"_factory","type":"address"}],"stateMutability":"nonpayable","type":"constructor"}]',
    bytecode: '0x60806040523480156200001157600080fd5b506040516200...',
    version: '1.0.0',
    certificationLevel: 5,
    visitCount: 2580000,
    stakersCount: 15420,
    totalStaked: 8500000,
    stakingCap: 10000000,
    revenue: 425000,
    relatedContracts: [
      '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Factory
      '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'  // Position Manager
    ],
    website: 'https://uniswap.org',
    github: 'https://github.com/Uniswap/v3-periphery',
    auditReports: ['https://uniswap.org/audit.pdf']
  },
  {
    id: 2,
    name: 'Aave Lending Pool',
    address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    category: 'finance',
    description: 'Aave V2 借贷池核心合约，支持存款、借款、清算等功能',
    logo: 'https://cryptologos.cc/logos/aave-aave-logo.png',
    code: `// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

contract LendingPool is VersionedInitializable, ILendingPool {
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external override {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"deposit","type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b50600436106101...',
    version: '2.0',
    certificationLevel: 5,
    visitCount: 1850000,
    stakersCount: 12380,
    totalStaked: 6800000,
    stakingCap: 8000000,
    revenue: 340000,
    relatedContracts: [
      '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d', // LendingPoolAddressesProvider
      '0x311Bb771e4F8952E6Da169b425E7e92d6Ac45756'  // ProtocolDataProvider
    ],
    website: 'https://aave.com',
    github: 'https://github.com/aave/protocol-v2',
    auditReports: ['https://aave.com/security']
  },
  {
    id: 3,
    name: 'Compound cETH',
    address: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    category: 'finance',
    description: 'Compound 协议 cETH 代币合约，代表存入的 ETH 份额',
    logo: 'https://cryptologos.cc/logos/compound-comp-logo.png',
    code: `// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

contract CEther is CToken {
    function mint() external payable {
        mintInternal(msg.value);
    }
    
    function redeem(uint redeemTokens) external returns (uint) {
        return redeemInternal(redeemTokens);
    }
}`,
    abi: '[{"constant":false,"inputs":[],"name":"mint","outputs":[],"payable":true,"type":"function"}]',
    bytecode: '0x6080604052348015600f57600080fd5b5060043610603c57...',
    version: '0.8.10',
    certificationLevel: 5,
    visitCount: 1250000,
    stakersCount: 8900,
    totalStaked: 4500000,
    stakingCap: 6000000,
    revenue: 225000,
    relatedContracts: [
      '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3b', // Comptroller
      '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e'  // cBAT
    ],
    website: 'https://compound.finance',
    github: 'https://github.com/compound-finance/compound-protocol'
  },
  {
    id: 4,
    name: 'Curve 3Pool',
    address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
    category: 'finance',
    description: 'Curve Finance 稳定币池，支持 DAI/USDC/USDT 低滑点交易',
    logo: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StableSwap3Pool {
    function exchange(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy
    ) external returns (uint256) {
        // Implementation
    }
}`,
    abi: '[{"name":"exchange","type":"function","inputs":[{"name":"i","type":"int128"}]}]',
    bytecode: '0x608060405234801561001057600080fd5b50611a2f806100...',
    version: '1.0.0',
    certificationLevel: 5,
    visitCount: 980000,
    stakersCount: 6750,
    totalStaked: 3200000,
    stakingCap: 5000000,
    revenue: 160000,
    relatedContracts: [
      '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46', // Curve Registry
      '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2'  // Curve Voter Proxy
    ],
    website: 'https://curve.fi',
    github: 'https://github.com/curvefi/curve-contract'
  },
  {
    id: 5,
    name: 'MakerDAO DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    category: 'finance',
    description: 'MakerDAO 稳定币 DAI 的 ERC20 合约',
    logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    code: `// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

contract Dai is DSToken {
    function mint(address guy, uint wad) external auth {
        _balances[guy] = add(_balances[guy], wad);
        _supply = add(_supply, wad);
    }
}`,
    abi: '[{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"mint","type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b5061042c806100...',
    version: '1.0.0',
    certificationLevel: 5,
    visitCount: 2100000,
    stakersCount: 18500,
    totalStaked: 9500000,
    stakingCap: 12000000,
    revenue: 475000,
    relatedContracts: [
      '0x5ef30b9986345249bc32d8928B7ee64DE9435E39', // MCD_JOIN_DAI
      '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7'  // MCD_POT
    ],
    website: 'https://makerdao.com',
    github: 'https://github.com/makerdao/dss'
  },

  // ========== NFT 类 ==========
  {
    id: 6,
    name: 'OpenSea Seaport',
    address: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
    category: 'nft',
    description: 'OpenSea Seaport 协议，支持高级 NFT 交易功能',
    logo: 'https://opensea.io/static/images/logos/opensea-logo.svg',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Seaport is ConsiderationInterface {
    function fulfillOrder(
        Order calldata order,
        bytes32 fulfillerConduitKey
    ) external payable returns (bool fulfilled) {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"components":[{"internalType":"address","name":"offerer","type":"address"}],"name":"order","type":"tuple"}],"name":"fulfillOrder","type":"function"}]',
    bytecode: '0x60806040523480156200001157600080fd5b5060405162003...',
    version: '1.5',
    certificationLevel: 5,
    visitCount: 3250000,
    stakersCount: 22000,
    totalStaked: 11000000,
    stakingCap: 15000000,
    revenue: 550000,
    relatedContracts: [
      '0x00000000000001ad428e4906aE43D8F9852d0dD6', // ConduitController
    ],
    website: 'https://opensea.io',
    github: 'https://github.com/ProjectOpenSea/seaport'
  },
  {
    id: 7,
    name: 'Azuki NFT',
    address: '0xED5AF388653567Af2F388E6224dC7C4b3241C544',
    category: 'nft',
    description: 'Azuki NFT 系列合约，热门 PFP 项目',
    logo: 'https://azuki.com/logo.png',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Azuki is ERC721A, Ownable {
    function mint(uint256 quantity) external payable {
        require(totalSupply() + quantity <= maxSupply);
        _safeMint(msg.sender, quantity);
    }
}`,
    abi: '[{"inputs":[{"internalType":"uint256","name":"quantity","type":"uint256"}],"name":"mint","type":"function"}]',
    bytecode: '0x60806040523480156200001157600080fd5b5060405162002...',
    version: '1.0.0',
    certificationLevel: 4,
    visitCount: 1680000,
    stakersCount: 9800,
    totalStaked: 5200000,
    stakingCap: 7000000,
    revenue: 260000,
    relatedContracts: [],
    website: 'https://azuki.com'
  },

  // ========== 游戏类 ==========
  {
    id: 8,
    name: 'Axie Infinity Core',
    address: '0xF5b0A3eFB8e8E4c201e2A935F110eAaF3FFEcb8d',
    category: 'game',
    description: 'Axie Infinity 核心游戏合约',
    logo: 'https://cryptologos.cc/logos/axie-infinity-axs-logo.png',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AxieCore {
    function breedAxies(
        uint256 _sireId,
        uint256 _matronId
    ) external payable returns (uint256) {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"name":"_sireId","type":"uint256"}],"name":"breedAxies","type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b5060405162001...',
    version: '2.0.0',
    certificationLevel: 4,
    visitCount: 1420000,
    stakersCount: 11200,
    totalStaked: 4800000,
    stakingCap: 6500000,
    revenue: 240000,
    relatedContracts: [
      '0x32950db2a7164aE833121501C797D79E7B79d74C', // Ronin Bridge
    ],
    website: 'https://axieinfinity.com',
    github: 'https://github.com/axieinfinity'
  },
  {
    id: 9,
    name: 'Decentraland LAND',
    address: '0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d',
    category: 'game',
    description: 'Decentraland 虚拟土地 NFT 合约',
    logo: 'https://cryptologos.cc/logos/decentraland-mana-logo.png',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LANDRegistry is ERC721 {
    function assignMultipleParcels(
        int[] x,
        int[] y,
        address beneficiary
    ) external onlyOwner {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"name":"x","type":"int256[]"}],"name":"assignMultipleParcels","type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b5060405162002...',
    version: '1.0.0',
    certificationLevel: 4,
    visitCount: 890000,
    stakersCount: 5600,
    totalStaked: 2800000,
    stakingCap: 4000000,
    revenue: 140000,
    relatedContracts: [
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', // MANA Token
    ],
    website: 'https://decentraland.org'
  },

  // ========== 社交类 ==========
  {
    id: 10,
    name: 'Lens Protocol Hub',
    address: '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d',
    category: 'social',
    description: 'Lens Protocol 核心合约，去中心化社交图谱',
    logo: 'https://lens.xyz/logo.png',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract LensHub is ERC721, ILensHub {
    function createProfile(DataTypes.CreateProfileData calldata vars)
        external
        override
        returns (uint256) {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"components":[{"name":"to","type":"address"}],"name":"vars","type":"tuple"}],"name":"createProfile","type":"function"}]',
    bytecode: '0x60806040523480156200001157600080fd5b5060405162003...',
    version: '1.0.0',
    certificationLevel: 4,
    visitCount: 750000,
    stakersCount: 4200,
    totalStaked: 2100000,
    stakingCap: 3000000,
    revenue: 105000,
    relatedContracts: [
      '0x4fbffF20302F3326B20052ab9C217C44F6480900', // FollowNFT
    ],
    website: 'https://lens.xyz',
    github: 'https://github.com/lens-protocol'
  },

  // ========== 工具类 ==========
  {
    id: 11,
    name: 'Chainlink Price Feed',
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    category: 'tool',
    description: 'Chainlink ETH/USD 价格预言机',
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
        // Implementation
    }
}`,
    abi: '[{"inputs":[],"name":"latestRoundData","outputs":[{"name":"roundId","type":"uint80"}],"type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b5060405162001...',
    version: '4.0.0',
    certificationLevel: 5,
    visitCount: 5200000,
    stakersCount: 28000,
    totalStaked: 15000000,
    stakingCap: 20000000,
    revenue: 750000,
    relatedContracts: [
      '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK Token
    ],
    website: 'https://chain.link',
    github: 'https://github.com/smartcontractkit/chainlink'
  },
  {
    id: 12,
    name: 'ENS Registry',
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    category: 'tool',
    description: 'Ethereum Name Service 域名注册合约',
    logo: 'https://cryptologos.cc/logos/ethereum-name-service-ens-logo.png',
    code: `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

contract ENSRegistry is ENS {
    function setRecord(
        bytes32 node,
        address owner,
        address resolver,
        uint64 ttl
    ) external virtual override {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"name":"node","type":"bytes32"}],"name":"setRecord","type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b5060405162002...',
    version: '1.0.0',
    certificationLevel: 5,
    visitCount: 3800000,
    stakersCount: 32000,
    totalStaked: 12000000,
    stakingCap: 16000000,
    revenue: 600000,
    relatedContracts: [
      '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85', // BaseRegistrar
      '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41'  // PublicResolver
    ],
    website: 'https://ens.domains',
    github: 'https://github.com/ensdomains'
  },
  {
    id: 13,
    name: 'Safe Multisig',
    address: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    category: 'tool',
    description: 'Gnosis Safe 多签钱包合约',
    logo: 'https://safe.global/logo.svg',
    code: `// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

contract GnosisSafe {
    function execTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation,
        uint256 safeTxGas,
        bytes memory signatures
    ) public payable virtual returns (bool success) {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"name":"to","type":"address"}],"name":"execTransaction","type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b5060405162003...',
    version: '1.3.0',
    certificationLevel: 5,
    visitCount: 2900000,
    stakersCount: 16500,
    totalStaked: 7500000,
    stakingCap: 10000000,
    revenue: 375000,
    relatedContracts: [
      '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2', // ProxyFactory
    ],
    website: 'https://safe.global',
    github: 'https://github.com/safe-global/safe-contracts'
  },

  // ========== DAO 类 ==========
  {
    id: 14,
    name: 'Uniswap Governance',
    address: '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
    category: 'dao',
    description: 'Uniswap DAO 治理合约',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    code: `// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

contract GovernorBravoDelegate {
    function propose(
        address[] memory targets,
        uint[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint) {
        // Implementation
    }
}`,
    abi: '[{"inputs":[{"name":"targets","type":"address[]"}],"name":"propose","type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b5060405162004...',
    version: '1.0.0',
    certificationLevel: 5,
    visitCount: 650000,
    stakersCount: 8900,
    totalStaked: 4200000,
    stakingCap: 6000000,
    revenue: 210000,
    relatedContracts: [
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI Token
    ],
    website: 'https://uniswap.org',
    github: 'https://github.com/Uniswap/governance'
  },
  {
    id: 15,
    name: 'Snapshot Voting',
    address: '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446',
    category: 'dao',
    description: 'Snapshot 链下投票合约',
    logo: 'https://snapshot.org/logo.png',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SnapshotDelegateRegistry {
    function setDelegate(bytes32 id, address delegate) external {
        delegations[msg.sender][id] = delegate;
    }
}`,
    abi: '[{"inputs":[{"name":"id","type":"bytes32"}],"name":"setDelegate","type":"function"}]',
    bytecode: '0x608060405234801561001057600080fd5b5060405162001...',
    version: '1.0.0',
    certificationLevel: 4,
    visitCount: 420000,
    stakersCount: 3500,
    totalStaked: 1800000,
    stakingCap: 2500000,
    revenue: 90000,
    relatedContracts: [],
    website: 'https://snapshot.org',
    github: 'https://github.com/snapshot-labs'
  }
];

// 按分类获取合约
export function getContractsByCategory(category?: string): SmartContract[] {
  if (!category) return mockContracts;
  return mockContracts.filter(c => c.category === category);
}

// 根据地址获取合约详情
export function getContractByAddress(address: string): SmartContract | undefined {
  return mockContracts.find(c => c.address.toLowerCase() === address.toLowerCase());
}

// 获取关联合约
export function getRelatedContracts(address: string): SmartContract[] {
  const contract = getContractByAddress(address);
  if (!contract) return [];
  
  return contract.relatedContracts
    .map(addr => getContractByAddress(addr))
    .filter(c => c !== undefined) as SmartContract[];
}
