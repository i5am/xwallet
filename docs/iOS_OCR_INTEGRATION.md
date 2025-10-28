# iOS 原生 OCR 集成文档

## 概述

本文档说明如何在 iOS App 中集成原生 Vision Framework OCR 功能，让 WebView 中的钱包应用可以调用 iOS 原生的文字识别能力。

## 架构

```
Web App (React)  ⟷  JavaScript Bridge  ⟷  iOS Native (Swift)
     |                                            |
     |-- 发送图片 base64                          |
     |                                            |-- Vision Framework OCR
     |                                            |
     |<-- 接收识别结果                            |
```

## iOS 端实现

### 1. 创建 OCR Handler

创建 `OCRHandler.swift` 文件：

```swift
import UIKit
import Vision
import WebKit

class OCRHandler: NSObject, WKScriptMessageHandler {
    weak var webView: WKWebView?
    
    init(webView: WKWebView) {
        self.webView = webView
        super.init()
    }
    
    // MARK: - WKScriptMessageHandler
    
    func userContentController(_ userContentController: WKUserContentController, 
                              didReceive message: WKScriptMessage) {
        guard message.name == "ocrRecognize",
              let body = message.body as? [String: Any],
              let imageBase64 = body["image"] as? String else {
            sendErrorToJS("无效的消息格式")
            return
        }
        
        // 解析 base64 图片
        guard let image = decodeBase64Image(imageBase64) else {
            sendErrorToJS("图片解码失败")
            return
        }
        
        // 执行 OCR 识别
        recognizeText(in: image)
    }
    
    // MARK: - Image Decoding
    
    private func decodeBase64Image(_ base64String: String) -> UIImage? {
        // 移除 "data:image/png;base64," 前缀
        let cleanedString = base64String.replacingOccurrences(
            of: "data:image/png;base64,", 
            with: ""
        )
        
        guard let imageData = Data(base64Encoded: cleanedString) else {
            return nil
        }
        
        return UIImage(data: imageData)
    }
    
    // MARK: - OCR Recognition
    
    private func recognizeText(in image: UIImage) {
        guard let cgImage = image.cgImage else {
            sendErrorToJS("图片转换失败")
            return
        }
        
        // 创建 Vision 请求
        let request = VNRecognizeTextRequest { [weak self] request, error in
            if let error = error {
                self?.sendErrorToJS("识别失败: \(error.localizedDescription)")
                return
            }
            
            self?.handleRecognitionResults(request.results)
        }
        
        // 配置识别参数
        request.recognitionLevel = .accurate // 高精度模式
        request.recognitionLanguages = ["zh-Hans", "en-US"] // 中英文
        request.usesLanguageCorrection = true // 启用语言纠正
        
        // 执行识别
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try handler.perform([request])
            } catch {
                self.sendErrorToJS("识别请求失败: \(error.localizedDescription)")
            }
        }
    }
    
    // MARK: - Results Handling
    
    private func handleRecognitionResults(_ results: [Any]?) {
        guard let observations = results as? [VNRecognizedTextObservation] else {
            sendErrorToJS("无识别结果")
            return
        }
        
        // 提取所有识别的文本
        var recognizedTexts: [String] = []
        
        for observation in observations {
            guard let topCandidate = observation.topCandidates(1).first else {
                continue
            }
            
            recognizedTexts.append(topCandidate.string)
        }
        
        if recognizedTexts.isEmpty {
            sendErrorToJS("未识别到文字")
            return
        }
        
        // 合并文本（按行）
        let finalText = recognizedTexts.joined(separator: "\n")
        
        // 发送结果到 JS
        sendResultToJS(finalText)
    }
    
    // MARK: - JavaScript Communication
    
    private func sendResultToJS(_ text: String) {
        let escapedText = text
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\n", with: "\\n")
        
        let javascript = "window.handleOCRResult('\(escapedText)');"
        
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(javascript) { _, error in
                if let error = error {
                    print("❌ JS 回调失败: \(error)")
                }
            }
        }
    }
    
    private func sendErrorToJS(_ errorMessage: String) {
        let javascript = "window.handleOCRResult('');"
        
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(javascript) { _, error in
                if let error = error {
                    print("❌ 错误回调失败: \(error)")
                }
            }
        }
        
        print("❌ OCR 错误: \(errorMessage)")
    }
}
```

### 2. 在 ViewController 中注册

在 `ViewController.swift` 中：

```swift
import UIKit
import WebKit

class ViewController: UIViewController {
    var webView: WKWebView!
    var ocrHandler: OCRHandler?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
    }
    
    private func setupWebView() {
        // 创建 WebView 配置
        let configuration = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        
        // 创建 WebView
        webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(webView)
        
        // 注册 OCR Handler
        ocrHandler = OCRHandler(webView: webView)
        contentController.add(ocrHandler!, name: "ocrRecognize")
        
        configuration.userContentController = contentController
        
        // 加载网页
        if let url = URL(string: "https://your-wallet-app.com") {
            webView.load(URLRequest(url: url))
        }
    }
    
    deinit {
        // 清理 message handler
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "ocrRecognize")
    }
}
```

### 3. Info.plist 配置

添加摄像头权限说明：

```xml
<key>NSCameraUsageDescription</key>
<string>钱包应用需要使用相机进行 OCR 文字识别</string>
```

## Web 端实现（已完成）

Web 端代码已经在 `src/App.tsx` 中实现，关键代码：

```typescript
// 方案 1: 检查是否在 iOS WebView 中，尝试调用原生 OCR
if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ocrRecognize) {
  const imageData = canvas.toDataURL('image/png');
  window.webkit.messageHandlers.ocrRecognize.postMessage({ image: imageData });
  
  // 等待原生回调
  window.handleOCRResult = (text: string) => {
    if (text && ocrCallback) {
      ocrCallback(text);
      closeOCR();
      alert(`✅ 识别成功！\n\n识别到 ${text.length} 个字符`);
    }
    setIsOCRProcessing(false);
  };
  
  return;
}
```

## 完整流程

### 1. 用户操作流程

```
1. 用户点击签名对话框的绿色 📷 OCR 按钮
   ↓
2. Web App 打开摄像头预览对话框
   ↓
3. 用户对准文字，点击"拍照识别"
   ↓
4. Web App 捕获图片，转换为 base64
   ↓
5. 调用 window.webkit.messageHandlers.ocrRecognize.postMessage()
   ↓
6. iOS 接收消息，解码图片
   ↓
7. Vision Framework 执行 OCR 识别
   ↓
8. iOS 调用 window.handleOCRResult() 返回结果
   ↓
9. Web App 接收结果，填入输入框
   ↓
10. 用户确认签名
```

### 2. 数据传输格式

**Web → iOS (发送图片):**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**iOS → Web (返回结果):**
```javascript
window.handleOCRResult('识别到的文字内容\n可能有多行');
```

## 测试

### 1. 测试 JavaScript Bridge

在 Web 控制台中测试：

```javascript
// 检查 bridge 是否存在
console.log(window.webkit?.messageHandlers?.ocrRecognize);

// 测试发送消息
if (window.webkit?.messageHandlers?.ocrRecognize) {
  window.webkit.messageHandlers.ocrRecognize.postMessage({
    image: "data:image/png;base64,test"
  });
}
```

### 2. 测试 iOS 回调

在 iOS 中测试回调：

```swift
webView.evaluateJavaScript("window.handleOCRResult('测试文字')") { _, error in
    if let error = error {
        print("回调失败: \(error)")
    } else {
        print("回调成功")
    }
}
```

## 性能优化

### 1. 图片压缩

在 Web 端发送前压缩图片：

```typescript
// 在 captureAndRecognize 函数中
canvas.width = Math.min(video.videoWidth, 1920);
canvas.height = Math.min(video.videoHeight, 1080);

// 使用较低质量以减少传输大小
canvas.toBlob((blob) => {
  // 使用 blob
}, 'image/jpeg', 0.8); // JPEG 格式，80% 质量
```

### 2. 识别区域裁剪

只识别绿色框内的区域：

```typescript
// 计算裁剪区域
const cropX = (canvas.width - 300) / 2;
const cropY = (canvas.height - 200) / 2;
const cropCanvas = document.createElement('canvas');
cropCanvas.width = 300;
cropCanvas.height = 200;
const cropCtx = cropCanvas.getContext('2d');
cropCtx?.drawImage(canvas, cropX, cropY, 300, 200, 0, 0, 300, 200);
```

### 3. 异步处理

iOS 端使用后台队列处理：

```swift
DispatchQueue.global(qos: .userInitiated).async {
    // OCR 识别
    try handler.perform([request])
}
```

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `window.webkit is undefined` | 不在 iOS WebView 环境 | 降级到其他 OCR 方案 |
| `图片解码失败` | base64 格式错误 | 检查 base64 字符串格式 |
| `未识别到文字` | 图片质量差或无文字 | 提示用户重新拍摄 |
| `识别请求失败` | Vision Framework 错误 | 检查 iOS 版本和权限 |

### 调试日志

在 iOS 中启用详细日志：

```swift
// 在 recognizeText 方法中添加
print("📸 开始 OCR 识别")
print("📊 图片尺寸: \(cgImage.width) x \(cgImage.height)")

// 在回调中添加
print("✅ 识别完成，找到 \(recognizedTexts.count) 段文字")
```

## 最低系统要求

- **iOS**: 13.0+
- **Safari**: 支持 WKWebView
- **Vision Framework**: iOS 13.0+

## 替代方案

如果无法使用 iOS 原生集成：

1. **浏览器原生 API**: 已自动尝试 TextDetector API
2. **手动输入**: 用户可以手动输入文字
3. **第三方 OCR API**: 调用云端 OCR 服务（需要网络）

## 安全考虑

1. **图片数据**: 图片仅在本地处理，不上传到服务器
2. **识别结果**: 用户需要确认识别结果后再签名
3. **权限管理**: 需要用户明确授权相机权限

## 相关文件

- Web 端实现: `src/App.tsx` (Line ~850-950)
- iOS Swift 代码: 本文档中的示例
- OCR 对话框 UI: `src/App.tsx` (Line ~3920)

## 联系支持

如有问题，请查看：
- GitHub Issues: https://github.com/i5am/xwallet/issues
- 开发日志: `docs/DEVELOPMENT_LOG.md`
