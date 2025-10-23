#!/bin/bash

# iOS 云构建预检查脚本
# 确保所有必需的配置都已就绪

echo "🔍 检查 iOS 云构建配置..."

# 1. 检查 eas.json
if [ ! -f "eas.json" ]; then
    echo "❌ eas.json 不存在"
    exit 1
fi
echo "✅ eas.json 存在"

# 2. 检查 Xcode scheme
SCHEME_FILE="ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme"
if [ ! -f "$SCHEME_FILE" ]; then
    echo "❌ Xcode scheme 未共享"
    echo "📝 正在创建共享 scheme..."
    mkdir -p "ios/App/App.xcodeproj/xcshareddata/xcschemes"
    cp "$SCHEME_FILE.template" "$SCHEME_FILE" 2>/dev/null || echo "⚠️  需要手动创建 scheme"
else
    echo "✅ Xcode scheme 已共享"
fi

# 3. 检查 Bundle Identifier
if [ -f "ios/App/App/Info.plist" ]; then
    echo "✅ Info.plist 存在"
else
    echo "⚠️  Info.plist 不存在，请确保已运行 'npx cap sync ios'"
fi

# 4. 检查 app.json
if [ ! -f "app.json" ]; then
    echo "⚠️  app.json 不存在，建议创建以配置应用信息"
    cat > app.json <<EOF
{
  "expo": {
    "name": "Tether WDK Wallet",
    "slug": "tether-wdk-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.tether.wdk.wallet",
      "buildNumber": "1",
      "supportsTablet": true
    }
  }
}
EOF
    echo "✅ 已创建 app.json"
else
    echo "✅ app.json 存在"
fi

# 5. 检查是否已登录 EAS
if ! eas whoami >/dev/null 2>&1; then
    echo "⚠️  未登录 EAS，请运行: eas login"
else
    echo "✅ 已登录 EAS"
    eas whoami
fi

echo ""
echo "📋 配置检查完成！"
echo ""
echo "🚀 下一步操作："
echo "1. 如未登录，运行: eas login"
echo "2. 配置项目: eas build:configure"
echo "3. 开始构建: eas build --platform ios --profile preview"
