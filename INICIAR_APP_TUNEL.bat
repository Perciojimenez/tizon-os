@echo off
:: ====================================================================
:: TIZÓN OS - INICIAR APP EN MODO TÚNEL (A PRUEBA DE BALAS)
:: ====================================================================
:: Este script usa MODO TÚNEL, que pasa por los servidores de Expo
:: en la nube en vez de la red local. Funciona aunque:
::   - El firewall de Windows este bloqueando
::   - El iPhone y la PC esten en WiFis diferentes
::   - El router bloquee comunicacion entre dispositivos
::
:: USO: Doble clic en este archivo (NO necesita administrador)
:: ====================================================================

echo.
echo ========================================
echo   TIZON OS - MODO TUNEL (Nube)
echo ========================================
echo.

:: ====================================================================
:: NAVEGACION AUTOMATICA A LA CARPETA CORRECTA
:: ====================================================================
echo [0/3] Ubicando la carpeta del proyecto...

if exist "%~dp0apps\mobile\package.json" (
    cd /d "%~dp0apps\mobile"
    goto :carpeta_ok
)
if exist "%~dp0package.json" (
    cd /d "%~dp0"
    goto :carpeta_ok
)
if exist "C:\Users\perci\Desktop\tizon-os\apps\mobile\package.json" (
    cd /d "C:\Users\perci\Desktop\tizon-os\apps\mobile"
    goto :carpeta_ok
)

echo.
echo [ERROR] No se encontro la carpeta del proyecto
echo Asegurate de que este .bat este dentro de la carpeta tizon-os
echo.
pause
exit /b 1

:carpeta_ok
echo       [OK] Carpeta del proyecto:
echo       %CD%
echo.

:: ====================================================================
:: PASO 1: VERIFICAR DEPENDENCIAS
:: ====================================================================
echo [1/3] Verificando dependencias...
echo.

if not exist "node_modules" (
    echo       [INSTALANDO] Faltan dependencias. Instalando...
    echo       Esto puede tardar 2-3 minutos la primera vez.
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Fallo la instalacion de dependencias
        pause
        exit /b 1
    )
) else (
    echo       [OK] Dependencias instaladas
)
echo.

:: ====================================================================
:: PASO 2: INSTALAR NGROK (necesario para el tunel)
:: ====================================================================
echo [2/3] Verificando herramienta de tunel (ngrok)...
echo.

call npm list -g @expo/ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo       [INSTALANDO] Instalando @expo/ngrok globalmente...
    echo       Esto es necesario para el modo tunel (solo la primera vez).
    echo.
    call npm install -g @expo/ngrok@^4.1.0
    if %errorlevel% neq 0 (
        echo.
        echo       [ADVERTENCIA] No se pudo instalar ngrok globalmente.
        echo       Expo intentara instalarlo automaticamente al arrancar.
        echo.
    ) else (
        echo       [OK] ngrok instalado
    )
) else (
    echo       [OK] ngrok ya instalado
)
echo.

:: ====================================================================
:: PASO 3: ARRANCAR EN MODO TUNEL
:: ====================================================================
echo [3/3] Iniciando servidor en MODO TUNEL...
echo.
echo ========================================
echo  IMPORTANTE - Lee esto:
echo ========================================
echo.
echo 1. Espera a que aparezca un CODIGO QR
echo    (En modo tunel tarda un poco mas: 30-90 segundos)
echo.
echo 2. La direccion sera tipo: exp://xxx-xxx.exp.direct
echo    (NO sera 192.168.x.x - eso es correcto en modo tunel)
echo.
echo 3. Abre EXPO GO en tu telefono
echo 4. Escanea el QR
echo 5. Espera 1-2 minutos (el tunel es mas lento pero MAS CONFIABLE)
echo.
echo Para DETENER: Presiona Ctrl+C
echo.
echo ========================================
echo.
echo Arrancando... (paciencia, el tunel tarda un poco)
echo.

call npx expo start --tunnel --clear

:: Si falla
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo [ERROR] El servidor no pudo iniciarse
    echo ========================================
    echo.
    echo Posibles soluciones:
    echo 1. Verifica tu conexion a internet
    echo 2. Ejecuta manualmente: npx expo start --tunnel
    echo 3. Si pide instalar @expo/ngrok, escribe: y  y presiona Enter
    echo.
    pause
    exit /b 1
)

pause
