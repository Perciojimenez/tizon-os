# ⚠️ IMPORTANTE: Ejecuta Esto en TU Computadora (Mac/PC)

## 🖥️ Este Entorno vs Tu Computadora

**Este entorno (Abacus AI):**
- Es una máquina virtual temporal en la nube
- Se usa para desarrollo y despliegue del backend
- **NO puedes conectar tu iPhone directamente aquí**

**Tu computadora (Mac/PC):**
- Es donde debes ejecutar el servidor de Expo
- Tu iPhone se conectará a ella vía WiFi
- El código QR aparecerá en tu Terminal

---

## 📱 Pasos para Probar la App en tu iPhone

### 1️⃣ Descargar el Proyecto a tu Computadora

Tienes 2 opciones:

**Opción A: Clonar desde GitHub** (Recomendado)

Abre Terminal en tu Mac o Command Prompt en tu PC:

```bash
# Clona el repositorio
git clone https://github.com/Perciojimenez/tizon-os.git

# Entra a la carpeta
cd tizon-os/apps/mobile

# Instala las dependencias
npm install
```

**Opción B: Descargar ZIP**

1. Descarga el archivo `tizon-os-completo.zip` de esta sesión
2. Descomprímelo en tu computadora
3. Abre Terminal/Command Prompt
4. Navega a la carpeta: `cd tizon-os/apps/mobile`
5. Ejecuta: `npm install`

---

### 2️⃣ Verificar que Node.js está Instalado

Antes de continuar, verifica que tienes Node.js instalado:

```bash
node --version
npm --version
```

**Si ves errores:**
- Descarga e instala Node.js desde: https://nodejs.org/
- Usa la versión LTS (Long Term Support)
- Reinicia Terminal después de instalar

---

### 3️⃣ Instalar Expo Go en tu iPhone

1. Abre **App Store** en tu iPhone
2. Busca **"Expo Go"**
3. Instala la app (es gratis)

---

### 4️⃣ Iniciar el Servidor de Expo

**En tu Mac/PC**, dentro de la carpeta `tizon-os/apps/mobile`:

```bash
npm start
```

**Verás algo así en la Terminal:**

```
Starting Metro Bundler
› Metro waiting on exp://192.168.1.100:8081

[QR CODE AQUÍ]

› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
```

---

### 5️⃣ Conectar tu iPhone

**Asegúrate de que:**
- ✅ Tu iPhone está en la **misma red WiFi** que tu computadora
- ✅ El servidor está corriendo en la Terminal
- ✅ Ves el código QR en la Terminal

**Luego:**

1. Abre la app **Cámara** en tu iPhone (no Expo Go)
2. Apunta al **código QR** de la Terminal
3. Toca la **notificación** "Abrir en Expo Go"
4. ¡Espera 30-60 segundos y la app cargará!

---

## 🛠️ Solución de Problemas

### ❌ "npm: command not found"

**Problema:** Node.js no está instalado.

**Solución:**
1. Descarga Node.js desde https://nodejs.org/
2. Instala la versión LTS
3. Reinicia Terminal
4. Ejecuta `npm start` de nuevo

### ❌ "Unable to connect to Metro"

**Problema:** iPhone y computadora no están en la misma red WiFi.

**Solución 1 - Modo Túnel:**
```bash
npm start -- --tunnel
```

Este modo crea un túnel que funciona sin estar en la misma red.

**Solución 2 - Verificar WiFi:**
- Verifica que ambos dispositivos están en la misma red
- Desactiva VPN si la tienes activa
- Reinicia el servidor (Ctrl+C, luego `npm start`)

### ❌ "Network request failed" (en la app)

**Problema:** La app no puede conectarse al backend.

**Solución:**

1. Verifica que el archivo `.env` existe en `apps/mobile/`:
   ```bash
   cat apps/mobile/.env
   ```

2. Debe contener:
   ```
   EXPO_PUBLIC_API_URL=https://tizon-os-production.up.railway.app
   ```

3. Si falta el archivo, créalo:
   ```bash
   echo "EXPO_PUBLIC_API_URL=https://tizon-os-production.up.railway.app" > apps/mobile/.env
   ```

4. Detén el servidor (Ctrl+C) y vuelve a iniciarlo:
   ```bash
   npm start
   ```

---

## ✅ Verificación

Cuando la app cargue en tu iPhone, deberías ver:

- ✅ Pantalla de inicio de Tizón OS
- ✅ Sin errores visibles
- ✅ En la Terminal: "Bundling complete"

**En la Terminal verás logs como:**
```
› Opening exp://192.168.1.100:8081 on iPhone de Percio
› Bundling JavaScript... 100%
LOG  [Sala] Cliente conectado: abc123...
```

---

## 🎯 ¿Qué Puedes Hacer en la App?

Una vez funcionando:

1. **Ver plano de mesas** en tiempo real
2. **Crear reservas** → Envía WhatsApp automático
3. **Gestionar lista de espera**
4. **Ver actualizaciones en vivo** (WebSocket)

---

## 💡 Comandos Útiles

```bash
# Iniciar servidor normal
npm start

# Iniciar con túnel (sin necesidad de misma WiFi)
npm start -- --tunnel

# Recargar app manualmente
Presiona "r" en la Terminal

# Limpiar caché
npm start -- --clear

# Detener servidor
Presiona Ctrl + C
```

---

## 📂 Estructura del Proyecto

```
tizon-os/
├── apps/
│   ├── mobile/          ← Aquí ejecutas "npm start"
│   │   ├── .env         ← Configuración del backend
│   │   ├── App.tsx      ← Punto de entrada
│   │   └── src/         ← Código fuente
│   └── backend/         ← Ya desplegado en Railway
├── database/            ← Esquema ya aplicado en Supabase
└── README.md
```

---

## 🚀 Resumen Rápido

1. **Descarga el proyecto** a tu computadora (git clone o ZIP)
2. **Navega a** `tizon-os/apps/mobile`
3. **Ejecuta** `npm install` (solo la primera vez)
4. **Ejecuta** `npm start`
5. **Escanea el QR** con la Cámara de iOS
6. **¡Listo!** La app carga en tu iPhone

---

## 📞 Backend Ya Está Desplegado

No necesitas hacer nada con el backend. Ya está en producción:

- ✅ **URL:** https://tizon-os-production.up.railway.app
- ✅ **WhatsApp:** Configurado y funcionando
- ✅ **Base de datos:** Supabase operativa
- ✅ **WebSocket:** Activo para tiempo real

Solo necesitas ejecutar el frontend móvil en tu computadora.

---

## 📖 Guías Completas

He creado 3 guías detalladas para ti:

1. **`INSTALACION_IPHONE.md`** - Guía paso a paso completa
2. **`PRUEBA_MOBILE_LISTO.md`** - Resumen de lo que está listo
3. **`GUIA_PRUEBA_MOBILE.md`** - Funcionalidades de la app

Todas están en la carpeta `tizon-os/`.

---

## 🎉 ¡Disfruta Probando la App!

Si tienes algún problema, revisa la sección de **Solución de Problemas** arriba o avísame.

**¡El sistema está completo y listo para usar!** 📱✨
