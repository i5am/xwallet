# 🚀 GitHub Actions iOS 构建完整指南

## 概述

本指南将帮助您使用 GitHub Actions **免费构建 iOS 应用**。

**优势**:
- ✅ 完全免费 (公开仓库)
- ✅ 自动化构建
- ✅ 完美支持 Capacitor
- ✅ 可以下载 IPA 文件

**前置条件**:
- GitHub 账号 (免费)
- Apple Developer 账号 ($99/年)
- 临时访问 Mac (或云 Mac 1小时, ~$1-5)

---

## 📋 第一部分: 准备签名证书 (一次性配置)

### 选项 A: 使用自己的 Mac

#### 1. 创建签名证书

```bash
# 打开 Keychain Access
# 菜单: Certificate Assistant → Request a Certificate From a Certificate Authority
# 填写信息并保存到磁盘

# 访问 Apple Developer Portal
open https://developer.apple.com/account/resources/certificates/add

# 上传 CSR 文件,下载证书
# 双击证书安装到 Keychain
```

#### 2. 导出证书为 P12

```bash
# 在 Keychain Access 中:
# 1. 找到您的证书 (iPhone Distribution 或 iPhone Developer)
# 2. 右键 → Export
# 3. 保存为 .p12 格式
# 4. 设置密码 (请记住这个密码!)

# 转换为 Base64
base64 -i certificate.p12 -o certificate-base64.txt
```

#### 3. 创建 App ID 和 Provisioning Profile

```bash
# 访问 Apple Developer Portal
open https://developer.apple.com/account/resources/identifiers/add/bundleId

# 1. 创建 App ID: com.tether.wdk.wallet
# 2. 启用需要的 Capabilities (如 Push Notifications)

# 创建 Provisioning Profile
open https://developer.apple.com/account/resources/profiles/add

# 1. 选择类型: App Store 或 Ad Hoc
# 2. 选择 App ID
# 3. 选择证书
# 4. 下载 .mobileprovision 文件

# 转换为 Base64
base64 -i profile.mobileprovision -o profile-base64.txt
```

#### 4. 获取 Team ID

```bash
# 访问 Apple Developer Portal
open https://developer.apple.com/account

# Team ID 显示在页面顶部 (10位字符,如: A1B2C3D4E5)
```

### 选项 B: 使用云 Mac (推荐,如果没有 Mac)

#### 1. 租用云 Mac

**MacinCloud** (最便宜):
```
网址: https://www.macincloud.com
价格: $1/小时 或 $30/月
选择: Pay-as-you-go (按小时付费)
```

**AWS EC2 Mac** (如果有 AWS 账号):
```
网址: https://aws.amazon.com/ec2/instance-types/mac/
价格: ~$1/小时
实例类型: mac2.metal
```

#### 2. 在云 Mac 上操作

```bash
# SSH 或 VNC 连接到云 Mac
# 按照上面 "选项 A" 的步骤操作
# 完成后下载生成的 Base64 文件
```

---

## 🔐 第二部分: 配置 GitHub Secrets

### 1. 准备 4 个值

您应该有以下文件/信息:
- `certificate-base64.txt` - 证书的 Base64 内容
- `profile-base64.txt` - Provisioning Profile 的 Base64 内容
- 证书密码 (导出 P12 时设置的密码)
- Team ID (10位字符)

### 2. 添加到 GitHub Secrets

```bash
# 1. 访问您的 GitHub 仓库
# 2. Settings → Secrets and variables → Actions
# 3. 点击 "New repository secret"
```

需要添加的 4 个 Secrets:

| Secret 名称 | 值 | 示例 |
|------------|-----|------|
| `APPLE_CERTIFICATE_BASE64` | `certificate-base64.txt` 的完整内容 | MIIKqgIBAzCCCm4GCSqGSIb3... |
| `APPLE_CERTIFICATE_PASSWORD` | 证书密码 | MyPassword123 |
| `APPLE_PROVISIONING_PROFILE_BASE64` | `profile-base64.txt` 的完整内容 | MIIOZAYJKoZIhvcNAQcCoIIO... |
| `APPLE_TEAM_ID` | 您的 Team ID | A1B2C3D4E5 |

**⚠️ 重要**: Base64 内容应该是**一行**,没有换行符。如果有换行,请删除。

### 3. 验证 Secrets

```bash
# 在 Settings → Secrets and variables → Actions
# 您应该看到 4 个 Secrets:
# ✅ APPLE_CERTIFICATE_BASE64
# ✅ APPLE_CERTIFICATE_PASSWORD
# ✅ APPLE_PROVISIONING_PROFILE_BASE64
# ✅ APPLE_TEAM_ID
```

---

## 🚀 第三部分: 触发构建

### 方法 1: 推送代码触发

```bash
cd d:\projects\wdk

# 添加 GitHub remote (如果还没有)
git remote add origin https://github.com/YOUR_USERNAME/wdk.git

# 推送代码
git push -u origin master

# 每次推送到 master 分支都会自动构建
```

### 方法 2: 创建 Release Tag 触发

```bash
cd d:\projects\wdk

# 创建版本 tag
git tag v1.0.0

# 推送 tag
git push origin v1.0.0

# 这会触发 iOS 构建
```

### 方法 3: 手动触发

```bash
# 1. 访问 GitHub 仓库
# 2. Actions 标签
# 3. 选择 "Build iOS App"
# 4. 点击 "Run workflow"
# 5. 选择分支
# 6. 点击 "Run workflow"
```

---

## 📥 第四部分: 下载 IPA 文件

### 1. 查看构建状态

```bash
# 访问 GitHub Actions 页面
https://github.com/YOUR_USERNAME/wdk/actions

# 查看最新的 "Build iOS App" workflow
# 状态: 🟡 进行中 / ✅ 成功 / ❌ 失败
```

### 2. 下载 IPA

```bash
# 当构建成功后:
# 1. 点击构建任务
# 2. 滚动到底部 "Artifacts" 部分
# 3. 下载 "ios-app.ipa"
# 4. 解压 ZIP 文件获得 .ipa
```

### 3. 安装到设备

**方法 A: 使用 Apple Configurator (Mac)**
```bash
# 1. 安装 Apple Configurator 2
# 2. 连接 iOS 设备
# 3. 拖拽 .ipa 到设备
```

**方法 B: 使用 Xcode (Mac)**
```bash
# 1. 打开 Xcode
# 2. Window → Devices and Simulators
# 3. 选择设备
# 4. 点击 "+" 添加 .ipa
```

**方法 C: 使用 TestFlight (推荐)**
```bash
# 1. 使用 App Store Connect 上传 IPA
# 2. 创建 TestFlight 内部测试
# 3. 邀请测试者
# 4. 通过 TestFlight app 安装
```

**方法 D: 使用 Diawi (最简单)**
```bash
# 1. 访问 https://www.diawi.com
# 2. 上传 .ipa 文件
# 3. 生成下载链接
# 4. 在 iOS Safari 中打开链接安装
```

---

## 🔧 第五部分: 故障排除

### 常见问题

#### 问题 1: "Certificate not found"

```bash
# 原因: Base64 编码不正确或 Secret 未设置

# 解决方案:
# 1. 重新生成 Base64 (确保没有换行)
base64 -i certificate.p12 | tr -d '\n' > certificate-base64.txt

# 2. 重新添加 Secret
# 3. 确保复制完整内容 (包括 == 结尾)
```

#### 问题 2: "Provisioning profile doesn't match"

```bash
# 原因: Bundle ID 不匹配或 Profile 不包含设备

# 解决方案:
# 1. 检查 capacitor.config.ts 中的 appId
# 2. 确保 Profile 包含目标设备 UDID
# 3. 重新下载 Profile
```

#### 问题 3: "Code signing failed"

```bash
# 原因: 证书或 Profile 过期

# 解决方案:
# 1. 在 Apple Developer Portal 检查证书状态
# 2. 重新创建证书和 Profile
# 3. 更新 GitHub Secrets
```

#### 问题 4: 构建超时

```bash
# 原因: 依赖下载太慢或构建时间过长

# 解决方案:
# 1. 在 workflow 中增加 timeout-minutes
# 2. 检查网络问题
# 3. 重新触发构建
```

### 查看详细日志

```bash
# 1. 访问 Actions 页面
# 2. 点击失败的构建
# 3. 展开每个步骤查看日志
# 4. 搜索 "error" 或 "failed"
```

---

## 📊 第六部分: 构建配置

### 修改构建类型

编辑 `.github/workflows/ios-build.yml`:

```yaml
# Debug 构建 (开发测试)
- name: Build iOS App
  run: |
    xcodebuild -workspace App.xcworkspace \
      -scheme App \
      -configuration Debug \
      -archivePath $PWD/build/App.xcarchive \
      archive

# Release 构建 (生产发布)
- name: Build iOS App
  run: |
    xcodebuild -workspace App.xcworkspace \
      -scheme App \
      -configuration Release \
      -archivePath $PWD/build/App.xcarchive \
      archive
```

### 修改分发方式

```yaml
# Ad Hoc (内部测试)
method: ad-hoc

# App Store (提交审核)
method: app-store

# Development (开发测试)
method: development

# Enterprise (企业分发)
method: enterprise
```

### 自定义触发条件

```yaml
# 仅在 tag 推送时构建
on:
  push:
    tags:
      - 'v*'

# 仅在 master 分支推送时构建
on:
  push:
    branches:
      - master

# 每天定时构建
on:
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 0:00

# 手动触发
on:
  workflow_dispatch:
```

---

## 🎯 第七部分: 高级技巧

### 1. 自动增加版本号

```yaml
- name: Increment Build Number
  run: |
    cd ios/App
    BUILD_NUMBER=$(($(date +%s)))
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" App/Info.plist
```

### 2. 发送构建通知

```yaml
- name: Send Notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 3. 上传到 TestFlight

```yaml
- name: Upload to TestFlight
  run: |
    xcrun altool --upload-app \
      -f build/App.ipa \
      -t ios \
      -u "${{ secrets.APPLE_ID }}" \
      -p "${{ secrets.APP_SPECIFIC_PASSWORD }}"
```

### 4. 缓存依赖

```yaml
- name: Cache CocoaPods
  uses: actions/cache@v3
  with:
    path: ios/App/Pods
    key: ${{ runner.os }}-pods-${{ hashFiles('ios/App/Podfile.lock') }}
```

---

## 📚 参考资料

- **GitHub Actions 文档**: https://docs.github.com/en/actions
- **Xcode 命令行工具**: https://developer.apple.com/xcode/
- **Capacitor iOS**: https://capacitorjs.com/docs/ios
- **Apple Developer**: https://developer.apple.com/

---

## ✅ 检查清单

在开始构建前,确保:

- [ ] 有 Apple Developer 账号
- [ ] 创建了签名证书
- [ ] 创建了 Provisioning Profile
- [ ] 获取了 Team ID
- [ ] 所有文件转换为 Base64
- [ ] 添加了 4 个 GitHub Secrets
- [ ] 推送了代码到 GitHub
- [ ] 检查了 Actions 权限 (Settings → Actions → Allow all actions)

---

## 🎉 完成!

现在您可以:
1. 推送代码自动触发构建
2. 10-15 分钟后下载 IPA
3. 安装到设备测试
4. 未来的构建完全免费!

**祝您构建成功! 🚀**
