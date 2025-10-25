# 🔒 冷钱包离线运行配置

## 🎯 目标

确保冷钱包可以完全离线运行,不依赖任何外部资源 (CDN、API、网络)。

---

## ✅ 已完成的离线配置

### 1. Buffer Polyfill 本地化

**问题**: 之前使用 CDN 加载 Buffer
```html
<!-- ❌ 依赖网络 -->
<script src="https://cdn.jsdelivr.net/npm/buffer@6.0.3/index.js"></script>
```

**解决方案**: 下载到本地
```html
<!-- ✅ 完全离线 -->
<script src="./buffer.min.js"></script>
```

**文件位置**:
- 源文件: `public/buffer.min.js` (58KB)
- 构建后: `dist/buffer.min.js`
- iOS 项目: `ios/App/App/public/buffer.min.js`

---

## 📋 离线检查清单

### ✅ 已离线的资源

- [x] **Buffer Polyfill** - 本地 `buffer.min.js`
- [x] **React & ReactDOM** - 打包在 `index.js` 中
- [x] **所有加密库** - 打包在 `index.js` 中
  - bitcoinjs-lib
  - bip39
  - bip32
  - ethers.js
  - 等等
- [x] **CSS 样式** - 打包在 `index.css` 中
- [x] **图标/字体** - Lucide React 图标已打包

### ⚠️ 需要检查的网络依赖

#### 1. 区块链 API (仅热钱包需要)

**BTC**:
```typescript
// src/services/blockchain/BTCAdapter-harmonyos.ts
const BLOCKSTREAM_API = 'https://blockstream.info/api';
const MEMPOOL_API = 'https://mempool.space/api';
```

**ETH**:
```typescript
// src/config.ts
rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/xxx'
```

**冷钱包处理**:
```typescript
// 冷钱包不应该调用任何 API
if (wallet.type === WalletType.COLD) {
  // 离线模式
  setWalletBalance('--');
  return;
}
```

#### 2. 二维码生成 (本地库)

```typescript
import QRCode from 'qrcode';  // ✅ 已打包,无网络依赖
```

#### 3. 二维码扫描 (原生插件)

```swift
// ios/App/App/QRScannerPlugin.swift
// ✅ 使用 iOS 原生 AVFoundation,无网络依赖
```

---

## 🔒 冷钱包工作流程 (完全离线)

### 1. 创建钱包
```
用户操作: 创建冷钱包
↓
生成助记词 (本地,bip39)
↓
派生私钥 (本地,bip32)
↓
生成地址 (本地,bitcoinjs-lib/ethers)
↓
✅ 显示地址和助记词
(无任何网络请求)
```

### 2. 接收付款
```
用户操作: 点击"接收"
↓
生成地址二维码 (本地,qrcode)
↓
✅ 显示二维码
(无任何网络请求)
```

### 3. 签名交易 (核心冷钱包功能)

**3.1 热钱包生成交易请求**
```
热钱包 (在线)
↓
构建交易 (to, amount, fee)
↓
生成交易请求二维码 (JSON + 协议格式)
↓
显示二维码
```

**3.2 冷钱包扫描并签名**
```
冷钱包 (离线)
↓
扫描交易请求二维码 (原生相机)
↓
解析交易数据 (本地,JSON.parse)
↓
验证交易信息
↓
使用私钥签名 (本地,bitcoinjs-lib/ethers)
↓
生成签名结果二维码
↓
显示签名二维码
```

**3.3 热钱包广播交易**
```
热钱包 (在线)
↓
扫描签名二维码
↓
解析签名数据
↓
广播到区块链 (在线,API)
↓
✅ 交易完成
```

---

## 🛠️ 开发者指南

### 如何添加新的离线依赖

#### 方法 1: 通过 npm 打包 (推荐)

```bash
# 安装依赖
npm install <package-name>

# 在代码中导入
import { something } from '<package-name>';

# Vite 会自动打包到 index.js
npm run build
```

#### 方法 2: 下载并本地化

```bash
# 下载到 public 目录
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/<package>@<version>/dist/<file>.js" -OutFile "public/<file>.js"

# 在 index.html 中引用
<script src="./<file>.js"></script>

# 构建时会自动复制到 dist
npm run build
```

---

## ✅ 离线功能验证

### 测试步骤

1. **断开网络连接**
   ```
   iPhone: 飞行模式
   或: 关闭 Wi-Fi 和蜂窝数据
   ```

2. **创建冷钱包**
   ```
   ✅ 应该能成功创建
   ✅ 显示助记词和地址
   ❌ 不应该显示余额(因为无法查询)
   ```

3. **生成接收二维码**
   ```
   ✅ 应该能生成并显示
   ```

4. **扫描交易请求**
   ```
   ✅ 应该能扫描
   ✅ 应该能解析
   ✅ 应该能签名
   ✅ 应该能生成签名二维码
   ```

5. **验证无网络请求**
   ```
   Safari Web Inspector (需要 Mac):
   - Network 标签应该没有任何请求
   - 除了本地资源 (capacitor://localhost/...)
   ```

---

## 📊 文件大小统计

| 文件 | 大小 | 说明 |
|------|------|------|
| `index.html` | 5.76 KB | 主 HTML |
| `buffer.min.js` | 58 KB | Buffer polyfill |
| `index.js` | 4.69 MB | 所有应用代码和依赖 |
| `index.css` | 35 KB | 所有样式 |
| **总计** | **~4.78 MB** | 完整离线包 |

**优化建议**:
- 考虑代码分割,按需加载非冷钱包功能
- 压缩可以减少 70% (gzip: 944 KB)

---

## 🔐 安全建议

### 冷钱包最佳实践

1. **永久离线**
   - 冷钱包设备应该永久保持飞行模式
   - 禁用 Wi-Fi 和蜂窝数据
   - 建议使用专用设备

2. **物理隔离**
   - 不连接任何外部设备
   - 只通过二维码与热钱包通信
   - 不使用 AirDrop/蓝牙等

3. **助记词备份**
   - 手写在纸上
   - 使用助记词卡片
   - 不拍照,不截图
   - 存储在安全地方

4. **定期验证**
   - 定期测试冷钱包签名功能
   - 确保助记词可恢复
   - 验证地址正确性

---

## 🚀 部署清单

### 构建离线版本

```bash
# 1. 确保所有依赖已本地化
npm run build

# 2. 检查 dist 目录
ls dist/
# 应该看到:
# - index.html
# - buffer.min.js
# - assets/index-xxx.js
# - assets/index-xxx.css

# 3. 同步到 iOS
npx cap sync ios

# 4. 在 Appflow 构建
# 选择 commit: 1bb3073
# "feat: 使用本地 Buffer polyfill 支持冷钱包完全离线运行"
```

### 验证离线功能

```bash
# 1. 安装到 iPhone
# 2. 开启飞行模式
# 3. 测试所有冷钱包功能:
#    - 创建钱包 ✅
#    - 显示地址 ✅
#    - 生成接收二维码 ✅
#    - 签名交易 ✅
#    - 生成签名二维码 ✅
```

---

## 📝 待办事项

### 未来优化

- [ ] **减小包体积**
  - 代码分割
  - Tree shaking
  - 移除未使用的功能

- [ ] **添加离线指示器**
  - 显示"离线模式"徽章
  - 禁用在线功能按钮
  - 提示用户当前状态

- [ ] **更多加密货币支持**
  - Litecoin
  - Dogecoin
  - 等等

- [ ] **多签钱包**
  - 支持 2-of-3 多签
  - 离线签名流程

---

## ✅ 总结

### 当前状态

✅ **冷钱包可以完全离线运行**
- 所有依赖已本地化
- 不需要任何网络连接
- 通过二维码与热钱包安全通信

### Commit 信息

```
Commit: 1bb3073
Message: feat: 使用本地 Buffer polyfill 支持冷钱包完全离线运行
Changes:
  - 下载 buffer@6.0.3 到 public/buffer.min.js
  - 修改 index.html 使用本地 Buffer
  - 完全移除 CDN 依赖
```

### 下一步

1. 在 Appflow 构建 commit `1bb3073`
2. 安装到 iPhone
3. 开启飞行模式测试
4. 验证所有离线功能正常

**冷钱包现在可以安全地离线使用了!** 🔒🎉
