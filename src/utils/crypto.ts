import CryptoJS from 'crypto-js';

/**
 * 加密工具类
 */
export class CryptoUtils {
  /**
   * 使用 AES-256 加密数据
   */
  static encrypt(data: string, password: string): string {
    return CryptoJS.AES.encrypt(data, password).toString();
  }
  
  /**
   * 使用 AES-256 解密数据
   */
  static decrypt(encryptedData: string, password: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('解密失败：密码错误');
      }
      
      return decrypted;
    } catch (error) {
      throw new Error('解密失败：' + (error as Error).message);
    }
  }
  
  /**
   * 生成随机密码
   */
  static generateRandomPassword(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  }
  
  /**
   * 计算 SHA256 哈希
   */
  static sha256(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
  
  /**
   * 计算 MD5 哈希
   */
  static md5(data: string): string {
    return CryptoJS.MD5(data).toString();
  }
  
  /**
   * Base64 编码
   */
  static base64Encode(data: string): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
  }
  
  /**
   * Base64 解码
   */
  static base64Decode(encoded: string): string {
    return CryptoJS.enc.Base64.parse(encoded).toString(CryptoJS.enc.Utf8);
  }
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * 从剪贴板读取
 */
export async function readFromClipboard(): Promise<string> {
  try {
    return await navigator.clipboard.readText();
  } catch (error) {
    throw new Error('无法读取剪贴板');
  }
}
