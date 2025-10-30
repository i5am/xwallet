# 前端配置更新报告
**时间**: 2025-10-31
**目的**: 配置前端连接本地 API 服务器，准备打包

## 🎯 更新内容

### 1. 创建环境配置文件

**文件**: `.env.local` ✅
- `VITE_API_BASE_URL=http://localhost:3000` - 后端 API 地址
- `VITE_WS_URL=ws://localhost:3001` - WebSocket 地址
- `VITE_ETH_RPC_URL=http://localhost:8545` - 本地 Hardhat 节点
- `VITE_ETH_CHAIN_ID=31337` - Hardhat 链 ID
- 智能合约地址（与 server/.env 保持一致）:
  - `VITE_CRVA_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3`
  - `VITE_CRVA_COMMITTEE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
  - `VITE_CRVA_THRESHOLD_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

### 2. 创建 API 配置模块

**文件**: `src/config/api.ts` ✅
- `API_CONFIG`: 统一管理所有 API 配置
- `API_ENDPOINTS`: 定义所有 API 端点
- `createApiUrl()`: 生成完整 API URL
- `createWsUrl()`: 生成 WebSocket URL
- `getContractAddress()`: 获取智能合约地址
- `apiLogger`: API 日志工具

### 3. 更新 CRVA Service

**文件**: `src/services/crva/CRVAService.ts` ✅
- 导入 API 配置模块
- `createDefaultCRVAConfig()` 改为异步函数
- 在开发模式下自动从本地 API 获取验证节点列表
- 节点 endpoint 指向本地 API (`http://localhost:3000/api/nodes/...`)
- 如果 API 不可用，降级使用模拟节点

### 4. 更新主应用

**文件**: `src/App.tsx` ✅
- 使用 `await createDefaultCRVAConfig()` 异步加载配置

**文件**: `src/config/index.ts` ✅
- 导出 API 配置模块

## 📋 配置对比

### 后端配置 (server/.env)
```
PORT=3000
WS_PORT=3001
ETH_RPC_URL=http://localhost:8545
CRVA_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
CRVA_COMMITTEE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CRVA_THRESHOLD_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
CHAIN_ID=31337
```

### 前端配置 (.env.local)
```
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
VITE_ETH_RPC_URL=http://localhost:8545
VITE_CRVA_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_CRVA_COMMITTEE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_CRVA_THRESHOLD_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VITE_ETH_CHAIN_ID=31337
```

✅ **配置一致**：前后端使用相同的端口和合约地址

## 🔄 数据流

```
前端 (Vite Dev/Build)
  ↓
API_CONFIG (src/config/api.ts)
  ↓
CRVAService (连接本地节点)
  ↓
HTTP: http://localhost:3000/api/nodes
WS:   ws://localhost:3001
  ↓
后端 Express Server
  ↓
智能合约 (Hardhat localhost:8545)
```

## ✅ 验证清单

- [x] `.env.local` 文件已创建
- [x] API 配置模块已创建
- [x] CRVA Service 已更新为连接本地 API
- [x] App.tsx 已更新为异步加载配置
- [x] 配置已导出到 index.ts
- [x] 合约地址与后端一致

## 🚀 下一步

### 启动服务（按顺序）

1. **启动 Hardhat 节点**
   ```powershell
   cd contracts
   npx hardhat node
   ```

2. **部署智能合约**（如果需要）
   ```powershell
   npm run test:deploy
   ```

3. **启动后端服务器**
   ```powershell
   cd server
   npm run dev:simple
   ```

4. **启动前端开发服务器**（测试）
   ```powershell
   npm run dev
   ```

5. **打包前端**
   ```powershell
   npm run build
   ```

### 打包输出

- 输出目录: `dist/`
- 包含文件: 
  - `index.html` - 主页面
  - `assets/` - JS/CSS/图片等静态资源
  - 所有环境变量将被编译到代码中

## ⚠️ 注意事项

1. **环境变量**: Vite 的环境变量在构建时被嵌入到代码中，不是运行时加载
2. **本地开发**: 确保所有服务都在运行
3. **API 连接**: 前端会先尝试从 API 获取节点，失败后使用模拟节点
4. **合约地址**: 如果重新部署合约，需要同步更新 `.env.local`

## 📦 打包命令

```powershell
# 检查所有服务是否运行
netstat -ano | findstr ":3000\|:8545"

# 如果需要，先启动服务
# ... (见上面的启动服务步骤)

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# Android 打包
npm run android:build

# iOS 打包
npm run ios:build
```

## 🎉 完成状态

✅ **前端已配置完成，可以连接本地服务**
✅ **配置与后端同步**
✅ **准备好进行打包**

---

**注意**: 请确保在打包前所有本地服务都在运行，以便测试前端能否正确连接。
