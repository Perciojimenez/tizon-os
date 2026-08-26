@echo off
chcp 65001 >nul
color 0A
echo.
echo ========================================================
echo    TIZON OS - ACTUALIZAR CODIGO DESDE GITHUB
echo ========================================================
echo.
echo Este proceso descarga TODOS los cambios mas recientes
echo a tu computadora antes de construir el APK.
echo.
pause

cd /d "%~dp0"

echo.
echo [1/3] Verificando conexion con GitHub...
git remote -v
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Esta carpeta no esta conectada a GitHub.
    echo Escribe a tu asistente para ayuda.
    echo.
    pause
    exit /b
)

echo.
echo [2/3] Descargando los ultimos cambios...
git fetch origin

echo.
echo [3/3] Aplicando los cambios (esto reemplaza el codigo viejo)...
git reset --hard origin/main

echo.
color 0A
echo ========================================================
echo    LISTO! Tu codigo ya esta actualizado.
echo ========================================================
echo.
echo Ultimo cambio aplicado:
git log --oneline -1
echo.
echo Ahora YA PUEDES construir el APK nuevo.
echo Ejecuta el archivo:  CONSTRUIR_APK.bat
echo.
pause
