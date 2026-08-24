# 📱 Guía de Prueba - App Móvil Tizón OS

## ✅ Estado de Configuración

La app móvil está **lista para probar** con las siguientes configuraciones completadas:

- ✅ Backend conectado: `https://tizon-os-production.up.railway.app`
- ✅ WebSocket configurado: namespace `/sala` para actualizaciones en tiempo real
- ✅ Variables de entorno: `EXPO_PUBLIC_API_URL` configurada
- ✅ Dependencias instaladas: Expo 49, React Native 0.72.6, React Navigation, Socket.io

---

## 🚀 Cómo Probar la App en tu Teléfono

### Paso 1: Instalar Expo Go en tu teléfono

**Android:**
- Abre Google Play Store
- Busca "Expo Go"
- Instala la app

**iOS:**
- Abre App Store
- Busca "Expo Go"
- Instala la app

### Paso 2: Iniciar el servidor de desarrollo

Desde tu computadora, en la carpeta del proyecto:

```bash
cd /ruta/a/tizon-os/apps/mobile
npm start
```

Esto iniciará el servidor de desarrollo de Expo y mostrará un **código QR** en la terminal.

### Paso 3: Escanear el código QR

**Android:**
- Abre la app **Expo Go**
- Toca "Scan QR Code"
- Escanea el código QR de la terminal

**iOS:**
- Abre la app **Cámara** nativa de iOS
- Apunta al código QR
- Toca la notificación que aparece para abrir en Expo Go

### Paso 4: Verificar la conexión

Una vez que la app cargue, verifica:
- ✅ La app se abre sin errores
- ✅ Se muestra la pantalla de login/inicio
- ✅ La conexión WebSocket se establece (mira los logs en la terminal)

---

## 🔍 Funcionalidades Disponibles en la App

### 1. **Vista de Mesas (Floor Plan)**
- Visualización del plano de mesas en tiempo real
- Estados: libre 🟢, ocupada 🔴, reservada 🟡, por salir ⚪
- Filtro por zonas: Salón Principal, Terraza, Privado

### 2. **Gestión de Reservas**
- Crear reserva rápida ("10-Seconds Booking")
- Ver reservas del día
- Confirmar/cancelar reservas
- Marcar reserva como "sentada"

### 3. **Lista de Espera**
- Agregar walk-ins
- Notificar cuando mesa está lista (WhatsApp)
- Marcar como sentado/cancelado

### 4. **CRM de Clientes**
- Buscar clientes por nombre/teléfono
- Ver historial de visitas
- Términos de carne favoritos
- Alergias y preferencias

### 5. **Actualizaciones en Tiempo Real**
- WebSocket conectado al backend
- Cambios de estado de mesa se reflejan instantáneamente
- Notificaciones de nuevas reservas
- Estado de "pacing" (semáforo de cocina)

---

## 🛠️ Endpoints del Backend Disponibles

La app móvil consume los siguientes endpoints:

### Mesas
- `GET /mesas` - Obtener todas las mesas
- `GET /mesas/:id` - Obtener mesa específica
- `PATCH /mesas/:id/estado` - Actualizar estado de mesa
- `GET /mesas/zona/:zona` - Filtrar por zona
- `GET /mesas/libres/:capacidad` - Mesas libres con capacidad mínima

### Reservas
- `GET /reservas` - Obtener reservas (con filtros opcionales)
- `POST /reservas` - Crear nueva reserva
- `PATCH /reservas/:id/estado` - Actualizar estado de reserva

### Clientes
- `GET /clientes` - Buscar clientes (query param: `busqueda`)
- `GET /clientes/:id` - Obtener cliente específico
- `POST /clientes` - Crear nuevo cliente

### Lista de Espera
- `GET /lista-espera` - Obtener lista de espera activa
- `POST /lista-espera` - Crear nuevo walk-in
- `PATCH /lista-espera/:id/estado` - Actualizar estado

### WebSocket (namespace `/sala`)
- Evento: `mesa-actualizada` - Emitido cuando cambia estado de mesa
- Evento: `reserva-confirmada` - Emitido al confirmar reserva
- Evento: `pacing-estado` - Semáforo de cocina
- Evento: `lista-espera-actualizada` - Cambios en lista de espera

---

## 🔐 Autenticación (Pendiente de Implementar)

**Estado actual:** La app tiene la estructura de autenticación preparada pero no está conectada.

**Próximos pasos:**
1. Implementar endpoint de login en el backend (`POST /auth/login`)
2. Conectar con Supabase Auth
3. Validar PIN de staff contra tabla `staff`
4. Generar JWT con rol del usuario (gerencia/hostess/mesero)

**Mientras tanto:** Puedes testear las funcionalidades sin autenticación, ya que los endpoints aún no requieren token.

---

## 📊 Arquitectura de la App

```
apps/mobile/
├── src/
│   ├── config/
│   │   ├── api.ts          # Configuración de conexión al backend
│   │   └── socket.ts       # Configuración de WebSocket
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── FloorScreen.tsx # Plano de mesas
│   │   ├── ReservasScreen.tsx
│   │   └── ...
│   ├── store/
│   │   ├── authStore.ts    # Zustand store para auth
│   │   └── salaStore.ts    # Zustand store para mesas/reservas
│   ├── services/
│   │   └── api.ts          # Cliente API (fetch endpoints)
│   └── navigation/
│       └── AppNavigator.tsx
└── App.tsx
```

---

## 🐛 Troubleshooting

### Error: "Unable to connect to Metro"
**Solución:** Asegúrate de que tu teléfono y computadora estén en la **misma red WiFi**.

### Error: "Network request failed"
**Solución:** 
1. Verifica que el backend esté en línea: `curl https://tizon-os-production.up.railway.app/health`
2. Revisa que la variable `EXPO_PUBLIC_API_URL` esté correcta en `.env`

### La app carga pero no se ve el plano de mesas
**Solución:**
1. Verifica que haya datos seed en la base de datos (tabla `mesas`)
2. Revisa los logs de la terminal de Expo para ver errores de API

### WebSocket no conecta
**Solución:**
1. Verifica que el backend tenga el gateway de WebSocket iniciado
2. Revisa logs del backend en Railway: busca `[Sala] Cliente conectado`

---

## 📞 Contacto

**Líder del Proyecto:** Percio Jiménez Ortiz  
**Email:** perciojimenez@live.com

**Backend en producción:** https://tizon-os-production.up.railway.app  
**GitHub:** https://github.com/Perciojimenez/tizon-os

---

## ⏭️ Próximos Pasos

1. **Implementar autenticación completa** (login con PIN de staff)
2. **Agregar assets visuales** (iconos, splash screen, imágenes de mesas)
3. **Implementar navegación completa** entre todas las pantallas
4. **Testing E2E** del flujo completo: crear reserva → enviar WhatsApp → cliente responde → webhook procesa
5. **Build para producción** con EAS Build (Android APK/iOS IPA)

¡La app está lista para empezar a probar! 🎉
