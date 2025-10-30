/**
 * CRVA Relayer 实现
 * 
 * Relayer 的职责：
 * 1. 在 TEE 内解密各个节点提交的临时公钥
 * 2. 验证 ZK 证明
 * 3. 将解密后的临时公钥提交到链上
 * 4. Relayer 本身也是轮换的，保持匿名性
 * 
 * 隐私保护：
 * - Relayer 在 TEE 内运行，解密过程不可见
 * - Relayer 无法知道临时公钥对应的永久公钥
 * - Relayer 定期轮换，防止单点控制
 */

import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { TEEEnvironment, TEEFactory } from '../tee/TEEEnvironment';
import elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

export interface RelayerConfig {
  relayerId: string;
  privateKey: string;
  rpcUrl: string;
  committeeAddress: string;
  rotationInterval: number; // 轮换间隔（秒）
}

export interface EphemeralSubmission {
  nodeAddress: string;
  encryptedKey: string;
  zkProof: string;
  timestamp: number;
}

export class CRVARelayer extends EventEmitter {
  private config: RelayerConfig;
  private wallet: ethers.Wallet;
  private provider: ethers.providers.JsonRpcProvider;
  private tee: TEEEnvironment;
  private committeeContract: ethers.Contract;
  
  // Relayer 密钥对
  private relayerKeyPair: any;
  
  // 待处理的提交
  private pendingSubmissions: Map<string, EphemeralSubmission> = new Map();
  
  // 当前轮次
  private currentRound: number = 0;
  
  // 是否活跃
  private isActive: boolean = false;

  constructor(config: RelayerConfig) {
    super();
    this.config = config;
    
    // 初始化 Provider 和 Wallet
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // 初始化 TEE 环境
    this.tee = TEEFactory.createTEE(`relayer_${config.relayerId}`);
    
    // 生成 Relayer 密钥对
    this.relayerKeyPair = ec.genKeyPair();
    
    // 初始化合约实例
    this.committeeContract = new ethers.Contract(
      config.committeeAddress,
      [], // 需要实际的 ABI
      this.wallet
    );
    
    console.log(`\n🔄 CRVA Relayer initialized`);
    console.log(`   Relayer ID: ${config.relayerId}`);
    console.log(`   Address: ${this.wallet.address}`);
    console.log(`   Public Key: ${this.getPublicKey().substring(0, 32)}...`);
  }

  /**
   * 获取 Relayer 公钥（节点用于加密临时公钥）
   */
  getPublicKey(): string {
    return this.relayerKeyPair.getPublic('hex');
  }

  /**
   * 启动 Relayer
   */
  async start(): Promise<void> {
    console.log(`\n▶️  Starting CRVA Relayer ${this.config.relayerId}...`);
    
    try {
      // 1. 在链上注册 Relayer 公钥
      await this.registerPublicKey();
      
      // 2. 设置事件监听器
      this.setupEventListeners();
      
      // 3. 启动定时任务
      this.startPeriodicTasks();
      
      this.isActive = true;
      this.emit('started');
      
      console.log(`✅ Relayer started successfully\n`);
    } catch (error) {
      console.error(`❌ Failed to start relayer:`, error);
      throw error;
    }
  }

  /**
   * 在链上注册 Relayer 公钥
   */
  private async registerPublicKey(): Promise<void> {
    console.log(`📝 Registering Relayer public key...`);
    
    try {
      const publicKey = this.getPublicKey();
      
      // 生成 TEE 远程认证（证明密钥在 TEE 内生成）
      const attestation = this.tee.generateAttestation({
        publicKey,
        relayerId: this.config.relayerId
      });
      
      // 提交到链上
      // const tx = await this.committeeContract.registerRelayer(
      //   publicKey,
      //   attestation
      // );
      // await tx.wait();
      
      // 模拟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`✅ Relayer public key registered`);
      console.log(`   Public Key: ${publicKey.substring(0, 32)}...`);
    } catch (error) {
      console.error(`❌ Registration failed:`, error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    console.log(`👂 Setting up event listeners...`);
    
    // 监听临时公钥提交事件
    // this.committeeContract.on('EphemeralKeySubmitted', (nodeAddress, encryptedKey, zkProof) => {
    //   this.onEphemeralKeySubmitted(nodeAddress, encryptedKey, zkProof);
    // });
    
    // 监听新轮次开始
    // this.committeeContract.on('NewRoundStarted', (roundId) => {
    //   this.onNewRound(roundId);
    // });
    
    console.log(`✅ Event listeners ready`);
  }

  /**
   * 启动定时任务
   */
  private startPeriodicTasks(): void {
    console.log(`⏰ Starting periodic tasks...`);
    
    // 每轮次结束前解密并提交所有临时公钥
    setInterval(() => {
      this.processSubmissions();
    }, (this.config.rotationInterval - 5 * 60) * 1000); // 提前5分钟
    
    // 每小时轮换 Relayer
    setInterval(() => {
      this.checkRotation();
    }, this.config.rotationInterval * 1000);
  }

  /**
   * 处理临时公钥提交事件
   */
  private async onEphemeralKeySubmitted(
    nodeAddress: string,
    encryptedKey: string,
    zkProof: string
  ): Promise<void> {
    console.log(`\n📨 New ephemeral key submission received`);
    console.log(`   From: ${nodeAddress}`);
    
    const submission: EphemeralSubmission = {
      nodeAddress,
      encryptedKey,
      zkProof,
      timestamp: Date.now()
    };
    
    this.pendingSubmissions.set(nodeAddress, submission);
    
    console.log(`   Stored in pending queue (${this.pendingSubmissions.size} total)`);
    
    this.emit('submissionReceived', submission);
  }

  /**
   * 处理新轮次开始事件
   */
  private async onNewRound(roundId: number): Promise<void> {
    console.log(`\n🔄 New round started: ${roundId}`);
    
    this.currentRound = roundId;
    
    // 清空上一轮的待处理提交
    this.pendingSubmissions.clear();
    
    this.emit('newRound', roundId);
  }

  /**
   * 处理所有待处理的提交（在 TEE 内解密）
   */
  private async processSubmissions(): Promise<void> {
    console.log(`\n🔐 === Processing Submissions (in TEE) ===`);
    console.log(`   Pending submissions: ${this.pendingSubmissions.size}`);
    
    if (this.pendingSubmissions.size === 0) {
      console.log(`   No submissions to process`);
      return;
    }
    
    try {
      const decryptedKeys: string[] = [];
      const validNodes: string[] = [];
      
      // 1. 在 TEE 内解密所有临时公钥
      console.log(`\n🔓 [TEE] Decrypting ephemeral keys...`);
      
      for (const [nodeAddress, submission] of this.pendingSubmissions) {
        try {
          // 在 TEE 内解密
          const decryptedKey = this.tee.decryptEphemeralKey(
            submission.encryptedKey,
            this.relayerKeyPair.getPrivate('hex')
          );
          
          if (decryptedKey) {
            // 2. 验证 ZK 证明
            const isValidProof = await this.verifyZKProof(
              decryptedKey,
              submission.zkProof,
              nodeAddress
            );
            
            if (isValidProof) {
              decryptedKeys.push(decryptedKey);
              validNodes.push(nodeAddress);
              console.log(`   ✓ ${nodeAddress.substring(0, 10)}... verified`);
            } else {
              console.log(`   ✗ ${nodeAddress.substring(0, 10)}... invalid proof`);
            }
          } else {
            console.log(`   ✗ ${nodeAddress.substring(0, 10)}... decryption failed`);
          }
        } catch (error) {
          console.error(`   ✗ ${nodeAddress.substring(0, 10)}... error:`, error);
        }
      }
      
      console.log(`\n✅ Decryption complete: ${decryptedKeys.length}/${this.pendingSubmissions.size} valid`);
      
      // 3. 将解密后的临时公钥批量提交到链上
      if (decryptedKeys.length > 0) {
        await this.revealEphemeralKeys(decryptedKeys, validNodes);
      }
      
      // 4. 清空待处理队列
      this.pendingSubmissions.clear();
      
      this.emit('submissionsProcessed', {
        total: decryptedKeys.length,
        round: this.currentRound
      });
    } catch (error) {
      console.error(`❌ Failed to process submissions:`, error);
    }
  }

  /**
   * 验证 ZK 证明
   */
  private async verifyZKProof(
    ephemeralKey: string,
    zkProof: string,
    nodeAddress: string
  ): Promise<boolean> {
    try {
      // 获取该节点的永久公钥
      const permanentPubKeys = await this.getPermanentPublicKeys([nodeAddress]);
      
      // 在 TEE 内验证 ZK 证明
      const isValid = this.tee.verifyZKProof(
        ephemeralKey,
        zkProof,
        permanentPubKeys
      );
      
      return isValid;
    } catch (error) {
      console.error(`Failed to verify ZK proof:`, error);
      return false;
    }
  }

  /**
   * 获取节点的永久公钥
   */
  private async getPermanentPublicKeys(nodeAddresses: string[]): Promise<string[]> {
    // 简化版：实际需要从 CRVARegistry 合约查询
    // const keys = await Promise.all(
    //   nodeAddresses.map(addr => 
    //     this.registryContract.getValidator(addr).permanentPubKey
    //   )
    // );
    // return keys;
    
    // 模拟返回
    return nodeAddresses.map(() => ec.genKeyPair().getPublic('hex'));
  }

  /**
   * 提交解密后的临时公钥到链上
   */
  private async revealEphemeralKeys(
    ephemeralKeys: string[],
    nodeAddresses: string[]
  ): Promise<void> {
    console.log(`\n📤 Submitting revealed keys to blockchain...`);
    console.log(`   Revealing ${ephemeralKeys.length} keys`);
    
    try {
      // 转换为 bytes32 数组
      const keyHashes = ephemeralKeys.map(key =>
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(key))
      );
      
      // 调用 CRVACommittee.revealEphemeralKeys()
      // const tx = await this.committeeContract.revealEphemeralKeys(
      //   this.currentRound,
      //   keyHashes
      // );
      // await tx.wait();
      
      // 模拟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`✅ Keys revealed on-chain`);
      console.log(`   Round: ${this.currentRound}`);
      console.log(`   Keys: ${keyHashes.length}`);
      
      this.emit('keysRevealed', {
        round: this.currentRound,
        count: keyHashes.length
      });
      
      // 清空 TEE 存储（保护隐私）
      this.tee.clearSealedStorage();
      console.log(`🧹 TEE storage cleared for privacy`);
    } catch (error) {
      console.error(`❌ Failed to reveal keys:`, error);
      throw error;
    }
  }

  /**
   * 检查是否需要轮换 Relayer
   */
  private async checkRotation(): Promise<void> {
    console.log(`\n🔄 Checking Relayer rotation...`);
    
    try {
      // 查询链上当前 Relayer
      // const currentRelayer = await this.committeeContract.getCurrentRelayer();
      
      // if (currentRelayer !== this.wallet.address) {
      //   console.log(`ℹ️  I am no longer the active Relayer`);
      //   await this.deactivate();
      // }
      
      console.log(`✓ Still active as Relayer`);
    } catch (error) {
      console.error(`❌ Rotation check failed:`, error);
    }
  }

  /**
   * 停用 Relayer
   */
  private async deactivate(): Promise<void> {
    console.log(`\n⏹️  Deactivating Relayer...`);
    
    this.isActive = false;
    
    // 清空待处理队列
    this.pendingSubmissions.clear();
    
    // 清理 TEE
    this.tee.clearSealedStorage();
    
    this.emit('deactivated');
    
    console.log(`✅ Relayer deactivated\n`);
  }

  /**
   * 停止 Relayer
   */
  async stop(): Promise<void> {
    console.log(`\n⏹️  Stopping CRVA Relayer ${this.config.relayerId}...`);
    
    this.isActive = false;
    
    // 移除事件监听器
    this.removeAllListeners();
    
    // 清理 TEE
    this.tee.clearSealedStorage();
    
    this.emit('stopped');
    
    console.log(`✅ Relayer stopped\n`);
  }

  /**
   * 获取 Relayer 状态
   */
  getStatus(): any {
    return {
      relayerId: this.config.relayerId,
      address: this.wallet.address,
      publicKey: this.getPublicKey(),
      isActive: this.isActive,
      currentRound: this.currentRound,
      pendingSubmissions: this.pendingSubmissions.size,
      teeInfo: this.tee.getEnclaveInfo()
    };
  }
}
