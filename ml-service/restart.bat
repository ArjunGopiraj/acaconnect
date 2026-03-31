@echo off
echo Stopping ML service...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *app.py*" 2>nul
timeout /t 2 /nobreak >nul

echo Starting ML service...
cd /d "%~dp0"
start "ML Service" python app.py

echo ML service restarted!
echo Check the new window for the version number.
pause
