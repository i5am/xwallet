# WDK 钱包离线能力分析

## 📊 当前离线能力状态

### ✅ 完全离线可用的功能

#### 1. **冷钱包核心功能** 🔒
- ✅ **创建钱包** - 生成助记词和密钥对（完全离线）
- ✅ **导入钱包** - 通过助记词/私钥导入（完全离线）
- ✅ **签名交易** - 使用本地私钥签名（完全离线）
- ✅ **生成二维码** - 展示地址和签名结果（完全离线）
- ✅ **扫描二维码** - 识别未签名交易（完全离线）
- ✅ **消息签名** - 签名任意文本消息（完全离线）

#### 2. **密码学操作**
- ✅ **助记词生成** - BIP39 本地生成
- ✅ **密钥派生** - BIP32/BIP44 本地派生
- ✅ **地址生成** - 本地计算地址
- ✅ **交易签名** - ECDSA 本地签名
- ✅ **数据加密** - 本地 AES 加密存储

#### 3. **数据存储**
- ✅ **钱包数据** - localStorage 本地存储
- ✅ **交易历史** - 本地缓存
- ✅ **设置数据** - 本地存储

### ⚠️ 需要网络的功能

#### 1. **余额查询** 🌐
**位置**: `src/App.tsx:155`
```typescript
const refreshBalance = async (wallet: Wallet) => {
  if (!wallet || wallet.type === WalletType.COLD) {
    // 冷钱包不查询余额(离线)
    setWalletBalance('--');
    return;
  }
  // ... 调用 RPC API 查询余额
}
```
**依赖**:
- BTC: `https://blockstream.info/api`
- ETH: `https://cloudflare-eth.com`

#### 2. **交易广播** 🌐
**位置**: `src/services/blockchain/BTCAdapter-harmonyos.ts:227`
```typescript
const response = await fetch(`${this.apiBaseUrl}/tx`, {
  method: 'POST',
  body: signedTx
});
```
**依赖**: 区块链节点 API

#### 3. **交易历史** 🌐
**位置**: `src/services/blockchain/BTCAdapter-harmonyos.ts:164`
```typescript
const response = await fetch(`${this.apiBaseUrl}/address/${address}/txs`);
```

#### 4. **Gas/Fee 估算** 🌐
**位置**: `src/services/blockchain/BTCAdapter-harmonyos.ts:203`
```typescript
const response = await fetch('https://mempool.space/api/v1/fees/recommended');
```

#### 5. **Token Logo 显示** 🌐
**位置**: `src/config/networks.ts:65`
```typescript
logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
```

#### 6. **OCR 功能（Web端）** 🌐
- iOS 原生 OCR ✅ 完全离线
- 浏览器 TextDetector API ✅ 完全离线
- Tesseract.js ❌ 需要 CDN（已移除）

## 🎯 冷钱包离线工作流程

### 场景 1: 完全离线签名（推荐）✅

```
【观测钱包（联网设备）】          【冷钱包（离线设备）】
        |                                    |
  1. 创建未签名交易                          |
        |                                    |
  2. 生成二维码 ─────────────────> 3. 扫描二维码
        |                                    |
        |                              4. 解析交易
        |                                    |
        |                              5. 确认并签名
        |                                    |
        |                              6. 生成签名结果二维码
        |                                    |
  7. 扫描签名结果 <─────────────────         |
        |                                    |
  8. 广播到区块链                            |
        ✓                                    ✓
```

**冷钱包设备要求**:
- ✅ 不需要网络连接
- ✅ 只需要摄像头（扫描二维码）
- ✅ 私钥永不离开设备
- ✅ 完全气隙隔离

### 场景 2: 手动输入签名（备用方案）✅

如果没有摄像头：
1. 观测钱包显示未签名交易的文本
2. 手动复制到冷钱包
3. 冷钱包签名后显示文本
4. 手动复制回观测钱包
5. 观测钱包广播

## 🔧 改进建议

### 优先级 1: 高优先级（冷钱包必需）

#### 1.1 离线 Fee 估算
**问题**: 当前依赖在线 API
```typescript
// 当前实现
const response = await fetch('https://mempool.space/api/v1/fees/recommended');
```

**改进方案**:
```typescript
// 添加离线默认值
const DEFAULT_FEE_RATES = {
  BTC: {
    slow: 1,      // 1 sat/vB
    medium: 5,    // 5 sat/vB
    fast: 10      // 10 sat/vB
  },
  ETH: {
    slow: '10',     // 10 Gwei
    medium: '20',   // 20 Gwei
    fast: '30'      // 30 Gwei
  }
};

async getFeeRate(priority: 'slow' | 'medium' | 'fast'): Promise<number> {
  // 如果离线或冷钱包，使用默认值
  if (this.isOffline || this.wallet.type === WalletType.COLD) {
    return DEFAULT_FEE_RATES.BTC[priority];
  }
  
  // 否则尝试在线获取
  try {
    const response = await fetch('https://mempool.space/api/v1/fees/recommended');
    // ...
  } catch (error) {
    // 网络错误，降级到默认值
    return DEFAULT_FEE_RATES.BTC[priority];
  }
}
```

#### 1.2 离线模式指示器
```typescript
// 添加离线状态检测
const [isOffline, setIsOffline] = useState(!navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOffline(false);
  const handleOffline = () => setIsOffline(true);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// UI 显示
{isOffline && (
  <div className="offline-banner">
    ⚠️ 离线模式 - 部分功能受限
  </div>
)}
```

#### 1.3 本地 Token Logo 缓存
```typescript
// 预加载常用 Token Logo 到 public/assets/tokens/
const TOKEN_LOGOS = {
  'USDT': '/assets/tokens/usdt.png',
  'USDC': '/assets/tokens/usdc.png',
  'DAI': '/assets/tokens/dai.png'
};

// 降级显示
logoUrl: TOKEN_LOGOS[symbol] || '/assets/tokens/default.png'
```

### 优先级 2: 中优先级（体验优化）

#### 2.1 Service Worker 缓存
**目标**: 离线访问 Web 应用

创建 `public/sw.js`:
```javascript
const CACHE_NAME = 'wdk-wallet-v1';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/assets/tokens/usdt.png',
  '/assets/tokens/usdc.png',
  '/assets/tokens/dai.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match('/index.html'))
  );
});
```

#### 2.2 PWA 支持
**目标**: 安装到桌面，完全离线使用

更新 `index.html`:
```html
<link rel="manifest" href="/manifest.json">
```

创建 `public/manifest.json`:
```json
{
  "name": "WDK 钱包",
  "short_name": "WDK",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 2.3 交易历史本地存储
```typescript
// 缓存交易历史
const TRANSACTION_CACHE_KEY = 'transaction_history';

async getTransactions(address: string): Promise<Transaction[]> {
  // 先从缓存读取
  const cached = localStorage.getItem(`${TRANSACTION_CACHE_KEY}_${address}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // 如果缓存未过期（1小时内）
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  }
  
  // 如果在线，从 API 获取
  if (!this.isOffline) {
    try {
      const data = await this.fetchFromAPI(address);
      // 更新缓存
      localStorage.setItem(`${TRANSACTION_CACHE_KEY}_${address}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      return data;
    } catch (error) {
      // 网络错误，返回缓存（即使过期）
      return cached ? JSON.parse(cached).data : [];
    }
  }
  
  // 离线且有缓存
  return cached ? JSON.parse(cached).data : [];
}
```

### 优先级 3: 低优先级（高级功能）

#### 3.1 P2P 交易广播
使用 WebRTC 或蓝牙在设备间传输交易

#### 3.2 Bitcoin Core / Geth 本地节点支持
允许连接本地全节点，完全去中心化

#### 3.3 硬件钱包集成
集成 Ledger/Trezor，增强安全性

## 📋 实现清单

### 立即实现（冷钱包核心）

- [ ] 添加离线 Fee 默认值
- [ ] 添加离线模式检测和 UI 指示
- [ ] 本地 Token Logo 资源
- [ ] 完善冷钱包签名流程文档

### 短期实现（1-2周）

- [ ] Service Worker 缓存
- [ ] PWA Manifest
- [ ] 交易历史本地缓存
- [ ] 离线使用教程

### 长期实现（可选）

- [ ] P2P 交易广播
- [ ] 本地节点支持
- [ ] 硬件钱包集成

## 🧪 测试场景

### 冷钱包离线测试

1. **创建冷钱包**
   - [ ] 飞行模式下创建钱包
   - [ ] 生成助记词
   - [ ] 生成地址二维码

2. **签名交易**
   - [ ] 扫描未签名交易二维码
   - [ ] 确认交易详情
   - [ ] 签名交易
   - [ ] 生成签名结果二维码

3. **消息签名**
   - [ ] 输入消息
   - [ ] 签名消息
   - [ ] 显示签名结果

4. **导出公钥**
   - [ ] 生成包含公钥的二维码
   - [ ] 观测钱包扫描导入

### 观测钱包在线/离线测试

1. **在线模式**
   - [ ] 查询余额
   - [ ] 查看交易历史
   - [ ] 创建未签名交易
   - [ ] 广播已签名交易

2. **离线模式（缓存测试）**
   - [ ] 显示缓存的余额
   - [ ] 显示缓存的交易历史
   - [ ] 创建未签名交易（使用默认 Fee）
   - [ ] 保存已签名交易（待联网后广播）

## 📖 用户指南

### 冷钱包设备建议

**推荐配置**:
- 📱 旧手机（永久断网）
- 📷 摄像头正常（扫描二维码）
- 💾 至少 500MB 存储空间
- 🔋 保持充电状态

**安全建议**:
1. ✅ 移除 SIM 卡
2. ✅ 关闭 WiFi 和蓝牙
3. ✅ 禁用所有网络功能
4. ✅ 定期充电保持可用
5. ✅ 物理隔离存放

**不推荐**:
- ❌ 日常使用的手机
- ❌ 有 WiFi 连接的设备
- ❌ 共享的平板电脑

### 冷钱包使用流程

#### 初次设置
```
1. 在离线设备安装 WDK 钱包
2. 开启飞行模式
3. 创建冷钱包
4. 抄写助记词（纸笔备份）
5. 导出地址二维码
6. 在观测钱包导入地址
```

#### 日常使用
```
【接收资金】
1. 在观测钱包中查看地址
2. 给他人发送地址
3. 等待到账
4. 在观测钱包查看余额

【发送资金】
1. 在观测钱包创建未签名交易
2. 生成二维码
3. 用冷钱包扫描
4. 确认交易详情
5. 冷钱包签名
6. 冷钱包生成签名结果二维码
7. 观测钱包扫描
8. 观测钱包广播交易
```

## 🔐 安全性

### 冷钱包的安全优势

1. **私钥隔离** 🔒
   - 私钥永不联网
   - 完全气隙保护
   - 免疫网络攻击

2. **最小攻击面** 🛡️
   - 无网络连接
   - 无应用更新
   - 无远程访问

3. **物理控制** 🏠
   - 用户完全控制设备
   - 可以物理销毁
   - 可以多重备份

### 安全最佳实践

1. **助记词管理**
   - ✅ 纸笔抄写（不截图）
   - ✅ 多份备份（分开存放）
   - ✅ 防水防火保护
   - ❌ 不要数字化存储
   - ❌ 不要云端备份

2. **设备管理**
   - ✅ 专用设备
   - ✅ 永久离线
   - ✅ 物理隔离
   - ❌ 不要联网
   - ❌ 不要安装其他应用

3. **交易验证**
   - ✅ 仔细核对地址
   - ✅ 确认金额正确
   - ✅ 检查 Gas/Fee
   - ❌ 不要盲目签名

## 📊 对比分析

### WDK 冷钱包 vs 传统方案

| 特性 | WDK 冷钱包 | 硬件钱包 | 纸钱包 |
|------|-----------|----------|--------|
| 成本 | 免费（利用旧手机） | $50-200 | 免费 |
| 易用性 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 安全性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 离线能力 | ✅ 完全离线 | ✅ 完全离线 | ✅ 完全离线 |
| 交易签名 | ✅ 二维码 | ✅ USB/蓝牙 | ❌ 需要导入 |
| 多币种 | ✅ BTC/ETH | ✅ 多种 | ✅ 所有 |
| 易丢失 | ❌ 手机较大 | ⚠️ 小巧易丢 | ⚠️ 纸张易损 |

## 🎓 总结

### 当前离线能力 ✅

WDK 钱包的**冷钱包功能已经完全支持离线使用**：

1. ✅ **核心功能离线** - 创建、导入、签名完全不需要网络
2. ✅ **气隙隔离** - 通过二维码传输数据，私钥永不离开设备
3. ✅ **密码学本地化** - 所有加密操作在本地完成
4. ⚠️ **部分功能需网络** - 仅查询余额、广播交易需要网络（由观测钱包完成）

### 改进空间 🚀

通过实现上述改进建议，可以进一步增强离线体验：

1. **离线 Fee 估算** - 使用保守默认值
2. **Service Worker** - 完全离线访问应用
3. **本地缓存** - 减少网络依赖
4. **PWA 支持** - 安装到设备，像原生 App

### 推荐使用场景 💡

**冷钱包（完全离线）**:
- 💰 大额资金存储
- 🔒 长期持有
- 🏦 作为储蓄账户

**观测钱包（需要网络）**:
- 👀 监控余额和交易
- 📱 日常查看
- 📊 创建交易

**热钱包（需要网络）**:
- 💸 小额支付
- 🔄 频繁交易
- ⚡ 快速操作

---

**结论**: WDK 钱包的冷钱包功能**已经可以完全离线使用**，是一个安全、免费、易用的冷存储方案！🎉
