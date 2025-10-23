/**
 * Flightspark 协议类型定义
 * 用于 Lightning Network 支付和 AI 服务费用
 */

export interface FlightsparkPayment {
  id: string;
  amount: string; // satoshis
  recipient: string; // Lightning address or node ID
  memo?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}

export interface FlightsparkInvoice {
  paymentRequest: string; // Lightning invoice (BOLT11)
  amount: string; // satoshis
  description: string;
  expiresAt: number;
  paymentHash: string;
}

export interface AIServicePayment {
  serviceId: string;
  serviceName: string;
  aiWalletAddress: string; // Lightning address
  amount: string; // satoshis
  requestType: 'chat' | 'image' | 'voice' | 'custom';
  metadata?: Record<string, any>;
}

export interface FlightsparkConfig {
  apiEndpoint: string;
  network: 'mainnet' | 'testnet';
  defaultFee?: string; // satoshis
}
