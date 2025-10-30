@echo off
color 0A
title CRVA Local Deployment

echo.
echo ========================================
echo    CRVA Local Deployment
echo ========================================
echo.
echo This script will:
echo 1. Start local Hardhat node
echo 2. Deploy contracts
echo.
echo Press any key to start...
pause >nul

cd /d "d:\projects\wdk\contracts"

echo.
echo [1/2] Starting Hardhat node...
start "CRVA Node" cmd /k "npx hardhat node"

echo.
echo Waiting 10 seconds for node to start...
timeout /t 10 /nobreak >nul

echo.
echo [2/2] Deploying contracts...
call npm run test:deploy

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Keep the "CRVA Node" window running
echo 2. Copy contract addresses from above
echo 3. Update server/.env file
echo 4. Start backend: cd server ^&^& npm run dev
echo.
pause
