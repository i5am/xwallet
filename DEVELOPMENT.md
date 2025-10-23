# 开发指南

## 📚 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [开发环境设置](#开发环境设置)
4. [核心模块说明](#核心模块说明)
5. [开发工作流](#开发工作流)
6. [测试指南](#测试指南)
7. [常见问题](#常见问题)

---

## 项目概述

Tether WDK Wallet 是一个支持多链的加密货币钱包应用，主要特性：

- 🔥 **热钱包**: 用于 M2M 自动化支付，支持自动转账到冷钱包
- ❄️ **冷钱包**: 完全离线，通过二维码进行签名通信
- 👁️ **观测钱包**: 只读模式，用于监控地址
- 🪙 **多链支持**: Bitcoin (Taproot) 和 Ethereum (含 ERC20)

---

## 技术架构

### 核心技术栈

\`\`\`
前端: React 18 + TypeScript 5
构建: Vite 5
样式: TailwindCSS 3
状态: Zustand (计划中)
区块链:
  - BTC: bitcoinjs-lib + bip39/bip32
  - ETH: ethers.js v6
加密: crypto-js
\`\`\`

### 架构分层

\`\`\`
┌─────────────────────────────────────┐
│         UI Layer (React)             │  ← 用户界面
├─────────────────────────────────────┤
│      Business Logic (Services)       │  ← 业务逻辑
├─────────────────────────────────────┤
│    Blockchain Adapters (BTC/ETH)    │  ← 区块链交互
├─────────────────────────────────────┤
│      Storage Layer (LocalStorage)    │  ← 数据持久化
└─────────────────────────────────────┘
\`\`\`

---

## 开发环境设置

### 1. 系统要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- 现代浏览器（Chrome/Firefox/Edge）

### 2. 安装依赖

\`\`\`powershell
# 克隆项目（如果从 Git）
# git clone <repository-url>

# 进入项目目录
cd d:\projects\wdk

# 安装依赖
npm install

# 如果遇到依赖冲突，可以使用
npm install --legacy-peer-deps
\`\`\`

### 3. 启动开发服务器

\`\`\`powershell
# 开发模式（带热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
\`\`\`

### 4. 代码规范检查

\`\`\`powershell
# 运行 ESLint
npm run lint

# 自动修复可修复的问题
npm run lint -- --fix
\`\`\`

---

## 核心模块说明

### 1. 类型定义 (\`src/types/\`)

#### wallet.ts
定义钱包相关的所有类型：

\`\`\`typescript
// 钱包类型
export enum WalletType {
  HOT = 'hot',      // 热钱包
  COLD = 'cold',    // 冷钱包
  WATCH_ONLY = 'watch'  // 观测钱包
}

// 钱包接口
export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  chain: ChainType;
  address: string;
  // ...
}
\`\`\`

#### qr.ts
定义二维码通信协议：

\`\`\`typescript
export enum QRCodeType {
  BTC_UNSIGNED_TX = 'btc_unsigned_tx',
  BTC_SIGNED_TX = 'btc_signed_tx',
  ETH_UNSIGNED_TX = 'eth_unsigned_tx',
  // ...
}
\`\`\`

### 2. 区块链适配器 (\`src/services/blockchain/\`)

#### BTCAdapter.ts

负责所有 Bitcoin 相关操作：

\`\`\`typescript
const btcAdapter = new BTCAdapter(NetworkType.MAINNET);

// 生成 Taproot 地址
const wallet = btcAdapter.generateTaprootAddress(mnemonic);

// 查询余额
const balance = await btcAdapter.getBalance(address);

// 构建并签名交易
const txHex = await btcAdapter.buildAndSignTransaction({
  from: 'bc1p...',
  to: 'bc1p...',
  amountBTC: '0.001',
  privateKey: '...'
});

// 广播交易
const txid = await btcAdapter.broadcastTransaction(txHex);
\`\`\`

**主要功能：**
- ✅ Taproot 地址生成 (BIP86: m/86'/0'/0'/0/0)
- ✅ UTXO 管理
- ✅ 交易构建和签名
- ✅ 手续费估算
- ✅ 交易广播

#### ETHAdapter.ts

负责所有 Ethereum 相关操作：

\`\`\`typescript
const ethAdapter = new ETHAdapter(rpcUrl, NetworkType.MAINNET);

// 生成地址
const wallet = ethAdapter.generateAddress(mnemonic);

// 查询余额
const balance = await ethAdapter.getBalanceETH(address);

// 发送 ETH
const txHash = await ethAdapter.sendETH({
  from: '0x...',
  to: '0x...',
  amountETH: '0.1',
  privateKey: '...'
});
\`\`\`

**主要功能：**
- ✅ ETH 地址生成 (BIP44: m/44'/60'/0'/0/0)
- ✅ EIP-1559 交易支持
- ✅ Gas 估算
- ✅ 交易签名和广播

#### ERC20Adapter.ts

负责 ERC20 代币操作：

\`\`\`typescript
const erc20 = new ERC20Adapter(provider);

// 获取代币信息
const tokenInfo = await erc20.getTokenInfo(tokenAddress);

// 查询代币余额
const balance = await erc20.getBalance(tokenAddress, walletAddress);

// 发送代币
const txHash = await erc20.sendToken({
  tokenAddress: '0x...',
  from: '0x...',
  to: '0x...',
  amount: '100',
  privateKey: '...'
});
\`\`\`

### 3. 工具函数 (\`src/utils/\`)

#### format.ts - 格式化工具

\`\`\`typescript
import { formatBTC, formatETH, formatAddress } from '@/utils';

// BTC 格式化
const btc = formatBTC(100000000); // "1.00000000"

// ETH 格式化
const eth = formatETH("1000000000000000000"); // "1.0"

// 地址缩略
const short = formatAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
// "0x742d...f0bEb"
\`\`\`

#### validation.ts - 验证工具

\`\`\`typescript
import { isValidBTCAddress, isValidETHAddress, isValidMnemonic } from '@/utils';

// 验证 BTC 地址
if (isValidBTCAddress('bc1p...')) {
  // 有效的 Taproot 地址
}

// 验证 ETH 地址
if (isValidETHAddress('0x...')) {
  // 有效的 ETH 地址
}

// 验证助记词
if (isValidMnemonic('word1 word2 ... word12')) {
  // 有效的 12 词助记词
}
\`\`\`

#### crypto.ts - 加密工具

\`\`\`typescript
import { CryptoUtils } from '@/utils';

// 加密数据
const encrypted = CryptoUtils.encrypt(data, password);

// 解密数据
const decrypted = CryptoUtils.decrypt(encrypted, password);

// SHA256 哈希
const hash = CryptoUtils.sha256(data);
\`\`\`

### 4. 存储服务 (\`src/services/storage/\`)

#### SecureStorage.ts

\`\`\`typescript
import { SecureStorage } from '@/services/storage';

// 加密存储
SecureStorage.setItem('wallets', walletsData);

// 读取解密
const wallets = SecureStorage.getItem('wallets');

// 删除
SecureStorage.removeItem('wallets');
\`\`\`

**注意：** Web 版使用 localStorage + AES-256 加密。生产环境建议使用更安全的方案。

---

## 开发工作流

### 添加新功能的步骤

#### 示例：添加"查看余额"功能

1. **更新类型定义** (\`src/types/wallet.ts\`)

\`\`\`typescript
export interface Wallet {
  // ... 现有字段
  balance?: Balance;  // 添加余额字段
}

export interface Balance {
  native: string;
  tokens?: TokenBalance[];
  lastUpdated: number;
}
\`\`\`

2. **创建服务方法** (\`src/services/wallet/WalletService.ts\`)

\`\`\`typescript
export class WalletService {
  async updateBalance(wallet: Wallet): Promise<Balance> {
    if (wallet.chain === ChainType.BTC) {
      const btcAdapter = new BTCAdapter(wallet.network);
      const balance = await btcAdapter.getBalanceETH(wallet.address);
      return {
        native: balance,
        lastUpdated: Date.now()
      };
    }
    // ... ETH 逻辑
  }
}
\`\`\`

3. **更新 UI 组件** (\`src/App.tsx\`)

\`\`\`typescript
const [balance, setBalance] = useState<string>('0.00');

const refreshBalance = async () => {
  if (selectedWallet) {
    const walletService = new WalletService();
    const balanceData = await walletService.updateBalance(selectedWallet);
    setBalance(balanceData.native);
  }
};

// 在 UI 中显示
<div className="text-5xl font-bold">
  {balance}
</div>
<button onClick={refreshBalance}>刷新余额</button>
\`\`\`

### 调试技巧

#### 1. 浏览器开发者工具

\`\`\`javascript
// 在代码中添加断点
debugger;

// 查看 localStorage
console.log(localStorage.getItem('wdk_wallets'));

// 查看网络请求
// Network 标签 -> 筛选 XHR/Fetch
\`\`\`

#### 2. React DevTools

安装 React DevTools 浏览器扩展，可以：
- 查看组件树
- 检查 props 和 state
- 追踪组件重渲染

#### 3. 日志输出

\`\`\`typescript
// 在适配器中添加日志
console.log('BTC Balance:', balance);
console.log('Transaction:', tx);

// 生产环境移除
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
\`\`\`

---

## 测试指南

### 单元测试（计划中）

\`\`\`typescript
// 测试地址生成
describe('BTCAdapter', () => {
  it('should generate valid Taproot address', () => {
    const adapter = new BTCAdapter();
    const wallet = adapter.generateTaprootAddress(testMnemonic);
    expect(wallet.address).toMatch(/^bc1p/);
  });
});
\`\`\`

### 手动测试清单

#### 创建钱包
- [ ] BTC 热钱包创建成功
- [ ] BTC 冷钱包创建成功
- [ ] ETH 热钱包创建成功
- [ ] ETH 冷钱包创建成功
- [ ] 助记词显示正确（12 个单词）
- [ ] 地址格式正确
  - BTC: bc1p... (Taproot)
  - ETH: 0x... (40 个十六进制字符)

#### 地址验证
- [ ] 复制地址功能
- [ ] 地址格式验证
- [ ] 地址缩略显示

#### 网络测试
- [ ] 使用测试网进行测试
- [ ] 从水龙头获取测试币
- [ ] 发送测试交易
- [ ] 查询交易状态

### 测试网水龙头

**Bitcoin Testnet:**
- https://testnet-faucet.mempool.co/
- https://coinfaucet.eu/en/btc-testnet/

**Ethereum Sepolia:**
- https://sepoliafaucet.com/
- https://faucet.sepolia.dev/

---

## 常见问题

### Q1: npm install 失败

**A:** 尝试以下方法：

\`\`\`powershell
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 重新安装
npm install
\`\`\`

### Q2: 编译错误 "Cannot find module"

**A:** 确保所有依赖已安装：

\`\`\`powershell
npm install bitcoinjs-lib bip32 bip39 tiny-secp256k1 ethers
\`\`\`

### Q3: Buffer is not defined

**A:** Vite 需要 polyfill Node.js 模块。已在 \`vite.config.ts\` 中配置。如仍有问题：

\`\`\`powershell
npm install --save-dev @types/node
\`\`\`

### Q4: 交易广播失败

**A:** 检查：
1. 网络连接
2. 余额是否充足
3. Gas/Fee 设置是否合理
4. 使用测试网进行测试

### Q5: 私钥存储不安全

**A:** 当前版本使用 localStorage + AES 加密，仅用于开发。生产环境建议：
- 使用硬件安全模块 (HSM)
- 集成硬件钱包 (Ledger/Trezor)
- 使用浏览器扩展的安全存储 API
- 考虑多重签名方案

---

## 下一步开发建议

### 优先级 1：核心功能完善

1. **余额查询**
   - 实现自动刷新
   - 添加加载状态
   - 错误处理

2. **发送交易**
   - 创建发送页面
   - 表单验证
   - 交易确认弹窗

3. **交易历史**
   - 集成区块浏览器 API
   - 分页加载
   - 交易详情页

### 优先级 2：安全增强

1. **PIN 码系统**
   - 设置 PIN 码
   - 解锁验证
   - 自动锁定

2. **备份恢复**
   - 导出钱包
   - 导入钱包
   - 助记词验证

### 优先级 3：用户体验

1. **状态管理**
   - 集成 Zustand
   - 持久化配置
   - 全局通知

2. **响应式设计**
   - 移动端适配
   - 触摸优化

3. **国际化**
   - 多语言支持
   - 货币单位切换

---

## 相关资源

### 文档
- [Bitcoin Developer Guide](https://developer.bitcoin.org/devguide/)
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib)

### 工具
- [Blockchain.com Explorer](https://www.blockchain.com/explorer)
- [Etherscan](https://etherscan.io/)
- [Mempool.space](https://mempool.space/)

### 安全
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [OWASP Crypto Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

---

**祝开发顺利！** 🚀

如有问题，请查看项目 README.md 或提交 Issue。
