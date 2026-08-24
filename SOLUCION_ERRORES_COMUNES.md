# 🔧 Solución de Errores Comunes - Tizón OS

> Guía rápida para resolver los problemas más frecuentes al ejecutar la app móvil.

---

## 🔴 Error #1: "Unknown error: The request timed out"

**Síntoma:** Al escanear el QR, el iPhone muestra "There was a problem running the requested app" con el detalle "Unknown error: The request timed out".

### Causa
El **firewall de Windows** está bloqueando el puerto 8081 y tu iPhone no puede conectarse a tu PC.

### Solución Rápida ⚡

**Opción A — Script Automático (Recomendado):**

1. Ve a la carpeta: `C:\Users\perci\Desktop\tizon-os\apps\mobile`
2. **Click derecho** en el archivo `INICIAR_APP.bat`
3. **"Ejecutar como administrador"**
4. Espera el QR y escanéalo

El script abre el firewall automáticamente.

**Opción B — Comando Manual:**

Abre CMD **como administrador** y ejecuta:
```cmd
netsh advfirewall firewall add rule name="Expo Metro" dir=in action=allow protocol=TCP localport=8081
```

Luego ve a la carpeta y ejecuta:
```cmd
cd %USERPROFILE%\Desktop\tizon-os\apps\mobile
npm start
```

### ⚠️ Si Aún Falla

Verifica **antes de escanear el QR**:

| Verificación | Dónde | Debe estar |
|---|---|---|
| WiFi del iPhone | Ajustes → WiFi | **Misma red que tu PC** |
| Datos móviles | Ajustes → Datos móviles | **APAGADOS** (temporalmente) |
| VPN | Ajustes → General → VPN | **Desconectada** |

Si tu router tiene **"Aislamiento de AP"** activado (impide que dispositivos se vean entre sí), usa el **Modo Túnel**:

```cmd
npx expo start --tunnel
```

*(Si da error la primera vez, ejecuta el mismo comando una segunda vez)*

---

## 🔴 Error #2: "npm: command not found" (Windows)

**Síntoma:** Al ejecutar `npm install` o `npm start`, CMD dice `'npm' no se reconoce como un comando interno o externo`.

### Causa
Node.js no está instalado en tu PC.

### Solución

1. Descarga Node.js desde: https://nodejs.org
2. Instala la versión **LTS** (recomendada)
3. **Reinicia CMD** (cierra y abre de nuevo)
4. Verifica con: `node --version` (debe mostrar algo como `v22.14.0`)

---

## 🔴 Error #3: PowerShell "running scripts is disabled"

**Síntoma:** PowerShell muestra: `npm.ps1 cannot be loaded because running scripts is disabled on this system`.

### Causa
PowerShell tiene restricciones de seguridad.

### Solución
**No uses PowerShell.** Usa el **Símbolo del sistema (CMD)** en su lugar:

1. Tecla Windows → escribe `cmd` → Enter
2. Ventana **negra** (NO azul)

---

## 🟡 Error #4: "Haste module naming collision"

**Síntoma:** Metro bundler da error: `Duplicated files or mocks. Please check the console for more info`.

### Causa
Carpeta duplicada dentro del proyecto (generalmente por ejecutar `git clone` dos veces).

### Solución

Desde CMD, en la carpeta `apps/mobile`, ejecuta:
```cmd
rmdir /s /q tizon-os
```

Luego reinicia:
```cmd
npm start
```

---

## 🟡 Error #5: Túnel "Cannot read properties of undefined (reading 'body')"

**Síntoma:** Al ejecutar `npx expo start --tunnel`, sale error de ngrok.

### Causa
Bug conocido de `@expo/ngrok` en Windows la primera vez.

### Solución
Ejecuta **el mismo comando una segunda vez**:
```cmd
npx expo start --tunnel
```

La segunda vez suele arrancar sin problemas.

Si sigue fallando, vuelve al **modo normal** (sin túnel) y resuelve el firewall:
```cmd
npm start
```

---

## 🟢 Error #6: "There was a problem running the requested app" (sin detalles)

**Síntoma:** Mensaje genérico sin más información.

### Diagnóstico
Necesitas ver el **detalle del error** para saber la causa real.

### Solución
1. En la pantalla de error de Expo Go, busca **"See more"** o un texto largo en rojo
2. **Tómale captura** y revisa qué dice exactamente
3. También mira la ventana CMD (donde corre `npm start`) — ¿hay mensajes rojos?

Los errores más comunes:
- **"timed out"** → Firewall (ver Error #1)
- **"SDK version mismatch"** → Ya está resuelto (SDK 57 actualizado)
- **"Unable to resolve module"** → Falta un archivo o import roto (comparte el error completo)

---

## 📶 Verificación de Red Rápida

Antes de escanear el QR, confirma esto en tu **iPhone**:

```
✅ WiFi: misma red que tu PC (192.168.1.x)
✅ Datos móviles: APAGADOS (Ajustes → Datos móviles → OFF)
✅ VPN: Desconectada
✅ Modo Avión: OFF
```

En tu **PC**:
```
✅ Firewall: puerto 8081 abierto (comando de arriba)
✅ VPN: Desconectada
✅ npm start: corriendo y muestra el QR
```

---

## 🆘 Si Nada Funciona

1. **Cierra todo** (CMD, Expo Go, etc.)
2. Reinicia tu **PC** y tu **iPhone**
3. Usa el script `INICIAR_APP.bat` (click derecho → Ejecutar como administrador)
4. Si el problema persiste, toma captura del error y compártelo

---

## 🎯 Comandos de Referencia Rápida

| Acción | Comando |
|---|---|
| Limpiar terminal | `cls` |
| Ver versión de Node | `node --version` |
| Ver versión de npm | `npm --version` |
| Ir a la carpeta de la app | `cd %USERPROFILE%\Desktop\tizon-os\apps\mobile` |
| Instalar dependencias | `npm install` |
| Arrancar servidor | `npm start` |
| Arrancar en túnel | `npx expo start --tunnel` |
| Limpiar caché | `npm start --reset-cache` |

---

*Si encontraste un error que no está aquí, documéntalo para agregarlo.*
