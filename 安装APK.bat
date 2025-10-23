@echo off
echo ========================================
echo   Tether WDK Wallet APK 安装助手
echo ========================================
echo.
echo APK 文件位置:
echo D:\projects\wdk\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo ========================================
echo   推荐安装方法
echo ========================================
echo.
echo 方法 1: 微信/QQ 传输 (最简单)
echo    1. 在电脑打开微信
echo    2. 发送 APK 到"文件传输助手"
echo    3. 手机下载并点击安装
echo.
echo 方法 2: USB 复制
echo    1. 用数据线连接手机
echo    2. 将 APK 复制到手机 Download 文件夹
echo    3. 在手机上点击 APK 安装
echo.
echo 方法 3: 邮件发送
echo    1. 将 APK 作为附件发送到自己邮箱
echo    2. 手机下载附件
echo    3. 点击安装
echo.
echo ========================================
echo   正在打开 APK 文件夹...
echo ========================================
echo.

start explorer.exe "D:\projects\wdk\android\app\build\outputs\apk\debug"

echo.
echo APK 文件夹已打开!
echo 文件名: app-debug.apk
echo 大小: 5.63 MB
echo.
echo 请选择上述任一方法将 APK 传输到手机并安装
echo.
pause
