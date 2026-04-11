@echo off
echo Iniciando Control de Inventario...

start "Backend" cmd /k "cd /d "%~dp0backend" && node --no-warnings src/app.js"
timeout /t 1 /nobreak >nul
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
pause
