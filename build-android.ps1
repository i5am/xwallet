# Tether WDK Wallet - Android Debug Build Script
# 快速构建 Android 调试版本

Write-Host "🚀 开始构建 Tether WDK Wallet Android 应用..." -ForegroundColor Cyan
Write-Host ""

# 1. 检查 Node.js
Write-Host "📦 检查 Node.js..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误: 未找到 Node.js。请先安装 Node.js: https://nodejs.org/" -ForegroundColor Red
    exit 1
}
$nodeVersion = node -v
Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
Write-Host ""

# 2. 检查 Java
Write-Host "☕ 检查 Java..." -ForegroundColor Yellow
if (!(Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  警告: 未找到 Java。Android 构建需要 JDK 11+。" -ForegroundColor Yellow
    Write-Host "   请安装 Android Studio 或下载 OpenJDK: https://adoptium.net/" -ForegroundColor Yellow
} else {
    $javaVersion = java -version 2>&1 | Select-String "version" | ForEach-Object { $_.Line }
    Write-Host "✅ Java 版本: $javaVersion" -ForegroundColor Green
}
Write-Host ""

# 3. 安装依赖
Write-Host "📥 安装依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 4. 构建 Web 应用
Write-Host "🔨 构建 Web 应用..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web 构建失败!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web 构建完成" -ForegroundColor Green
Write-Host ""

# 5. 同步到 Android
Write-Host "🔄 同步到 Android 项目..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 同步失败!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 同步完成" -ForegroundColor Green
Write-Host ""

# 6. 检查 Android 环境
Write-Host "🤖 检查 Android 环境..." -ForegroundColor Yellow
if (Test-Path "android") {
    Write-Host "✅ Android 项目目录存在" -ForegroundColor Green
} else {
    Write-Host "❌ Android 项目目录不存在!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. 构建 Android APK
Write-Host "📱 构建 Android Debug APK..." -ForegroundColor Yellow
Write-Host "   这可能需要几分钟时间..." -ForegroundColor Gray
Set-Location android

# 使用 Gradle Wrapper 构建
if (Test-Path "gradlew.bat") {
    .\gradlew.bat assembleDebug
} else {
    Write-Host "❌ 未找到 gradlew.bat!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Android 构建失败!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host "✅ Android 构建完成" -ForegroundColor Green
Write-Host ""

# 8. 检查 APK
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "🎉 构建成功!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 APK 信息:" -ForegroundColor Cyan
    Write-Host "   路径: $apkPath" -ForegroundColor White
    Write-Host "   大小: $([math]::Round($apkSize, 2)) MB" -ForegroundColor White
    Write-Host ""
    Write-Host "📲 安装方法:" -ForegroundColor Cyan
    Write-Host "   1. 连接 Android 设备并启用 USB 调试" -ForegroundColor White
    Write-Host "   2. 运行: adb install $apkPath" -ForegroundColor White
    Write-Host "   或者直接将 APK 拷贝到手机安装" -ForegroundColor White
    Write-Host ""
    
    # 询问是否打开 APK 所在文件夹
    $openFolder = Read-Host "是否打开 APK 所在文件夹? (Y/N)"
    if ($openFolder -eq "Y" -or $openFolder -eq "y") {
        explorer.exe (Resolve-Path "android\app\build\outputs\apk\debug")
    }
} else {
    Write-Host "❌ 未找到生成的 APK 文件!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ 完成!" -ForegroundColor Green
