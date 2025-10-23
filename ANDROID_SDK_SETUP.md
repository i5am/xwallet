# ⚠️ Android SDK 未找到 - 解决方案

## 问题

系统中未找到 Android SDK,无法构建 APK。

## 📋 解决方案

### 方案一:安装 Android Studio (推荐)

这是最简单的方法,Android Studio 会自动安装 SDK。

#### 步骤:

1. **下载 Android Studio**
   - 访问: https://developer.android.com/studio
   - 下载 Windows 版本

2. **安装 Android Studio**
   - 运行安装程序
   - ✅ 勾选 "Android SDK"
   - ✅ 勾选 "Android SDK Platform"
   - ✅ 勾选 "Android Virtual Device"

3. **首次启动配置**
   - 选择 "Standard" 安装类型
   - 等待 SDK 下载完成 (约 2-3 GB)

4. **验证安装**
   ```powershell
   Test-Path "C:\Users\RAZER\AppData\Local\Android\Sdk"
   ```
   应该返回 `True`

5. **重新构建 APK**
   ```powershell
   cd D:\projects\wdk
   $env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
   cd android
   .\gradlew assembleDebug
   ```

---

### 方案二:仅安装 Android SDK 命令行工具

如果不想安装完整的 Android Studio:

#### 步骤:

1. **下载命令行工具**
   - 访问: https://developer.android.com/studio#command-line-tools-only
   - 下载 "Command line tools only"

2. **解压并安装**
   ```powershell
   # 创建 SDK 目录
   New-Item -Path "C:\Android\Sdk" -ItemType Directory -Force
   
   # 解压下载的 zip 到 C:\Android\Sdk\cmdline-tools\latest\
   ```

3. **安装必要组件**
   ```powershell
   cd C:\Android\Sdk\cmdline-tools\latest\bin
   
   # 接受许可
   .\sdkmanager --licenses
   
   # 安装必要组件
   .\sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

4. **更新项目配置**
   编辑 `D:\projects\wdk\android\local.properties`:
   ```properties
   sdk.dir=C\:\\Android\\Sdk
   ```

5. **重新构建**
   ```powershell
   cd D:\projects\wdk\android
   $env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
   $env:ANDROID_HOME="C:\Android\Sdk"
   .\gradlew assembleDebug
   ```

---

### 方案三:使用现有的 Android Studio 打开项目

如果您已经安装了 Android Studio 但 SDK 位置不同:

1. **打开 Android Studio**

2. **打开项目**
   - File → Open
   - 选择 `D:\projects\wdk\android` 目录

3. **等待 Gradle 同步**

4. **构建 APK**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

5. **找到 APK**
   - 构建完成后点击通知中的 "locate"
   - 或在 `android/app/build/outputs/apk/debug/` 目录

---

## 🚀 快速开始 (推荐方案一)

### 1. 下载并安装 Android Studio
   https://developer.android.com/studio

### 2. 等待 SDK 安装完成

### 3. 运行构建脚本
   ```powershell
   cd D:\projects\wdk
   .\build-android.ps1
   ```

或手动构建:
```powershell
cd D:\projects\wdk
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
npm run build
npx cap sync android
cd android
.\gradlew assembleDebug
```

---

## 📍 SDK 默认位置

安装后 SDK 通常在:
- Windows: `C:\Users\<用户名>\AppData\Local\Android\Sdk`
- 自定义: `C:\Android\Sdk`

---

## 🔍 检查 SDK 是否已安装

运行以下命令检查:
```powershell
# 检查默认位置
Test-Path "$env:LOCALAPPDATA\Android\Sdk"

# 或检查自定义位置
Test-Path "C:\Android\Sdk"

# 查找 adb 命令 (如果能找到说明 SDK 已安装)
Get-Command adb -ErrorAction SilentlyContinue
```

---

## ❓ 常见问题

### Q: 我确定已经安装了 Android Studio,但找不到 SDK

**A:** 检查以下位置:
```powershell
# 方法 1: 在 Android Studio 中查看
# Settings → Appearance & Behavior → System Settings → Android SDK
# 查看 "Android SDK Location" 路径

# 方法 2: 搜索 platform-tools 目录
Get-ChildItem C:\ -Recurse -Filter "platform-tools" -ErrorAction SilentlyContinue | Select-Object FullName
```

### Q: 下载 SDK 需要多长时间?

**A:** 取决于网络速度,通常需要:
- SDK Platform Tools: ~10 MB
- Android SDK Platform 34: ~50 MB
- Build Tools: ~50 MB
- 总计约 2-3 GB (完整安装)
- 下载时间: 10-30 分钟

### Q: 我可以使用在线服务构建 APK 吗?

**A:** 可以,但不推荐。对于本地项目:
- 使用 GitHub Actions (需要配置 CI/CD)
- 使用 Appetize.io (在线模拟器)
- 但最可靠的还是本地构建

---

## 📞 需要帮助?

完成安装后,请告诉我,我会帮您继续构建 APK!

---

**下一步:** 请先安装 Android Studio,然后我们继续构建。
