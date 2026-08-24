# 📱 Guía de Instalación en iPhone - Tizón OS

## Paso a Paso para Probar la App en tu iPhone

---

## 🎯 Paso 1: Instalar Expo Go en tu iPhone

1. **Abre el App Store** en tu iPhone
2. **Busca "Expo Go"** (la app oficial de Expo)
3. **Instala la app** (es completamente gratis)
4. **Abre Expo Go** una vez instalada para verificar que funciona

> 💡 **Tip:** Expo Go es como un navegador para apps en desarrollo. Te permite probar apps React Native sin tener que compilar nada.

---

## 💻 Paso 2: Preparar tu Computadora

### Opción A: Si ya tienes el proyecto clonado

Abre la terminal y navega a la carpeta del proyecto:

```bash
cd ruta/a/tizon-os/apps/mobile
```

### Opción B: Si necesitas clonar el proyecto

```bash
# Clona el repositorio
git clone https://github.com/Perciojimenez/tizon-os.git

# Navega a la carpeta mobile
cd tizon-os/apps/mobile

# Instala las dependencias (solo la primera vez)
npm install
```

---

## 🚀 Paso 3: Iniciar el Servidor de Desarrollo

En la terminal, dentro de la carpeta `apps/mobile`, ejecuta:

```bash
npm start
```

**Esto iniciará el servidor de Expo y verás algo así:**

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

**⚠️ IMPORTANTE:** 
- Tu iPhone y tu computadora **deben estar en la misma red WiFi**
- Si ves un código QR en la terminal, ¡perfecto! Ya casi terminamos

---

## 📸 Paso 4: Conectar tu iPhone

### En iPhone, tienes 2 opciones:

### **Opción A: Escanear con la Cámara (Más fácil) ⭐ RECOMENDADO**

1. **Abre la app Cámara** nativa de iOS (no abras Expo Go todavía)
2. **Apunta al código QR** que aparece en la terminal
3. **Espera la notificación** que dice "Abrir en Expo Go"
4. **Toca la notificación** → La app se abrirá automáticamente en Expo Go

### **Opción B: Escanear desde Expo Go**

1. **Abre la app Expo Go** en tu iPhone
2. **Toca "Scan QR code"** 
3. **Apunta al código QR** de la terminal
4. **La app comenzará a cargar**

---

## ⏱️ Paso 5: Espera a que Cargue

Una vez que escanees el código:

1. Verás un mensaje "Opening project..." en Expo Go
2. La app comenzará a compilarse (primera vez puede tardar 30-60 segundos)
3. ¡La app de Tizón OS se abrirá en tu iPhone! 🎉

**En la terminal verás logs como:**
```
› Opening exp://192.168.x.x:8081 on iPhone de Percio
› Bundling JavaScript... 100%
```

---

## ✅ Paso 6: Verificar que Todo Funciona

Una vez que la app cargue, deberías ver:

- ✅ La pantalla de inicio/login de Tizón OS
- ✅ Sin errores en la pantalla
- ✅ En la terminal de tu computadora: logs de conexión

**Mira los logs en la terminal para ver:**
```
[Sala] Cliente conectado: abc123...  ← Esto significa que WebSocket conectó ✅
```

---

## 🔧 Solución de Problemas

### ❌ "Unable to connect to Metro"

**Problema:** Tu iPhone no puede conectarse al servidor de desarrollo.

**Soluciones:**
1. Verifica que tu iPhone y computadora estén en la **misma red WiFi**
2. Intenta iniciar el servidor con:
   ```bash
   npm start -- --tunnel
   ```
   Esto crea un túnel que funciona incluso si no están en la misma red

### ❌ "Network request failed"

**Problema:** La app carga pero no puede conectarse al backend.

**Soluciones:**
1. Verifica que el backend esté en línea:
   ```bash
   curl https://tizon-os-production.up.railway.app/health
   ```
   Deberías ver: `{"status":"ok"}`

2. Verifica que el archivo `.env` tenga la URL correcta:
   ```
   EXPO_PUBLIC_API_URL=https://tizon-os-production.up.railway.app
   ```

### ❌ La app carga pero está en blanco

**Soluciones:**
1. En la terminal, presiona `r` para recargar la app
2. En Expo Go, agita el iPhone para abrir el menú de desarrollo
3. Selecciona "Reload"

### ❌ El código QR no aparece en la terminal

**Soluciones:**
1. Asegúrate de estar en la carpeta correcta: `apps/mobile`
2. Detén el servidor (Ctrl+C) e inicia de nuevo: `npm start`
3. Verifica que tengas Expo instalado: `npx expo --version`

---

## 📱 Funcionalidades para Probar

Una vez que la app esté funcionando en tu iPhone, puedes probar:

### 1. **Vista de Mesas (Floor Plan)**
- Deberías ver el plano de las mesas del restaurante
- Las mesas tienen diferentes estados (libre, ocupada, reservada)
- Puedes filtrar por zona (Salón, Terraza, Privado)

### 2. **Crear Reserva**
- Busca un cliente
- Selecciona una mesa
- Crea una reserva
- **¡Automáticamente se enviará un WhatsApp de confirmación!**

### 3. **Lista de Espera**
- Agrega un walk-in
- Márcalo como "mesa lista"
- **¡Se enviará un WhatsApp automático al cliente!**

### 4. **Actualizaciones en Tiempo Real**
- Si tienes la app abierta en 2 dispositivos
- Los cambios en uno se reflejan instantáneamente en el otro
- Esto es gracias a WebSocket

---

## 🔄 Cómo Recargar la App

Si haces cambios en el código y quieres ver los cambios en tu iPhone:

**Desde la terminal:**
- Presiona `r` para recargar

**Desde el iPhone:**
- Agita el iPhone para abrir el menú de desarrollo
- Selecciona "Reload"

**Recarga automática:**
- Por defecto, Expo recarga automáticamente cuando guardas cambios
- Esto se llama "Fast Refresh"

---

## 📊 Logs y Debugging

### Ver logs en tiempo real

En la terminal verás los logs de la app:
```
LOG  📥 Respuesta entrante por whatsapp desde +18295217466: "1"
LOG  ✅ Mesa actualizada: mesa-123 → ocupada
```

### Abrir React DevTools

1. En la terminal, presiona `shift+m` 
2. Se abrirá el menú de desarrollo
3. Puedes inspeccionar el estado de la app

---

## 🎨 Próximos Pasos

Una vez que la app esté funcionando en tu iPhone:

1. ✅ **Prueba crear una reserva** y verifica que llegue el WhatsApp
2. ✅ **Prueba agregar un walk-in** a la lista de espera
3. ✅ **Responde "1" al WhatsApp** de confirmación y verifica que el webhook procese la respuesta
4. ⏭️ **Implementa el login de staff** con PIN
5. ⏭️ **Agrega el logo y colores** de Tizón Meats
6. ⏭️ **Completa las pantallas** restantes

---

## 📞 Contacto

**¿Tienes problemas?** Avísame y te ayudo a resolverlo paso a paso.

**Backend:** https://tizon-os-production.up.railway.app  
**GitHub:** https://github.com/Perciojimenez/tizon-os

---

## ⚡ Comandos Útiles de Expo

```bash
# Iniciar servidor normal
npm start

# Iniciar con túnel (si no funciona la misma red WiFi)
npm start -- --tunnel

# Iniciar en modo producción
npm start -- --no-dev --minify

# Limpiar caché y reiniciar
npm start -- --clear

# Detener servidor
Ctrl + C
```

---

## 🎉 ¡Listo!

Una vez que veas la app de Tizón OS en tu iPhone, **el sistema está completamente operativo** y listo para usar en el restaurante.

¡Disfruta probando la app! 📱✨
