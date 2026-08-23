# 🍖 Tizón OS v2.0

> Next-Gen Floor & Guest Management Engine para **Tizón Meats**  
> Inspirado en la trilogía: SevenRooms + Resy OS + Tock

---

## ¿Qué es Tizón OS?

Sistema operativo completo de sala y huéspedes para el restaurante Tizón Meats (cortes de carne premium). Gestiona mesas, reservas, walk-ins, CRM de clientes y SMS bidireccional — todo en tiempo real.

---

## Estructura del monorepo

```
tizon-os/
├── apps/
│   ├── backend/        # API REST + WebSocket (NestJS)
│   └── mobile/         # App para staff iOS/Android (React Native + Expo)
├── database/
│   ├── schema_parte1_tablas.sql      # Tablas y ENUMs
│   ├── schema_parte2_funciones.sql   # Funciones RLS
│   ├── schema_parte3_rls.sql         # Políticas de seguridad
│   └── seed.sql                      # Datos de ejemplo
└── README.md
```

---

## Módulos del sistema

| Módulo | Estado | Descripción |
|---|---|---|
| 🗄️ Base de datos | ✅ Listo | 8 tablas en Supabase con RLS por rol |
| 🔌 Backend API | ✅ Listo | NestJS — REST + WebSocket en tiempo real |
| 📱 App Móvil | ✅ Listo | React Native + Expo para staff |
| 📲 SMS Twilio | 🔄 Pendiente | Confirmaciones y recordatorios bidireccionales |
| 🚀 Deploy Railway | 🔄 Pendiente | Backend en producción |

---

## Stack tecnológico

- **App Móvil**: React Native + Expo (iOS & Android)
- **Backend**: NestJS (Node.js + TypeScript)
- **Base de datos**: Supabase (PostgreSQL)
- **Tiempo real**: Socket.IO (WebSocket)
- **SMS**: Twilio
- **Hosting backend**: Railway
- **Hosting DB**: Supabase

---

## Inicio rápido

### Base de datos
Ejecuta los 4 archivos SQL en el SQL Editor de Supabase en este orden:
1. `schema_parte1_tablas.sql`
2. `schema_parte2_funciones.sql`
3. `schema_parte3_rls.sql`
4. `seed.sql`

### Backend
```bash
cd apps/backend
npm install
cp .env.example .env   # completar variables
npm run start:dev
```

### App Móvil
```bash
cd apps/mobile
npm install
npm start              # abre Expo Go en tu teléfono
```

---

## Variables de entorno (backend)

```env
SUPABASE_URL=https://gfrfnnlasgepepocjddu.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE=...
PORT=3000
NODE_ENV=production
```

---

## Costos operativos mensuales

| Servicio | Costo |
|---|---|
| Supabase Pro | $25/mes |
| Twilio SMS | $20/mes |
| **Total** | **$45/mes** |

---

**Desarrollado para Tizón Meats — Sistema de gestión premium para restaurantes de cortes.**
