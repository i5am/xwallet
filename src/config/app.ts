/**
 * 应用配置
 */
export const APP_CONFIG = {
  name: 'Tether WDK Wallet',
  version: '1.0.0',
  
  // 默认设置
  defaultCurrency: 'USD',
  defaultLanguage: 'zh-CN',
  defaultTheme: 'light' as const,
  defaultAutoLockMinutes: 5,
  
  // 热钱包默认配置
  defaultAutoTransferConfig: {
    enabled: false,
    threshold: '0.1',        // 0.1 BTC / ETH
    minRetainAmount: '0.01', // 0.01 BTC / ETH (用于手续费)
    checkIntervalSeconds: 300 // 5 分钟检查一次
  },
  
  // 安全配置
  minPinLength: 4,
  maxPinLength: 8,
  
  // 交易配置
  defaultGasLimit: 21000,
  defaultBTCFeeRate: 10,    // sat/vB
  
  // 存储键
  storageKeys: {
    wallets: 'wdk_wallets',
    settings: 'wdk_settings',
    transactions: 'wdk_transactions',
    encryptionKey: 'wdk_encryption_key'
  }
};
