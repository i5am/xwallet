import UIKit
import Vision
import WebKit

/// OCR Handler - 处理 WebView 中的 OCR 识别请求
/// 使用 iOS Vision Framework 进行高精度文字识别
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
        
        print("📸 收到 OCR 识别请求")
        
        // 解析 base64 图片
        guard let image = decodeBase64Image(imageBase64) else {
            sendErrorToJS("图片解码失败")
            return
        }
        
        print("✅ 图片解码成功: \(image.size.width) x \(image.size.height)")
        
        // 执行 OCR 识别
        recognizeText(in: image)
    }
    
    // MARK: - Image Decoding
    
    private func decodeBase64Image(_ base64String: String) -> UIImage? {
        // 移除 "data:image/png;base64," 或 "data:image/jpeg;base64," 前缀
        var cleanedString = base64String
        if let range = base64String.range(of: "base64,") {
            cleanedString = String(base64String[range.upperBound...])
        }
        
        guard let imageData = Data(base64Encoded: cleanedString,
                                   options: .ignoreUnknownCharacters) else {
            print("❌ Base64 解码失败")
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
        
        print("🔍 开始 OCR 识别...")
        
        // 创建 Vision 请求
        let request = VNRecognizeTextRequest { [weak self] request, error in
            if let error = error {
                print("❌ 识别错误: \(error.localizedDescription)")
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
                print("❌ 识别请求失败: \(error.localizedDescription)")
                self.sendErrorToJS("识别请求失败: \(error.localizedDescription)")
            }
        }
    }
    
    // MARK: - Results Handling
    
    private func handleRecognitionResults(_ results: [Any]?) {
        guard let observations = results as? [VNRecognizedTextObservation] else {
            print("⚠️ 无识别结果")
            sendErrorToJS("无识别结果")
            return
        }
        
        print("📊 找到 \(observations.count) 个文本区域")
        
        // 提取所有识别的文本
        var recognizedTexts: [String] = []
        
        for observation in observations {
            guard let topCandidate = observation.topCandidates(1).first else {
                continue
            }
            
            print("  ✓ \(topCandidate.string) (置信度: \(String(format: "%.2f", topCandidate.confidence)))")
            recognizedTexts.append(topCandidate.string)
        }
        
        if recognizedTexts.isEmpty {
            print("❌ 未识别到文字")
            sendErrorToJS("未识别到文字")
            return
        }
        
        // 合并文本（按行）
        let finalText = recognizedTexts.joined(separator: "\n")
        print("✅ 识别完成，共 \(finalText.count) 个字符")
        
        // 发送结果到 JS
        sendResultToJS(finalText)
    }
    
    // MARK: - JavaScript Communication
    
    private func sendResultToJS(_ text: String) {
        // 转义特殊字符
        let escapedText = text
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\"", with: "\\\"")
            .replacingOccurrences(of: "\n", with: "\\n")
            .replacingOccurrences(of: "\r", with: "\\r")
        
        let javascript = "if (typeof window.handleOCRResult === 'function') { window.handleOCRResult('\(escapedText)'); }"
        
        print("📤 发送结果到 JS: \(text.prefix(50))...")
        
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(javascript) { result, error in
                if let error = error {
                    print("❌ JS 回调失败: \(error)")
                } else {
                    print("✅ JS 回调成功")
                }
            }
        }
    }
    
    private func sendErrorToJS(_ errorMessage: String) {
        // 发送空字符串表示失败
        let javascript = "if (typeof window.handleOCRResult === 'function') { window.handleOCRResult(''); }"
        
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

// MARK: - Extension for Confidence Level

extension VNRecognizedText {
    /// 获取格式化的置信度字符串
    var confidenceDescription: String {
        String(format: "%.1f%%", confidence * 100)
    }
}
