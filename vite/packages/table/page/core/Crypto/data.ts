export const hashColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '位数',
    dataIndex: 'size',
    key: 'size',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '详情',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: '更新时间',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
  },
  {
    title: '操作',
    key: 'action',
  },
];
export const hashData = [
  {
    name: 'BLAKE2b',
    size: 512,
    version: '0.1.0',
    details: '高性能的密码学哈希函数，比SHA-3更快，支持可变输出长度',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'BLAKE2s',
    size: 256,
    version: '0.1.0',
    details: 'BLAKE2的32位优化版本，适用于小端设备和较短输出',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Keccak-256',
    size: 256,
    version: '0.1.0',
    details: '以太坊使用的哈希函数，基于海绵结构的SHA-3原始版本',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Keccak-512',
    size: 512,
    version: '0.1.0',
    details: 'Keccak算法的512位输出版本，提供更高的安全强度',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Poseidon-256',
    size: 256,
    version: '0.1.0',
    details: '专为零知识证明优化的哈希函数，在SNARK电路中效率极高',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'RIPEMD-160',
    size: 160,
    version: '0.1.0',
    details: '160位输出的密码学哈希函数，曾用于比特币地址生成',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Scrypt-256',
    size: 256,
    version: '0.1.0',
    details: '基于内存的密钥派生函数，抗ASIC攻击，常用于密码哈希',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'SHA-256',
    size: 256,
    version: '0.1.0',
    details: '广泛使用的SHA-2系列哈希函数，比特币和TLS的核心算法',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'SHA-512',
    size: 512,
    version: '0.1.0',
    details: 'SHA-2系列的512位版本，在64位平台上性能优异',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'SHA3-256',
    size: 256,
    version: '0.1.0',
    details: 'NIST标准的SHA-3哈希函数，基于Keccak但与其不同',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'SHA3-512',
    size: 512,
    version: '0.1.0',
    details: 'SHA-3系列的512位版本，提供最高级别的安全强度',
    lastUpdate: '2023-08-03',
  },
];
export const sigColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '详情',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: '更新时间',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
  },
];
export const sigData = [
  {
    name: 'BLS',
    type: '常规签名',
    version: '0.1.0',
    details: '基于椭圆曲线配对的数字签名方案，支持签名聚合和门限签名',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'ECDSA',
    type: '常规签名',
    version: '0.1.0',
    details: '椭圆曲线数字签名算法，广泛用于比特币等区块链系统',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'ECSchnorr',
    type: '常规签名',
    version: '0.1.0',
    details: '基于椭圆曲线的Schnorr签名，支持签名聚合和批量验证',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'EdDSA',
    type: '常规签名',
    version: '0.1.0',
    details: '爱德华曲线数字签名算法，具有高性能和安全性',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'SM2',
    type: '常规签名',
    version: '0.1.0',
    details: '中国商用密码标准的数字签名算法，基于椭圆曲线',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'BLS多重签名',
    type: '多重签名',
    version: '0.1.0',
    details: 'BLS签名的多重签名扩展，支持多方签名聚合',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'BLS门限签名',
    type: '门限签名',
    version: '0.1.0',
    details: 'BLS签名的门限版本，支持t-of-n门限签名方案',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Aigis',
    type: '后量子签名',
    version: '0.2.0',
    details: '基于Dilithium实现，优化公钥和签名大小的后量子数字签名算法',
    lastUpdate: '2025-09-25',
  },
  {
    name: 'Dilithium',
    type: '后量子签名',
    version: '0.2.0',
    details: 'NIST标准化的格基后量子数字签名算法',
    lastUpdate: '2025-09-25',
  },
  {
    name: 'ML_DSA',
    type: '后量子签名',
    version: '0.2.0',
    details: '符合NIST FIPS-204标准的基于模块格的数字签名标准',
    lastUpdate: '2025-09-25',
  },
  {
    name: 'SLH_DSA',
    type: '后量子签名',
    version: '0.2.0',
    details: '符合NIST FIPS-205的基于 SPHINCS+ 开发的哈希数字签名算法',
    lastUpdate: '2025-09-25',
  },

];
export const keyExchangeColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '详情',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: '更新时间',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
  },
];
export const keyExchangeData = [
  {
    name: 'DH',
    version: '0.1.0',
    details: 'Diffie-Hellman密钥交换协议，基于离散对数难题的经典密钥协商算法',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'ECDH',
    version: '0.1.0',
    details: '椭圆曲线Diffie-Hellman密钥交换，提供更高效的密钥协商',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Stealth Address',
    version: '0.1.0',
    details: '隐身地址技术，用于保护交易隐私的密钥派生机制',
    lastUpdate: '2023-08-03',
  },
];
export const commitmentColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '详情',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: '更新时间',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
  },
];
export const commitmentData = [
  {
    name: 'Hash 承诺',
    version: '0.1.0',
    details: '基于哈希函数的承诺方案，具有计算绑定和统计隐藏的特性',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Pedersen 承诺',
    version: '0.1.0',
    details: '基于椭圆曲线的承诺方案，具有完美隐藏和计算绑定的特性',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'KZG 多项式承诺',
    version: '0.1.0',
    details: '基于配对的多项式承诺方案，用于零知识证明系统',
    lastUpdate: '2023-08-03',
  },
  {
    name: '向量承诺',
    version: '0.1.0',
    details: '用于承诺向量数据的密码学方案，支持部分开放和验证',
    lastUpdate: '2023-08-03',
  },
];
export const secretSharingColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '详情',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: '更新时间',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
  },
];
export const secretSharingData = [
  {
    name: 'Shamir 秘密分享',
    version: '0.1.0',
    details: '基于多项式插值的t-of-n门限秘密分享方案',
    lastUpdate: '2023-08-03',
  },
  {
    name: '可验证秘密分享',
    version: '0.1.0',
    details: '在Shamir方案基础上增加了验证机制，防止恶意分发者',
    lastUpdate: '2023-08-03',
  },
  {
    name: '可公开验证秘密分享',
    version: '0.1.0',
    details: '任何人都可以验证分享份额正确性的秘密分享方案',
    lastUpdate: '2023-08-03',
  },
];
export const vrfColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '详情',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: '更新时间',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
  },
];
export const vrfData = [
  {
    name: 'ECVRF',
    version: '0.1.0',
    details: '椭圆曲线可验证随机函数，提供可公开验证的伪随机数生成',
    lastUpdate: '2023-08-03',
  },
];
export const vdfColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '详情',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: '更新时间',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
  },
];
export const vdfData = [
  {
    name: 'Pietrzak VDF',
    version: '0.1.0',
    details: '基于重复平方的可验证延迟函数，用于时间锁定和随机信标',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Wesolowski VDF',
    version: '0.1.0',
    details: '基于类群的可验证延迟函数，具有更短的证明长度',
    lastUpdate: '2023-08-03',
  },
];
export const zkpColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '详情',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: '更新时间',
    dataIndex: 'lastUpdate',
    key: 'lastUpdate',
  },
];
export const zkpData = [
  {
    name: 'DLEQ',
    type: '专用零知识证明',
    version: '0.1.0',
    details: '离散对数等价证明，用于证明知道多个离散对数的等价关系',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Pedersen 承诺零知识证明',
    type: '专用零知识证明',
    version: '0.1.0',
    details: '基于Pedersen承诺的零知识证明，用于隐藏数值的同时证明其性质',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'Caulk+',
    type: '专用零知识证明',
    version: '0.1.0',
    details: '用于大规模查找表的零知识证明系统，支持高效的成员关系证明',
    lastUpdate: '2023-08-03',
  },
  {
    name: 'zk-SNARKs',
    type: '通用零知识证明框架',
    version: '0.1.0',
    details: '零知识简洁非交互式知识证明，支持通用计算的隐私证明',
    lastUpdate: '2023-08-03',
  },
];
