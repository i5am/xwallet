# CRVA 智能合约

## 📋 合约列表

### 1. CRVARegistry.sol
验证节点注册表合约
- 节点注册和质押
- 信誉系统管理
- 罚没机制

### 2. CRVACommittee.sol
委员会管理合约
- 临时公钥提交和解密
- VRF 随机选取
- 轮次管理

### 3. ThresholdSignature.sol
门限签名聚合合约
- 多签交易提案
- 签名分片收集
- 签名聚合和执行

## 🚀 部署到测试网

### 前置要求

1. 安装依赖：
```bash
cd contracts
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入：
- `DEPLOYER_PRIVATE_KEY` - 部署者私钥（确保有测试币）
- `SEPOLIA_RPC_URL` - Sepolia RPC URL（可选，使用公共节点）
- `ETHERSCAN_API_KEY` - Etherscan API Key（用于合约验证）

### 获取测试币

**Sepolia 测试网**（推荐）:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

**Goerli 测试网**:
- https://goerlifaucet.com/
- https://faucet.quicknode.com/ethereum/goerli

### 部署命令

#### 1. 编译合约
```bash
npx hardhat compile
```

#### 2. 部署到本地测试网
```bash
# 启动本地节点
npx hardhat node

# 在另一个终端部署
npm run deploy:localhost
```

#### 3. 部署到 Sepolia 测试网
```bash
npm run deploy:sepolia
```

#### 4. 部署到 Goerli 测试网
```bash
npm run deploy:goerli
```

### 部署后

部署信息会保存在 `deployments/` 目录：
- `sepolia_latest.json` - 最新部署信息
- `sepolia_<timestamp>.json` - 历史部署记录

## 🔍 验证合约

部署完成后，可以在区块链浏览器上验证合约源码：

```bash
# Sepolia
npm run verify:sepolia -- <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# 示例
npx hardhat verify --network sepolia 0x123... 0xabc...
```

## 📊 测试合约

```bash
# 运行测试
npm test

# 测试覆盖率
npx hardhat coverage
```

## 🔧 合约交互

部署后，可以通过以下方式交互：

### 1. Hardhat Console
```bash
npx hardhat console --network sepolia
```

```javascript
const registry = await ethers.getContractAt("CRVARegistry", "0x...");
await registry.getActiveValidatorCount();
```

### 2. Etherscan
访问合约页面，使用 "Write Contract" 功能

### 3. 前端/后端集成
将合约地址配置到 `server/.env`:
```env
CRVA_REGISTRY_ADDRESS=0x...
CRVA_COMMITTEE_ADDRESS=0x...
CRVA_THRESHOLD_ADDRESS=0x...
```

## 📝 合约 ABI

编译后的 ABI 文件位于：
- `artifacts/CRVARegistry.sol/CRVARegistry.json`
- `artifacts/CRVACommittee.sol/CRVACommittee.json`
- `artifacts/ThresholdSignature.sol/ThresholdSignature.json`

## 🔒 安全注意事项

1. **私钥安全**
   - ❌ 不要将私钥提交到 Git
   - ✅ 使用 `.env` 文件（已在 .gitignore 中）
   - ✅ 生产环境使用硬件钱包或 MPC

2. **测试网 vs 主网**
   - ⚠️  测试网币没有价值，可以免费获取
   - ⚠️  主网部署需要真实 ETH，务必谨慎

3. **合约升级**
   - 当前合约不可升级
   - 如需修改，必须重新部署

## 📚 资源链接

- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin 合约](https://docs.openzeppelin.com/contracts/)
- [Sepolia 浏览器](https://sepolia.etherscan.io/)
- [Goerli 浏览器](https://goerli.etherscan.io/)
