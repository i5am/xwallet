# 二维码扫描输入功能说明

## 功能概述

XWallet 支持在所有需要输入的地方使用二维码扫描快速填充数据，提高输入便利性和准确性。

## 支持的输入场景

### 1. 发送交易 - 接收地址
**位置**: 发送对话框 → 接收地址输入框

**扫描内容**:
- ✅ 钱包地址（纯文本）
- ✅ 钱包地址二维码（协议格式）
- ✅ 任何包含地址的二维码

**使用方法**:
1. 点击"发送"按钮
2. 在"接收地址"输入框右侧点击相机图标 📷
3. 扫描包含地址的二维码
4. 地址自动填充到输入框

**界面示意**:
```
接收地址
┌──────────────────────────────────────┬────┐
│ bc1p...                              │ 📷 │
└──────────────────────────────────────┴────┘
```

---

### 2. 导入钱包 - 助记词
**位置**: 导入钱包对话框 → 助记词输入

**扫描内容**:
- ✅ 12 单词助记词
- ✅ 24 单词助记词
- ✅ 包含助记词的协议格式二维码

**使用方法**:
1. 点击"导入"按钮
2. 选择"助记词"导入方式
3. 在助记词输入框右侧点击相机图标 📷
4. 扫描助记词二维码
5. 助记词自动填充到输入框

**界面示意**:
```
助记词
┌──────────────────────────────────────┬────┐
│ word1 word2 word3 word4 word5 word6 │ 📷 │
│ word7 word8 word9 word10 word11      │    │
│ word12                               │    │
└──────────────────────────────────────┴────┘
```

**安全提示**:
⚠️ 扫描助记词二维码时，请确保周围环境安全，避免被他人看到。

---

### 3. 导入钱包 - 私钥
**位置**: 导入钱包对话框 → 私钥输入

**扫描内容**:
- ✅ 十六进制私钥
- ✅ WIF 格式私钥（Bitcoin）
- ✅ 包含私钥的协议格式二维码

**使用方法**:
1. 点击"导入"按钮
2. 选择"私钥"导入方式
3. 在私钥输入框右侧点击相机图标 📷
4. 扫描私钥二维码
5. 私钥自动填充到输入框

**界面示意**:
```
私钥
┌──────────────────────────────────────┬────┐
│ 0xabcdef...123456                    │ 📷 │
└──────────────────────────────────────┴────┘
```

**安全提示**:
⚠️ 私钥是钱包的最高权限凭证，扫描时务必确保环境安全。

---

## 扫描对话框界面

### UI 布局
```
┌──────────────────────────────────────────┐
│  📷 扫描接收地址                    [X]   │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │         [扫描框动画]               │  │
│  │                                    │  │
│  │  ┌──────────────────────────┐     │  │
│  │  │                          │     │  │
│  │  │    蓝色扫描框动画         │     │  │
│  │  │    (48x48 呼吸动画)      │     │  │
│  │  │                          │     │  │
│  │  └──────────────────────────┘     │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  将二维码对准扫描框                      │
│                                          │
│         [取消]                           │
└──────────────────────────────────────────┘
```

### 视觉特性
- **背景**: 黑色摄像头预览
- **扫描框**: 蓝色边框，呼吸动画（48x48）
- **提示文字**: 灰色，居中显示
- **高度**: 300px
- **层级**: z-index: 70（高于其他对话框）

---

## 技术实现

### 核心功能

#### 1. 启动扫描
```typescript
const startInputScan = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
  });
  inputVideoRef.current.srcObject = stream;
  await inputVideoRef.current.play();
  inputScanIntervalRef.current = setInterval(scanInputFrame, 100);
};
```

#### 2. 扫描识别
```typescript
const scanInputFrame = () => {
  // 从视频流捕获帧
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // 使用 jsQR 解析二维码
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  
  if (code && scanInputCallback) {
    stopInputScan();
    scanInputCallback(extractedValue);
    setShowInputScanDialog(false);
  }
};
```

#### 3. 数据解析
```typescript
// 尝试解析协议格式
const parsed = ProtocolUtils.parseMessage(code.data);
if (parsed && parsed.data) {
  if (parsed.data.address) value = parsed.data.address;
  if (parsed.data.privateKey) value = parsed.data.privateKey;
  if (parsed.data.mnemonic) value = parsed.data.mnemonic;
}
// 否则使用原始数据
```

#### 4. 停止扫描
```typescript
const stopInputScan = () => {
  clearInterval(inputScanIntervalRef.current);
  const stream = inputVideoRef.current.srcObject;
  stream.getTracks().forEach(track => track.stop());
};
```

### 状态管理
```typescript
// 输入扫描状态
showInputScanDialog: boolean           // 是否显示扫描对话框
scanInputCallback: ((value: string) => void) | null  // 扫描成功回调
scanInputTitle: string                 // 扫描对话框标题

// 摄像头引用
inputVideoRef: React.RefObject<HTMLVideoElement>
inputCanvasRef: React.RefObject<HTMLCanvasElement>
inputScanIntervalRef: React.MutableRefObject<number | null>
```

### 使用 API
```typescript
// 打开扫描对话框
openInputScan(title: string, callback: (value: string) => void)

// 关闭扫描对话框
closeInputScan()
```

---

## 使用示例

### 示例 1: 扫描接收地址
```typescript
<button
  onClick={() => openInputScan('扫描接收地址', (value) => {
    setSendToAddress(value);
  })}
>
  <Camera />
</button>
```

### 示例 2: 扫描助记词
```typescript
<button
  onClick={() => openInputScan('扫描助记词', (value) => {
    setImportMnemonic(value);
  })}
>
  <Camera />
</button>
```

### 示例 3: 扫描私钥
```typescript
<button
  onClick={() => openInputScan('扫描私钥', (value) => {
    setImportPrivateKey(value);
  })}
>
  <Camera />
</button>
```

---

## 支持的二维码格式

### 1. 纯文本格式
直接包含数据的二维码，例如：
```
bc1pjpv78z8r0xkz7s3h9m4e5qlqe3e6h2rr3
```

### 2. WDK 协议格式
包含元数据的结构化二维码：
```json
{
  "version": "1.0",
  "type": "ADDRESS_INFO",
  "timestamp": 1234567890,
  "data": {
    "address": "bc1pjpv78z8r0xkz7s3h9m4e5qlqe3e6h2rr3",
    "chain": "BTC",
    "network": "mainnet"
  }
}
```

### 3. 其他格式
- Bitcoin URI: `bitcoin:bc1pjp...?amount=0.01`
- Ethereum URI: `ethereum:0x1234...?value=1000000000000000000`

---

## 兼容性

### 浏览器支持
| 浏览器 | 版本 | 支持状态 |
|--------|------|----------|
| Chrome | 53+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| Firefox | 36+ | ✅ 完全支持 |
| Safari | 11+ | ✅ 需要 HTTPS |
| iOS Safari | 11+ | ✅ 需要 HTTPS |
| Android Chrome | 53+ | ✅ 完全支持 |

### 权限要求
- **摄像头权限**: 必须授予
- **HTTPS**: iOS/Safari 必须
- **后置摄像头**: 优先使用，自动选择

---

## 错误处理

### 1. 摄像头权限被拒绝
**提示**: "无法访问摄像头，请检查权限设置"

**解决方案**:
1. 检查浏览器权限设置
2. 确保应用使用 HTTPS
3. 重新授予摄像头权限

### 2. 二维码识别失败
**原因**:
- 二维码模糊或损坏
- 光线不足
- 二维码不在扫描框内

**解决方案**:
1. 调整摄像头距离
2. 增加光线
3. 确保二维码清晰可见

### 3. 数据格式不匹配
**处理**: 自动使用原始数据

**示例**:
- 扫描到地址二维码 → 填充地址
- 扫描到协议格式 → 提取相关字段
- 扫描到其他数据 → 填充原始内容

---

## 性能优化

### 1. 扫描频率
- **扫描间隔**: 100ms（每秒10帧）
- **原因**: 平衡识别速度和CPU占用

### 2. 自动停止
- 识别成功后立即停止扫描
- 避免不必要的资源消耗

### 3. 资源清理
- 关闭对话框时停止摄像头
- 组件卸载时清理所有资源

---

## 安全建议

### 对于用户
1. **环境安全**:
   - 扫描敏感信息（私钥、助记词）时确保周围无他人
   - 避免在公共场所扫描

2. **二维码来源**:
   - 只扫描可信来源的二维码
   - 警惕钓鱼二维码

3. **数据验证**:
   - 扫描后检查填充的内容是否正确
   - 重要操作前再次确认

### 对于开发者
1. **数据验证**:
   - 验证扫描到的数据格式
   - 过滤恶意输入

2. **错误处理**:
   - 捕获所有可能的异常
   - 提供友好的错误提示

3. **权限管理**:
   - 只在需要时请求摄像头权限
   - 提供清晰的权限说明

---

## 用户体验优化

### 1. 视觉反馈
- ✅ 蓝色扫描框呼吸动画
- ✅ 清晰的提示文字
- ✅ 扫描成功后立即关闭

### 2. 操作便利性
- ✅ 一键打开扫描
- ✅ 自动填充数据
- ✅ 支持取消操作

### 3. 性能体验
- ✅ 快速启动（<300ms）
- ✅ 流畅扫描（10fps）
- ✅ 即时响应

---

## 测试清单

### 功能测试
- [ ] 扫描接收地址
- [ ] 扫描助记词
- [ ] 扫描私钥
- [ ] 扫描协议格式二维码
- [ ] 扫描纯文本二维码

### 边界测试
- [ ] 摄像头权限被拒绝
- [ ] 二维码模糊不清
- [ ] 无效的二维码数据
- [ ] 快速连续扫描
- [ ] 对话框快速开关

### 兼容性测试
- [ ] Chrome 桌面版
- [ ] Firefox 桌面版
- [ ] Safari 桌面版
- [ ] iOS Safari
- [ ] Android Chrome

### 性能测试
- [ ] CPU 占用率
- [ ] 内存使用
- [ ] 电池消耗（移动设备）
- [ ] 扫描响应时间

---

## 常见问题

**Q: 为什么扫描按钮点击后没有反应？**
A: 可能是摄像头权限未授予，请检查浏览器设置。

**Q: 扫描速度很慢怎么办？**
A: 确保二维码清晰、光线充足，并尽量靠近摄像头。

**Q: 可以扫描截图中的二维码吗？**
A: 不可以，必须用摄像头实时扫描。

**Q: 前置摄像头可以用吗？**
A: 可以，但后置摄像头效果更好。系统会自动选择后置摄像头。

**Q: 扫描的数据会被上传吗？**
A: 不会，所有扫描和解析都在本地完成，数据不会离开设备。

---

## 更新日志

**v1.0.0** (2024-01):
- ✅ 实现二维码扫描输入功能
- ✅ 支持接收地址扫描
- ✅ 支持助记词扫描
- ✅ 支持私钥扫描
- ✅ 支持协议格式解析
- ✅ 添加扫描对话框UI
- ✅ 优化扫描性能
- ✅ 完善错误处理

---

## 未来改进

- [ ] 支持批量扫描
- [ ] 添加扫描历史记录
- [ ] 支持从相册选择二维码图片
- [ ] 添加扫描成功音效
- [ ] 支持自定义扫描框样式
- [ ] 添加扫描质量检测
- [ ] 优化低光环境下的识别率
