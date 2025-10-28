import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // 创建窗口
        window = UIWindow(frame: UIScreen.main.bounds)
        
        // 创建主视图控制器
        let viewController = ViewController()
        let navigationController = UINavigationController(rootViewController: viewController)
        
        // 设置导航栏外观
        setupNavigationBarAppearance()
        
        // 设置根视图控制器
        window?.rootViewController = navigationController
        window?.makeKeyAndVisible()
        
        print("🚀 WDK 钱包已启动")
        
        return true
    }
    
    private func setupNavigationBarAppearance() {
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.systemBlue
        appearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        appearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        UINavigationBar.appearance().tintColor = .white
    }
}
