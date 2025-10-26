/**
 * 密码管理服务
 */
export class PasswordService {
  private static readonly PASSWORD_HASH_KEY = 'xwallet_password_hash';
  private static readonly PASSWORD_SALT_KEY = 'xwallet_password_salt';
  
  /**
   * 设置密码
   */
  static async setPassword(password: string): Promise<void> {
    if (!password || password.length < 4) {
      throw new Error('密码长度至少为4位');
    }
    
    try {
      // 生成随机盐值
      const salt = this.generateSalt();
      
      // 使用盐值哈希密码
      const hash = await this.hashPassword(password, salt);
      
      // 保存哈希值和盐值
      localStorage.setItem(this.PASSWORD_HASH_KEY, hash);
      localStorage.setItem(this.PASSWORD_SALT_KEY, salt);
      
      console.log('✅ 密码设置成功');
    } catch (error) {
      console.error('❌ 设置密码失败:', error);
      throw new Error('设置密码失败');
    }
  }
  
  /**
   * 验证密码
   */
  static async verifyPassword(password: string): Promise<boolean> {
    try {
      const storedHash = localStorage.getItem(this.PASSWORD_HASH_KEY);
      const salt = localStorage.getItem(this.PASSWORD_SALT_KEY);
      
      if (!storedHash || !salt) {
        return false;
      }
      
      const hash = await this.hashPassword(password, salt);
      return hash === storedHash;
    } catch (error) {
      console.error('❌ 验证密码失败:', error);
      return false;
    }
  }
  
  /**
   * 检查是否已设置密码
   */
  static hasPassword(): boolean {
    return !!localStorage.getItem(this.PASSWORD_HASH_KEY);
  }
  
  /**
   * 修改密码
   */
  static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const isValid = await this.verifyPassword(oldPassword);
    if (!isValid) {
      throw new Error('原密码错误');
    }
    
    await this.setPassword(newPassword);
  }
  
  /**
   * 重置密码（危险操作，会清空所有钱包）
   */
  static resetPassword(): void {
    localStorage.removeItem(this.PASSWORD_HASH_KEY);
    localStorage.removeItem(this.PASSWORD_SALT_KEY);
    localStorage.removeItem('xwallet_wallets');
    console.log('⚠️ 密码已重置，所有钱包数据已清空');
  }
  
  /**
   * 生成随机盐值
   */
  private static generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * 使用 SHA-256 哈希密码
   */
  private static async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * 使用密码派生密钥（用于加密钱包数据）
   */
  static async deriveKey(password: string, salt: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * 使用 AES-GCM 加密数据
   */
  static async encryptData(data: string, password: string): Promise<string> {
    try {
      const salt = this.generateSalt();
      const key = await this.deriveKey(password, salt);
      
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );
      
      // 组合: salt + iv + encrypted
      const result = {
        salt,
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        data: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('')
      };
      
      return btoa(JSON.stringify(result));
    } catch (error) {
      console.error('❌ 加密失败:', error);
      throw new Error('加密失败');
    }
  }
  
  /**
   * 使用 AES-GCM 解密数据
   */
  static async decryptData(encryptedData: string, password: string): Promise<string> {
    try {
      const parsed = JSON.parse(atob(encryptedData));
      const key = await this.deriveKey(password, parsed.salt);
      
      const iv = new Uint8Array(parsed.iv.match(/.{2}/g)!.map((byte: string) => parseInt(byte, 16)));
      const data = new Uint8Array(parsed.data.match(/.{2}/g)!.map((byte: string) => parseInt(byte, 16)));
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('❌ 解密失败:', error);
      throw new Error('解密失败，密码可能错误');
    }
  }
}
