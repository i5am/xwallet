# 📱 iOS 应用构建指南

## 🎯 快速开始

您要打包 iOS 应用,但遇到了 **EAS Build 不支持 Capacitor 项目**的问题。

本文档提供了 **4 种可行的解决方案**。

---

## 📚 文档导航

### 🌟 新手必读
1. **[iOS-CLOUD-BUILD-SUMMARY.md](../iOS-CLOUD-BUILD-SUMMARY.md)** - 开始这里!
   - 问题说明
   - 4 种方案对比
   - 推荐方案选择

2. **[iOS-BUILD-QUICK-REFERENCE.txt](../iOS-BUILD-QUICK-REFERENCE.txt)** - 快速参考卡
   - 一页纸快速查看
   - 方案对比表
   - 成本分析

### 📖 详细指南

3. **[GITHUB-ACTIONS-IOS-GUIDE.md](./GITHUB-ACTIONS-IOS-GUIDE.md)** - GitHub Actions 完整指南 ⭐ 推荐
   - 步骤1: 准备签名证书
   - 步骤2: 配置 GitHub Secrets
   - 步骤3: 触发构建
   - 步骤4: 下载 IPA
   - 完整故障排除

4. **[iOS-BUILD-TROUBLESHOOTING.md](./iOS-BUILD-TROUBLESHOOTING.md)** - 故障排除
   - EAS Build 问题分析
   - 其他方案详解
   - 常见错误解决

### 🔧 配置文件

5. **[../.github/workflows/ios-build.yml](../.github/workflows/ios-build.yml)** - GitHub Actions 配置
   - 自动化构建脚本
   - 可自定义配置

6. **[../eas.json](../eas.json)** - EAS Build 配置
   - EAS 配置 (虽然不工作,但已配置)

7. **[../app.json](../app.json)** - 应用配置
   - Bundle Identifier
   - 版本信息
   - 权限配置

---

## 🚀 推荐方案

### ⭐ 方案 A: GitHub Actions (最推荐)

**为什么选它?**
- ✅ 完全免费 (公开仓库)
- ✅ 完美支持 Capacitor
- ✅ 自动化程度高
- ✅ 一次配置,永久使用

**需要什么?**
- GitHub 账号 (免费)
- Apple Developer 账号 ($99/年)
- 临时访问 Mac 准备证书 (或租云 Mac 1小时, ~$1-5)

**多久能用?**
- 首次配置: 30-60 分钟
- 以后每次构建: 10-15 分钟 (全自动)

**详细指南**: [GITHUB-ACTIONS-IOS-GUIDE.md](./GITHUB-ACTIONS-IOS-GUIDE.md)

---

### 🎁 方案 B: Ionic Appflow (最简单)

**为什么选它?**
- ✅ 零配置,开箱即用
- ✅ 专为 Capacitor 设计
- ✅ 自动处理签名
- ✅ 5-10 分钟完成构建

**需要什么?**
- Ionic Appflow 账号
- Apple Developer 账号

**费用是多少?**
- 免费层: 500 分钟/月
- Starter: $49/月 (无限构建)

**快速开始**:
```bash
npm install -g @ionic/cli
ionic login
ionic link
ionic package build ios
```

**官网**: https://ionic.io/appflow

---

### 💻 方案 C: 本地 Mac 构建 (最可靠)

**为什么选它?**
- ✅ 最快 (5 分钟)
- ✅ 最可靠
- ✅ 完全控制
- ✅ 可以调试

**需要什么?**
- Mac 电脑
- Xcode (免费)
- Apple Developer 账号

**费用是多少?**
- Mac 硬件成本
- 其他免费

**快速开始**:
```bash
npx cap sync ios
npx cap open ios
# 在 Xcode 中: Product → Archive
```

---

### ☁️ 方案 D: 云 Mac 服务 (临时使用)

**为什么选它?**
- ✅ 不需要拥有 Mac
- ✅ 按需付费
- ✅ 完整的 Mac 环境

**推荐服务**:
- **MacinCloud**: $1/小时 或 $30/月
- **AWS EC2 Mac**: ~$1/小时
- **MacStadium**: ~$100/月

**适合人群**:
- 偶尔需要构建 iOS 应用
- 不想购买 Mac
- 需要临时测试

---

## 📊 方案对比

| 方案 | 成本 | 时间 | 难度 | Capacitor 支持 | 推荐度 |
|------|------|------|------|----------------|--------|
| GitHub Actions | 免费 | 10-15分钟 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Ionic Appflow | $49/月 | 5-10分钟 | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 本地 Mac | 硬件 | 5分钟 | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 云 Mac | $30-100/月 | 5-10分钟 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 💡 我该选哪个?

### 如果您...

✓ **想要免费** → **GitHub Actions** ⭐⭐⭐⭐⭐  
✓ **想要简单** → **Ionic Appflow** ⭐⭐⭐⭐  
✓ **有 Mac** → **本地构建** ⭐⭐⭐⭐⭐  
✓ **偶尔使用** → **云 Mac** ⭐⭐⭐  
✓ **预算有限** → **GitHub Actions** ⭐⭐⭐⭐⭐  
✓ **时间紧迫** → **Ionic Appflow** ⭐⭐⭐⭐  

---

## 🔥 最佳实践建议

### 推荐配置: GitHub Actions

**为什么?**
1. **完全免费** - 公开仓库无限构建
2. **一次配置** - 设置好 Secrets 后就不用管了
3. **自动化** - 推送代码自动构建
4. **可靠** - GitHub 提供的 macOS runner
5. **灵活** - 可以自定义构建流程

**成本分析**:
- 首次配置: 租云 Mac 1小时 ≈ $1-5 (准备证书)
- 以后构建: $0 (完全免费!)

**时间投入**:
- 首次配置: 30-60 分钟
- 以后构建: 0 分钟 (全自动)

---

## 📞 需要帮助?

### 快速链接

- 📖 [GitHub Actions 完整指南](./GITHUB-ACTIONS-IOS-GUIDE.md)
- 🔧 [故障排除文档](./iOS-BUILD-TROUBLESHOOTING.md)
- 📋 [快速参考卡](../iOS-BUILD-QUICK-REFERENCE.txt)
- 📱 [云构建总结](../iOS-CLOUD-BUILD-SUMMARY.md)

### 常见问题

**Q: 我没有 Mac,能构建 iOS 吗?**  
A: 可以! 使用 GitHub Actions 或租用云 Mac 1小时准备证书。

**Q: GitHub Actions 真的免费吗?**  
A: 是的,公开仓库完全免费,私有仓库每月 2000 分钟免费。

**Q: 我需要 Apple Developer 账号吗?**  
A: 是的,所有方案都需要 ($99/年)。

**Q: 证书配置很复杂吗?**  
A: 不复杂,按照 [GITHUB-ACTIONS-IOS-GUIDE.md](./GITHUB-ACTIONS-IOS-GUIDE.md) 一步步来即可。

**Q: 能自动发布到 App Store 吗?**  
A: 可以! GitHub Actions 可以配置自动上传到 TestFlight。

---

## ✅ 行动计划

### 第1步: 选择方案 (5分钟)
- 阅读本文档
- 查看方案对比表
- 根据需求选择

### 第2步: 阅读详细指南 (10分钟)
- GitHub Actions → [GITHUB-ACTIONS-IOS-GUIDE.md](./GITHUB-ACTIONS-IOS-GUIDE.md)
- Ionic Appflow → https://ionic.io/docs/appflow
- 本地构建 → https://capacitorjs.com/docs/ios

### 第3步: 准备材料 (30分钟)
- Apple Developer 账号
- 签名证书 (如需要)
- Provisioning Profile (如需要)

### 第4步: 执行配置 (30-60分钟)
- 按照指南操作
- 配置 Secrets/账号
- 触发第一次构建

### 第5步: 享受自动化! 🎉
- 以后推送代码自动构建
- 10-15 分钟后下载 IPA
- 再也不用手动构建!

---

## 🎯 总结

**推荐方案**: **GitHub Actions**

**理由**:
- ✅ 免费且可靠
- ✅ 完美支持 Capacitor
- ✅ 一次配置永久使用
- ✅ 自动化程度最高

**下一步**: 阅读 [GITHUB-ACTIONS-IOS-GUIDE.md](./GITHUB-ACTIONS-IOS-GUIDE.md) 开始配置!

---

**祝您构建成功! 🚀**

*如有问题,请查看 [故障排除文档](./iOS-BUILD-TROUBLESHOOTING.md)*
