# 商用多签钱包签名方案

## 🎯 方案概述

### 核心原理
多签钱包的每个签名者使用**自己的热钱包私钥**对提案进行签名，而不是使用多签钱包本身的私钥（多签钱包不应该有私钥）。

## 📐 架构设计

### 1. 钱包关系

```
┌─────────────────────────────────────────┐
│        DeepSafe 多签钱包                  │
│    地址: 0xABCD...（无私钥）              │
└─────────────────────────────────────────┘
              │
              │ 由多个签名者控制 (2-of-3)
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│签名者A │ │签名者B │ │签名者C │
│热钱包  │ │热钱包  │ │热钱包  │
│有私钥  │ │有私钥  │ │有私钥  │
└────────┘ └────────┘ └────────┘
```

### 2. 签名流程

```
1. 签名者A 创建提案
   ├─ 构建交易数据
   ├─ 使用签名者A的热钱包私钥签名
   └─ 保存提案 (1/3 签名)

2. 签名者B 签名提案
   ├─ 扫描提案二维码
   ├─ 使用签名者B的热钱包私钥签名
   └─ 更新提案 (2/3 签名)

3. 达到阈值 (2/3)
   ├─ CRVA 验证所有签名
   ├─ 构建最终交易
   └─ 广播到区块链
```

## 🔐 签名实现

### 以太坊签名（EIP-191）

```typescript
// 1. 准备签名消息
const proposalData = {
  id: proposalId,
  walletId: multisigWallet.id,
  transaction: {
    from: multisigWallet.address,
    to: recipientAddress,
    amount: amount,
    // ...
  }
};

const messageToSign = JSON.stringify(proposalData);

// 2. 查找签名者的热钱包
const signerWallet = wallets.find(w => 
  w.address === signerAddress && 
  w.type === WalletType.HOT && 
  w.privateKey
);

// 3. 使用 ethers.js 签名（EIP-191 标准）
const { ethers } = await import('ethers');
const wallet = new ethers.Wallet(signerWallet.privateKey);
const signature = await wallet.signMessage(messageToSign);

// 签名格式: 0x[r(32字节)][s(32字节)][v(1字节)]
// 示例: 0x8a3f2...a1b2c3d

// 4. 验证签名
const recoveredAddress = ethers.verifyMessage(messageToSign, signature);
assert(recoveredAddress === signerAddress, '签名验证失败');
```

### 比特币签名（ECDSA）

```typescript
// 1. 准备签名消息
const messageToSign = JSON.stringify(proposalData);

// 2. 使用 bitcoinjs-lib 签名
const { ECPairFactory } = await import('ecpair');
const ecc = await import('tiny-secp256k1');

const ECPair = ECPairFactory(ecc);
const keyPair = ECPair.fromPrivateKey(
  Buffer.from(signerWallet.privateKey.replace('0x', ''), 'hex')
);

// 3. 对消息哈希签名
const messageHash = await crypto.subtle.digest(
  'SHA-256',
  new TextEncoder().encode(messageToSign)
);

const signature = keyPair.sign(Buffer.from(messageHash));
const signatureHex = `0x${signature.toString('hex')}`;

// 签名格式: 0x[r(32字节)][s(32字节)]
// DER 编码的 ECDSA 签名
```

## 📊 数据结构

### 提案（Proposal）

```typescript
interface MultisigProposal {
  id: string;                     // 提案ID
  walletId: string;               // 多签钱包ID
  type: 'TRANSFER' | 'CONTRACT';  // 提案类型
  
  transaction: {
    from: string;                 // 多签钱包地址
    to: string;                   // 接收地址
    amount: string;               // 金额
    fee: string;                  // 手续费
    chain: ChainType;             // 链类型
    network: NetworkType;         // 网络类型
    memo?: string;                // 备注
  };
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  creator: string;                // 创建者地址
  createdAt: number;              // 创建时间
  expiresAt: number;              // 过期时间
  
  signatures: Signature[];        // 签名列表
  requiredSignatures: number;     // 需要的签名数量（M）
  
  crvaVerification?: {            // CRVA 验证结果
    committee: string[];          // 验证委员会
    verified: boolean;            // 是否通过
    timestamp: number;            // 验证时间
  };
}
```

### 签名（Signature）

```typescript
interface Signature {
  signer: string;                 // 签名者地址
  signedAt: number;               // 签名时间
  signature: string;              // 签名数据（EIP-191 或 ECDSA）
  status: 'APPROVED' | 'REJECTED';// 签名状态
}
```

## 🔒 安全保障

### 1. 私钥隔离
- ✅ 多签钱包**不存储**任何私钥
- ✅ 每个签名者使用**独立的**热钱包私钥
- ✅ 私钥永远不离开签名者设备

### 2. 签名验证

```typescript
// ETH 签名验证
function verifyEthSignature(
  message: string,
  signature: string,
  expectedSigner: string
): boolean {
  const recoveredAddress = ethers.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
}

// BTC 签名验证
function verifyBtcSignature(
  messageHash: Buffer,
  signature: Buffer,
  publicKey: Buffer
): boolean {
  const keyPair = ECPair.fromPublicKey(publicKey);
  return keyPair.verify(messageHash, signature);
}
```

### 3. 提案完整性

```typescript
// 提案哈希（防篡改）
function calculateProposalHash(proposal: MultisigProposal): string {
  const dataToHash = {
    id: proposal.id,
    walletId: proposal.walletId,
    transaction: proposal.transaction,
    creator: proposal.creator,
    createdAt: proposal.createdAt
  };
  
  return keccak256(JSON.stringify(dataToHash));
}
```

### 4. CRVA 隐私验证

```typescript
// 使用 Ring VRF 验证签名者身份，但不暴露具体是谁
async function crvaVerify(proposal: MultisigProposal): Promise<boolean> {
  // 1. 选取验证委员会
  const committee = await selectVerificationCommittee(proposal.id);
  
  // 2. Ring VRF 验证
  for (const signature of proposal.signatures) {
    const verified = await ringVRF.verify(
      signature.signature,
      proposal.transaction,
      multisigWallet.signers // Ring 集合
    );
    
    if (!verified) return false;
  }
  
  return true;
}
```

## 🚀 使用流程

### 场景：2-of-3 多签钱包转账

#### 步骤1：创建多签钱包

```typescript
// Alice, Bob, Charlie 三人创建 2-of-3 多签钱包
const multisigWallet = await createMultisigWallet({
  m: 2,  // 需要2个签名
  n: 3,  // 总共3个签名者
  signers: [
    { address: aliceWallet.address, publicKey: aliceWallet.publicKey, isMe: true },
    { address: bobWallet.address, publicKey: bobWallet.publicKey, isMe: false },
    { address: charlieWallet.address, publicKey: charlieWallet.publicKey, isMe: false }
  ],
  chain: ChainType.ETH
});

// 多签钱包地址: 0xMultisig...
// 注意：这个地址没有私钥！
```

#### 步骤2：Alice 创建转账提案

```typescript
// Alice 使用自己的热钱包私钥创建提案
const proposal = await createMultisigProposal({
  from: multisigWallet.address,
  to: '0xRecipient...',
  amount: '1.0 ETH'
});

// Alice 自动签名（使用 aliceWallet.privateKey）
// 提案状态: 1/2 签名
// 生成二维码分享给 Bob 和 Charlie
```

#### 步骤3：Bob 扫描并签名

```typescript
// Bob 扫描提案二维码
const proposal = parseQRCode(qrData);

// Bob 使用自己的热钱包私钥签名
await signProposal(proposal.id, bobWallet);

// 提案状态: 2/2 签名 ✅ 达到阈值！
```

#### 步骤4：自动执行

```typescript
// 检查签名数量
if (proposal.signatures.length >= proposal.requiredSignatures) {
  // CRVA 验证所有签名
  const crvaVerified = await crvaVerify(proposal);
  
  if (crvaVerified) {
    // 构建并广播交易
    const tx = await buildMultisigTransaction(proposal);
    const txHash = await broadcastTransaction(tx);
    
    console.log('✅ 交易已广播:', txHash);
    proposal.status = 'EXECUTED';
  }
}
```

## 📱 二维码分享

### 提案二维码格式

```typescript
interface ProposalQRData {
  protocol: 'WDK';
  version: '1.0';
  type: 'MULTISIG_PROPOSAL';
  data: {
    id: string;
    walletId: string;
    transaction: Transaction;
    signatures: Signature[];
    requiredSignatures: number;
  };
}

// 生成二维码
const qrCode = await QRCode.toDataURL(
  JSON.stringify(proposalQRData),
  { width: 300, errorCorrectionLevel: 'M' }
);
```

### 扫描流程

```typescript
// 扫描提案二维码
const scannedData = await scanQRCode();
const proposal = JSON.parse(scannedData);

// 验证提案有效性
if (proposal.protocol !== 'WDK') throw new Error('无效的提案');
if (proposal.type !== 'MULTISIG_PROPOSAL') throw new Error('不是多签提案');

// 加载到钱包
await importProposal(proposal);
```

## 🔄 与智能合约集成

### 以太坊多签合约

```solidity
contract MultiSigWallet {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    
    address[] public owners;
    uint256 public required;
    
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    // 提交交易
    function submitTransaction(
        address to,
        uint256 value,
        bytes memory data
    ) public returns (uint256) {
        require(isOwner[msg.sender], "Not owner");
        // ...
    }
    
    // 确认交易（签名）
    function confirmTransaction(uint256 txId) public {
        require(isOwner[msg.sender], "Not owner");
        require(!confirmations[txId][msg.sender], "Already confirmed");
        
        confirmations[txId][msg.sender] = true;
        transactions[txId].numConfirmations += 1;
        
        // 达到阈值自动执行
        if (transactions[txId].numConfirmations >= required) {
            executeTransaction(txId);
        }
    }
}
```

## 📊 对比：演示方案 vs 商用方案

| 特性 | 演示方案（旧） | 商用方案（新） |
|------|---------------|---------------|
| 签名方式 | 哈希+公钥拼接 | EIP-191 / ECDSA |
| 私钥使用 | 模拟签名 | 真实私钥签名 |
| 签名验证 | 无法验证 | 可完全验证 |
| 安全性 | ❌ 不安全 | ✅ 生产级 |
| 兼容性 | ❌ 自定义 | ✅ 标准协议 |
| 与合约集成 | ❌ 无法集成 | ✅ 完全兼容 |
| 签名恢复 | ❌ 不支持 | ✅ 支持 ecrecover |

## 🎯 最佳实践

### 1. 签名者管理
- 每个签名者维护独立的热钱包
- 定期轮换签名者（如员工离职）
- 使用硬件钱包增强安全性

### 2. 提案管理
- 设置合理的过期时间（如7天）
- 重要提案增加审批流程
- 保存完整的提案历史记录

### 3. 阈值设置
- **低风险**：1-of-2（日常运营）
- **中风险**：2-of-3（资金转账）
- **高风险**：3-of-5（大额交易）

### 4. 应急预案
- 保留紧急恢复机制
- 定期备份提案数据
- 制定签名者失联方案

## 🔗 相关标准

- [EIP-191](https://eips.ethereum.org/EIPS/eip-191): Signed Data Standard
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712): Typed structured data hashing and signing
- [BIP-340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki): Schnorr Signatures for secp256k1

## 📚 参考资料

- [Gnosis Safe](https://gnosis-safe.io/) - 以太坊多签钱包标准
- [Bitcoin Multi-signature](https://bitcoin.org/en/developer-guide#multisig) - 比特币多签指南
- [ethers.js Signing](https://docs.ethers.org/v6/api/wallet/#Wallet-signMessage) - 以太坊签名文档
