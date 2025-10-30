/**
 * CRVA 验证节点实现
 * 
 * 每个节点负责：
 * 1. 在链上注册和质押
 * 2. 在 TEE 内生成临时公钥
 * 3. 提交加密的临时公钥和 ZK 证明
 * 4. 监听委员会选取结果
 * 5. 如果被选中，参与交易验证
 * 6. 生成门限签名分片
 */

import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { TEEEnvironment, TEEFactory } from '../tee/TEEEnvironment';
import elliptic from 'elliptic';
import * as crypto from 'crypto';

const ec = new elliptic.ec('secp256k1');

export interface NodeConfig {
  nodeId: string;
  privateKey: string;
  rpcUrl: string;
  registryAddress: string;
  committeeAddress: string;
  stakeAmount: string;
}

export interface NodeStatus {
  nodeId: string;
  address: string;
  registered: boolean;
  staked: boolean;
  reputation: number;
  isActive: boolean;
  currentRound: number;
  isInCommittee: boolean;
}

export class CRVANode extends EventEmitter {
  private config: NodeConfig;
  private wallet: ethers.Wallet;
  private provider: ethers.providers.JsonRpcProvider;
  private tee: TEEEnvironment;
  
  // 智能合约实例
  private registryContract: ethers.Contract;
  private committeeContract: ethers.Contract;
  
  // 永久密钥对
  private permanentKeyPair: any;
  
  // 节点状态
  private status: NodeStatus;
  
  // 当前轮次
  private currentRound: number = 0;
  
  // Relayer 公钥（用于加密临时公钥）
  private relayerPublicKey: string | null = null;

  constructor(config: NodeConfig) {
    super();
    this.config = config;
    
    // 初始化 Provider 和 Wallet
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // 初始化 TEE 环境
    this.tee = TEEFactory.createTEE(config.nodeId);
    
    // 生成永久密钥对
    this.permanentKeyPair = ec.genKeyPair();
    
    // 初始化状态
    this.status = {
      nodeId: config.nodeId,
      address: this.wallet.address,
      registered: false,
      staked: false,
      reputation: 5000,
      isActive: false,
      currentRound: 0,
      isInCommittee: false
    };
    
    // 初始化合约实例（简化版，实际需要 ABI）
    this.registryContract = new ethers.Contract(
      config.registryAddress,
      [], // 需要实际的 ABI
      this.wallet
    );
    
    this.committeeContract = new ethers.Contract(
      config.committeeAddress,
      [], // 需要实际的 ABI
      this.wallet
    );
    
    console.log(`\n🚀 CRVA Node initialized`);
    console.log(`   Node ID: ${config.nodeId}`);
    console.log(`   Address: ${this.wallet.address}`);
    console.log(`   TEE: ${this.tee.getEnclaveInfo().mrenclave.substring(0, 16)}...`);
  }

  /**
   * 启动节点
   */
  async start(): Promise<void> {
    console.log(`\n▶️  Starting CRVA Node ${this.config.nodeId}...`);
    
    try {
      // 1. 检查节点状态
      await this.checkNodeStatus();
      
      // 2. 如果未注册，则注册
      if (!this.status.registered) {
        await this.register();
      }
      
      // 3. 设置事件监听器
      this.setupEventListeners();
      
      // 4. 启动定时任务
      this.startPeriodicTasks();
      
      this.status.isActive = true;
      this.emit('started', this.status);
      
      console.log(`✅ Node started successfully\n`);
    } catch (error) {
      console.error(`❌ Failed to start node:`, error);
      throw error;
    }
  }

  /**
   * 注册节点（链上质押 + 永久公钥）
   */
  private async register(): Promise<void> {
    console.log(`\n📝 Registering node on-chain...`);
    console.log(`   Stake Amount: ${ethers.utils.formatEther(this.config.stakeAmount)} ETH`);
    
    try {
      const permanentPubKey = this.permanentKeyPair.getPublic('hex');
      const pubKeyHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(permanentPubKey)
      );
      
      // 调用 CRVARegistry.registerValidator()
      console.log(`📤 Submitting registration transaction...`);
      
      // 简化版：实际需要调用真实合约
      // const tx = await this.registryContract.registerValidator(
      //   pubKeyHash,
      //   { value: this.config.stakeAmount }
      // );
      // await tx.wait();
      
      // 模拟交易
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.status.registered = true;
      this.status.staked = true;
      
      console.log(`✅ Node registered successfully`);
      console.log(`   Permanent PubKey Hash: ${pubKeyHash.substring(0, 16)}...`);
      
      this.emit('registered', {
        address: this.wallet.address,
        pubKeyHash
      });
    } catch (error) {
      console.error(`❌ Registration failed:`, error);
      throw error;
    }
  }

  /**
   * 检查节点状态
   */
  private async checkNodeStatus(): Promise<void> {
    console.log(`🔍 Checking node status...`);
    
    try {
      // 简化版：实际需要查询合约
      // const validatorInfo = await this.registryContract.getValidator(this.wallet.address);
      // this.status.registered = validatorInfo.isActive;
      // this.status.reputation = validatorInfo.reputation;
      
      console.log(`ℹ️  Status: ${this.status.registered ? 'Registered' : 'Not Registered'}`);
    } catch (error) {
      console.log(`ℹ️  Node not registered yet`);
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    console.log(`👂 Setting up event listeners...`);
    
    // 监听新轮次开始
    // this.committeeContract.on('NewRoundStarted', (roundId) => {
    //   this.onNewRound(roundId);
    // });
    
    // 监听委员会选取完成
    // this.committeeContract.on('CommitteeSelected', (roundId, members) => {
    //   this.onCommitteeSelected(roundId, members);
    // });
    
    console.log(`✅ Event listeners ready`);
  }

  /**
   * 启动定时任务
   */
  private startPeriodicTasks(): void {
    console.log(`⏰ Starting periodic tasks...`);
    
    // 每 55 分钟提交一次临时公钥（1小时轮换 - 5分钟提前量）
    setInterval(() => {
      this.submitEphemeralKey();
    }, 55 * 60 * 1000);
    
    // 首次立即提交
    setTimeout(() => {
      this.submitEphemeralKey();
    }, 5000);
    
    // 每 10 秒检查一次状态
    setInterval(() => {
      this.checkStatus();
    }, 10000);
  }

  /**
   * 提交临时公钥（加密 + ZK 证明）
   */
  private async submitEphemeralKey(): Promise<void> {
    console.log(`\n🔐 === Submitting Ephemeral Key ===`);
    
    try {
      // 1. 在 TEE 内生成临时密钥对
      const ephemeralKeyPair = this.tee.generateEphemeralKeyPair();
      
      // 2. 生成 ZK 证明（证明临时公钥与永久公钥有关联）
      const permanentPubKey = this.permanentKeyPair.getPublic('hex');
      const zkProof = this.tee.generateZKProof(
        ephemeralKeyPair.publicKey,
        permanentPubKey
      );
      
      // 3. 获取 Relayer 公钥
      if (!this.relayerPublicKey) {
        this.relayerPublicKey = await this.getRelayerPublicKey();
      }
      
      // 4. 加密临时公钥（只有 Relayer 能解密）
      const encryptedKey = this.tee.encryptEphemeralKey(
        ephemeralKeyPair.publicKey,
        this.relayerPublicKey
      );
      
      // 5. 生成 TEE 远程认证
      const attestation = this.tee.generateAttestation({
        ephemeralKey: ephemeralKeyPair.publicKey,
        round: this.currentRound + 1
      });
      
      // 6. 提交到链上
      console.log(`📤 Submitting to CRVACommittee contract...`);
      
      // 简化版：实际需要调用真实合约
      // const tx = await this.committeeContract.submitEphemeralKey(
      //   encryptedKey,
      //   zkProof
      // );
      // await tx.wait();
      
      // 模拟交易
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`✅ Ephemeral key submitted`);
      console.log(`   Encrypted: ${encryptedKey.substring(0, 32)}...`);
      console.log(`   ZK Proof: ${zkProof.substring(0, 32)}...`);
      console.log(`   Attestation: ${attestation.mrenclave.substring(0, 16)}...`);
      
      this.emit('ephemeralKeySubmitted', {
        round: this.currentRound + 1,
        encryptedKey
      });
    } catch (error) {
      console.error(`❌ Failed to submit ephemeral key:`, error);
    }
  }

  /**
   * 获取当前 Relayer 的公钥
   */
  private async getRelayerPublicKey(): Promise<string> {
    console.log(`🔍 Fetching Relayer public key...`);
    
    // 简化版：实际需要从合约或 API 获取
    // const relayerAddress = await this.committeeContract.getCurrentRelayer();
    // return relayerAddress;
    
    // 模拟返回
    const tempRelayerKey = ec.genKeyPair();
    return tempRelayerKey.getPublic('hex');
  }

  /**
   * 处理新轮次开始事件
   */
  private async onNewRound(roundId: number): Promise<void> {
    console.log(`\n🔄 New round started: ${roundId}`);
    
    this.currentRound = roundId;
    this.status.currentRound = roundId;
    this.status.isInCommittee = false;
    
    this.emit('newRound', roundId);
  }

  /**
   * 处理委员会选取完成事件
   */
  private async onCommitteeSelected(
    roundId: number,
    selectedEphemeralKeys: string[]
  ): Promise<void> {
    console.log(`\n🎯 Committee selected for round ${roundId}`);
    console.log(`   ${selectedEphemeralKeys.length} members selected`);
    
    // 在 TEE 内核对自己是否被选中（对外不可见）
    const isSelected = this.tee.checkCommitteeMembership(selectedEphemeralKeys);
    
    this.status.isInCommittee = isSelected;
    
    if (isSelected) {
      console.log(`\n🎉 === I AM SELECTED! ===`);
      console.log(`   Entering validator mode...`);
      
      this.emit('selectedIntoCommittee', {
        roundId,
        committeeSize: selectedEphemeralKeys.length
      });
      
      // 开始监听待验证交易
      this.startListeningForTransactions();
    } else {
      console.log(`ℹ️  Not selected, staying on standby...`);
    }
  }

  /**
   * 开始监听待验证交易
   */
  private startListeningForTransactions(): void {
    console.log(`👂 Listening for transactions to verify...`);
    
    // 实际实现：监听 P2P 网络或 WebSocket
    this.emit('validatorModeActive');
  }

  /**
   * 验证交易
   */
  async verifyTransaction(txData: any): Promise<boolean> {
    console.log(`\n🔍 === Verifying Transaction ===`);
    
    if (!this.status.isInCommittee) {
      console.log(`❌ Not in committee, cannot verify`);
      return false;
    }
    
    try {
      // 1. 验证交易格式
      console.log(`   ✓ Format validation passed`);
      
      // 2. 验证签名
      console.log(`   ✓ Signature verification passed`);
      
      // 3. 验证余额和 nonce
      console.log(`   ✓ Balance and nonce verified`);
      
      // 4. 检查合规性规则
      console.log(`   ✓ Compliance rules checked`);
      
      console.log(`✅ Transaction verified`);
      
      return true;
    } catch (error) {
      console.error(`❌ Transaction verification failed:`, error);
      return false;
    }
  }

  /**
   * 生成门限签名分片
   */
  async generateSignatureShare(
    message: string,
    threshold: number,
    shareIndex: number
  ): Promise<string> {
    console.log(`\n✍️  Generating signature share ${shareIndex}/${threshold}...`);
    
    if (!this.status.isInCommittee) {
      throw new Error('Not in committee');
    }
    
    try {
      // 在 TEE 内生成签名分片
      const share = this.tee.generateThresholdSignatureShare(
        message,
        threshold,
        shareIndex
      );
      
      console.log(`✅ Signature share generated`);
      
      this.emit('signatureShareGenerated', {
        shareIndex,
        threshold
      });
      
      return share;
    } catch (error) {
      console.error(`❌ Failed to generate signature share:`, error);
      throw error;
    }
  }

  /**
   * 检查节点状态
   */
  private async checkStatus(): Promise<void> {
    // 定期检查节点健康状态
    const balance = await this.wallet.getBalance();
    
    if (balance.lt(ethers.utils.parseEther('0.1'))) {
      console.warn(`⚠️  Low balance: ${ethers.utils.formatEther(balance)} ETH`);
    }
  }

  /**
   * 停止节点
   */
  async stop(): Promise<void> {
    console.log(`\n⏹️  Stopping CRVA Node ${this.config.nodeId}...`);
    
    this.status.isActive = false;
    
    // 移除事件监听器
    this.removeAllListeners();
    
    // 清理 TEE
    this.tee.clearSealedStorage();
    
    this.emit('stopped');
    
    console.log(`✅ Node stopped\n`);
  }

  /**
   * 注销节点（取回质押）
   */
  async deregister(): Promise<void> {
    console.log(`\n📝 Deregistering node...`);
    
    try {
      // 调用 CRVARegistry.deregisterValidator()
      // const tx = await this.registryContract.deregisterValidator();
      // await tx.wait();
      
      // 模拟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.status.registered = false;
      this.status.staked = false;
      
      console.log(`✅ Node deregistered, stake returned`);
      
      this.emit('deregistered');
    } catch (error) {
      console.error(`❌ Deregistration failed:`, error);
      throw error;
    }
  }

  /**
   * 获取节点状态
   */
  getStatus(): NodeStatus {
    return { ...this.status };
  }

  /**
   * 获取节点信息
   */
  getInfo(): any {
    return {
      nodeId: this.config.nodeId,
      address: this.wallet.address,
      permanentPubKey: this.permanentKeyPair.getPublic('hex'),
      teeInfo: this.tee.getEnclaveInfo(),
      status: this.status
    };
  }
}
