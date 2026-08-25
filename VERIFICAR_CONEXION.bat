@echo off
chcp 65001 >nul
cls

echo ╔════════════════════════════════════════════════════════════╗
echo ║      🔍 TIZÓN OS - VERIFICADOR DE CONEXIÓN                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este script diagnostica problemas de red entre tu PC y iPhone
echo.
echo ════════════════════════════════════════════════════════════
echo  DIAGNÓSTICO 1: Información de Red
echo ════════════════════════════════════════════════════════════
echo.

echo 📡 Tu configuración de red:
echo.
ipconfig | findstr /C:"IPv4" /C:"Wireless" /C:"Ethernet"
echo.

echo ════════════════════════════════════════════════════════════
echo  DIAGNÓSTICO 2: Puerto 8081 (Expo)
echo ════════════════════════════════════════════════════════════
echo.

netstat -an | findstr ":8081" >nul 2>&1
if errorlevel 1 (
    echo ✅ Puerto 8081: LIBRE (listo para usar)
) else (
    echo ⚠️  Puerto 8081: EN USO
    echo.
    echo 💡 Esto significa que algo ya está usando el puerto.
    echo    Probablemente tienes otro servidor Expo corriendo.
    echo.
    echo Procesos usando el puerto 8081:
    netstat -ano | findstr ":8081"
    echo.
)
echo.

echo ════════════════════════════════════════════════════════════
echo  DIAGNÓSTICO 3: Firewall de Windows
echo ════════════════════════════════════════════════════════════
echo.

netsh advfirewall firewall show rule name="Expo Metro" >nul 2>&1
if errorlevel 1 (
    echo ❌ Regla de firewall: NO CONFIGURADA
    echo.
    echo 💡 Solución:
    echo    Ejecuta INICIAR_APP.bat como administrador
) else (
    echo ✅ Regla de firewall: CONFIGURADA
    netsh advfirewall firewall show rule name="Expo Metro" | findstr /C:"Acción" /C:"Enabled"
)
echo.

echo ════════════════════════════════════════════════════════════
echo  DIAGNÓSTICO 4: Backend de Railway
echo ════════════════════════════════════════════════════════════
echo.

echo 🌐 Probando conexión a backend...
curl -s -o nul -w "Status: %%{http_code}\n" https://tizon-os-production.up.railway.app 2>nul
if errorlevel 1 (
    echo ❌ No se pudo conectar al backend
    echo    Verifica tu conexión a internet
) else (
    echo ✅ Backend accesible
)
echo.

echo ════════════════════════════════════════════════════════════
echo  DIAGNÓSTICO 5: Node.js y Expo CLI
echo ════════════════════════════════════════════════════════════
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js: NO INSTALADO
) else (
    for /f "tokens=*" %%v in ('node --version 2^>nul') do echo ✅ Node.js: %%v
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ npm: NO INSTALADO
) else (
    for /f "tokens=*" %%v in ('npm --version 2^>nul') do echo ✅ npm: %%v
)

where expo >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Expo CLI: NO INSTALADO GLOBALMENTE
    echo    (Esto es opcional, se puede usar npx expo)
) else (
    echo ✅ Expo CLI: INSTALADO
)
echo.

echo ════════════════════════════════════════════════════════════
echo  📋 RESUMEN Y RECOMENDACIONES
echo ════════════════════════════════════════════════════════════
echo.

REM Contar problemas
set PROBLEMS=0

netstat -an | findstr ":8081" >nul 2>&1
if not errorlevel 1 set /a PROBLEMS+=1

netsh advfirewall firewall show rule name="Expo Metro" >nul 2>&1
if errorlevel 1 set /a PROBLEMS+=1

if %PROBLEMS% EQU 0 (
    echo ✅ TODO BIEN - No se detectaron problemas
    echo.
    echo 🚀 Siguiente paso:
    echo    Ejecuta INICIAR_APP.bat
) else (
    echo ⚠️  SE DETECTARON %PROBLEMS% PROBLEMA(S)
    echo.
    echo 💡 SOLUCIONES:
    echo.
    if not errorlevel 1 (
        echo    1. Cierra cualquier ventana CMD con "npm start" corriendo
        echo    2. Ejecuta: LIMPIAR_TODO.bat
    )
    netsh advfirewall firewall show rule name="Expo Metro" >nul 2>&1
    if errorlevel 1 (
        echo    3. Ejecuta INICIAR_APP.bat como ADMINISTRADOR
        echo       (Click derecho → Ejecutar como administrador)
    )
)
echo.

echo ════════════════════════════════════════════════════════════
echo.
echo 📸 CAPTURA DE PANTALLA
echo    Toma una captura de esta ventana y compártela si necesitas ayuda
echo.
pause
