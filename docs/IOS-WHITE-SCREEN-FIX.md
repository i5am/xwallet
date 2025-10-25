# 🔧 iOS 白屏问题修复指南

## ❌ 问题描述

应用在 iPhone 上打开后显示白屏,无法加载内容。

---

## 🔍 问题原因

### 1. **URL Scheme 配置不一致**

iOS 默认使用 `capacitor://` scheme,但需要正确配置才能加载本地资源。

```typescript
// 问题配置
server: {
  androidScheme: 'http',  // ✅ Android OK
  // iOS 没有配置,默认使用 ionic:// 或 capacitor://
}
```

### 2. **Bundle ID 不匹配**

- `capacitor.config.ts`: `com.tether.wdk.wallet`
- `Xcode project`: `com.ex1.x1wallet` ❌

配置不一致导致 Capacitor 无法正确初始化。

---

## ✅ 解决方案

### 修复 1: 统一 URL Scheme 配置

**文件**: `capacitor.config.ts`

```typescript
const config: CapacitorConfig = {
  appId: 'com.ex1.x1wallet',
  appName: 'x1wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    iosScheme: 'capacitor',  // ✅ iOS 使用 capacitor scheme
    hostname: 'localhost',
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    limitsNavigationsToAppBoundDomains: false  // ✅ 允许加载本地资源
  },
};
```

**关键配置说明**:

1. **`iosScheme: 'capacitor'`**
   - iOS 使用 `capacitor://` scheme
   - 这是 Capacitor 推荐的标准 scheme
   - 兼容性最好,性能最优

2. **`limitsNavigationsToAppBoundDomains: false`**
   - 允许应用加载本地打包的资源
   - 必须设置为 `false`,否则白屏

### 修复 2: 统一 Bundle ID

**修改前**:
```typescript
appId: 'com.tether.wdk.wallet',  // ❌ 与 Xcode 不一致
```

**修改后**:
```typescript
appId: 'com.ex1.x1wallet',  // ✅ 与 Xcode 保持一致
```

---

## 🚀 应用修复

### 步骤 1: 重新构建前端

```bash
npm run build
```

**预期输出**:
```
✓ 4045 modules transformed.
dist/index.html                     0.70 kB
dist/assets/index-xxx.css          35.19 kB
dist/assets/index-xxx.js        4,689.63 kB
✓ built in 14.93s
```

### 步骤 2: 同步到 iOS

```bash
npx cap sync ios
```

**预期输出**:
```
✔ Copying web assets from dist to ios\App\App\public
✔ Creating capacitor.config.json in ios\App\App
✔ Updating iOS plugins
✔ Sync finished in 0.492s
```

### 步骤 3: 提交更改

```bash
git add -A
git commit -m "fix: 修复 iOS 白屏问题 - 统一 scheme 配置和 Bundle ID"
git push origin master
```

### 步骤 4: 在 Appflow 重新构建

1. 访问: https://dashboard.ionicframework.com/app/d41c03c7/builds
2. 点击 **"New Build"**
3. 选择最新 commit: **`0af0b22`** (fix: 修复 iOS 白屏问题)
4. 配置:
   - Platform: **iOS**
   - Target: **iOS Device**
   - Build Type: **Ad Hoc**
5. 点击 **Start Build**

### 步骤 5: 安装测试

1. 下载新的 `.ipa` 文件
2. 使用 Diawi 或其他方式安装到 iPhone
3. 打开应用,应该能正常显示界面! 🎉

---

## 🧪 验证清单

打开应用后检查:

- [ ] **界面正常显示** (不再白屏)
- [ ] **底部导航栏可见** (钱包/发现/设置)
- [ ] **可以点击切换标签**
- [ ] **可以查看钱包列表**
- [ ] **相机扫描功能可用**

---

## 📊 技术对比

### URL Scheme 对比

| Scheme | iOS | Android | 说明 |
|--------|-----|---------|------|
| `ionic://` | ⚠️ | ❌ | 旧版,不推荐 |
| `capacitor://` | ✅ | ❌ | iOS 推荐 |
| `http://` | ⚠️ | ✅ | Android 推荐 |
| `https://` | ⚠️ | ⚠️ | 需要证书 |

**最佳实践**:
- iOS: `capacitor://`
- Android: `http://`

### Bundle ID 规范

**命名规则**:
```
com.<company>.<app>
例如: com.ex1.x1wallet
```

**注意事项**:
1. 必须与 Apple Developer 账号中的 App ID 一致
2. 必须与 Xcode 项目配置一致
3. 必须与 Capacitor 配置一致
4. 一旦提交 App Store 不能更改

---

## 🔍 调试技巧

### 如何检查白屏原因?

#### 方法 1: 使用 Safari Web Inspector (推荐)

1. 在 Mac 上打开 Safari
2. 菜单: **开发 > iPhone 名称 > x1wallet**
3. 查看 Console 错误信息

常见错误:
```javascript
// 资源加载失败
Failed to load resource: net::ERR_FILE_NOT_FOUND

// Scheme 配置错误
Access to resource blocked by Content Security Policy

// Bundle ID 不匹配
Could not initialize Capacitor
```

#### 方法 2: 使用 Xcode Console

1. 在 Appflow 下载 `.ipa`
2. 连接 iPhone 到 Mac
3. 打开 Xcode > Window > Devices and Simulators
4. 选择设备 > 点击应用下方的齿轮 > View Device Logs
5. 查看崩溃日志

#### 方法 3: 检查资源文件

```bash
# 查看 iOS 打包的资源
ls -la ios/App/App/public/

# 应该看到:
index.html      # ✅ 入口文件
assets/         # ✅ JS/CSS 资源
vite.svg        # ✅ 图标
cordova.js      # ✅ Capacitor 桥接
```

---

## 📝 常见问题

### Q1: 修复后仍然白屏?

**可能原因**:
1. 没有重新 build (`npm run build`)
2. 没有同步 iOS (`npx cap sync ios`)
3. 使用了旧的 `.ipa` 文件

**解决方法**:
```bash
# 完整重新构建流程
npm run build
npx cap sync ios
# 然后在 Appflow 重新构建
```

### Q2: Console 显示 "Could not find cordova.js"?

**原因**: 资源没有正确复制到 iOS 项目

**解决**:
```bash
# 删除旧的资源
rm -rf ios/App/App/public/*

# 重新同步
npx cap sync ios
```

### Q3: 显示 "Content Security Policy" 错误?

**原因**: CSP 配置过于严格

**解决**: 在 `index.html` 中添加:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: capacitor: ionic:">
```

### Q4: iOS 和 Android 能否使用相同的 scheme?

**答案**: 不推荐

- iOS 优化: `capacitor://`
- Android 优化: `http://`

通过 `androidScheme` 和 `iosScheme` 分别配置,保证最佳性能。

---

## 🎯 配置文件参考

### 完整的 capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ex1.x1wallet',
  appName: 'x1wallet',
  webDir: 'dist',
  
  server: {
    androidScheme: 'http',
    iosScheme: 'capacitor',
    hostname: 'localhost',
    cleartext: true,
  },
  
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    loggingBehavior: 'debug'
  },
  
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    limitsNavigationsToAppBoundDomains: false
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

## 📚 相关文档

- [Capacitor iOS Configuration](https://capacitorjs.com/docs/ios/configuration)
- [iOS URL Schemes](https://capacitorjs.com/docs/guides/deep-links)
- [Debugging Capacitor Apps](https://capacitorjs.com/docs/guides/debugging)

---

## ✅ 总结

**修复要点**:
1. ✅ iOS 使用 `capacitor://` scheme
2. ✅ 设置 `limitsNavigationsToAppBoundDomains: false`
3. ✅ 统一 Bundle ID: `com.ex1.x1wallet`
4. ✅ 重新 build + sync + 在 Appflow 构建

**预期结果**:
- ✅ 应用正常打开,显示完整界面
- ✅ 底部导航可用
- ✅ 所有功能正常工作

**Commit**: `0af0b22` - fix: 修复 iOS 白屏问题 - 统一 scheme 配置和 Bundle ID

---

**现在去 Appflow 重新构建吧!** 🚀 这次应该能正常显示界面了!
