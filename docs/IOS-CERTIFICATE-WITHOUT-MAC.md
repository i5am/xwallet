# 🔐 iOS 签名证书申请指南 (无 Mac 版本)

## 📋 概述

您需要两个文件才能在 Appflow 中构建 iOS Device 版本:
1. **证书文件** (.p12) - App development / Store certificate
2. **Provisioning Profile** (.mobileprovision) - 配置描述文件

**⚠️ 问题**: 这些文件通常需要在 Mac 上生成。

**✅ 解决方案**: 使用云 Mac 服务,按小时付费,一次性完成所有配置。

---

## 💰 推荐方案: 租用云 Mac (最便宜 ~$1)

### 🌟 推荐服务: MacinCloud

**为什么选择 MacinCloud?**
- ✅ 最便宜: $1/小时 起
- ✅ 按需付费: 用多少付多少
- ✅ 即时访问: 注册后立即可用
- ✅ 完整环境: Xcode 已预装

---

## 🚀 完整操作步骤

### 第一步: 注册 MacinCloud (5分钟)

1. **访问官网**
   ```
   https://www.macincloud.com
   ```

2. **注册账号**
   - 点击 "Sign Up"
   - 填写邮箱和密码
   - 验证邮箱

3. **充值**
   - 最低充值: $5 (够用5小时)
   - 支持信用卡/PayPal
   - **建议充值 $5 即可** (生成证书只需1小时)

4. **选择套餐**
   - 选择 **"Pay As You Go"** (按小时付费)
   - 价格: $1.00/小时
   - 不选择月付套餐

5. **启动 Mac**
   - Dashboard → "Start Server"
   - 选择配置:
     * OS: macOS Sonoma (最新版)
     * Plan: Managed Server (推荐)
   - 等待 2-3 分钟启动

---

### 第二步: 连接到云 Mac (2分钟)

#### 方法 A: 浏览器访问 (推荐)

```
1. 点击 "Connect in Browser"
2. 会打开远程桌面界面
3. 您现在已经在使用 Mac 了!
```

#### 方法 B: VNC 客户端

```
1. 下载 VNC Viewer: https://www.realvnc.com/download/viewer/
2. MacinCloud 会显示 VNC 地址和密码
3. 使用 VNC Viewer 连接
```

---

### 第三步: 在云 Mac 上生成证书 (20-30分钟)

#### 1. 注册 Apple Developer 账号

**如果还没有 Apple Developer 账号**:

```
1. 访问: https://developer.apple.com/programs/enroll/
2. 使用您的 Apple ID 登录
3. 选择个人或组织类型
4. 支付 $99/年
5. 等待审核 (通常 24-48 小时)
```

**⚠️ 注意**: Apple Developer 账号是必需的,一年 $99。

#### 2. 生成证书签名请求 (CSR)

在云 Mac 上操作:

```bash
# 1. 打开 Keychain Access (钥匙串访问)
# Finder → Applications → Utilities → Keychain Access

# 2. 菜单栏: Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority

# 3. 填写信息:
# User Email: 您的邮箱
# Common Name: Your Name
# Request is: Saved to disk (保存到磁盘)
# Let me specify key pair information: ✓ 勾选

# 4. 点击 Continue

# 5. 保存位置: Desktop/CertificateSigningRequest.certSigningRequest

# 6. Key Size: 2048 bits
# Algorithm: RSA

# 7. 点击 Continue
```

现在您在桌面上有了 `CertificateSigningRequest.certSigningRequest` 文件。

#### 3. 在 Apple Developer Portal 创建证书

```bash
# 1. 在云 Mac 的浏览器中访问:
https://developer.apple.com/account/resources/certificates/add

# 2. 选择证书类型:
# - iOS App Development (开发测试用)
# - iOS Distribution (Ad Hoc / App Store 分发用) ⭐ 推荐选这个

# 3. 点击 Continue

# 4. 上传 CSR 文件:
# - 点击 "Choose File"
# - 选择桌面的 CertificateSigningRequest.certSigningRequest
# - 点击 Continue

# 5. 下载证书:
# - 点击 Download
# - 文件名如: ios_distribution.cer
# - 保存到桌面
```

#### 4. 安装证书并导出为 .p12

```bash
# 1. 双击下载的 .cer 文件
# - 会自动安装到 Keychain Access

# 2. 打开 Keychain Access
# - 左侧选择 "login" (登录)
# - 左下选择 "My Certificates" (我的证书)

# 3. 找到刚安装的证书
# - 名称类似: "Apple Distribution: Your Name (XXXXXXXXXX)"
# - 展开左侧箭头,会看到私钥

# 4. 右键点击证书 (不是私钥)
# - 选择 "Export..."

# 5. 保存为 .p12:
# - File name: ios_certificate.p12
# - 位置: Desktop
# - File Format: Personal Information Exchange (.p12)

# 6. 设置密码:
# - 输入密码 (请记住! 如: MyPassword123)
# - 确认密码

# 7. 可能需要输入 Mac 登录密码

# 8. 点击 Save
```

现在桌面上有了 `ios_certificate.p12` 文件!

#### 5. 创建 App ID

```bash
# 1. 访问:
https://developer.apple.com/account/resources/identifiers/add/bundleId

# 2. 选择类型:
# - App IDs
# - 点击 Continue

# 3. 选择平台:
# - iOS, tvOS, watchOS
# - 点击 Continue

# 4. 填写信息:
# Description: Tether WDK Wallet
# Bundle ID: Explicit
# Bundle ID: com.tether.wdk.wallet
# (这个要和 app.json 中的 bundleIdentifier 一致!)

# 5. 选择 Capabilities (可选):
# - Push Notifications (如果需要推送)
# - 其他根据需要选择

# 6. 点击 Continue
# 7. 点击 Register
```
App ID Prefix
2TEZVTPHR2 (Team ID)
com.ex1.x1wallet (explicit)
#### 6. 注册测试设备 (如果构建 Ad Hoc)

**步骤 6.1: 在 iPhone 上获取 UDID**

```bash
# 方法 A: 使用 get.udid.io (最简单,推荐)

1. 在 iPhone 上打开 Safari 浏览器
2. 访问: https://get.udid.io
3. 点击页面上的大按钮 "Tap to find UDID"
4. 会提示下载描述文件 (Configuration Profile)
5. 点击 "允许" (Allow)
6. 会跳转到 "设置" App
7. 看到 "已下载描述文件" 通知
8. 点击 "安装" (Install)
9. 输入 iPhone 锁屏密码
10. 再次点击 "安装" 确认
11. 安装完成后,页面会显示您的 UDID
12. UDID 格式: 00008030-XXXXXXXXXXXX (40位字符)
13. 复制这个 UDID (长按选择,复制)
14. 可以通过 AirDrop/邮件发送到电脑

# 方法 B: 使用 Finder (需要 Mac)
1. iPhone 用数据线连接到 Mac
2. 打开 Finder
3. 左侧边栏选择您的 iPhone
4. 点击设备名称/序列号/型号处
5. 会循环显示 UDID
6. 右键点击 → 拷贝 UDID

# 方法 C: 使用 iTunes (Windows)
1. iPhone 连接到 Windows 电脑
2. 打开 iTunes
3. 选择您的设备
4. 点击 "序列号" 字段
5. 会变成 UDID
6. 右键 → 复制
```

**步骤 6.2: 在 Apple Developer Portal 注册设备**

```bash
# 1. 访问:
https://developer.apple.com/account/resources/devices/add

# 3. 选择平台: iOS, tvOS, watchOS

# 4. 填写信息:
# Device Name: My iPhone
# Device ID (UDID): 粘贴从 iPhone 获取的 UDID

# 5. 点击 Continue
# 6. 点击 Register
```

#### 7. 创建 Provisioning Profile

```bash
# 1. 访问:
https://developer.apple.com/account/resources/profiles/add

# 2. 选择类型:
# - iOS App Development (开发测试,最多100个设备)
# - Ad Hoc (内部测试分发,最多100个设备) ⭐ 推荐
# - App Store (提交到 App Store)

# 3. 点击 Continue

# 4. 选择 App ID:
# - 选择刚创建的 "Tether WDK Wallet"
# - 点击 Continue

# 5. 选择证书:
# - 勾选刚创建的证书
# - 点击 Continue

# 6. 选择设备 (Ad Hoc / Development):
# - 勾选要测试的设备
# - 点击 Continue

# 7. 命名:
# Provisioning Profile Name: XWallet AdHoc Profile
# - 点击 Generate

# 8. 下载:
# - 点击 Download
# - 文件名如: XWallet_AdHoc_Profile.mobileprovision
# - 保存到桌面
```

#### 8. 下载文件到本地 Windows

现在您在云 Mac 的桌面上有:
- ✅ `ios_certificate.p12` (证书)
- ✅ `XWallet_AdHoc_Profile.mobileprovision` (Profile)

**下载到 Windows**:

```bash
# 方法 A: 通过浏览器
1. 在云 Mac 上打开浏览器
2. 访问: https://file.io 或 https://www.dropbox.com
3. 上传两个文件
4. 在您的 Windows 电脑上下载

# 方法 B: 通过邮箱
1. 在云 Mac 上打开邮箱
2. 将两个文件作为附件发送给自己
3. 在 Windows 上下载附件

# 方法 C: MacinCloud 文件传输
1. MacinCloud 界面有文件传输功能
2. 点击 "File Transfer"
3. 下载文件到本地
```

---

### 第四步: 停止云 Mac (节省费用)

```bash
# 1. 确认文件已下载到 Windows
# 2. MacinCloud Dashboard → "Stop Server"
# 3. 确认停止

# ⚠️ 重要: 记得停止服务器,否则会一直计费!
```

**总用时**: 约 30-60 分钟  
**总费用**: $1-2 (取决于熟练程度)

---

### 第五步: 上传到 Appflow (2分钟)

在 Windows 上操作:

```bash
# 1. 访问 Appflow Dashboard
https://dashboard.ionicframework.com/app/d41c03c7/settings/certificates

# 2. 点击 "Add Certificate"

# 3. 选择平台: iOS

# 4. 填写信息:
# Name: XWallet iOS Certificate
# Type: 根据证书类型选择
#   - Development (开发)
#   - Ad Hoc (内部分发) ⭐
#   - App Store (商店分发)

# 5. 上传证书:
# App development / Store certificate:
# - 点击 "browse"
# - 选择 ios_certificate.p12
# - 输入密码 (创建 .p12 时设置的密码)

# 6. 上传 Provisioning Profile:
# Provisioning profiles:
# - 点击 "browse"
# - 选择 XWallet_AdHoc_Profile.mobileprovision

# 7. 点击 "Add certificate"
```

✅ 完成!现在可以构建 iOS Device 版本了!

---

## 🎯 构建应用

### 创建第一个真机构建:

```bash
# 1. Dashboard → Builds → New Build

# 2. 配置:
# Commit: 选择最新的
# Platform: iOS
# Target: iOS Device ⭐
# Build Type: Ad Hoc
# Security Profile: 选择刚上传的证书

# 3. Start Build

# 4. 等待 10-15 分钟

# 5. 下载 .ipa 文件

# 6. 使用 Diawi 安装:
# - 访问 https://www.diawi.com
# - 上传 .ipa
# - 在 iPhone Safari 打开生成的链接
# - 安装!
```

---

## 💰 费用总结

| 项目 | 费用 | 频率 |
|------|------|------|
| **Apple Developer** | $99/年 | 必需 (年付) |
| **MacinCloud** | $1-2 | 一次性 |
| **Appflow 构建** | $0-49/月 | 按需 |
| **总计 (首年)** | ~$100-150 | - |
| **以后每年** | $99 + Appflow费用 | - |

---

## 🆘 常见问题

### Q1: MacinCloud 连接很慢怎么办?

**A**: 选择离您最近的服务器位置:
- 亚洲用户: 选择新加坡或香港服务器
- 或者等待非高峰时段

### Q2: 证书创建失败?

**A**: 确保:
1. Apple Developer 账号已激活
2. CSR 文件正确生成
3. Bundle ID 和 app.json 一致

### Q3: Provisioning Profile 不匹配?

**A**: 检查:
1. Profile 包含的 App ID 是否正确
2. Profile 包含的证书是否正确
3. 设备 UDID 是否已添加 (Ad Hoc)

### Q4: 能不能不用 MacinCloud?

**A**: 替代方案:
- **AWS EC2 Mac**: 更贵但更稳定
- **Shells**: $5/月
- **找有 Mac 的朋友**: 免费但需要人情

### Q5: 证书有效期多久?

**A**: 
- 开发证书: 1年
- 分发证书: 1年
- Provisioning Profile: 1年
- 到期后需要重新生成

---

## 📝 检查清单

在开始前确保:

- [ ] 有 Apple Developer 账号 ($99/年)
- [ ] 有信用卡或 PayPal (充值 MacinCloud)
- [ ] 知道 iPhone UDID (如果构建 Ad Hoc)
- [ ] 准备 30-60 分钟时间
- [ ] 有稳定的网络连接

生成后保存:

- [ ] ios_certificate.p12 (证书文件)
- [ ] 证书密码 (写下来!)
- [ ] XWallet_AdHoc_Profile.mobileprovision (Profile)
- [ ] iPhone UDID 列表
- [ ] 证书到期日期

---

## 🎉 总结

### 完整流程回顾:

```
1. 注册 MacinCloud ($5充值)
2. 启动云 Mac ($1/小时)
3. 生成 CSR 文件
4. Apple Developer Portal 创建证书
5. 导出为 .p12
6. 创建 App ID
7. 注册设备 UDID
8. 创建 Provisioning Profile
9. 下载文件到 Windows
10. 停止云 Mac (重要!)
11. 上传到 Appflow
12. 构建 iOS Device 版本
13. 用 Diawi 安装到 iPhone
```

**总时间**: 约 1 小时  
**总费用**: ~$1-2 (一次性)  
**以后**: 完全免费使用!

---

## 📚 相关资源

- **MacinCloud**: https://www.macincloud.com
- **Apple Developer**: https://developer.apple.com
- **Diawi**: https://www.diawi.com
- **UDID 获取**: https://get.udid.io
- **详细证书指南**: `docs/GITHUB-ACTIONS-IOS-GUIDE.md`

---

**准备好了吗?** 开始租用云 Mac 生成证书吧! 🚀

如有任何问题,随时告诉我!
