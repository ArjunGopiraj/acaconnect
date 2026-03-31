@echo off
echo ========================================
echo   ACACONNECT - Starting All Services
echo ========================================
echo.

echo [1/4] Starting ML Service on port 5001...
start "ML Service" cmd /k "cd ml-service && python app.py"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Chatbot Service on port 5002...
start "Chatbot Service" cmd /k "cd chatbot-service && python app.py"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Backend on port 5000...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo [4/4] Starting Frontend on port 3000...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo ML Service:      http://localhost:5001
echo Chatbot Service: http://localhost:5002
echo Backend:         http://localhost:5000
echo Frontend:        http://localhost:3000
echo.
echo Login as: participant@test.com / participant123
echo Dashboard has chatbot button (bottom-right)
echo.
echo Press any key to close this window...
pause >nul
