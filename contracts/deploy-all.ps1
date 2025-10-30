# CRVA 一键本地部署脚本
# PowerShell 版本

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CRVA Local Deployment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Start local Hardhat node" -ForegroundColor Yellow
Write-Host "2. Deploy contracts" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to start..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Set-Location "d:\projects\wdk\contracts"

Write-Host ""
Write-Host "[1/2] Starting Hardhat node..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'd:\projects\wdk\contracts'; Write-Host '🚀 CRVA Node Running' -ForegroundColor Green; npx hardhat node"

Write-Host ""
Write-Host "Waiting 10 seconds for node to start..." -ForegroundColor Yellow
for ($i=10; $i -gt 0; $i--) {
    Write-Host "  $i..." -NoNewline -ForegroundColor Cyan
    Start-Sleep -Seconds 1
}
Write-Host ""

Write-Host ""
Write-Host "[2/2] Deploying contracts..." -ForegroundColor Green
npm run test:deploy

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Next steps:" -ForegroundColor Yellow
Write-Host "1. Keep the node window running" -ForegroundColor White
Write-Host "2. Copy contract addresses from above" -ForegroundColor White
Write-Host "3. Update server/.env file" -ForegroundColor White
Write-Host "4. Start backend: cd server && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
