import { ethers } from 'ethers';
import { DERIVATION_PATHS, formatETH, ethToWei } from '@/utils';
import { NetworkType } from '@/types';

/**
 * ETH 适配器
 */
export class ETHAdapter {
  private provider: ethers.JsonRpcProvider;
  private chainId: number;
  
  constructor(rpcUrl: string, networkType: NetworkType = NetworkType.MAINNET) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.chainId = networkType === NetworkType.MAINNET ? 1 : 11155111; // Sepolia
  }
  
  /**
   * 从助记词生成 ETH 地址
   * 派生路径: m/44'/60'/0'/0/index
   */
  generateAddress(mnemonic: string, index: number = 0): {
    address: string;
    privateKey: string;
    publicKey: string;
    path: string;
  } {
    try {
      // BIP44 路径: m/44'/60'/0'/0/index
      const path = DERIVATION_PATHS.ETH.replace('/0', `/${index}`);
      const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path);
      
      return {
        address: hdNode.address,
        privateKey: hdNode.privateKey,
        publicKey: hdNode.publicKey,
        path
      };
    } catch (error) {
      throw new Error(`Failed to generate ETH address: ${(error as Error).message}`);
    }
  }
  
  /**
   * 从私钥恢复地址
   */
  addressFromPrivateKey(privateKey: string): string {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return wallet.address;
    } catch (error) {
      throw new Error(`Failed to recover address: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取 ETH 余额（Wei）
   */
  async getBalance(address: string): Promise<bigint> {
    try {
      return await this.provider.getBalance(address);
    } catch (error) {
      throw new Error(`Failed to get balance: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取 ETH 余额（ETH）
   */
  async getBalanceETH(address: string): Promise<string> {
    const balanceWei = await this.getBalance(address);
    return formatETH(balanceWei);
  }
  
  /**
   * 获取当前 nonce
   */
  async getNonce(address: string): Promise<number> {
    try {
      return await this.provider.getTransactionCount(address, 'pending');
    } catch (error) {
      throw new Error(`Failed to get nonce: ${(error as Error).message}`);
    }
  }
  
  /**
   * 估算 Gas 费用
   */
  async estimateGas(params: {
    from: string;
    to: string;
    value?: string;
    data?: string;
  }): Promise<bigint> {
    try {
      return await this.provider.estimateGas({
        from: params.from,
        to: params.to,
        value: params.value || '0',
        data: params.data || '0x'
      });
    } catch (error) {
      throw new Error(`Failed to estimate gas: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取当前 Gas 价格（EIP-1559）
   */
  async getGasPrice(): Promise<{
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }> {
    try {
      const feeData = await this.provider.getFeeData();
      return {
        maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits('50', 'gwei'),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits('2', 'gwei')
      };
    } catch (error) {
      // ethers v6 无 getGasPrice，直接降级到默认值
      return {
        maxFeePerGas: ethers.parseUnits('50', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
      };
    }
  }
  
  /**
   * 构建 ETH 转账交易
   */
  async buildTransaction(params: {
    from: string;
    to: string;
    amountETH: string;
  }): Promise<ethers.TransactionRequest> {
    try {
      const { from, to, amountETH } = params;
      
      // 获取 nonce
      const nonce = await this.getNonce(from);
      
      // 获取 gas 价格
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrice();
      
      // 构建交易
      const tx: ethers.TransactionRequest = {
        from,
        to,
        value: ethToWei(amountETH),
        nonce,
        gasLimit: 21000, // Standard ETH transfer gas limit
        maxFeePerGas,
        maxPriorityFeePerGas,
        chainId: this.chainId,
        type: 2, // EIP-1559
      };
      
      return tx;
    } catch (error) {
      throw new Error(`Failed to build transaction: ${(error as Error).message}`);
    }
  }
  
  /**
   * 签名交易
   */
  async signTransaction(tx: ethers.TransactionRequest, privateKey: string): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      return await wallet.signTransaction(tx);
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${(error as Error).message}`);
    }
  }
  
  /**
   * 签名消息（用于多签提案等）
   */
  async signMessage(message: string, privateKey: string): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const signature = await wallet.signMessage(message);
      return signature;
    } catch (error) {
      throw new Error(`Failed to sign message: ${(error as Error).message}`);
    }
  }
  
  /**
   * 验证签名
   */
  verifyMessage(message: string, signature: string): string {
    try {
      return ethers.verifyMessage(message, signature);
    } catch (error) {
      throw new Error(`Failed to verify message: ${(error as Error).message}`);
    }
  }
  
  /**
   * 广播交易
   */
  async broadcastTransaction(signedTx: string): Promise<string> {
    try {
      const tx = await this.provider.broadcastTransaction(signedTx);
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to broadcast transaction: ${(error as Error).message}`);
    }
  }
  
  /**
   * 发送 ETH（构建、签名、广播一步完成）
   */
  async sendETH(params: {
    from: string;
    to: string;
    amountETH: string;
    privateKey: string;
  }): Promise<string> {
    try {
      const wallet = new ethers.Wallet(params.privateKey, this.provider);
      
      const tx = await wallet.sendTransaction({
        to: params.to,
        value: ethToWei(params.amountETH),
      });
      
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to send ETH: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取交易详情
   */
  async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null> {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      console.error('Failed to get transaction:', error);
      return null;
    }
  }
  
  /**
   * 获取交易回执
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      return null;
    }
  }
  
  /**
   * 等待交易确认
   */
  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      return null;
    }
  }
  
  /**
   * 获取交易历史（简化版，实际应使用 Etherscan API）
   */
  async getTransactionHistory(_address: string, _limit: number = 10): Promise<ETHTransaction[]> {
    try {
      // 注意：这是一个简化实现
      // 实际生产环境应该使用 Etherscan API 或 The Graph
      await this.provider.getBlockNumber();
      const transactions: ETHTransaction[] = [];
      
      // 这里只是示例，实际需要使用区块浏览器 API
      console.warn('ETH transaction history requires Etherscan API in production');
      
      return transactions;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${(error as Error).message}`);
    }
  }
}

/**
 * ETH 交易接口
 */
export interface ETHTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
}
