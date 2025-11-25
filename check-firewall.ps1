# 查看 XWallet 防火墙配置状态
# 不需要管理员权限

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  XWallet 防火墙状态检查" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查防火墙规则
$rules = @("CRVA API Server", "CRVA WebSocket", "Hardhat Node")
$allConfigured = $true

Write-Host "检查防火墙规则..." -ForegroundColor Yellow
Write-Host ""

foreach ($ruleName in $rules) {
    $rule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if ($rule) {
        Write-Host "✅ $ruleName" -ForegroundColor Green
        Write-Host "   状态: $($rule.Enabled ? '启用' : '禁用')" -ForegroundColor White
        Write-Host "   操作: $($rule.Action)" -ForegroundColor White
    } else {
        Write-Host "❌ $ruleName - 未配置" -ForegroundColor Red
        $allConfigured = $false
    }
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan

if (-not $allConfigured) {
    Write-Host "⚠️  部分规则未配置" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请运行 setup-firewall.ps1 配置防火墙" -ForegroundColor White
    Write-Host "右键点击 -> 以管理员身份运行" -ForegroundColor Gray
} else {
    Write-Host "✅ 所有规则已配置" -ForegroundColor Green
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 显示本机 IP 地址
Write-Host "本机网络信息：" -ForegroundColor Cyan
Write-Host ""

try {
    # 尝试获取 WLAN 接口 IP
    $wlanIP = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'WLAN' -ErrorAction Stop | Select-Object -ExpandProperty IPAddress
    Write-Host "Wi-Fi 地址: $wlanIP" -ForegroundColor Green
    Write-Host ""
    Write-Host "手机配置使用：" -ForegroundColor Yellow
    Write-Host "  API:        http://${wlanIP}:3000" -ForegroundColor White
    Write-Host "  WebSocket:  ws://${wlanIP}:3001" -ForegroundColor White
    Write-Host "  区块链RPC:  http://${wlanIP}:8545" -ForegroundColor White
} catch {
    # 如果没有 WLAN，显示所有 IPv4 地址
    Write-Host "可用的 IP 地址：" -ForegroundColor Yellow
    Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -ne '127.0.0.1'} | ForEach-Object {
        Write-Host "  $($_.InterfaceAlias): $($_.IPAddress)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查端口监听状态
Write-Host "检查服务端口状态..." -ForegroundColor Yellow
Write-Host ""

$ports = @(3000, 3001, 8545)
foreach ($port in $ports) {
    $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host "✅ 端口 $port 正在监听" -ForegroundColor Green
    } else {
        Write-Host "⚠️  端口 $port 未启动" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "按 Enter 键退出"
