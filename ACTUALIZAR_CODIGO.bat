@echo off
chcp 65001 >nul
color 0A
echo.
echo ========================================================
echo    TIZON OS - ACTUALIZAR CODIGO DESDE GITHUB
echo ========================================================
echo.
echo Este proceso descarga TODOS los cambios mas recientes
echo a tu computadora e instala los paquetes necesarios.
echo.
pause

cd /d "%~dp0"

echo.
echo [1/4] Verificando conexion con GitHub...
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
echo [2/4] Descargando los ultimos cambios...
git fetch origin

echo.
echo [3/4] Aplicando los cambios (esto reemplaza el codigo viejo)...
git reset --hard origin/main

echo.
echo [4/4] Instalando paquetes nuevos (npm install)...
echo       Esto puede tardar 2-5 minutos la primera vez.
cd /d "%~dp0apps\mobile"
call npm install --legacy-peer-deps
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Fallo la instalacion de paquetes.
    echo Intenta correr este archivo de nuevo.
    echo.
    pause
    exit /b
)

cd /d "%~dp0"

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
