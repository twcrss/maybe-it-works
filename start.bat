@echo off
echo Starting local server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python server...
    python server.py
    goto :end
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Node.js server...
    node server.js
    goto :end
)

echo Error: Neither Python nor Node.js found!
echo Please install Python or Node.js to run the server.
echo.
echo Alternatively, you can:
echo 1. Install Python from https://www.python.org/
echo 2. Install Node.js from https://nodejs.org/
echo 3. Use VS Code with Live Server extension
pause

:end

