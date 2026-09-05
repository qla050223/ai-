@echo off
chcp 65001 >nul
title AI面试平台 - 一键启动

echo ============================================
echo   AI 智能面试平台  一键启动脚本
echo ============================================
echo.

cd /d "%~dp0"

REM ===== 检查 node_modules 是否存在，不存在则安装 =====
if not exist "node_modules" (
    echo [1/3] 前端依赖缺失，正在执行 npm install ...
    call npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败，请检查网络后重试
        pause
        exit /b 1
    )
)

if not exist "server\node_modules" (
    echo [2/3] 后端依赖缺失，正在执行 npm install ...
    cd server
    call npm install
    cd ..
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败，请检查网络后重试
        pause
        exit /b 1
    )
)

echo [3/3] 正在启动前后端服务...
echo.
echo    后端: http://localhost:3000
echo    前端: http://localhost:5173
echo.
echo    提示：关闭此窗口将停止所有服务
echo ============================================
echo.

REM ===== 启动后端（新窗口） =====
start "后端服务" cmd /k "cd /d %~dp0server && node src/server.js"

REM ===== 等待后端启动（给数据库连接留点时间） =====
timeout /t 3 /nobreak >nul

REM ===== 启动前端（新窗口） =====
start "前端服务" cmd /k "cd /d %~dp0 && npm run dev"

REM ===== 等待前端启动后自动打开浏览器 =====
timeout /t 5 /nobreak >nul
start http://localhost:5173/

echo 服务已启动，浏览器将自动打开...
echo.
echo 如需停止服务，关闭"后端服务"和"前端服务"两个窗口即可。
echo.
pause
