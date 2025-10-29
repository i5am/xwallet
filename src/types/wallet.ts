/**
 * 钱包类型枚举
 */
export enum WalletType {
  HOT = 'hot',           // 热钱包
  COLD = 'cold',         // 冷钱包
  WATCH_ONLY = 'watch',  // 观测钱包
  MULTISIG = 'multisig'  // DeepSafe 多签钱包
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
  
  // 多签配置（仅多签钱包）
  multisigConfig?: MultisigConfig;
  
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

/**
 * DeepSafe 多签配置
 */
export interface MultisigConfig {
  m: number;                    // 需要的最少签名数
  n: number;                    // 总签名者数量
  signers: MultisigSigner[];    // 签名者列表
  script?: string;              // 多签脚本（BTC）
  contractAddress?: string;     // 智能合约地址（ETH）
  createdBy: string;            // 创建者地址
  createdAt: number;            // 创建时间
}

/**
 * 多签签名者
 */
export interface MultisigSigner {
  id: string;                   // 签名者ID
  name: string;                 // 签名者名称/备注
  address: string;              // 地址
  publicKey: string;            // 公钥
  isMe: boolean;                // 是否是自己
  status: SignerStatus;         // 状态
  addedAt: number;              // 添加时间
  addedBy: string;              // 添加者
}

/**
 * 签名者状态
 */
export enum SignerStatus {
  ACTIVE = 'active',            // 活跃
  PENDING = 'pending',          // 待确认
  REVOKED = 'revoked'           // 已撤销
}

/**
 * 多签交易提案
 */
export interface MultisigProposal {
  id: string;                   // 提案ID
  walletId: string;             // 多签钱包ID
  chain: ChainType;             // 链类型
  network: NetworkType;         // 网络类型
  
  // 交易信息
  to: string;                   // 收款地址
  amount: string;               // 金额
  fee: string;                  // 手续费
  memo?: string;                // 备注
  data?: string;                // 合约调用数据（ETH）
  
  // 提案状态
  status: ProposalStatus;
  createdBy: string;            // 发起者地址
  createdAt: number;            // 创建时间
  expiresAt: number;            // 过期时间
  
  // 签名信息
  signatures: MultisigSignature[]; // 签名列表
  requiredSignatures: number;   // 需要的签名数
  
  // 交易数据
  rawTx: string;                // 原始交易
  signedTx?: string;            // 完整签名的交易
  txHash?: string;              // 交易哈希（已广播后）
  
  // 元数据
  broadcastedAt?: number;       // 广播时间
  confirmedAt?: number;         // 确认时间
  rejectedBy?: string[];        // 拒绝者列表
}

/**
 * 提案状态
 */
export enum ProposalStatus {
  PENDING = 'pending',          // 待签名
  SIGNING = 'signing',          // 签名中
  READY = 'ready',              // 签名完成，可广播
  BROADCASTED = 'broadcasted',  // 已广播
  CONFIRMED = 'confirmed',      // 已确认
  REJECTED = 'rejected',        // 已拒绝
  EXPIRED = 'expired',          // 已过期
  FAILED = 'failed'             // 失败
}

/**
 * 多签签名
 */
export interface MultisigSignature {
  signer: string;               // 签名者地址
  publicKey: string;            // 公钥
  signature: string;            // 签名数据
  signedAt: number;             // 签名时间
  version: string;              // 签名版本
}

/**
 * 多签钱包创建参数
 */
export interface CreateMultisigParams {
  name: string;                 // 钱包名称
  chain: ChainType;             // 链类型
  network: NetworkType;         // 网络类型
  m: number;                    // 需要的签名数
  signers: {
    name: string;
    publicKey: string;
    address: string;
    isMe: boolean;
  }[];
}
