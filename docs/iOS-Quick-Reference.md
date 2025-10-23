# 🍎 iOS 云构建 - 快速参考

## 两种方案对比

| | GitHub Actions | Expo EAS Build |
|---|---|---|
| **难度** | ⭐⭐⭐ 中等 | ⭐ 极简单 |
| **费用** | 免费 | 30次/月免费 |
| **配置时间** | 30-60 分钟 | 5-10 分钟 |
| **证书管理** | 手动 | 自动 |
| **推荐场景** | 开源/企业项目 | 快速原型/个人 |

---

## 🚀 方案 A: GitHub Actions (免费)

### 快速开始

```powershell
# 1. 运行配置脚本
.\scripts\setup-github-actions-ios.ps1

# 2. 配置 GitHub Secrets (见下方)

# 3. 推送代码
git add .
git commit -m "Configure iOS build"
git push
```

### 必需的 GitHub Secrets

在 GitHub 仓库的 `Settings → Secrets and variables → Actions` 添加:

1. **IOS_CERTIFICATE_BASE64**
   - P12 证书的 Base64 编码
   - 获取: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('cert.p12'))`

2. **IOS_CERTIFICATE_PASSWORD**
   - P12 证书密码

3. **IOS_PROVISIONING_PROFILE_BASE64**
   - Provisioning Profile 的 Base64
   - 获取: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('profile.mobileprovision'))`

4. **KEYCHAIN_PASSWORD**
   - 临时密码,随意设置 (如: `temp1234`)

### 获取证书和 Profile

**在 Apple Developer Portal**:
1. [Certificates](https://developer.apple.com/account/resources/certificates/list) - 创建 iOS Distribution 证书
2. [Identifiers](https://developer.apple.com/account/resources/identifiers/list) - 创建 App ID
3. [Profiles](https://developer.apple.com/account/resources/profiles/list) - 创建 Provisioning Profile

### 构建流程

1. Push 代码到 GitHub
2. 自动触发 GitHub Actions
3. 10-15 分钟后构建完成
4. 下载 IPA: `Actions → 工作流 → Artifacts → WDK-Wallet-iOS`

---

## 🎯 方案 B: Expo EAS Build (最简单)

### 快速开始

```powershell
# 1. 运行配置脚本
.\scripts\setup-eas-build-ios.ps1

# 脚本会引导你完成:
# - 安装 EAS CLI
# - 登录 Expo 账号
# - 配置 Apple 凭证
# - 开始构建
```

### 手动命令

```bash
# 安装 CLI
npm install -g eas-cli

# 登录
eas login

# 配置凭证 (自动管理证书)
eas credentials

# 构建 (推荐 preview 用于测试)
eas build --platform ios --profile preview

# 查看构建列表
eas build:list

# 下载 IPA
eas build:download --id [BUILD_ID]

# 提交到 App Store
eas submit --platform ios
```

### 构建 Profile

- **development**: 模拟器版本
- **preview**: 真机测试版 (扫码安装)
- **production**: App Store 发布版

### 费用

- 免费: 30 次构建/月
- Pro: $29/月 - 无限构建
- [定价详情](https://expo.dev/pricing)

---

## 📱 安装 IPA 到设备

### 方法 1: EAS Preview (最简单)

使用 `preview` profile 构建,完成后:
1. 用 iPhone 扫描 EAS 提供的二维码
2. 点击安装

### 方法 2: Apple Configurator (Mac)

1. 下载 [Apple Configurator](https://apps.apple.com/app/apple-configurator/id1037126344)
2. 连接 iPhone
3. 拖拽 IPA 到设备

### 方法 3: Xcode (Mac)

```bash
xcrun devicectl device install app --device <DEVICE_ID> app.ipa
```

### 方法 4: TestFlight

使用 `production` profile 构建,然后:
```bash
eas submit --platform ios
```

---

## 🛠️ 常见问题

### Q: 我没有 Mac,能构建 iOS 应用吗?
**A**: 可以!两种方案都不需要 Mac:
- GitHub Actions 使用云端 macOS runner
- EAS Build 在 Expo 的云服务器构建

### Q: 需要 Apple Developer 账号吗?
**A**: 是的,需要付费账号 ($99/年) 才能:
- 创建 Provisioning Profile
- 在真机上测试
- 提交到 App Store

### Q: 哪个方案更好?
**A**: 
- **快速原型/个人项目** → EAS Build (超级简单)
- **开源/企业项目** → GitHub Actions (完全免费)
- **不确定** → 先试 EAS Build (5分钟搞定)

### Q: 构建失败了怎么办?
**A**: 
1. 检查构建日志
2. 常见原因:
   - 证书过期
   - Bundle ID 配置错误
   - Provisioning Profile 不包含测试设备
3. 参考: `docs/iOS-Cloud-Build-Guide.md`

### Q: 能同时使用两种方案吗?
**A**: 可以!它们不冲突,可以互为备份。

---

## 📚 更多资源

- 📖 [完整指南](docs/iOS-Cloud-Build-Guide.md)
- 🛠️ [GitHub Actions 配置脚本](scripts/setup-github-actions-ios.ps1)
- 🚀 [EAS Build 配置脚本](scripts/setup-eas-build-ios.ps1)
- 🍎 [Apple Developer Portal](https://developer.apple.com/account)
- 📱 [Expo 文档](https://docs.expo.dev/build/introduction/)
- 🔧 [GitHub Actions 文档](https://docs.github.com/actions)

---

## 🎉 下一步

1. **选择方案** - EAS (快) 或 GitHub Actions (免费)
2. **运行配置脚本** - 自动化配置流程
3. **开始构建** - Push 代码或运行命令
4. **测试应用** - 安装到设备测试
5. **发布** - 提交到 TestFlight/App Store

祝构建顺利! 🚀
