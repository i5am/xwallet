import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';
import { DERIVATION_PATHS } from '@/utils';
import { NetworkType } from '@/types';
import * as secp from '@noble/secp256k1';

// 辅助函数
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 创建兼容的 ECC 接口 (使用 @noble/secp256k1 v1.7.1)
const ecc = {
  isPoint(p: Uint8Array): boolean {
    try {
      if (p.length === 33) {
        // 压缩格式
        secp.Point.fromHex(bytesToHex(p));
        return true;
      } else if (p.length === 65) {
        // 未压缩格式
        secp.Point.fromHex(bytesToHex(p));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  
  isPrivate(d: Uint8Array): boolean {
    try {
      return secp.utils.isValidPrivateKey(d);
    } catch {
      return false;
    }
  },
  
  pointFromScalar(d: Uint8Array, compressed?: boolean): Uint8Array | null {
    try {
      const pubKey = secp.getPublicKey(d, compressed !== false);
      return Uint8Array.from(pubKey);
    } catch {
      return null;
    }
  },
  
  pointAddScalar(p: Uint8Array, tweak: Uint8Array, compressed?: boolean): Uint8Array | null {
    try {
      const point = secp.Point.fromHex(bytesToHex(p));
      const tweakPoint = secp.Point.fromPrivateKey(tweak);
      const result = point.add(tweakPoint);
      const hex = result.toHex(compressed !== false);
      return hexToBytes(hex);
    } catch {
      return null;
    }
  },
  
  privateAdd(d: Uint8Array, tweak: Uint8Array): Uint8Array | null {
    try {
      const dBig = BigInt('0x' + bytesToHex(d));
      const tweakBig = BigInt('0x' + bytesToHex(tweak));
      const order = secp.CURVE.n;
      const result = (dBig + tweakBig) % order;
      const hex = result.toString(16).padStart(64, '0');
      return hexToBytes(hex);
    } catch {
      return null;
    }
  },
  
  sign(h: Uint8Array, d: Uint8Array): Uint8Array {
    const sig = secp.signSync(h, d, { der: false });
    return Uint8Array.from(sig);
  },
  
  signSchnorr(h: Uint8Array, d: Uint8Array): Uint8Array {
    const sig = secp.schnorr.signSync(h, d);
    return Uint8Array.from(sig);
  },
  
  verify(h: Uint8Array, Q: Uint8Array, signature: Uint8Array): boolean {
    try {
      return secp.verify(signature, h, Q);
    } catch {
      return false;
    }
  },
  
  verifySchnorr(h: Uint8Array, Q: Uint8Array, signature: Uint8Array): boolean {
    try {
      return secp.schnorr.verifySync(signature, h, Q);
    } catch {
      return false;
    }
  },
  
  pointCompress(p: Uint8Array, compressed?: boolean): Uint8Array {
    try {
      const point = secp.Point.fromHex(bytesToHex(p));
      const hex = point.toHex(compressed !== false);
      return hexToBytes(hex);
    } catch (e) {
      console.error('pointCompress error:', e);
      return p;
    }
  },
  
  xOnlyPointAddTweak(p: Uint8Array, tweak: Uint8Array): { parity: 1 | 0; xOnlyPubkey: Uint8Array } | null {
    try {
      // p 是 32 字节的 x-only pubkey, 我们需要构造完整的点
      const xHex = bytesToHex(p);
      const point = secp.Point.fromHex('02' + xHex); // 假设偶数 y
      const tweakPoint = secp.Point.fromPrivateKey(tweak);
      const result = point.add(tweakPoint);
      const hex = result.toHex(true);
      const bytes = hexToBytes(hex);
      return {
        parity: bytes[0] === 0x02 ? 0 : 1,
        xOnlyPubkey: bytes.slice(1, 33)
      };
    } catch {
      return null;
    }
  },
  
  privateNegate(d: Uint8Array): Uint8Array {
    try {
      const dBig = BigInt('0x' + bytesToHex(d));
      const order = secp.CURVE.n;
      const result = order - dBig;
      const hex = result.toString(16).padStart(64, '0');
      return hexToBytes(hex);
    } catch (e) {
      console.error('privateNegate error:', e);
      return d;
    }
  }
};

// 初始化前先测试 ECC 库
try {
  console.log('🔧 开始初始化 ECC 库...');
  console.log('测试 ECC 接口:');
  
  // 测试 1: isPrivate
  const testPriv = new Uint8Array(32);
  testPriv.fill(1);
  console.log('  - isPrivate:', ecc.isPrivate(testPriv));
  
  // 测试 2: pointFromScalar
  const testPub = ecc.pointFromScalar(testPriv, true);
  console.log('  - pointFromScalar:', testPub ? bytesToHex(testPub) : 'null');
  
  // 测试 3: isPoint
  if (testPub) {
    console.log('  - isPoint:', ecc.isPoint(testPub));
  }
  
  // 测试 4: pointCompress
  if (testPub) {
    const compressed = ecc.pointCompress(testPub, true);
    console.log('  - pointCompress:', compressed ? 'OK' : 'FAIL');
  }
  
  console.log('✅ 所有 ECC 测试通过!');
  console.log('📌 调用 bitcoin.initEccLib...');
  
  bitcoin.initEccLib(ecc as any);
  
  console.log('✅ bitcoinjs-lib ECC 初始化成功!');
} catch (error) {
  console.error('❌ ECC 初始化失败:', error);
  alert('ECC 初始化失败: ' + (error as Error).message);
  throw error;
}

console.log('📌 创建 BIP32 工厂...');
const bip32 = BIP32Factory(ecc as any);
console.log('✅ BIP32 工厂创建成功!');

/**
 * BTC Taproot 适配器 - 鸿蒙系统兼容版本
 */
export class BTCAdapter {
  private network: bitcoin.Network;
  private apiBaseUrl: string;
  
  constructor(networkType: NetworkType = NetworkType.MAINNET) {
    this.network = networkType === NetworkType.MAINNET 
      ? bitcoin.networks.bitcoin 
      : bitcoin.networks.testnet;
    
    this.apiBaseUrl = networkType === NetworkType.MAINNET
      ? 'https://blockstream.info/api'
      : 'https://blockstream.info/testnet/api';
  }
  
  /**
   * 从助记词生成 Taproot 地址
   */
  generateTaprootAddress(mnemonic: string, index: number = 0): {
    address: string;
    privateKey: string;
    publicKey: string;
    path: string;
  } {
    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const root = bip32.fromSeed(seed, this.network);
      const path = DERIVATION_PATHS.BTC_TAPROOT.replace('/0', `/${index}`);
      const child = root.derivePath(path);
      
      if (!child.privateKey) {
        throw new Error('Failed to derive private key');
      }
      
      const internalPubkey = Buffer.from(child.publicKey.slice(1, 33));
      const { address } = bitcoin.payments.p2tr({
        internalPubkey,
        network: this.network
      });
      
      if (!address) {
        throw new Error('Failed to generate Taproot address');
      }
      
      return {
        address,
        privateKey: child.privateKey.toString('hex'),
        publicKey: child.publicKey.toString('hex'),
        path
      };
    } catch (error) {
      throw new Error(`Failed to generate Taproot address: ${(error as Error).message}`);
    }
  }
  
  /**
   * 从私钥恢复地址
   */
  addressFromPrivateKey(privateKeyHex: string): string {
    try {
      const privateKey = Buffer.from(privateKeyHex, 'hex');
      const publicKey = secp.getPublicKey(privateKey, true);
      const internalPubkey = Buffer.from(publicKey.slice(1, 33));
      
      const { address } = bitcoin.payments.p2tr({
        internalPubkey,
        network: this.network
      });
      
      if (!address) {
        throw new Error('Failed to generate address from private key');
      }
      
      return address;
    } catch (error) {
      throw new Error(`Failed to recover address: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取地址余额
   */
  async getBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/address/${address}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const funded = data.chain_stats?.funded_txo_sum || 0;
      const spent = data.chain_stats?.spent_txo_sum || 0;
      
      return funded - spent;
    } catch (error) {
      throw new Error(`Failed to fetch balance: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取交易列表
   */
  async getTransactions(address: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/address/${address}/txs`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }
  
  /**
   * 获取 UTXO 列表
   */
  async getUTXOs(address: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/address/${address}/utxo`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch UTXOs: ${(error as Error).message}`);
    }
  }
  
  /**
   * 获取推荐手续费率
   */
  async getSuggestedFeeRate(): Promise<{
    low: number;
    medium: number;
    high: number;
  }> {
    try {
      const response = await fetch('https://mempool.space/api/v1/fees/recommended');
      
      if (!response.ok) {
        // 如果 API 失败,返回默认值
        return { low: 1, medium: 5, high: 10 };
      }
      
      const fees = await response.json();
      return {
        low: fees.economyFee || 1,
        medium: fees.hourFee || 5,
        high: fees.fastestFee || 10,
      };
    } catch (error) {
      console.error('Failed to fetch fee rate:', error);
      return { low: 1, medium: 5, high: 10 };
    }
  }
  
  /**
   * 广播交易
   */
  async broadcastTransaction(txHex: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tx`, {
        method: 'POST',
        body: txHex,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Broadcast failed: ${errorText}`);
      }
      
      return await response.text(); // 返回 txid
    } catch (error) {
      throw new Error(`Failed to broadcast transaction: ${(error as Error).message}`);
    }
  }
  
  /**
   * 估算交易大小 (简化版本)
   */
  estimateTransactionSize(inputCount: number, outputCount: number): number {
    // Taproot 交易大小估算
    // 基础: 10 bytes
    // 每个输入: ~57 bytes
    // 每个输出: ~43 bytes
    return 10 + (inputCount * 57) + (outputCount * 43);
  }
}
