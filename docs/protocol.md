# 冷钱包通信协议规范

## 概述
本协议定义了热钱包与冷钱包之间通过二维码进行通信的标准消息格式，用于实现离线签名功能。

## 协议版本
- 当前版本: `1.0.0`
- 协议前缀: `WDK://` (Wallet Development Kit)

## 消息格式

所有消息均采用 JSON 格式，通过二维码编码传输。

### 基础消息结构
```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "消息类型",
  "timestamp": 时间戳(毫秒),
  "data": { 消息数据 }
}
```

---

## 1. 转账交易 (Transfer Transaction)

### 1.1 热钱包 → 冷钱包 (请求签名)

**消息类型**: `SIGN_TRANSACTION_REQUEST`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_TRANSACTION_REQUEST",
  "timestamp": 1729411200000,
  "data": {
    "txId": "唯一交易ID",
    "chain": "BTC|ETH|BNB",
    "network": "mainnet|testnet",
    "from": "发送方地址",
    "to": "接收方地址",
    "amount": "转账金额(字符串)",
    "fee": "手续费(字符串)",
    "nonce": "交易序号(ETH)",
    "gasLimit": "Gas限制(ETH)",
    "gasPrice": "Gas价格(ETH)",
    "memo": "备注(可选)"
  }
}
```

**示例**:
```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_TRANSACTION_REQUEST",
  "timestamp": 1729411200000,
  "data": {
    "txId": "tx_20251020_001",
    "chain": "BTC",
    "network": "mainnet",
    "from": "bc1p...",
    "to": "bc1q...",
    "amount": "0.001",
    "fee": "0.00001",
    "memo": "测试转账"
  }
}
```

### 1.2 冷钱包 → 热钱包 (签名响应)

**消息类型**: `SIGN_TRANSACTION_RESPONSE`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_TRANSACTION_RESPONSE",
  "timestamp": 1729411260000,
  "data": {
    "txId": "对应的交易ID",
    "signature": "签名结果(hex)",
    "publicKey": "公钥(hex)",
    "signedTx": "完整签名交易(hex,可选)"
  }
}
```

---

## 2. 消息签名 (Message Signing)

### 2.1 热钱包 → 冷钱包 (请求签名)

**消息类型**: `SIGN_MESSAGE_REQUEST`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_MESSAGE_REQUEST",
  "timestamp": 1729411200000,
  "data": {
    "messageId": "唯一消息ID",
    "chain": "BTC|ETH|BNB",
    "address": "签名地址",
    "message": "待签名消息",
    "encoding": "utf8|hex|base64"
  }
}
```

### 2.2 冷钱包 → 热钱包 (签名响应)

**消息类型**: `SIGN_MESSAGE_RESPONSE`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_MESSAGE_RESPONSE",
  "timestamp": 1729411260000,
  "data": {
    "messageId": "对应的消息ID",
    "signature": "签名结果(hex)",
    "publicKey": "公钥(hex)"
  }
}
```

---

## 3. DApp授权 (Authorization)

### 3.1 热钱包 → 冷钱包 (请求授权)

**消息类型**: `AUTHORIZATION_REQUEST`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "AUTHORIZATION_REQUEST",
  "timestamp": 1729411200000,
  "data": {
    "requestId": "唯一请求ID",
    "dapp": "DApp名称",
    "dappUrl": "DApp网址",
    "chain": "BTC|ETH|BNB",
    "address": "钱包地址",
    "permissions": ["查看地址", "签名消息", "发送交易"],
    "expireTime": 过期时间戳
  }
}
```

### 3.2 冷钱包 → 热钱包 (授权响应)

**消息类型**: `AUTHORIZATION_RESPONSE`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "AUTHORIZATION_RESPONSE",
  "timestamp": 1729411260000,
  "data": {
    "requestId": "对应的请求ID",
    "approved": true,
    "signature": "授权签名(hex)",
    "publicKey": "公钥(hex)"
  }
}
```

---

## 4. 地址分享 (Address Sharing)

### 4.1 钱包地址二维码

**消息类型**: `ADDRESS_INFO`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "ADDRESS_INFO",
  "timestamp": 1729411200000,
  "data": {
    "chain": "BTC|ETH|BNB",
    "network": "mainnet|testnet",
    "address": "钱包地址",
    "publicKey": "公钥(hex,可选)",
    "label": "地址标签(可选)"
  }
}
```

**示例**:
```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "ADDRESS_INFO",
  "timestamp": 1729411200000,
  "data": {
    "chain": "BTC",
    "network": "mainnet",
    "address": "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
    "label": "我的BTC冷钱包"
  }
}
```

---

## 5. PSBT 交易 (Bitcoin Partially Signed Bitcoin Transaction)

### 5.1 热钱包 → 冷钱包 (PSBT签名请求)

**消息类型**: `SIGN_PSBT_REQUEST`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_PSBT_REQUEST",
  "timestamp": 1729411200000,
  "data": {
    "psbtId": "唯一PSBT ID",
    "psbt": "PSBT数据(base64)",
    "inputs": [
      {
        "address": "输入地址",
        "amount": "金额",
        "index": 0
      }
    ],
    "outputs": [
      {
        "address": "输出地址",
        "amount": "金额"
      }
    ],
    "fee": "手续费"
  }
}
```

### 5.2 冷钱包 → 热钱包 (PSBT签名响应)

**消息类型**: `SIGN_PSBT_RESPONSE`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "SIGN_PSBT_RESPONSE",
  "timestamp": 1729411260000,
  "data": {
    "psbtId": "对应的PSBT ID",
    "signedPsbt": "签名后的PSBT(base64)"
  }
}
```

---

## 安全规范

### 1. 数据验证
- 必须验证 `protocol` 字段为 `"WDK"`
- 必须验证 `version` 字段兼容性
- 必须验证 `timestamp` 在合理范围内(±5分钟)
- 必须验证 `chain` 和 `network` 与当前钱包匹配
- 必须验证地址格式正确性

### 2. 交易确认
- 转账前必须显示完整的交易信息
- 用户必须明确确认后才能签名
- 显示手续费和总金额
- 显示收款地址的完整内容

### 3. 签名安全
- 私钥永不通过二维码传输
- 签名过程在离线环境完成
- 签名结果包含公钥用于验证
- 每次签名使用唯一的ID追踪

### 4. 二维码规范
- 使用 QR Code 标准
- 错误纠正级别: M (15%)
- 最大数据量: 2953 字节 (Version 40)
- 编码: UTF-8

### 5. 过期策略
- 请求消息建议设置 5 分钟超时
- 授权消息可设置更长的有效期
- 过期的消息应被拒绝

---

## 错误处理

### 错误响应格式

**消息类型**: `ERROR_RESPONSE`

```json
{
  "protocol": "WDK",
  "version": "1.0.0",
  "type": "ERROR_RESPONSE",
  "timestamp": 1729411260000,
  "data": {
    "requestId": "对应的请求ID",
    "errorCode": "错误代码",
    "errorMessage": "错误描述",
    "details": "详细信息(可选)"
  }
}
```

### 错误代码

| 错误代码 | 说明 |
|---------|------|
| `INVALID_PROTOCOL` | 协议格式错误 |
| `UNSUPPORTED_VERSION` | 不支持的协议版本 |
| `INVALID_CHAIN` | 链类型不匹配 |
| `INVALID_ADDRESS` | 地址格式错误 |
| `INSUFFICIENT_BALANCE` | 余额不足 |
| `USER_REJECTED` | 用户拒绝 |
| `TIMEOUT` | 请求超时 |
| `SIGNATURE_FAILED` | 签名失败 |
| `UNKNOWN_ERROR` | 未知错误 |

---

## 使用流程示例

### 场景1: 冷钱包转账流程

1. **热钱包**: 创建转账请求，生成 `SIGN_TRANSACTION_REQUEST` 二维码
2. **冷钱包**: 扫描二维码，解析交易信息
3. **冷钱包**: 显示交易详情，用户确认
4. **冷钱包**: 使用私钥签名，生成 `SIGN_TRANSACTION_RESPONSE` 二维码
5. **热钱包**: 扫描签名结果，广播交易到区块链

### 场景2: DApp 消息签名

1. **热钱包**: DApp请求签名，生成 `SIGN_MESSAGE_REQUEST` 二维码
2. **冷钱包**: 扫描二维码，显示消息内容
3. **冷钱包**: 用户确认，签名消息，生成 `SIGN_MESSAGE_RESPONSE` 二维码
4. **热钱包**: 扫描签名结果，提交给DApp

---

## 兼容性说明

- 向后兼容: 新版本应能处理旧版本消息
- 向前兼容: 旧版本应忽略未知字段
- 扩展字段: 可在 `data` 中添加自定义字段

---

## 版本历史

- `1.0.0` (2025-10-20): 初始版本
  - 定义基础消息格式
  - 支持转账、消息签名、授权
  - 支持 BTC、ETH 链

---

## 附录

### A. 二维码容量参考

| Version | 纠错级别 M | 数字 | 字母数字 | 字节 |
|---------|-----------|------|---------|------|
| 10 | 15% | 224 | 136 | 93 |
| 20 | 15% | 858 | 523 | 358 |
| 30 | 15% | 1,872 | 1,140 | 784 |
| 40 | 15% | 4,296 | 2,953 | 2,953 |

### B. 地址格式参考

| 链 | 地址格式 | 示例 |
|----|---------|------|
| BTC (Legacy) | 1xxx | 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa |
| BTC (SegWit) | 3xxx | 3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy |
| BTC (Native SegWit) | bc1qxxx | bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq |
| BTC (Taproot) | bc1pxxx | bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr |
| ETH | 0xxxx | 0x742d35Cc6634C0532925a3b844Bc454e4438f44e |
| BNB | 0xxxx | 0x742d35Cc6634C0532925a3b844Bc454e4438f44e |

---

**协议维护者**: WDK Development Team  
**最后更新**: 2025-10-20
