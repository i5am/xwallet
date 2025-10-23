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
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false
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
