# 🍎 iOS 云构建完整指南

本文档提供两种云构建方案,您可以根据需要选择。

---

## 📋 目录

- [方案 A: GitHub Actions (推荐 - 免费)](#方案-a-github-actions)
- [方案 B: Expo EAS Build (最简单)](#方案-b-expo-eas-build)
- [比较表](#比较表)

---

## 🌟 方案 A: GitHub Actions (推荐 - 免费)

### 优势
- ✅ **完全免费** (公开仓库无限制,私有仓库每月 2000 分钟)
- ✅ **自动化程度高** - Push 代码即自动构建
- ✅ **完全控制** - 可自定义每一步
- ✅ **macOS runner** - 使用 Apple Silicon M1

### 前置要求

1. **Apple Developer 账号** ($99/年)
   - 注册地址: https://developer.apple.com/programs/

2. **GitHub 仓库**
   - 将项目推送到 GitHub

### 📝 详细配置步骤

#### 步骤 1: 创建 App ID

1. 访问 [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. 点击 "+" 创建新的 Identifier
3. 选择 "App IDs"
4. 配置:
   - Description: `WDK Wallet`
   - Bundle ID: `com.yourcompany.wdk` (记住这个,后面要用)
   - Capabilities: 根据需要选择(如 Push Notifications, In-App Purchase 等)

#### 步骤 2: 创建证书

1. 访问 [Certificates](https://developer.apple.com/account/resources/certificates/list)
2. 点击 "+" 创建新证书
3. 选择证书类型:
   - **Development**: `iOS App Development` (用于测试)
   - **Production**: `iOS Distribution` (用于发布)
4. 上传 CSR 文件(Certificate Signing Request):

**生成 CSR (在 Mac 上)**:
```bash
# 在 Mac 的终端运行
openssl req -new -newkey rsa:2048 -nodes \
  -keyout ios_distribution.key \
  -out CertificateSigningRequest.certSigningRequest
```

5. 下载生成的证书文件 (.cer)

#### 步骤 3: 创建 Provisioning Profile

1. 访问 [Profiles](https://developer.apple.com/account/resources/profiles/list)
2. 点击 "+" 创建新 Profile
3. 选择类型:
   - **Ad Hoc**: 用于内部测试 (最多 100 台设备)
   - **App Store**: 用于提交到 App Store
4. 选择 App ID (步骤1创建的)
5. 选择证书 (步骤2创建的)
6. (Ad Hoc) 选择测试设备
7. 下载 Provisioning Profile (.mobileprovision)

#### 步骤 4: 转换证书为 P12

**在 Mac 上**:
```bash
# 将 .cer 证书和私钥合并为 .p12
openssl pkcs12 -export \
  -inkey ios_distribution.key \
  -in ios_distribution.cer \
  -out ios_distribution.p12 \
  -password pass:YOUR_PASSWORD_HERE

# 转换为 Base64 (用于 GitHub Secrets)
base64 -i ios_distribution.p12 -o ios_distribution_base64.txt
base64 -i YOUR_PROFILE.mobileprovision -o provisioning_profile_base64.txt
```

**在 Windows 上** (如果有 .p12 文件):
```powershell
# 转换为 Base64
[Convert]::ToBase64String([IO.File]::ReadAllBytes("ios_distribution.p12")) | Out-File ios_distribution_base64.txt
[Convert]::ToBase64String([IO.File]::ReadAllBytes("YOUR_PROFILE.mobileprovision")) | Out-File provisioning_profile_base64.txt
```

#### 步骤 5: 配置 GitHub Secrets

1. 进入 GitHub 仓库
2. 设置 → Secrets and variables → Actions
3. 添加以下 Secrets:

| Secret 名称 | 说明 | 获取方式 |
|------------|------|---------|
| `IOS_CERTIFICATE_BASE64` | P12 证书的 Base64 | 步骤 4 生成 |
| `IOS_CERTIFICATE_PASSWORD` | P12 证书密码 | 步骤 4 设置的密码 |
| `IOS_PROVISIONING_PROFILE_BASE64` | Provisioning Profile 的 Base64 | 步骤 4 生成 |
| `KEYCHAIN_PASSWORD` | 临时 Keychain 密码 | 随机生成,如 `temp1234` |

#### 步骤 6: 配置 exportOptions.plist

编辑 `ios/App/exportOptions.plist`:

```xml
<key>teamID</key>
<string>XXXXXXXXXX</string> <!-- 替换为你的 Team ID -->

<key>provisioningProfiles</key>
<dict>
    <key>com.yourcompany.wdk</key> <!-- 替换为你的 Bundle ID -->
    <string>WDK Wallet AdHoc</string> <!-- 替换为 Provisioning Profile 名称 -->
</dict>
```

**查找 Team ID**:
- 访问 [Apple Developer Membership](https://developer.apple.com/account/#/membership/)
- Team ID 显示在页面上

#### 步骤 7: 更新 Xcode 项目配置

编辑 `ios/App/App.xcodeproj/project.pbxproj`:

在有 Mac 的情况下:
1. 用 Xcode 打开项目: `npx cap open ios`
2. 选择项目 → App Target
3. 签名 & 功能 (Signing & Capabilities):
   - Bundle Identifier: `com.yourcompany.wdk`
   - Team: 选择你的开发团队
   - Signing: Manual
   - Provisioning Profile: 选择你创建的 Profile

#### 步骤 8: 推送代码触发构建

```bash
git add .
git commit -m "Configure iOS cloud build"
git push origin main
```

GitHub Actions 会自动:
1. 安装依赖
2. 构建 Web 资源
3. 配置 iOS 环境
4. 导入证书和 Profile
5. 构建并导出 IPA

#### 步骤 9: 下载构建产物

1. 进入 GitHub 仓库的 Actions 页面
2. 选择完成的工作流运行
3. 下载 `WDK-Wallet-iOS` artifact
4. 解压得到 `.ipa` 文件

#### 步骤 10: 安装 IPA

**方法 1: 使用 Apple Configurator** (推荐)
1. 下载 [Apple Configurator](https://apps.apple.com/us/app/apple-configurator/id1037126344)
2. 连接 iPhone 到 Mac
3. 拖拽 .ipa 到设备

**方法 2: 使用 Xcode**
```bash
# 在 Mac 上
xcrun devicectl device install app --device <DEVICE_ID> WDK-Wallet.ipa
```

**方法 3: 使用 TestFlight**
- 如果使用 App Store Profile,可以上传到 TestFlight

---

## 🚀 方案 B: Expo EAS Build (最简单)

### 优势
- ✅ **零配置** - 自动处理证书和 Profile
- ✅ **超级简单** - 一条命令即可
- ✅ **详细日志** - 网页查看构建过程
- ✅ **自动签名** - 无需手动配置

### 费用
- 免费层: 30 次构建/月
- Pro: $29/月 - 无限构建
- 官网: https://expo.dev/pricing

### 📝 详细配置步骤

#### 步骤 1: 安装 EAS CLI

```bash
npm install -g eas-cli
```

#### 步骤 2: 登录/注册 Expo 账号

```bash
eas login
# 或者注册新账号
eas register
```

#### 步骤 3: 配置项目

```bash
# 初始化 EAS 项目
eas build:configure
```

这会创建 `eas.json` 文件(已为您创建)。

#### 步骤 4: 配置 Apple Developer 账号

```bash
# EAS 会引导你完成配置
eas credentials
```

选项:
1. **自动管理** (推荐):
   - EAS 会自动创建证书和 Provisioning Profile
   - 需要提供 Apple ID 和密码
   - 支持双因素认证

2. **手动管理**:
   - 上传已有的证书和 Profile

#### 步骤 5: 构建 iOS 应用

```bash
# 开发构建 (可在模拟器运行)
eas build --platform ios --profile development

# 预览构建 (可在真机测试)
eas build --platform ios --profile preview

# 生产构建 (提交到 App Store)
eas build --platform ios --profile production
```

#### 步骤 6: 监控构建过程

构建开始后,会显示一个 URL:
```
🔗 Build URL: https://expo.dev/accounts/[username]/projects/[project]/builds/[build-id]
```

点击链接可以:
- 实时查看构建日志
- 下载构建产物
- 查看错误信息

#### 步骤 7: 下载并安装 IPA

构建完成后:

**方法 1: 扫描二维码** (preview build)
- EAS 会生成一个安装页面
- 手机扫描二维码即可安装

**方法 2: 下载 IPA**
```bash
# 列出所有构建
eas build:list

# 下载指定构建
eas build:download --id [BUILD_ID]
```

#### 步骤 8: 提交到 App Store (可选)

```bash
eas submit --platform ios
```

EAS 会自动:
1. 上传 IPA 到 App Store Connect
2. 填写必要的元数据
3. 提交审核

---

## 📊 比较表

| 功能 | GitHub Actions | Expo EAS Build |
|-----|---------------|----------------|
| **价格** | 免费 (公开仓库) | 30次/月免费 |
| **设置难度** | ⭐⭐⭐⭐ (中等) | ⭐ (极简单) |
| **证书管理** | 手动 | 自动 |
| **构建时间** | 10-15 分钟 | 10-20 分钟 |
| **自定义** | 高 | 中 |
| **日志查看** | GitHub UI | 专用网页 |
| **私有仓库** | 限额 | 无限制 |
| **推荐场景** | 开源项目/企业 | 快速原型/个人项目 |

---

## 🎯 推荐选择

### 选择 GitHub Actions 如果:
- ✅ 项目是开源的
- ✅ 你熟悉 CI/CD
- ✅ 需要完全控制构建过程
- ✅ 想要免费方案

### 选择 Expo EAS 如果:
- ✅ 想要最快速度上手
- ✅ 不想处理证书配置
- ✅ 预算充足 ($29/月)
- ✅ 构建频率不高 (免费层够用)

---

## 🆘 常见问题

### Q: 我没有 Mac,能创建证书吗?
A: 可以!使用 Expo EAS Build 的自动签名功能,完全不需要 Mac。

### Q: GitHub Actions 的 macOS runner 够快吗?
A: 是的,使用 Apple Silicon M1 芯片,构建速度很快。

### Q: 能同时使用两种方案吗?
A: 可以!您可以在 GitHub Actions 中调用 EAS CLI。

### Q: 如何更新证书?
A: 
- GitHub Actions: 更新 GitHub Secrets
- EAS: 运行 `eas credentials` 重新配置

### Q: 构建失败了怎么办?
A:
1. 查看详细日志
2. 检查证书是否过期
3. 确认 Bundle ID 配置正确
4. 验证 Provisioning Profile 包含了测试设备 (Ad Hoc)

---

## 📚 相关资源

- [Capacitor iOS 文档](https://capacitorjs.com/docs/ios)
- [Apple Developer Portal](https://developer.apple.com/account)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Expo EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [Xcode 云构建](https://developer.apple.com/xcode-cloud/)

---

## 🎉 下一步

选择一个方案后:

1. **测试构建** - 确保配置正确
2. **配置 CI/CD** - 自动化发布流程
3. **TestFlight** - 邀请测试用户
4. **App Store** - 提交正式审核

祝您构建顺利! 🚀
