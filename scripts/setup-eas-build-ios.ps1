# iOS 云构建快速启动脚本 - Expo EAS Build 方案 (PowerShell)

Write-Host "🚀 iOS 云构建配置助手 (Expo EAS Build)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 此方案最简单,推荐快速上手!" -ForegroundColor Green
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤 1: 检查 EAS CLI
Write-Host "🔍 检查 EAS CLI..." -ForegroundColor Cyan
try {
    $easVersion = eas --version 2>$null
    if ($easVersion) {
        Write-Host "✅ EAS CLI 已安装: $easVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  EAS CLI 未安装" -ForegroundColor Yellow
    Write-Host "📦 正在安装 EAS CLI..." -ForegroundColor Cyan
    npm install -g eas-cli
    Write-Host "✅ EAS CLI 安装完成" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📋 配置步骤" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# 步骤 2: 登录 Expo
Write-Host "1️⃣  登录 Expo 账号" -ForegroundColor Yellow
Write-Host "   如果没有账号,请访问: https://expo.dev/signup" -ForegroundColor White
Write-Host ""
Write-Host "是否现在登录? (Y/N)" -ForegroundColor Yellow
$login = Read-Host

if ($login -eq 'Y' -or $login -eq 'y') {
    Write-Host "🔐 正在打开登录..." -ForegroundColor Cyan
    eas login
    Write-Host ""
}

# 步骤 3: 配置项目
Write-Host ""
Write-Host "2️⃣  配置 EAS 项目" -ForegroundColor Yellow
Write-Host "   这会创建 eas.json 配置文件" -ForegroundColor White
Write-Host ""

if (Test-Path "eas.json") {
    Write-Host "✅ eas.json 已存在,跳过配置" -ForegroundColor Green
} else {
    Write-Host "是否现在配置? (Y/N)" -ForegroundColor Yellow
    $configure = Read-Host
    
    if ($configure -eq 'Y' -or $configure -eq 'y') {
        Write-Host "⚙️  正在配置..." -ForegroundColor Cyan
        eas build:configure
        Write-Host ""
    }
}

# 步骤 4: 配置 Apple 凭证
Write-Host ""
Write-Host "3️⃣  配置 Apple Developer 凭证" -ForegroundColor Yellow
Write-Host "   EAS 可以自动管理证书和 Provisioning Profile" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  需要准备:" -ForegroundColor Yellow
Write-Host "   - Apple ID (开发者账号)" -ForegroundColor White
Write-Host "   - Apple ID 密码" -ForegroundColor White
Write-Host "   - 双因素认证码 (如果启用)" -ForegroundColor White
Write-Host ""
Write-Host "是否现在配置凭证? (Y/N)" -ForegroundColor Yellow
$credentials = Read-Host

if ($credentials -eq 'Y' -or $credentials -eq 'y') {
    Write-Host "🔑 正在配置凭证..." -ForegroundColor Cyan
    eas credentials
    Write-Host ""
}

# 步骤 5: 构建选项
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🏗️  构建选项" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "选择构建类型:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Development (开发版 - 可在模拟器运行)" -ForegroundColor White
Write-Host "2. Preview (预览版 - 可在真机测试,扫码安装)" -ForegroundColor White
Write-Host "3. Production (生产版 - 提交到 App Store)" -ForegroundColor White
Write-Host "4. 稍后手动构建" -ForegroundColor White
Write-Host ""
Write-Host "请选择 (1-4):" -ForegroundColor Yellow
$buildChoice = Read-Host

switch ($buildChoice) {
    "1" {
        Write-Host ""
        Write-Host "🏗️  开始 Development 构建..." -ForegroundColor Cyan
        Write-Host "   命令: eas build --platform ios --profile development" -ForegroundColor DarkGray
        Write-Host ""
        eas build --platform ios --profile development
    }
    "2" {
        Write-Host ""
        Write-Host "🏗️  开始 Preview 构建..." -ForegroundColor Cyan
        Write-Host "   命令: eas build --platform ios --profile preview" -ForegroundColor DarkGray
        Write-Host ""
        eas build --platform ios --profile preview
    }
    "3" {
        Write-Host ""
        Write-Host "🏗️  开始 Production 构建..." -ForegroundColor Cyan
        Write-Host "   命令: eas build --platform ios --profile production" -ForegroundColor DarkGray
        Write-Host ""
        eas build --platform ios --profile production
    }
    "4" {
        Write-Host ""
        Write-Host "📝 手动构建命令:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   开发版:" -ForegroundColor Yellow
        Write-Host "   eas build --platform ios --profile development" -ForegroundColor White
        Write-Host ""
        Write-Host "   预览版 (推荐):" -ForegroundColor Yellow
        Write-Host "   eas build --platform ios --profile preview" -ForegroundColor White
        Write-Host ""
        Write-Host "   生产版:" -ForegroundColor Yellow
        Write-Host "   eas build --platform ios --profile production" -ForegroundColor White
        Write-Host ""
    }
    default {
        Write-Host "⚠️  无效选择,跳过构建" -ForegroundColor Yellow
    }
}

# 步骤 6: 构建完成后
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📱 安装和测试" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "构建完成后:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 📊 查看构建状态:" -ForegroundColor White
Write-Host "   访问构建 URL (构建时显示的链接)" -ForegroundColor DarkGray
Write-Host "   或访问: https://expo.dev/accounts/[username]/projects/[project]/builds" -ForegroundColor DarkGray
Write-Host ""
Write-Host "2. 📲 安装到设备 (Preview build):" -ForegroundColor White
Write-Host "   - 用 iPhone 扫描 EAS 提供的二维码" -ForegroundColor DarkGray
Write-Host "   - 或在浏览器打开安装链接" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. 💾 下载 IPA:" -ForegroundColor White
Write-Host "   eas build:list" -ForegroundColor DarkGray
Write-Host "   eas build:download --id [BUILD_ID]" -ForegroundColor DarkGray
Write-Host ""
Write-Host "4. 🚀 提交到 App Store (Production build):" -ForegroundColor White
Write-Host "   eas submit --platform ios" -ForegroundColor DarkGray
Write-Host ""

# 步骤 7: 常用命令
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🛠️  常用命令" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "登录/注销:" -ForegroundColor Yellow
Write-Host "  eas login          - 登录账号" -ForegroundColor White
Write-Host "  eas logout         - 注销账号" -ForegroundColor White
Write-Host "  eas whoami         - 查看当前用户" -ForegroundColor White
Write-Host ""
Write-Host "构建管理:" -ForegroundColor Yellow
Write-Host "  eas build:list     - 查看所有构建" -ForegroundColor White
Write-Host "  eas build:view     - 查看构建详情" -ForegroundColor White
Write-Host "  eas build:cancel   - 取消构建" -ForegroundColor White
Write-Host ""
Write-Host "凭证管理:" -ForegroundColor Yellow
Write-Host "  eas credentials    - 管理凭证" -ForegroundColor White
Write-Host ""
Write-Host "项目管理:" -ForegroundColor Yellow
Write-Host "  eas project:init   - 初始化项目" -ForegroundColor White
Write-Host "  eas project:info   - 查看项目信息" -ForegroundColor White
Write-Host ""

# 步骤 8: 费用说明
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "💰 费用说明" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "免费层:" -ForegroundColor Green
Write-Host "  ✅ 30 次构建/月" -ForegroundColor White
Write-Host "  ✅ 无限项目" -ForegroundColor White
Write-Host "  ✅ 基础支持" -ForegroundColor White
Write-Host ""
Write-Host "Pro ($29/月):" -ForegroundColor Yellow
Write-Host "  ✅ 无限构建" -ForegroundColor White
Write-Host "  ✅ 优先构建队列" -ForegroundColor White
Write-Host "  ✅ 优先支持" -ForegroundColor White
Write-Host ""
Write-Host "详情: https://expo.dev/pricing" -ForegroundColor DarkGray
Write-Host ""

# 完成
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "✅ 配置完成!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📚 更多帮助:" -ForegroundColor Cyan
Write-Host "  - EAS Build 文档: https://docs.expo.dev/build/introduction/" -ForegroundColor White
Write-Host "  - iOS 云构建指南: docs/iOS-Cloud-Build-Guide.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 祝构建顺利! 🚀" -ForegroundColor Green
