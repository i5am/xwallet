/**
 * 钱包类型枚举
 */
export enum WalletType {
  HOT = 'hot',           // 热钱包
  COLD = 'cold',         // 冷钱包
  WATCH_ONLY = 'watch'   // 观测钱包
}

/**
 * 区块链类型枚举
 */
export enum ChainType {
  BTC = 'bitcoin',
  ETH = 'ethereum'
}

/**
 * 网络类型
 */
export enum NetworkType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet'
}

/**
 * 钱包接口
 */
export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  chain: ChainType;
  network: NetworkType;
  
  // 地址信息
  address: string;
  
  // 密钥信息（加密存储）
  mnemonic?: string;     // 助记词（仅热钱包和冷钱包）
  privateKey?: string;   // 私钥（仅热钱包和冷钱包）
  publicKey?: string;    // 公钥（所有类型都有）
  
  // 余额信息
  balance?: Balance;
  
  // 热钱包自动转账配置
  autoTransferConfig?: AutoTransferConfig;
  
  // 元数据
  createdAt: number;
  updatedAt: number;
  isOnline: boolean;     // 冷钱包永远为 false
}

/**
 * 余额接口
 */
export interface Balance {
  native: string;        // 原生币余额 (BTC/ETH)
  tokens?: TokenBalance[]; // ERC20 代币余额
  fiat?: string;         // 法币估值（可选）
  lastUpdated: number;
}

/**
 * 代币余额
 */
export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  logoUrl?: string;
}

/**
 * 自动转账配置
 */
export interface AutoTransferConfig {
  enabled: boolean;
  threshold: string;           // 阈值（单位：BTC 或 ETH）
  targetAddress: string;       // 冷钱包地址
  minRetainAmount: string;     // 最小保留（用于 gas/fee）
  checkIntervalSeconds: number; // 检查间隔
  lastCheckTime?: number;
  lastTransferTime?: number;
}

/**
 * 交易接口
 */
export interface Transaction {
  id: string;
  walletId: string;
  chain: ChainType;
  txHash?: string;       // 交易哈希（已广播后才有）
  
  // 交易信息
  from: string;
  to: string;
  amount: string;
  fee: string;
  
  // 代币转账
  tokenAddress?: string;
  tokenSymbol?: string;
  
  // 状态
  status: TransactionStatus;
  timestamp: number;
  confirmations?: number;
  
  // 原始数据
  rawData?: string;      // 未签名交易或 PSBT
  signedData?: string;   // 已签名交易
}

/**
 * 交易状态
 */
export enum TransactionStatus {
  PENDING = 'pending',           // 待签名
  SIGNED = 'signed',             // 已签名待广播
  BROADCASTING = 'broadcasting', // 广播中
  CONFIRMING = 'confirming',     // 确认中
  CONFIRMED = 'confirmed',       // 已确认
  FAILED = 'failed'              // 失败
}

/**
 * 网络配置
 */
export interface NetworkConfig {
  chain: ChainType;
  network: NetworkType;
  rpcUrl: string;
  explorerUrl: string;
  nativeSymbol: string;
  nativeName: string;
}

/**
 * 应用设置
 */
export interface AppSettings {
  currency: string;      // 显示币种 (USD, CNY, etc.)
  language: string;      // 语言
  theme: 'light' | 'dark'; // 主题
  securityPin?: string;  // PIN 码（加密存储）
  autoLockMinutes: number; // 自动锁定时间
}
