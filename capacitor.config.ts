import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ex1.x1wallet',  // 与 Xcode 项目保持一致
  appName: 'x1wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    iosScheme: 'capacitor',  // iOS 使用 capacitor scheme
    hostname: 'localhost',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    loggingBehavior: 'debug'
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    limitsNavigationsToAppBoundDomains: false  // 允许加载本地资源
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffff',
      showSpinner: false,
    }
  }
};

export default config;
