@echo off
start cmd /k "cd /d %~dp0ml-service && echo Starting ML Service on port 5001... && python app.py"
echo ML Service is starting in a new window!
echo Check the new window for service status.
timeout /t 3
