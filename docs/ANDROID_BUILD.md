# 📱 Android 应用打包指南

本指南将帮助您将 Tether WDK Wallet 打包成 Android APK 应用。

---

## 🎯 概述

项目使用 **Capacitor** 将 React Web 应用打包为原生 Android 应用。

### 应用信息

- **应用ID**: `com.tether.wdk.wallet`
- **应用名称**: Tether WDK Wallet
- **Web目录**: `dist/`
- **Android项目**: `android/`

---

## 📋 前置要求

### 必需软件

1. **Node.js** (v16+)
   - 用于构建 Web 应用
   - 下载: https://nodejs.org/

2. **Android Studio** (最新版)
   - 用于编译 Android 应用
   - 下载: https://developer.android.com/studio

3. **JDK** (Java Development Kit 11+)
   - Android Studio 自带,或单独下载
   - 推荐 OpenJDK 11 或 17

### 环境配置

#### 1. 设置 JAVA_HOME

**Windows PowerShell:**
```powershell
# 查找 JDK 路径 (通常在 Android Studio 安装目录下)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path += ";$env:JAVA_HOME\bin"
```

**验证:**
```powershell
java -version
```

#### 2. 设置 ANDROID_HOME

**Windows PowerShell:**
```powershell
# Android SDK 路径 (通常在用户目录下)
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$env:Path += ";$env:ANDROID_HOME\platform-tools"
$env:Path += ";$env:ANDROID_HOME\tools"
$env:Path += ";$env:ANDROID_HOME\tools\bin"
```

**验证:**
```powershell
adb version
```

---

## 🚀 快速开始

### 方法一: 命令行构建 (推荐)

#### 1. 安装依赖
```powershell
npm install
```

#### 2. 构建 Web 应用
```powershell
npm run build
```

#### 3. 同步到 Android
```powershell
npx cap sync android
```

#### 4. 使用 Gradle 构建 APK

**调试版本 (Debug APK):**
```powershell
cd android
.\gradlew assembleDebug
```

生成的 APK 位置:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**发布版本 (Release APK):**
```powershell
cd android
.\gradlew assembleRelease
```

生成的 APK 位置:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### 方法二: Android Studio 构建

#### 1. 构建并同步
```powershell
npm run build
npx cap sync android
```

#### 2. 打开 Android 项目
```powershell
npx cap open android
```

#### 3. 在 Android Studio 中
1. 等待 Gradle 同步完成
2. 点击菜单: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. 等待构建完成
4. 点击弹出通知中的 "locate" 查看 APK

---

## 🔐 签名发布版本

发布到 Google Play 或分发给用户需要签名的 APK。

### 1. 生成密钥库 (Keystore)

```powershell
keytool -genkey -v -keystore tether-wdk-wallet.keystore -alias tether-wdk -keyalg RSA -keysize 2048 -validity 10000
```

**提示信息:**
- **密码**: 记住此密码 (例如: `your-keystore-password`)
- **别名密码**: 记住此密码 (例如: `your-key-password`)
- **组织信息**: 按提示填写

保存密钥库文件到安全位置 (例如: `D:\keystores\tether-wdk-wallet.keystore`)

### 2. 配置签名

创建文件 `android/gradle.properties` (如果不存在):

```properties
# Keystore 配置
RELEASE_STORE_FILE=D:/keystores/tether-wdk-wallet.keystore
RELEASE_STORE_PASSWORD=your-keystore-password
RELEASE_KEY_ALIAS=tether-wdk
RELEASE_KEY_PASSWORD=your-key-password
```

⚠️ **重要**: 将 `gradle.properties` 添加到 `.gitignore`,不要提交到版本控制!

### 3. 修改 build.gradle

编辑 `android/app/build.gradle`:

在 `android { ... }` 块内添加:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            if (project.hasProperty('RELEASE_STORE_FILE')) {
                storeFile file(RELEASE_STORE_FILE)
                storePassword RELEASE_STORE_PASSWORD
                keyAlias RELEASE_KEY_ALIAS
                keyPassword RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. 构建签名 APK

```powershell
cd android
.\gradlew assembleRelease
```

生成的签名 APK:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 生成 Android App Bundle (AAB)

Google Play 推荐使用 AAB 格式:

```powershell
cd android
.\gradlew bundleRelease
```

生成的 AAB:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔧 开发工作流

### 日常开发

1. **修改代码**
   ```powershell
   # 启动开发服务器
   npm run dev
   ```

2. **构建并同步**
   ```powershell
   npm run build
   npx cap sync android
   ```

3. **在 Android Studio 中运行**
   ```powershell
   npx cap open android
   ```
   然后点击运行按钮

### 快速测试

如果已连接 Android 设备或运行模拟器:

```powershell
# 构建并同步
npm run build
npx cap sync android

# 在设备上运行
cd android
.\gradlew installDebug
```

---

## 🛠️ 常用命令

### Capacitor 命令

```powershell
# 查看配置
npx cap doctor

# 同步所有平台
npx cap sync

# 仅同步 Android
npx cap sync android

# 打开 Android Studio
npx cap open android

# 添加插件
npm install @capacitor/camera
npx cap sync
```

### Gradle 命令

```powershell
cd android

# 清理构建
.\gradlew clean

# 构建调试版
.\gradlew assembleDebug

# 构建发布版
.\gradlew assembleRelease

# 安装到设备
.\gradlew installDebug

# 查看所有任务
.\gradlew tasks
```

---

## 🎨 自定义应用图标

### 1. 准备图标

需要以下尺寸的图标 (PNG 格式):

- `icon-ldpi.png` - 36x36px
- `icon-mdpi.png` - 48x48px
- `icon-hdpi.png` - 72x72px
- `icon-xhdpi.png` - 96x96px
- `icon-xxhdpi.png` - 144x144px
- `icon-xxxhdpi.png` - 192x192px

### 2. 放置图标

将图标放到对应目录:
```
android/app/src/main/res/
  ├── mipmap-ldpi/
  ├── mipmap-mdpi/
  ├── mipmap-hdpi/
  ├── mipmap-xhdpi/
  ├── mipmap-xxhdpi/
  └── mipmap-xxxhdpi/
```

### 3. 使用工具生成

推荐使用在线工具:
- https://icon.kitchen/
- https://www.appicon.co/

---

## 🌐 配置应用权限

应用已配置以下权限:

### android/app/src/main/AndroidManifest.xml

```xml
<!-- 网络访问 -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- 相机权限 (用于二维码扫描) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```

### 添加更多权限

如需添加其他权限,在 `<manifest>` 标签内添加:

```xml
<!-- 存储权限 -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- 网络状态 -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 🐛 故障排查

### 问题 1: Gradle 构建失败

**错误:**
```
Could not resolve all files for configuration ':app:debugCompileClasspath'.
```

**解决:**
```powershell
cd android
.\gradlew clean
.\gradlew --stop
.\gradlew build --refresh-dependencies
```

### 问题 2: Java 版本不兼容

**错误:**
```
Unsupported class file major version 61
```

**解决:**
确保使用 JDK 11 或 17:
```powershell
java -version
# 应显示 11.x 或 17.x
```

### 问题 3: ANDROID_HOME 未设置

**错误:**
```
ANDROID_HOME is not set
```

**解决:**
```powershell
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
```

### 问题 4: 应用白屏或崩溃

**可能原因:**
- Web 资源未正确同步

**解决:**
```powershell
npm run build
npx cap sync android
# 重新安装应用
```

### 问题 5: 相机权限被拒绝

**检查:**
1. AndroidManifest.xml 中是否有 CAMERA 权限
2. 设备设置中应用是否被授予相机权限

---

## 📊 版本管理

### 更新应用版本

编辑 `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.tether.wdk.wallet"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 2          // 每次发布递增
        versionName "1.1.0"    // 显示给用户的版本号
    }
}
```

**规则:**
- `versionCode`: 整数,每次发布必须递增
- `versionName`: 字符串,遵循语义化版本 (例如 1.0.0 → 1.1.0)

---

## 🚢 发布检查清单

发布前确保:

- [ ] 所有功能测试通过
- [ ] 在真机上测试 (不仅仅模拟器)
- [ ] 检查应用权限是否合理
- [ ] 更新 versionCode 和 versionName
- [ ] 使用 Release keystore 签名
- [ ] 测试签名后的 APK
- [ ] 准备应用截图和描述
- [ ] 检查应用图标显示正常
- [ ] 测试相机/二维码扫描功能
- [ ] 检查应用大小 (APK < 100MB)

---

## 📈 优化建议

### 减小 APK 大小

**启用 ProGuard/R8:**

在 `android/app/build.gradle` 中:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

**使用 AAB 格式:**
- Google Play 自动优化不同设备的下载大小

### 改善性能

**启用 Hermes JavaScript 引擎:**

在 `capacitor.config.ts` 中:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#1a1a1a',
  }
}
```

---

## 🔗 相关资源

### 官方文档

- [Capacitor 文档](https://capacitorjs.com/docs)
- [Android 开发者指南](https://developer.android.com/guide)
- [Gradle 用户手册](https://docs.gradle.org/)

### 工具

- [Android Studio](https://developer.android.com/studio)
- [App Icon Generator](https://icon.kitchen/)
- [APK Analyzer](https://developer.android.com/studio/build/apk-analyzer)

### 分发平台

- [Google Play Console](https://play.google.com/console)
- [F-Droid](https://f-droid.org/)
- [Amazon Appstore](https://developer.amazon.com/apps-and-games)

---

## 💡 快速命令参考

### 一键构建调试版

```powershell
npm run build ; npx cap sync android ; cd android ; .\gradlew assembleDebug ; cd ..
```

生成: `android/app/build/outputs/apk/debug/app-debug.apk`

### 一键构建发布版 (需先配置签名)

```powershell
npm run build ; npx cap sync android ; cd android ; .\gradlew assembleRelease ; cd ..
```

生成: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📞 获取帮助

遇到问题?

1. 查看 [Capacitor 故障排查](https://capacitorjs.com/docs/troubleshooting)
2. 查看 [Android Studio 问题](https://developer.android.com/studio/troubleshoot)
3. 检查 [项目 Issues](https://github.com/your-org/tether-wdk-wallet/issues)

---

**祝您打包顺利! 🚀**

Tether WDK Wallet 团队
