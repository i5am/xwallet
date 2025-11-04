# 🎉 Tether WDK Wallet - 多链加密货币钱包

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

基于 Tether WDK 的专业级多链加密货币钱包应用

支持 **Bitcoin (Taproot)** 和 **Ethereum (含 ERC20)**

[快速开始](#-快速开始) • [功能特性](#-核心特性) • [文档索引](DOCS_INDEX.md) • [WDK协议](docs/protocol.md) • [二维码格式](docs/QR-CODE-FORMATS.md)

</div>

---

## 🌟 核心特性

### 💼 多钱包类型支持
- 🔥 **热钱包 (Hot Wallet)** 
  - M2M 自动化支付场景
  - 支持余额监控和自动转账到冷钱包
  - 适合机器人和自动化系统
  
- ❄️ **冷钱包 (Cold Wallet)** 
  - 完全离线环境
  - 通过二维码进行安全签名 (支持简单格式和WDK协议格式)
  - 气隙隔离，最高安全级别
  - 🆕 **可切换二维码格式**: 简单地址(兼容所有钱包) vs WDK协议(高级功能)
  
- 👁️ **观测钱包 (Watch-Only)** 
  - 只读模式，无私钥
  - 监控地址余额和交易
  - 安全查看资产

### 🪙 支持的区块链

#### Bitcoin
- ✅ **Taproot 地址** (bc1p...) - BIP86
- ✅ UTXO 管理
- ✅ 交易构建和签名
- ✅ 动态手续费估算
- ✅ 交易历史查询

#### Ethereum
- ✅ **标准地址** (0x...) - BIP44
- ✅ EIP-1559 交易支持
- ✅ ERC20 代币支持 (USDT, USDC, DAI 等)
- ✅ Gas 智能估算
- ✅ 批量代币余额查询

### 🔐 安全特性
- ✅ BIP39 助记词标准 (12/24 词)
- ✅ AES-256 本地加密存储
- ✅ 离线签名支持
- ✅ **WDK 标准化通信协议** - 专业的钱包开发工具包协议
- ✅ 二维码气隙通信 - 物理隔离热冷钱包
- ✅ 私钥永不离开设备
- ✅ 多层安全验证 (协议、版本、时间戳、链类型)

### 🎨 用户功能
- ✅ 发送和接收加密货币 (支持协议格式)
- ✅ 消息签名和验证 (WDK 协议标准)
- ✅ AI 服务支付 (Flightspark 协议)
- ✅ 钱包导入/导出 (助记词/私钥)
- ✅ **智能二维码扫描** - 自动识别协议消息类型
- ✅ 交易历史记录
- ✅ 多语言界面 (中文)
- ✅ 深色/浅色主题

---

## 🚀 快速开始

### 📋 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- 现代浏览器 (Chrome, Firefox, Edge)
- **Android 开发** (可选): Android Studio + JDK 11+

### ⚡ 安装步骤

#### 1. 安装依赖
```powershell
npm install
```

#### 2. 启动开发服务器
```powershell
npm run dev
```

然后在浏览器中打开 `http://localhost:5173`

#### 3. 构建生产版本
```powershell
npm run build
```

#### 4. 打包 Android 应用 (可选)
```powershell
# 构建并同步到 Android
npm run android:build

# 打开 Android Studio
npm run android:open
```

详细的 Android 打包指南请查看 [docs/ANDROID_BUILD.md](docs/ANDROID_BUILD.md)
```

#### 4. 预览生产版本
```powershell
npm run preview
```

### 🎯 第一次使用

1. **创建钱包**
   - 点击"创建"按钮
   - 选择钱包类型（热钱包/冷钱包）
   - 选择区块链（BTC/ETH）
   - 保存助记词！

2. **测试网测试**
   - 建议先在测试网进行测试
   - 从水龙头获取测试币
   - 进行转账测试

3. **安全提示**
   - ⚠️ 务必备份助记词
   - ⚠️ 不要在线保存助记词
   - ⚠️ 热钱包只存小额资金

4. **使用二维码扫描功能**
   - 点击"扫描二维码"按钮
   - 允许浏览器访问摄像头
   - 扫描包含交易或消息的二维码
   - 确认详情后签名
   - 生成签名结果二维码供在线钱包使用

详细使用指南请查看 [GETTING_STARTED.md](GETTING_STARTED.md)
二维码扫描功能详情请查看 [docs/QR_SCANNING_FEATURE.md](docs/QR_SCANNING_FEATURE.md)

---

## 📁 项目结构

```
wdk/
├── src/
│   ├── types/              # TypeScript 类型定义
│   ├── config/             # 配置文件
│   ├── utils/              # 工具函数
│   │   └── protocol.ts     # WDK 协议工具类
│   ├── services/           # 业务逻辑服务
│   │   ├── blockchain/     # 区块链适配器
│   │   └── storage/        # 存储服务
│   ├── App.tsx             # 主应用
│   └── main.tsx            # 入口文件
├── docs/                   # 文档目录
│   ├── protocol.md         # WDK 协议规范
│   ├── protocol-usage-guide.md      # 协议使用指南
│   ├── WDK-PROTOCOL-OVERVIEW.md     # 协议概览
│   └── implementation-summary.md    # 实现总结
├── tools/                  # 开发工具
│   └── protocol-qr-generator.html   # 协议二维码生成器
├── public/                 # 静态资源
├── GETTING_STARTED.md      # 快速开始指南
├── DEVELOPMENT.md          # 开发文档
└── package.json
```

---

## � WDK 协议

### 协议概述

**WDK** (Wallet Development Kit) 是 Tether WDK Wallet 的标准化通信协议,专为安全的热冷钱包交互而设计。

### 核心特性

✅ **标准化消息格式** - 统一的 JSON 结构  
✅ **多链支持** - Bitcoin, Ethereum, BNB Chain  
✅ **安全验证** - 多层验证机制  
✅ **离线签名** - 冷钱包完全离线操作  
✅ **二维码传输** - 气隙通信,物理隔离  

### 协议信息

```
名称: WDK (Wallet Development Kit)
版本: 1.0.0
编码: JSON (UTF-8)
传输: QR Code
```

### 支持的消息类型

| 类型 | 说明 |
|-----|------|
| `SIGN_TRANSACTION_REQUEST/RESPONSE` | 交易签名 |
| `SIGN_MESSAGE_REQUEST/RESPONSE` | 消息签名 |
| `AUTHORIZATION_REQUEST/RESPONSE` | DApp 授权 |
| `ADDRESS_INFO` | 地址信息 |
| `ERROR_RESPONSE` | 错误响应 |

### 协议文档

- 📖 [协议规范](docs/protocol.md) - 完整技术规范
- 📖 [使用指南](docs/protocol-usage-guide.md) - 详细使用说明
- 📖 [协议概览](docs/WDK-PROTOCOL-OVERVIEW.md) - 协议介绍
- 🛠️ [测试工具](tools/protocol-qr-generator.html) - 二维码生成器

### 使用示例

```typescript
import { ProtocolUtils } from '@/utils/protocol';

// 创建交易请求
const txRequest = ProtocolUtils.createTransactionRequest({
  from: 'bc1p...',
  to: 'bc1q...',
  amount: '0.001',
  fee: '0.00001',
  chain: ChainType.BTC,
  network: NetworkType.MAINNET,
});

// 生成二维码
const qrData = ProtocolUtils.serializeMessage(txRequest);
```

---

## �🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript 5 |
| 构建工具 | Vite 5 |
| 样式 | TailwindCSS 3 |
| BTC | bitcoinjs-lib + BIP39/32/86 |
| ETH | ethers.js v6 |
| 加密 | crypto-js (AES-256) |
| 图标 | Lucide React |

---

## 📖 开发指南

### 核心模块使用

#### BTC 适配器

```typescript
import { BTCAdapter } from '@/services/blockchain';

const adapter = new BTCAdapter(NetworkType.MAINNET);

// 生成 Taproot 地址
const wallet = adapter.generateTaprootAddress(mnemonic);

// 查询余额
const balance = await adapter.getBalance(address);

// 发送交易
const txHex = await adapter.buildAndSignTransaction({
  from: 'bc1p...',
  to: 'bc1p...',
  amountBTC: '0.001',
  privateKey: privateKey
});
```

#### ETH 适配器

```typescript
import { ETHAdapter } from '@/services/blockchain';

const adapter = new ETHAdapter(rpcUrl, NetworkType.MAINNET);

// 生成地址
const wallet = adapter.generateAddress(mnemonic);

// 查询余额
const balance = await adapter.getBalanceETH(address);

// 发送 ETH
const txHash = await adapter.sendETH({
  from: '0x...',
  to: '0x...',
  amountETH: '0.1',
  privateKey: privateKey
});
```

完整的开发文档请查看 [DEVELOPMENT.md](DEVELOPMENT.md)

---

## 🔜 开发计划

### ✅ 已完成
- [x] 项目基础架构
- [x] BTC Taproot 支持
- [x] ETH + ERC20 支持
- [x] 钱包创建和管理
- [x] 安全加密存储
- [x] 基础 UI 界面
- [x] 发送交易功能
- [x] 接收功能（二维码）
- [x] 消息签名功能
- [x] AI 服务支付 (Flightspark)
- [x] 钱包导入（助记词/私钥）
- [x] **二维码扫描功能**
- [x] 设置对话框

### 🚧 进行中
- [ ] 余额实时查询优化
- [ ] 交易历史显示完善

### 📅 计划中
- [ ] 热钱包自动转账
- [ ] PIN 码系统
- [ ] 多语言支持（英文等）
- [ ] 移动端适配优化
- [ ] 批量签名功能
- [ ] EIP-712 结构化签名

详细文档请查看：
- 📖 [二维码扫描功能文档](docs/QR_SCANNING_FEATURE.md)
- 🔐 [扫描确认流程文档](docs/SCAN_CONFIRMATION_FLOW.md) ⭐ 新增
- 🧪 [二维码测试示例](docs/QR_CODE_EXAMPLES.md)
- 🚀 [快速开始指南](GETTING_STARTED.md)
- 💻 [开发文档](DEVELOPMENT.md)

## 📁 项目结构

```
wdk/
├── src/
│   ├── components/       # UI 组件
│   ├── screens/          # 页面
│   ├── services/         # 业务逻辑
│   ├── store/            # 状态管理
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   └── config/           # 配置文件
├── public/               # 静态资源
└── package.json
```

## 🔐 安全提示

⚠️ **重要安全建议**:
- 务必备份助记词并妥善保管
- 冷钱包设备保持离线状态
- 热钱包仅存储小额资金
- 定期检查自动转账配置
- 验证所有交易详情

## 📝 开发计划

- [x] 项目初始化
- [ ] BTC Taproot 支持
- [ ] ETH + ERC20 支持
- [ ] 热钱包自动转账
- [ ] 冷钱包离线签名
- [ ] 二维码通信协议
- [ ] 移动端适配

## 📄 许可证

MIT License
