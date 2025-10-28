import UIKit
import WebKit

/// 主视图控制器 - 集成 WKWebView 和 OCR 功能
class ViewController: UIViewController {
    
    // MARK: - Properties
    
    var webView: WKWebView!
    var ocrHandler: OCRHandler?
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        setupNavigationBar()
    }
    
    // MARK: - Setup
    
    private func setupWebView() {
        // 创建 WebView 配置
        let configuration = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        
        // 注册 OCR Handler
        ocrHandler = OCRHandler(webView: nil) // 先创建 handler
        contentController.add(ocrHandler!, name: "ocrRecognize")
        
        configuration.userContentController = contentController
        
        // 允许内联播放媒体（摄像头预览需要）
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // 创建 WebView
        webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        webView.uiDelegate = self
        
        // 更新 handler 的 webView 引用
        ocrHandler?.webView = webView
        
        view.addSubview(webView)
        
        // 加载网页
        loadWebApp()
    }
    
    private func setupNavigationBar() {
        title = "WDK 钱包"
        
        // 添加刷新按钮
        let refreshButton = UIBarButtonItem(
            barButtonSystemItem: .refresh,
            target: self,
            action: #selector(refreshWebView)
        )
        navigationItem.rightBarButtonItem = refreshButton
    }
    
    private func loadWebApp() {
        // 方案 1: 加载线上地址
        if let url = URL(string: "https://i5am.github.io/xwallet") {
            let request = URLRequest(url: url)
            webView.load(request)
            print("📱 加载线上应用: \(url)")
        }
        
        // 方案 2: 加载本地文件（用于开发调试）
        // if let path = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www"),
        //    let url = URL(string: "file://\(path)") {
        //     webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        //     print("📱 加载本地应用: \(path)")
        // }
    }
    
    // MARK: - Actions
    
    @objc private func refreshWebView() {
        webView.reload()
    }
    
    // MARK: - Cleanup
    
    deinit {
        // 清理 message handler
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "ocrRecognize")
        print("🧹 清理 OCR Handler")
    }
}

// MARK: - WKNavigationDelegate

extension ViewController: WKNavigationDelegate {
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("✅ 页面加载完成: \(webView.url?.absoluteString ?? "")")
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("❌ 页面加载失败: \(error.localizedDescription)")
        showErrorAlert(message: "页面加载失败: \(error.localizedDescription)")
    }
    
    func webView(_ webView: WKWebView, 
                 didFailProvisionalNavigation navigation: WKNavigation!, 
                 withError error: Error) {
        print("❌ 页面加载失败: \(error.localizedDescription)")
        showErrorAlert(message: "无法连接到服务器，请检查网络连接")
    }
}

// MARK: - WKUIDelegate

extension ViewController: WKUIDelegate {
    
    // 处理 JavaScript alert()
    func webView(_ webView: WKWebView, 
                 runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(
            title: "提示",
            message: message,
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler()
        })
        present(alert, animated: true)
    }
    
    // 处理 JavaScript confirm()
    func webView(_ webView: WKWebView,
                 runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(
            title: "确认",
            message: message,
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in
            completionHandler(false)
        })
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler(true)
        })
        present(alert, animated: true)
    }
    
    // 处理 JavaScript prompt()
    func webView(_ webView: WKWebView,
                 runJavaScriptTextInputPanelWithPrompt prompt: String,
                 defaultText: String?,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        let alert = UIAlertController(
            title: "输入",
            message: prompt,
            preferredStyle: .alert
        )
        alert.addTextField { textField in
            textField.text = defaultText
        }
        alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in
            completionHandler(nil)
        })
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler(alert.textFields?.first?.text)
        })
        present(alert, animated: true)
    }
    
    // 处理摄像头/相册权限请求
    func webView(_ webView: WKWebView,
                 requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                 initiatedByFrame frame: WKFrameInfo,
                 type: WKMediaCaptureType,
                 decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        // 自动授权摄像头权限（用于 OCR 拍照）
        decisionHandler(.grant)
        print("✅ 已授权摄像头权限")
    }
}

// MARK: - Helper Methods

extension ViewController {
    
    private func showErrorAlert(message: String) {
        let alert = UIAlertController(
            title: "错误",
            message: message,
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "确定", style: .default))
        present(alert, animated: true)
    }
}
