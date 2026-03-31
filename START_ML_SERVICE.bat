@echo off
echo ========================================
echo STARTING ML RECOMMENDATION SERVICE
echo ========================================
echo.
echo Service will run on: http://localhost:5001
echo Press Ctrl+C to stop the service
echo.
cd /d "%~dp0ml-service"
python app.py
