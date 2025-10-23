# 二维码扫描确认流程文档

## 概述

本文档详细说明了二维码扫描功能中的确认和签名流程，包括消息签名、交易签名和授权确认三种主要场景。

## 流程架构

### 整体流程

```
1. 用户点击"扫描二维码"按钮
   ↓
2. 启动摄像头，开始扫描
   ↓
3. 识别二维码并解析数据
   ↓
4. 自动识别数据类型（消息/交易/授权/原始数据）
   ↓
5. 显示详细确认对话框
   ↓
6. 用户审查信息
   ↓
7. 用户确认或取消
   ↓
8. 执行签名操作
   ↓
9. 生成签名结果二维码
   ↓
10. 显示结果供在线钱包扫描
```

## 三种主要场景

### 1. 消息签名流程

#### 数据格式

```json
{
  "type": "message",
  "message": "需要签名的消息内容",
  "address": "请求者地址（可选）",
  "timestamp": 1234567890
}
```

#### 确认界面显示

- **警告提示**：⚠️ 黄色背景，提醒用户仔细确认消息内容
- **消息内容**：完整显示需要签名的文本
- **请求者地址**：如果提供，显示请求签名的地址
- **时间戳**：显示请求时间
- **签名钱包**：显示当前使用的钱包信息
  - 钱包地址
  - 区块链类型
  - 钱包名称

#### 用户操作

- **取消**：关闭对话框，不执行签名
- **确认签名**：执行签名操作

#### 签名过程

1. 验证钱包类型（不能是观测钱包）
2. 验证钱包是否有私钥
3. 根据区块链类型执行签名
   - BTC：生成 BTC 签名格式
   - ETH：生成 ETH 签名格式
4. 生成签名结果数据结构：

```json
{
  "type": "message_signature",
  "message": "原始消息",
  "signature": "签名结果",
  "address": "签名者地址",
  "chain": "区块链类型",
  "publicKey": "公钥",
  "timestamp": 1234567890,
  "version": "1.0"
}
```

5. 生成二维码
6. 显示成功提示和二维码

### 2. 交易签名流程

#### 数据格式

```json
{
  "type": "transaction",
  "to": "收款地址",
  "amount": "0.001",
  "chain": "BTC",
  "fee": "0.00001",
  "data": "0x...",
  "nonce": 123
}
```

或嵌套格式：

```json
{
  "type": "transaction",
  "transaction": {
    "to": "收款地址",
    "amount": "0.001",
    "chain": "BTC",
    "fee": "0.00001"
  }
}
```

#### 确认界面显示

- **警告提示**：⚠️ 红色背景，强调交易风险
- **收款地址**：完整显示，使用等宽字体
- **转账金额**：大号字体，蓝色高亮显示
- **区块链类型**：显示链名称
- **手续费**：如果提供，显示手续费金额
- **交易数据**：如果有合约调用数据，显示（可滚动）
- **签名钱包**：显示当前钱包信息

#### 用户操作

- **取消**：关闭对话框，不执行签名
- **确认签名交易**：红色按钮，执行交易签名

#### 签名过程

1. 验证钱包类型（不能是观测钱包）
2. 验证钱包是否有私钥
3. 验证交易数据完整性
   - 必须有收款地址
   - 必须有金额
4. 验证链类型是否匹配
5. 根据区块链类型构建和签名交易
   - BTC：构建 UTXO 交易
   - ETH：构建 EIP-1559 交易
6. 生成签名交易数据结构：

```json
{
  "type": "signed_transaction",
  "transaction": {
    "from": "发送者地址",
    "to": "收款地址",
    "amount": "0.001",
    "chain": "BTC",
    "fee": "0.00001",
    "nonce": 123,
    "data": "0x"
  },
  "signedTransaction": "已签名的交易十六进制",
  "signature": "签名",
  "signedBy": "签名者地址",
  "signedAt": 1234567890,
  "version": "1.0"
}
```

7. 生成二维码
8. 显示成功提示和二维码

### 3. 授权确认流程

#### 数据格式

```json
{
  "type": "authorization",
  "domain": "example.com",
  "scope": ["read_address", "sign_message"],
  "expiresIn": 3600
}
```

或嵌套格式：

```json
{
  "type": "authorization",
  "authorization": {
    "domain": "example.com",
    "scope": ["read_address", "sign_message"],
    "expiresIn": 3600
  }
}
```

#### 确认界面显示

- **提示信息**：🔐 紫色背景，说明应用请求授权
- **请求域名**：显示请求授权的网站域名
- **授权范围**：列表显示所有授权项
  - read_address：读取钱包地址
  - sign_message：签名消息
  - sign_transaction：签名交易
  - 其他自定义权限
- **有效期**：显示授权有效时长（分钟）
- **授权钱包**：显示当前钱包信息

#### 用户操作

- **拒绝**：关闭对话框，不授权
- **确认授权**：紫色按钮，执行授权

#### 授权过程

1. 验证钱包类型（不能是观测钱包）
2. 验证钱包是否有私钥
3. 生成授权令牌
4. 生成授权签名
5. 生成授权响应数据结构：

```json
{
  "type": "authorization_response",
  "authorization": {
    "domain": "example.com",
    "scope": ["read_address", "sign_message"],
    "expiresAt": 1234567890
  },
  "token": "授权令牌",
  "signature": "授权签名",
  "address": "授权地址",
  "chain": "区块链类型",
  "authorizedAt": 1234567890,
  "version": "1.0"
}
```

6. 生成二维码
7. 显示成功提示和二维码

### 4. 原始数据显示

对于无法识别类型的数据，显示原始内容：

- 如果是纯文本，直接显示
- 如果是 JSON，格式化显示
- 提供"关闭"按钮

## 安全特性

### 1. 钱包类型验证

所有签名操作前都会验证：

```typescript
if (selectedWallet.type === WalletType.WATCH_ONLY) {
  alert('❌ 观测钱包无法签名，请使用热钱包或冷钱包');
  return;
}
```

### 2. 私钥验证

```typescript
if (!selectedWallet.privateKey) {
  alert('❌ 钱包缺少私钥，无法签名');
  return;
}
```

### 3. 交易数据验证

```typescript
if (!txData.to || !txData.amount) {
  alert('❌ 交易数据不完整，缺少收款地址或金额');
  return;
}
```

### 4. 链类型匹配验证

```typescript
if (txData.chain && txData.chain !== selectedWallet.chain) {
  alert(`❌ 链类型不匹配\n交易链: ${txData.chain}\n钱包链: ${selectedWallet.chain}`);
  return;
}
```

### 5. 签名过程状态管理

```typescript
setSignatureInProgress(true);
try {
  // 执行签名...
} catch (error) {
  alert(`❌ 签名失败: ${(error as Error).message}`);
} finally {
  setSignatureInProgress(false);
}
```

防止重复点击和并发签名。

## 用户体验优化

### 1. 颜色编码

- **消息签名**：黄色警告 - 中等风险
- **交易签名**：红色警告 - 高风险
- **授权请求**：紫色提示 - 需要仔细查看
- **成功状态**：绿色 - 操作成功
- **结果二维码**：蓝色 - 信息提示

### 2. 字体样式

- **地址**：等宽字体（font-mono）
- **金额**：大号加粗字体
- **标签**：小号大写字母（uppercase）
- **数据**：小号等宽字体（适合长文本）

### 3. 视觉层次

- **主标题**：2xl 字体，带图标
- **警告提示**：独立背景色块，突出显示
- **信息区域**：灰色背景，白色内容卡片
- **按钮**：明确的主次关系
  - 取消/拒绝：灰色
  - 确认签名：蓝色（消息）/红色（交易）/紫色（授权）

### 4. 加载状态

签名进行中时：
- 按钮显示"签名中..."或"授权中..."
- 按钮禁用（disabled）
- 防止用户误操作

### 5. 详细反馈

签名成功后的 Alert 提示包含：
- 操作类型
- 关键信息摘要
- 签名者地址
- 下一步操作指引

## 数据流程图

```
用户扫描二维码
    ↓
jsQR 解析数据
    ↓
handleScanResult()
    ↓
JSON.parse() 尝试解析
    ↓
识别数据类型
├─ type === 'message' → message
├─ type === 'authorization' → authorization  
├─ type === 'transaction' → transaction
└─ 其他 → raw
    ↓
setScanDataType()
setShowConfirmDialog(true)
    ↓
显示确认对话框
    ↓
用户审查信息
    ↓
用户点击确认
    ↓
执行对应的签名函数
├─ signScannedMessage()
├─ signScannedTransaction()
└─ authorizeScannedRequest()
    ↓
生成签名结果
    ↓
生成二维码
    ↓
显示结果
```

## 错误处理

### 1. 扫描失败

```typescript
try {
  const parsed = JSON.parse(data);
  setScanResult(parsed);
} catch (error) {
  // 作为原始数据处理
  setScanResult({ raw: data });
  setScanDataType('raw');
}
```

### 2. 签名失败

```typescript
try {
  // 执行签名...
} catch (error) {
  alert(`❌ 签名失败: ${(error as Error).message}`);
} finally {
  setSignatureInProgress(false);
}
```

### 3. 数据验证失败

- 显示具体的错误信息
- 不执行签名操作
- 保持对话框打开，允许用户查看数据

## 测试场景

### 消息签名测试

生成测试二维码：

```json
{
  "type": "message",
  "message": "Welcome to our DApp! Please sign this message to verify your identity.",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "timestamp": 1729411200000
}
```

### 交易签名测试

BTC 交易：

```json
{
  "type": "transaction",
  "to": "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
  "amount": "0.001",
  "chain": "BTC",
  "fee": "0.00001"
}
```

ETH 交易：

```json
{
  "type": "transaction",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.1",
  "chain": "ETH",
  "data": "0x"
}
```

### 授权请求测试

```json
{
  "type": "authorization",
  "domain": "app.example.com",
  "scope": ["read_address", "sign_message", "sign_transaction"],
  "expiresIn": 3600
}
```

## 最佳实践

### 1. 用户指引

- 在确认对话框中提供清晰的警告和说明
- 使用图标和颜色区分不同类型的操作
- 显示所有关键信息，不隐藏细节

### 2. 安全检查

- 始终验证钱包类型和私钥
- 验证数据完整性
- 验证链类型匹配
- 显示完整的地址和金额，不截断

### 3. 错误提示

- 使用 emoji 图标增强视觉效果
- 提供具体的错误原因
- 建议用户如何解决问题

### 4. 操作确认

- 关键操作使用醒目颜色（红色、紫色）
- 提供取消/拒绝选项
- 签名进行中禁用按钮

## 未来改进

1. **真实签名实现**
   - 集成 bitcoinjs-lib 的真实签名
   - 集成 ethers.js 的真实签名
   - 支持 EIP-712 结构化数据签名

2. **批量操作**
   - 支持批量消息签名
   - 支持批量交易签名
   - 显示批量操作进度

3. **签名历史**
   - 记录所有签名操作
   - 支持查看历史记录
   - 支持导出签名记录

4. **高级验证**
   - 域名白名单
   - 金额限制提醒
   - 合约调用分析

5. **多语言支持**
   - 英文界面
   - 其他语言本地化

## 参考资料

- [BIP-322: Generic Signed Message Format](https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki)
- [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
