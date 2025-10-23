#!/bin/bash

# iOS 云构建快速启动脚本 - GitHub Actions 方案

echo "🍎 iOS 云构建配置助手 (GitHub Actions)"
echo "========================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📋 开始配置..."
echo ""

# 步骤 1: 检查 iOS 目录
if [ ! -d "ios" ]; then
    echo "❌ iOS 目录不存在,请先运行: npx cap add ios"
    exit 1
fi
echo "✅ iOS 目录存在"

# 步骤 2: 配置 Bundle ID
echo ""
echo "📝 请输入你的 Bundle ID (例如: com.yourcompany.wdk):"
read BUNDLE_ID

if [ -z "$BUNDLE_ID" ]; then
    echo "❌ Bundle ID 不能为空"
    exit 1
fi
echo "✅ Bundle ID: $BUNDLE_ID"

# 步骤 3: 配置 Team ID
echo ""
echo "📝 请输入你的 Apple Team ID (10位字符):"
read TEAM_ID

if [ -z "$TEAM_ID" ]; then
    echo "❌ Team ID 不能为空"
    exit 1
fi
echo "✅ Team ID: $TEAM_ID"

# 步骤 4: 配置 Provisioning Profile 名称
echo ""
echo "📝 请输入 Provisioning Profile 名称:"
read PP_NAME

if [ -z "$PP_NAME" ]; then
    echo "❌ Provisioning Profile 名称不能为空"
    exit 1
fi
echo "✅ Provisioning Profile: $PP_NAME"

# 步骤 5: 更新 exportOptions.plist
echo ""
echo "🔧 更新 exportOptions.plist..."
cat > ios/App/exportOptions.plist << EOF
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
EOF
echo "✅ exportOptions.plist 已更新"

# 步骤 6: 提示配置 GitHub Secrets
echo ""
echo "🔐 请在 GitHub 仓库中配置以下 Secrets:"
echo "   仓库 → Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "   1. IOS_CERTIFICATE_BASE64"
echo "      - P12 证书的 Base64 编码"
echo ""
echo "   2. IOS_CERTIFICATE_PASSWORD"
echo "      - P12 证书的密码"
echo ""
echo "   3. IOS_PROVISIONING_PROFILE_BASE64"
echo "      - Provisioning Profile 的 Base64 编码"
echo ""
echo "   4. KEYCHAIN_PASSWORD"
echo "      - 临时 Keychain 密码 (随机生成,如: temp1234)"
echo ""

# 步骤 7: 生成 Base64 转换命令
echo "💡 Base64 转换命令 (在有文件的机器上运行):"
echo ""
echo "   macOS/Linux:"
echo "   base64 -i ios_distribution.p12 -o ios_cert_base64.txt"
echo "   base64 -i YOUR_PROFILE.mobileprovision -o pp_base64.txt"
echo ""
echo "   Windows PowerShell:"
echo "   [Convert]::ToBase64String([IO.File]::ReadAllBytes('ios_distribution.p12')) | Out-File ios_cert_base64.txt"
echo "   [Convert]::ToBase64String([IO.File]::ReadAllBytes('YOUR_PROFILE.mobileprovision')) | Out-File pp_base64.txt"
echo ""

# 步骤 8: Git 配置检查
echo "📦 Git 配置:"
if git remote -v | grep -q "origin"; then
    echo "✅ Git remote 已配置"
    git remote -v
else
    echo "⚠️  未检测到 Git remote"
    echo "   请先配置: git remote add origin <YOUR_REPO_URL>"
fi

echo ""
echo "✅ 配置完成!"
echo ""
echo "📤 下一步:"
echo "   1. 配置 GitHub Secrets (见上方)"
echo "   2. 推送代码: git add . && git commit -m 'Configure iOS build' && git push"
echo "   3. 访问 GitHub Actions 查看构建状态"
echo ""
echo "🎉 完成后可在 Actions 页面下载 IPA 文件"
