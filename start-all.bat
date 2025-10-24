@echo off
echo ========================================
echo   Turnierplaner - Starte Server...
echo ========================================
echo.

start "Backend Server" cmd /k "cd server && node server.js"
timeout /t 3 /nobreak >nul

echo Backend Server gestartet auf http://localhost:3001
echo.
echo Starte React App...
echo.

start "React App" cmd /k "npm start"

echo.
echo ========================================
echo Beide Server wurden gestartet!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Druecken Sie eine beliebige Taste zum Beenden...
pause >nul
