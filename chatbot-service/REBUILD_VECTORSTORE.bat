@echo off
echo Deleting old vector database...
rmdir /s /q vectorstore
echo.
echo Vector database deleted!
echo.
echo Starting chatbot service to rebuild vector database...
python app.py
