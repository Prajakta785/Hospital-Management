@echo off
TITLE Hospital Management System - Permanent Launcher
COLOR 0A
CD /D "%~dp0"

echo ==========================================================
echo        STARTING HOSPITAL MANAGEMENT SYSTEM
echo ==========================================================
echo.

:: 1. Clear any stuck node processes on ports 5173 and 5000
echo [*] Checking and freeing ports 5173 and 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Wait 1 second
timeout /t 1 /nobreak >nul

:: 3. Launch browser automatically in 3 seconds in background
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: 4. Start npm run dev with automatic restart protection
echo [*] System is now running live at http://localhost:5173
echo [*] Backend API is live at http://localhost:5000
echo [*] Press Ctrl+C in this window to stop the servers.
echo ==========================================================
echo.

:LOOP
npm run dev
echo.
echo [!] Server process stopped. Automatically restarting in 2 seconds...
timeout /t 2 /nobreak >nul
goto LOOP
