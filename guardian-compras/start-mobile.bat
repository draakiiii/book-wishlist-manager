@echo off
echo Iniciando Guardián de Compras para móvil...
echo.
echo 1. Iniciando servidor de desarrollo...
start "React App" cmd /k "npm start"
echo.
echo 2. Esperando 10 segundos para que el servidor se inicie...
timeout /t 10 /nobreak > nul
echo.
echo 3. Iniciando ngrok para acceso móvil...
echo.
echo ========================================
echo URL para móvil (ngrok):
ngrok http 3000
echo ========================================
echo.
echo Presiona Ctrl+C para detener ngrok
pause 