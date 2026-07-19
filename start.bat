@echo off
title Solar PV Engineer - Professional Solar Design Tool
echo ========================================
echo   Solar PV Engineer
echo   Professional Solar PV Design Tool
echo ========================================
echo.

set PATH=C:\node-v20.15.1-win-x64;%PATH%
cd /d "%~dp0"

echo Starting server...
echo.

start "" "http://localhost:3000"

pnpm start
