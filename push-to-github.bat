@echo off
title Push GridCast to GitHub
cd /d "%~dp0"
echo.
echo ===================================================
echo   Publication de GridCast sur GitHub
echo ===================================================
echo.
echo Branche : main
echo Depot   : https://github.com/OthmanBouaddi/gridcast.git
echo.
echo Envoi des fichiers en cours...
echo (Si une fenetre de connexion GitHub s'ouvre, cliquez sur 'Sign in with your browser')
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ===================================================
    echo  [SUCCES] Vos fichiers sont en ligne sur GitHub !
    echo  Verifiez sur : https://github.com/OthmanBouaddi/gridcast
    echo ===================================================
) else (
    echo ===================================================
    echo  [INFO] Une erreur d'authentification est survenue.
    echo ===================================================
)
echo.
pause
