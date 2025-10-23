# iOS 云构建故障排除指南

## 当前问题

错误信息: `scheme 'App' does not exist, make sure it's marked as shared`

## 已尝试的解决方案

1. ✅ 创建了 `xcshareddata/xcschemes/App.xcscheme` 文件
2. ✅ 使用正确的目标 UUID (`504EC3031FED79650016851F`)
3. ✅ 运行了 `eas build:configure`
4. ✅ 提交了 scheme 文件到 git

## 问题原因分析

这是 **Capacitor + EAS Build 的已知兼容性问题**:
- EAS Build 主要是为 Expo 项目设计的
- Capacitor 项目使用原生 Xcode 项目结构
- EAS 可能无法正确识别 Capacitor 的 scheme 配置

## 解决方案

### 🎯 推荐方案 1: 使用 GitHub Actions (更适合 Capacitor)

GitHub Actions 提供 macOS runner,更适合构建 Capacitor iOS 项目。

**优势**:
- ✅ 完全兼容 Capacitor
- ✅ 可以使用 `xcodebuild` 命令
- ✅ 公开仓库免费
- ✅ 更灵活的配置

**配置文件**: 已创建 `.github/workflows/ios-build.yml`

**使用步骤**:
```bash
# 1. 推送代码到 GitHub
git push origin master

# 2. 在 GitHub 仓库设置中添加 Secrets:
# - APPLE_CERTIFICATE_BASE64
# - APPLE_CERTIFICATE_PASSWORD
# - APPLE_PROVISIONING_PROFILE_BASE64
# - APPLE_TEAM_ID

# 3. 触发构建
git tag v1.0.0
git push origin v1.0.0
```

### 🔧 推荐方案 2: 本地 Mac 构建 (最可靠)

如果您有 Mac 电脑或可以访问 Mac:

```bash
# 在 Mac 上
cd your-project
npx cap sync ios
npx cap open ios

# 在 Xcode 中:
# 1. Product → Archive
# 2. Distribute App
# 3. 选择分发方式
```

### ⚡ 推荐方案 3: Ionic Appflow (专为 Capacitor 设计)

Ionic Appflow 是 Capacitor 的官方云构建服务:

- 官网: https://ionic.io/appflow
- 价格: 免费层 + 付费计划
- 优势: 完美支持 Capacitor

```bash
# 安装 Appflow CLI
npm install -g @ionic/cli

# 连接项目
ionic link

# 开始构建
ionic build ios
```

### 🛠️ 推荐方案 4: 在 Mac 虚拟机/云服务上构建

云 Mac 服务:
- **MacStadium**: https://www.macstadium.com/
- **MacinCloud**: https://www.macincloud.com/
- **AWS EC2 Mac**: https://aws.amazon.com/ec2/instance-types/mac/

## EAS Build 的局限性

EAS Build 对于 Capacitor 项目的支持有限,因为:

1. **Scheme 检测问题**: EAS 期望 Expo 风格的配置
2. **原生依赖**: Capacitor 使用 CocoaPods,EAS 可能处理不当
3. **构建脚本**: Capacitor 的构建流程与 Expo 不同

## 下一步建议

**对于您的项目,我强烈推荐使用 GitHub Actions**,因为:

1. ✅ 已经创建了配置文件
2. ✅ 免费且可靠
3. ✅ 完全支持 Capacitor
4. ✅ 可以完全控制构建过程
5. ✅ 构建产物可以直接下载

**需要配置的内容**:
1. Apple Developer 账号
2. 签名证书 (Certificate)
3. Provisioning Profile
4. 将这些添加到 GitHub Secrets

## 参考资料

- Capacitor iOS 文档: https://capacitorjs.com/docs/ios
- GitHub Actions macOS: https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources
- Ionic Appflow: https://ionic.io/docs/appflow
