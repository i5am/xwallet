# 📱 APK 安装指南

您的 APK 已经构建成功! 这里提供多种安装方法。

---

## 📦 APK 信息

- **文件名**: `app-debug.apk`
- **大小**: 5.63 MB
- **位置**: `D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk`

---

## 🚀 安装方法 (推荐顺序)

### 方法 1: 直接复制到手机 (最简单) ⭐

1. **连接手机到电脑 (USB 数据线)**
   - 或使用微信/QQ/网盘等传输

2. **复制 APK 文件**
   - 找到文件: `D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk`
   - 复制到手机的 `Download` 或任意文件夹

3. **在手机上安装**
   - 打开文件管理器
   - 找到 `app-debug.apk`
   - 点击安装
   - 如提示"未知来源",点击"设置"允许安装

---

### 方法 2: 使用微信/QQ 传输

1. **发送 APK**
   - 在电脑上打开微信/QQ
   - 将 APK 发送到"文件传输助手"或自己

2. **在手机接收**
   - 打开手机微信/QQ
   - 下载 APK 文件

3. **安装**
   - 点击下载的文件
   - 允许安装

---

### 方法 3: 使用 adb 命令安装

#### 前提条件:
- ✅ 手机已启用 USB 调试
- ✅ 手机已连接到电脑

#### 步骤:

**A. 启用手机 USB 调试**

1. 打开手机设置
2. 关于手机 → 连续点击"版本号" 7次 (启用开发者选项)
3. 返回设置 → 系统 → 开发者选项
4. 启用 "USB 调试"

**B. 连接手机并安装**

```powershell
# 设置 adb 路径
$env:Path += ";C:\Users\RAZER\AppData\Local\Android\Sdk\platform-tools"

# 检查设备连接
adb devices

# 安装 APK
adb install "D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk"
```

如果看到 "Success",说明安装成功!

---

### 方法 4: 使用网盘

1. 上传 APK 到百度网盘/OneDrive/Google Drive
2. 在手机上下载
3. 安装

---

## 🔧 常见问题

### Q: 手机提示"禁止安装未知应用"

**A:** 这是正常的安全提示。解决方法:

**Android 8.0+:**
1. 点击"设置"
2. 允许此来源(文件管理器/浏览器)安装应用

**Android 7.0 及更低:**
1. 设置 → 安全
2. 启用"未知来源"

### Q: 安装后无法打开

**A:** 可能原因:
1. 手机 Android 版本过低 (需要 Android 5.0+)
2. 检查手机是否有足够存储空间
3. 尝试卸载后重新安装

### Q: adb devices 显示 "unauthorized"

**A:** 
1. 手机会弹出"允许 USB 调试"提示
2. 勾选"始终允许"
3. 点击"允许"
4. 重新运行 adb 命令

### Q: adb devices 没有显示设备

**A:**
1. 检查 USB 数据线是否连接好
2. 确认手机已启用 USB 调试
3. 尝试切换 USB 连接模式为"文件传输(MTP)"
4. 重新插拔 USB

---

## 💡 推荐方式

**最简单**: 方法 1 (直接复制) 或 方法 2 (微信传输)
**最快速**: 方法 3 (adb 命令) - 适合开发者

---

## 📝 快速安装脚本

如果您经常需要重新安装,可以使用这个脚本:

```powershell
# 保存为 install-apk.ps1
$env:Path += ";C:\Users\RAZER\AppData\Local\Android\Sdk\platform-tools"
$apk = "D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk"

Write-Host "📱 检查设备连接..." -ForegroundColor Cyan
adb devices

Write-Host "`n📦 安装 APK..." -ForegroundColor Yellow
adb install -r $apk

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 安装成功!" -ForegroundColor Green
} else {
    Write-Host "`n❌ 安装失败,请检查设备连接或手动安装" -ForegroundColor Red
}
```

使用方法:
```powershell
.\install-apk.ps1
```

---

## 🎯 安装完成后

应用名称: **Tether WDK Wallet**

图标: 在应用列表中查找

首次启动:
1. 允许相机权限 (用于二维码扫描)
2. 创建或导入钱包
3. 开始使用!

---

需要帮助? 随时告诉我! 😊
