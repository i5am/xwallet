# 🎉 iOS 云构建配置完成!

## ✅ 已完成的配置

您的项目现在已经完全配置好 iOS 云构建功能!

### 📁 创建的文件

```
wdk/
├── .github/workflows/
│   └── build-ios.yml              # GitHub Actions 工作流
├── ios/
│   └── App/
│       └── exportOptions.plist     # Xcode 导出配置
├── eas.json                        # Expo EAS Build 配置
├── docs/
│   ├── iOS-Cloud-Build-Guide.md   # 完整指南 (详细)
│   └── iOS-Quick-Reference.md     # 快速参考 (简明)
└── scripts/
    ├── setup-github-actions-ios.ps1  # GitHub Actions 配置助手
    └── setup-eas-build-ios.ps1       # EAS Build 配置助手
```

### 🆕 新增的 npm 脚本

```bash
# iOS 构建和同步
npm run ios:build          # 构建并同步到 iOS
npm run ios:open           # 在 Xcode 中打开 (需要 Mac)
npm run ios:sync           # 同步更改到 iOS

# 配置助手 (交互式)
npm run ios:setup-github   # GitHub Actions 配置向导
npm run ios:setup-eas      # EAS Build 配置向导

# EAS Build 快捷命令
npm run eas:build:preview      # 构建预览版 (推荐测试)
npm run eas:build:production   # 构建生产版 (提交 App Store)
```

---

## 🚀 开始使用

### 方式 1: Expo EAS Build (推荐新手)

**最简单!5 分钟搞定!**

```powershell
# 运行交互式配置向导
npm run ios:setup-eas

# 或手动执行
npm install -g eas-cli
eas login
eas credentials
eas build --platform ios --profile preview
```

**优点**:
- ✅ 超级简单,零配置
- ✅ 自动处理证书
- ✅ 扫码安装
- 💰 免费 30 次/月

**缺点**:
- 💰 超出免费额度后需付费 ($29/月)

---

### 方式 2: GitHub Actions (推荐开源项目)

**完全免费!自动化构建!**

```powershell
# 1. 运行交互式配置向导
npm run ios:setup-github

# 2. 按提示配置:
#    - Bundle ID
#    - Team ID
#    - Provisioning Profile 名称

# 3. 在 GitHub 上配置 Secrets (向导会提示)

# 4. 推送代码,自动构建!
git add .
git commit -m "Configure iOS cloud build"
git push
```

**优点**:
- ✅ 完全免费 (公开仓库)
- ✅ 自动化 CI/CD
- ✅ Push 即构建

**缺点**:
- ⏰ 配置稍复杂 (30-60 分钟)
- 🔐 需要手动管理证书

---

## 📚 详细文档

### 🎯 快速参考 (5分钟阅读)

```bash
# 查看快速参考卡片
code docs/iOS-Quick-Reference.md
```

包含:
- 两种方案对比表
- 快速开始命令
- 常见问题解答
- 一句话总结

### 📖 完整指南 (详细教程)

```bash
# 查看完整指南
code docs/iOS-Cloud-Build-Guide.md
```

包含:
- 详细配置步骤 (带截图说明)
- 证书创建流程
- GitHub Secrets 配置
- 故障排除
- 最佳实践

---

## 🎯 推荐选择

### 🆕 如果你是新手
→ **使用 EAS Build**
```bash
npm run ios:setup-eas
```
5 分钟即可完成首次构建!

### 💼 如果是企业/开源项目
→ **使用 GitHub Actions**
```bash
npm run ios:setup-github
```
一次配置,永久免费!

### 🤔 还不确定?
→ **先试 EAS Build**

两种方案可以同时配置,互不冲突!

---

## 📱 构建后的安装方式

### EAS Preview Build (最简单)
1. 构建完成后会显示 URL
2. 用 iPhone 扫描二维码
3. 点击安装 → 完成!

### GitHub Actions Build
1. 进入 Actions 页面
2. 下载 IPA artifact
3. 使用以下任一方式安装:
   - Apple Configurator (Mac)
   - Xcode (Mac)
   - TestFlight

---

## ⚠️ 前置要求

### 必需
- ✅ **Apple Developer 账号** ($99/年)
  - 注册: https://developer.apple.com/programs/

### 可选 (根据方案)
- GitHub 账号 (GitHub Actions 方案)
- Expo 账号 (EAS Build 方案,免费)

---

## 🆘 需要帮助?

### 查看文档
```bash
# 快速参考
code docs/iOS-Quick-Reference.md

# 完整指南
code docs/iOS-Cloud-Build-Guide.md
```

### 运行配置助手
```bash
# EAS Build 向导
npm run ios:setup-eas

# GitHub Actions 向导
npm run ios:setup-github
```

### 常见问题

**Q: 我没有 Mac,能构建吗?**
A: 可以!两种方案都在云端构建,不需要 Mac。

**Q: 哪个方案更好?**
A: 
- 快速原型 → EAS Build
- 长期项目 → GitHub Actions
- 不确定 → 先试 EAS

**Q: 需要什么证书?**
A: 
- EAS: 自动处理,无需操心
- GitHub: 需要 P12 证书和 Provisioning Profile

---

## 🎉 下一步

1. **选择方案**: EAS (快) 或 GitHub Actions (免费)
2. **运行配置脚本**: `npm run ios:setup-eas` 或 `npm run ios:setup-github`
3. **开始构建**: 按脚本提示操作
4. **安装测试**: 扫码或下载 IPA
5. **发布**: 提交到 TestFlight / App Store

---

## 📊 成本对比

| 方案 | 初始成本 | 月度成本 | 年度总成本 |
|-----|---------|---------|----------|
| **EAS Free** | $0 | $0 | $0 (30次/月) |
| **EAS Pro** | $0 | $29 | $348 |
| **GitHub Actions** | $0 | $0 | $0 (公开仓库) |
| **Apple Developer** | $99 | $0 | $99 (必需) |

💡 最经济组合: **GitHub Actions + Apple Developer = $99/年**

---

## 🌟 关键文件说明

### `.github/workflows/build-ios.yml`
GitHub Actions 工作流配置,定义了自动构建流程。

### `eas.json`
Expo EAS Build 配置,包含 development、preview、production 三个 profile。

### `ios/App/exportOptions.plist`
Xcode 导出配置,指定签名方式和 Provisioning Profile。

### `scripts/setup-*.ps1`
交互式配置向导,帮助你快速完成配置。

---

## ✨ 特别提示

1. **证书有效期**: Apple 证书通常 1 年有效,记得续期!
2. **构建时间**: 首次构建可能需要 15-20 分钟,后续会更快
3. **免费额度**: EAS 每月 30 次,超出后可考虑 GitHub Actions
4. **备份证书**: 妥善保管 P12 证书和密码!

---

## 🎊 恭喜!

您的 iOS 云构建环境已配置完成!

现在可以:
- ✅ 在任何地方构建 iOS 应用 (无需 Mac)
- ✅ 自动化发布流程
- ✅ 快速迭代和测试
- ✅ 分发给测试用户

祝构建顺利! 🚀

有问题随时查看文档或运行配置助手!
