# 🛠️ XWallet 脚本工具

## 📱 移动端构建

### Android
```bash
# 构建 Android APK
npm run build
npx cap sync android
./build-android.ps1

# 安装到设备
./install-with-adb.ps1
# 或
./安装APK.bat
```

### iOS
```bash
# 同步到 iOS 项目
npm run build
npx cap sync ios

# 在 macOS 上打开 Xcode
cd ios/App
open App.xcworkspace
```

### EAS Build (云构建)
```bash
# 配置 iOS 构建
./scripts/setup-eas-build-ios.ps1

# 配置 GitHub Actions
./scripts/setup-github-actions-ios.ps1
```

## ⛓️ 区块链合约

### 本地测试网
```bash
# 启动 Hardhat 节点
cd contracts
./start-node.ps1
# 或
./start-node.bat

# 部署合约
./deploy-local.ps1
# 或
./deploy-local.bat

# 部署所有合约
./deploy-all.ps1
# 或
./deploy-all.bat
```

## 🚀 开发服务器

```bash
# 启动前端开发服务器
./start.ps1
# 或
npm run dev
```

## 📝 脚本说明

| 脚本 | 用途 | 平台 |
|------|------|------|
| `build-android.ps1` | 构建 Android APK | Windows |
| `install-with-adb.ps1` | 通过 ADB 安装 APK | Windows |
| `安装APK.bat` | 安装 APK（批处理） | Windows |
| `start.ps1` | 启动开发服务器 | Windows |
| `scripts/setup-eas-build-ios.ps1` | 配置 EAS iOS 构建 | Windows |
| `scripts/setup-github-actions-ios.ps1` | 配置 GitHub Actions | Windows |
| `contracts/start-node.ps1` | 启动 Hardhat 节点 | Windows |
| `contracts/deploy-local.ps1` | 部署到本地网络 | Windows |
| `contracts/deploy-all.ps1` | 部署所有合约 | Windows |

## 🔧 环境要求

### Android 构建
- Android Studio
- Android SDK
- Gradle
- ADB（用于安装）

### iOS 构建
- macOS
- Xcode
- CocoaPods
- Apple Developer 账号

### 合约部署
- Node.js >= 16
- Hardhat
- Solidity 编译器

## 💡 提示

1. **首次运行**：确保已执行 `npm install` 安装依赖
2. **环境变量**：复制 `.env.example` 为 `.env.local` 并配置
3. **权限问题**：PowerShell 脚本可能需要执行策略调整
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## 📚 相关文档

- [开发指南](../DEVELOPMENT.md)
- [部署清单](../DEPLOYMENT_CHECKLIST.md)
- [文档索引](../DOCS_INDEX.md)
