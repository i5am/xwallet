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

- [x] 观察钱包功能（只读模式，无私钥）
- [x] 钱包模式切换（在设置中切换热钱包/冷钱包/观察钱包）
- [x] 签名功能扫描未签名交易二维码
- [x] 扫描已签名交易二维码并广播
- [x] OCR 文字识别功能（调用摄像头识别文字）✅ **已完成**
- [ ] 对接实际的区块链广播 API
- [ ] 实现真实的交易历史查询
- [ ] 添加交易状态实时更新

## 2025-10-28 观察钱包和签名功能完善

### 新增功能

#### 6. 观察钱包功能 👁️
- **功能**: 只读模式，无私钥，仅查看余额和交易历史
- **实现**:
  - 导入钱包时可选择"观察钱包"类型
  - 只需输入地址，不需要私钥或助记词
  - 禁用发送和签名按钮
  - 显示观察钱包专属提示
- **位置**: 
  - 导入逻辑: `src/App.tsx` Line ~237
  - UI 按钮禁用: Line ~1600, ~1635
  - 钱包详情: Line ~3080

#### 7. 钱包模式切换 ⚙️
- **功能**: 在设置中动态切换钱包模式
- **支持模式**:
  - 🔥 **热钱包** → 自动同步余额，可发送和签名
  - ❄️ **冷钱包** → 手动刷新余额，可签名，断网使用
  - 👁️ **观察钱包** → 只读模式，无私钥（⚠️ 切换后不可逆）
- **安全机制**:
  - 切换为观察钱包前需要确认
  - 切换后永久删除私钥和助记词
  - 观察钱包无法切换回热/冷钱包
- **位置**: `src/App.tsx` Line ~2485

#### 8. 签名功能完善 ✍️
- **新增**: 扫描未签名交易二维码
- **实现**:
  - 签名对话框添加扫描按钮（蓝色）
  - 自动识别 UNSIGNED_TX 类型
  - 填充消息内容后可签名
- **位置**: `src/App.tsx` Line ~2196

#### 9. 扫描已签名交易 📡
- **新增**: 发送对话框可扫描已签名交易
- **实现**:
  - 扫描冷钱包生成的 SIGNED_TX 二维码
  - 自动调用 `broadcastTransaction` 广播
  - 显示广播结果和 TXID
- **位置**: `src/App.tsx` Line ~2082

#### 10. OCR 文字识别 ✅ �
- **功能**: 调用摄像头进行 OCR 文字识别
- **技术**: Tesseract.js OCR 引擎
- **支持语言**: 英文 + 简体中文
- **实现**:
  ```typescript
  const captureAndRecognize = async () => {
    // 1. 拍照
    ctx.drawImage(video, 0, 0);
    
    // 2. OCR 识别
    const result = await Tesseract.recognize(
      canvas,
      'eng+chi_sim',  // 英文+简体中文
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOCRProgress(Math.round(m.progress * 100));
          }
        }
      }
    );
    
    // 3. 填充结果
    callback(result.data.text.trim());
  }
  ```
- **UI 特性**:
  - 实时显示识别进度（0-100%）
  - 拍照预览
  - 识别中禁用操作
- **位置**: `src/App.tsx` Line ~851-945
- **UI 对话框**: Line ~3849-3927

### 技术改进

#### 1. 钱包类型验证
```typescript
// 观察钱包地址验证
if (importChain === ChainType.BTC) {
  if (!address.startsWith('bc1') && !address.startsWith('1') && !address.startsWith('3')) {
    alert('❌ 不是有效的 BTC 地址格式');
    return;
  }
} else {
  if (!address.startsWith('0x') || address.length !== 42) {
    alert('❌ 不是有效的 ETH 地址格式');
    return;
  }
}
```

#### 2. 钱包模式切换逻辑
```typescript
// 切换为观察钱包（不可逆）
const updatedWallets = wallets.map(w => 
  w.id === selectedWallet.id 
    ? { 
        ...w, 
        type: WalletType.WATCH_ONLY, 
        privateKey: undefined,
        mnemonic: undefined,
        publicKey: undefined
      }
    : w
);
```

#### 3. 按钮状态控制
```typescript
// 观察钱包禁用发送按钮
<button 
  disabled={selectedWallet?.type === WalletType.WATCH_ONLY}
  className={selectedWallet?.type === WalletType.WATCH_ONLY 
    ? 'opacity-50 cursor-not-allowed' 
    : ''
  }
>
  发送 {selectedWallet?.type === WalletType.WATCH_ONLY && ' 🔒'}
</button>
```

### UI 改进

1. **导入对话框**
   - 3 列布局：热钱包 | 冷钱包 | 观察钱包
   - 观察钱包显示专属提示
   - 地址输入框支持扫描二维码

2. **设置对话框**
   - 新增"钱包模式切换"选项
   - 3 个按钮切换不同模式
   - 显示当前模式图标和警告

3. **签名对话框** ✅ 完整功能
   - 添加扫描按钮（蓝色相机图标 📷）
   - 添加 OCR 按钮（绿色相机图标 📷）
   - 提示可使用两种方式输入
   - OCR 识别进度条显示

4. **发送对话框**
   - 添加"扫描签名结果"按钮
   - 自动识别并广播已签名交易
   - 显示广播状态

5. **首页优化**
   - ❌ 移除"扫描未签名交易"按钮
   - ❌ 移除"扫描已签名交易"按钮
   - ✅ 保留"查看交易历史"按钮
   - 功能位置更合理，避免混淆

6. **OCR 对话框** 🆕
   - 实时摄像头预览
   - 拍照按钮
   - 进度条显示（0-100%）
   - 识别状态提示
   - 结果自动填充

### Git 提交记录

```bash
# 主要功能实现
commit ec07a60 - feat: 实现完整离线交易流程和助记词安全显示

# 扫描功能修复
commit fbf9710 - fix: 改进输入扫描功能的调试和错误处理
commit c08e0fc - fix: 修复视频扫描循环未启动的问题
commit 67a1cd4 - fix: 修复扫描 callback 未保存的问题

# 观察钱包和模式切换
commit d454a12 - feat: 实现观察钱包、钱包模式切换和签名扫描功能
commit c22d934 - docs: 添加观察钱包和签名功能使用指南

# OCR 功能实现
commit 0eeb9bf - feat: 实现OCR文字识别功能并优化扫描按钮位置 ✨
```

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
