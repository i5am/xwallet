# 🔍 iOS 白屏问题完整调试指南

## ❌ 问题现象

应用在 iPhone 上打开后显示白屏,无任何内容加载。

---

## 🎯 已修复的问题

### ✅ 修复 1: 资源路径问题 (最关键!)

**问题**: Vite 默认使用绝对路径 `/assets/...`,在 iOS `capacitor://` scheme 下无法加载

**症状**:
```
capacitor://localhost/assets/index.js  ❌ 404 Not Found
```

**解决方案**: 使用相对路径

**文件**: `vite.config.ts`
```typescript
export default defineConfig({
  base: './',  // ✅ 使用相对路径
  plugins: [react()],
  // ...
});
```

**效果**:
```html
<!-- 之前 -->
<script src="/assets/index.js"></script>  ❌

<!-- 之后 -->
<script src="./assets/index.js"></script>  ✅
```

---

### ✅ 修复 2: Content Security Policy

**问题**: 浏览器安全策略阻止加载内联脚本和样式

**解决方案**: 添加宽松的 CSP 配置

**文件**: `index.html`
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content: capacitor: ionic:; 
               script-src * 'unsafe-inline' 'unsafe-eval'; 
               style-src * 'unsafe-inline';">
```

**说明**:
- `default-src *` - 允许从任何来源加载资源
- `'unsafe-inline'` - 允许内联脚本和样式
- `'unsafe-eval'` - 允许 eval() (某些库需要)
- `capacitor: ionic:` - 允许 Capacitor 和 Ionic scheme

---

### ✅ 修复 3: URL Scheme 配置

**文件**: `capacitor.config.ts`
```typescript
const config: CapacitorConfig = {
  appId: 'com.ex1.x1wallet',
  appName: 'x1wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    iosScheme: 'capacitor',  // ✅ iOS 使用 capacitor://
    hostname: 'localhost',
    cleartext: true,
  },
  ios: {
    limitsNavigationsToAppBoundDomains: false,  // ✅ 允许加载本地资源
  },
};
```

---

### ✅ 修复 4: Bundle ID 一致性

**问题**: `capacitor.config.ts` 和 Xcode 项目的 Bundle ID 不一致

**解决**:
```typescript
// capacitor.config.ts
appId: 'com.ex1.x1wallet',  // 必须与 Xcode 一致
```

---

## 🛠️ 调试步骤

### 方法 1: 使用 Safari Web Inspector (推荐)

**前提**: 需要 Mac 电脑

1. **iPhone 设置**:
   ```
   设置 > Safari > 高级 > 网页检查器 (开启)
   ```

2. **Mac Safari 设置**:
   ```
   Safari > 设置 > 高级 > 在菜单栏显示"开发"菜单 (勾选)
   ```

3. **连接调试**:
   - iPhone 通过数据线连接 Mac
   - 打开应用
   - Mac 上打开 Safari
   - 菜单: **开发 > [你的 iPhone 名称] > x1wallet**

4. **查看错误**:
   ```javascript
   // 常见错误
   Failed to load resource: capacitor://localhost/assets/index.js
   // 说明: 资源路径错误,使用了绝对路径
   
   Refused to load script because it violates CSP
   // 说明: CSP 配置过于严格
   
   Could not find cordova.js
   // 说明: Capacitor 未正确初始化
   ```

---

### 方法 2: 添加调试信息到 HTML

**临时调试方案** (无需 Mac)

修改 `index.html`:

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
    #debug {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #000;
      color: #0f0;
      padding: 10px;
      font-size: 12px;
      z-index: 9999;
      max-height: 200px;
      overflow: auto;
    }
    #root {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="debug">Loading...</div>
  <div id="root"></div>
  
  <script>
    // 调试日志
    const debug = document.getElementById('debug');
    function log(msg) {
      debug.innerHTML += msg + '<br>';
      console.log(msg);
    }
    
    log('1. HTML loaded');
    log('2. Location: ' + window.location.href);
    log('3. Base URL: ' + document.baseURI);
    
    // 监听错误
    window.addEventListener('error', (e) => {
      log('❌ Error: ' + e.message);
      log('   File: ' + e.filename);
    });
    
    // 检测 Capacitor
    document.addEventListener('DOMContentLoaded', () => {
      log('4. DOM loaded');
      setTimeout(() => {
        if (window.Capacitor) {
          log('✅ Capacitor loaded');
          log('   Platform: ' + window.Capacitor.getPlatform());
        } else {
          log('❌ Capacitor not found');
        }
      }, 1000);
    });
  </script>
  
  <script type="module" crossorigin src="./assets/index-DolOi5YM.js"></script>
  <link rel="stylesheet" crossorigin href="./assets/index-CiuvyfXn.css">
</body>
</html>
```

**使用方法**:
1. 添加上述调试代码
2. `npm run build && npx cap sync ios`
3. 在 Appflow 构建并安装
4. 打开应用,查看顶部黑色调试信息

**预期输出**:
```
1. HTML loaded
2. Location: capacitor://localhost/
3. Base URL: capacitor://localhost/
4. DOM loaded
✅ Capacitor loaded
   Platform: ios
```

**如果显示错误**:
```
❌ Error: Failed to fetch dynamically imported module
   File: capacitor://localhost/assets/index.js
// 说明: 资源路径问题,检查 vite.config.ts 的 base
```

---

### 方法 3: 检查本地构建

在推送到 Appflow 之前,先本地验证:

```powershell
# 1. 构建
npm run build

# 2. 检查生成的 HTML
cat dist/index.html

# 应该看到相对路径:
# <script src="./assets/index-xxx.js"></script>  ✅
# 而不是:
# <script src="/assets/index-xxx.js"></script>   ❌

# 3. 检查文件是否存在
ls dist/assets/

# 应该看到:
# index-xxx.js
# index-xxx.css

# 4. 同步到 iOS
npx cap sync ios

# 5. 检查 iOS 项目
cat ios/App/App/public/index.html
ls ios/App/App/public/assets/
```

---

## 📋 完整修复清单

使用此清单逐项检查:

- [ ] **vite.config.ts 配置**
  ```typescript
  base: './',  // 必须设置
  ```

- [ ] **index.html CSP**
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content: capacitor: ionic:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';">
  ```

- [ ] **capacitor.config.ts**
  ```typescript
  appId: 'com.ex1.x1wallet',  // 与 Xcode 一致
  server: {
    iosScheme: 'capacitor',
  },
  ios: {
    limitsNavigationsToAppBoundDomains: false,
  },
  ```

- [ ] **构建和同步**
  ```bash
  npm run build
  npx cap sync ios
  ```

- [ ] **验证生成的文件**
  ```bash
  # 检查相对路径
  grep "src=\"./assets" dist/index.html
  
  # 应该有输出,如果没有说明 base: './' 没生效
  ```

- [ ] **提交并推送**
  ```bash
  git add -A
  git commit -m "fix: iOS 白屏问题"
  git push origin master
  ```

- [ ] **Appflow 构建**
  - 选择最新 commit
  - iOS Device, Ad Hoc
  - 构建并下载

---

## 🎯 关键配置总结

### 1. Vite 配置 (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',  // ⭐ 最关键!使用相对路径
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      // ...其他 alias
    },
  },
  build: {
    target: 'es2015',
    minify: false,  // 可选,方便调试
  },
});
```

### 2. HTML 配置 (`index.html`)

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  
  <!-- ⭐ CSP 配置 -->
  <meta http-equiv="Content-Security-Policy" 
        content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content: capacitor: ionic:; 
                 script-src * 'unsafe-inline' 'unsafe-eval'; 
                 style-src * 'unsafe-inline';">
  
  <title>WDK Wallet</title>
</head>
<body>
  <div id="root"></div>
  <!-- Vite 会自动注入相对路径的 script 标签 -->
</body>
</html>
```

### 3. Capacitor 配置 (`capacitor.config.ts`)

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ex1.x1wallet',  // ⭐ 与 Xcode 保持一致
  appName: 'x1wallet',
  webDir: 'dist',
  
  server: {
    androidScheme: 'http',
    iosScheme: 'capacitor',  // ⭐ iOS 使用 capacitor://
    hostname: 'localhost',
    cleartext: true,
  },
  
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    limitsNavigationsToAppBoundDomains: false,  // ⭐ 允许加载本地资源
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffff',
      showSpinner: false,
    }
  }
};

export default config;
```

---

## 🚨 常见错误和解决方案

### 错误 1: Failed to load resource

**现象**:
```
Failed to load resource: capacitor://localhost/assets/index-xxx.js
```

**原因**: 使用了绝对路径 `/assets/...`

**解决**:
```typescript
// vite.config.ts
base: './',  // 确保这一行存在
```

---

### 错误 2: Refused to load script (CSP)

**现象**:
```
Refused to load the script 'capacitor://localhost/assets/index.js' 
because it violates the following Content Security Policy directive
```

**原因**: CSP 配置过于严格或缺失

**解决**:
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content: capacitor: ionic:; 
               script-src * 'unsafe-inline' 'unsafe-eval'; 
               style-src * 'unsafe-inline';">
```

---

### 错误 3: Could not find cordova.js

**现象**:
```
Could not find cordova.js
```

**原因**: Capacitor 未正确初始化

**解决**:
```bash
# 确保同步了 iOS
npx cap sync ios

# 检查 cordova.js 是否存在
ls ios/App/App/public/cordova.js  # 应该存在
```

---

### 错误 4: Bundle ID 不匹配

**现象**: 应用无法启动或白屏

**原因**: `capacitor.config.ts` 的 `appId` 与 Xcode 项目不一致

**解决**:
```bash
# 1. 检查 Xcode 项目的 Bundle ID
grep "PRODUCT_BUNDLE_IDENTIFIER" ios/App/App.xcodeproj/project.pbxproj

# 输出类似: PRODUCT_BUNDLE_IDENTIFIER = com.ex1.x1wallet;

# 2. 确保 capacitor.config.ts 一致
# appId: 'com.ex1.x1wallet',

# 3. 同步
npx cap sync ios
```

---

## 📱 测试流程

### 完整测试步骤

1. **本地验证**
   ```bash
   npm run build
   cat dist/index.html | grep "src=\"./"
   # 应该看到: <script ... src="./assets/...
   ```

2. **同步到 iOS**
   ```bash
   npx cap sync ios
   cat ios/App/App/public/index.html | grep "src=\"./"
   # 应该看到相同的相对路径
   ```

3. **提交代码**
   ```bash
   git add -A
   git commit -m "fix: iOS 白屏 - 使用相对路径和 CSP"
   git push origin master
   ```

4. **Appflow 构建**
   - 访问 Dashboard
   - New Build
   - 选择最新 commit: `22e590d`
   - iOS Device, Ad Hoc
   - Start Build

5. **安装测试**
   - 下载 .ipa
   - 安装到 iPhone
   - 打开应用

6. **验证功能**
   - [ ] 应用正常打开(不再白屏)
   - [ ] 底部导航栏显示
   - [ ] 可以切换标签
   - [ ] 钱包列表加载
   - [ ] 相机权限可以请求

---

## 📊 技术原理

### iOS Capacitor 资源加载机制

```
1. 用户打开应用
   ↓
2. iOS 启动 WKWebView
   ↓
3. 加载: capacitor://localhost/index.html
   ↓
4. 解析 HTML,发现资源:
   - ./assets/index.js (相对路径) ✅
   - /assets/index.js (绝对路径) ❌
   ↓
5. 相对路径转换:
   capacitor://localhost/index.html
   + ./assets/index.js
   = capacitor://localhost/assets/index.js ✅
   ↓
6. 绝对路径转换:
   capacitor://localhost/index.html
   + /assets/index.js
   = capacitor://localhost/assets/index.js ❌ (某些情况下失败)
   ↓
7. Capacitor 从 App Bundle 加载资源
   ↓
8. 初始化 React 应用
   ↓
9. 显示界面 ✅
```

### 为什么绝对路径会失败?

在 Web 环境:
```
https://example.com/index.html
/assets/index.js → https://example.com/assets/index.js ✅
```

在 Capacitor iOS:
```
capacitor://localhost/index.html
/assets/index.js → capacitor:///assets/index.js ❌ (缺少 localhost)
```

### 相对路径的优势

```
capacitor://localhost/index.html
./assets/index.js → capacitor://localhost/assets/index.js ✅

capacitor://localhost/pages/about.html
./assets/index.js → capacitor://localhost/pages/assets/index.js ✅
```

相对路径基于当前文档位置,更可靠!

---

## ✅ 修复验证

如果修复成功,应该看到:

1. **构建日志正常**
   ```
   ✓ 4045 modules transformed
   dist/index.html  0.91 kB
   ✓ built in 16s
   ```

2. **HTML 使用相对路径**
   ```html
   <script src="./assets/index-xxx.js"></script>
   ```

3. **Appflow 构建成功**
   ```
   ✓ Installing dependencies
   ✓ Building iOS project
   ✓ Exporting .ipa
   ```

4. **应用正常打开**
   - 不再白屏
   - UI 完整显示
   - 功能正常工作

---

## 🎉 总结

**根本原因**: Vite 默认使用绝对路径,与 iOS Capacitor scheme 不兼容

**核心修复**:
1. ✅ `vite.config.ts`: `base: './'`
2. ✅ `index.html`: 添加 CSP
3. ✅ `capacitor.config.ts`: `iosScheme: 'capacitor'`
4. ✅ `capacitor.config.ts`: `limitsNavigationsToAppBoundDomains: false`

**提交信息**: Commit `22e590d` - fix: 修复 iOS 白屏 - 使用相对路径和添加 CSP 配置

**下一步**: 在 Appflow 使用最新 commit 构建,应该能正常显示了! 🚀

---

**如果还有问题,请尝试添加调试信息方法,查看具体错误!**
