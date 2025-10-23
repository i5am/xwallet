# 📱 快速安装 APK

## 🎯 最简单的方法 (无需 USB 调试)

### 1️⃣ 使用微信/QQ 传输 (推荐)

**步骤:**
1. 在电脑上打开微信或 QQ
2. 打开"文件传输助手"(微信) 或发送给自己(QQ)
3. 点击"发送文件"
4. 选择: `D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk`
5. 在手机上打开微信/QQ,下载文件
6. 点击下载的 APK 文件
7. 允许安装 → 点击安装

✅ 完成!

---

### 2️⃣ 使用 USB 数据线复制

**步骤:**
1. 用 USB 数据线连接手机到电脑
2. 手机选择"文件传输(MTP)"模式
3. 在电脑上打开"此电脑",找到您的手机
4. 将 `app-debug.apk` 复制到手机的 `Download` 文件夹
5. 在手机上打开文件管理器
6. 进入 `Download` 文件夹
7. 点击 `app-debug.apk`
8. 允许安装 → 点击安装

✅ 完成!

---

### 3️⃣ 使用邮件

**步骤:**
1. 将 APK 作为附件发送到自己的邮箱
2. 在手机上打开邮件
3. 下载附件
4. 点击安装

---

## ⚙️ 如果您想使用 adb 命令安装

需要先设置好手机:

### A. 启用手机的 USB 调试

1. **打开开发者选项:**
   - 设置 → 关于手机
   - 找到"版本号"或"内部版本号"
   - 连续快速点击 7 次
   - 看到提示"您已处于开发者模式"

2. **启用 USB 调试:**
   - 返回设置
   - 找到"开发者选项"(通常在"系统"或"其他设置"中)
   - 启用"USB 调试"
   - 启用"USB 安装"(如果有)

3. **连接手机:**
   - 用 USB 数据线连接
   - 选择"文件传输(MTP)"模式
   - 手机会弹出"允许 USB 调试"对话框
   - 勾选"始终允许来自这台计算机"
   - 点击"允许"

### B. 使用 adb 安装

```powershell
# 添加 adb 到 PATH
$env:Path += ";C:\Users\RAZER\AppData\Local\Android\Sdk\platform-tools"

# 检查设备
adb devices
# 应该显示: List of devices attached
#           XXXXXXXX    device

# 安装 APK
adb install "D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## 📂 APK 文件位置

```
D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk
```

文件大小: 5.63 MB

---

## 💡 我的推荐

**最简单**: 使用微信/QQ 文件传输助手 (30秒搞定)
**最快**: USB 复制到手机 (如果数据线在手边)
**开发者**: adb 命令 (需要先设置 USB 调试)

---

## ❓ 常见问题

### 手机提示"禁止安装未知应用"怎么办?

1. 点击"设置"按钮
2. 允许文件管理器/浏览器安装应用
3. 返回继续安装

### 如何卸载应用?

- 长按应用图标 → 卸载
- 或: 设置 → 应用 → Tether WDK Wallet → 卸载

---

## 🎉 安装完成后

应用名称: **Tether WDK Wallet**

首次打开时:
- 允许相机权限 (扫描二维码需要)
- 创建新钱包或导入现有钱包
- 开始使用!

---

需要帮助随时告诉我! 😊
