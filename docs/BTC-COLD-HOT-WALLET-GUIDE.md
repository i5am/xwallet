# 🔐 BTC 冷热钱包完整实现指南

## 📋 概述

本文档详细说明了 BTC 冷热钱包的架构设计和实现方案。

---

## 🏗️ 架构设计

### 钱包类型

```
┌─────────────────────────────────────────┐
│         BTC 钱包生态系统                  │
├─────────────────────────────────────────┤
│                                         │
│  🔥 热钱包 (Hot Wallet)                 │
│  ├─ 在线连接网络                         │
│  ├─ 自动查询余额                         │
│  ├─ 直接广播交易                         │
│  ├─ 查看交易历史                         │
│  └─ 可发起交易请求                       │
│                                         │
│  ❄️ 冷钱包 (Cold Wallet)                │
│  ├─ 完全离线存储                         │
│  ├─ 安全签名交易                         │
│  ├─ 通过二维码通信                       │
│  ├─ 不连接任何网络                       │
│  └─ 最高安全级别                         │
│                                         │
│  👁️ 观察钱包 (Watch-Only)               │
│  ├─ 只有公钥/地址                        │
│  ├─ 查看余额和历史                       │
│  ├─ 不能签名交易                         │
│  └─ 用于监控冷钱包                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💰 热钱包功能

### 1. 创建热钱包

```typescript
// 生成 Taproot 地址
const btcAdapter = new BTCAdapter(NetworkType.MAINNET);
const wallet = btcAdapter.generateTaprootAddress(mnemonic);

// 创建热钱包对象
const hotWallet: Wallet = {
  id: Date.now().toString(),
  name: 'BTC 热钱包',
  type: WalletType.HOT,
  chain: ChainType.BTC,
  network: NetworkType.MAINNET,
  address: wallet.address,      // bc1p...
  privateKey: wallet.privateKey, // 加密存储
  publicKey: wallet.publicKey,
  mnemonic: mnemonic,           // 加密存储
  isOnline: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

### 2. 查询余额

```typescript
// 使用 Blockstream API
const balance = await btcAdapter.getBalance(address);
console.log(`余额: ${formatBTC(balance)} BTC`);
```

### 3. 查询交易历史

```typescript
const transactions = await btcAdapter.getTransactions(address);
transactions.forEach(tx => {
  console.log(`交易: ${tx.txid}`);
  console.log(`金额: ${tx.value} satoshi`);
  console.log(`确认数: ${tx.status.confirmed ? tx.status.block_height : 'Pending'}`);
});
```

### 4. 发送交易

```typescript
// 构建并签名交易
const txHex = await btcAdapter.buildAndSignTransaction({
  from: hotWallet.address,
  to: 'bc1p...',
  amountBTC: '0.001',
  privateKey: hotWallet.privateKey!,
  feeRate: 5, // sat/vB
});

// 广播交易
const txid = await btcAdapter.broadcastTransaction(txHex);
console.log(`交易已发送: ${txid}`);
```

---

## ❄️ 冷钱包功能

### 1. 创建冷钱包

```typescript
// 离线设备上生成
const mnemonic = bip39.generateMnemonic();
const btcAdapter = new BTCAdapter(NetworkType.MAINNET);
const wallet = btcAdapter.generateTaprootAddress(mnemonic);

const coldWallet: Wallet = {
  id: Date.now().toString(),
  name: 'BTC 冷钱包',
  type: WalletType.COLD,
  chain: ChainType.BTC,
  network: NetworkType.MAINNET,
  address: wallet.address,
  privateKey: wallet.privateKey, // 永不离开设备
  publicKey: wallet.publicKey,
  mnemonic: mnemonic,
  isOnline: false, // 永远离线
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

### 2. 导出观察钱包

```typescript
// 在冷钱包上生成观察钱包数据
const watchOnlyData = {
  protocol: 'WDK',
  version: '1.0.0',
  type: 'WATCH_ONLY_EXPORT',
  data: {
    name: coldWallet.name,
    chain: 'BTC',
    network: 'mainnet',
    address: coldWallet.address,
    publicKey: coldWallet.publicKey,
    // 不包含私钥和助记词
  }
};

// 生成二维码
const qrData = JSON.stringify(watchOnlyData);
<QRCode value={qrData} />

// 在热钱包设备上扫描导入
// 就可以查看余额,但不能签名交易
```

### 3. 签名交易流程

```
热钱包 (在线)              冷钱包 (离线)
    │                          │
    │ 1. 创建交易请求          │
    ├─────────────────────────>│
    │   (二维码)                │
    │                          │
    │                    2. 扫描请求
    │                          │
    │                    3. 验证交易
    │                          │
    │                    4. 签名交易
    │                          │
    │ 5. 扫描签名结果          │
    <─────────────────────────┤
    │   (二维码)                │
    │                          │
    │ 6. 广播到网络            │
    ├─────────────────────────>
    │                          │
    │ 7. 返回交易ID            │
    │                          │
```

#### 步骤详解

**步骤 1: 热钱包创建交易请求**

```typescript
// 在热钱包上
const unsignedTx = {
  protocol: 'WDK',
  version: '1.0.0',
  type: 'BTC_UNSIGNED_TX',
  timestamp: Date.now(),
  data: {
    requestId: uuid(),
    from: coldWallet.address,
    to: 'bc1p...',
    amount: 100000, // satoshi
    fee: 500,       // satoshi
    utxos: [
      {
        txid: '...',
        vout: 0,
        value: 150000,
        scriptPubKey: '...',
      }
    ],
    changeAddress: coldWallet.address,
    note: '测试转账',
  }
};

// 生成二维码显示给冷钱包扫描
<QRCode value={JSON.stringify(unsignedTx)} size={300} />
```

**步骤 2-4: 冷钱包签名**

```typescript
// 在冷钱包上扫描二维码
const scannedData = await scanQR();
const request = JSON.parse(scannedData);

// 验证请求
if (request.type !== 'BTC_UNSIGNED_TX') {
  throw new Error('无效的交易类型');
}

// 确认交易详情
alert(`
确认转账:
接收地址: ${request.data.to}
金额: ${formatBTC(request.data.amount)} BTC
手续费: ${formatBTC(request.data.fee)} BTC
`);

// 用户确认后签名
const signedTxHex = await btcAdapter.signTransaction(
  request.data,
  coldWallet.privateKey!
);

// 生成签名结果二维码
const signedTx = {
  protocol: 'WDK',
  version: '1.0.0',
  type: 'BTC_SIGNED_TX',
  timestamp: Date.now(),
  data: {
    requestId: request.data.requestId,
    signedTxHex: signedTxHex,
    from: request.data.from,
    to: request.data.to,
    amount: request.data.amount,
  }
};

<QRCode value={JSON.stringify(signedTx)} size={300} />
```

**步骤 5-7: 热钱包广播**

```typescript
// 热钱包扫描签名结果
const signedData = await scanQR();
const response = JSON.parse(signedData);

// 验证签名
if (response.type !== 'BTC_SIGNED_TX') {
  throw new Error('无效的签名类型');
}

// 广播交易
const txid = await btcAdapter.broadcastTransaction(response.data.signedTxHex);

alert(`
✅ 交易已发送!
交易ID: ${txid}
金额: ${formatBTC(response.data.amount)} BTC
`);
```

---

## 🔒 安全最佳实践

### 冷钱包安全

1. **完全离线**
   - ✅ 使用专用离线设备
   - ✅ 禁用 WiFi/蓝牙/移动网络
   - ✅ 物理隔离网络

2. **助记词管理**
   - ✅ 写在纸上备份
   - ✅ 存放在安全的地方
   - ✅ 考虑使用金属备份板
   - ❌ 不要拍照或截图
   - ❌ 不要存储在云端

3. **交易确认**
   - ✅ 仔细核对每笔交易
   - ✅ 确认接收地址
   - ✅ 确认转账金额
   - ✅ 检查手续费是否合理

### 热钱包安全

1. **金额控制**
   - ✅ 只存小额日常使用的 BTC
   - ✅ 大额资产转到冷钱包
   - ✅ 定期清空到冷钱包

2. **设备安全**
   - ✅ 使用强密码
   - ✅ 启用生物识别
   - ✅ 定期更新系统
   - ✅ 安装安全软件

3. **备份管理**
   - ✅ 加密备份助记词
   - ✅ 多地点存储
   - ✅ 定期验证备份

---

## 🛠️ 技术实现

### UTXO 管理

```typescript
interface UTXO {
  txid: string;        // 交易ID
  vout: number;        // 输出索引
  value: number;       // 金额 (satoshi)
  scriptPubKey: string;// 锁定脚本
  address: string;     // 地址
  confirmed: boolean;  // 是否确认
}

// 获取可用 UTXO
async function getUTXOs(address: string): Promise<UTXO[]> {
  const response = await fetch(
    `https://blockstream.info/api/address/${address}/utxo`
  );
  return await response.json();
}

// 选择 UTXO (简单策略: 优先使用大额)
function selectUTXOs(utxos: UTXO[], targetAmount: number): UTXO[] {
  const sorted = utxos.sort((a, b) => b.value - a.value);
  const selected: UTXO[] = [];
  let total = 0;

  for (const utxo of sorted) {
    selected.push(utxo);
    total += utxo.value;
    if (total >= targetAmount) break;
  }

  if (total < targetAmount) {
    throw new Error('余额不足');
  }

  return selected;
}
```

### 交易构建

```typescript
async function buildTransaction(params: {
  from: string;
  to: string;
  amountBTC: string;
  feeRate: number; // sat/vB
}): Promise<string> {
  const amountSat = btcToSatoshi(params.amountBTC);
  
  // 1. 获取 UTXO
  const utxos = await getUTXOs(params.from);
  
  // 2. 估算手续费
  const estimatedSize = 180; // 典型 Taproot 交易大小
  const feeSat = estimatedSize * params.feeRate;
  
  // 3. 选择 UTXO
  const totalNeeded = amountSat + feeSat;
  const selectedUTXOs = selectUTXOs(utxos, totalNeeded);
  
  // 4. 计算找零
  const inputTotal = selectedUTXOs.reduce((sum, u) => sum + u.value, 0);
  const changeSat = inputTotal - totalNeeded;
  
  // 5. 构建交易
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin });
  
  // 添加输入
  for (const utxo of selectedUTXOs) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: Buffer.from(utxo.scriptPubKey, 'hex'),
        value: utxo.value,
      },
    });
  }
  
  // 添加输出 (接收方)
  psbt.addOutput({
    address: params.to,
    value: amountSat,
  });
  
  // 添加找零输出 (如果有)
  if (changeSat > 546) { // 防尘限制
    psbt.addOutput({
      address: params.from,
      value: changeSat,
    });
  }
  
  return psbt.toBase64();
}
```

### 交易签名

```typescript
async function signTransaction(
  psbtBase64: string,
  privateKey: string
): Promise<string> {
  const psbt = bitcoin.Psbt.fromBase64(psbtBase64);
  const keyPair = bitcoin.ECPair.fromPrivateKey(
    Buffer.from(privateKey, 'hex')
  );
  
  // 签名所有输入
  for (let i = 0; i < psbt.inputCount; i++) {
    psbt.signInput(i, keyPair);
  }
  
  // 完成签名
  psbt.finalizeAllInputs();
  
  // 提取交易
  const tx = psbt.extractTransaction();
  return tx.toHex();
}
```

---

## 📊 费率建议

| 优先级 | 费率 (sat/vB) | 确认时间 |
|--------|---------------|----------|
| 低 | 1-3 | 6+ 小时 |
| 中 | 4-10 | 1-3 小时 |
| 高 | 11-20 | 10-60 分钟 |
| 紧急 | 21+ | 下一个区块 |

**动态费率获取:**

```typescript
async function getSuggestedFeeRate(): Promise<{
  low: number;
  medium: number;
  high: number;
}> {
  const response = await fetch('https://mempool.space/api/v1/fees/recommended');
  const fees = await response.json();
  
  return {
    low: fees.economyFee,
    medium: fees.hourFee,
    high: fees.fastestFee,
  };
}
```

---

## 🔍 常见问题

### Q1: 冷钱包如何知道余额?

**A**: 两种方式:
1. 创建观察钱包,在在线设备上查看
2. 临时连接网络查询后断开 (不推荐)

### Q2: 二维码传输数据量限制?

**A**: 
- 标准二维码: 最大 4296 字符
- 对于大交易,可以使用多个二维码分片传输
- 或使用 PSBT (Partially Signed Bitcoin Transaction) 格式压缩

### Q3: 如何验证冷钱包签名正确?

**A**: 热钱包在广播前会验证:
1. 交易结构完整性
2. 签名有效性
3. 输入输出金额匹配
4. 手续费合理性

### Q4: 冷钱包设备损坏怎么办?

**A**: 
- ✅ 助记词是唯一恢复途径
- ✅ 在任何支持 BIP39 的钱包恢复
- ✅ 定期验证备份的助记词

---

## 📚 参考资料

- **BIP32**: HD 钱包规范
- **BIP39**: 助记词规范
- **BIP86**: Taproot 派生路径
- **BIP174**: PSBT 规范
- **Blockstream API**: https://blockstream.info/api
- **Mempool.space API**: https://mempool.space/docs/api

---

## 🎯 总结

### 热钱包

✅ **优点**:
- 方便快捷
- 可以随时交易
- 查看余额和历史

❌ **缺点**:
- 安全性较低
- 联网有被盗风险
- 只适合小额

### 冷钱包

✅ **优点**:
- 最高安全性
- 私钥永不联网
- 适合大额存储

❌ **缺点**:
- 使用不便
- 交易需要两个设备
- 无法实时查询

### 推荐配置

```
💰 资产分配:
- 热钱包: 5-10% (日常使用)
- 冷钱包: 90-95% (长期持有)

🔄 工作流程:
1. 冷钱包存储大部分资产
2. 创建观察钱包监控余额
3. 需要支付时:
   - 小额: 直接用热钱包
   - 大额: 冷钱包签名
4. 定期将热钱包余额转回冷钱包
```

---

**准备好使用 BTC 冷热钱包了吗?** 🚀

记住: **安全第一,永远备份助记词!** 🔐
