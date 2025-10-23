import { ethers } from 'ethers';
import { formatETH, ethToWei } from '@/utils';
import { TokenBalance } from '@/types';

/**
 * ERC20 代币适配器
 */
export class ERC20Adapter {
  private provider: ethers.JsonRpcProvider;
  
  // ERC20 标准 ABI
  private readonly ERC20_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
  ];
  
  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
  }
  
  /**
   * 获取代币合约实例
   */
  private getContract(tokenAddress: string, signer?: ethers.Signer): ethers.Contract {
    if (signer) {
      return new ethers.Contract(tokenAddress, this.ERC20_ABI, signer);
    }
    return new ethers.Contract(tokenAddress, this.ERC20_ABI, this.provider);
  }
  
  /**
   * 获取代币信息
   */
  async getTokenInfo(tokenAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    try {
      const contract = this.getContract(tokenAddress);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);
      
      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: formatETH(totalSupply, Number(decimals))
      };
    } catch (error) {
      throw new Error(`Failed to get token info: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取代币余额
   */
  async getBalance(tokenAddress: string, walletAddress: string): Promise<TokenBalance> {
    try {
      const contract = this.getContract(tokenAddress);
      
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf(walletAddress)
      ]);
      
      return {
        contractAddress: tokenAddress,
        name,
        symbol,
        decimals: Number(decimals),
        balance: formatETH(balance, Number(decimals))
      };
    } catch (error) {
      throw new Error(`Failed to get token balance: ${(error as Error).message}`);
    }
  }
  
  /**
   * 构建代币转账交易
   */
  async buildTransferTransaction(params: {
    tokenAddress: string;
    from: string;
    to: string;
    amount: string;
  }): Promise<ethers.TransactionRequest> {
    try {
      const { tokenAddress, from, to, amount } = params;
      
      const contract = this.getContract(tokenAddress);
      const decimals = await contract.decimals();
      
      // 转换金额到 wei
      const amountWei = ethToWei(amount, Number(decimals));
      
      // 编码 transfer 函数调用
      const data = contract.interface.encodeFunctionData('transfer', [to, amountWei]);
      
      // 获取 nonce
      const nonce = await this.provider.getTransactionCount(from, 'pending');
      
      // 获取 gas 价格
      const feeData = await this.provider.getFeeData();
      
      // 估算 gas
      const gasLimit = await this.provider.estimateGas({
        from,
        to: tokenAddress,
        data
      });
      
      return {
        from,
        to: tokenAddress,
        data,
        nonce,
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas || undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
        type: 2
      };
    } catch (error) {
      throw new Error(`Failed to build transfer transaction: ${(error as Error).message}`);
    }
  }
  
  /**
   * 发送代币（构建、签名、广播一步完成）
   */
  async sendToken(params: {
    tokenAddress: string;
    from: string;
    to: string;
    amount: string;
    privateKey: string;
  }): Promise<string> {
    try {
      const { tokenAddress, to, amount, privateKey } = params;
      
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contract = this.getContract(tokenAddress, wallet);
      
      const decimals = await contract.decimals();
      const amountWei = ethToWei(amount, Number(decimals));
      
      const tx = await contract.transfer(to, amountWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to send token: ${(error as Error).message}`);
    }
  }
  
  /**
   * 批量获取代币余额
   */
  async getMultipleBalances(
    tokenAddresses: string[],
    walletAddress: string
  ): Promise<TokenBalance[]> {
    try {
      const balances = await Promise.all(
        tokenAddresses.map(address => this.getBalance(address, walletAddress))
      );
      
      return balances.filter(balance => parseFloat(balance.balance) > 0);
    } catch (error) {
      throw new Error(`Failed to get multiple balances: ${(error as Error).message}`);
    }
  }
  
  /**
   * 检查授权额度
   */
  async getAllowance(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<string> {
    try {
      const contract = this.getContract(tokenAddress);
      const allowance = await contract.allowance(owner, spender);
      const decimals = await contract.decimals();
      
      return formatETH(allowance, Number(decimals));
    } catch (error) {
      throw new Error(`Failed to get allowance: ${(error as Error).message}`);
    }
  }
  
  /**
   * 授权代币
   */
  async approve(params: {
    tokenAddress: string;
    spender: string;
    amount: string;
    privateKey: string;
  }): Promise<string> {
    try {
      const { tokenAddress, spender, amount, privateKey } = params;
      
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contract = this.getContract(tokenAddress, wallet);
      
      const decimals = await contract.decimals();
      const amountWei = ethToWei(amount, Number(decimals));
      
      const tx = await contract.approve(spender, amountWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to approve token: ${(error as Error).message}`);
    }
  }
}
