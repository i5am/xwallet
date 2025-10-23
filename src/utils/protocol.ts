/**
 * WDK 通信协议工具类
 * 用于生成和解析热钱包与冷钱包之间的标准消息
 */

import { ChainType, NetworkType } from '../types';

export const PROTOCOL_VERSION = '1.0.0';
export const PROTOCOL_NAME = 'WDK';

// 消息类型枚举
export enum MessageType {
  // 交易相关
  SIGN_TRANSACTION_REQUEST = 'SIGN_TRANSACTION_REQUEST',
  SIGN_TRANSACTION_RESPONSE = 'SIGN_TRANSACTION_RESPONSE',
  
  // 消息签名
  SIGN_MESSAGE_REQUEST = 'SIGN_MESSAGE_REQUEST',
  SIGN_MESSAGE_RESPONSE = 'SIGN_MESSAGE_RESPONSE',
  
  // 授权
  AUTHORIZATION_REQUEST = 'AUTHORIZATION_REQUEST',
  AUTHORIZATION_RESPONSE = 'AUTHORIZATION_RESPONSE',
  
  // 地址信息
  ADDRESS_INFO = 'ADDRESS_INFO',
  
  // PSBT (Bitcoin)
  SIGN_PSBT_REQUEST = 'SIGN_PSBT_REQUEST',
  SIGN_PSBT_RESPONSE = 'SIGN_PSBT_RESPONSE',
  
  // 错误
  ERROR_RESPONSE = 'ERROR_RESPONSE',
}

// 错误代码
export enum ErrorCode {
  INVALID_PROTOCOL = 'INVALID_PROTOCOL',
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  INVALID_CHAIN = 'INVALID_CHAIN',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  USER_REJECTED = 'USER_REJECTED',
  TIMEOUT = 'TIMEOUT',
  SIGNATURE_FAILED = 'SIGNATURE_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 基础协议消息接口
export interface ProtocolMessage<T = any> {
  protocol: string;
  version: string;
  type: MessageType;
  timestamp: number;
  data: T;
}

// 转账交易请求数据
export interface TransactionRequestData {
  txId: string;
  chain: ChainType;
  network: NetworkType;
  from: string;
  to: string;
  amount: string;
  fee: string;
  nonce?: string;
  gasLimit?: string;
  gasPrice?: string;
  memo?: string;
}

// 转账交易响应数据
export interface TransactionResponseData {
  txId: string;
  signature: string;
  publicKey: string;
  signedTx?: string;
}

// 消息签名请求数据
export interface MessageSignRequestData {
  messageId: string;
  chain: ChainType;
  address: string;
  message: string;
  encoding?: 'utf8' | 'hex' | 'base64';
}

// 消息签名响应数据
export interface MessageSignResponseData {
  messageId: string;
  signature: string;
  publicKey: string;
}

// 授权请求数据
export interface AuthorizationRequestData {
  requestId: string;
  dapp: string;
  dappUrl: string;
  chain: ChainType;
  address: string;
  permissions: string[];
  expireTime: number;
}

// 授权响应数据
export interface AuthorizationResponseData {
  requestId: string;
  approved: boolean;
  signature: string;
  publicKey: string;
}

// 地址信息数据
export interface AddressInfoData {
  chain: ChainType;
  network: NetworkType;
  address: string;
  publicKey?: string;
  label?: string;
}

// 错误响应数据
export interface ErrorResponseData {
  requestId: string;
  errorCode: ErrorCode;
  errorMessage: string;
  details?: string;
}

/**
 * 协议工具类
 */
export class ProtocolUtils {
  /**
   * 创建基础协议消息
   */
  private static createBaseMessage<T>(type: MessageType, data: T): ProtocolMessage<T> {
    return {
      protocol: PROTOCOL_NAME,
      version: PROTOCOL_VERSION,
      type,
      timestamp: Date.now(),
      data,
    };
  }

  /**
   * 创建转账交易签名请求
   */
  static createTransactionRequest(params: {
    from: string;
    to: string;
    amount: string;
    fee: string;
    chain: ChainType;
    network: NetworkType;
    memo?: string;
    nonce?: string;
    gasLimit?: string;
    gasPrice?: string;
  }): ProtocolMessage<TransactionRequestData> {
    const data: TransactionRequestData = {
      txId: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      chain: params.chain,
      network: params.network,
      from: params.from,
      to: params.to,
      amount: params.amount,
      fee: params.fee,
      memo: params.memo,
      nonce: params.nonce,
      gasLimit: params.gasLimit,
      gasPrice: params.gasPrice,
    };

    return this.createBaseMessage(MessageType.SIGN_TRANSACTION_REQUEST, data);
  }

  /**
   * 创建转账交易签名响应
   */
  static createTransactionResponse(params: {
    txId: string;
    signature: string;
    publicKey: string;
    signedTx?: string;
  }): ProtocolMessage<TransactionResponseData> {
    return this.createBaseMessage(MessageType.SIGN_TRANSACTION_RESPONSE, params);
  }

  /**
   * 创建消息签名请求
   */
  static createMessageSignRequest(params: {
    message: string;
    chain: ChainType;
    address: string;
    encoding?: 'utf8' | 'hex' | 'base64';
  }): ProtocolMessage<MessageSignRequestData> {
    const data: MessageSignRequestData = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      chain: params.chain,
      address: params.address,
      message: params.message,
      encoding: params.encoding || 'utf8',
    };

    return this.createBaseMessage(MessageType.SIGN_MESSAGE_REQUEST, data);
  }

  /**
   * 创建消息签名响应
   */
  static createMessageSignResponse(params: {
    messageId: string;
    signature: string;
    publicKey: string;
  }): ProtocolMessage<MessageSignResponseData> {
    return this.createBaseMessage(MessageType.SIGN_MESSAGE_RESPONSE, params);
  }

  /**
   * 创建授权请求
   */
  static createAuthorizationRequest(params: {
    dapp: string;
    dappUrl: string;
    chain: ChainType;
    address: string;
    permissions: string[];
    expireTime?: number;
  }): ProtocolMessage<AuthorizationRequestData> {
    const data: AuthorizationRequestData = {
      requestId: `auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      dapp: params.dapp,
      dappUrl: params.dappUrl,
      chain: params.chain,
      address: params.address,
      permissions: params.permissions,
      expireTime: params.expireTime || Date.now() + 5 * 60 * 1000, // 默认5分钟
    };

    return this.createBaseMessage(MessageType.AUTHORIZATION_REQUEST, data);
  }

  /**
   * 创建授权响应
   */
  static createAuthorizationResponse(params: {
    requestId: string;
    approved: boolean;
    signature: string;
    publicKey: string;
  }): ProtocolMessage<AuthorizationResponseData> {
    return this.createBaseMessage(MessageType.AUTHORIZATION_RESPONSE, params);
  }

  /**
   * 创建地址信息
   */
  static createAddressInfo(params: {
    chain: ChainType;
    network: NetworkType;
    address: string;
    publicKey?: string;
    label?: string;
  }): ProtocolMessage<AddressInfoData> {
    return this.createBaseMessage(MessageType.ADDRESS_INFO, params);
  }

  /**
   * 创建错误响应
   */
  static createErrorResponse(params: {
    requestId: string;
    errorCode: ErrorCode;
    errorMessage: string;
    details?: string;
  }): ProtocolMessage<ErrorResponseData> {
    return this.createBaseMessage(MessageType.ERROR_RESPONSE, params);
  }

  /**
   * 解析协议消息
   */
  static parseMessage(jsonString: string): ProtocolMessage | null {
    try {
      const message = JSON.parse(jsonString);
      
      // 验证基础字段
      if (!message.protocol || !message.version || !message.type || !message.data) {
        console.error('协议消息格式错误：缺少必需字段');
        return null;
      }

      return message as ProtocolMessage;
    } catch (error) {
      console.error('解析协议消息失败:', error);
      return null;
    }
  }

  /**
   * 验证协议消息
   */
  static validateMessage(message: ProtocolMessage): {
    valid: boolean;
    error?: string;
  } {
    // 验证协议名称
    if (message.protocol !== PROTOCOL_NAME) {
      return {
        valid: false,
        error: `不支持的协议: ${message.protocol}`,
      };
    }

    // 验证版本 (简单的主版本检查)
    const currentMajor = PROTOCOL_VERSION.split('.')[0];
    const messageMajor = message.version.split('.')[0];
    if (currentMajor !== messageMajor) {
      return {
        valid: false,
        error: `不兼容的协议版本: ${message.version}`,
      };
    }

    // 验证时间戳 (±5分钟)
    const now = Date.now();
    const timeDiff = Math.abs(now - message.timestamp);
    const fiveMinutes = 5 * 60 * 1000;
    if (timeDiff > fiveMinutes) {
      return {
        valid: false,
        error: '消息已过期或时间戳无效',
      };
    }

    return { valid: true };
  }

  /**
   * 序列化消息为 JSON 字符串
   */
  static serializeMessage(message: ProtocolMessage): string {
    return JSON.stringify(message, null, 0); // 压缩格式，减少二维码大小
  }

  /**
   * 美化序列化（用于显示）
   */
  static serializeMessagePretty(message: ProtocolMessage): string {
    return JSON.stringify(message, null, 2);
  }

  /**
   * 检查消息是否为请求类型
   */
  static isRequestMessage(type: MessageType): boolean {
    return type.endsWith('_REQUEST');
  }

  /**
   * 检查消息是否为响应类型
   */
  static isResponseMessage(type: MessageType): boolean {
    return type.endsWith('_RESPONSE');
  }

  /**
   * 获取对应的响应类型
   */
  static getResponseType(requestType: MessageType): MessageType | null {
    const responseTypeMap: Record<string, MessageType> = {
      [MessageType.SIGN_TRANSACTION_REQUEST]: MessageType.SIGN_TRANSACTION_RESPONSE,
      [MessageType.SIGN_MESSAGE_REQUEST]: MessageType.SIGN_MESSAGE_RESPONSE,
      [MessageType.AUTHORIZATION_REQUEST]: MessageType.AUTHORIZATION_RESPONSE,
      [MessageType.SIGN_PSBT_REQUEST]: MessageType.SIGN_PSBT_RESPONSE,
    };

    return responseTypeMap[requestType] || null;
  }
}
