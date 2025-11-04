# 📂 XWallet 项目结构

```
xwallet/
├── 📄 核心配置文件
│   ├── package.json                 # Node.js 依赖和脚本
│   ├── tsconfig.json               # TypeScript 配置
│   ├── vite.config.ts              # Vite 构建配置
│   ├── tailwind.config.js          # Tailwind CSS 配置
│   ├── capacitor.config.ts         # Capacitor 移动端配置
│   ├── ionic.config.json           # Ionic 配置
│   └── eas.json                    # EAS Build 配置
│
├── 📱 移动端项目
│   ├── android/                    # Android 原生项目
│   ├── ios/                        # iOS 原生项目
│   └── app.json                    # 应用元数据
│
├── 🌐 前端源码
│   ├── src/
│   │   ├── App.tsx                 # 主应用组件
│   │   ├── types/                  # TypeScript 类型定义
│   │   ├── services/               # 业务逻辑服务
│   │   │   ├── blockchain/         # 区块链适配器
│   │   │   ├── storage/            # 本地存储
│   │   │   ├── crva/              # CRVA 验证服务
│   │   │   └── flightspark/       # AI 支付服务
│   │   ├── utils/                  # 工具函数
│   │   ├── config/                 # 配置文件
│   │   └── index.css              # 全局样式
│   │
│   ├── public/                     # 静态资源
│   ├── index.html                  # HTML 入口
│   └── dist/                       # 构建输出（不提交到 Git）
│
├── ⛓️ 智能合约
│   ├── contracts/
│   │   ├── hardhat.config.ts      # Hardhat 配置
│   │   ├── contracts/              # Solidity 合约
│   │   │   ├── CRVARegistry.sol   # CRVA 注册表
│   │   │   ├── CRVACommittee.sol  # CRVA 委员会
│   │   │   └── ThresholdSignature.sol # 阈值签名
│   │   ├── scripts/               # 部署脚本
│   │   └── test/                  # 合约测试
│
├── 🔧 后端服务
│   └── server/
│       ├── package.json           # 后端依赖
│       ├── src/                   # 后端源码
│       │   ├── index.ts          # 服务入口
│       │   ├── routes/           # API 路由
│       │   └── services/         # 后端服务
│       └── .env                  # 后端环境变量
│
├── 🛠️ 工具脚本
│   ├── scripts/                   # 构建和部署脚本
│   │   ├── README.md             # 脚本使用说明
│   │   ├── setup-eas-build-ios.ps1
│   │   └── setup-github-actions-ios.ps1
│   ├── build-android.ps1         # Android 构建脚本
│   ├── install-with-adb.ps1      # APK 安装脚本
│   ├── start.ps1                 # 开发服务器启动
│   └── 安装APK.bat               # APK 安装（批处理）
│
├── 📚 文档
│   ├── README.md                  # 项目总览 ⭐
│   ├── DOCS_INDEX.md              # 文档索引 ⭐
│   ├── START_HERE.md              # 快速开始
│   ├── DEVELOPMENT.md             # 开发指南
│   ├── DEPLOYMENT_CHECKLIST.md    # 部署清单
│   │
│   ├── 多签钱包文档/
│   │   ├── MULTISIG_TRANSFER_GUIDE.md    # 转账流程
│   │   ├── MULTISIG_UI_GUIDE.md          # UI 指南
│   │   ├── MULTISIG_SIGNATURE_TEST.md    # 签名测试
│   │   └── CRVA_WALLET_GUIDE.md          # CRVA 机制
│   │
│   ├── docs/                      # 详细技术文档
│   │   ├── protocol.md           # WDK 协议规范
│   │   ├── QR-CODE-FORMATS.md    # 二维码格式
│   │   └── ...
│   │
│   ├── archive/                   # 归档文档
│   │   ├── BUILD_REPORT.md
│   │   ├── CLEANUP-PLAN.md
│   │   ├── FRONTEND_CONFIG_UPDATE.md
│   │   ├── PROJECT_STATUS.md
│   │   └── PROJECT_SUMMARY.md
│   │
│   └── BUILD_COMPLETE.md          # 构建报告
│
├── 🔒 配置文件
│   ├── .env.example              # 环境变量示例
│   ├── .env.local                # 本地环境变量（不提交）
│   ├── .gitignore                # Git 忽略规则
│   └── .eslintrc.json            # ESLint 配置
│
└── 📦 依赖和缓存
    ├── node_modules/             # Node.js 依赖（不提交）
    ├── package-lock.json         # 依赖锁文件
    └── .git/                     # Git 仓库

```

## 📁 主要目录说明

### `/src` - 前端源码
应用的核心代码，包括：
- React 组件
- TypeScript 类型定义
- 区块链适配器
- 业务逻辑服务
- 工具函数

### `/contracts` - 智能合约
Solidity 智能合约和部署脚本：
- CRVA 验证合约
- 多签钱包合约
- 部署和测试脚本

### `/server` - 后端服务
Express 后端服务：
- API 路由
- CRVA 验证节点
- WebSocket 服务

### `/docs` - 文档
项目文档：
- 使用指南
- API 文档
- 技术规范

### `/android` & `/ios` - 移动端
Capacitor 生成的原生项目：
- Android 构建产物
- iOS 构建产物
- 原生插件配置

### `/scripts` - 工具脚本
构建、部署、测试脚本

### `/archive` - 归档文档
已过时或已合并的文档

## 🚫 Git 忽略

以下目录/文件不提交到 Git：
- `node_modules/` - 依赖包
- `dist/` - 构建产物
- `.env.local` - 本地环境变量
- `*.log` - 日志文件
- `coverage/` - 测试覆盖率报告

## 📝 关键文件

| 文件 | 用途 |
|------|------|
| `package.json` | 项目依赖和脚本定义 |
| `tsconfig.json` | TypeScript 编译配置 |
| `vite.config.ts` | Vite 构建工具配置 |
| `capacitor.config.ts` | Capacitor 移动端配置 |
| `hardhat.config.ts` | Hardhat 合约配置 |
| `.env.local` | 本地环境变量 |

## 🔗 相关文档

- [文档索引](DOCS_INDEX.md) - 所有文档的快速索引
- [开发指南](DEVELOPMENT.md) - 详细的开发说明
- [部署清单](DEPLOYMENT_CHECKLIST.md) - 部署前检查事项

---

**维护者**: XWallet 开发团队  
**最后更新**: 2025-11-04
