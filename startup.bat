@echo off
setlocal enabledelayedexpansion
title GridCast Startup
echo.
echo  ===================================================
echo    Lancement de GridCast
echo  ===================================================
echo.
cd /d "%~dp0"
if exist "gridcast" cd gridcast
echo  Dossier : %CD%
echo.
where php >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  ERREUR : PHP introuvable dans le PATH.
    pause
    exit /b 1
)
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  ERREUR : Node.js introuvable dans le PATH.
    pause
    exit /b 1
)
if not exist ".env" (
    echo  INFO : Creation du fichier .env ...
    copy .env.example .env >nul
    php artisan key:generate
)
if not exist "database\database.sqlite" (
    echo  INFO : Creation de la base SQLite ...
    type nul > database\database.sqlite
    php artisan migrate --seed --force
)
if not exist "vendor" (
    echo  INFO : Installation Composer ...
    composer install --no-interaction
)
if not exist "node_modules" (
    echo  INFO : Installation npm ...
    npm install
)
echo.
echo  Demarrage du backend Laravel sur http://127.0.0.1:8000
start "GridCast - Backend" cmd /k "cd /d %CD% && php artisan serve --port=8000"
echo  Demarrage du frontend Vite ...
start "GridCast - Frontend" cmd /k "cd /d %CD% && npm run dev"
echo.
echo  Attente du demarrage de Laravel (8 secondes)...
timeout /t 8 /nobreak >nul
echo  Ouverture du navigateur...
start "" "http://127.0.0.1:8000"
echo.
echo  Serveurs demarres. Fermez les fenetres Backend et Frontend pour arreter.
echo.
pause
