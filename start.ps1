# Tether WDK Wallet 启动脚本

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Tether WDK Wallet 启动程序" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] 未找到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

# 检查 npm
Write-Host "检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] 未找到 npm" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""

# 检查 node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "首次运行，正在安装依赖..." -ForegroundColor Yellow
    Write-Host "这可能需要几分钟，请耐心等待..." -ForegroundColor Gray
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] 依赖安装失败" -ForegroundColor Red
        Write-Host "请尝试运行: npm install --legacy-peer-deps" -ForegroundColor Yellow
        Read-Host "按任意键退出"
        exit 1
    }
    
    Write-Host ""
    Write-Host "[OK] 依赖安装完成！" -ForegroundColor Green
} else {
    Write-Host "[OK] 依赖已安装" -ForegroundColor Green
}

# 启动开发服务器
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  正在启动开发服务器..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务器将在以下地址运行:" -ForegroundColor Yellow
Write-Host "  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示:" -ForegroundColor Gray
Write-Host "  - 修改代码后会自动刷新" -ForegroundColor Gray
Write-Host "  - 按 Ctrl+C 可以停止服务器" -ForegroundColor Gray
Write-Host "  - 按 O 可以在浏览器中打开" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
