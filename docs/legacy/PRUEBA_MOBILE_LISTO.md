# ✅ Todo Listo para Probar en iPhone

La app móvil está **100% configurada** y lista para probarse en tu iPhone. Solo necesitas seguir estos 3 pasos sencillos:

---

## 📱 Paso 1: Instalar Expo Go en tu iPhone

1. Abre **App Store** en tu iPhone
2. Busca **"Expo Go"**
3. Instala la app (es gratis)

---

## 💻 Paso 2: Iniciar el Servidor desde tu Computadora

Abre la **Terminal** en tu Mac/PC y ejecuta:

```bash
# Navega a la carpeta del proyecto
cd tizon-os/apps/mobile

# Inicia el servidor
npm start
```

**Verás algo así:**

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

█▀▀▀▀▀█ ▀▀█▀▀▀ ▀█▀█▀ █▀▀▀▀▀█
█ ███ █ ▀▀█▀▀▀ █▀█▀█ █ ███ █
█ ▀▀▀ █ █▀█▀█▀ ▀█▀█▀ █ ▀▀▀ █
▀▀▀▀▀▀▀ ▀ █ █ ▀ █ ▀ ▀▀▀▀▀▀▀

› Press a │ open Android
› Press i │ open iOS simulator
```

**¡Un código QR aparecerá en la terminal!** 👆

---

## 📸 Paso 3: Escanear el Código QR con tu iPhone

### Método 1: Con la Cámara (MÁS FÁCIL) ⭐

1. **Abre la app Cámara** nativa de iOS
2. **Apunta al código QR** que está en la terminal de tu computadora
3. **Aparecerá una notificación** que dice "Abrir en Expo Go"
4. **Toca la notificación** → ¡La app se abrirá!

### Método 2: Desde Expo Go

1. **Abre Expo Go** en tu iPhone
2. **Toca "Scan QR code"**
3. **Escanea el código QR** de la terminal
4. **Espera unos segundos** → ¡La app se abrirá!

---

## ⏱️ ¿Qué Pasará?

1. Tu iPhone se conectará al servidor de tu computadora
2. La app comenzará a compilarse (30-60 segundos la primera vez)
3. ¡Verás la app de **Tizón OS** en tu iPhone! 🎉

---

## ✅ Verificación

Una vez que la app cargue, deberías ver:

- ✅ La pantalla de inicio de Tizón OS
- ✅ Sin errores
- ✅ Conexión establecida al backend

**En la terminal de tu computadora verás:**
```
› Opening exp://... on iPhone de Percio
› Bundling JavaScript... 100%
```

---

## 🛠️ Si Algo No Funciona

### "Unable to connect to Metro"

**Solución:** Tu iPhone y computadora deben estar en la **misma red WiFi**.

Si no puedes conectarte así, usa el modo **túnel**:

```bash
npm start -- --tunnel
```

Esto funciona incluso si no están en la misma red.

---

## 🎯 ¿Qué Puedes Probar?

Una vez que la app esté funcionando:

1. **Ver el plano de mesas** en tiempo real
2. **Crear una reserva** → Se enviará WhatsApp automático
3. **Agregar walk-ins** a la lista de espera
4. **Ver actualizaciones en tiempo real** (WebSocket)

---

## 📞 Configuración Actual

La app ya está conectada a:

- ✅ **Backend:** https://tizon-os-production.up.railway.app
- ✅ **WebSocket:** Namespace `/sala` para tiempo real
- ✅ **WhatsApp:** Configurado y funcionando
- ✅ **Base de datos:** Supabase con datos de prueba

---

## 🚀 Próximos Pasos

Después de probar la app:

1. Implementar **login con PIN** para el staff
2. Agregar **logo y colores** de Tizón Meats
3. Completar las **pantallas restantes**
4. Hacer **build de producción** con EAS Build

---

## 💡 Comandos Útiles

```bash
# Iniciar servidor normal
npm start

# Iniciar con túnel (si no funciona WiFi)
npm start -- --tunnel

# Recargar app (mientras el servidor corre)
Presiona "r" en la terminal

# Detener servidor
Presiona Ctrl + C
```

---

## 📱 ¡Listo para Empezar!

Todo está configurado. Solo necesitas:

1. ✅ Expo Go instalado en tu iPhone
2. 💻 Ejecutar `npm start` en tu computadora
3. 📸 Escanear el código QR con la Cámara de iOS

**¡Disfruta probando la app!** 🎉
