@echo off
echo ========================================
echo   Starting AcaConnect Application
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "AcaConnect Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Waiting 5 seconds before starting frontend...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "AcaConnect Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two command windows will open.
echo Keep them open while using the app.
echo.
echo Press any key to exit this window...
pause > nul