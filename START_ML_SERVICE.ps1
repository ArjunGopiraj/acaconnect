# Start ML Service in a new window
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$mlServicePath = Join-Path $scriptPath "ml-service"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STARTING ML RECOMMENDATION SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening new window for ML Service..." -ForegroundColor Yellow
Write-Host "Service will run on: http://localhost:5001" -ForegroundColor Green
Write-Host ""

# Start in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$mlServicePath'; Write-Host 'ML Service Starting...' -ForegroundColor Green; python app.py"

Write-Host "ML Service window opened!" -ForegroundColor Green
Write-Host "Check the new window for service status." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
