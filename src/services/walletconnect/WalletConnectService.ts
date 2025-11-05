/**
 * WalletConnect 服务
 * 实现 WalletConnect v2 协议，让热钱包能够连接 DApp
 */

import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { ethers } from 'ethers';
import { ChainType, Wallet, WalletType } from '../../types/wallet';

// WalletConnect 项目配置
const WALLETCONNECT_PROJECT_ID = 'YOUR_PROJECT_ID_HERE'; // 需要从 https://cloud.walletconnect.com 获取

export interface WalletConnectConfig {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface SessionRequest {
  id: number;
  topic: string;
  params: any;
  verifyContext: any;
}

export interface PendingRequest {
  id: number;
  topic: string;
  method: string;
  params: any;
  chainId: string;
  peerName: string;
  peerUrl: string;
  peerIcon: string;
}

export class WalletConnectService {
  private web3wallet: any = null;
  private core: any = null;
  private initialized = false;

  // 事件监听器
  private onSessionProposalCallback?: (proposal: SignClientTypes.EventArguments['session_proposal']) => void;
  private onSessionRequestCallback?: (request: PendingRequest) => void;
  private onSessionDeleteCallback?: (topic: string) => void;

  constructor(private config: WalletConnectConfig) {}

  /**
   * 初始化 WalletConnect
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('✅ WalletConnect 已初始化');
      return;
    }

    try {
      console.log('🔄 初始化 WalletConnect...');

      // 1. 创建 Core
      this.core = new Core({
        projectId: this.config.projectId,
      });

      // 2. 创建 Web3Wallet
      this.web3wallet = await Web3Wallet.init({
        core: this.core,
        metadata: this.config.metadata,
      });

      // 3. 注册事件监听
      this.setupEventListeners();

      this.initialized = true;
      console.log('✅ WalletConnect 初始化成功');
      console.log('📱 支持的方法:', this.getSupportedMethods());
    } catch (error) {
      console.error('❌ WalletConnect 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.web3wallet) return;

    // 会话提案（DApp 请求连接）
    this.web3wallet.on('session_proposal', async (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      console.log('📨 收到会话提案:', proposal);
      if (this.onSessionProposalCallback) {
        this.onSessionProposalCallback(proposal);
      }
    });

    // 会话请求（DApp 请求签名等操作）
    this.web3wallet.on('session_request', async (requestEvent: any) => {
      console.log('📨 收到会话请求:', requestEvent);
      const { topic, params, id } = requestEvent;
      const { request } = params;
      const session = this.web3wallet!.engine.signClient.session.get(topic);

      const pendingRequest: PendingRequest = {
        id,
        topic,
        method: request.method,
        params: request.params,
        chainId: params.chainId,
        peerName: session.peer.metadata.name,
        peerUrl: session.peer.metadata.url,
        peerIcon: session.peer.metadata.icons[0] || '',
      };

      if (this.onSessionRequestCallback) {
        this.onSessionRequestCallback(pendingRequest);
      }
    });

    // 会话删除
    this.web3wallet.on('session_delete', ({ topic }: { topic: string }) => {
      console.log('❌ 会话已删除:', topic);
      if (this.onSessionDeleteCallback) {
        this.onSessionDeleteCallback(topic);
      }
    });

    // 身份验证请求
    this.web3wallet.on('auth_request', (request: any) => {
      console.log('🔐 收到身份验证请求:', request);
    });
  }

  /**
   * 通过 URI 连接 DApp（扫描二维码后）
   */
  async pair(uri: string): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect 未初始化');
    }

    try {
      console.log('🔗 配对 DApp...');
      await this.web3wallet.core.pairing.pair({ uri });
      console.log('✅ 配对成功');
    } catch (error) {
      console.error('❌ 配对失败:', error);
      throw error;
    }
  }

  /**
   * 批准会话提案
   */
  async approveSession(
    proposal: SignClientTypes.EventArguments['session_proposal'],
    wallet: Wallet
  ): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect 未初始化');
    }

    if (wallet.type !== WalletType.HOT) {
      throw new Error('只有热钱包可以连接 DApp');
    }

    try {
      console.log('✅ 批准会话...');

      const { id, params } = proposal;
      const { requiredNamespaces } = params;

      // 构建支持的命名空间
      const namespaces: SessionTypes.Namespaces = {};

      // 处理必需的命名空间
      for (const [key, namespace] of Object.entries(requiredNamespaces)) {
        const chains = namespace.chains || [];
        const accounts: string[] = [];

        for (const chain of chains) {
          // 根据链类型添加账户
          if (chain.startsWith('eip155:') && wallet.chain === ChainType.ETH) {
            accounts.push(`${chain}:${wallet.address}`);
          }
        }

        if (accounts.length > 0) {
          namespaces[key] = {
            chains,
            methods: namespace.methods,
            events: namespace.events,
            accounts,
          };
        }
      }

      // 批准会话
      const session = await this.web3wallet.approveSession({
        id,
        namespaces,
      });

      console.log('✅ 会话已批准:', session);
    } catch (error) {
      console.error('❌ 批准会话失败:', error);
      throw error;
    }
  }

  /**
   * 拒绝会话提案
   */
  async rejectSession(proposal: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect 未初始化');
    }

    try {
      console.log('❌ 拒绝会话...');
      await this.web3wallet.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED'),
      });
      console.log('✅ 会话已拒绝');
    } catch (error) {
      console.error('❌ 拒绝会话失败:', error);
      throw error;
    }
  }

  /**
   * 处理会话请求（签名、发送交易等）
   */
  async handleSessionRequest(request: PendingRequest, wallet: Wallet): Promise<any> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect 未初始化');
    }

    if (wallet.type !== WalletType.HOT || !wallet.privateKey) {
      throw new Error('需要热钱包私钥来签名');
    }

    try {
      console.log('🔄 处理请求:', request.method);

      let result: any;

      switch (request.method) {
        // ETH 签名消息
        case 'eth_sign':
        case 'personal_sign':
          result = await this.handleEthSign(request, wallet);
          break;

        // ETH 签名类型化数据 (EIP-712)
        case 'eth_signTypedData':
        case 'eth_signTypedData_v4':
          result = await this.handleEthSignTypedData(request, wallet);
          break;

        // ETH 发送交易
        case 'eth_sendTransaction':
          result = await this.handleEthSendTransaction(request, wallet);
          break;

        // ETH 签名交易（不发送）
        case 'eth_signTransaction':
          result = await this.handleEthSignTransaction(request, wallet);
          break;

        // 获取账户
        case 'eth_accounts':
          result = [wallet.address];
          break;

        // 获取链 ID
        case 'eth_chainId':
          result = request.chainId;
          break;

        default:
          throw new Error(`不支持的方法: ${request.method}`);
      }

      // 发送响应
      await this.web3wallet.respondSessionRequest({
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: '2.0',
          result,
        },
      });

      console.log('✅ 请求处理成功:', result);
      return result;
    } catch (error) {
      console.error('❌ 请求处理失败:', error);

      // 发送错误响应
      await this.web3wallet.respondSessionRequest({
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: '2.0',
          error: {
            code: 5000,
            message: (error as Error).message,
          },
        },
      });

      throw error;
    }
  }

  /**
   * 拒绝会话请求
   */
  async rejectSessionRequest(request: PendingRequest): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect 未初始化');
    }

    try {
      await this.web3wallet.respondSessionRequest({
        topic: request.topic,
        response: {
          id: request.id,
          jsonrpc: '2.0',
          error: getSdkError('USER_REJECTED_METHODS'),
        },
      });
      console.log('✅ 请求已拒绝');
    } catch (error) {
      console.error('❌ 拒绝请求失败:', error);
      throw error;
    }
  }

  /**
   * 处理 ETH 签名
   */
  private async handleEthSign(request: PendingRequest, wallet: Wallet): Promise<string> {
    const [address, message] = request.params;
    
    if (address.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error('地址不匹配');
    }

    // 使用 ethers.js 签名
    const ethWallet = new ethers.Wallet(wallet.privateKey!);
    
    // personal_sign 的消息是十六进制编码的
    let messageToSign = message;
    if (request.method === 'personal_sign' && message.startsWith('0x')) {
      messageToSign = ethers.toUtf8String(message);
    }
    
    const signature = await ethWallet.signMessage(messageToSign);
    return signature;
  }

  /**
   * 处理 ETH 签名类型化数据 (EIP-712)
   */
  private async handleEthSignTypedData(request: PendingRequest, wallet: Wallet): Promise<string> {
    const [address, typedData] = request.params;
    
    if (address.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error('地址不匹配');
    }

    const ethWallet = new ethers.Wallet(wallet.privateKey!);
    const data = typeof typedData === 'string' ? JSON.parse(typedData) : typedData;
    
    // 签名类型化数据
    const signature = await ethWallet.signTypedData(
      data.domain,
      data.types,
      data.message
    );
    
    return signature;
  }

  /**
   * 处理 ETH 发送交易
   */
  private async handleEthSendTransaction(request: PendingRequest, wallet: Wallet): Promise<string> {
    const [transaction] = request.params;
    
    if (transaction.from.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error('发送地址不匹配');
    }

    // 获取 RPC 提供者
    const provider = new ethers.JsonRpcProvider(this.getRpcUrl(request.chainId));
    const ethWallet = new ethers.Wallet(wallet.privateKey!, provider);
    
    // 发送交易
    const tx = await ethWallet.sendTransaction(transaction);
    return tx.hash;
  }

  /**
   * 处理 ETH 签名交易（不发送）
   */
  private async handleEthSignTransaction(request: PendingRequest, wallet: Wallet): Promise<string> {
    const [transaction] = request.params;
    
    if (transaction.from.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error('发送地址不匹配');
    }

    const ethWallet = new ethers.Wallet(wallet.privateKey!);
    const signedTx = await ethWallet.signTransaction(transaction);
    return signedTx;
  }

  /**
   * 获取所有活跃会话
   */
  getActiveSessions(): SessionTypes.Struct[] {
    if (!this.web3wallet) return [];
    return Object.values(this.web3wallet.getActiveSessions());
  }

  /**
   * 断开会话
   */
  async disconnectSession(topic: string): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect 未初始化');
    }

    try {
      await this.web3wallet.disconnectSession({
        topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });
      console.log('✅ 会话已断开');
    } catch (error) {
      console.error('❌ 断开会话失败:', error);
      throw error;
    }
  }

  /**
   * 断开所有会话
   */
  async disconnectAllSessions(): Promise<void> {
    const sessions = this.getActiveSessions();
    await Promise.all(
      sessions.map((session) => this.disconnectSession(session.topic))
    );
  }

  /**
   * 注册事件回调
   */
  onSessionProposal(callback: (proposal: SignClientTypes.EventArguments['session_proposal']) => void): void {
    this.onSessionProposalCallback = callback;
  }

  onSessionRequest(callback: (request: PendingRequest) => void): void {
    this.onSessionRequestCallback = callback;
  }

  onSessionDelete(callback: (topic: string) => void): void {
    this.onSessionDeleteCallback = callback;
  }

  /**
   * 获取支持的方法列表
   */
  private getSupportedMethods(): string[] {
    return [
      'eth_accounts',
      'eth_chainId',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData',
      'eth_signTypedData_v4',
      'eth_sendTransaction',
      'eth_signTransaction',
    ];
  }

  /**
   * 根据链 ID 获取 RPC URL
   */
  private getRpcUrl(chainId: string): string {
    const chainIdNum = parseInt(chainId.split(':')[1]);
    
    // 主网和测试网映射
    const rpcUrls: Record<number, string> = {
      1: 'https://eth.llamarpc.com',
      5: 'https://goerli.infura.io/v3/YOUR_KEY',
      11155111: 'https://sepolia.infura.io/v3/YOUR_KEY',
      137: 'https://polygon-rpc.com',
      56: 'https://bsc-dataseed.binance.org',
    };

    return rpcUrls[chainIdNum] || 'https://eth.llamarpc.com';
  }
}

// 创建默认实例
export const walletConnectService = new WalletConnectService({
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata: {
    name: 'XWallet',
    description: 'Multi-chain Hot/Cold Wallet with CRVA',
    url: 'https://your-wallet-url.com',
    icons: ['https://your-wallet-url.com/icon.png'],
  },
});
