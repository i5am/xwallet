import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tether.wdk.wallet',
  appName: 'Tether WDK Wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'http',  // 鸿蒙系统使用 http 更稳定
    hostname: 'localhost',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    loggingBehavior: 'debug'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,  // 鸿蒙系统立即显示
      backgroundColor: '#ffffff',  // 白色背景更安全
      showSpinner: false,
    }
  }
};

export default config;
