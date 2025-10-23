# 📱 Android 打包配置完成总结

## ✅ 已完成的配置

### 1. 安装 Capacitor 依赖
- ✅ @capacitor/core
- ✅ @capacitor/cli
- ✅ @capacitor/android

### 2. 创建配置文件
- ✅ `capacitor.config.ts` - Capacitor 主配置
  - 应用ID: `com.tether.wdk.wallet`
  - 应用名称: `Tether WDK Wallet`
  - Web目录: `dist`

### 3. Android 项目初始化
- ✅ 已添加 Android 平台 (`android/` 目录)
- ✅ 已配置相机权限 (用于二维码扫描)
- ✅ 已配置网络权限

### 4. 构建配置
- ✅ 修复 TypeScript 编译错误
- ✅ 更新 Vite 配置支持 top-level await
- ✅ Web 应用构建成功
- ✅ 已同步到 Android 项目

### 5. 文档和脚本
- ✅ 创建详细的 Android 打包指南 (`docs/ANDROID_BUILD.md`)
- ✅ 添加 npm 脚本到 `package.json`
- ✅ 创建快速构建脚本 (`build-android.ps1`)
- ✅ 更新主 README 添加 Android 相关信息
- ✅ 更新 `.gitignore` 排除 Android 构建产物

---

## 🚀 如何打包 Android 应用

### 方法一: 使用 PowerShell 脚本 (推荐新手)

```powershell
# 运行自动化构建脚本
.\build-android.ps1
```

这个脚本会:
1. 检查环境 (Node.js, Java)
2. 安装依赖
3. 构建 Web 应用
4. 同步到 Android
5. 构建 Debug APK
6. 显示 APK 位置

### 方法二: 使用 npm 脚本

```powershell
# 构建并同步到 Android
npm run android:build

# 打开 Android Studio
npm run android:open
```

然后在 Android Studio 中:
- 菜单: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

### 方法三: 命令行手动构建

```powershell
# 1. 构建 Web
npm run build

# 2. 同步到 Android
npx cap sync android

# 3. 构建 APK
cd android
.\gradlew assembleDebug
cd ..
```

生成的 APK 在:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📋 前置要求

### 必需软件
1. **Node.js 18+** - 已安装 ✅
2. **Android Studio** - 需要安装
   - 下载: https://developer.android.com/studio
3. **JDK 11+** - 通常随 Android Studio 安装

### 环境变量 (首次构建需要)

**设置 JAVA_HOME:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

**设置 ANDROID_HOME:**
```powershell
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
```

详细配置请查看: [docs/ANDROID_BUILD.md](./docs/ANDROID_BUILD.md)

---

## 🎯 快速开始

### 1. 安装 Android Studio

1. 下载并安装 Android Studio
2. 首次启动时安装 Android SDK
3. 等待初始化完成

### 2. 构建 APK

运行自动化脚本:
```powershell
.\build-android.ps1
```

或手动构建:
```powershell
npm run android:build
cd android
.\gradlew assembleDebug
```

### 3. 安装到设备

**方法 A: 使用 ADB**
```powershell
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**方法 B: 直接传输**
将 APK 文件复制到手机,直接点击安装

---

## 📦 生成的文件

```
wdk/
├── capacitor.config.ts          # Capacitor 配置
├── android/                     # Android 项目目录
│   ├── app/
│   │   ├── build/
│   │   │   └── outputs/
│   │   │       └── apk/
│   │   │           ├── debug/
│   │   │           │   └── app-debug.apk      # Debug APK
│   │   │           └── release/
│   │   │               └── app-release.apk    # Release APK
│   │   └── src/main/
│   │       ├── AndroidManifest.xml    # 已配置相机权限
│   │       └── assets/public/         # Web 资源
│   └── gradlew.bat              # Gradle Wrapper
├── build-android.ps1            # 快速构建脚本
└── docs/
    └── ANDROID_BUILD.md         # 详细打包指南
```

---

## 🔧 配置说明

### Capacitor 配置 (`capacitor.config.ts`)

```typescript
{
  appId: 'com.tether.wdk.wallet',
  appName: 'Tether WDK Wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}
```

### Android 权限 (`AndroidManifest.xml`)

```xml
<!-- 网络访问 -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- 相机权限 (二维码扫描) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

### npm 脚本 (`package.json`)

```json
{
  "scripts": {
    "android:build": "npm run build && npx cap sync android",
    "android:open": "npx cap open android",
    "android:sync": "npx cap sync android"
  }
}
```

---

## 🎨 自定义应用

### 修改应用名称

编辑 `capacitor.config.ts`:
```typescript
appName: 'Your App Name'
```

### 修改应用ID

编辑 `capacitor.config.ts`:
```typescript
appId: 'com.yourcompany.yourapp'
```

### 更换应用图标

1. 准备不同尺寸的图标 (PNG 格式)
2. 放到 `android/app/src/main/res/mipmap-*` 目录
3. 或使用工具: https://icon.kitchen/

### 修改版本号

编辑 `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 2          // 递增
    versionName "1.1.0"    // 语义化版本
}
```

---

## 📝 新增的 npm 命令

```powershell
# 构建 Web 并同步到 Android
npm run android:build

# 打开 Android Studio
npm run android:open

# 仅同步 (不构建 Web)
npm run android:sync
```

---

## 🔐 发布版本 (生产环境)

### 1. 生成签名密钥

```powershell
keytool -genkey -v -keystore tether-wdk-wallet.keystore -alias tether-wdk -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

创建 `android/gradle.properties`:
```properties
RELEASE_STORE_FILE=D:/keystores/tether-wdk-wallet.keystore
RELEASE_STORE_PASSWORD=your-password
RELEASE_KEY_ALIAS=tether-wdk
RELEASE_KEY_PASSWORD=your-password
```

### 3. 构建签名 APK

```powershell
cd android
.\gradlew assembleRelease
```

详细步骤请查看: [docs/ANDROID_BUILD.md](./docs/ANDROID_BUILD.md#签名发布版本)

---

## 🐛 常见问题

### Q: 构建失败 "ANDROID_HOME not set"

**A:** 设置环境变量:
```powershell
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
```

### Q: Java 版本不兼容

**A:** 确保使用 JDK 11 或 17:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
java -version
```

### Q: 应用白屏

**A:** 重新构建并同步:
```powershell
npm run build
npx cap sync android
```

### Q: 相机权限被拒绝

**A:** 检查:
1. AndroidManifest.xml 中是否有 CAMERA 权限 ✅
2. 设备设置中是否授予了相机权限

更多问题解决请查看: [docs/ANDROID_BUILD.md#故障排查](./docs/ANDROID_BUILD.md#故障排查)

---

## 📚 相关文档

- [📱 Android 打包详细指南](./docs/ANDROID_BUILD.md) - 完整的打包教程
- [📖 快速开始](./README.md#快速开始) - 项目基本使用
- [🔧 开发指南](./DEVELOPMENT.md) - 开发环境配置
- [📄 二维码格式说明](./docs/QR-CODE-FORMATS.md) - 二维码功能文档

---

## 🎯 下一步

1. **安装 Android Studio**
   - 下载: https://developer.android.com/studio
   
2. **运行构建脚本**
   ```powershell
   .\build-android.ps1
   ```

3. **测试 APK**
   - 在真机或模拟器上安装测试

4. **发布应用** (可选)
   - 配置签名密钥
   - 构建 Release APK
   - 上传到 Google Play

---

## 🌟 功能特性

打包后的 Android 应用包含完整功能:

- ✅ 多链钱包支持 (BTC, ETH)
- ✅ 热钱包/冷钱包/观察钱包
- ✅ 二维码扫描 (使用相机)
- ✅ 二维码生成 (简单格式 + WDK 协议)
- ✅ 交易签名
- ✅ 离线操作支持
- ✅ WDK 协议完整实现

---

## 💡 提示

- 首次构建可能需要下载 Gradle 依赖,需要一些时间
- Debug APK 可以直接安装测试
- Release APK 需要签名才能发布
- 使用 `.\build-android.ps1` 脚本最简单

---

## 📞 需要帮助?

- 查看详细文档: [docs/ANDROID_BUILD.md](./docs/ANDROID_BUILD.md)
- Capacitor 官方文档: https://capacitorjs.com/docs
- Android 开发者指南: https://developer.android.com/guide

---

**祝您打包顺利! 🚀**

Tether WDK Wallet 团队
