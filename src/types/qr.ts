/**
 * 二维码类型枚举
 */
export enum QRCodeType {
  // BTC
  BTC_ADDRESS = 'btc_address',
  BTC_UNSIGNED_TX = 'btc_unsigned_tx',
  BTC_SIGNED_TX = 'btc_signed_tx',
  BTC_PSBT = 'btc_psbt',
  
  // ETH
  ETH_ADDRESS = 'eth_address',
  ETH_UNSIGNED_TX = 'eth_unsigned_tx',
  ETH_SIGNED_TX = 'eth_signed_tx',
  
  // 通用
  MESSAGE_TO_SIGN = 'message_to_sign',
  SIGNED_MESSAGE = 'signed_message',
}

/**
 * 二维码数据基础接口
 */
export interface QRCodeData {
  version: string;           // 协议版本 "1.0"
  type: QRCodeType;
  timestamp: number;
  data: any;
  signature?: string;        // 可选的数据签名（防篡改）
}

/**
 * BTC 未签名交易
 */
export interface BTCUnsignedTx {
  type: QRCodeType.BTC_UNSIGNED_TX;
  version: '1.0';
  network: 'mainnet' | 'testnet';
  psbt: string;              // Base64 编码的 PSBT
  metadata: {
    from: string;
    to: string;
    amount: number;          // satoshis
    fee: number;             // satoshis
    feeRate: number;         // sat/vB
  };
}

/**
 * BTC 已签名交易
 */
export interface BTCSignedTx {
  type: QRCodeType.BTC_SIGNED_TX;
  version: '1.0';
  network: 'mainnet' | 'testnet';
  signedTx: string;          // 十六进制编码的已签名交易
  txid: string;
  metadata: {
    from: string;
    to: string;
    amount: number;
    fee: number;
  };
}

/**
 * ETH 未签名交易
 */
export interface ETHUnsignedTx {
  type: QRCodeType.ETH_UNSIGNED_TX;
  version: '1.0';
  network: 'mainnet' | 'testnet';
  chainId: number;
  transaction: {
    to: string;
    value: string;           // Wei
    gasLimit: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce: number;
    data: string;
  };
  metadata: {
    from: string;
    amountETH: string;
    estimatedGasETH: string;
    tokenInfo?: {
      address: string;
      symbol: string;
      amount: string;
    };
  };
}

/**
 * ETH 已签名交易
 */
export interface ETHSignedTx {
  type: QRCodeType.ETH_SIGNED_TX;
  version: '1.0';
  network: 'mainnet' | 'testnet';
  signedTx: string;          // 十六进制编码的已签名交易
  txHash: string;
  metadata: {
    from: string;
    to: string;
    amount: string;
  };
}
