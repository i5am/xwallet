# 📱 iOS 云构建配置总结

## ⚠️ 当前状态

**遇到问题**: EAS Build 无法识别 Capacitor 项目的 Xcode scheme

**错误信息**: 
```
scheme 'App' does not exist, make sure it's marked as shared
```

**原因**: EAS Build 主要是为 **Expo 项目**设计的,对 **Capacitor 项目**的支持有限。

---

## ✅ 已完成的配置

1. **iOS 平台添加**: ✅ `npx cap add ios`
2. **EAS 配置**: ✅ `eas.json` 已创建
3. **应用配置**: ✅ `app.json` 已更新
4. **Xcode Scheme**: ✅ 已创建共享 scheme
5. **Capacitor 配置**: ✅ iOS 设置已添加
6. **GitHub Actions**: ✅ iOS 构建工作流已创建

---

## 🎯 推荐的构建方案

### 方案 A: GitHub Actions (⭐ 推荐 - 免费且可靠)

**为什么推荐**:
- ✅ 完全免费 (公开仓库)
- ✅ 完美支持 Capacitor
- ✅ 使用真实的 macOS 环境
- ✅ 可以使用 Xcode 命令行工具
- ✅ 已为您创建好配置文件

**配置文件**: `.github/workflows/ios-build.yml`

**使用步骤**:

#### 1. 获取 Apple 签名证书

在 Mac 上或使用 Keychain Access:
```bash
# 导出证书 (需要 Mac)
security find-identity -v -p codesigning

# 导出为 .p12 文件
# 在 Keychain Access 中: 右键证书 → 导出

# 转换为 Base64
base64 -i certificate.p12 -o certificate-base64.txt
```

#### 2. 获取 Provisioning Profile

1. 访问 [Apple Developer Portal](https://developer.apple.com/account/)
2. 创建 App ID: `com.tether.wdk.wallet`
3. 创建 Provisioning Profile
4. 下载 `.mobileprovision` 文件
5. 转换为 Base64:
   ```bash
   base64 -i profile.mobileprovision -o profile-base64.txt
   ```

#### 3. 配置 GitHub Secrets

在 GitHub 仓库设置中添加:

```
Settings → Secrets and variables → Actions → New repository secret
```

需要添加的 Secrets:
- `APPLE_CERTIFICATE_BASE64`: 证书的 Base64 内容
- `APPLE_CERTIFICATE_PASSWORD`: 证书密码
- `APPLE_PROVISIONING_PROFILE_BASE64`: Profile 的 Base64 内容
- `APPLE_TEAM_ID`: 您的 Apple Team ID (10位字符)

#### 4. 触发构建

```bash
# 推送代码
git push origin master

# 或创建 release tag
git tag v1.0.0
git push origin v1.0.0
```

构建完成后,在 GitHub Actions 页面下载 `.ipa` 文件。

---

### 方案 B: Ionic Appflow (⭐ 专为 Capacitor 设计)

**官网**: https://ionic.io/appflow

**价格**: 
- 免费: 每月 500 分钟构建时间
- Starter: $49/月
- Growth: $199/月

**优势**:
- ✅ 专为 Capacitor 设计
- ✅ 零配置
- ✅ 自动处理签名
- ✅ 支持 Live Updates

**设置步骤**:

```bash
# 1. 安装 Ionic CLI
npm install -g @ionic/cli

# 2. 登录
ionic login

# 3. 连接项目
ionic link

# 4. 开始构建
ionic package build ios --type=app-store
```

---

### 方案 C: 本地 Mac 构建 (最可靠)

如果您有 Mac 电脑:

```bash
# 1. 打开项目
cd your-project
npx cap sync ios
npx cap open ios

# 2. 在 Xcode 中
# - Product → Archive
# - Distribute App
# - 选择分发方式 (Ad Hoc / App Store)
```

---

### 方案 D: 云 Mac 服务

如果没有 Mac,可以租用云 Mac:

**MacinCloud**: https://www.macincloud.com/
- 价格: $1/小时 或 $30/月
- macOS + Xcode 预装

**AWS EC2 Mac**: https://aws.amazon.com/ec2/instance-types/mac/
- 按小时计费
- 需要 AWS 账号

**MacStadium**: https://www.macstadium.com/
- 月付计划
- 适合长期使用

---

## 📊 方案对比

| 方案 | 成本 | 难度 | 速度 | Capacitor 支持 | 推荐度 |
|------|------|------|------|----------------|--------|
| **GitHub Actions** | 免费 | 中等 | 快 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Ionic Appflow** | $49/月 | 简单 | 快 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **本地 Mac** | 硬件成本 | 简单 | 最快 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **云 Mac** | $30-100/月 | 简单 | 快 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **EAS Build** | $29/月 | 简单 | 快 | ⭐⭐ | ⭐ |

---

## 🚀 快速开始 (GitHub Actions)

如果您选择 **GitHub Actions** (最推荐),按以下步骤:

### 第一步: 在 Mac 上准备证书 (只需一次)

如果您没有 Mac,可以:
1. 借用朋友的 Mac (只需 15 分钟)
2. 使用云 Mac 服务 (临时租用 1 小时)
3. 找人代为生成证书

### 第二步: 推送代码到 GitHub

```bash
cd d:\projects\wdk
git remote add origin https://github.com/YOUR_USERNAME/wdk.git
git push -u origin master
```

### 第三步: 添加 Secrets

在 GitHub 上配置 4 个 Secrets (见上文)

### 第四步: 触发构建

```bash
git tag v1.0.0
git push origin v1.0.0
```

10-15 分钟后,IPA 文件会出现在 Actions 页面!

---

## 📚 相关文档

- [GitHub Actions iOS 构建配置](../.github/workflows/ios-build.yml)
- [iOS 构建故障排除](./iOS-BUILD-TROUBLESHOOTING.md)
- [Capacitor iOS 文档](https://capacitorjs.com/docs/ios)

---

## 💡 需要帮助?

如果遇到问题:

1. **查看故障排除文档**: `docs/iOS-BUILD-TROUBLESHOOTING.md`
2. **检查 GitHub Actions 日志**: 详细的构建日志
3. **咨询 AI**: 提供错误信息获取帮助

---

## ✨ 总结

**最佳选择**: **GitHub Actions** + 临时云 Mac (准备证书)

**理由**:
- 完全免费 (构建)
- 一次配置,永久使用
- 完美支持 Capacitor
- 自动化程度高

**成本**: 只需一次性租用云 Mac 1小时 (~$1-5) 来生成证书和 Profile。

**时间**: 首次配置约 30-60 分钟,之后每次构建 10-15 分钟。

---

**👉 下一步**: 决定使用哪个方案后,告诉我,我会提供详细的操作指南!
