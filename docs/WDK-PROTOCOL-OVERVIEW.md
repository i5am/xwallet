# Tether WDK 协议说明

## 关于 Tether WDK

**WDK** = **Wallet Development Kit** (钱包开发工具包)

这是一个专为 Tether WDK Wallet 设计的标准化通信协议,用于实现安全的热钱包与冷钱包之间的交互。

---

## 📋 协议概述

### 核心特性

✅ **标准化消息格式** - 统一的 JSON 结构  
✅ **多链支持** - Bitcoin, Ethereum, BNB Chain 等  
✅ **安全验证** - 时间戳、版本控制、链类型匹配  
✅ **离线签名** - 冷钱包完全离线操作  
✅ **二维码传输** - 气隙通信,物理隔离  
✅ **向后兼容** - 支持版本升级和旧格式数据

### 协议标识

```
名称: WDK (Wallet Development Kit)
版本: 1.0.0
前缀: WDK://
编码: JSON (UTF-8)
传输: QR Code (纠错等级 M)
```

---

## 🏗️ 架构设计

### 设计理念

WDK 协议遵循以下设计原则:

1. **安全第一** - 私钥永不通过二维码传输
2. **简单易用** - 清晰的数据结构,易于实现
3. **可扩展性** - 支持添加新的消息类型和字段
4. **互操作性** - 不同设备和平台间可以互通
5. **向后兼容** - 新版本支持旧版本消息

### 通信模型

```
┌─────────────┐                    ┌─────────────┐
│  热钱包     │                    │  冷钱包     │
│ (在线设备)  │                    │ (离线设备)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. 生成交易请求                 │
       │     (SIGN_TRANSACTION_REQUEST)   │
       ├──────────── QR Code ────────────>│
       │                                  │
       │                         2. 验证并签名
       │                                  │
       │  3. 扫描签名响应                 │
       │     (SIGN_TRANSACTION_RESPONSE)  │
       <──────────── QR Code ──────────────┤
       │                                  │
   4. 广播交易                            │
       │                                  │
```

---

## 📦 协议组成

### 1. 核心协议 (`docs/protocol.md`)

完整的技术规范文档,包含:
- 基础消息结构定义
- 6 种主要消息类型规范
- 安全验证要求
- 错误处理机制
- 使用示例和说明

### 2. 协议工具类 (`src/utils/protocol.ts`)

TypeScript 实现,提供:
- 消息创建 API
- 消息解析和验证
- 序列化和反序列化
- 类型安全的接口

### 3. 应用集成 (`src/App.tsx`)

完整集成到应用:
- 发送功能使用协议格式
- 接收功能生成协议二维码
- 扫描功能识别协议消息
- 签名功能生成协议响应

### 4. 测试工具 (`tools/protocol-qr-generator.html`)

独立测试工具:
- 生成各种协议消息二维码
- 用于开发和调试
- 无需后端服务器

---

## 🔐 安全机制

### 多层验证

```typescript
// 1. 协议层验证
if (message.protocol !== 'WDK') {
  throw new Error('不支持的协议')
}

// 2. 版本验证
if (!isVersionCompatible(message.version)) {
  throw new Error('版本不兼容')
}

// 3. 时间戳验证 (防重放攻击)
if (Math.abs(Date.now() - message.timestamp) > 5 * 60 * 1000) {
  throw new Error('消息已过期')
}

// 4. 业务逻辑验证
if (message.data.chain !== wallet.chain) {
  throw new Error('链类型不匹配')
}
```

### 数据隔离

- ❌ 私钥**永不**通过二维码传输
- ❌ 助记词**永不**通过二维码传输
- ✅ 只传输**签名结果**和**公钥**
- ✅ 冷钱包**完全离线**操作

---

## 🎯 支持的场景

### 1. 冷钱包转账

**适用场景**: 大额资金转账,需要最高级别的安全性

**流程**:
1. 热钱包创建交易请求 → 生成二维码
2. 冷钱包扫描 → 显示交易详情 → 用户确认
3. 冷钱包签名 → 生成签名响应二维码
4. 热钱包扫描签名 → 广播到区块链

**安全性**: ⭐⭐⭐⭐⭐ (最高)

### 2. DApp 消息签名

**适用场景**: Web3 应用需要用户签名验证身份

**流程**:
1. DApp 生成消息签名请求
2. 钱包扫描 → 显示消息内容 → 签名
3. DApp 扫描签名结果 → 验证身份

**安全性**: ⭐⭐⭐⭐

### 3. 地址分享

**适用场景**: 分享收款地址给他人

**流程**:
1. 钱包生成地址信息二维码
2. 对方扫描获取地址和链信息
3. 自动填充到发送表单

**便利性**: ⭐⭐⭐⭐⭐

### 4. DApp 授权

**适用场景**: 授权第三方应用访问钱包

**流程**:
1. DApp 生成授权请求
2. 钱包扫描 → 显示权限详情 → 授权
3. DApp 扫描授权响应 → 获得访问权限

**安全性**: ⭐⭐⭐⭐

---

## 🌐 多链支持

### Bitcoin (BTC)

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_TRANSACTION_REQUEST",
  "data": {
    "chain": "BTC",
    "network": "mainnet",
    "from": "bc1p...",  // Taproot 地址
    "to": "bc1q...",
    "amount": "0.001",
    "fee": "0.00001"
  }
}
```

### Ethereum (ETH)

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_TRANSACTION_REQUEST",
  "data": {
    "chain": "ETH",
    "network": "mainnet",
    "from": "0x...",
    "to": "0x...",
    "amount": "0.1",
    "gasLimit": "21000",
    "gasPrice": "50000000000",  // 50 Gwei
    "nonce": "123"
  }
}
```

### ERC20 代币

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_TRANSACTION_REQUEST",
  "data": {
    "chain": "ETH",
    "network": "mainnet",
    "from": "0x...",
    "to": "0x...",  // 代币合约地址
    "amount": "100",  // USDT 数量
    "tokenAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "tokenSymbol": "USDT"
  }
}
```

---

## 📊 与其他协议的对比

| 特性 | WDK 协议 | WalletConnect | MetaMask |
|-----|---------|---------------|----------|
| 离线签名 | ✅ 完全支持 | ❌ 需要网络 | ❌ 需要网络 |
| 二维码传输 | ✅ 原生支持 | ❌ 不支持 | ❌ 不支持 |
| 多链支持 | ✅ BTC+ETH | ✅ 多链 | ✅ EVM链 |
| 冷钱包 | ✅ 专为设计 | ❌ 不适用 | ❌ 不适用 |
| 标准化 | ✅ 完整规范 | ✅ 标准 | ⚠️ 私有 |
| 开源 | ✅ MIT | ✅ Apache | ⚠️ 部分 |

---

## 🔄 版本演进

### v1.0.0 (当前版本)

**发布日期**: 2025-10-20

**功能**:
- ✅ 基础协议框架
- ✅ 交易签名请求/响应
- ✅ 消息签名请求/响应
- ✅ 授权请求/响应
- ✅ 地址信息
- ✅ 错误响应
- ✅ 时间戳验证
- ✅ 版本控制

### v1.1.0 (计划中)

**预计发布**: 2025 Q1

**计划功能**:
- [ ] PSBT (Partially Signed Bitcoin Transaction) 支持
- [ ] 批量交易支持
- [ ] NFT 转账支持
- [ ] 多重签名支持
- [ ] 消息加密传输

### v2.0.0 (未来)

**预计发布**: 2025 Q2

**计划功能**:
- [ ] NFC 传输支持
- [ ] 蓝牙传输支持
- [ ] 硬件钱包集成
- [ ] 更多区块链支持

---

## 💻 代码示例

### 创建交易请求

```typescript
import { ProtocolUtils, ChainType, NetworkType } from '@/utils/protocol';

// 创建 BTC 转账请求
const txRequest = ProtocolUtils.createTransactionRequest({
  from: 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr',
  to: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  amount: '0.001',
  fee: '0.00001',
  chain: ChainType.BTC,
  network: NetworkType.MAINNET,
  memo: '测试转账',
});

// 生成二维码
const qrData = ProtocolUtils.serializeMessage(txRequest);
const qrCodeUrl = await QRCode.toDataURL(qrData, {
  width: 300,
  errorCorrectionLevel: 'M',
});
```

### 解析和验证消息

```typescript
// 扫描二维码得到数据
const scannedData = '{"protocol":"WDK","version":"1.0.0",...}';

// 解析消息
const message = ProtocolUtils.parseMessage(scannedData);

if (!message) {
  console.error('无效的协议消息');
  return;
}

// 验证消息
const validation = ProtocolUtils.validateMessage(message);

if (!validation.valid) {
  console.error('验证失败:', validation.error);
  return;
}

// 处理消息
switch (message.type) {
  case 'SIGN_TRANSACTION_REQUEST':
    handleTransactionRequest(message);
    break;
  case 'SIGN_MESSAGE_REQUEST':
    handleMessageRequest(message);
    break;
  // ...
}
```

### 创建签名响应

```typescript
// 签名后创建响应
const txResponse = ProtocolUtils.createTransactionResponse({
  txId: 'tx_123456',
  signature: '304402207a8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d...',
  publicKey: '02a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0...',
  signedTx: '01000000...',
});

// 生成二维码
const responseQrCode = await QRCode.toDataURL(
  ProtocolUtils.serializeMessage(txResponse),
  { width: 300 }
);
```

---

## 📚 文档资源

### 核心文档

1. **协议规范**: `docs/protocol.md`
   - 完整的技术规范
   - 消息类型定义
   - 安全要求
   - 使用示例

2. **使用指南**: `docs/protocol-usage-guide.md`
   - 详细的使用说明
   - 完整的流程示例
   - 常见问题解答
   - 最佳实践

3. **实现总结**: `docs/implementation-summary.md`
   - 实现细节
   - 架构设计
   - 代码示例
   - 测试指南

### 代码资源

1. **协议工具类**: `src/utils/protocol.ts`
   - TypeScript 实现
   - 类型定义
   - API 文档

2. **测试工具**: `tools/protocol-qr-generator.html`
   - 二维码生成器
   - 协议测试工具
   - 可视化界面

---

## 🧪 测试和验证

### 单元测试

```typescript
// 测试消息创建
describe('ProtocolUtils.createTransactionRequest', () => {
  it('should create valid transaction request', () => {
    const request = ProtocolUtils.createTransactionRequest({
      from: 'bc1p...',
      to: 'bc1q...',
      amount: '0.001',
      fee: '0.00001',
      chain: ChainType.BTC,
      network: NetworkType.MAINNET,
    });

    expect(request.protocol).toBe('WDK');
    expect(request.version).toBe('1.0.0');
    expect(request.type).toBe('SIGN_TRANSACTION_REQUEST');
    expect(request.data.amount).toBe('0.001');
  });
});
```

### 集成测试

使用 `tools/protocol-qr-generator.html`:
1. 生成测试二维码
2. 使用应用扫描
3. 验证数据解析正确
4. 验证签名流程完整

---

## 🎓 最佳实践

### 1. 安全实践

✅ **DO**:
- 在冷钱包上验证所有交易详情
- 使用最新版本的协议
- 定期更新安全补丁
- 备份助记词和私钥

❌ **DON'T**:
- 不要在网络环境中使用冷钱包
- 不要通过网络传输私钥
- 不要跳过交易确认
- 不要使用不可信的二维码

### 2. 开发实践

✅ **DO**:
- 使用 TypeScript 保证类型安全
- 验证所有输入数据
- 处理所有错误情况
- 编写完整的测试

❌ **DON'T**:
- 不要硬编码敏感信息
- 不要忽略版本兼容性
- 不要跳过数据验证
- 不要使用过期的 API

### 3. 用户体验

✅ **DO**:
- 显示清晰的交易详情
- 提供友好的错误提示
- 支持多语言
- 提供详细的帮助文档

❌ **DON'T**:
- 不要使用技术术语
- 不要隐藏重要信息
- 不要跳过用户确认
- 不要忽视可访问性

---

## 🤝 社区和支持

### 贡献指南

欢迎为 WDK 协议做出贡献:

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 创建 Pull Request

### 反馈渠道

- 📧 Email: wdk@tether.to
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📖 Docs: 本仓库文档

---

## 📄 许可证

WDK 协议采用 **MIT License**

```
Copyright (c) 2025 Tether WDK Wallet Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🎉 总结

**Tether WDK 协议**是一个:
- ✅ 专业的钱包开发工具包
- ✅ 标准化的通信协议
- ✅ 安全的离线签名方案
- ✅ 完整的技术文档
- ✅ 开源的实现代码

它为构建安全、可靠的加密货币钱包提供了坚实的基础! 🚀

---

**协议版本**: 1.0.0  
**最后更新**: 2025-10-20  
**维护者**: Tether WDK Team
