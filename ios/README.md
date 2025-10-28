# iOS 原生 OCR 集成

本目录包含 iOS 原生 App 的代码，用于集成 WDK 钱包 Web 应用并提供原生 OCR 功能。

## 📁 文件结构

```
ios/
├── AppDelegate.swift           # 应用启动入口
├── ViewController.swift        # 主视图控制器（WebView 容器）
├── OCRHandler.swift           # OCR 识别处理器
├── Info.plist                 # 应用配置文件
└── README.md                  # 本文件
```

## 🚀 快速开始

### 1. 创建 Xcode 项目

```bash
# 使用 Xcode 创建新项目
# File → New → Project → iOS → App
# Product Name: WDK Wallet
# Organization Identifier: com.wdk.wallet
# Interface: Storyboard
# Language: Swift
```

### 2. 添加源文件

将本目录下的 `.swift` 文件复制到 Xcode 项目中：
- `AppDelegate.swift` → 应用启动配置
- `ViewController.swift` → WebView 和界面
- `OCRHandler.swift` → OCR 功能实现

### 3. 配置 Info.plist

复制 `Info.plist` 中的权限配置到你的项目：

```xml
<!-- 相机权限 -->
<key>NSCameraUsageDescription</key>
<string>钱包应用需要使用相机进行 OCR 文字识别和二维码扫描</string>

<!-- 允许 HTTP（开发环境） -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### 4. 配置 Build Settings

在 Xcode 中设置：
- **Deployment Target**: iOS 13.0+
- **Swift Language Version**: Swift 5.0

### 5. 运行

```bash
# 选择模拟器或真机
# Product → Run (⌘R)
```

## 🔧 功能说明

### OCR 识别流程

```
Web App                     iOS Native
   |                            |
   |-- 1. 拍照获取图片 -------->|
   |                            |
   |                       2. 解码 base64
   |                            |
   |                       3. Vision OCR
   |                            |
   |<-- 4. 返回识别结果 --------|
   |                            |
   |-- 5. 填入输入框           |
```

### JavaScript Bridge

**Web → iOS (发送图片):**
```javascript
window.webkit.messageHandlers.ocrRecognize.postMessage({
  image: "data:image/png;base64,iVBORw0KGgo..."
});
```

**iOS → Web (返回结果):**
```javascript
window.handleOCRResult('识别到的文字\n可能有多行');
```

## 📝 代码说明

### AppDelegate.swift
- 应用启动配置
- 创建导航控制器
- 设置导航栏样式

### ViewController.swift
- 创建和配置 WKWebView
- 注册 JavaScript Bridge
- 处理 WebView 导航和权限
- 支持 alert/confirm/prompt

### OCRHandler.swift
- 实现 `WKScriptMessageHandler` 协议
- 解码 base64 图片
- 调用 Vision Framework OCR
- 返回识别结果到 JS

## 🔍 调试

### 查看日志

在 Xcode 控制台中查看：
```
🚀 WDK 钱包已启动
📱 加载线上应用: https://i5am.github.io/xwallet
✅ 页面加载完成: https://i5am.github.io/xwallet/
📸 收到 OCR 识别请求
✅ 图片解码成功: 1920.0 x 1080.0
🔍 开始 OCR 识别...
📊 找到 5 个文本区域
  ✓ Hello World (置信度: 0.95)
✅ 识别完成，共 11 个字符
📤 发送结果到 JS: Hello World...
✅ JS 回调成功
```

### 调试 JavaScript Bridge

在 Safari 开发者工具中：
```javascript
// 1. Safari → 开发 → [模拟器名称] → [页面]
// 2. 在控制台测试
console.log(window.webkit.messageHandlers.ocrRecognize);
```

## ⚙️ 配置选项

### 修改加载地址

在 `ViewController.swift` 中：

```swift
// 线上地址
if let url = URL(string: "https://i5am.github.io/xwallet") {
    webView.load(URLRequest(url: url))
}

// 或本地文件
if let path = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www"),
   let url = URL(string: "file://\(path)") {
    webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
}
```

### OCR 识别参数

在 `OCRHandler.swift` 中：

```swift
// 识别精度
request.recognitionLevel = .accurate // .accurate 或 .fast

// 识别语言
request.recognitionLanguages = ["zh-Hans", "en-US"] // 中文、英文

// 语言纠正
request.usesLanguageCorrection = true // 启用或禁用
```

## 📦 发布

### 1. 签名和证书

在 Xcode 中配置：
- **Signing & Capabilities** → Team
- 选择开发者账号
- 启用 Automatic Signing

### 2. 构建

```bash
# Archive
Product → Archive

# 导出 IPA
Window → Organizer → Distribute App
```

### 3. 提交 App Store

按照 Apple 审核指南准备：
- 应用描述
- 截图和预览视频
- 隐私政策
- 权限说明

## 🔒 安全建议

1. **HTTPS Only**: 生产环境移除 `NSAllowsArbitraryLoads`
2. **输入验证**: 验证 JS 传入的数据格式
3. **权限最小化**: 只请求必要的权限
4. **本地处理**: OCR 识别在本地完成，不上传图片

## ❓ 常见问题

### Q: OCR 识别不准确？
A: 确保：
- 光线充足
- 文字清晰
- 避免反光
- 使用高精度模式 (`.accurate`)

### Q: JavaScript Bridge 无响应？
A: 检查：
- Handler 名称是否正确 (`ocrRecognize`)
- 是否正确注册到 `userContentController`
- 查看 Xcode 控制台日志

### Q: 相机权限被拒绝？
A: 
- 检查 `Info.plist` 中的权限说明
- 到设置中手动授权

### Q: 如何支持本地开发？
A: 
- 使用 `localhost` 地址
- 在 `Info.plist` 中添加本地域名例外

## 📚 相关资源

- [Vision Framework 文档](https://developer.apple.com/documentation/vision)
- [WKWebView 文档](https://developer.apple.com/documentation/webkit/wkwebview)
- [WDK 钱包文档](../docs/iOS_OCR_INTEGRATION.md)

## 🤝 贡献

如有问题或建议：
- 提交 Issue: https://github.com/i5am/xwallet/issues
- 查看开发日志: `docs/DEVELOPMENT_LOG.md`

## 📄 许可证

与主项目保持一致
