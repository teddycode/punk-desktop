# Web3Modal 网络支持问题深度分析与修复

## 问题描述

使用 `@punkos/ethers5` v3.5.3 时，在网络选择界面中：
- ✅ **Sepolia** 和 **Ethereum** 网络正常显示（有颜色，可选择）
- ❌ **PunkOS-XWK** 和 **Arbitrum** 网络显示为灰色（不可选择）

修改后出现新问题：
- ❌ 除了 PunkOS 链，其他链的图标都无法显示
- ❌ PunkOS 仍然处于无法选择状态

## 深度原因分析

### 1. Web3Modal 网络渲染机制

#### 1.1 网络数据流转过程

```
用户配置(chains) 
  ↓
syncRequestedNetworks() - 转换为 CaipNetwork 格式
  ↓
NetworkController.setRequestedCaipNetworks()
  ↓
UI渲染(w3m-networks-view)
  ↓
检查 disabled 状态和图片资源
```

#### 1.2 CaipNetwork 对象结构

```typescript
interface CaipNetwork {
  id: string;              // 格式: "eip155:1"
  name: string;            // 网络名称
  imageId?: string;        // WalletConnect CDN 图片ID
  imageUrl?: string;       // 直接图片URL
}
```

#### 1.3 图片加载优先级

在 `AssetUtil.getNetworkImage()` 中：

```typescript
getNetworkImage(network?: CaipNetwork) {
  // 优先级1: 直接URL (chainImages 配置)
  if (network?.imageUrl) {
    return network?.imageUrl;
  }
  
  // 优先级2: WalletConnect CDN (从 PresetsUtil 获取)
  if (network?.imageId) {
    return AssetController.state.networkImages[network.imageId];
  }
  
  return undefined;
}
```

### 2. 网络禁用逻辑

在 `w3m-networks-view/index.ts` 第99行：

```typescript
.disabled=${!supportsAllNetworks && !approvedIds?.includes(network.id)}
```

**禁用条件：**
- `supportsAllNetworks` 为 false（钱包不支持所有网络）
- **且** 网络ID不在 `approvedCaipNetworkIds` 列表中

**启用条件：**
- `supportsAllNetworks` 为 true（使用注入式钱包如 MetaMask）
- **或** 网络ID在批准列表中

### 3. 钱包类型对网络支持的影响

#### 3.1 WalletConnect 钱包

```typescript
// ethers5/src/client.ts getApprovedCaipNetworksData()
const ns = provider.signer?.session?.namespaces;
const nsMethods = ns?.['eip155']?.methods;
const nsChains = ns?.['eip155']?.chains;

return {
  supportsAllNetworks: nsMethods?.includes('wallet_addEthereumChain') ?? false,
  approvedCaipNetworkIds: nsChains // 钱包明确支持的链列表
};
```

#### 3.2 注入式钱包（MetaMask 等）

```typescript
return {
  approvedCaipNetworkIds: undefined,  // 不限制
  supportsAllNetworks: true           // 支持所有网络
};
```

### 4. 根本问题

#### 问题1: imageId 与 imageUrl 冲突

在 `syncRequestedNetworks()` 中：

```typescript
const requestedCaipNetworks = chains?.map(
  chain => ({
    id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
    name: chain.name,
    imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],  // 如果存在
    imageUrl: chainImages?.[chain.chainId]  // 用户配置
  })
);
```

**问题所在：**
1. 如果 `PresetsUtil.EIP155NetworkImageIds[chainId]` 不存在（如 PunkOS），`imageId` 为 `undefined`
2. 但即使 `imageUrl` 存在，如果 `imageId` 为 `undefined`，某些边界情况下可能导致渲染问题
3. 如果 `imageId` 存在但对应的图片未从 CDN 加载到 `AssetController`，会导致图片显示失败

#### 问题2: WalletConnect CDN URL 格式错误

之前使用的 URL：
```
https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/{imageId}/public
```

正确格式应该是：
```
https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/{imageId}/sm
```

**尺寸选项：**
- `sm` - 小尺寸（推荐用于列表）
- `md` - 中尺寸
- `lg` - 大尺寸
- `public` - 原始尺寸（较大，加载慢）

## 最终解决方案

### 方案思路

1. **不修改** `PresetsUtil.EIP155NetworkImageIds` - 保持原有预设不变
2. **仅依赖** `chainImages` 配置提供所有网络的图片
3. **使用正确的** WalletConnect CDN URL 格式

### 具体修改

#### 修改1: 恢复 PresetsUtil.ts（已完成）

**文件：** `packages/web3modal/packages/scaffold-utils/src/PresetsUtil.ts`

```typescript
EIP155NetworkImageIds: {
  1: '692ed6ba-e569-459a-556a-776476829e00',     // Ethereum
  42161: '600a9a04-c1b9-42ca-6785-9b4b6ff85200', // Arbitrum
  // ... 其他预设网络
  // ❌ 不添加 Sepolia 和 PunkOS
}
```

**原因：** 让 imageId 为 undefined，强制使用 imageUrl

#### 修改2: 优化 chainImages 配置（已完成）

**文件：** `vite/packages/table/store/wallet.ts`

```typescript
chainImages: {
  // Ethereum - 使用 WalletConnect CDN
  1: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/692ed6ba-e569-459a-556a-776476829e00/sm',
  // Sepolia - 使用 WalletConnect CDN
  11155111: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/692ed6ba-e569-459a-556a-776476829e00/sm',
  // Arbitrum - 使用 WalletConnect CDN  
  42161: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/600a9a04-c1b9-42ca-6785-9b4b6ff85200/sm',
  // PunkOS - 使用自定义图标
  20251101: 'https://pic.imgdb.cn/item/65e292ac9f345e8d03288770.png',
}
```

**关键改动：**
- ✅ 所有网络都配置了 imageUrl
- ✅ 使用 `/sm` 而不是 `/public`（更快加载）
- ✅ Sepolia 和 Ethereum 使用相同图标
- ✅ PunkOS 使用自定义图标

## 重新构建和测试

### 步骤1: 清理构建
```bash
# 清理 vite 构建产物
cd vite
rm -rf dist/

# 清理用户数据（重要！）
# 右键托盘图标 → 打开数据目录 → 删除所有文件
```

### 步骤2: 重新构建
```bash
# 在 vite 目录
yarn run build

# 在根目录
cd ..
yarn run start
```

### 步骤3: 验证结果

重启应用后，检查网络选择界面：
- ✅ **Ethereum** - 应显示以太坊图标（亮色）
- ✅ **Sepolia** - 应显示以太坊图标（蓝色高亮）
- ✅ **Arbitrum** - 应显示 Arbitrum 图标（亮色）
- ✅ **PunkOS-XWK** - 应显示自定义图标（亮色）

**判断标准：**
- 所有网络图标都应正常显示
- 所有网络都应该可以点击（不是灰色）
- 当前连接的网络应该有蓝色高亮

## 技术细节

### 图片加载时序

```
初始化 Web3Modal
  ↓
syncRequestedNetworks() 创建 CaipNetwork 对象
  ↓
ApiController.fetchNetworkImages() 异步加载 imageId 对应的图片
  ↓
AssetController.setNetworkImage() 存储图片 blob URL
  ↓
UI 渲染时调用 AssetUtil.getNetworkImage()
  ↓
优先返回 imageUrl，否则返回已加载的 imageId 图片
```

**关键点：**
- `imageUrl` 是同步的，立即可用
- `imageId` 需要异步加载，存在延迟
- 配置 `imageUrl` 可以避免加载延迟和失败

### 网络可用性判断逻辑

```typescript
// w3m-networks-view/index.ts
const isDisabled = !supportsAllNetworks && !approvedIds?.includes(network.id);

// 真值表
// supportsAllNetworks | approvedIds?.includes(id) | isDisabled
// ------------------|------------------------|----------
// true              | -                      | false (可用)
// false             | true                   | false (可用)
// false             | false                  | true (禁用)
```

**实际场景：**
1. **使用 MetaMask** → `supportsAllNetworks=true` → 所有网络可用
2. **使用 WalletConnect + 钱包支持的网络** → 网络在批准列表中 → 可用
3. **使用 WalletConnect + 钱包不支持的网络** → 网络不在批准列表 → 禁用（灰色）

## 常见问题排查

### Q1: 所有网络图标都不显示？

**原因：** `chainImages` 配置错误或 URL 不可访问

**解决：**
1. 检查浏览器控制台的网络请求错误
2. 验证 URL 是否可以直接访问
3. 确认 CORS 配置正确

### Q2: PunkOS 网络仍然是灰色？

**原因1：** 使用了 WalletConnect 钱包，且钱包不支持 PunkOS

**解决：** 
- 使用 MetaMask 等注入式钱包
- 或在 WalletConnect 钱包中添加自定义网络

**原因2：** 配置未正确应用

**解决：**
```bash
# 1. 清理缓存
rm -rf vite/dist/
# 2. 清理用户数据
# 右键托盘 → 打开数据目录 → 删除
# 3. 重新构建
cd vite && yarn run build && cd .. && yarn run start
```

### Q3: Arbitrum 网络是灰色但其他网络正常？

**原因：** 当前钱包未添加 Arbitrum 网络

**解决：** 在钱包中手动添加 Arbitrum 网络配置（见上文）

### Q4: 图片显示很慢？

**原因：** 使用了 `/public` 尺寸（原始大小）

**解决：** 改用 `/sm` 或 `/md` 尺寸

```typescript
// 修改前
chainImages: {
  1: '.../{imageId}/public'  // 慢
}

// 修改后
chainImages: {
  1: '.../{imageId}/sm'      // 快
}
```

## 升级到 Web3Modal v4+ 的建议

Web3Modal v4 版本对自定义链提供了更好的支持。长期建议：

### 升级优势
- ✅ 原生支持自定义链
- ✅ 更简单的配置方式
- ✅ 更好的类型支持
- ✅ 性能优化

### 升级注意事项
- ⚠️ API 有破坏性变更
- ⚠️ 需要重构现有代码
- ⚠️ 依赖版本需要同步升级

## 总结

### 问题根源
1. Web3Modal v3.5.3 对自定义链的支持不完善
2. 依赖预设的 `imageId` 列表来加载图标
3. 没有配置 `chainImages` 导致自定义链图标丢失

### 解决策略
1. **短期方案：** 通过 `chainImages` 配置直接提供图片 URL
2. **长期方案：** 升级到 Web3Modal v4+ 获得原生支持

### 关键配置
```typescript
// 1. chains 定义所有支持的网络
chains: [punkos, sepolia, mainnet, arbitrum]

// 2. chainImages 为每个网络提供图片
chainImages: {
  1: 'https://.../sm',      // Ethereum
  11155111: 'https://.../sm', // Sepolia  
  42161: 'https://.../sm',    // Arbitrum
  20251101: 'https://...',    // PunkOS (自定义)
}
```

## 相关文件

- [packages/web3modal/packages/scaffold-utils/src/PresetsUtil.ts](d:\CodeProjects\Idea\punkos\packages\web3modal\packages\scaffold-utils\src\PresetsUtil.ts) - 网络预设
- [vite/packages/table/store/wallet.ts](d:\CodeProjects\Idea\punkos\vite\packages\table\store\wallet.ts) - 钱包配置
- [vite/packages/table/store/chains.ts](d:\CodeProjects\Idea\punkos\vite\packages\table\store\chains.ts) - 链定义
- [packages/web3modal/packages/ethers5/src/client.ts](d:\CodeProjects\Idea\punkos\packages\web3modal\packages\ethers5\src\client.ts) - 客户端
- [packages/web3modal/packages/scaffold/src/views/w3m-networks-view/index.ts](d:\CodeProjects\Idea\punkos\packages\web3modal\packages\scaffold\src\views\w3m-networks-view\index.ts) - UI 渲染
- [packages/web3modal/packages/core/src/utils/AssetUtil.ts](d:\CodeProjects\Idea\punkos\packages\web3modal\packages\core\src\utils\AssetUtil.ts) - 资源工具

## 参考资料

- [Web3Modal 官方文档](https://docs.walletconnect.com/web3modal/about)
- [WalletConnect CDN](https://imagedelivery.net)
- [Arbitrum 网络配置](https://docs.arbitrum.io)
- [EIP-155: Simple replay attack protection](https://eips.ethereum.org/EIPS/eip-155)
