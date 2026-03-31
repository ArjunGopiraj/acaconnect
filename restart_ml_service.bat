@echo off
echo Stopping ML Service...
taskkill /F /IM python.exe 2>nul
timeout /t 2 >nul

echo Starting ML Service...
cd ml-service
start "ML Service" python app.py

echo.
echo ML Service restarted!
echo Check the ML Service window for: [OK] Loaded real interaction data: 16 users, 12 events
echo.
pause
