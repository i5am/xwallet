# XWallet 开发服务器防火墙配置脚本
# 需要以管理员身份运行

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  XWallet 防火墙配置工具" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 错误：需要管理员权限" -ForegroundColor Red
    Write-Host ""
    Write-Host "请右键点击此脚本，选择'以管理员身份运行'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host "✅ 管理员权限验证通过" -ForegroundColor Green
Write-Host ""

# 定义要开放的端口
$ports = @(
    @{Name="CRVA API Server"; Port=3000; Description="CRVA 后端 API 服务"},
    @{Name="CRVA WebSocket"; Port=3001; Description="CRVA WebSocket 服务"},
    @{Name="Hardhat Node"; Port=8545; Description="Hardhat 本地区块链节点"}
)

Write-Host "准备配置以下服务的防火墙规则：" -ForegroundColor Cyan
Write-Host ""
foreach ($port in $ports) {
    Write-Host "  • $($port.Name) (端口 $($port.Port)) - $($port.Description)" -ForegroundColor White
}
Write-Host ""

$confirm = Read-Host "是否继续？(Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "操作已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "开始配置防火墙规则..." -ForegroundColor Cyan
Write-Host ""

# 配置防火墙规则
foreach ($port in $ports) {
    Write-Host "配置: $($port.Name) (端口 $($port.Port))" -ForegroundColor Yellow
    
    # 删除已存在的规则（如果有）
    $existingRule = Get-NetFirewallRule -DisplayName $port.Name -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Host "  - 删除旧规则..." -ForegroundColor Gray
        Remove-NetFirewallRule -DisplayName $port.Name -ErrorAction SilentlyContinue
    }
    
    # 创建入站规则（允许局域网访问）
    try {
        New-NetFirewallRule `
            -DisplayName $port.Name `
            -Direction Inbound `
            -LocalPort $port.Port `
            -Protocol TCP `
            -Action Allow `
            -Profile Private,Domain `
            -Description $port.Description `
            -ErrorAction Stop | Out-Null
        
        Write-Host "  ✅ 入站规则已创建" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ 入站规则创建失败: $_" -ForegroundColor Red
    }
    
    # 创建出站规则（允许响应）
    try {
        New-NetFirewallRule `
            -DisplayName "$($port.Name) (出站)" `
            -Direction Outbound `
            -LocalPort $port.Port `
            -Protocol TCP `
            -Action Allow `
            -Profile Private,Domain `
            -Description "$($port.Description) - 出站" `
            -ErrorAction Stop | Out-Null
        
        Write-Host "  ✅ 出站规则已创建" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ 出站规则创建失败: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  防火墙配置完成！" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 显示配置的规则
Write-Host "已配置的防火墙规则：" -ForegroundColor Cyan
Write-Host ""
foreach ($port in $ports) {
    $rule = Get-NetFirewallRule -DisplayName $port.Name -ErrorAction SilentlyContinue
    if ($rule) {
        Write-Host "✅ $($port.Name)" -ForegroundColor Green
        Write-Host "   端口: $($port.Port)" -ForegroundColor White
        Write-Host "   状态: $($rule.Enabled)" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  下一步操作：" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 确保服务正在运行：" -ForegroundColor White
Write-Host "   - CRVA 后端: cd server && npm start" -ForegroundColor Gray
Write-Host "   - Hardhat 节点: cd contracts && npx hardhat node" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 在手机钱包设置中配置服务器地址：" -ForegroundColor White
Write-Host "   - API: http://$(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'WLAN' | Select-Object -ExpandProperty IPAddress):3000" -ForegroundColor Gray
Write-Host "   - WebSocket: ws://$(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'WLAN' | Select-Object -ExpandProperty IPAddress):3001" -ForegroundColor Gray
Write-Host "   - 区块链: http://$(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'WLAN' | Select-Object -ExpandProperty IPAddress):8545" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 确保手机和电脑在同一 Wi-Fi 网络" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "按 Enter 键退出"
