/**
 * CRVA (Cryptographic Random Verification Agent) Service
 * 基于 Ring VRF 的随机验证节点选取和验证服务
 */

import { CRVAConfig, CRVANode, CRVANodeStatus, CRVAVerification } from '../../types/wallet';
import { API_CONFIG, createApiUrl, API_ENDPOINTS, apiLogger } from '../../config/api';
import { nodeDiscovery, NodeDiscoveryService } from './NodeDiscovery';

export class CRVAService {
  private config: CRVAConfig;
  
  constructor(config: CRVAConfig) {
    this.config = config;
  }

  /**
   * 使用 Ring VRF 随机选取验证节点委员会
   * @param seed 随机种子（通常是交易提案的哈希）
   * @returns 选中的验证节点列表
   */
  async selectVerificationCommittee(seed: string): Promise<CRVANode[]> {
    console.log('🎲 使用 Ring VRF 选取验证委员会...');
    
    // 过滤活跃节点
    const activeNodes = this.config.verificationNodes.filter(
      node => node.status === CRVANodeStatus.ACTIVE || node.status === CRVANodeStatus.STANDBY
    );

    if (activeNodes.length < this.config.minVerifiers) {
      throw new Error(`可用验证节点不足。需要: ${this.config.minVerifiers}, 当前: ${activeNodes.length}`);
    }

    // TODO: 实现真正的 Ring VRF 算法
    // 这里使用简化的伪随机选取作为演示
    const selectedCount = Math.min(this.config.minVerifiers, activeNodes.length);
    const selected: CRVANode[] = [];
    
    // 基于种子的伪随机选取
    const seedHash = this.hashSeed(seed);
    const sortedNodes = [...activeNodes].sort((a, b) => {
      const scoreA = this.calculateNodeScore(a, seedHash);
      const scoreB = this.calculateNodeScore(b, seedHash);
      return scoreB - scoreA;
    });

    // 选取前 N 个节点
    for (let i = 0; i < selectedCount; i++) {
      const node = { ...sortedNodes[i] };
      node.status = CRVANodeStatus.SELECTED;
      // 生成 Ring VRF 证明（简化版）
      node.ringVRFProof = await this.generateRingVRFProof(node, seed);
      selected.push(node);
    }

    console.log(`✅ 已选取 ${selected.length} 个验证节点`);
    return selected;
  }

  /**
   * 验证 Ring VRF 证明
   * @param node 验证节点
   * @param seed 随机种子
   * @param proof Ring VRF 证明
   * @returns 验证是否通过
   */
  async verifyRingVRFProof(node: CRVANode, seed: string, proof: string): Promise<boolean> {
    // TODO: 实现真正的 Ring VRF 验证
    // Ring VRF 特性：
    // 1. 可验证随机性
    // 2. 保护验证者隐私（环签名）
    // 3. 防止预测和操纵
    
    console.log(`🔍 验证节点 ${node.id} 的 Ring VRF 证明...`);
    
    // 简化验证：检查证明格式
    if (!proof || proof.length < 64) {
      return false;
    }

    // 验证证明与节点公钥和种子的关系
    const expectedPrefix = this.hashSeed(seed + node.publicKey).substring(0, 8);
    const proofPrefix = proof.substring(0, 8);
    
    return proofPrefix === expectedPrefix;
  }

  /**
   * 请求验证节点验证交易
   * @param proposalData 提案数据
   * @param committee 验证委员会
   * @returns 验证结果
   */
  async requestVerification(
    proposalData: any,
    committee: CRVANode[]
  ): Promise<CRVAVerification> {
    console.log(`📤 向 ${committee.length} 个验证节点请求验证...`);

    const verifications: CRVAVerification['verifications'] = [];
    
    // 并行请求所有委员会节点
    const verificationPromises = committee.map(async (node) => {
      try {
        // TODO: 实际应该通过网络请求节点的验证服务
        const verified = await this.requestNodeVerification(node, proposalData);
        
        return {
          nodeId: node.id,
          verified,
          timestamp: Date.now(),
          proof: await this.generateVerificationProof(node, proposalData, verified)
        };
      } catch (error) {
        console.error(`节点 ${node.id} 验证失败:`, error);
        return {
          nodeId: node.id,
          verified: false,
          timestamp: Date.now(),
          proof: ''
        };
      }
    });

    const results = await Promise.all(verificationPromises);
    verifications.push(...results);

    // 统计验证结果
    const approvedCount = verifications.filter(v => v.verified).length;
    const consensusReached = approvedCount >= Math.ceil(committee.length * 0.66); // 2/3 共识

    console.log(`✅ 验证完成: ${approvedCount}/${committee.length} 通过`);

    return {
      verificationId: `vrfy_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      committeeNodes: committee.map(n => n.id),
      ringVRFProof: this.config.ringVRFPublicKey,
      verifications,
      consensusReached,
      consensusTimestamp: consensusReached ? Date.now() : undefined
    };
  }

  /**
   * 检查委员会是否需要轮换
   * @returns 是否需要轮换
   */
  shouldRotateCommittee(): boolean {
    const now = Date.now();
    const timeSinceRotation = now - this.config.lastRotation;
    return timeSinceRotation >= this.config.committeeTTL * 1000;
  }

  /**
   * 更新节点信誉分数
   * @param nodeId 节点ID
   * @param delta 分数变化（正数增加，负数减少）
   */
  updateNodeReputation(nodeId: string, delta: number): void {
    const node = this.config.verificationNodes.find(n => n.id === nodeId);
    if (node) {
      node.reputation = Math.max(0, Math.min(100, node.reputation + delta));
      
      // 信誉过低自动封禁
      if (node.reputation < 20) {
        node.status = CRVANodeStatus.BANNED;
        console.warn(`⚠️ 节点 ${nodeId} 信誉过低，已封禁`);
      }
    }
  }

  // ========== 私有辅助方法 ==========

  /**
   * 哈希种子
   */
  private hashSeed(seed: string): string {
    // 简化的哈希函数（实际应使用 SHA-256 或 Blake2b）
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * 计算节点分数（用于排序）
   */
  private calculateNodeScore(node: CRVANode, seedHash: string): number {
    // 结合节点信誉和伪随机数
    const nodeHash = this.hashSeed(node.id + seedHash);
    const randomScore = parseInt(nodeHash.substring(0, 8), 16);
    
    // 信誉权重 40%，随机性 60%
    return node.reputation * 0.4 + (randomScore % 100) * 0.6;
  }

  /**
   * 生成 Ring VRF 证明（简化版）
   */
  private async generateRingVRFProof(node: CRVANode, seed: string): Promise<string> {
    // TODO: 实现真正的 Ring VRF 证明生成
    // Ring VRF 需要：
    // 1. 环签名密钥
    // 2. VRF 密钥对
    // 3. 随机种子
    
    const proofData = seed + node.publicKey + Date.now();
    return this.hashSeed(proofData);
  }

  /**
   * 请求单个节点验证
   */
  private async requestNodeVerification(node: CRVANode, _proposalData: any): Promise<boolean> {
    // TODO: 实际网络请求
    // 这里模拟验证逻辑
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // 基于节点信誉的模拟验证结果
    const successRate = node.reputation / 100;
    return Math.random() < successRate;
  }

  /**
   * 生成验证证明
   */
  private async generateVerificationProof(
    node: CRVANode,
    proposalData: any,
    verified: boolean
  ): Promise<string> {
    // 生成验证证明（包含节点签名）
    const proofData = JSON.stringify({
      nodeId: node.id,
      proposalHash: this.hashSeed(JSON.stringify(proposalData)),
      verified,
      timestamp: Date.now()
    });
    
    return this.hashSeed(proofData);
  }
}

/**
 * 创建默认的 CRVA 配置
 */
export async function createDefaultCRVAConfig(): Promise<CRVAConfig> {
  console.log('🔍 开始去中心化节点发现...');
  
  // 启动节点发现服务
  await nodeDiscovery.start();
  
  // 获取发现的节点
  const discoveredNodes = nodeDiscovery.getActiveNodes();
  
  if (discoveredNodes.length > 0) {
    console.log(`✅ 发现 ${discoveredNodes.length} 个活跃的 CRVA 验证节点`);
    
    return {
      enabled: true,
      verificationNodes: discoveredNodes,
      minVerifiers: Math.min(3, discoveredNodes.length),
      ringVRFPublicKey: '0xRingVRF...Discovered',
      committeeTTL: 3600,
      lastRotation: Date.now()
    };
  }
  
  // 如果节点发现失败，尝试从本地 API 获取（仅开发模式）
  if (API_CONFIG.devMode) {
    try {
      apiLogger.info('从本地 API 获取验证节点列表...');
      const response = await fetch(createApiUrl(API_ENDPOINTS.nodes));
      
      if (response.ok) {
        const data = await response.json();
        const nodes = data.nodes || [];
        
        if (nodes.length > 0) {
          apiLogger.info(`成功获取 ${nodes.length} 个验证节点`);
          
          // 将 API 返回的节点转换为 CRVANode 格式
          const crvaNodes: CRVANode[] = nodes.map((node: any) => ({
            id: node.id || node.nodeId,
            endpoint: node.endpoint || `${API_CONFIG.baseURL}/api/nodes/${node.id}`,
            publicKey: node.publicKey || node.address,
            status: node.status === 'active' ? CRVANodeStatus.ACTIVE : CRVANodeStatus.STANDBY,
            lastActive: node.lastActive || Date.now(),
            reputation: node.reputation || 90
          }));
          
          return {
            enabled: API_CONFIG.crva.enabled,
            verificationNodes: crvaNodes,
            minVerifiers: API_CONFIG.crva.minVerifiers,
            ringVRFPublicKey: '0xRingVRF...LocalDev',
            committeeTTL: 3600,
            lastRotation: Date.now()
          };
        }
      }
    } catch (error) {
      apiLogger.warn('无法连接到本地 API，使用模拟节点', error);
    }
  }
  
  // 如果无法获取真实节点，创建模拟的验证节点网络
  apiLogger.warn('⚠️ 节点发现失败，使用模拟节点网络（仅用于测试）');
  const mockNodes: CRVANode[] = [
    {
      id: 'node_001',
      endpoint: `${API_CONFIG.baseURL}/api/nodes/node_001`,
      publicKey: '0x1234...node1',
      status: CRVANodeStatus.ACTIVE,
      lastActive: Date.now(),
      reputation: 95
    },
    {
      id: 'node_002',
      endpoint: `${API_CONFIG.baseURL}/api/nodes/node_002`,
      publicKey: '0x5678...node2',
      status: CRVANodeStatus.ACTIVE,
      lastActive: Date.now(),
      reputation: 92
    },
    {
      id: 'node_003',
      endpoint: `${API_CONFIG.baseURL}/api/nodes/node_003`,
      publicKey: '0x9abc...node3',
      status: CRVANodeStatus.ACTIVE,
      lastActive: Date.now(),
      reputation: 88
    },
    {
      id: 'node_004',
      endpoint: `${API_CONFIG.baseURL}/api/nodes/node_004`,
      publicKey: '0xdef0...node4',
      status: CRVANodeStatus.STANDBY,
      lastActive: Date.now(),
      reputation: 85
    },
    {
      id: 'node_005',
      endpoint: `${API_CONFIG.baseURL}/api/nodes/node_005`,
      publicKey: '0x3456...node5',
      status: CRVANodeStatus.STANDBY,
      lastActive: Date.now(),
      reputation: 90
    }
  ];

  return {
    enabled: API_CONFIG.crva.enabled,
    verificationNodes: mockNodes,
    minVerifiers: API_CONFIG.crva.minVerifiers,
    ringVRFPublicKey: '0xRingVRF...PublicKey',
    committeeTTL: 3600, // 1小时
    lastRotation: Date.now()
  };
}
