import { Wallet } from '@/types';

/**
 * 钱包本地存储服务
 */
export class WalletStorage {
  private static readonly STORAGE_KEY = 'xwallet_wallets';
  
  /**
   * 保存钱包列表
   */
  static saveWallets(wallets: Wallet[]): void {
    try {
      // 只保存公开信息，私钥和助记词需要加密
      const walletsToSave = wallets.map(wallet => ({
        id: wallet.id,
        name: wallet.name,
        address: wallet.address,
        chain: wallet.chain,
        type: wallet.type,
        network: wallet.network,
        createdAt: wallet.createdAt,
        // 多签钱包配置
        multisigConfig: wallet.multisigConfig,
        // 私钥和助记词加密后保存
        encryptedPrivateKey: wallet.privateKey ? this.encryptData(wallet.privateKey) : undefined,
        encryptedMnemonic: wallet.mnemonic ? this.encryptData(wallet.mnemonic) : undefined,
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(walletsToSave));
      console.log('✅ 钱包已保存到本地存储');
    } catch (error) {
      console.error('❌ 保存钱包失败:', error);
      throw new Error('保存钱包失败: ' + (error as Error).message);
    }
  }
  
  /**
   * 加载钱包列表
   */
  static loadWallets(): Wallet[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      
      const wallets = JSON.parse(stored);
      return wallets.map((wallet: any) => ({
        ...wallet,
        // 解密私钥和助记词
        privateKey: wallet.encryptedPrivateKey ? this.decryptData(wallet.encryptedPrivateKey) : undefined,
        mnemonic: wallet.encryptedMnemonic ? this.decryptData(wallet.encryptedMnemonic) : undefined,
      }));
    } catch (error) {
      console.error('❌ 加载钱包失败:', error);
      return [];
    }
  }
  
  /**
   * 添加钱包
   */
  static addWallet(wallet: Wallet): void {
    const wallets = this.loadWallets();
    wallets.push(wallet);
    this.saveWallets(wallets);
  }
  
  /**
   * 删除钱包
   */
  static deleteWallet(walletId: string): void {
    const wallets = this.loadWallets();
    const filtered = wallets.filter(w => w.id !== walletId);
    this.saveWallets(filtered);
  }
  
  /**
   * 更新钱包
   */
  static updateWallet(walletId: string, updates: Partial<Wallet>): void {
    const wallets = this.loadWallets();
    const index = wallets.findIndex(w => w.id === walletId);
    if (index !== -1) {
      wallets[index] = { ...wallets[index], ...updates };
      this.saveWallets(wallets);
    }
  }
  
  /**
   * 清空所有钱包
   */
  static clearWallets(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  /**
   * 简单的加密方法（使用 Base64 + 简单混淆）
   * 注意：这不是安全的加密，仅用于基本保护
   * 后续会用密码派生的密钥进行 AES 加密
   */
  private static encryptData(data: string): string {
    // 简单的 Base64 编码 + 反转
    return btoa(data.split('').reverse().join(''));
  }
  
  /**
   * 简单的解密方法
   */
  private static decryptData(encrypted: string): string {
    try {
      return atob(encrypted).split('').reverse().join('');
    } catch {
      return '';
    }
  }
}
