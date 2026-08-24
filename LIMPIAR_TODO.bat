@echo off
:: ====================================================================
:: TIZÓN OS - Script de Limpieza Completa
:: ====================================================================
:: Este script elimina TODO lo temporal/compilado para empezar limpio:
:: - node_modules (todas las carpetas)
:: - Cachés de Expo (.expo, .expo-shared)
:: - Archivos compilados (dist/, build/)
:: - Cachés de Metro Bundler
:: - Lockfiles corruptos
::
:: NO BORRA: código fuente, configuración, base de datos, .git
:: ====================================================================

echo.
echo ========================================
echo   TIZON OS - Limpieza Completa
echo ========================================
echo.
echo ATENCION: Este script borrara:
echo   - Todas las carpetas node_modules
echo   - Caches de compilacion
echo   - Archivos temporales
echo.
echo El codigo fuente NO se borrara.
echo.
pause

echo.
echo [1/6] Limpiando node_modules del proyecto raiz...
if exist "%~dp0node_modules" (
    rmdir /s /q "%~dp0node_modules" 2>nul
    echo       [OK] Borrado
) else (
    echo       [SKIP] No existia
)

echo.
echo [2/6] Limpiando node_modules del backend...
if exist "%~dp0apps\backend\node_modules" (
    rmdir /s /q "%~dp0apps\backend\node_modules" 2>nul
    echo       [OK] Borrado
) else (
    echo       [SKIP] No existia
)

echo.
echo [3/6] Limpiando node_modules de la app mobile...
if exist "%~dp0apps\mobile\node_modules" (
    rmdir /s /q "%~dp0apps\mobile\node_modules" 2>nul
    echo       [OK] Borrado
) else (
    echo       [SKIP] No existia
)

echo.
echo [4/6] Limpiando caches de Expo...
if exist "%~dp0apps\mobile\.expo" (
    rmdir /s /q "%~dp0apps\mobile\.expo" 2>nul
    echo       [OK] .expo borrado
) else (
    echo       [SKIP] .expo no existia
)

if exist "%~dp0apps\mobile\.expo-shared" (
    rmdir /s /q "%~dp0apps\mobile\.expo-shared" 2>nul
    echo       [OK] .expo-shared borrado
) else (
    echo       [SKIP] .expo-shared no existia
)

echo.
echo [5/6] Limpiando archivos compilados...
if exist "%~dp0apps\backend\dist" (
    rmdir /s /q "%~dp0apps\backend\dist" 2>nul
    echo       [OK] backend/dist borrado
) else (
    echo       [SKIP] backend/dist no existia
)

if exist "%~dp0apps\mobile\dist" (
    rmdir /s /q "%~dp0apps\mobile\dist" 2>nul
    echo       [OK] mobile/dist borrado
) else (
    echo       [SKIP] mobile/dist no existia
)

echo.
echo [6/6] Limpiando lockfiles...
if exist "%~dp0package-lock.json" (
    del /f /q "%~dp0package-lock.json" 2>nul
    echo       [OK] package-lock.json (raiz) borrado
) else (
    echo       [SKIP] package-lock.json (raiz) no existia
)

if exist "%~dp0apps\mobile\package-lock.json" (
    del /f /q "%~dp0apps\mobile\package-lock.json" 2>nul
    echo       [OK] package-lock.json (mobile) borrado
) else (
    echo       [SKIP] package-lock.json (mobile) no existia
)

if exist "%~dp0apps\backend\package-lock.json" (
    del /f /q "%~dp0apps\backend\package-lock.json" 2>nul
    echo       [OK] package-lock.json (backend) borrado
) else (
    echo       [SKIP] package-lock.json (backend) no existia
)

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
echo.
echo El proyecto esta limpio. Ahora puedes:
echo.
echo 1. Reinstalar dependencias con: npm install
echo 2. Arrancar el servidor con: INICIAR_APP.bat
echo.
echo Presiona cualquier tecla para salir...
pause > nul
