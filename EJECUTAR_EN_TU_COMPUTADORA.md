# 🧹 PASO 0 — Limpieza Completa (Empezar de Cero)

> **Ejecuta esto PRIMERO** para borrar todas las versiones viejas y empezar limpio.

---

## ¿Por Qué Limpiar?

Si ya descargaste el proyecto antes, pueden quedar:
- ❌ Versiones viejas de dependencias (node_modules)
- ❌ Cachés corruptos de Expo
- ❌ Archivos compilados obsoletos
- ❌ Lockfiles con conflictos

**El script de limpieza borra TODO esto de forma segura** (sin tocar el código fuente).

---

## 📋 Paso a Paso — Limpieza Total

### **Opción 1 — Script Automático (Recomendada)**

1. Abre el **Explorador de Archivos**
2. Ve a: **`Escritorio → tizon-os`** (si existe)
3. Busca el archivo **`LIMPIAR_TODO.bat`**
4. **Doble click** en el archivo (NO necesita permisos de admin)
5. Cuando pregunte, presiona **cualquier tecla** para continuar
6. Espera 10-30 segundos → verás "LIMPIEZA COMPLETADA"

**El script borra:**
- ✅ Todas las carpetas `node_modules`
- ✅ Cachés de Expo (`.expo`, `.expo-shared`)
- ✅ Archivos compilados (`dist/`, `build/`)
- ✅ Lockfiles (`package-lock.json`)

**NO borra:**
- ✅ Código fuente (`src/`, `apps/`)
- ✅ Configuración (`package.json`, `tsconfig.json`)
- ✅ Base de datos (`database/`)
- ✅ Git (`.git/`)

---

### **Opción 2 — Manual (Si no existe LIMPIAR_TODO.bat)**

Abre **CMD** y ejecuta:

```cmd
cd %USERPROFILE%\Desktop
rmdir /s /q tizon-os
```

Presiona **Enter**. Si pregunta algo, escribe `S` y Enter.

Esto borra **TODO el directorio** (más radical que la Opción 1, pero garantiza limpieza total).

---

## ✅ Después de la Limpieza

Una vez que la limpieza termine, **sigue con el PUNTO 1**.

---

---

# 🎯 PUNTO 1 — Descargar e Instalar (Versión Limpia)

> **Ahora que todo está limpio**, descargamos la versión actualizada de GitHub.

---

## 📋 Pasos a Ejecutar (5 minutos)

### **Paso 1 — Abrir CMD**

1. Tecla **Windows** → escribe **`cmd`** → Enter
2. Debe abrirse una ventana **NEGRA** (si es azul, es PowerShell, ciérrala y abre CMD)

---

### **Paso 2 — Ir al Escritorio**

```cmd
cd %USERPROFILE%\Desktop
```

Presiona **Enter**.

---

### **Paso 3 — Descargar la Versión Nueva de GitHub**

```cmd
git clone https://github.com/Perciojimenez/tizon-os.git
```

Presiona **Enter**.

**Espera 15-30 segundos** mientras descarga. Verás mensajes que dicen "Cloning into...", "Receiving objects...", etc.

---

### **Paso 4 — Entrar a la Carpeta de la App**

```cmd
cd tizon-os\apps\mobile
```

Presiona **Enter**.

---

### **Paso 5 — Instalar Dependencias**

```cmd
npm install
```

Presiona **Enter**.

**Espera 1-3 minutos.** Verás muchos mensajes (algunos amarillos que dicen "warn" — son normales, NO son errores).

Cuando termine, verás algo como:
```
added 1234 packages in 2m
```

---

### **Paso 6 — Arrancar el Servidor (Script Automático)**

#### ⭐ **OPCIÓN A — Script Automático (Recomendada)**

1. **Minimiza la ventana CMD** (NO la cierres)
2. Abre el **Explorador de Archivos** (icono de carpeta amarilla)
3. Ve a: **`Escritorio → tizon-os → apps → mobile`**
4. Busca el archivo **`INICIAR_APP.bat`** (icono de engrane)
5. **Click derecho** en `INICIAR_APP.bat` → **"Ejecutar como administrador"**
6. Cuando Windows pregunte **"¿Quieres permitir que esta aplicación haga cambios?"**, click en **"Sí"**

El script hará TODO automáticamente:
- ✅ Abrirá el firewall (puerto 8081)
- ✅ Verificará dependencias
- ✅ Arrancará el servidor Expo
- ✅ Mostrará el código QR

**Si sale algún error de firewall**, es porque NO se ejecutó como administrador. Cierra la ventana, vuelve al Explorador y repite: **Click derecho → "Ejecutar como administrador"**.

---

#### 🔧 **OPCIÓN B — Manual (Solo si la A falla)**

Desde la ventana CMD que ya tienes abierta:

```cmd
npm start
```

Presiona **Enter**.

La **primera vez** que ejecutes esto, Windows mostrará una ventana de **Firewall de Windows Defender**:

**→ Marca SOLO "Redes privadas"**
**→ Click en "Permitir acceso"**

---

### **Paso 7 — Escanear el QR con Tu iPhone**

Cuando veas el código QR en la ventana (puede tardar 10-20 segundos), **SIN CERRAR LA VENTANA**:

1. Toma tu **iPhone**
2. Abre la app **Expo Go**
3. Toca **"Scan QR code"**
4. Apunta la cámara al código QR que apareció en la ventana de tu PC
5. **Espera 30-60 segundos** (la primera vez tarda porque compila)

**Deberías ver la pantalla de Login de Tizón OS.** 🎉

---

## ⚠️ Requisitos de Red (MUY IMPORTANTE)

Antes de escanear el QR, verifica en tu iPhone:

| Configuración | Estado |
|---|---|
| WiFi | ✅ **Misma red que tu PC** |
| Datos móviles | ❌ **APAGADOS** (temporalmente) |
| VPN | ❌ **Desconectada** |

**Cómo verificar/cambiar en iPhone:**
- Ajustes → WiFi → asegúrate que es la misma red que tu PC
- Ajustes → Datos móviles → apaga el switch verde
- Ajustes → General → VPN → si hay alguna, desconéctala

---

## 🆘 Si Aparece Error "The request timed out"

Si el iPhone muestra el error de timeout después de escanear el QR:

1. **Cierra la ventana** donde corre el servidor (Ctrl+C o click en la X)
2. Abre CMD de nuevo → `cd %USERPROFILE%\Desktop\tizon-os\apps\mobile`
3. Ejecuta el **modo túnel**:
   ```cmd
   npx expo start --tunnel
   ```
4. Si pregunta si quieres instalar algo, escribe **`y`** + Enter
5. **Si da error la primera vez, ejecuta el mismo comando UNA SEGUNDA VEZ** (bug conocido de ngrok en Windows)
6. Espera el QR y escanéalo de nuevo

---

## 🎯 Criterio de Éxito del Punto 1

**✅ La app abre en tu teléfono**
**✅ Ves la pantalla de Login de Tizón OS**
**✅ No hay error de timeout**

**Cuando veas la pantalla de Login, me avisas y pasamos al Punto 2.** 🚀

---

## 📸 Si Hay Algún Error

Si algo falla:
1. **Tómale captura de pantalla** al error (tanto de la ventana CMD como del iPhone)
2. **Cópiame el mensaje de error** exacto que aparece
3. Me lo mandas y lo resuelvo al instante

---

## 📊 Resumen Rápido (Los Comandos en Orden)

| Paso | Comando |
|------|---------|
| 0A | Ejecutar `LIMPIAR_TODO.bat` (doble click) |
| 0B | O bien: `rmdir /s /q %USERPROFILE%\Desktop\tizon-os` |
| 1 | `cd %USERPROFILE%\Desktop` |
| 2 | `git clone https://github.com/Perciojimenez/tizon-os.git` |
| 3 | `cd tizon-os\apps\mobile` |
| 4 | `npm install` |
| 5 | Ejecutar `INICIAR_APP.bat` como administrador |
| 6 | Escanear QR con Expo Go |

---

**¡Empieza con el Paso 0 (limpieza) ahora!** 💪
