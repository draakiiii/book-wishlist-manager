Write-Host "Iniciando Guardián de Compras para móvil..." -ForegroundColor Green
Write-Host ""

Write-Host "1. Iniciando servidor de desarrollo..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

Write-Host ""
Write-Host "2. Esperando 10 segundos para que el servidor se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "3. Iniciando ngrok para acceso móvil..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "URL para móvil (ngrok):" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

ngrok http 3000

Write-Host ""
Write-Host "Presiona Ctrl+C para detener ngrok" -ForegroundColor Red
Read-Host "Presiona Enter para continuar" 