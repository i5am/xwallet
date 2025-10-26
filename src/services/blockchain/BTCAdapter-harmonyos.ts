import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory, BIP32API } from 'bip32';
import * as bip39 from 'bip39';
import { DERIVATION_PATHS } from '@/utils';
import { NetworkType } from '@/types';
import * as secp from '@noble/secp256k1';
// @ts-ignore
import { sha256 } from '@noble/hashes/sha2.js';
// @ts-ignore
import { hmac } from '@noble/hashes/hmac.js';

// 设置 @noble/secp256k1 所需的 hmac 和 sha256 函数
secp.utils.hmacSha256Sync = (key: Uint8Array, ...messages: Uint8Array[]) => {
  const h = hmac.create(sha256, key);
  messages.forEach(msg => h.update(msg));
  return h.digest();
};

// 创建 ECC 接口适配器
const ecc = {
  isPoint(p: Uint8Array): boolean {
    try {
      secp.Point.fromHex(Buffer.from(p).toString('hex'));
      return true;
    } catch {
      return false;
    }
  },
  
  isPrivate(d: Uint8Array): boolean {
    return secp.utils.isValidPrivateKey(d);
  },
  
  pointFromScalar(d: Uint8Array, compressed?: boolean): Uint8Array | null {
    try {
      const point = secp.getPublicKey(d, compressed !== false);
      return Uint8Array.from(point);
    } catch {
      return null;
    }
  },
  
  pointAddScalar(p: Uint8Array, tweak: Uint8Array, compressed?: boolean): Uint8Array | null {
    try {
      const point = secp.Point.fromHex(Buffer.from(p).toString('hex'));
      const tweakPoint = secp.Point.fromPrivateKey(tweak);
      const result = point.add(tweakPoint);
      const hex = result.toHex(compressed !== false);
      return Buffer.from(hex, 'hex');
    } catch {
      return null;
    }
  },
  
  privateAdd(d: Uint8Array, tweak: Uint8Array): Uint8Array | null {
    try {
      const dNum = BigInt('0x' + Buffer.from(d).toString('hex'));
      const tweakNum = BigInt('0x' + Buffer.from(tweak).toString('hex'));
      const sum = (dNum + tweakNum) % secp.CURVE.n;
      return Buffer.from(sum.toString(16).padStart(64, '0'), 'hex');
    } catch {
      return null;
    }
  },
  
  sign(h: Uint8Array, d: Uint8Array): Uint8Array {
    return secp.signSync(h, d, { der: false });
  },
  
  verify(h: Uint8Array, Q: Uint8Array, signature: Uint8Array): boolean {
    try {
      return secp.verify(signature, h, Q);
    } catch {
      return false;
    }
  },
};

// 初始化 bitcoinjs-lib
console.log('🔧 使用 @noble/secp256k1 初始化 ECC 库...');
try {
  bitcoin.initEccLib(ecc as any);
  console.log('✅ bitcoinjs-lib ECC 初始化成功!');
} catch (error) {
  console.error('❌ bitcoinjs-lib ECC 初始化失败:', error);
}

// 创建 BIP32 工厂
let _bip32Instance: BIP32API | null = null;

function getBip32(): BIP32API {
  if (!_bip32Instance) {
    try {
      console.log('🔧 初始化 BIP32 工厂...');
      _bip32Instance = BIP32Factory(ecc as any);
      console.log('✅ BIP32 工厂创建成功!');
    } catch (err) {
      console.error('❌ BIP32 初始化失败:', err);
      throw new Error('BIP32 不可用: ' + (err as Error).message);
    }
  }
  return _bip32Instance!;
}

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
      const root = getBip32().fromSeed(seed, this.network);
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
      const publicKey = ecc.pointFromScalar(privateKey, true);
      
      if (!publicKey) {
        throw new Error('Failed to derive public key');
      }
      
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
