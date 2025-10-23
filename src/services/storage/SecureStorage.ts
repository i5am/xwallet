import { APP_CONFIG } from '@/config';
import { CryptoUtils } from '@/utils';

/**
 * 安全存储服务
 * 用于加密存储敏感数据（私钥、助记词等）
 */
export class SecureStorage {
  private static masterPassword: string | null = null;
  
  /**
   * 设置主密码
   */
  static setMasterPassword(password: string): void {
    this.masterPassword = CryptoUtils.sha256(password);
  }
  
  /**
   * 获取主密码
   */
  static getMasterPassword(): string {
    if (!this.masterPassword) {
      // 首次使用，生成随机密码
      this.masterPassword = CryptoUtils.generateRandomPassword();
      this.saveMasterPassword(this.masterPassword);
    }
    return this.masterPassword;
  }
  
  /**
   * 保存主密码到 localStorage（仅用于 Web 版，实际应用应使用更安全的方式）
   */
  private static saveMasterPassword(password: string): void {
    localStorage.setItem(APP_CONFIG.storageKeys.encryptionKey, password);
  }
  
  // Commented out - reserved for future use
  // /**
  //  * 加载主密码
  //  */
  // private static loadMasterPassword(): string | null {
  //   return localStorage.getItem(APP_CONFIG.storageKeys.encryptionKey);
  // }
  
  /**
   * 加密并存储数据
   */
  static setItem(key: string, value: any): void {
    const password = this.getMasterPassword();
    const jsonData = JSON.stringify(value);
    const encrypted = CryptoUtils.encrypt(jsonData, password);
    localStorage.setItem(key, encrypted);
  }
  
  /**
   * 读取并解密数据
   */
  static getItem<T>(key: string): T | null {
    const encrypted = localStorage.getItem(key);
    
    if (!encrypted) {
      return null;
    }
    
    try {
      const password = this.getMasterPassword();
      const decrypted = CryptoUtils.decrypt(encrypted, password);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }
  
  /**
   * 删除数据
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  /**
   * 清空所有数据
   */
  static clear(): void {
    localStorage.clear();
  }
  
  /**
   * 检查 key 是否存在
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

/**
 * 普通存储服务（不加密）
 */
export class Storage {
  /**
   * 存储数据
   */
  static setItem(key: string, value: any): void {
    const jsonData = JSON.stringify(value);
    localStorage.setItem(key, jsonData);
  }
  
  /**
   * 读取数据
   */
  static getItem<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }
    
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Failed to parse data:', error);
      return null;
    }
  }
  
  /**
   * 删除数据
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  /**
   * 清空所有数据
   */
  static clear(): void {
    localStorage.clear();
  }
}
