@echo off
echo Starting Crypto Price Alert Assistant...
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Running setup...
    python start.py
    if errorlevel 1 (
        echo Setup failed. Please check the errors above.
        pause
        exit /b 1
    )
)

echo Starting backend server...
start "Backend Server" cmd /k "venv\Scripts\activate && python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Both servers are starting...
echo 🌐 Frontend will be available at http://localhost:3000
echo 🔧 Backend API will be available at http://localhost:5000
echo.
echo Press any key to exit...
pause > nul
