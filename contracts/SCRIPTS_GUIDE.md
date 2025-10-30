# 🎉 CRVA 部署工具 - 使用指南

## 🚀 一键部署（最简单！）

### Windows 批处理（推荐）
双击运行：
```
deploy-all.bat
```

### PowerShell 版本
右键 → "使用 PowerShell 运行"：
```
deploy-all.ps1
```

或在 PowerShell 中：
```powershell
cd d:\projects\wdk\contracts
.\deploy-all.ps1
```

**就这么简单！** 脚本会自动：
1. ✅ 启动本地节点
2. ✅ 等待节点准备就绪
3. ✅ 部署所有合约
4. ✅ 显示合约地址

---

## 📂 可用脚本

| 脚本 | 功能 | 使用场景 |
|------|------|---------|
| `deploy-all.bat` | 一键部署 | 🌟 首次使用 |
| `deploy-all.ps1` | 一键部署（PS版） | 🌟 首次使用 |
| `start-node.bat` | 只启动节点 | 节点单独运行 |
| `start-node.ps1` | 只启动节点（PS版） | 节点单独运行 |
| `deploy-local.bat` | 只部署合约 | 节点已在运行 |
| `deploy-local.ps1` | 只部署合约（PS版） | 节点已在运行 |

---

## 💡 快速开始

### 第一次使用（推荐）

1. **双击运行** `deploy-all.bat`
   
2. **等待完成**，看到：
   ```
   ✅ 本地部署完成！
   
   合约地址:
     Registry: 0x5FbDB2315678afecb367f032d93F642f64180aa3
     Committee: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
     Threshold: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   ```

3. **复制合约地址**，配置到 `server/.env`

4. **启动后端**：
   ```powershell
   cd d:\projects\wdk\server
   npm run dev
   ```

---

## 🔧 手动部署（进阶用户）

### 步骤 1: 启动节点
```powershell
cd d:\projects\wdk\contracts
npx hardhat node
```

### 步骤 2: 部署合约（新终端）
```powershell
cd d:\projects\wdk\contracts
npm run test:deploy
```

---

## 📊 部署结果示例

成功部署后会看到：

```
🧪 本地测试部署

部署者: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

[1/3] 部署 CRVARegistry...
✅ CRVARegistry: 0x5FbDB2315678afecb367f032d93F642f64180aa3

[2/3] 部署 CRVACommittee...
✅ CRVACommittee: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

[3/3] 部署 ThresholdSignature...
✅ ThresholdSignature: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

✅ 本地部署完成！

🧪 运行简单测试...

✓ 总节点数: 0
✓ 最小质押: 10.0 ETH

测试节点注册...
✓ 节点注册成功
✓ 新的总节点数: 1

🎉 测试通过！合约工作正常。
```

---

## 🎯 下一步操作

### 1. 配置后端服务
编辑 `d:\projects\wdk\server\.env`：
```env
ETH_RPC_URL=http://localhost:8545
CRVA_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
CRVA_COMMITTEE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CRVA_THRESHOLD_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
CHAIN_ID=31337
```

### 2. 启动后端
```powershell
cd d:\projects\wdk\server
npm run dev
```

### 3. 测试 API
```powershell
curl http://localhost:3000/health
```

---

## 🐛 常见问题

### Q: 脚本无法运行
**A:** 右键以管理员身份运行 PowerShell，执行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: 端口 8545 被占用
**A:** 
1. 关闭所有使用 8545 端口的程序
2. 或者重启电脑
3. 或者修改 `hardhat.config.ts` 中的端口

### Q: 部署失败 "Cannot connect"
**A:** 确保：
1. 节点窗口正在运行
2. 等待至少 5 秒再部署
3. 检查节点是否有错误信息

### Q: 想重新部署
**A:** 
1. 关闭节点窗口
2. 重新运行 `deploy-all.bat`
3. 每次重启节点，合约地址会改变

---

## 📝 测试账户

本地节点自动创建 20 个测试账户，每个 10000 ETH：

**默认账户 #0**:
- 地址: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- 私钥: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

⚠️ 这些是公开的测试账户，切勿在主网使用！

---

## 🔗 相关文档

- 📖 [详细部署指南](DEPLOYMENT.md)
- 🚀 [快速开始](QUICKSTART.md)
- ✅ [部署检查清单](../DEPLOYMENT_CHECKLIST.md)
- 📊 [项目状态](../PROJECT_STATUS.md)

---

## 🎊 就是这样！

双击 `deploy-all.bat`，一切就绪！🚀
