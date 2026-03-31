@echo off
echo ========================================
echo Starting ML Recommendation Service
echo ========================================
echo.

cd ml-service

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking required packages...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
)

echo.
echo Starting ML Service on port 5001...
echo Press Ctrl+C to stop the service
echo.

python app.py

pause
