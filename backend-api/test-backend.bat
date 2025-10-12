@echo off
echo ============================================================
echo 🧪 Lancement des tests backend
echo ============================================================
echo.
cd /d "%~dp0"
node test-backend-sync.js
pause
