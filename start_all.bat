@echo off
echo ===================================================
echo   Starting EduTechAssistance Full-Stack System
echo ===================================================
echo.

echo [1/2] Launching Backend Flask REST API on http://127.0.0.1:5000 ...
start "EduTechAssistance Backend" cmd /k "cd /d %~dp0 && backend\venv\Scripts\python.exe backend\wsgi.py"

timeout /t 2 >nul

echo [2/2] Launching Frontend Web Client on http://localhost:3000 ...
start "EduTechAssistance Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All services launched!
echo - Web App: http://localhost:3000
echo - API Docs: http://127.0.0.1:5000/api/v1/docs
echo.
pause

