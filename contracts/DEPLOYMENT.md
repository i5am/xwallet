# 🚀 CRVA 智能合约部署指南

## ✅ 编译成功

合约已成功编译！生成的文件：
- `artifacts/` - 编译后的合约 ABI 和字节码
- `typechain-types/` - TypeScript 类型定义

## 📋 部署前准备

### 1. 获取测试币

部署到 Sepolia 测试网需要测试 ETH。推荐水龙头：

**Sepolia Faucets:**
- 🔗 https://sepoliafaucet.com/
- 🔗 https://www.alchemy.com/faucets/ethereum-sepolia  
- 🔗 https://faucet.quicknode.com/ethereum/sepolia
- 🔗 https://sepolia-faucet.pk910.de/

每个水龙头通常提供 0.5-1 ETH，足够部署使用。

### 2. 配置环境变量

创建 `.env` 文件（从 `.env.example` 复制）：

\`\`\`bash
cd d:\\projects\\wdk\\contracts
cp .env.example .env
\`\`\`

编辑 `.env` 文件，填入以下信息：

\`\`\`env
# 部署者私钥（MetaMask 导出）
DEPLOYER_PRIVATE_KEY=0x您的私钥...

# Sepolia RPC（使用公共节点或 Infura/Alchemy）
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Etherscan API Key（可选，用于合约验证）
# 注册地址: https://etherscan.io/apis
ETHERSCAN_API_KEY=您的API密钥
\`\`\`

**⚠️ 安全提示：**
- ❌ 不要将 `.env` 文件提交到 Git
- ❌ 不要在主网使用测试网私钥
- ✅ 使用专门的测试账户

### 3. 检查账户余额

\`\`\`powershell
cd d:\\projects\\wdk\\contracts
npx hardhat run scripts/check-balance.ts --network sepolia
\`\`\`

## 🚀 部署步骤

### 方案 1: 部署到 Sepolia 测试网（推荐）

\`\`\`powershell
cd d:\\projects\\wdk\\contracts
npm run deploy:sepolia
\`\`\`

### 方案 2: 部署到本地测试网（快速测试）

**终端 1** - 启动本地节点：
\`\`\`powershell
cd d:\\projects\\wdk\\contracts
npx hardhat node
\`\`\`

**终端 2** - 部署合约：
\`\`\`powershell
cd d:\\projects\\wdk\\contracts
npm run deploy:localhost
\`\`\`

## 📊 部署后操作

### 1. 查看部署信息

部署完成后，信息会保存在：
- `deployments/sepolia_latest.json` - 最新部署
- `deployments/sepolia_<timestamp>.json` - 历史记录

示例输出：
\`\`\`json
{
  "network": "sepolia",
  "contracts": {
    "CRVARegistry": {
      "address": "0x...",
      "txHash": "0x..."
    },
    "CRVACommittee": {
      "address": "0x...",
      "txHash": "0x..."
    },
    "ThresholdSignature": {
      "address": "0x...",
      "txHash": "0x..."
    }
  }
}
\`\`\`

### 2. 配置后端服务

将合约地址复制到 `server/.env`:

\`\`\`env
CRVA_REGISTRY_ADDRESS=0x...
CRVA_COMMITTEE_ADDRESS=0x...
CRVA_THRESHOLD_ADDRESS=0x...
ETH_RPC_URL=https://rpc.sepolia.org
CHAIN_ID=11155111
\`\`\`

### 3. 验证合约（可选）

在 Etherscan 上验证合约源码：

\`\`\`powershell
# CRVARegistry
npx hardhat verify --network sepolia <REGISTRY_ADDRESS>

# CRVACommittee
npx hardhat verify --network sepolia <COMMITTEE_ADDRESS> <REGISTRY_ADDRESS>

# ThresholdSignature
npx hardhat verify --network sepolia <THRESHOLD_ADDRESS> <COMMITTEE_ADDRESS>
\`\`\`

### 4. 在区块链浏览器查看

Sepolia 浏览器：
- 🔗 https://sepolia.etherscan.io/

搜索合约地址，可以看到：
- ✅ 合约代码
- ✅ 交易历史
- ✅ 事件日志
- ✅ 读写合约功能

## 🧪 测试合约

### 使用 Hardhat Console

\`\`\`powershell
npx hardhat console --network sepolia
\`\`\`

\`\`\`javascript
// 连接到合约
const registry = await ethers.getContractAt(
  "CRVARegistry", 
  "0x合约地址"
);

// 查询信息
const count = await registry.totalValidators();
console.log("Total validators:", count.toString());

// 注册节点（需要发送 10 ETH）
const pubKey = ethers.keccak256(ethers.toUtf8Bytes("test_pubkey"));
const tx = await registry.registerValidator(pubKey, {
  value: ethers.parseEther("10")
});
await tx.wait();
\`\`\`

## 📚 常见问题

### Q: 部署失败 "insufficient funds"
**A:** 账户余额不足，需要从水龙头获取更多测试币

### Q: 部署失败 "nonce too low"  
**A:** 交易 nonce 冲突，等待几秒后重试

### Q: Gas 估算失败
**A:** 合约代码可能有问题，检查构造函数参数

### Q: 如何重新部署？
**A:** 直接再次运行部署命令，会部署新的合约实例

### Q: 测试币不够用怎么办？
**A:** 多个水龙头轮流领取，或等待 24 小时后再领

## 🔗 有用链接

- Hardhat 文档: https://hardhat.org/docs
- Sepolia 区块链浏览器: https://sepolia.etherscan.io/
- Sepolia 水龙头: https://sepoliafaucet.com/
- OpenZeppelin 合约: https://docs.openzeppelin.com/contracts/

## 🎉 下一步

部署完成后，您可以：

1. ✅ 在前端集成合约
2. ✅ 启动后端节点服务
3. ✅ 测试完整的 CRVA 流程
4. ✅ 部署到更多测试网

需要帮助？随时询问！
