@echo off
cd /d "d:\projects\wdk\contracts"
echo.
echo Waiting for local node to start...
timeout /t 5 /nobreak >nul
echo.
echo Deploying contracts...
echo.
call npm run test:deploy
echo.
pause
