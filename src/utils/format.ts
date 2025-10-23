import { SATOSHI_PER_BTC } from './constants';

/**
 * 格式化 BTC 金额
 */
export function formatBTC(satoshi: number, decimals: number = 8): string {
  const btc = satoshi / SATOSHI_PER_BTC;
  return btc.toFixed(decimals);
}

/**
 * BTC 转 Satoshi
 */
export function btcToSatoshi(btc: number | string): number {
  return Math.floor(Number(btc) * SATOSHI_PER_BTC);
}

/**
 * 格式化 ETH 金额
 */
export function formatETH(wei: string | bigint, decimals: number = 18): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  // ES2015 兼容: 不使用 ** 运算符
  let divisor = BigInt(1);
  for (let i = 0; i < decimals; i++) {
    divisor = divisor * BigInt(10);
  }
  const quotient = weiValue / divisor;
  const remainder = weiValue % divisor;
  
  if (remainder === BigInt(0)) {
    return quotient.toString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmed = remainderStr.replace(/0+$/, '');
  
  return trimmed ? `${quotient}.${trimmed}` : quotient.toString();
}

/**
 * ETH 转 Wei
 */
export function ethToWei(eth: number | string, decimals: number = 18): string {
  const ethStr = String(eth);
  const parts = ethStr.split('.');
  const integerPart = parts[0] || '0';
  const fractionalPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  
  const wei = BigInt(integerPart + fractionalPart);
  return wei.toString();
}

/**
 * 格式化地址（缩略显示）
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * 格式化交易哈希
 */
export function formatTxHash(hash: string, chars: number = 8): string {
  if (!hash) return '';
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number, format: 'date' | 'datetime' | 'relative' = 'datetime'): string {
  const date = new Date(timestamp);
  
  if (format === 'date') {
    return date.toLocaleDateString('zh-CN');
  }
  
  if (format === 'datetime') {
    return date.toLocaleString('zh-CN');
  }
  
  // Relative time
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  return '刚刚';
}

/**
 * 格式化文件大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 格式化法币金额
 */
export function formatFiat(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
  }).format(amount);
}
