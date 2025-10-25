# 🧹 项目文件清理计划

## 📊 当前文档结构分析

### 根目录 Markdown 文件 (需要整理)

#### ✅ 保留 - 核心文档
```
README.md                           # 项目主文档 ⭐ 保留
LICENSE                             # 许可证 ⭐ 保留
PROJECT_SUMMARY.md                  # 项目总结 ⭐ 保留
DEVELOPMENT.md                      # 开发文档 ⭐ 保留
```

#### 🔄 合并 - Android 相关 (重复内容)
```
❌ ANDROID_SDK_SETUP.md             → 合并到 docs/ANDROID_BUILD.md
❌ ANDROID_SETUP_SUMMARY.md         → 合并到 docs/ANDROID_BUILD.md
❌ ADB_TROUBLESHOOTING.md           → 合并到 docs/ANDROID_BUILD.md
❌ APK_INSTALL_GUIDE.md             → 合并到 docs/ANDROID_BUILD.md
❌ BLACKSCREEN_FIX.md               → 合并到 docs/ANDROID_BUILD.md
```

#### 🔄 合并 - iOS 相关 (重复内容,已有更好的文档)
```
❌ iOS-CLOUD-BUILD-SUMMARY.md       → 已被 iOS-BUILD-COMPLETE.md 取代
❌ iOS-BUILD-READY.md               → 已被 iOS-BUILD-COMPLETE.md 取代
❌ iOS-BUILD-QUICK-REFERENCE.txt    → 已有详细文档
❌ APPFLOW-NEXT-STEPS.md            → 已合并到最新文档中
```

#### 🔄 移动到 docs/ 目录
```
🔄 iOS-BUILD-COMPLETE.md            → 移动到 docs/iOS-BUILD-COMPLETE.md
🔄 GITHUB-PUSH-GUIDE.md             → 移动到 docs/GITHUB-PUSH-GUIDE.md
🔄 GETTING_STARTED.md               → 移动到 docs/GETTING-STARTED.md
🔄 INSTALL.md                       → 移动到 docs/INSTALL.md
🔄 QUICK_INSTALL.md                 → 合并到 docs/INSTALL.md
🔄 WDK-IMPLEMENTATION-CONFIRMATION.md → 移动到 docs/
```

### docs/ 目录文件 (需要整理)

#### ✅ 保留 - 核心技术文档
```
✅ protocol.md                       # WDK 协议规范 ⭐ 核心
✅ protocol-usage-guide.md           # 协议使用指南 ⭐ 核心
✅ WDK-PROTOCOL-OVERVIEW.md          # 协议概览 ⭐ 核心
✅ implementation-summary.md         # 实现总结 ⭐ 核心
```

#### ✅ 保留 - QR 扫描功能
```
✅ QR-CODE-FORMATS.md                # QR 码格式 ⭐ 保留
✅ QR_CODE_EXAMPLES.md               # QR 码示例 ⭐ 保留
✅ QR_SCANNING_FEATURE.md            # QR 扫描功能 ⭐ 保留
✅ QR_WORKFLOW.md                    # QR 工作流程 ⭐ 保留
✅ SCAN_CONFIRMATION_FLOW.md         # 扫描确认流程 ⭐ 保留
```

#### 🔄 合并 - 重复内容
```
❌ SCAN_FLOW_IMPROVEMENTS.md        → 合并到 QR_WORKFLOW.md
❌ SCAN_UPDATE_SUMMARY.md           → 合并到 QR_SCANNING_FEATURE.md
❌ QUICK_START_SCANNING.md          → 合并到 QR_SCANNING_FEATURE.md
❌ QUICK-START.md                   → 合并到 GETTING-STARTED.md
```

#### ✅ 保留 - Android 构建
```
✅ docs/ANDROID_BUILD.md             # Android 构建主文档 ⭐ 保留
```

#### ✅ 保留 - iOS 构建 (最新版本)
```
✅ docs/iOS-BUILD-README.md          # iOS 构建主文档 ⭐ 保留
✅ docs/iOS-BUILD-TROUBLESHOOTING.md # iOS 故障排除 ⭐ 保留
✅ docs/IONIC-APPFLOW-GUIDE.md       # Appflow 指南 ⭐ 保留
✅ docs/GITHUB-ACTIONS-IOS-GUIDE.md  # GitHub Actions 指南 ⭐ 保留
✅ docs/IOS-CERTIFICATE-WITHOUT-MAC.md # 证书申请指南 ⭐ 保留
✅ docs/HOW-TO-GENERATE-CSR.md       # CSR 生成指南 ⭐ 保留
✅ docs/CSR-STEP-BY-STEP-GUIDE.md    # CSR 详细步骤 ⭐ 保留
✅ docs/INSTALL-SIMULATOR-APP.md     # Simulator 安装 ⭐ 保留
✅ docs/WINDOWS-IOS-TESTING.md       # Windows 测试 ⭐ 保留
```

#### 🔄 合并 - 重复的 iOS 文档
```
❌ docs/iOS-Cloud-Build-Guide.md    → 已被新文档取代
❌ docs/iOS-Quick-Reference.md      → 已有详细文档
```

---

## 🎯 清理执行方案

### 阶段 1: 删除过时/重复的根目录文件

删除这些文件 (内容已合并或过时):
```
ANDROID_SDK_SETUP.md
ANDROID_SETUP_SUMMARY.md
ADB_TROUBLESHOOTING.md
APK_INSTALL_GUIDE.md
BLACKSCREEN_FIX.md
iOS-CLOUD-BUILD-SUMMARY.md
iOS-BUILD-READY.md
iOS-BUILD-QUICK-REFERENCE.txt
APPFLOW-NEXT-STEPS.md
QUICK_INSTALL.md
```

### 阶段 2: 移动文档到 docs/ 目录

移动这些文件到 docs/:
```
iOS-BUILD-COMPLETE.md               → docs/iOS-BUILD-COMPLETE.md
GITHUB-PUSH-GUIDE.md                → docs/GITHUB-PUSH-GUIDE.md
GETTING_STARTED.md                  → docs/GETTING-STARTED.md
INSTALL.md                          → docs/INSTALL.md
WDK-IMPLEMENTATION-CONFIRMATION.md  → docs/WDK-IMPLEMENTATION-CONFIRMATION.md
```

### 阶段 3: 删除 docs/ 中的重复文件

删除这些文件:
```
docs/iOS-Cloud-Build-Guide.md
docs/iOS-Quick-Reference.md
docs/SCAN_FLOW_IMPROVEMENTS.md
docs/SCAN_UPDATE_SUMMARY.md
docs/QUICK_START_SCANNING.md
docs/QUICK-START.md
```

### 阶段 4: 更新 README.md

创建清晰的文档索引结构。

---

## 📁 清理后的最终结构

```
wdk/
├── README.md                          # 项目主文档,包含文档索引 ⭐
├── LICENSE                            # 许可证
├── PROJECT_SUMMARY.md                 # 项目总结
├── DEVELOPMENT.md                     # 开发指南
│
├── package.json                       # 项目配置
├── capacitor.config.ts                # Capacitor 配置
├── ionic.config.json                  # Ionic 配置
├── app.json                           # 应用配置
├── eas.json                           # EAS 构建配置
│
├── build-android.ps1                  # Android 构建脚本
├── install-with-adb.ps1               # ADB 安装脚本
├── start.ps1                          # 启动脚本
├── 安装APK.bat                        # APK 安装脚本
│
├── src/                               # 源代码
├── public/                            # 静态资源
├── dist/                              # 构建输出
├── android/                           # Android 平台
├── ios/                               # iOS 平台
│
└── docs/                              # 📚 所有文档统一在这里
    ├── GETTING-STARTED.md             # 快速开始 ⭐ 新手入口
    ├── INSTALL.md                     # 安装指南
    │
    ├── WDK-PROTOCOL-OVERVIEW.md       # WDK 协议概览 ⭐
    ├── protocol.md                    # 协议详细规范
    ├── protocol-usage-guide.md        # 协议使用指南
    ├── implementation-summary.md      # 实现总结
    ├── WDK-IMPLEMENTATION-CONFIRMATION.md # 实现确认
    │
    ├── QR-CODE-FORMATS.md             # QR 码格式
    ├── QR_CODE_EXAMPLES.md            # QR 码示例
    ├── QR_SCANNING_FEATURE.md         # QR 扫描功能
    ├── QR_WORKFLOW.md                 # QR 工作流程
    ├── SCAN_CONFIRMATION_FLOW.md      # 扫描确认流程
    │
    ├── ANDROID_BUILD.md               # Android 构建指南 ⭐
    │
    ├── iOS-BUILD-README.md            # iOS 构建主文档 ⭐
    ├── iOS-BUILD-COMPLETE.md          # iOS 构建完成总结
    ├── iOS-BUILD-TROUBLESHOOTING.md   # iOS 故障排除
    │
    ├── IONIC-APPFLOW-GUIDE.md         # Ionic Appflow 指南
    ├── GITHUB-ACTIONS-IOS-GUIDE.md    # GitHub Actions 指南
    ├── GITHUB-PUSH-GUIDE.md           # GitHub 推送指南
    │
    ├── IOS-CERTIFICATE-WITHOUT-MAC.md # 证书申请 (无Mac)
    ├── HOW-TO-GENERATE-CSR.md         # CSR 生成指南
    ├── CSR-STEP-BY-STEP-GUIDE.md      # CSR 详细步骤
    │
    ├── INSTALL-SIMULATOR-APP.md       # Simulator 安装
    └── WINDOWS-IOS-TESTING.md         # Windows 测试方案
```

---

## ✅ 执行检查清单

### 准备工作
- [ ] 备份整个项目 (或确保 Git 可以恢复)
- [ ] 检查 Git 状态 (确保没有未提交的重要更改)

### 执行清理
- [ ] 删除阶段 1 的文件 (根目录过时文件)
- [ ] 移动阶段 2 的文件 (移动到 docs/)
- [ ] 删除阶段 3 的文件 (docs/ 中的重复文件)
- [ ] 更新 README.md (添加清晰的文档索引)

### 验证
- [ ] 检查所有文档链接是否正确
- [ ] 确保没有断链
- [ ] 提交更改到 Git

---

## 🎯 清理后的好处

1. **更清晰的结构**: 所有文档在 docs/ 目录
2. **没有重复**: 删除了重复和过时的文档
3. **易于导航**: README.md 有清晰的文档索引
4. **维护性更好**: 文档更少但更精准
5. **新手友好**: 明确的入口点 (GETTING-STARTED.md)

---

## 📝 注意事项

1. **不删除的文件**:
   - 所有源代码文件
   - 配置文件 (package.json, capacitor.config.ts 等)
   - 构建脚本 (.ps1, .bat)
   - node_modules/ (虽然很大,但需要)

2. **Git 提交建议**:
   ```bash
   git add .
   git commit -m "🧹 项目文档重构: 整理和合并重复文档"
   git push origin master
   ```

3. **如果误删**:
   ```bash
   # Git 可以恢复任何已提交的文件
   git checkout HEAD -- <filename>
   ```

---

**准备好执行清理了吗?** 我可以帮您:
1. 自动执行删除和移动操作
2. 更新 README.md 文档索引
3. 提交到 Git

需要我开始吗? 😊
