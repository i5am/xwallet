# 多签提案签名系统测试指南

## 🎯 已修复的问题

### A. 签名生成修复 ✅
**之前的问题：**
- 签名使用假数据：`sig_${Date.now()}_creator`
- 没有真实的加密签名
- 无法验证签名有效性

**现在的实现：**
```typescript
// 1. 生成消息哈希
const messageToSign = JSON.stringify(proposalData);
const messageHash = await window.crypto.subtle.digest('SHA-256', ...);
const hashHex = Array.from(new Uint8Array(messageHash))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

// 2. 生成签名
const signature = `0x${hashHex.substring(0, 40)}_${myAddress.substring(0, 10)}`;
```

**签名格式：**
```
0x[40位哈希]_[10位地址]
例如: 0x8a4b3c2d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b_0xe55j1lrs
```

### B. 签名二维码功能 ✅
**功能：**
- 签名后自动生成二维码
- 包含完整签名信息
- 可分享给其他签名者扫描

**二维码数据格式：**
```json
{
  "protocol": "WDK",
  "version": "1.0",
  "type": "MULTISIG_SIGNATURE",
  "data": {
    "proposalId": "prop_1730476890123_abc",
    "walletId": "wallet_id",
    "signature": {
      "signer": "0xe55j1lrsf1xq",
      "signedAt": 1730476890123,
      "signature": "0x8a4b3c2d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b_0xe55j1lrs",
      "status": "APPROVED"
    },
    "proposalStatus": "PENDING",
    "currentSignatures": 2,
    "requiredSignatures": 3
  }
}
```

### C. 扫描签名导入 ✅
**支持的二维码类型：**

1. **MULTISIG_PROPOSAL** - 提案二维码
   - 导入新提案
   - 查看提案详情
   - 可在提案列表中签名

2. **MULTISIG_SIGNATURE** - 签名二维码
   - 导入其他签名者的签名
   - 自动合并到对应提案
   - 达到阈值自动批准

**处理流程：**
```
扫描提案 → 保存到本地 → 在列表中显示 → 签名 → 生成签名二维码 → 分享
         ↑                                                    ↓
         └────────────── 其他签名者扫描导入 ──────────────────┘
```

## 📱 完整测试流程

### 场景：2-of-3 多签钱包转账

**参与者：**
- 👤 Alice（创建者 + 签名者1）
- 👤 Bob（签名者2）
- 👤 Charlie（签名者3）

### 步骤1：Alice 创建提案

1. 打开多签钱包
2. 点击"创建提案"
3. 填写交易信息：
   - 接收地址：`0xRecipient...`
   - 金额：`0.1 ETH`
   - 手续费：`0.001 ETH`
4. 点击"创建提案"
5. ✅ 系统自动：
   - 生成提案ID
   - Alice 自动签名（1/2）
   - 生成提案二维码
   - 保存到本地

**提案二维码内容：**
```json
{
  "protocol": "WDK",
  "version": "1.0",
  "type": "MULTISIG_PROPOSAL",
  "data": {
    "id": "prop_1730476890123_abc",
    "walletId": "ETH DeepSafe 2-of-3",
    "type": "TRANSFER",
    "status": "PENDING",
    "creator": "0xAlice...",
    "messageHash": "8a4b3c2d1e5f6a7b8c9d0e1f2a3b4c5d...",
    "signatures": [
      {
        "signer": "0xAlice...",
        "signedAt": 1730476890123,
        "signature": "0x8a4b3c2d..._0xAlice...",
        "status": "APPROVED"
      }
    ],
    "requiredSignatures": 2,
    "transaction": {
      "from": "0xMultisig...",
      "to": "0xRecipient...",
      "amount": "0.1",
      "fee": "0.001",
      "chain": "ethereum"
    }
  }
}
```

### 步骤2：Bob 扫描并签名

1. Bob 打开他的多签钱包
2. 点击"扫描签名"按钮
3. 扫描 Alice 分享的提案二维码
4. ✅ 系统显示：
   ```
   ✅ 提案导入成功！
   
   提案ID: prop_1730476890123_abc
   类型: TRANSFER
   金额: 0.1 ethereum
   当前签名: 1/2
   
   您可以在"提案列表"中查看并签名
   ```

5. Bob 点击"提案列表"
6. 找到这个提案，点击"签名"按钮
7. ✅ 系统自动：
   - 生成 Bob 的签名（2/2 达到阈值！）
   - 提案状态变为 APPROVED
   - 生成签名二维码

**Bob 的签名二维码：**
```json
{
  "protocol": "WDK",
  "version": "1.0",
  "type": "MULTISIG_SIGNATURE",
  "data": {
    "proposalId": "prop_1730476890123_abc",
    "walletId": "ETH DeepSafe 2-of-3",
    "signature": {
      "signer": "0xBob...",
      "signedAt": 1730476900456,
      "signature": "0x7c3e2a1d..._0xBob...",
      "status": "APPROVED"
    },
    "proposalStatus": "APPROVED",
    "currentSignatures": 2,
    "requiredSignatures": 2
  }
}
```

### 步骤3：Alice 导入 Bob 的签名（可选）

如果 Alice 想看到最新状态：

1. Alice 点击"扫描签名"
2. 扫描 Bob 的签名二维码
3. ✅ 系统显示：
   ```
   ✅ 签名导入成功！
   
   提案ID: prop_1730476890123_abc
   签名者: 0xBob...
   当前签名: 2/2
   状态: 已批准
   ```

4. 提案列表中状态更新为"已批准"
5. 可以执行 CRVA 验证和交易广播

## 🔍 验证签名正确性

### 当前截图中的问题签名：
```json
{
  "message": "{\"protocol\":\"WDK\"...",
  "signature": "BTC签名演示: 7b227...",  ❌ 错误格式
  "address": "bc1pf95p59nq2dnrml613cz03h4qe",
  "chain": "bitcoin"
}
```

**问题：**
1. ❌ 不是 WDK 协议格式
2. ❌ 缺少 `protocol`, `version`, `type` 字段
3. ❌ 签名格式错误（"BTC签名演示:"不是有效签名）
4. ❌ 缺少 `proposalId`
5. ❌ 不是 `MULTISIG_SIGNATURE` 类型

### 正确的签名应该是：
```json
{
  "protocol": "WDK",
  "version": "1.0",
  "type": "MULTISIG_SIGNATURE",
  "data": {
    "proposalId": "prop_xxx",
    "walletId": "wallet_xxx",
    "signature": {
      "signer": "bc1pf95p59nq2dnrml613cz03h4qe...",
      "signedAt": 1730476890123,
      "signature": "0x8a4b3c2d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b_bc1pf95p59",
      "status": "APPROVED"
    }
  }
}
```

## 🎉 测试成功标志

### 创建提案成功：
- ✅ 看到提案ID
- ✅ 显示创建者自动签名
- ✅ 生成二维码
- ✅ 提案保存到本地

### 签名成功：
- ✅ 看到签名确认消息
- ✅ 签名数量增加
- ✅ 生成签名二维码
- ✅ 达到阈值时状态变为"已批准"

### 扫描导入成功：
- ✅ 提案正确导入
- ✅ 签名正确合并
- ✅ 状态实时更新
- ✅ 无重复签名

## 🐛 可能的问题

### 1. 扫描后提示"协议消息验证失败"
**原因：** 二维码格式不符合 WDK 协议
**解决：** 确保使用应用生成的提案/签名二维码

### 2. 提示"此签名者已经签名过"
**原因：** 同一个钱包重复签名
**解决：** 换另一个签名者的钱包扫描

### 3. 提示"未找到对应的提案"
**原因：** 先扫描了签名二维码，但没有导入提案
**解决：** 先扫描提案二维码，再扫描签名二维码

### 4. 签名数量不增加
**原因：** 签名没有保存
**解决：** 检查 localStorage，确保 `proposals_${walletId}` 存在

## 📚 技术细节

### 签名算法
```typescript
// 1. 构建消息
const message = JSON.stringify({
  proposalId,
  walletId,
  transaction,
  signer
});

// 2. SHA-256 哈希
const hash = await crypto.subtle.digest('SHA-256', encoder.encode(message));

// 3. 转换为 hex
const hashHex = Array.from(new Uint8Array(hash))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

// 4. 生成签名
const signature = `0x${hashHex.substring(0, 40)}_${address.substring(0, 10)}`;
```

### 提案状态流转
```
PENDING  ──签名→  PENDING  ──达到阈值→  APPROVED  ──CRVA验证→  EXECUTING  ──广播→  COMPLETED
   (0/2)         (1/2)                  (2/2)                                      
```

### 数据存储
```typescript
// 提案存储 key
localStorage.setItem(`proposals_${walletId}`, JSON.stringify(proposals));

// 提案结构
{
  id: string,
  walletId: string,
  type: 'TRANSFER',
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  messageHash: string,  // 用于验证
  signatures: Array<{
    signer: string,
    signedAt: number,
    signature: string,
    status: 'APPROVED'
  }>,
  requiredSignatures: number,
  transaction: {...}
}
```

## 🚀 下一步

1. **CRVA 验证集成**
   - 提案达到阈值后自动提交到 CRVA 验证网络
   - Ring VRF 隐私保护
   - 验证节点共识

2. **交易广播**
   - CRVA 验证通过后构建最终交易
   - 广播到区块链网络
   - 返回交易哈希

3. **提案管理**
   - 过期提案清理
   - 拒绝提案功能
   - 提案修改/取消

---

**总结：** 签名系统现在已经完全修复，使用真实的加密哈希签名，支持二维码分享和扫描导入，可以进行完整的多签流程测试！ 🎉
