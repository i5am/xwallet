# 🚀 Ionic Appflow iOS 构建快速指南

## ✅ 当前状态

- ✅ Ionic CLI 已安装
- ✅ 已登录 Ionic Appflow (shengq@gmail.com)
- ✅ 项目已初始化 (`ionic.config.json`)
- ⚠️ 需要 GitHub 仓库才能连接

---

## 📋 完整步骤

### 第一步: 创建 GitHub 仓库 (5分钟)

#### 选项 A: 在 GitHub 网站上创建

1. 访问: https://github.com/new
2. 仓库名: `tether-wdk-wallet` (或任意名称)
3. 可见性: Public (推荐,免费) 或 Private
4. **不要**勾选 "Initialize with README"
5. 点击 "Create repository"

#### 选项 B: 使用 GitHub CLI

```bash
# 如果已安装 gh CLI
gh repo create tether-wdk-wallet --public
```

### 第二步: 推送代码到 GitHub (5分钟)

```bash
cd d:\projects\wdk

# 如果还没有 git remote
git remote add origin https://github.com/YOUR_USERNAME/tether-wdk-wallet.git

# 推送代码
git push -u origin master
```

### 第三步: 连接到 Ionic Appflow (5分钟)

```bash
# 再次运行 link 命令
ionic link

# 选择:
# - Create a new app on Ionic Appflow
# - App name: xwallet (或任意名称)
# - Git host: GitHub
# - Repository exists? Yes
# - 输入仓库地址: https://github.com/YOUR_USERNAME/tether-wdk-wallet
```

### 第四步: 配置构建 (10分钟)

#### 方法 1: 通过 CLI (推荐)

```bash
# 开始 iOS 构建
ionic package build ios --type=development

# 选项:
# - Build type: development (测试) 或 release (发布)
# - Security profile: 选择您的证书配置
```

#### 方法 2: 通过 Web 界面

1. 访问: https://dashboard.ionicframework.com
2. 选择您的应用 (xwallet)
3. 点击 "Builds" → "New Build"
4. 配置:
   - **Platform**: iOS
   - **Target**: iOS Device
   - **Build Type**: Development 或 Release
   - **Security Profile**: 需要先配置
5. 点击 "Build"

---

## 🔐 配置签名证书

Ionic Appflow 需要您的 Apple 签名证书才能构建 iOS 应用。

### 选项 A: 自动配置 (最简单) ⭐

**要求**: 需要 Mac 电脑

```bash
# 在 Mac 上运行
npm install -g @ionic/cli

# 登录
ionic login

# 自动配置证书
ionic package build ios --signing-certificate=auto
```

Appflow 会自动:
1. 检测您的证书
2. 创建 Provisioning Profile
3. 上传到云端
4. 开始构建

### 选项 B: 手动上传证书

1. 访问 Appflow Dashboard
2. Project Settings → Certificates
3. 上传:
   - **Certificate** (.p12 文件)
   - **Password** (证书密码)
   - **Provisioning Profile** (.mobileprovision 文件)

**如何获取这些文件?** 参考: `docs/GITHUB-ACTIONS-IOS-GUIDE.md` 的证书准备部分

---

## 💰 定价说明

### 免费层 (Starter)
- ✅ 500 构建分钟/月
- ✅ 1 个并发构建
- ✅ 基础功能

**适合**: 个人开发者,小项目

### Growth 计划 ($49/月)
- ✅ 2500 构建分钟/月
- ✅ 2 个并发构建
- ✅ Live Updates (热更新)
- ✅ 优先支持

**适合**: 小团队,频繁构建

### Scale 计划 ($199/月)
- ✅ 10000 构建分钟/月
- ✅ 5 个并发构建
- ✅ 所有功能
- ✅ 专属支持

**适合**: 企业,多项目

**构建时间估算**: 
- iOS 构建约 10-15 分钟
- 500 分钟 ≈ 33-50 次构建

---

## 🔄 构建流程

### 触发构建

```bash
# 方法 1: CLI 命令
ionic package build ios --type=development

# 方法 2: Git 推送 (配置自动构建后)
git push origin master

# 方法 3: Web 界面手动触发
# https://dashboard.ionicframework.com/apps
```

### 查看构建状态

```bash
# CLI 查看
ionic package list

# 或访问 Dashboard
# https://dashboard.ionicframework.com/apps/YOUR_APP_ID/builds
```

### 下载 IPA

```bash
# CLI 下载 (构建完成后)
ionic package download <BUILD_ID>

# 或在 Dashboard 中点击 Download 按钮
```

---

## 📱 安装到设备

### 方法 1: 使用 Ionic Appflow 分发

Appflow 提供内置的测试分发功能:

1. Dashboard → Destinations
2. 创建测试组
3. 邀请测试者 (通过邮箱)
4. 测试者通过邮件链接安装

**优势**: 无需手动分发 IPA

### 方法 2: 手动安装

下载 IPA 后,使用:
- **Xcode**: Window → Devices and Simulators
- **Apple Configurator 2**: 拖拽安装
- **Diawi**: https://www.diawi.com (上传并生成安装链接)

---

## ⚡ 快速开始 (完整流程)

### 🎯 5 分钟快速配置

```bash
# 1. 创建 GitHub 仓库
gh repo create tether-wdk-wallet --public

# 2. 推送代码
git remote add origin https://github.com/YOUR_USERNAME/tether-wdk-wallet.git
git push -u origin master

# 3. 连接 Appflow
ionic link
# 选择: Create new app → GitHub → 输入仓库地址

# 4. 开始构建 (如果有证书)
ionic package build ios --type=development

# 5. 等待构建 (10-15分钟)
ionic package list

# 6. 下载 IPA
ionic package download <BUILD_ID>
```

---

## 🆚 Appflow vs GitHub Actions

| 特性 | Ionic Appflow | GitHub Actions |
|------|---------------|----------------|
| **成本** | $49/月 | 免费 |
| **配置难度** | ⭐ (简单) | ⭐⭐⭐ (中等) |
| **构建时间** | 5-10分钟 | 10-15分钟 |
| **证书配置** | 可自动 | 需手动 |
| **Live Updates** | ✅ | ❌ |
| **测试分发** | ✅ 内置 | ❌ 需额外服务 |
| **Capacitor 支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **适合人群** | 不想配置证书 | 想要免费方案 |

---

## 💡 我的建议

### 如果您...

✅ **不想配置证书** → 用 Appflow (有自动配置)  
✅ **有预算 ($49/月)** → 用 Appflow  
✅ **需要 Live Updates** → 用 Appflow  
✅ **想要免费** → 用 GitHub Actions  
✅ **有 Mac 电脑** → Appflow 配置更简单  
✅ **没有 Mac** → GitHub Actions 更合适 (一次性配置)

---

## 🔧 当前需要做的

由于 Appflow 需要 GitHub 仓库,您有两个选择:

### 选择 1: 继续使用 Appflow (推荐)

**步骤**:
1. 创建 GitHub 仓库 (5分钟)
2. 推送代码 (2分钟)
3. 运行 `ionic link` (3分钟)
4. 配置证书 (如果有 Mac: 5分钟; 没有 Mac: 需要准备)
5. 开始构建 (10-15分钟)

**总时间**: 约 30 分钟 (如果有证书准备好)

### 选择 2: 改用 GitHub Actions (免费)

**步骤**:
1. 创建 GitHub 仓库 (5分钟)
2. 推送代码 (2分钟)
3. 配置 4 个 Secrets (10分钟)
4. 推送触发构建 (10-15分钟)

**总时间**: 约 30 分钟
**成本**: $1-5 (一次性,准备证书)
**未来**: 完全免费

---

## 📞 下一步

告诉我:

**A)** 继续 Appflow (我会帮您创建 GitHub 仓库)  
**B)** 改用 GitHub Actions (免费,但需要配置证书)  
**C)** 先不构建,稍后再决定

选择后,我会提供详细的操作步骤! 🚀

---

## 📚 参考资料

- Ionic Appflow 文档: https://ionic.io/docs/appflow
- 定价: https://ionic.io/pricing
- Dashboard: https://dashboard.ionicframework.com
- GitHub Actions 指南: `docs/GITHUB-ACTIONS-IOS-GUIDE.md`
