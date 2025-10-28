# XWallet 开发日志

## 2025-10-28 离线交易功能实现

### 实现的功能

#### 1. 首页助记词安全显示 ⚠️
- **问题**: 助记词直接显示在首页，存在安全风险
- **解决方案**: 
  - 添加"查看助记词（需密码）"按钮
  - 输入密码后临时显示20秒
  - 使用 `PasswordService.verifyPassword()` 验证
- **位置**: `src/App.tsx` Line ~1420

#### 2. 未签名交易生成 🔒
- **功能**: 冷钱包生成未签名交易二维码
- **实现**:
  ```typescript
  const generateUnsignedTransaction = async () => {
    // 创建未签名交易数据
    const unsignedTxData = {
      protocol: 'WDK',
      version: '1.0',
      type: 'UNSIGNED_TX',
      data: { from, to, amount, fee, chain, network, memo, timestamp }
    };
    // 生成二维码
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(unsignedTxData));
  }
  ```
- **触发**: 冷钱包在发送对话框点击"🔒 生成未签名交易"
- **位置**: `src/App.tsx` Line ~696

#### 3. 冷钱包签名 ✍️
- **功能**: 扫描未签名交易并签名
- **实现**:
  ```typescript
  const signTransaction = async (unsignedTxData: any) => {
    // 使用私钥签名
    // 生成已签名交易二维码
  }
  ```
- **位置**: `src/App.tsx` Line ~734

#### 4. 交易广播 📡
- **功能**: 扫描已签名交易并广播到区块链
- **实现**:
  ```typescript
  const broadcastTransaction = async (signedTxData: any) => {
    // 广播到区块链网络
    // 返回交易ID (TXID)
  }
  ```
- **位置**: `src/App.tsx` Line ~788

#### 5. 交易历史记录 📜
- **功能**: 显示交易列表和状态
- **实现**: 模拟数据，待对接区块链API
- **位置**: `src/App.tsx` Line ~810

### 技术改进

#### 1. MessageType 扩展
在 `src/utils/protocol.ts` 中添加新的消息类型：
```typescript
export enum MessageType {
  // ... 现有类型
  UNSIGNED_TX = 'UNSIGNED_TX',      // 未签名交易
  SIGNED_TX = 'SIGNED_TX',          // 已签名交易
}
```

#### 2. 扫描功能修复 🔧
**问题**: 扫描框打开但无法扫描二维码

**根本原因**: React useState 异步更新导致 callback 丢失
```typescript
// ❌ 错误方式
setScanInputCallback(() => callback);
setTimeout(() => startInputScan(), 300);
// 此时 state 可能还未更新

// ✅ 正确方式 - 使用 useRef
const inputCallbackRef = useRef<((value: string) => void) | null>(null);
inputCallbackRef.current = callback;  // 立即保存
```

**关键代码**:
- Line 88: 添加 `inputCallbackRef`
- Line 750: 使用 ref 保存 callback
- Line 700: 使用 ref 调用 callback

#### 3. 视频流启动优化
```typescript
// 等待视频真正准备好
await new Promise((resolve) => {
  const checkReady = () => {
    if (inputVideoRef.current?.readyState >= 2) {
      resolve(true);
    } else {
      setTimeout(checkReady, 100);
    }
  };
  checkReady();
});
```

### UI 组件

添加了 4 个新对话框：
1. **未签名交易对话框** (`showUnsignedTxDialog`)
   - 显示未签名交易二维码
   - Line ~3080

2. **已签名交易对话框** (`showSignedTxDialog`)
   - 显示已签名交易二维码
   - Line ~3130

3. **交易广播对话框** (`showBroadcastDialog`)
   - 显示广播进度和结果
   - Line ~3180

4. **交易历史对话框** (`showTransactionHistory`)
   - 显示交易列表
   - Line ~3250

### 状态管理

新增 8 个状态变量：
```typescript
const [unsignedTxQrCode, setUnsignedTxQrCode] = useState<string>('');
const [showUnsignedTxDialog, setShowUnsignedTxDialog] = useState(false);
const [signedTxQrCode, setSignedTxQrCode] = useState<string>('');
const [showSignedTxDialog, setShowSignedTxDialog] = useState(false);
const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
const [broadcastResult, setBroadcastResult] = useState<string>('');
const [showTransactionHistory, setShowTransactionHistory] = useState(false);
const [transactions, setTransactions] = useState<any[]>([]);
```

### Git 提交记录

```bash
# 主要功能实现
commit ec07a60 - feat: 实现完整离线交易流程和助记词安全显示

# 扫描功能修复
commit fbf9710 - fix: 改进输入扫描功能的调试和错误处理
commit c08e0fc - fix: 修复视频扫描循环未启动的问题
commit 67a1cd4 - fix: 修复扫描 callback 未保存的问题
```

### 待办事项

- [ ] 观察钱包功能（只读模式，无私钥）
- [ ] 对接实际的区块链广播 API
- [ ] 实现真实的交易历史查询
- [ ] 添加交易状态实时更新

### 技术栈

- React 18 + TypeScript
- Vite 5.4.21
- jsQR (二维码识别)
- QRCode (二维码生成)
- BTCAdapter / ETHAdapter (区块链适配器)

### 调试技巧

1. **查看扫描日志**:
   ```
   🎥 开始请求摄像头权限...
   ✅ 摄像头权限已授予
   🔄 扫描循环已启动
   🎯 检测到二维码! {hasCallback: true}
   ```

2. **检查 callback 状态**:
   ```typescript
   console.log('hasCallback:', !!inputCallbackRef.current);
   ```

3. **视频就绪状态**:
   ```typescript
   console.log('readyState:', video.readyState);
   // 0: HAVE_NOTHING
   // 1: HAVE_METADATA
   // 2: HAVE_CURRENT_DATA (可以开始扫描)
   // 3: HAVE_FUTURE_DATA
   // 4: HAVE_ENOUGH_DATA
   ```

## 相关文档

- [密码功能使用说明](./PASSWORD_FEATURE.md)
- [离线交易流程](./OFFLINE_TRANSACTION_FLOW.md)
- [功能完成总结](./FEATURE_SUMMARY.md)
