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

secp.utils.sha256Sync = (...messages: Uint8Array[]) => {
  const h = sha256.create();
  messages.forEach(msg => h.update(msg));
  return h.digest();
};

// 创建完整的 ECC 接口适配器
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
  
  pointAdd(p: Uint8Array, q: Uint8Array, compressed?: boolean): Uint8Array | null {
    try {
      const point1 = secp.Point.fromHex(Buffer.from(p).toString('hex'));
      const point2 = secp.Point.fromHex(Buffer.from(q).toString('hex'));
      const result = point1.add(point2);
      const hex = result.toHex(compressed !== false);
      return Buffer.from(hex, 'hex');
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
      // 如果结果为0，返回null（无效私钥）
      if (sum === 0n) return null;
      return Buffer.from(sum.toString(16).padStart(64, '0'), 'hex');
    } catch {
      return null;
    }
  },
  
  privateNegate(d: Uint8Array): Uint8Array {
    const dNum = BigInt('0x' + Buffer.from(d).toString('hex'));
    const negated = secp.CURVE.n - dNum;
    return Buffer.from(negated.toString(16).padStart(64, '0'), 'hex');
  },
  
  pointMultiply(p: Uint8Array, tweak: Uint8Array, compressed?: boolean): Uint8Array | null {
    try {
      if (!secp.utils.isValidPrivateKey(tweak)) return null;
      const point = secp.Point.fromHex(Buffer.from(p).toString('hex'));
      const tweakNum = BigInt('0x' + Buffer.from(tweak).toString('hex'));
      const result = point.multiply(tweakNum);
      // 检查结果是否为无穷远点 (零点)
      try {
        const hex = result.toHex(compressed !== false);
        // 如果能成功转换为hex，说明不是零点
        return Buffer.from(hex, 'hex');
      } catch {
        // 转换失败可能是零点
        return null;
      }
    } catch {
      return null;
    }
  },
  
  pointCompress(p: Uint8Array, compressed?: boolean): Uint8Array {
    try {
      const point = secp.Point.fromHex(Buffer.from(p).toString('hex'));
      const hex = point.toHex(compressed !== false);
      return Buffer.from(hex, 'hex');
    } catch {
      return p;
    }
  },
  
  isXOnlyPoint(p: Uint8Array): boolean {
    if (p.length !== 32) return false;
    try {
      const hex = Buffer.from(p).toString('hex');
      secp.Point.fromHex('02' + hex);
      return true;
    } catch {
      try {
        const hex = Buffer.from(p).toString('hex');
        secp.Point.fromHex('03' + hex);
        return true;
      } catch {
        return false;
      }
    }
  },
  
  xOnlyPointAddTweak(p: Uint8Array, tweak: Uint8Array): { parity: 0 | 1; xOnlyPubkey: Uint8Array } | null {
    try {
      if (!secp.utils.isValidPrivateKey(tweak)) return null;
      const hex = Buffer.from(p).toString('hex');
      let point;
      try {
        point = secp.Point.fromHex('02' + hex);
      } catch {
        point = secp.Point.fromHex('03' + hex);
      }
      const tweakPoint = secp.Point.fromPrivateKey(tweak);
      const result = point.add(tweakPoint);
      // 检查结果是否为无穷远点 (零点)
      try {
        const resultHex = result.toHex(true);
        const resultBytes = Buffer.from(resultHex, 'hex');
        return {
          parity: resultBytes[0] === 0x02 ? 0 : 1,
          xOnlyPubkey: resultBytes.slice(1)
        };
      } catch {
        // 转换失败可能是零点
        return null;
      }
    } catch {
      return null;
    }
  },
  
  sign(h: Uint8Array, d: Uint8Array): Uint8Array {
    // @noble/secp256k1 的 signSync 返回 Signature 对象
    // 需要转换为 64 字节紧凑格式 (r + s)
    const sig = secp.signSync(h, d, { der: false });
    // 确保返回 Uint8Array 格式
    return sig instanceof Uint8Array ? sig : Uint8Array.from(sig);
  },
  
  signSchnorr(h: Uint8Array, d: Uint8Array): Uint8Array {
    return secp.schnorr.signSync(h, d);
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
};

// 初始化 bitcoinjs-lib
console.log('🔧 使用 @noble/secp256k1 初始化 ECC 库...');
try {
  bitcoin.initEccLib(ecc as any);
  console.log('✅ bitcoinjs-lib ECC 初始化成功!');
} catch (error) {
  console.error('❌ bitcoinjs-lib ECC 初始化失败:', error);
}

// 测试 ECC 方法
function testEccMethods() {
  console.log('🧪 测试 ECC 方法...');
  try {
    // 测试私钥
    const testPrivKey = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex');
    console.log('✓ isPrivate:', ecc.isPrivate(testPrivKey));
    
    // 测试生成公钥
    const pubKey = ecc.pointFromScalar(testPrivKey, true);
    console.log('✓ pointFromScalar:', pubKey ? 'OK' : 'FAILED');
    
    if (pubKey) {
      console.log('✓ isPoint:', ecc.isPoint(pubKey));
      
      // 测试 pointAdd
      const pubKey2 = ecc.pointFromScalar(Buffer.from('0000000000000000000000000000000000000000000000000000000000000002', 'hex'), true);
      if (pubKey2) {
        const added = ecc.pointAdd(pubKey, pubKey2, true);
        console.log('✓ pointAdd:', added ? 'OK' : 'FAILED');
      }
      
      // 测试 pointMultiply
      const tweak = Buffer.from('0000000000000000000000000000000000000000000000000000000000000002', 'hex');
      const multiplied = ecc.pointMultiply(pubKey, tweak, true);
      console.log('✓ pointMultiply:', multiplied ? 'OK' : 'FAILED');
      
      // 测试 sign 和 verify
      const hash = Buffer.from('0000000000000000000000000000000000000000000000000000000000000003', 'hex');
      const signature = ecc.sign(hash, testPrivKey);
      console.log('✓ sign:', signature ? `OK (${signature.length} bytes)` : 'FAILED');
      
      if (signature) {
        const verified = ecc.verify(hash, pubKey, signature);
        console.log('✓ verify:', verified);
      }
      
      // 测试 privateAdd
      const added = ecc.privateAdd(testPrivKey, tweak);
      console.log('✓ privateAdd:', added ? 'OK' : 'FAILED');
    }
  } catch (err) {
    console.error('❌ ECC 方法测试失败:', err);
  }
}

testEccMethods();

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
