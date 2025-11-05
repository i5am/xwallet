# WalletConnect 集成指南

## 📋 功能说明

XWallet 现已集成 WalletConnect v2 协议，让您的热钱包可以安全地连接到各种去中心化应用（DApp），如 Uniswap、OpenSea、PancakeSwap 等。

## 🚀 快速开始

### 1. 获取 WalletConnect 项目 ID

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com)
2. 注册并登录账号
3. 创建新项目（Create New Project）
4. 复制项目 ID（Project ID）

### 2. 配置项目 ID

打开 `src/services/walletconnect/WalletConnectService.ts` 文件，找到第 19 行：

```typescript
const WALLETCONNECT_PROJECT_ID = 'YOUR_PROJECT_ID_HERE';
```

将 `YOUR_PROJECT_ID_HERE` 替换为您的项目 ID：

```typescript
const WALLETCONNECT_PROJECT_ID = 'a1b2c3d4e5f6...'; // 您的项目 ID
```

### 3. 更新钱包元数据（可选）

在同一文件中，您可以自定义钱包信息：

```typescript
export const walletConnectService = new WalletConnectService({
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata: {
    name: 'XWallet',                          // 钱包名称
    description: 'Multi-chain Hot/Cold Wallet', // 描述
    url: 'https://your-wallet-url.com',        // 您的网站
    icons: ['https://your-wallet-url.com/icon.png'], // Logo
  },
});
```

## 💡 使用方法

### 连接 DApp

1. **打开钱包应用**
2. **选择热钱包**（只有热钱包可以连接 DApp）
3. **点击 "WalletConnect" 按钮**
4. **点击 "扫描 WalletConnect 二维码"**
5. **扫描 DApp 页面上的二维码**
6. **审核并批准连接请求**

### 签名请求

当 DApp 需要签名时：

1. 钱包会自动弹出签名请求对话框
2. 显示 DApp 信息和请求内容
3. 仔细检查请求数据
4. 点击 "批准签名" 或 "拒绝"

### 发送交易

当 DApp 请求发送交易时：

1. 钱包会显示交易详情
2. 包括：接收地址、金额、gas 费用
3. 使用热钱包私钥自动签名并发送
4. 返回交易哈希给 DApp

### 管理连接

在 WalletConnect 对话框中：

- 查看所有活跃会话
- 查看 DApp 名称和图标
- 随时断开不需要的连接

## 🔐 支持的操作

### Ethereum (EIP-155)

- ✅ `eth_accounts` - 获取账户地址
- ✅ `eth_chainId` - 获取链 ID
- ✅ `eth_sign` - 签名消息
- ✅ `personal_sign` - 个人签名（推荐）
- ✅ `eth_signTypedData` - 签名类型化数据（EIP-712）
- ✅ `eth_signTypedData_v4` - 签名类型化数据 v4
- ✅ `eth_sendTransaction` - 发送交易
- ✅ `eth_signTransaction` - 签名交易（不发送）

### 未来支持

- 🔄 Bitcoin 签名（通过自定义命名空间）
- 🔄 多链切换
- 🔄 批量签名

## 🎯 支持的 DApp 示例

### DEX（去中心化交易所）
- [Uniswap](https://app.uniswap.org) - Ethereum DEX
- [PancakeSwap](https://pancakeswap.finance) - BSC DEX
- [SushiSwap](https://www.sushi.com) - 多链 DEX

### NFT 市场
- [OpenSea](https://opensea.io) - 最大 NFT 市场
- [Rarible](https://rarible.com) - 社区驱动 NFT
- [LooksRare](https://looksrare.org) - NFT 交易平台

### DeFi 协议
- [Aave](https://app.aave.com) - 借贷协议
- [Compound](https://app.compound.finance) - 借贷市场
- [Curve](https://curve.fi) - 稳定币交易

## 🔒 安全建议

### 1. 只用热钱包连接 DApp
- ❌ 不要用冷钱包连接（无法离线签名）
- ❌ 不要用观测钱包连接（无私钥）
- ✅ 只用热钱包连接 DApp

### 2. 仔细检查连接请求
- ✅ 确认 DApp 网站正确
- ✅ 检查请求的权限
- ❌ 不要连接到可疑网站

### 3. 审核签名请求
- ✅ 仔细阅读签名内容
- ✅ 确认交易金额和地址
- ❌ 不要盲目批准所有请求

### 4. 定期断开不用的连接
- ✅ 定期检查活跃会话
- ✅ 断开不再使用的 DApp
- ✅ 保持最少的活跃连接

### 5. 使用小额热钱包
- ✅ 热钱包只存放小额资金
- ✅ 大额资金存在冷钱包
- ✅ 定期转账到冷钱包

## 🐛 故障排除

### 无法连接 DApp

**问题**: 扫描二维码后无反应

**解决方案**:
1. 确保已配置项目 ID
2. 检查网络连接
3. 确保使用热钱包
4. 重新扫描二维码

### 签名失败

**问题**: 签名请求失败

**解决方案**:
1. 确认钱包有私钥
2. 检查钱包类型（必须是热钱包）
3. 确认网络正确（主网/测试网）
4. 查看控制台错误信息

### 交易发送失败

**问题**: 交易无法发送

**解决方案**:
1. 检查余额是否足够
2. 确认 gas 费用足够
3. 检查网络连接
4. 确认 RPC 节点可用

### 会话断开

**问题**: DApp 连接突然断开

**解决方案**:
1. 重新扫描二维码连接
2. 检查会话是否过期
3. 确认 DApp 未手动断开
4. 重启钱包应用

## 📚 技术细节

### 架构

```
┌─────────────────────────────────────────────┐
│              DApp (网页)                     │
│  - Uniswap, OpenSea, etc.                  │
│  - 显示 WalletConnect 二维码               │
└─────────────────────────────────────────────┘
                    ↓
        WalletConnect URI (wc:...)
                    ↓
┌─────────────────────────────────────────────┐
│        WalletConnect Cloud                  │
│  - 中继服务器                               │
│  - 消息路由                                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          XWallet (移动端)                    │
│                                              │
│  1. 扫描二维码获取 URI                      │
│  2. 通过 Cloud 建立连接                     │
│  3. 接收签名请求                            │
│  4. 使用热钱包私钥签名                      │
│  5. 返回签名结果                            │
└─────────────────────────────────────────────┘
```

### 签名流程

```typescript
// 1. DApp 请求签名
DApp -> WalletConnect Cloud -> XWallet

// 2. XWallet 处理请求
async handleSessionRequest(request, wallet) {
  // 验证钱包类型
  if (wallet.type !== WalletType.HOT) {
    throw new Error('需要热钱包');
  }
  
  // 根据方法处理
  switch (request.method) {
    case 'personal_sign':
      // 使用 ethers.js 签名
      const ethWallet = new ethers.Wallet(wallet.privateKey);
      const signature = await ethWallet.signMessage(message);
      return signature;
      
    case 'eth_sendTransaction':
      // 发送交易
      const tx = await ethWallet.sendTransaction(transaction);
      return tx.hash;
  }
}

// 3. 返回结果
XWallet -> WalletConnect Cloud -> DApp
```

### 数据流

```
扫描 QR 码
  ↓
配对 (pair)
  ↓
会话提案 (session_proposal)
  ↓
批准会话 (approveSession)
  ↓
会话建立 ✅
  ↓
会话请求 (session_request)
  ↓
处理请求 (handleSessionRequest)
  ↓
返回结果
  ↓
断开会话 (disconnectSession)
```

## 🔧 开发者选项

### 自定义 RPC 端点

在 `WalletConnectService.ts` 的 `getRpcUrl()` 方法中添加：

```typescript
private getRpcUrl(chainId: string): string {
  const chainIdNum = parseInt(chainId.split(':')[1]);
  
  const rpcUrls: Record<number, string> = {
    1: 'https://eth.llamarpc.com',           // Ethereum 主网
    5: 'https://goerli.infura.io/v3/YOUR_KEY', // Goerli 测试网
    56: 'https://bsc-dataseed.binance.org',  // BSC 主网
    137: 'https://polygon-rpc.com',          // Polygon 主网
    // 添加更多链...
  };
  
  return rpcUrls[chainIdNum] || rpcUrls[1];
}
```

### 添加新的签名方法

```typescript
async handleSessionRequest(request, wallet) {
  switch (request.method) {
    // 现有方法...
    
    case 'your_custom_method':
      return await this.handleCustomMethod(request, wallet);
  }
}

private async handleCustomMethod(request, wallet) {
  // 您的自定义实现
}
```

## 📞 支持

如有问题或建议，请：
- 查看 [WalletConnect 官方文档](https://docs.walletconnect.com)
- 提交 GitHub Issue
- 加入社区讨论

## 📄 许可证

MIT License

---

**享受去中心化应用世界！🚀**
