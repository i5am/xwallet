# 🔧 黑屏问题已修复 - 重新安装指南

## ✅ 问题已修复

我已经重新构建了 APK,修复了黑屏问题:

- ✅ 清理了旧的构建缓存
- ✅ 重新构建了 Web 应用
- ✅ 正确同步了所有资源到 Android
- ✅ 使用 `clean` 模式重新打包

## 📦 新的 APK 信息

- **文件**: `app-debug.apk`
- **大小**: 5.63 MB
- **位置**: `D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk`
- **构建时间**: 2025-10-21 23:43

---

## 📱 安装步骤 (重要!)

### ⚠️ 必须先卸载旧版本

由于之前的版本有问题,**必须先卸载**,然后再安装新版本:

### 方法 1: 手动卸载并安装

#### 步骤 1: 卸载旧版本
1. 在手机上找到 "Tether WDK Wallet" 应用
2. 长按图标 → 卸载
3. 或: 设置 → 应用 → Tether WDK Wallet → 卸载

#### 步骤 2: 安装新版本
1. 使用微信/QQ/USB 将新的 APK 传到手机
2. 点击安装
3. 打开应用测试

### 方法 2: 使用 adb (如果设备已连接)

```powershell
# 添加 adb 到 PATH
$env:Path += ";C:\Users\RAZER\AppData\Local\Android\Sdk\platform-tools"

# 卸载旧版本
adb uninstall com.tether.wdk.wallet

# 安装新版本
adb install "D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## 🎯 修复了什么?

### 之前的问题:
- ❌ Web 资源可能没有正确同步
- ❌ 旧的缓存文件干扰
- ❌ Gradle 增量构建可能有遗留问题

### 现在的修复:
- ✅ 完全清理了 `dist` 目录
- ✅ 完全清理了 Android 资源目录
- ✅ 使用 `gradlew clean` 清理 Android 构建
- ✅ 重新构建了所有文件
- ✅ 确保资源正确同步到 `android/app/src/main/assets/public`

---

## 🔍 如果还是黑屏怎么办?

### 检查清单:

1. **确认已卸载旧版本**
   - 长按应用图标查看是否还在
   - 如果还在,完全卸载后再安装

2. **检查手机 Android 版本**
   - 需要 Android 5.0 (API 21) 或更高
   - 设置 → 关于手机 → Android 版本

3. **检查存储空间**
   - 确保至少有 100MB 可用空间

4. **清除应用数据** (如果之前安装过)
   - 设置 → 应用 → Tether WDK Wallet
   - 存储 → 清除数据
   - 然后重新安装

### 查看错误日志 (adb):

如果还是有问题,可以通过 adb 查看日志:

```powershell
# 连接设备后运行
$env:Path += ";C:\Users\RAZER\AppData\Local\Android\Sdk\platform-tools"

# 查看应用日志
adb logcat -c  # 清除旧日志
adb logcat | Select-String "tether"  # 查看应用相关日志

# 或者查看所有错误
adb logcat *:E  # 只显示错误
```

将日志发给我,我可以帮您分析。

---

## 💡 快速测试

安装新版本后,应该看到:

1. **启动画面**: 黑色背景的 Splash Screen (2秒)
2. **主界面**: 显示钱包列表或创建钱包页面
3. **正常交互**: 可以点击按钮,创建钱包等

如果看到这些,说明修复成功! ✅

---

## 📞 需要帮助?

如果新版本还是有问题,请告诉我:
1. 手机品牌和型号
2. Android 版本
3. 出现的具体现象
4. 是否完全卸载了旧版本

我会进一步帮您诊断!

---

## 🚀 下次避免这个问题

以后重新构建时,使用这个完整的脚本:

```powershell
# 完整的重新构建流程
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
npm run build
npx cap sync android
cd android
.\gradlew clean assembleDebug
cd ..
```

或者直接运行:
```powershell
.\build-android.ps1  # 已包含清理步骤
```

---

**现在请卸载旧版本,然后安装新的 APK 测试!** 🎉
