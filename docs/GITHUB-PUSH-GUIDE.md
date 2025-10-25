# 🚀 推送代码到 GitHub - 快速指南

## ✅ 已完成

- ✅ Git 用户配置: shengq@gmail.com
- ✅ 远程仓库配置: https://github.com/i5am/xwallet.git
- ✅ Ionic Appflow 已连接: App ID d41c03c7

---

## 🔐 获取 GitHub Personal Access Token

### 方法 1: Web 界面 (已为您打开)

访问: https://github.com/settings/tokens/new

配置:
1. **Note**: `Ionic Appflow XWallet`
2. **Expiration**: 选择 `90 days` 或 `No expiration`
3. **Scopes**: 勾选 ✅ **repo** (完整的私有仓库控制权限)
4. 点击 **Generate token**
5. **复制 Token** (只显示一次!)

### 方法 2: GitHub CLI (推荐)

```powershell
# 安装 GitHub CLI
winget install GitHub.cli

# 登录
gh auth login

# 然后就可以直接推送
git push -u origin master
```

---

## 📤 推送代码

### 使用 Personal Access Token

```bash
cd d:\projects\wdk
git push -u origin master
```

当提示时:
- **Username**: `i5am`
- **Password**: `[粘贴您的 Personal Access Token]`

### 缓存凭据 (避免每次输入)

推送成功后,运行:

```bash
git config credential.helper store
```

这样以后推送就不需要再输入 Token 了。

---

## 🔄 验证推送成功

推送后:

1. 访问: https://github.com/i5am/xwallet
2. 检查代码是否已上传
3. 查看最新 commit

---

## 📱 触发 Appflow 构建

代码推送成功后:

1. 访问 Appflow Dashboard: https://dashboard.ionicframework.com/app/d41c03c7
2. 或运行: `ionic dashboard`
3. Builds → New Build
4. 选择 iOS Simulator (不需要证书)
5. Start Build

---

## ⚠️ 常见问题

### Q: Token 忘记保存了怎么办?

A: 重新生成一个新的 Token (旧的会失效)

### Q: 推送时还是提示认证失败?

A: 检查:
1. Token 权限是否包含 `repo`
2. Token 是否过期
3. 用户名是否正确 (`i5am`)

### Q: 想要自动登录不输入密码?

A: 使用 GitHub CLI:
```bash
gh auth login
```
或使用 credential helper:
```bash
git config --global credential.helper store
```

---

## 🎯 完整流程总结

```bash
# 1. 获取 Token (已打开网页)
# 复制 Token

# 2. 推送代码
cd d:\projects\wdk
git push -u origin master
# Username: i5am
# Password: [粘贴 Token]

# 3. 缓存凭据 (可选)
git config credential.helper store

# 4. 验证成功
# 访问: https://github.com/i5am/xwallet

# 5. 触发 Appflow 构建
ionic dashboard
# Builds → New Build → iOS Simulator
```

---

## 📊 推送后的效果

推送成功后:

✅ **GitHub 仓库**
- 代码已同步到 https://github.com/i5am/xwallet
- 可以在线查看代码
- 其他人可以 clone/fork

✅ **Ionic Appflow**
- 自动检测到新的 commit
- 可以创建基于最新代码的构建
- 如果配置了自动构建,会自动开始

✅ **GitHub Actions** (如果使用)
- 自动触发 iOS 构建 workflow
- 10-15 分钟后生成 IPA 文件

---

## 💡 下一步

推送成功后:

1. ✅ **验证代码已上传**: 访问 https://github.com/i5am/xwallet
2. 🚀 **创建 Appflow 构建**: `ionic dashboard` → New Build
3. 📱 **或使用 GitHub Actions**: 自动开始构建 (如果配置了)

---

## 🆘 需要帮助?

如果遇到问题:

- Token 生成问题
- 推送认证失败
- Appflow 构建问题

告诉我具体的错误信息,我会帮您解决! 🚀
