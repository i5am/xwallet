# 🚀 快速安装和运行

## 一键启动脚本

### Windows PowerShell

将以下内容保存为 `start.ps1`，然后双击运行：

```powershell
# Tether WDK Wallet 启动脚本

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Tether WDK Wallet 启动程序" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    exit 1
}

# 检查 npm
Write-Host "检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到 npm" -ForegroundColor Red
    exit 1
}

# 检查 node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "首次运行，正在安装依赖..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ 依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "✓ 依赖已安装" -ForegroundColor Green
}

# 启动开发服务器
Write-Host ""
Write-Host "正在启动开发服务器..." -ForegroundColor Yellow
Write-Host "浏览器将自动打开 http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 可以停止服务器" -ForegroundColor Gray
Write-Host ""

npm run dev
```

### 手动步骤

#### 1. 打开 PowerShell
按 `Win + X`，选择 "Windows PowerShell" 或 "终端"

#### 2. 进入项目目录
```powershell
cd d:\projects\wdk
```

#### 3. 安装依赖（首次运行）
```powershell
npm install
```

等待安装完成（可能需要几分钟）

#### 4. 启动开发服务器
```powershell
npm run dev
```

#### 5. 打开浏览器
看到类似以下输出：
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

在浏览器中打开 `http://localhost:5173`

---

## 常见问题解决

### ❌ "无法加载文件，因为在此系统上禁止运行脚本"

**解决方法：**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### ❌ "npm install 失败"

**解决方法：**
```powershell
# 清除缓存
npm cache clean --force

# 重新安装
npm install --legacy-peer-deps
```

### ❌ "端口 5173 已被占用"

**解决方法：**
```powershell
# 查找占用端口的进程
netstat -ano | findstr :5173

# 结束进程（替换 <PID> 为实际进程 ID）
taskkill /PID <PID> /F

# 或者使用其他端口
npm run dev -- --port 3000
```

### ❌ "找不到模块"

**解决方法：**
```powershell
# 删除 node_modules 和锁文件
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 重新安装
npm install
```

---

## 下一步

1. ✅ 创建第一个钱包
2. ✅ 保存助记词
3. ✅ 测试网测试
4. ✅ 查看开发文档

祝使用愉快！🎉
