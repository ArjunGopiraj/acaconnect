@echo off
echo Killing ALL Python processes...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM pythonw.exe /T 2>nul
timeout /t 3 >nul

echo Clearing Python cache...
cd ml-service
if exist __pycache__ rmdir /s /q __pycache__
if exist model\__pycache__ rmdir /s /q model\__pycache__
timeout /t 1 >nul

echo Starting fresh ML Service...
start "ML Service" cmd /k "python app.py"

echo.
echo ML Service restarted with fresh cache!
echo Check the new ML Service window for logs
echo.
pause
