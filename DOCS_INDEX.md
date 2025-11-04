# 📚 XWallet 文档索引

> 最后更新: 2025-11-04

## 🚀 快速入门

| 文档 | 说明 | 状态 |
|------|------|------|
| [README.md](README.md) | 项目总览、功能特性、技术栈 | ✅ 核心文档 |
| [START_HERE.md](START_HERE.md) | 新手指南、开发环境配置 | ✅ 推荐阅读 |

## 🏗️ 开发文档

| 文档 | 说明 | 状态 |
|------|------|------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | 开发指南、代码结构、API文档 | ✅ 开发必读 |

## 🔐 多签钱包（DeepSafe）

| 文档 | 说明 | 状态 |
|------|------|------|
| [MULTISIG_TRANSFER_GUIDE.md](MULTISIG_TRANSFER_GUIDE.md) | 多签钱包转账完整流程 | ✅ 核心功能 |
| [MULTISIG_UI_GUIDE.md](MULTISIG_UI_GUIDE.md) | 多签钱包UI操作指南 | ✅ 用户手册 |
| [MULTISIG_SIGNATURE_TEST.md](MULTISIG_SIGNATURE_TEST.md) | 签名系统测试指南 | ✅ 测试文档 |
| [CRVA_WALLET_GUIDE.md](CRVA_WALLET_GUIDE.md) | CRVA验证机制详解 | ✅ 技术文档 |

## 🔧 构建与部署

| 文档 | 说明 | 状态 |
|------|------|------|
| [BUILD_COMPLETE.md](BUILD_COMPLETE.md) | 前端构建报告 | 📝 构建记录 |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | 部署检查清单 | ✅ 部署必读 |

## 📦 已归档文档

以下文档已过时或内容已合并到其他文档中：

| 文档 | 原因 | 归档时间 |
|------|------|---------|
| BUILD_REPORT.md | 内容已更新到 BUILD_COMPLETE.md | 2025-11-04 |
| CLEANUP-PLAN.md | 清理计划已完成 | 2025-11-04 |
| FRONTEND_CONFIG_UPDATE.md | 内容已集成到代码 | 2025-11-04 |
| PROJECT_STATUS.md | 状态追踪功能已废弃 | 2025-11-04 |
| PROJECT_SUMMARY.md | 内容已包含在 README.md | 2025-11-04 |

## 📂 文档组织结构

```
xwallet/
├── README.md                      # 项目总览 ⭐
├── START_HERE.md                  # 快速开始 ⭐
├── DEVELOPMENT.md                 # 开发指南
├── DEPLOYMENT_CHECKLIST.md        # 部署清单
│
├── docs/                          # 详细文档目录
│   ├── protocol.md               # WDK协议规范
│   ├── QR-CODE-FORMATS.md        # 二维码格式
│   └── ...
│
├── 多签钱包文档/
│   ├── MULTISIG_TRANSFER_GUIDE.md    # 转账流程
│   ├── MULTISIG_UI_GUIDE.md          # UI指南
│   ├── MULTISIG_SIGNATURE_TEST.md    # 签名测试
│   └── CRVA_WALLET_GUIDE.md          # CRVA机制
│
└── archive/                       # 归档文档
    ├── BUILD_REPORT.md
    ├── CLEANUP-PLAN.md
    ├── FRONTEND_CONFIG_UPDATE.md
    ├── PROJECT_STATUS.md
    └── PROJECT_SUMMARY.md
```

## 🔍 按主题查找

### 钱包功能
- 热钱包: [README.md](README.md#热钱包)
- 冷钱包: [README.md](README.md#冷钱包)
- 观测钱包: [README.md](README.md#观测钱包)
- 多签钱包: [MULTISIG_TRANSFER_GUIDE.md](MULTISIG_TRANSFER_GUIDE.md)

### 区块链支持
- Bitcoin: [README.md](README.md#bitcoin), [DEVELOPMENT.md](DEVELOPMENT.md#btc-adapter)
- Ethereum: [README.md](README.md#ethereum), [DEVELOPMENT.md](DEVELOPMENT.md#eth-adapter)

### 协议与格式
- WDK协议: [docs/protocol.md](docs/protocol.md)
- 二维码格式: [docs/QR-CODE-FORMATS.md](docs/QR-CODE-FORMATS.md)

### 高级功能
- CRVA验证: [CRVA_WALLET_GUIDE.md](CRVA_WALLET_GUIDE.md)
- Ring VRF: [CRVA_WALLET_GUIDE.md](CRVA_WALLET_GUIDE.md#ring-vrf)
- 阈值签名: [MULTISIG_TRANSFER_GUIDE.md](MULTISIG_TRANSFER_GUIDE.md)

## 📝 文档维护规范

### 更新文档时
1. 更新文档内容
2. 修改文档顶部的"最后更新"日期
3. 如有重大变更，更新此索引文件

### 创建新文档时
1. 在此索引中添加条目
2. 放置在合适的分类下
3. 添加简短说明

### 归档文档时
1. 移动到 `archive/` 目录
2. 在"已归档文档"表格中记录
3. 说明归档原因

---

**维护者**: XWallet 开发团队  
**项目地址**: https://github.com/i5am/xwallet
