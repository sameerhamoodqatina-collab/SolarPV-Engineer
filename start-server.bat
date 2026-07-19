@echo off
set PATH=C:\node-v20.15.1-win-x64;%PATH%
cd /d "C:\Users\PC\Documents\Default Project\solar-pv-engineer"
echo Starting Solar PV Engineer on http://localhost:3000
echo Press Ctrl+C to stop
echo.
node node_modules\next\dist\bin\next start -p 3000 -H 0.0.0.0
