# 🚀 CRVA 本地部署快速指南

## ✅ 已为您创建的便捷脚本

### Windows 批处理脚本（.bat）
- `start-node.bat` - 启动本地节点
- `deploy-local.bat` - 部署合约

### PowerShell 脚本（.ps1）  
- `start-node.ps1` - 启动本地节点（PowerShell版）
- `deploy-local.ps1` - 部署合约（PowerShell版）

## 🎯 方式 1: 使用便捷脚本（推荐）

### 步骤 1: 启动本地节点
双击运行：
```
d:\projects\wdk\contracts\start-node.bat
```
或者在 PowerShell 中：
```powershell
cd d:\projects\wdk\contracts
.\start-node.ps1
```

**等待节点启动完成**（看到 "Started HTTP and WebSocket JSON-RPC server"）

### 步骤 2: 部署合约
双击运行：
```
d:\projects\wdk\contracts\deploy-local.bat
```
或者在 PowerShell 中：
```powershell
cd d:\projects\wdk\contracts
.\deploy-local.ps1
```

## 🎯 方式 2: 手动命令行

### 终端 1 - 启动节点
```powershell
cd d:\projects\wdk\contracts
npx hardhat node
```

保持这个终端运行！

### 终端 2 - 部署合约
打开新的 PowerShell 窗口：
```powershell
cd d:\projects\wdk\contracts
npm run test:deploy
```

## 📊 成功标志

### 节点启动成功：
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
...
```

### 部署成功：
```
🧪 本地测试部署

[1/3] 部署 CRVARegistry...
✅ CRVARegistry: 0x5FbDB2315678afecb367f032d93F642f64180aa3

[2/3] 部署 CRVACommittee...
✅ CRVACommittee: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

[3/3] 部署 ThresholdSignature...
✅ ThresholdSignature: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

✅ 本地部署完成！
```

## 🔧 常见问题

### Q: 部署时报错 "Cannot connect to the network"
**A:** 确保节点正在运行（终端 1 不要关闭）

### Q: 端口 8545 被占用
**A:** 关闭其他使用该端口的程序，或重启电脑

### Q: PowerShell 脚本无法运行
**A:** 以管理员身份运行 PowerShell，执行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🎉 部署成功后

### 1. 记录合约地址
从输出中复制三个合约地址

### 2. 配置后端服务
编辑 `d:\projects\wdk\server\.env`:
```env
ETH_RPC_URL=http://localhost:8545
CRVA_REGISTRY_ADDRESS=<从部署输出复制>
CRVA_COMMITTEE_ADDRESS=<从部署输出复制>
CRVA_THRESHOLD_ADDRESS=<从部署输出复制>
CHAIN_ID=31337
```

### 3. 启动后端服务
```powershell
cd d:\projects\wdk\server
npm run dev
```

### 4. 测试连接
访问：
- 后端 API: http://localhost:3000/health
- WebSocket: ws://localhost:3001

## 📝 测试账户

本地节点提供 20 个测试账户，每个都有 10000 ETH：

**账户 #0**（默认）:
- 地址: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- 私钥: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

⚠️ **警告**: 这些是公开的测试账户，切勿在主网使用！

## 🎯 下一步

- ✅ 在 Hardhat Console 中测试合约
- ✅ 集成前端钱包
- ✅ 测试完整的 CRVA 流程
- ✅ 部署到 Sepolia 测试网

---

**提示**: 保持节点窗口运行期间，可以多次部署和测试！
