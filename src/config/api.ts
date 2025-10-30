/**
 * API 配置
 */

// 从环境变量读取配置，如果没有则使用默认值
export const API_CONFIG = {
  // 后端 API 基础 URL
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  
  // WebSocket URL
  wsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  
  // 区块链 RPC URL
  ethRpcUrl: import.meta.env.VITE_ETH_RPC_URL || 'http://localhost:8545',
  
  // 链 ID
  chainId: import.meta.env.VITE_ETH_CHAIN_ID || '31337',
  
  // 智能合约地址
  contracts: {
    registry: import.meta.env.VITE_CRVA_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    committee: import.meta.env.VITE_CRVA_COMMITTEE_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    threshold: import.meta.env.VITE_CRVA_THRESHOLD_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
  },
  
  // CRVA 配置
  crva: {
    enabled: import.meta.env.VITE_CRVA_ENABLED === 'true' || true,
    minVerifiers: parseInt(import.meta.env.VITE_CRVA_MIN_VERIFIERS || '3', 10)
  },
  
  // 开发模式
  devMode: import.meta.env.VITE_DEV_MODE === 'true',
  debug: import.meta.env.VITE_DEBUG === 'true'
};

// API 端点
export const API_ENDPOINTS = {
  // 节点相关
  nodes: '/api/nodes',
  nodeRegister: '/api/nodes/register',
  nodeStatus: (nodeId: string) => `/api/nodes/${nodeId}`,
  
  // 交易相关
  transactions: '/api/transactions',
  transactionCreate: '/api/transactions',
  transactionStatus: (txId: string) => `/api/transactions/${txId}`,
  transactionSign: (txId: string) => `/api/transactions/${txId}/sign`,
  
  // 委员会相关
  committeeCurrent: '/api/committee/current',
  committeeHistory: '/api/committee/history',
  committeeVerify: '/api/committee/verify',
  
  // 健康检查
  health: '/health'
};

/**
 * 创建完整的 API URL
 */
export function createApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseURL}${endpoint}`;
}

/**
 * 创建 WebSocket URL
 */
export function createWsUrl(path: string = ''): string {
  return `${API_CONFIG.wsURL}${path}`;
}

/**
 * 获取智能合约地址
 */
export function getContractAddress(contractName: 'registry' | 'committee' | 'threshold'): string {
  return API_CONFIG.contracts[contractName];
}

/**
 * 日志工具
 */
export const apiLogger = {
  info: (message: string, ...args: any[]) => {
    if (API_CONFIG.debug) {
      console.log(`[API] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[API ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[API WARN] ${message}`, ...args);
  }
};
