# Tizón OS — App Móvil

App interna para el staff de **Tizón Meats** (Hostess, Meseros, Gerencia).  
Construida con **React Native + Expo** para iOS y Android.

---

## 🚀 Inicio rápido

### Prerrequisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Para iOS: macOS + Xcode
- Para Android: Android Studio + emulador

### Instalación
```bash
cd apps/mobile
npm install
```

### Variables de entorno
Crea un archivo `.env` con:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```
En producción, apunta al servidor desplegado en Railway.

### Correr la app
```bash
# Menú de desarrollo (QR code para Expo Go)
npm start

# Solo iOS
npm run ios

# Solo Android
npm run android
```

---

## 📱 Pantallas

### 1. Login
- Autenticación con Supabase Auth
- Obtiene rol del usuario (hostess/mesero/gerencia)

### 2. Plano de Sala (`PlanoScreen`)
- Visualización de las 20 mesas en tiempo real
- Código de colores por estado:
  - 🟢 **Verde** → Libre
  - 🔵 **Azul** → Reservada
  - 🟠 **Naranja** → Ocupada
  - 🔴 **Rojo** → Por salir
- Indicador de **Pacing de Cocina** (semáforo VERDE/AMARILLO/ROJO)

### 3. Reservas (`ReservasScreen`)
- Lista de reservas del día
- Cambio de estado: Confirmar → Sentar → Completar / Cancelar
- Creación rápida de reservas (10-Seconds Booking):
  - Autocompletado de cliente
  - Selector de comensales
  - Genera código único TZN-XXXX

### 4. Lista de Espera (`ListaEsperaScreen`)
- Walk-ins en tiempo real
- Botón **"Avisar"** para notificar al grupo
- Botón **"Sentar"** para asignar mesa
- Modal para agregar nuevo walk-in

### 5. CRM Huéspedes (`CRMScreen`)
- Búsqueda de clientes en tiempo real
- Ficha de cliente con:
  - Término de carne preferido
  - Alergias
  - Etiquetas (VIP, cumpleaños, corporativo)
  - Historial de visitas y gasto total
- Creación de nuevos clientes

---

## 🔌 Tiempo Real (WebSocket)

La app escucha eventos del backend vía Socket.IO:
- `mesa-actualizada` → Actualiza estado de mesa automáticamente
- `pacing-estado` → Actualiza semáforo de cocina
- `lista-espera-actualizada` → Refresca lista de espera
- `reserva-confirmada` → Notifica nueva reserva

---

## 🏗️ Estructura del proyecto

```
src/
├── config/
│   ├── supabase.ts         # Cliente Supabase
│   ├── api.ts              # Configuración API base
│   └── socket.ts           # WebSocket Socket.IO
├── components/
│   ├── MesaCard.tsx        # Tarjeta de mesa (plano)
│   └── PacingIndicator.tsx # Semáforo de cocina
├── hooks/
│   ├── useMesas.ts
│   ├── useReservas.ts
│   └── useClientes.ts
├── navigation/
│   └── AppNavigator.tsx    # Tabs + Stack
├── screens/
│   ├── LoginScreen.tsx
│   ├── PlanoScreen.tsx
│   ├── ReservasScreen.tsx
│   ├── NuevaReservaScreen.tsx
│   ├── ListaEsperaScreen.tsx
│   └── CRMScreen.tsx
├── services/
│   └── api.ts              # TizonAPI class
└── store/
    ├── authStore.ts        # Estado de auth (Zustand)
    └── salaStore.ts        # Estado de sala (Zustand)
```

---

## 📦 Compilar para producción

```bash
# Con EAS Build (recomendado)
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

---

**Tizón Meats — Gestión premium para restaurantes de cortes.**
