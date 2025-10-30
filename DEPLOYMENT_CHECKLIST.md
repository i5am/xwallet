# ✅ CRVA 部署检查清单

## 📋 部署前检查

### 环境准备
- [ ] Node.js >= 18.0.0 已安装
- [ ] npm 依赖已安装（`contracts/` 和 `server/`）
- [ ] 已选择目标网络（本地 / Sepolia / Goerli）

### 智能合约编译
```bash
cd d:\projects\wdk\contracts
npx hardhat compile
```
- [ ] 编译成功，无错误
- [ ] `artifacts/` 目录已生成
- [ ] `typechain-types/` 目录已生成

## 🧪 本地测试（推荐先测试）

### 步骤 1: 启动本地节点
```powershell
# 终端 1
cd d:\projects\wdk\contracts
npm run node
```
- [ ] 节点已启动: http://127.0.0.1:8545/
- [ ] 20 个测试账户可用

### 步骤 2: 测试部署
```powershell
# 终端 2（新窗口）
cd d:\projects\wdk\contracts
npm run test:deploy
```
- [ ] 3 个合约部署成功
- [ ] 节点注册测试通过
- [ ] 所有测试 PASS

## 🌐 Sepolia 测试网部署

### 步骤 1: 获取测试币
访问以下任一水龙头：
- [ ] https://sepoliafaucet.com/
- [ ] https://www.alchemy.com/faucets/ethereum-sepolia
- [ ] https://faucet.quicknode.com/ethereum/sepolia

**目标余额**: >= 0.1 ETH

### 步骤 2: 配置环境变量
```bash
cd d:\projects\wdk\contracts
cp .env.example .env
```

编辑 `.env` 文件：
```env
DEPLOYER_PRIVATE_KEY=0x您的私钥
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=您的API密钥（可选）
```

- [ ] `.env` 文件已创建
- [ ] 私钥已填入（确保是测试账户！）
- [ ] RPC URL 已配置

### 步骤 3: 检查余额
```bash
npm run check:balance
```
- [ ] 显示账户地址
- [ ] 余额 >= 0.1 ETH
- [ ] 无错误提示

### 步骤 4: 部署合约
```bash
npm run deploy:sepolia
```

等待部署完成（约 2-5 分钟）...

- [ ] CRVARegistry 部署成功
- [ ] CRVACommittee 部署成功
- [ ] ThresholdSignature 部署成功
- [ ] 部署信息已保存到 `deployments/sepolia_latest.json`

### 步骤 5: 记录合约地址
从输出或 `deployments/sepolia_latest.json` 复制地址：

```
CRVARegistry: _____________________________________
CRVACommittee: ____________________________________
ThresholdSignature: _______________________________
```

### 步骤 6: 验证合约（可选）
```bash
npx hardhat verify --network sepolia <REGISTRY_ADDRESS>
npx hardhat verify --network sepolia <COMMITTEE_ADDRESS> <REGISTRY_ADDRESS>
npx hardhat verify --network sepolia <THRESHOLD_ADDRESS> <COMMITTEE_ADDRESS>
```
- [ ] CRVARegistry 已验证
- [ ] CRVACommittee 已验证
- [ ] ThresholdSignature 已验证

### 步骤 7: 在 Etherscan 查看
访问 https://sepolia.etherscan.io/
搜索合约地址：
- [ ] 可以看到合约代码
- [ ] 可以看到部署交易
- [ ] 可以读写合约

## 🔧 后端服务配置

### 步骤 1: 更新环境变量
编辑 `server/.env`:
```env
CRVA_REGISTRY_ADDRESS=<从部署结果复制>
CRVA_COMMITTEE_ADDRESS=<从部署结果复制>
CRVA_THRESHOLD_ADDRESS=<从部署结果复制>
ETH_RPC_URL=https://rpc.sepolia.org
CHAIN_ID=11155111
```
- [ ] 合约地址已更新
- [ ] RPC URL 已配置
- [ ] Chain ID 正确

### 步骤 2: 启动后端服务
```bash
cd d:\projects\wdk\server
npm run dev
```
- [ ] HTTP Server 启动: http://localhost:3000
- [ ] WebSocket Server 启动: ws://localhost:3001
- [ ] 健康检查通过: http://localhost:3000/health

## 🎨 前端集成

### 步骤 1: 复制 ABI 文件
从 `contracts/artifacts/contracts/` 复制以下文件：
- [ ] `CRVARegistry.sol/CRVARegistry.json`
- [ ] `CRVACommittee.sol/CRVACommittee.json`
- [ ] `ThresholdSignature.sol/ThresholdSignature.json`

### 步骤 2: 配置前端
更新前端配置文件，添加：
```typescript
const CONTRACTS = {
  registry: '<REGISTRY_ADDRESS>',
  committee: '<COMMITTEE_ADDRESS>',
  threshold: '<THRESHOLD_ADDRESS>',
};

const RPC_URL = 'https://rpc.sepolia.org';
const CHAIN_ID = 11155111;
```
- [ ] 合约地址已配置
- [ ] 网络参数已配置

## 🧪 端到端测试

### 测试 1: 节点注册
- [ ] 前端可以连接钱包
- [ ] 可以调用 `registerValidator()`
- [ ] 交易成功上链
- [ ] 可以在 Etherscan 查看交易

### 测试 2: 后端 API
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api
```
- [ ] API 响应正常
- [ ] 可以查询节点列表

### 测试 3: WebSocket 连接
```javascript
const ws = new WebSocket('ws://localhost:3001');
ws.onopen = () => console.log('Connected');
```
- [ ] WebSocket 连接成功
- [ ] 可以接收事件

## ✅ 完成！

部署完成后的链接：
- 🌐 Sepolia 浏览器: https://sepolia.etherscan.io/
- 🔍 合约地址: ___________________________________
- 📊 后端 API: http://localhost:3000
- 💬 WebSocket: ws://localhost:3001

## 📝 备注

记录遇到的问题和解决方案：
```
问题: 
解决: 

问题: 
解决: 
```

## 📞 需要帮助？

查看文档：
- `contracts/DEPLOYMENT.md` - 详细部署指南
- `contracts/QUICKSTART.md` - 快速开始
- `server/README.md` - 后端服务文档

---

**部署日期**: _______________
**部署者**: _______________
**网络**: _______________
**状态**: ⬜ 进行中 / ✅ 完成
