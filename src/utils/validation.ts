import { REGEX } from './constants';

/**
 * 验证 BTC 地址
 */
export function isValidBTCAddress(address: string): boolean {
  return REGEX.BTC_ADDRESS.test(address);
}

/**
 * 验证 ETH 地址
 */
export function isValidETHAddress(address: string): boolean {
  return REGEX.ETH_ADDRESS.test(address);
}

/**
 * 验证交易哈希
 */
export function isValidTxHash(hash: string, chain: 'btc' | 'eth'): boolean {
  if (chain === 'btc') {
    return REGEX.TX_HASH_BTC.test(hash);
  }
  return REGEX.TX_HASH_ETH.test(hash);
}

/**
 * 验证助记词
 */
export function isValidMnemonic(mnemonic: string): boolean {
  const trimmed = mnemonic.trim();
  const words = trimmed.split(/\s+/);
  
  // 必须是 12 或 24 个单词
  if (words.length !== 12 && words.length !== 24) {
    return false;
  }
  
  // 每个单词只能包含字母
  return words.every(word => /^[a-z]+$/.test(word));
}

/**
 * 验证私钥（十六进制）
 */
export function isValidPrivateKey(privateKey: string): boolean {
  // 去除 0x 前缀
  const key = privateKey.replace(/^0x/, '');
  
  // 必须是 64 个十六进制字符
  return /^[a-fA-F0-9]{64}$/.test(key);
}

/**
 * 验证金额
 */
export function isValidAmount(amount: string | number, min: number = 0): boolean {
  const num = Number(amount);
  
  if (isNaN(num)) return false;
  if (num <= 0) return false;
  if (min > 0 && num < min) return false;
  
  return true;
}

/**
 * 验证 PIN 码
 */
export function isValidPin(pin: string, minLength: number = 4, maxLength: number = 8): boolean {
  if (pin.length < minLength || pin.length > maxLength) {
    return false;
  }
  
  return /^\d+$/.test(pin);
}

/**
 * 验证 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证 JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
