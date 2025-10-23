# 📱 iOS Simulator .app 文件安装指南

## 概述

从 Ionic Appflow 下载的 **iOS Simulator** 构建是一个 `.zip` 文件,解压后得到 `.app` 文件。这个文件只能在 **Mac 的 iOS 模拟器**中安装,不能安装到真实设备。

---

## ⚠️ 重要前提

**.app 文件只能在 Mac 上使用!**

如果您使用的是 Windows,`.app` 文件无法直接使用。您需要:
- **选项 1**: 在 Mac 上安装(推荐)
- **选项 2**: 构建 iOS Device 版本(会得到 .ipa 文件,可以装到真机)

---

## 🍎 在 Mac 上安装 .app 文件

### 方法 1: 使用 Xcode Simctl (推荐)

#### 第一步: 准备文件

```bash
# 1. 下载 Appflow 构建的 zip 文件
# 假设下载到了 ~/Downloads/build-abc123.zip

# 2. 解压 zip
cd ~/Downloads
unzip build-abc123.zip

# 3. 重命名为 .app (如果需要)
mv build-abc123 xwallet.app

# 或者直接去掉 .zip 后缀
mv build-abc123.zip xwallet.app
```

#### 第二步: 启动模拟器

```bash
# 查看可用的模拟器
xcrun simctl list devices available

# 示例输出:
# -- iOS 17.0 --
#     iPhone 15 (12345678-1234-1234-1234-123456789ABC) (Shutdown)
#     iPhone 15 Pro (98765432-4321-4321-4321-CBA987654321) (Shutdown)

# 启动模拟器 (选择一个设备 ID)
xcrun simctl boot 12345678-1234-1234-1234-123456789ABC

# 或者直接用设备名称
xcrun simctl boot "iPhone 15"

# 打开模拟器 GUI
open -a Simulator
```

#### 第三步: 安装应用

```bash
# 方法 A: 安装到当前启动的模拟器
xcrun simctl install booted ~/Downloads/xwallet.app

# 方法 B: 安装到指定设备
xcrun simctl install "iPhone 15" ~/Downloads/xwallet.app

# 方法 C: 使用设备 ID
xcrun simctl install 12345678-1234-1234-1234-123456789ABC ~/Downloads/xwallet.app
```

#### 第四步: 启动应用

```bash
# 查找应用的 Bundle ID (在 app.json 中配置的)
# 默认是: com.tether.wdk.wallet

# 启动应用
xcrun simctl launch booted com.tether.wdk.wallet

# 或者在模拟器界面上点击应用图标
```

---

### 方法 2: 拖拽安装 (最简单)

#### 步骤:

1. **启动 iOS 模拟器**
   ```bash
   open -a Simulator
   ```

2. **选择设备**
   - 模拟器菜单: Device → iOS 17.0 → iPhone 15

3. **拖拽安装**
   - 将 `xwallet.app` 文件直接拖到模拟器窗口
   - 应用会自动安装
   - 主屏幕会出现应用图标

4. **点击图标启动**
   - 在模拟器主屏幕找到 "Tether WDK Wallet"
   - 点击启动

---

### 方法 3: 使用 ios-deploy (可选)

```bash
# 安装 ios-deploy (如果还没有)
brew install ios-deploy

# 安装应用
ios-deploy --bundle ~/Downloads/xwallet.app

# 安装并启动
ios-deploy --bundle ~/Downloads/xwallet.app --debug
```

---

## 🔧 常见问题

### 问题 1: "App installation failed"

**原因**: 应用签名问题或模拟器架构不匹配

**解决方案**:
```bash
# 重置模拟器
xcrun simctl erase all

# 重新启动模拟器
xcrun simctl boot "iPhone 15"
open -a Simulator

# 再次安装
xcrun simctl install booted ~/Downloads/xwallet.app
```

### 问题 2: "Unable to boot device"

**原因**: Xcode 未正确配置或模拟器损坏

**解决方案**:
```bash
# 关闭所有模拟器
killall Simulator

# 重启模拟器
open -a Simulator
```

### 问题 3: 应用安装后崩溃

**原因**: Capacitor WebView 或插件问题

**解决方案**:
```bash
# 查看日志
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "xwallet"'

# 或在 Xcode 中查看
# Window → Devices and Simulators → 选择模拟器 → View Device Logs
```

### 问题 4: 找不到 xcrun 命令

**原因**: Xcode 命令行工具未安装

**解决方案**:
```bash
# 安装 Xcode Command Line Tools
xcode-select --install

# 验证安装
xcrun --version
```

---

## 📱 如果您在 Windows 上

### 您有几个选择:

#### 选项 1: 构建 iOS Device 版本 (推荐)

在 Appflow Dashboard 中:
1. New Build
2. Target: **iOS Device** (而不是 Simulator)
3. 需要配置证书 (参考 `docs/GITHUB-ACTIONS-IOS-GUIDE.md`)
4. 会得到 `.ipa` 文件

`.ipa` 文件可以:
- 使用 Diawi 生成安装链接
- 通过 TestFlight 分发
- 使用 Apple Configurator 安装

#### 选项 2: 使用云 Mac

租用云 Mac 服务:
- **MacinCloud**: $1/小时
- **AWS EC2 Mac**: 按小时计费
- **Shells**: https://www.shells.com

在云 Mac 上安装 Simulator 构建进行测试。

#### 选项 3: 等待真机测试

- 配置好证书后构建 Device 版本
- 直接在真实 iPhone 上测试
- 跳过模拟器测试环节

---

## 💡 .app vs .ipa 对比

| 特性 | .app (Simulator) | .ipa (Device) |
|------|------------------|---------------|
| **平台** | Mac 模拟器 | 真实 iOS 设备 |
| **需要证书** | ❌ 不需要 | ✅ 需要 |
| **构建速度** | 更快 | 较慢 |
| **测试场景** | 开发测试 | 真实环境测试 |
| **性能** | 接近真机 | 真实性能 |
| **硬件功能** | 部分模拟 | 完整支持 |
| **安装方式** | 简单 | 需要配置 |

---

## 🎯 推荐工作流程

### 开发阶段:
1. **Simulator 构建** (.app)
   - 快速验证代码
   - 不需要证书
   - 在 Mac 模拟器测试

### 测试阶段:
2. **Device 构建** (.ipa)
   - 配置证书
   - 真机测试
   - 验证实际性能

### 发布阶段:
3. **App Store 构建** (.ipa)
   - 使用 App Store 证书
   - 提交审核
   - 正式发布

---

## 📝 完整示例脚本

创建一个 Mac 上的安装脚本:

```bash
#!/bin/bash
# install-simulator-app.sh

# 配置
APP_PATH="$HOME/Downloads/xwallet.app"
DEVICE_NAME="iPhone 15"
BUNDLE_ID="com.tether.wdk.wallet"

echo "🚀 开始安装 iOS Simulator 应用..."

# 1. 检查文件是否存在
if [ ! -d "$APP_PATH" ]; then
    echo "❌ 错误: 找不到 $APP_PATH"
    exit 1
fi

# 2. 启动模拟器
echo "📱 启动模拟器: $DEVICE_NAME"
xcrun simctl boot "$DEVICE_NAME" 2>/dev/null || echo "模拟器已在运行"
open -a Simulator

# 3. 等待模拟器启动
sleep 3

# 4. 卸载旧版本 (如果存在)
echo "🗑️  卸载旧版本..."
xcrun simctl uninstall booted "$BUNDLE_ID" 2>/dev/null || true

# 5. 安装应用
echo "📦 安装应用..."
xcrun simctl install booted "$APP_PATH"

# 6. 启动应用
echo "🎉 启动应用..."
xcrun simctl launch booted "$BUNDLE_ID"

echo "✅ 安装完成!"
```

使用方法:
```bash
chmod +x install-simulator-app.sh
./install-simulator-app.sh
```

---

## 🔗 相关资源

- **Xcode Simctl 文档**: `xcrun simctl help`
- **Capacitor iOS 文档**: https://capacitorjs.com/docs/ios
- **Appflow 文档**: https://ionic.io/docs/appflow

---

## ✅ 总结

### 如果您有 Mac:
1. 下载 zip 文件
2. 重命名为 `.app`
3. 拖拽到模拟器
4. 或使用 `xcrun simctl install`

### 如果您在 Windows:
1. 构建 iOS Device 版本 (需要证书)
2. 会得到 `.ipa` 文件
3. 可以安装到真实 iPhone
4. 参考 `docs/GITHUB-ACTIONS-IOS-GUIDE.md` 配置证书

---

**需要帮助?** 告诉我您遇到的具体问题! 🚀
