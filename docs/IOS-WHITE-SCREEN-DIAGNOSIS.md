# 🔍 iOS 白屏问题 - 完整诊断清单

## 📋 已知的所有可能原因

### ✅ 1. 资源路径问题 (已修复)
**原因**: Vite 使用绝对路径 `/assets/...`  
**影响**: iOS capacitor:// scheme 无法加载  
**修复**: `vite.config.ts` 设置 `base: './'`  
**状态**: ✅ 已修复 (commit 22e590d)

---

### ✅ 2. Content Security Policy (已修复)
**原因**: 缺少 CSP 配置  
**影响**: 浏览器阻止加载脚本  
**修复**: 在 `index.html` 添加 CSP meta 标签  
**状态**: ✅ 已修复 (commit 22e590d)

---

### ⚠️ 3. JavaScript 运行时错误 (需要检查)

#### 3.1 Polyfill 问题
**风险**: Buffer/Process/Crypto polyfill 加载失败

**检查点**:
```typescript
// main.tsx
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;  // ✅ 已有
(window as any).global = window;   // ✅ 已有
(window as any).process = { env: {} };  // ✅ 已有
```

**可能的问题**:
- Buffer polyfill 在 iOS 上加载失败
- bitcoinjs-lib 等库依赖的 Node.js API 不可用

**解决方案**: 添加更完整的 shim

---

#### 3.2 Camera API 使用
**风险**: `navigator.mediaDevices.getUserMedia` 在 iOS 上未启用

```typescript
// App.tsx 第 392 行
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'environment' }
});
```

**问题**:
1. iOS WKWebView 可能不支持 getUserMedia
2. 需要使用 Capacitor Camera 插件替代
3. 如果直接调用会导致错误,可能导致整个应用崩溃

**解决方案**: 添加 try-catch 和降级处理

---

#### 3.3 QRCode 生成
**风险**: QRCode.toDataURL 在 iOS 上失败

```typescript
// App.tsx 多处
const qrUrl = await QRCode.toDataURL(...);
```

**问题**:
- Canvas API 在某些 iOS 版本上受限
- 大数据生成二维码可能内存溢出

**临时修复**: 已在代码中禁用自动生成 (第 67 行)
```typescript
// 临时禁用 QR 码生成以测试稳定性
setQrCodeDataUrl('占位符SVG');
```

---

### ⚠️ 4. 模块加载失败 (需要检查)

#### 4.1 大文件问题
**风险**: App.tsx 文件过大 (2121 行)

**影响**:
- 打包后的 JS 文件 4.6MB+ 
- iOS 加载大文件可能超时
- 内存占用过高

**解决方案**:
1. 代码分割 (Code Splitting)
2. 懒加载 (Lazy Loading)
3. 移除未使用的代码

---

#### 4.2 依赖问题
**风险**: bitcoinjs-lib/ethers.js 等库在 iOS 上不兼容

**大型依赖**:
```json
"bitcoinjs-lib": "^6.1.5",  // ~500KB
"ethers": "^6.9.0",         // ~1.5MB
"bip39": "^3.1.0",
"crypto-browserify": "^3.12.1"
```

**可能的问题**:
- 加密库依赖 Node.js API
- iOS 上的 polyfill 不完整
- WebAssembly 支持问题

---

### ⚠️ 5. 内存和性能问题

#### 5.1 state 过多
```typescript
const [wallets, setWallets] = useState<Wallet[]>([]);
const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
// ...大量 state (约 30+ 个)
```

**风险**:
- React 渲染性能问题
- 内存占用过高
- iOS 内存限制导致崩溃

---

#### 5.2 useEffect 无限循环
**检查点**:
```typescript
// 第 67 行 - 接收地址二维码生成
useEffect(() => {
  if (showReceiveDialog && selectedWallet) {
    // 可能导致循环
  }
}, [showReceiveDialog, selectedWallet, useProtocolFormat]);
```

**可能问题**:
- 依赖项频繁变化
- 导致无限渲染
- 内存泄漏

---

### ⚠️ 6. 原生插件问题

#### 6.1 Camera 插件
```json
"@capacitor/camera": "^7.0.2"
```

**可能的问题**:
- 插件未正确初始化
- iOS 权限配置错误
- 与自定义 QRScanner 插件冲突

---

#### 6.2 自定义 QRScanner 插件
**文件**:
- `ios/App/App/QRScannerPlugin.swift`
- `ios/App/App/QRScannerPlugin.m`

**可能的问题**:
- 插件注册失败
- Capacitor 桥接错误
- Swift 代码崩溃

---

### ⚠️ 7. iOS 特定问题

#### 7.1 WKWebView 限制
- localStorage 限制 (50MB)
- IndexedDB 限制
- Cookie 限制
- 跨域限制

#### 7.2 iOS 15.0+ 兼容性
**检查**:
- 是否使用了 iOS 15.0+ 才有的 API
- Podfile 部署目标是否正确

---

## 🛠️ 诊断步骤

### 第1步: 添加调试日志

修改 `index.html` 添加可见的调试信息:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content: capacitor: ionic:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';">
  <title>WDK Wallet</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    #root {
      min-height: 100vh;
    }
    /* 调试面板 - 始终显示在顶部 */
    #debug-panel {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #000;
      color: #0f0;
      padding: 10px;
      font-size: 10px;
      font-family: monospace;
      z-index: 999999;
      max-height: 150px;
      overflow-y: auto;
      border-bottom: 2px solid #0f0;
    }
    #debug-panel .log {
      margin: 2px 0;
      word-break: break-all;
    }
    #debug-panel .error {
      color: #f00;
      font-weight: bold;
    }
    #debug-panel .success {
      color: #0f0;
      font-weight: bold;
    }
    #debug-panel .warning {
      color: #ff0;
    }
  </style>
</head>
<body>
  <!-- 调试面板 -->
  <div id="debug-panel">
    <div class="log">🔍 初始化中...</div>
  </div>
  
  <div id="root"></div>
  
  <script>
    // 调试日志函数
    const debugPanel = document.getElementById('debug-panel');
    let logCount = 0;
    
    function debugLog(msg, type = 'log') {
      logCount++;
      const div = document.createElement('div');
      div.className = `log ${type}`;
      div.textContent = `[${logCount}] ${new Date().toISOString().split('T')[1].split('.')[0]} ${msg}`;
      debugPanel.appendChild(div);
      debugPanel.scrollTop = debugPanel.scrollHeight;
      console.log(msg);
      
      // 限制日志数量
      if (debugPanel.children.length > 50) {
        debugPanel.removeChild(debugPanel.children[1]); // 保留第一个"初始化中"
      }
    }
    
    debugLog('✅ HTML loaded', 'success');
    debugLog(`📍 Location: ${window.location.href}`);
    debugLog(`🔗 Base URL: ${document.baseURI}`);
    debugLog(`📱 User Agent: ${navigator.userAgent.substring(0, 50)}...`);
    
    // 监听全局错误
    window.addEventListener('error', (e) => {
      debugLog(`❌ Error: ${e.message}`, 'error');
      debugLog(`📄 File: ${e.filename}:${e.lineno}:${e.colno}`, 'error');
      if (e.error && e.error.stack) {
        debugLog(`📚 Stack: ${e.error.stack.substring(0, 100)}...`, 'error');
      }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      debugLog(`❌ Promise Rejection: ${e.reason}`, 'error');
    });
    
    // 监听 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      debugLog('✅ DOM Content Loaded', 'success');
    });
    
    // 监听 load
    window.addEventListener('load', () => {
      debugLog('✅ Window Loaded', 'success');
      
      // 检查 Capacitor
      setTimeout(() => {
        if (window.Capacitor) {
          debugLog(`✅ Capacitor loaded (${window.Capacitor.getPlatform()})`, 'success');
        } else {
          debugLog('⚠️ Capacitor not loaded', 'warning');
        }
        
        // 检查 React
        setTimeout(() => {
          const root = document.getElementById('root');
          if (root && root.children.length > 0) {
            debugLog('✅ React app rendered', 'success');
          } else {
            debugLog('❌ React app NOT rendered - WHITE SCREEN!', 'error');
          }
        }, 2000);
      }, 1000);
    });
    
    // 覆盖 console 方法
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = function(...args) {
      debugLog(args.join(' '));
      originalLog.apply(console, args);
    };
    
    console.error = function(...args) {
      debugLog(args.join(' '), 'error');
      originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
      debugLog(args.join(' '), 'warning');
      originalWarn.apply(console, args);
    };
  </script>
  
  <script type="module" crossorigin src="./assets/index-DolOi5YM.js"></script>
  <link rel="stylesheet" crossorigin href="./assets/index-CiuvyfXn.css">
</body>
</html>
```

---

### 第2步: 简化 App.tsx

创建最小化版本测试:

```typescript
// src/App.tsx (临时简化版)
function App() {
  return (
    <div style={{ padding: '20px', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'green' }}>✅ React App Loaded!</h1>
      <p>如果你看到这个,说明 React 正常工作</p>
      <div>
        <p>Location: {window.location.href}</p>
        <p>User Agent: {navigator.userAgent}</p>
        <p>Capacitor: {(window as any).Capacitor ? '✅ Loaded' : '❌ Not loaded'}</p>
      </div>
    </div>
  );
}

export default App;
```

**测试流程**:
1. 备份原 App.tsx
2. 使用简化版替换
3. `npm run build && npx cap sync ios`
4. 在 Appflow 构建
5. 安装测试

**如果简化版能显示**:
- 说明问题在复杂组件中
- 逐步添加功能定位问题

**如果简化版仍白屏**:
- 说明是基础配置问题
- 检查 Vite/Capacitor 配置

---

### 第3步: 检查 Capacitor 初始化

在 `main.tsx` 添加 Capacitor 检测:

```typescript
// main.tsx
import { Capacitor } from '@capacitor/core';

console.log('🔍 Capacitor Platform:', Capacitor.getPlatform());
console.log('🔍 Capacitor Native:', Capacitor.isNativePlatform());

if (Capacitor.getPlatform() === 'ios') {
  console.log('📱 Running on iOS');
  
  // 检查插件是否加载
  import('@capacitor/camera').then(() => {
    console.log('✅ Camera plugin loaded');
  }).catch(e => {
    console.error('❌ Camera plugin failed:', e);
  });
}
```

---

### 第4步: 禁用问题功能

临时禁用可能导致崩溃的功能:

```typescript
// App.tsx
// 1. 禁用相机扫描
const startScan = async () => {
  alert('相机功能已临时禁用用于测试');
  return;
  // ...原代码
};

// 2. 禁用二维码生成
useEffect(() => {
  if (showReceiveDialog && selectedWallet) {
    // 使用占位符
    setQrCodeDataUrl('data:image/svg+xml;base64,...');
    return; // 跳过实际生成
  }
}, [showReceiveDialog, selectedWallet]);

// 3. 禁用复杂计算
const refreshBalance = async (wallet: Wallet) => {
  setWalletBalance('0.00'); // 临时返回固定值
  return;
  // ...原代码
};
```

---

## 🎯 优先级修复建议

### 🔴 高优先级 (立即修复)

#### 1. 添加调试面板
**目的**: 确认问题位置  
**时间**: 5分钟  
**操作**:
```bash
# 修改 index.html 添加调试代码
# 重新构建并测试
npm run build
npx cap sync ios
# 在 Appflow 构建
```

#### 2. 测试简化版 App
**目的**: 排除复杂组件问题  
**时间**: 10分钟  
**操作**:
```bash
# 备份 App.tsx
cp src/App.tsx src/App.tsx.backup

# 使用简化版
# (见上面的简化版代码)

npm run build
npx cap sync ios
```

---

### 🟡 中优先级 (24小时内修复)

#### 3. 修复 Camera API
**目的**: 防止 getUserMedia 崩溃  
**时间**: 20分钟  
**操作**:
```typescript
const startScan = async () => {
  try {
    // 检查 API 是否存在
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported');
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' }
    });
    
    // ...原代码
  } catch (error) {
    console.error('Camera error:', error);
    alert(`相机启动失败: ${(error as Error).message}\n\n请使用 Capacitor Camera 插件代替`);
    // 降级处理
  }
};
```

#### 4. 代码分割
**目的**: 减小初始加载体积  
**时间**: 1小时  
**操作**:
```typescript
// 懒加载大组件
const BTCAdapter = lazy(() => import('./services/blockchain/BTCAdapter-harmonyos'));
const ETHAdapter = lazy(() => import('./services/blockchain/ETHAdapter'));
```

---

### 🟢 低优先级 (优化)

#### 5. 性能优化
- 使用 React.memo
- 优化 useEffect 依赖
- 减少 state 数量

#### 6. 移除未使用代码
- Tree shaking
- 移除注释掉的代码
- 清理 console.log

---

## 📊 诊断结果模板

使用调试面板后,记录以下信息:

```
🔍 诊断报告

【基础信息】
✅ Location: capacitor://localhost/
✅ Base URL: capacitor://localhost/
✅ HTML loaded
✅ DOM Content Loaded
✅ Window Loaded

【Capacitor】
✅ Capacitor loaded (ios)
✅ Capacitor Native: true

【资源加载】
[检查日志中是否有资源加载失败]
❌ Failed to load: ./assets/index-xxx.js
   → 说明路径问题未解决

【React渲染】
❌ React app NOT rendered
   → 说明 React 启动失败

【错误信息】
❌ Error: Cannot find module './services/blockchain/BTCAdapter'
   → 说明模块加载失败

【结论】
问题原因: [填写]
解决方案: [填写]
```

---

## ✅ 快速测试清单

在 Appflow 构建前,本地验证:

- [ ] `npm run build` 成功
- [ ] `dist/index.html` 使用相对路径 `./assets/...`
- [ ] `dist/assets/` 目录存在且包含 JS/CSS
- [ ] `npx cap sync ios` 成功
- [ ] `ios/App/App/public/` 包含所有资源
- [ ] `ios/App/App/public/index.html` 与 dist 一致
- [ ] `capacitor.config.ts` 的 `base: './'` 存在
- [ ] `index.html` 包含 CSP 配置
- [ ] 没有 TypeScript 编译错误
- [ ] Git 已提交所有更改

---

## 🚀 下一步行动

### 方案 A: 调试模式 (推荐)
1. ✅ 添加调试面板到 `index.html`
2. ✅ 保持现有代码不变
3. ✅ 构建并测试
4. ✅ 根据调试日志定位问题

### 方案 B: 简化模式
1. ✅ 使用简化版 App.tsx
2. ✅ 确认基础功能正常
3. ✅ 逐步添加功能
4. ✅ 定位导致白屏的组件

### 方案 C: 降级模式
1. ✅ 移除所有可疑功能
   - 相机扫描
   - 二维码生成
   - 大型加密库
2. ✅ 测试基础钱包功能
3. ✅ 确认稳定后再添加高级功能

---

**建议**: 先使用方案 A (调试模式),根据日志信息再决定是否需要方案 B 或 C。
