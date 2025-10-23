# 二维码测试示例

本文档提供了用于测试扫描功能的二维码数据示例。

## 消息签名请求示例

### 示例 1: 简单消息

```json
{
  "message": "Hello, this is a test message for signing",
  "timestamp": 1234567890
}
```

### 示例 2: 带地址的消息

```json
{
  "message": "Please sign this message to prove ownership",
  "address": "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
  "timestamp": 1234567890
}
```

### 示例 3: 登录验证消息

```json
{
  "message": "Login verification for example.com",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "timestamp": 1234567890,
  "domain": "example.com"
}
```

## 交易签名请求示例

### BTC 交易示例

```json
{
  "to": "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
  "amount": "0.001",
  "chain": "BTC",
  "fee": "0.00001"
}
```

### ETH 交易示例

```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.1",
  "chain": "ETH",
  "gasLimit": "21000",
  "gasPrice": "20000000000"
}
```

### ERC20 代币转账示例

```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "100",
  "chain": "ETH",
  "tokenAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "tokenSymbol": "USDT",
  "decimals": 6
}
```

### 复杂交易示例

```json
{
  "transaction": {
    "to": "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
    "amount": "0.005",
    "chain": "BTC",
    "inputs": [
      {
        "txid": "abc123...",
        "vout": 0,
        "value": "0.006"
      }
    ],
    "outputs": [
      {
        "address": "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
        "value": "0.005"
      },
      {
        "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "value": "0.00099"
      }
    ],
    "fee": "0.00001"
  }
}
```

## 如何生成测试二维码

### 方法 1: 使用在线工具

1. 访问 https://www.qr-code-generator.com/
2. 选择 "Text" 类型
3. 复制上述 JSON 数据
4. 粘贴到文本框
5. 生成二维码

### 方法 2: 使用 Node.js

安装 qrcode 包：

```bash
npm install qrcode
```

创建生成脚本 `generate-qr.js`：

```javascript
const QRCode = require('qrcode');
const fs = require('fs');

// 消息签名请求
const messageData = {
  message: "Hello, this is a test message",
  timestamp: Date.now()
};

// 生成二维码
QRCode.toFile('message-qr.png', JSON.stringify(messageData), {
  width: 300,
  margin: 2
}, function (err) {
  if (err) throw err;
  console.log('Message QR code saved to message-qr.png');
});

// 交易签名请求
const transactionData = {
  to: "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
  amount: "0.001",
  chain: "BTC"
};

QRCode.toFile('transaction-qr.png', JSON.stringify(transactionData), {
  width: 300,
  margin: 2
}, function (err) {
  if (err) throw err;
  console.log('Transaction QR code saved to transaction-qr.png');
});
```

运行脚本：

```bash
node generate-qr.js
```

### 方法 3: 使用 Python

安装 qrcode 包：

```bash
pip install qrcode[pil]
```

创建生成脚本 `generate_qr.py`：

```python
import qrcode
import json

# 消息签名请求
message_data = {
    "message": "Hello, this is a test message",
    "timestamp": 1234567890
}

img = qrcode.make(json.dumps(message_data))
img.save('message-qr.png')
print('Message QR code saved to message-qr.png')

# 交易签名请求
transaction_data = {
    "to": "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
    "amount": "0.001",
    "chain": "BTC"
}

img = qrcode.make(json.dumps(transaction_data))
img.save('transaction-qr.png')
print('Transaction QR code saved to transaction-qr.png')
```

运行脚本：

```bash
python generate_qr.py
```

## 测试流程

### 1. 准备测试二维码

使用上述方法生成测试二维码图片。

### 2. 启动钱包应用

```bash
cd d:\projects\wdk
npm run dev
```

### 3. 创建或导入钱包

如果还没有钱包，先创建一个热钱包或冷钱包。

### 4. 点击"扫描二维码"按钮

在钱包详情页面，点击蓝色的"扫描二维码"按钮。

### 5. 扫描测试二维码

- 使用另一台设备显示二维码图片
- 或打印二维码
- 将摄像头对准二维码

### 6. 验证识别结果

- 消息签名：应显示消息内容和签名按钮
- 交易签名：应显示交易详情和签名按钮

### 7. 执行签名

点击签名按钮，验证是否生成签名结果二维码。

## 高级测试场景

### 场景 1: 冷钱包气隙交易

1. **设备 A (在线钱包)**：
   - 生成交易二维码
   - 显示在屏幕上

2. **设备 B (冷钱包)**：
   - 扫描交易二维码
   - 查看交易详情
   - 使用冷钱包签名
   - 生成签名二维码

3. **设备 A (在线钱包)**：
   - 扫描签名二维码
   - 广播交易

### 场景 2: 多设备消息签名

1. **设备 A**：生成消息签名请求二维码
2. **设备 B**：扫描并签名
3. **设备 A**：扫描签名结果并验证

### 场景 3: 批量签名

1. 生成多个交易二维码
2. 依次扫描并签名
3. 收集所有签名结果

## 故障排查

### 二维码无法识别

**检查项**：
- 二维码是否清晰完整
- JSON 格式是否正确
- 光线是否充足
- 摄像头焦距是否合适

**调试方法**：
1. 在控制台查看扫描日志
2. 验证 JSON 数据格式
3. 使用在线 QR 解析器验证二维码内容

### 签名失败

**检查项**：
- 钱包类型（观测钱包无法签名）
- 钱包是否有私钥
- 链类型是否匹配

## 参考链接

- [QR Code Generator](https://www.qr-code-generator.com/)
- [qrcode npm package](https://www.npmjs.com/package/qrcode)
- [Python qrcode](https://pypi.org/project/qrcode/)
- [Online QR Code Reader](https://webqr.com/)
