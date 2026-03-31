@echo off
echo ========================================
echo NIRAL Chatbot Service Startup
echo ========================================
echo.

echo Step 1: Exporting events from MongoDB...
python export_events.py
echo.

echo Step 2: Starting Flask chatbot service...
echo Service will run on http://localhost:5002
echo.
python app.py
