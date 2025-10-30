# PowerShell 脚本 - 部署合约到本地节点
Set-Location "d:\projects\wdk\contracts"
Write-Host ""
Write-Host "⏳ Waiting for local node..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""
Write-Host "🚀 Deploying contracts..." -ForegroundColor Green
Write-Host ""
npm run test:deploy
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
