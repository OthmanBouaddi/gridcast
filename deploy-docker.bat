@echo off
title GridCast Docker Deployment
echo.
echo ===================================================
echo   Deploiement de GridCast avec Docker Compose
echo ===================================================
echo.

where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Docker n'est pas installe ou n'est pas dans le PATH.
    echo Veuillez installer Docker Desktop depuis https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [1/3] Construction des images Docker et demarrage des conteneurs...
docker compose up -d --build

if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Echec du demarrage Docker Compose.
    pause
    exit /b 1
)

echo.
echo [2/3] Verification de l'etat des services...
docker compose ps

echo.
echo [3/3] Deploiement termine avec succes !
echo GridCast est disponible sur : http://localhost:8000
echo.
pause
