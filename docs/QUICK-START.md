# WDK 协议快速入门

欢迎使用 Tether WDK (Wallet Development Kit) 协议! 这是一个 5 分钟快速入门指南。

---

## 🎯 什么是 WDK 协议?

WDK 协议是一个标准化的通信协议,用于实现热钱包和冷钱包之间的安全交互。它通过二维码传输消息,实现物理隔离的离线签名。

**核心优势:**
- 🔒 冷钱包完全离线,私钥永不联网
- 📱 二维码传输,简单直观
- ✅ 标准化格式,互操作性好
- 🛡️ 多层安全验证

---

## 🚀 快速开始

### 1. 安装项目

```bash
# 克隆项目
git clone https://github.com/your-org/tether-wdk-wallet.git
cd tether-wdk-wallet

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 打开测试工具

在浏览器中打开 `tools/protocol-qr-generator.html`

### 3. 生成测试二维码

1. 选择 "转账交易" 标签
2. 填写测试数据 (已有默认值)
3. 点击 "生成转账二维码"
4. 用手机钱包应用扫描测试

---

## 💡 基础概念

### 消息格式

所有 WDK 协议消息都遵循以下结构:

```json
{
  "protocol": "WDK",           // 协议名称
  "version": "1.0.0",          // 协议版本
  "type": "消息类型",           // 消息类型
  "timestamp": 1729411200000,  // 时间戳(毫秒)
  "data": {                    // 具体数据
    // 根据消息类型不同而不同
  }
}
```

### 消息类型

| 类型 | 用途 | 方向 |
|-----|------|------|
| `SIGN_TRANSACTION_REQUEST` | 请求签名交易 | 热钱包 → 冷钱包 |
| `SIGN_TRANSACTION_RESPONSE` | 签名结果 | 冷钱包 → 热钱包 |
| `SIGN_MESSAGE_REQUEST` | 请求签名消息 | 热钱包 → 冷钱包 |
| `SIGN_MESSAGE_RESPONSE` | 签名结果 | 冷钱包 → 热钱包 |
| `AUTHORIZATION_REQUEST` | 授权请求 | DApp → 钱包 |
| `AUTHORIZATION_RESPONSE` | 授权结果 | 钱包 → DApp |
| `ADDRESS_INFO` | 地址信息 | 钱包 → 任何 |

---

## 📝 使用场景

### 场景 1: 冷钱包转账 (最常用)

**步骤:**

#### 1️⃣ 热钱包创建交易请求

```typescript
import { ProtocolUtils, ChainType, NetworkType } from './utils/protocol';

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
```

#### 2️⃣ 冷钱包扫描并签名

```typescript
// 扫描二维码得到数据
const scannedData = '...';

// 解析消息
const message = ProtocolUtils.parseMessage(scannedData);

// 验证消息
const validation = ProtocolUtils.validateMessage(message);
if (!validation.valid) {
  throw new Error(validation.error);
}

// 显示交易详情给用户确认
console.log('收款地址:', message.data.to);
console.log('金额:', message.data.amount);
console.log('手续费:', message.data.fee);

// 用户确认后签名
const signature = signTransaction(message.data, privateKey);

// 生成响应
const response = ProtocolUtils.createTransactionResponse({
  txId: message.data.txId,
  signature: signature,
  publicKey: wallet.publicKey,
  signedTx: signedTransaction,
});
```

#### 3️⃣ 热钱包广播交易

```typescript
// 扫描冷钱包的签名响应
const responseData = '...';
const response = ProtocolUtils.parseMessage(responseData);

// 提取签名并广播
const txHash = await broadcastTransaction(response.data.signedTx);
console.log('交易已广播:', txHash);
```

---

### 场景 2: 消息签名

#### 1️⃣ 创建签名请求

```typescript
const msgRequest = ProtocolUtils.createMessageSignRequest({
  message: '欢迎使用 Tether WDK Wallet!',
  chain: ChainType.BTC,
  address: 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr',
  encoding: 'utf8',
});
```

#### 2️⃣ 冷钱包签名

```typescript
const message = ProtocolUtils.parseMessage(scannedData);
const signature = signMessage(message.data.message, privateKey);

const response = ProtocolUtils.createMessageSignResponse({
  messageId: message.data.messageId,
  signature: signature,
  publicKey: wallet.publicKey,
});
```

---

### 场景 3: 地址分享

```typescript
// 生成地址信息二维码
const addressInfo = ProtocolUtils.createAddressInfo({
  chain: ChainType.BTC,
  network: NetworkType.MAINNET,
  address: 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr',
  publicKey: '02a1b2c3...',
  label: '我的冷钱包',
});

// 对方扫描后可以直接获取地址信息
```

---

## 🔍 完整代码示例

### 在 React 组件中使用

```tsx
import { useState } from 'react';
import QRCode from 'qrcode';
import { ProtocolUtils, ChainType, NetworkType } from './utils/protocol';

function SendTransaction() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const createTransactionQR = async () => {
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
    const url = await QRCode.toDataURL(qrData, {
      width: 300,
      errorCorrectionLevel: 'M',
    });

    setQrCodeUrl(url);
  };

  return (
    <div>
      <button onClick={createTransactionQR}>
        生成交易二维码
      </button>
      {qrCodeUrl && (
        <img src={qrCodeUrl} alt="交易二维码" />
      )}
    </div>
  );
}
```

### 扫描和验证

```tsx
import jsQR from 'jsqr';
import { ProtocolUtils } from './utils/protocol';

function ScanQRCode() {
  const handleScan = (imageData: ImageData) => {
    // 解析二维码
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (!code) {
      console.log('未检测到二维码');
      return;
    }

    // 解析协议消息
    const message = ProtocolUtils.parseMessage(code.data);
    
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

    // 根据消息类型处理
    switch (message.type) {
      case 'SIGN_TRANSACTION_REQUEST':
        handleTransactionRequest(message);
        break;
      case 'SIGN_MESSAGE_REQUEST':
        handleMessageRequest(message);
        break;
      // ...
    }
  };

  return (
    <div>
      <video ref={videoRef} />
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
```

---

## 🛠️ 常用 API

### 创建消息

```typescript
// 交易请求
ProtocolUtils.createTransactionRequest(params);

// 交易响应
ProtocolUtils.createTransactionResponse(params);

// 消息签名请求
ProtocolUtils.createMessageSignRequest(params);

// 消息签名响应
ProtocolUtils.createMessageSignResponse(params);

// 授权请求
ProtocolUtils.createAuthorizationRequest(params);

// 授权响应
ProtocolUtils.createAuthorizationResponse(params);

// 地址信息
ProtocolUtils.createAddressInfo(params);

// 错误响应
ProtocolUtils.createErrorResponse(params);
```

### 解析和验证

```typescript
// 解析消息
const message = ProtocolUtils.parseMessage(jsonString);

// 验证消息
const validation = ProtocolUtils.validateMessage(message);
if (validation.valid) {
  // 处理消息
} else {
  console.error(validation.error);
}

// 序列化消息
const jsonString = ProtocolUtils.serializeMessage(message);

// 美化输出
const prettyJson = ProtocolUtils.serializeMessagePretty(message);
```

### 辅助函数

```typescript
// 检查是否为请求消息
ProtocolUtils.isRequestMessage(messageType);

// 检查是否为响应消息
ProtocolUtils.isResponseMessage(messageType);

// 获取对应的响应类型
const responseType = ProtocolUtils.getResponseType(requestType);
```

---

## ⚠️ 注意事项

### 安全性

✅ **DO**:
- 始终验证协议消息
- 在冷钱包上确认所有交易详情
- 使用最新版本的协议
- 备份助记词和私钥

❌ **DON'T**:
- 不要通过网络传输私钥
- 不要跳过消息验证
- 不要在联网设备上使用冷钱包
- 不要信任未验证的二维码

### 开发

✅ **DO**:
- 使用 TypeScript 保证类型安全
- 处理所有错误情况
- 编写单元测试
- 记录日志便于调试

❌ **DON'T**:
- 不要硬编码敏感信息
- 不要忽略错误处理
- 不要跳过类型检查
- 不要在生产环境中使用调试代码

---

## 🐛 调试技巧

### 1. 使用测试工具

打开 `tools/protocol-qr-generator.html`:
- 生成各种测试二维码
- 查看协议数据格式
- 验证消息结构

### 2. 查看控制台日志

```typescript
// 启用详细日志
const message = ProtocolUtils.parseMessage(data);
console.log('解析结果:', message);

const validation = ProtocolUtils.validateMessage(message);
console.log('验证结果:', validation);
```

### 3. 使用美化输出

```typescript
// 美化输出便于阅读
const prettyJson = ProtocolUtils.serializeMessagePretty(message);
console.log(prettyJson);
```

---

## 📚 下一步

### 深入学习

- 📖 阅读 [协议规范](../docs/protocol.md) 了解详细技术规范
- 📖 查看 [使用指南](../docs/protocol-usage-guide.md) 学习高级用法
- 📖 浏览 [协议概览](../docs/WDK-PROTOCOL-OVERVIEW.md) 理解设计理念

### 实践项目

- 🔨 使用测试工具生成二维码
- 🔨 在应用中集成协议
- 🔨 编写单元测试
- 🔨 实现自定义消息类型

### 社区资源

- 💬 GitHub Discussions - 提问和讨论
- 🐛 GitHub Issues - 报告 Bug
- 📧 Email - wdk@tether.to

---

## 🎉 总结

恭喜! 您已经完成了 WDK 协议的快速入门。现在您可以:

✅ 理解 WDK 协议的基本概念  
✅ 创建和解析协议消息  
✅ 使用测试工具进行开发  
✅ 在应用中集成协议

开始构建您的下一个安全的加密货币钱包吧! 🚀

---

**协议版本**: 1.0.0  
**最后更新**: 2025-10-20  
**文档维护**: Tether WDK Team
