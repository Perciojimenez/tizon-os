@echo off
chcp 65001 >nul
color 0B
echo.
echo ========================================================
echo    TIZON OS - CONSTRUIR APK PARA ANDROID
echo ========================================================
echo.
echo IMPORTANTE: Asegurate de haber corrido ACTUALIZAR_CODIGO.bat primero.
echo.
echo Cuando pregunte sobre el emulador, escribe: n  y Enter
echo.
pause

cd /d "%~dp0apps\mobile"

echo.
echo Verificando que los paquetes esten instalados...
if not exist node_modules (
    echo No se encontraron paquetes instalados. Instalando ahora...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        color 0C
        echo.
        echo ERROR: Fallo la instalacion de paquetes.
        echo Corre primero ACTUALIZAR_CODIGO.bat e intenta de nuevo.
        echo.
        pause
        exit /b
    )
)

echo.
echo Iniciando construccion del APK... (tarda ~15 minutos)
echo.
call npx eas-cli build --platform android --profile preview

echo.
color 0A
echo ========================================================
echo    Cuando termine, veras un QR y un enlace de descarga.
echo    Escanea el QR con el celular para instalar el APK.
echo ========================================================
echo.
pause
