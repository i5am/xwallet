/**
 * API 配置
 */

// 检测运行环境
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor;
};

// 检测是否是 iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  return cap && cap.getPlatform() === 'ios';
};

// 获取存储的网络环境设置
const getNetworkEnvironment = () => {
  if (typeof localStorage === 'undefined') return 'local';
  return localStorage.getItem('network_environment') || 'local';
};

// 根据环境获取 API 基础 URL
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL;
  if (envURL) return envURL;
  
  // 如果是移动端，使用生产环境的 URL 或配置的服务器地址
  if (isMobile()) {
    const savedURL = typeof localStorage !== 'undefined' ? localStorage.getItem('api_base_url') : null;
    return savedURL || 'http://192.168.1.74:3000'; // 默认局域网地址
  }
  
  return 'http://localhost:3000';
};

// 根据环境获取 WebSocket URL
const getWsURL = () => {
  const envURL = import.meta.env.VITE_WS_URL;
  if (envURL) return envURL;
  
  if (isMobile()) {
    const savedURL = typeof localStorage !== 'undefined' ? localStorage.getItem('ws_url') : null;
    return savedURL || 'ws://192.168.1.74:3001';
  }
  
  return 'ws://localhost:3001';
};

// 根据环境获取区块链 RPC URL
const getEthRpcUrl = () => {
  const envURL = import.meta.env.VITE_ETH_RPC_URL;
  if (envURL) return envURL;
  
  if (isMobile()) {
    const savedURL = typeof localStorage !== 'undefined' ? localStorage.getItem('eth_rpc_url') : null;
    return savedURL || 'http://192.168.1.74:8545';
  }
  
  return 'http://localhost:8545';
};

// 从环境变量读取配置，如果没有则使用默认值
export const API_CONFIG = {
  // 后端 API 基础 URL
  baseURL: getBaseURL(),
  
  // WebSocket URL
  wsURL: getWsURL(),
  
  // 区块链 RPC URL
  ethRpcUrl: getEthRpcUrl(),
  
  // 链 ID
  chainId: import.meta.env.VITE_ETH_CHAIN_ID || '31337',
  
  // 运行环境信息
  isMobile: isMobile(),
  isIOS: isIOS(),
  networkEnvironment: getNetworkEnvironment(),
  
  // 智能合约地址
  contracts: {
    registry: import.meta.env.VITE_CRVA_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    committee: import.meta.env.VITE_CRVA_COMMITTEE_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    threshold: import.meta.env.VITE_CRVA_THRESHOLD_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    nodeRegistry: import.meta.env.VITE_NODE_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
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
