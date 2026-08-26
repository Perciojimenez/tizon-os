@echo off
chcp 65001 >nul
color 0B
echo.
echo ========================================================
echo    TIZON OS - CONSTRUIR APK PARA ANDROID
echo ========================================================
echo.
echo IMPORTANTE: Antes de esto, ejecuta ACTUALIZAR_CODIGO.bat
echo para asegurarte de tener el codigo mas reciente.
echo.
echo Cuando pregunte sobre el emulador, escribe: n  y Enter
echo.
pause

cd /d "%~dp0apps\mobile"

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
