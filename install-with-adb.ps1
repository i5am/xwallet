# ADB 安装 APK 脚本
# 使用方法: .\install-with-adb.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Tether WDK Wallet - ADB 安装工具" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# 添加 adb 到 PATH
$adbPath = "C:\Users\RAZER\AppData\Local\Android\Sdk\platform-tools"
$env:Path += ";$adbPath"

# APK 路径
$apk = "D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk"

Write-Host "📋 前置检查..." -ForegroundColor Yellow
Write-Host ""

# 检查 adb 是否可用
if (!(Test-Path "$adbPath\adb.exe")) {
    Write-Host "❌ 错误: 未找到 adb.exe" -ForegroundColor Red
    Write-Host "   路径: $adbPath\adb.exe" -ForegroundColor Gray
    pause
    exit 1
}
Write-Host "✅ adb 工具已找到" -ForegroundColor Green

# 检查 APK 文件
if (!(Test-Path $apk)) {
    Write-Host "❌ 错误: 未找到 APK 文件" -ForegroundColor Red
    Write-Host "   路径: $apk" -ForegroundColor Gray
    pause
    exit 1
}
Write-Host "✅ APK 文件已找到 (5.63 MB)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📱 检查设备连接" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查设备
Write-Host "正在检查连接的设备..." -ForegroundColor Gray
$devices = adb devices | Select-String "device$"

if ($devices.Count -eq 0) {
    Write-Host ""
    Write-Host "❌ 未检测到设备!" -ForegroundColor Red
    Write-Host ""
    Write-Host "请按照以下步骤操作:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1️⃣  启用 USB 调试:" -ForegroundColor Cyan
    Write-Host "   - 设置 → 关于手机" -ForegroundColor White
    Write-Host "   - 连续点击'版本号' 7次" -ForegroundColor White
    Write-Host "   - 返回 → 开发者选项" -ForegroundColor White
    Write-Host "   - 打开'USB 调试'" -ForegroundColor White
    Write-Host ""
    Write-Host "2️⃣  连接手机:" -ForegroundColor Cyan
    Write-Host "   - 用 USB 数据线连接手机和电脑" -ForegroundColor White
    Write-Host "   - 选择'文件传输(MTP)'模式" -ForegroundColor White
    Write-Host "   - 允许 USB 调试" -ForegroundColor White
    Write-Host ""
    Write-Host "3️⃣  完成后重新运行此脚本" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ 检测到设备:" -ForegroundColor Green
adb devices
Write-Host ""

# 检查设备是否授权
$unauthorized = adb devices | Select-String "unauthorized"
if ($unauthorized) {
    Write-Host "⚠️  设备未授权!" -ForegroundColor Yellow
    Write-Host "   请在手机上允许 USB 调试" -ForegroundColor White
    Write-Host "   勾选'始终允许'并点击'允许'" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📦 开始安装 APK" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "正在安装到设备..." -ForegroundColor Gray
Write-Host "APK: app-debug.apk (5.63 MB)" -ForegroundColor White
Write-Host ""

# 安装 APK (-r 参数表示替换已有应用)
adb install -r $apk

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ✅ 安装成功!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "应用名称: Tether WDK Wallet" -ForegroundColor White
    Write-Host "应用 ID: com.tether.wdk.wallet" -ForegroundColor White
    Write-Host ""
    Write-Host "您现在可以在手机上打开应用了!" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ❌ 安装失败" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "- 手机存储空间不足" -ForegroundColor White
    Write-Host "- 应用签名冲突(尝试先卸载旧版本)" -ForegroundColor White
    Write-Host "- USB 连接不稳定" -ForegroundColor White
    Write-Host ""
    Write-Host "建议操作:" -ForegroundColor Yellow
    Write-Host "1. 卸载手机上的旧版本(如果有)" -ForegroundColor White
    Write-Host "2. 检查手机存储空间" -ForegroundColor White
    Write-Host "3. 重新运行此脚本" -ForegroundColor White
    Write-Host ""
}

pause
