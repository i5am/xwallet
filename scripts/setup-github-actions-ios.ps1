# iOS 云构建快速启动脚本 - GitHub Actions 方案 (PowerShell)

Write-Host "🍎 iOS 云构建配置助手 (GitHub Actions)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

Write-Host "📋 开始配置..." -ForegroundColor Green
Write-Host ""

# 步骤 1: 检查 iOS 目录
if (-not (Test-Path "ios")) {
    Write-Host "❌ iOS 目录不存在,请先运行: npx cap add ios" -ForegroundColor Red
    exit 1
}
Write-Host "✅ iOS 目录存在" -ForegroundColor Green

# 步骤 2: 配置 Bundle ID
Write-Host ""
Write-Host "📝 请输入你的 Bundle ID (例如: com.yourcompany.wdk):" -ForegroundColor Yellow
$BUNDLE_ID = Read-Host

if ([string]::IsNullOrWhiteSpace($BUNDLE_ID)) {
    Write-Host "❌ Bundle ID 不能为空" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Bundle ID: $BUNDLE_ID" -ForegroundColor Green

# 步骤 3: 配置 Team ID
Write-Host ""
Write-Host "📝 请输入你的 Apple Team ID (10位字符):" -ForegroundColor Yellow
$TEAM_ID = Read-Host

if ([string]::IsNullOrWhiteSpace($TEAM_ID)) {
    Write-Host "❌ Team ID 不能为空" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Team ID: $TEAM_ID" -ForegroundColor Green

# 步骤 4: 配置 Provisioning Profile 名称
Write-Host ""
Write-Host "📝 请输入 Provisioning Profile 名称:" -ForegroundColor Yellow
$PP_NAME = Read-Host

if ([string]::IsNullOrWhiteSpace($PP_NAME)) {
    Write-Host "❌ Provisioning Profile 名称不能为空" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Provisioning Profile: $PP_NAME" -ForegroundColor Green

# 步骤 5: 更新 exportOptions.plist
Write-Host ""
Write-Host "🔧 更新 exportOptions.plist..." -ForegroundColor Cyan

$exportOptions = @"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    
    <key>teamID</key>
    <string>$TEAM_ID</string>
    
    <key>signingStyle</key>
    <string>manual</string>
    
    <key>stripSwiftSymbols</key>
    <true/>
    
    <key>uploadBitcode</key>
    <false/>
    
    <key>uploadSymbols</key>
    <true/>
    
    <key>compileBitcode</key>
    <false/>
    
    <key>provisioningProfiles</key>
    <dict>
        <key>$BUNDLE_ID</key>
        <string>$PP_NAME</string>
    </dict>
</dict>
</plist>
"@

$exportOptions | Out-File -FilePath "ios\App\exportOptions.plist" -Encoding utf8
Write-Host "✅ exportOptions.plist 已更新" -ForegroundColor Green

# 步骤 6: 提示配置 GitHub Secrets
Write-Host ""
Write-Host "🔐 请在 GitHub 仓库中配置以下 Secrets:" -ForegroundColor Cyan
Write-Host "   仓库 → Settings → Secrets and variables → Actions → New repository secret" -ForegroundColor White
Write-Host ""
Write-Host "   1. IOS_CERTIFICATE_BASE64" -ForegroundColor Yellow
Write-Host "      - P12 证书的 Base64 编码" -ForegroundColor White
Write-Host ""
Write-Host "   2. IOS_CERTIFICATE_PASSWORD" -ForegroundColor Yellow
Write-Host "      - P12 证书的密码" -ForegroundColor White
Write-Host ""
Write-Host "   3. IOS_PROVISIONING_PROFILE_BASE64" -ForegroundColor Yellow
Write-Host "      - Provisioning Profile 的 Base64 编码" -ForegroundColor White
Write-Host ""
Write-Host "   4. KEYCHAIN_PASSWORD" -ForegroundColor Yellow
Write-Host "      - 临时 Keychain 密码 (随机生成,如: temp1234)" -ForegroundColor White
Write-Host ""

# 步骤 7: 生成 Base64 转换命令
Write-Host "💡 Base64 转换命令:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Windows PowerShell (当前系统):" -ForegroundColor Yellow
Write-Host "   [Convert]::ToBase64String([IO.File]::ReadAllBytes('ios_distribution.p12')) | Out-File ios_cert_base64.txt" -ForegroundColor White
Write-Host "   [Convert]::ToBase64String([IO.File]::ReadAllBytes('YOUR_PROFILE.mobileprovision')) | Out-File pp_base64.txt" -ForegroundColor White
Write-Host ""
Write-Host "   macOS/Linux:" -ForegroundColor Yellow
Write-Host "   base64 -i ios_distribution.p12 -o ios_cert_base64.txt" -ForegroundColor White
Write-Host "   base64 -i YOUR_PROFILE.mobileprovision -o pp_base64.txt" -ForegroundColor White
Write-Host ""

# 步骤 8: Git 配置检查
Write-Host "📦 Git 配置:" -ForegroundColor Cyan
try {
    $gitRemote = git remote -v 2>$null
    if ($gitRemote) {
        Write-Host "✅ Git remote 已配置" -ForegroundColor Green
        Write-Host $gitRemote
    } else {
        Write-Host "⚠️  未检测到 Git remote" -ForegroundColor Yellow
        Write-Host "   请先配置: git remote add origin <YOUR_REPO_URL>" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Git 未安装或配置" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ 配置完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 下一步:" -ForegroundColor Cyan
Write-Host "   1. 配置 GitHub Secrets (见上方)" -ForegroundColor White
Write-Host "   2. 推送代码: git add . ; git commit -m 'Configure iOS build' ; git push" -ForegroundColor White
Write-Host "   3. 访问 GitHub Actions 查看构建状态" -ForegroundColor White
Write-Host ""
Write-Host "🎉 完成后可在 Actions 页面下载 IPA 文件" -ForegroundColor Green

# 提供快捷转换工具
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🛠️  快捷工具: Base64 文件转换" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "如果你现在有 P12 或 mobileprovision 文件,我可以帮你转换为 Base64" -ForegroundColor Yellow
Write-Host "是否需要转换文件? (Y/N)" -ForegroundColor Yellow
$convert = Read-Host

if ($convert -eq 'Y' -or $convert -eq 'y') {
    Write-Host ""
    Write-Host "📁 请输入 P12 证书文件路径 (或按 Enter 跳过):" -ForegroundColor Yellow
    $p12Path = Read-Host
    
    if (-not [string]::IsNullOrWhiteSpace($p12Path) -and (Test-Path $p12Path)) {
        $p12Base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($p12Path))
        $outputP12 = "ios_cert_base64.txt"
        $p12Base64 | Out-File $outputP12 -Encoding utf8
        Write-Host "✅ P12 Base64 已保存到: $outputP12" -ForegroundColor Green
        Write-Host "   请将此文件内容复制到 GitHub Secret: IOS_CERTIFICATE_BASE64" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "📁 请输入 Provisioning Profile 文件路径 (.mobileprovision) (或按 Enter 跳过):" -ForegroundColor Yellow
    $ppPath = Read-Host
    
    if (-not [string]::IsNullOrWhiteSpace($ppPath) -and (Test-Path $ppPath)) {
        $ppBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($ppPath))
        $outputPP = "provisioning_profile_base64.txt"
        $ppBase64 | Out-File $outputPP -Encoding utf8
        Write-Host "✅ Provisioning Profile Base64 已保存到: $outputPP" -ForegroundColor Green
        Write-Host "   请将此文件内容复制到 GitHub Secret: IOS_PROVISIONING_PROFILE_BASE64" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "🎉 转换完成!" -ForegroundColor Green
}

Write-Host ""
Write-Host "谢谢使用! 祝构建顺利! 🚀" -ForegroundColor Cyan
