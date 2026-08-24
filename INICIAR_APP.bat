@echo off
:: ====================================================================
:: TIZÓN OS - Script de Inicio Automático para Windows
:: ====================================================================
:: Este script hace TODO lo necesario para arrancar la app:
:: 1. Verifica que estás en la carpeta correcta
:: 2. Abre el firewall (puerto 8081) para que el iPhone conecte
:: 3. Arranca el servidor Expo
::
:: INSTRUCCIONES: 
:: - Click derecho en este archivo → "Ejecutar como administrador"
:: - Espera a que aparezca el código QR
:: - Escanéalo con Expo Go en tu iPhone
:: ====================================================================

echo.
echo ========================================
echo   TIZON OS - Iniciando Servidor
echo ========================================
echo.

:: Verificar si estamos en la carpeta correcta
if not exist "package.json" (
    echo [ERROR] No se encontro package.json
    echo.
    echo Este script debe ejecutarse desde la carpeta:
    echo   C:\Users\perci\Desktop\tizon-os\apps\mobile
    echo.
    echo Presiona cualquier tecla para salir...
    pause > nul
    exit /b 1
)

:: Verificar que el archivo app.json existe (confirmación de que estamos en mobile)
if not exist "app.json" (
    echo [ERROR] No se encontro app.json
    echo Estas en la carpeta correcta?
    echo.
    pause
    exit /b 1
)

echo [1/3] Verificando permisos de firewall...
echo.

:: Intentar abrir el firewall (requiere permisos de admin)
netsh advfirewall firewall show rule name="Expo Metro" > nul 2>&1
if %errorlevel% neq 0 (
    echo       Abriendo puerto 8081 en el firewall de Windows...
    netsh advfirewall firewall add rule name="Expo Metro" dir=in action=allow protocol=TCP localport=8081 > nul 2>&1
    if %errorlevel% equ 0 (
        echo       [OK] Firewall configurado correctamente
    ) else (
        echo       [ADVERTENCIA] No se pudo configurar el firewall automaticamente.
        echo       Necesitas ejecutar este script como ADMINISTRADOR:
        echo         1. Click derecho en INICIAR_APP.bat
        echo         2. "Ejecutar como administrador"
        echo.
        echo       O abre el firewall manualmente siguiendo PASOS_FINALES_WINDOWS.md
        echo.
    )
) else (
    echo       [OK] Firewall ya configurado
)

echo.
echo [2/3] Verificando dependencias...
echo.

:: Verificar que node_modules existe
if not exist "node_modules" (
    echo       [INSTALANDO] No se encontraron las dependencias. Instalando...
    echo       Esto puede tardar 2-3 minutos la primera vez.
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Fallo la instalacion de dependencias
        echo Presiona cualquier tecla para salir...
        pause > nul
        exit /b 1
    )
) else (
    echo       [OK] Dependencias instaladas
)

echo.
echo [3/3] Iniciando servidor Expo...
echo.
echo ========================================
echo  IMPORTANTE - Lee esto:
echo ========================================
echo.
echo 1. Espera a que aparezca un CODIGO QR
echo 2. Abre EXPO GO en tu iPhone
echo 3. Toca "Scan QR code"
echo 4. Apunta al QR que aparecera abajo
echo 5. Espera 30-60 segundos
echo.
echo Para DETENER el servidor:
echo   Presiona Ctrl+C
echo.
echo ========================================
echo.

:: Arrancar Expo
call npm start

:: Si Expo falla, mostrar mensaje de ayuda
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo [ERROR] El servidor no pudo iniciarse
    echo ========================================
    echo.
    echo Posibles soluciones:
    echo 1. Asegurate de estar conectado a internet
    echo 2. Cierra cualquier otra ventana de CMD que tenga "npm start" corriendo
    echo 3. Ejecuta manualmente: npm start --reset-cache
    echo.
    echo Si el problema persiste, lee: PASOS_FINALES_WINDOWS.md
    echo.
    pause
    exit /b 1
)
