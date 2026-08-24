# 📱 Guía de Prueba - Tizón OS Mobile App

**Fecha**: 2026-08-24  
**Versión**: Tizón OS v2.0 Mobile (React Native + Expo)

---

## 🎯 Estado Actual

### ✅ Componentes Listos
- ✅ **Servidor Expo**: Corriendo en puerto 8081
- ✅ **Backend API**: Railway (https://tizon-os-production.up.railway.app)
- ✅ **Base de datos**: Supabase (con datos seed)
- ✅ **SMS + WhatsApp**: Sistema de doble canal operacional
- ✅ **Código móvil**: 
  - LoginScreen
  - PlanoScreen (floor plan)
  - ReservasScreen
  - CRMScreen
  - ListaEsperaScreen
  - WebSocket real-time

### ⚠️ Configuración Pendiente
- ⚠️ **Usuarios de autenticación**: Necesitan crearse en Supabase Auth

---

## 📲 Opción 1: Probar en Tu Dispositivo Móvil (Recomendado)

### Paso 1: Instalar Expo Go
1. **iOS**: Descargar [Expo Go](https://apps.apple.com/app/expo-go/id982107779) de la App Store
2. **Android**: Descargar [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) de Google Play

### Paso 2: Conectar a la App
Tienes **2 formas** de conectarte:

#### Método A: URL Directa
1. Abre **Expo Go** en tu celular
2. Toca **"Enter URL manually"**
3. Ingresa esta URL:
   ```
   exp://c646794c8-8081.na120.preview.abacusai.app
   ```
4. Toca **"Connect"**

#### Método B: QR Code (si está disponible)
1. Ve a http://localhost:8081 en el navegador de la VM
2. Escanea el QR code con:
   - **iOS**: Cámara nativa → aparecerá notificación de Expo Go
   - **Android**: App Expo Go → botón "Scan QR Code"

### Paso 3: Esperar Carga
- La app tomará **1-2 minutos** en cargar la primera vez
- Verás una pantalla de "Downloading JavaScript bundle"
- Expo Go mostrará logs en caso de errores

---

## 🔐 Configuración de Usuarios de Prueba

**IMPORTANTE**: Para poder hacer login, necesitas crear los usuarios en Supabase Auth.

### Usuarios de Staff en Base de Datos (ya creados en seed):

| Nombre | Email | Rol | PIN |
|--------|-------|-----|-----|
| Laura Menéndez | laura.menendez@tizonmeats.com | gerencia | 4821 |
| Sofía Ramírez | sofia.ramirez@tizonmeats.com | hostess | 1930 |
| Carlos Méndez | carlos.mendez@tizonmeats.com | hostess | 5576 |
| David Torres | david.torres@tizonmeats.com | mesero | 8291 |
| Isabel Guzmán | isabel.guzman@tizonmeats.com | mesero | 3304 |

### Crear Usuarios en Supabase Auth (Necesario):

1. **Abre Supabase Dashboard**:
   - Ve a: https://supabase.com/dashboard/project/gfrfnnlasgepepocjddu
   - Inicia sesión

2. **Ve a Authentication → Users**:
   - Clic en el menú lateral: **Authentication**
   - Clic en **Users**

3. **Agregar Usuario** (ejemplo: Sofía - hostess):
   - Clic en **"Add user" → "Create new user"**
   - Email: `sofia.ramirez@tizonmeats.com`
   - Password: `TizonOS2024!` (o la que prefieras)
   - Clic en **"Create user"**
   - **Email Confirmation**: Marca "Auto Confirm User" si está disponible

4. **Repetir** para los otros usuarios que quieras probar

### Credenciales Sugeridas para Prueba:

```
Email: sofia.ramirez@tizonmeats.com
Password: TizonOS2024!
Rol: hostess (acceso completo a reservas, mesas, lista de espera)
```

---

## 🧪 Flujo de Prueba de la App

### 1️⃣ Login
1. Abre la app → **LoginScreen** (pantalla negra con logo 🍖)
2. Ingresa:
   - Email: `sofia.ramirez@tizonmeats.com`
   - Password: `TizonOS2024!` (o la que configuraste)
3. Toca **"Iniciar Sesión"**
4. Deberías ver **navegación inferior** con tabs

### 2️⃣ Plano de Mesas (Floor Plan)
- **Tab**: 🗺️ Plano
- **Funcionalidad**:
  - Ver 20 mesas con estados (libre, ocupada, reservada, por_salir)
  - Filtrar por zona (Salón Principal, Terraza, Privado)
  - Ver capacidad de cada mesa
  - **Tiempo real**: Cambios de estado vía WebSocket

### 3️⃣ Reservas
- **Tab**: 📅 Reservas
- **Funcionalidad**:
  - Ver lista de reservas activas
  - Crear nueva reserva (botón +)
  - Ver detalles: cliente, mesa, hora, personas
  - Estados: pendiente, confirmada, sentada, completada, cancelada
  - **Envío automático**: SMS/WhatsApp al crear reserva

### 4️⃣ CRM de Clientes
- **Tab**: 👤 CRM
- **Funcionalidad**:
  - Ver 10 clientes seed con datos reales
  - Información: nombre, teléfono, email, visitas, gasto total
  - Preferencias: término de carne, alergias, mesa favorita
  - Etiquetas: VIP, cumpleaños, corporativo
  - Buscar clientes

### 5️⃣ Lista de Espera
- **Tab**: ⏱️ Espera
- **Funcionalidad**:
  - Ver walk-ins esperando mesa
  - Agregar nuevos a la lista
  - Ver tiempo de espera
  - Asignar mesa cuando esté disponible
  - **Notificación automática**: SMS/WhatsApp cuando mesa lista

---

## 🔄 Funcionalidades en Tiempo Real (WebSocket)

La app se conecta automáticamente al backend vía WebSocket:

### Eventos que la app recibe:
- ✅ `mesa-actualizada`: Actualiza estado de mesa en el plano
- ✅ `pacing-estado`: Muestra indicador de ritmo de cocina
- ✅ `lista-espera-actualizada`: Refresca lista de espera

### Conexión WebSocket:
```typescript
URL: wss://tizon-os-production.up.railway.app
Estado: Conectado automáticamente al abrir la app
```

---

## 🛠️ Solución de Problemas

### ❌ Error: "Unable to connect to Metro bundler"
- **Causa**: La URL del servidor Expo no es accesible desde tu red
- **Solución**: Verifica que estés usando `exp://c646794c8-8081.na120.preview.abacusai.app`

### ❌ Error: "Network request failed" en login
- **Causa**: Backend no accesible o credenciales incorrectas
- **Soluciones**:
  1. Verifica que Railway esté activo: https://tizon-os-production.up.railway.app/health
  2. Verifica que creaste el usuario en Supabase Auth
  3. Verifica que el email/password sean correctos

### ❌ Error: "Invalid login credentials"
- **Causa**: Usuario no existe en Supabase Auth
- **Solución**: Crea el usuario en Supabase Dashboard → Authentication → Users

### ❌ La app se cierra al tocar un tab
- **Causa**: Posible error en el código de la pantalla
- **Solución**: Revisa logs en Expo Go → Menu → Ver logs

### ❌ No aparecen datos (mesas, reservas vacías)
- **Causa**: Backend no está devolviendo datos
- **Solución**: 
  1. Verifica que el seed.sql se haya ejecutado en Supabase
  2. Verifica conexión a API en DevTools

---

## 📊 Datos Seed Disponibles

### Mesas (20 totales):
- **Salón Principal**: 8 mesas (2-8 personas)
- **Terraza**: 10 mesas (2-6 personas)
- **Privado**: 2 mesas (10-12 personas)

### Clientes (10 registros):
- Ricardo Salazar (VIP, corporativo, 24 visitas, $48,250 MXN)
- Ana Lucía Moreno (VIP, alérgica mariscos, 12 visitas)
- Jorge Villanueva, María Fernanda Ruiz, etc.

### Reservas (3 activas):
- Ricardo Salazar → Mesa 19 (Privado) → 2026-08-24 20:00
- Ana Lucía Moreno → Mesa 12 (Terraza) → 2026-08-24 21:00
- Andrés Beltrán → Mesa 7 (Salón) → 2026-08-25 19:30

### Lista de Espera (2 walk-ins):
- Familia García (4 personas) → Esperando 8 min
- Pareja Martínez (2 personas) → Esperando 3 min

---

## 🚀 Opciones Avanzadas

### Probar con Simulador iOS (requiere macOS)
```bash
cd /home/ubuntu/tizon-os/apps/mobile
npm run ios
```

### Probar con Emulador Android (requiere Android Studio)
```bash
cd /home/ubuntu/tizon-os/apps/mobile
npm run android
```

### Probar en Web (navegador)
```bash
cd /home/ubuntu/tizon-os/apps/mobile
npm run web
```
Luego abre: http://localhost:8081

---

## 📱 Arquitectura de la App

### Tecnologías:
- **React Native** 0.72.6
- **Expo** SDK 49
- **TypeScript** 5.1
- **Zustand** (state management)
- **React Navigation** 6.x (navegación)
- **Socket.io-client** (WebSocket real-time)
- **Supabase JS** (auth + DB)

### Estructura de Carpetas:
```
src/
├── components/       # MesaCard, PacingIndicator
├── config/          # api.ts, socket.ts, supabase.ts
├── hooks/           # useClientes, useMesas, useReservas
├── navigation/      # AppNavigator.tsx
├── screens/         # Login, Plano, Reservas, CRM, ListaEspera
├── services/        # api.ts (API client)
└── store/           # authStore, salaStore (Zustand)
```

### API Endpoints Usados:
```
POST   /auth/login              # Login de staff
GET    /mesas                   # Listar mesas
PATCH  /mesas/:id/estado        # Cambiar estado mesa
GET    /reservas                # Listar reservas
POST   /reservas                # Crear reserva (envía SMS/WhatsApp)
GET    /clientes                # Listar clientes CRM
GET    /lista-espera            # Listar walk-ins
POST   /lista-espera            # Agregar walk-in
GET    /pacing/estado           # Estado del pacing engine
```

---

## ✅ Checklist de Prueba

- [ ] App cargada exitosamente en Expo Go
- [ ] Usuario creado en Supabase Auth
- [ ] Login exitoso con credenciales de staff
- [ ] Navegación funciona (4 tabs visibles)
- [ ] Plano de mesas muestra 20 mesas con estados
- [ ] Lista de reservas muestra 3 reservas seed
- [ ] CRM muestra 10 clientes con datos completos
- [ ] Lista de espera muestra 2 walk-ins
- [ ] WebSocket conectado (indicador en pantalla)
- [ ] Crear nueva reserva → envía SMS/WhatsApp
- [ ] Cambiar estado de mesa → actualiza en tiempo real

---

## 🎯 Próximos Pasos Después de Probar

1. **Feedback de UX**: ¿Qué funciona bien? ¿Qué mejorar?
2. **Funcionalidades Faltantes**:
   - Editar/cancelar reservas
   - Asignar mesa desde lista de espera
   - Ver historial de cliente
   - Notificaciones push
   - Modo offline
3. **Testing en Producción**:
   - Aprobar WhatsApp Business con Meta
   - Deploy en TestFlight (iOS) y Google Play Internal Testing (Android)

---

**URL del Servidor Expo**: `exp://c646794c8-8081.na120.preview.abacusai.app`  
**Backend API**: `https://tizon-os-production.up.railway.app`  
**Supabase Dashboard**: `https://supabase.com/dashboard/project/gfrfnnlasgepepocjddu`

---

**¡La app móvil está lista para probar!** 🚀📱
