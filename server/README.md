# CRVA Backend Server

CRVA (Crypto Ring Verifiable Authentication) 多签验证网络后端服务。

## 📋 功能特性

### 核心功能
- ✅ **验证节点管理** - 注册、质押、信誉系统
- ✅ **TEE 集成** - 可信执行环境（Intel SGX / AWS Nitro）
- ✅ **委员会选取** - Ring VRF 随机选取 + 临时公钥管理
- ✅ **交易验证** - 去中心化多节点验证
- ✅ **门限签名** - BLS/Schnorr 门限签名聚合
- ✅ **实时通信** - WebSocket 实时事件推送
- ✅ **REST API** - 完整的 HTTP API 接口
- ✅ **P2P 网络** - libp2p 节点发现和通信

### 隐私保护
- 🔐 **TEE 内密钥生成** - 临时公钥在 TEE 内生成，外部不可见
- 🔐 **加密传输** - 临时公钥加密后传输给 Relayer
- 🔐 **ZK 证明** - 零知识证明保护节点身份
- 🔐 **Relayer 轮换** - Relayer 定期轮换，防止单点控制
- 🔐 **身份核对** - 节点在 TEE 内核对中签状态

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                       CRVA Backend                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  REST API    │  │  WebSocket   │  │  P2P Network │    │
│  │   Express    │  │     ws       │  │    libp2p    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CRVA Service Layer                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ Node Mgmt  │  │  Relayer   │  │ Committee  │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TEE Environment                         │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  • 临时密钥生成                                │  │  │
│  │  │  • ZK 证明生成/验证                           │  │  │
│  │  │  • 加密/解密                                  │  │  │
│  │  │  • 身份核对                                   │  │  │
│  │  │  • 门限签名                                   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Blockchain Integration                    │  │
│  │  ┌────────────┐  ┌────────────┐                      │  │
│  │  │  Registry  │  │ Committee  │                      │  │
│  │  │  Contract  │  │  Contract  │                      │  │
│  │  └────────────┘  └────────────┘                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Redis >= 6.0
- 以太坊节点（本地或远程）

### 安装

```bash
cd server
npm install
```

### 配置

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的参数：

```env
# 服务器配置
PORT=3000
WS_PORT=3001

# 区块链配置
ETH_RPC_URL=http://localhost:8545
CRVA_REGISTRY_ADDRESS=0x...
CRVA_COMMITTEE_ADDRESS=0x...

# 节点配置
NODE_PRIVATE_KEY=0x...
STAKE_AMOUNT=10000000000000000000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/crva
REDIS_URL=redis://localhost:6379
```

### 启动服务

#### 开发模式（热重载）

```bash
npm run dev
```

#### 生产模式

```bash
npm run build
npm start
```

### 运行模式

服务器支持两种运行模式：

#### 1. 验证节点模式

```bash
MODE=node npm run dev
```

作为验证节点运行，参与交易验证。

#### 2. Relayer 模式

```bash
MODE=relayer npm run dev
```

作为 Relayer 运行，负责解密和提交临时公钥。

#### 3. API 模式（默认）

```bash
MODE=api npm run dev
```

仅运行 API 服务器，不参与验证。

## 📚 API 文档

### REST API

#### 节点管理

```
GET    /api/nodes              获取所有节点
GET    /api/nodes/:nodeId      获取节点详情
POST   /api/nodes/register     注册新节点
POST   /api/nodes/:nodeId/deregister  注销节点
GET    /api/nodes/:nodeId/status      获取节点状态
```

#### 交易验证

```
POST   /api/transactions/submit           提交交易
GET    /api/transactions/:txId            获取交易状态
GET    /api/transactions                  获取交易列表
GET    /api/transactions/:txId/verification  获取验证进度
```

#### 委员会管理

```
GET    /api/committee/current       获取当前委员会
GET    /api/committee/history       获取委员会历史
GET    /api/committee/round/:roundId  获取指定轮次
GET    /api/committee/stats         获取统计信息
```

### WebSocket API

连接地址：`ws://localhost:3001`

#### 订阅事件

```javascript
const ws = new WebSocket('ws://localhost:3001');

// 订阅主题
ws.send(JSON.stringify({
  type: 'subscribe',
  data: ['nodeRegistered', 'committeeSelected', 'transactionVerified']
}));

// 接收事件
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message.type, message.data);
};
```

#### 可用事件

- `nodeRegistered` - 节点注册
- `ephemeralKeySubmitted` - 临时公钥提交
- `committeeSelected` - 委员会选取完成
- `transactionVerified` - 交易验证完成
- `keysRevealed` - Relayer 提交临时公钥

## 🔐 CRVA 工作流程

### 阶段 1：节点注册

```
节点 → 质押 ETH → 注册永久公钥 → 加入候选池
```

### 阶段 2：临时公钥生成（每小时）

```
节点 → TEE 内生成临时密钥对 → 生成 ZK 证明
     → 加密临时公钥 → 提交到链上
```

### 阶段 3：Relayer 解密

```
Relayer → TEE 内解密所有临时公钥 → 验证 ZK 证明
        → 批量提交到链上
```

### 阶段 4：VRF 抽签

```
智能合约 → 使用 VRF 从临时公钥中随机选取
         → 广播委员会成员名单
```

### 阶段 5：身份核对

```
各节点 → TEE 内核对自己的临时公钥
       → 如果中签，进入验证模式
```

### 阶段 6：交易验证

```
委员会成员 → 验证交易合法性
          → 生成门限签名分片
```

### 阶段 7：签名聚合

```
智能合约 → 收集签名分片 → 聚合门限签名
         → 执行交易
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行单个测试
npm test -- CRVANode.test.ts

# 测试覆盖率
npm run test:coverage
```

## 📦 项目结构

```
server/
├── src/
│   ├── index.ts              # 主入口
│   ├── api/                  # REST API 路由
│   │   ├── routes.ts
│   │   ├── node.routes.ts
│   │   ├── transaction.routes.ts
│   │   └── committee.routes.ts
│   ├── node/                 # 验证节点
│   │   └── CRVANode.ts
│   ├── relayer/              # Relayer
│   │   └── CRVARelayer.ts
│   ├── tee/                  # TEE 模拟器
│   │   └── TEEEnvironment.ts
│   ├── websocket/            # WebSocket 服务
│   │   └── WebSocketServer.ts
│   ├── services/             # 服务层
│   │   └── DatabaseService.ts
│   └── utils/                # 工具函数
│       └── logger.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 技术栈

- **Node.js** - JavaScript 运行时
- **TypeScript** - 类型安全
- **Express** - Web 框架
- **WebSocket** - 实时通信
- **ethers.js** - 以太坊交互
- **libp2p** - P2P 网络
- **MongoDB** - 数据库
- **Redis** - 缓存
- **elliptic** - 椭圆曲线加密

## 🔒 安全考虑

### TEE 集成

在生产环境中，应使用真正的 TEE 技术：

- **Intel SGX** - Intel 处理器内置
- **AMD SEV** - AMD 安全加密虚拟化
- **AWS Nitro Enclaves** - AWS 云端 TEE
- **ARM TrustZone** - ARM 处理器

### 密钥管理

- ✅ 私钥永不暴露
- ✅ 临时密钥在 TEE 内生成
- ✅ 使用硬件安全模块（HSM）
- ✅ 密钥轮换机制

### 网络安全

- ✅ TLS/SSL 加密通信
- ✅ API 认证和授权
- ✅ DDoS 防护
- ✅ 速率限制

## 📊 监控和日志

### 日志

日志文件位于 `logs/` 目录：

- `combined.log` - 所有日志
- `error.log` - 错误日志

### 健康检查

```bash
curl http://localhost:3000/health
```

返回：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "node": {
    "isActive": true,
    "currentRound": 123
  }
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📮 联系方式

如有问题，请联系开发团队。

---

**⚠️ 重要提示**

这是一个开发版本，TEE 功能为模拟实现。在生产环境中，必须使用真正的 TEE 技术（如 Intel SGX）来确保安全性。
