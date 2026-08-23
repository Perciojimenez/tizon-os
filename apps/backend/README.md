# Tizón OS — Backend API

Sistema de gestión de sala y huéspedes para **Tizón Meats** (restaurante de cortes premium).

## 🚀 Inicio rápido

### Instalación

```bash
cd apps/backend
npm install
```

### Variables de entorno

Copia `.env.example` a `.env` y completa:

```bash
cp .env.example .env
```

Valores requeridos:
- `SUPABASE_URL` — URL del proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — Clave de rol de servicio
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE` — Credenciales de SMS

### Desarrollo

```bash
npm run start:dev
```

El servidor levantará en `http://localhost:3000`.

### Producción

```bash
npm run build
npm run start:prod
```

---

## 📡 Endpoints REST

### Mesas
- `GET /mesas` — Listar todas las mesas
- `GET /mesas/:id` — Obtener detalle de una mesa
- `PATCH /mesas/:id/estado` — Cambiar estado (libre/ocupada/reservada/por_salir)
- `GET /mesas/zona/:zona` — Listar mesas por zona (salon_principal/terraza/privado)
- `GET /mesas/libres/:capacidad` — Listar mesas libres de mínima capacidad

### Reservas
- `GET /reservas` — Listar reservas (con filtros opcionales: fecha, estado, clienteId)
- `GET /reservas/:id` — Obtener detalle
- `POST /reservas` — Crear reserva con código único
- `PATCH /reservas/:id/estado` — Cambiar estado
- `DELETE /reservas/:id` — Cancelar reserva
- `GET /reservas/fecha/:fecha` — Listar por fecha

### Clientes (CRM)
- `GET /clientes` — Buscar clientes (parámetro: busqueda)
- `GET /clientes/:id` — Obtener ficha de cliente
- `POST /clientes` — Crear cliente
- `PATCH /clientes/:id` — Actualizar preferencias/etiquetas
- `POST /clientes/:id/vip` — Agregar etiqueta VIP
- `GET /clientes/telefono/:telefono` — Buscar por teléfono

### Lista de Espera (Walk-ins)
- `GET /lista-espera` — Obtener lista de espera actual
- `GET /lista-espera/:id` — Obtener detalle
- `POST /lista-espera` — Registrar walk-in
- `PATCH /lista-espera/:id/estado` — Cambiar estado (esperando/avisado/sentado)
- `POST /lista-espera/:id/asignar-mesa` — Asignar mesa
- `GET /lista-espera/conteo/ahora` — Contar esperando actualmente

### SMS
- `POST /sms/webhook` — Webhook de Twilio para SMS entrantes
- `GET /sms/log/:clienteId` — Historial de SMS de un cliente

---

## 🔌 WebSocket (Socket.IO)

Conectarse a `ws://localhost:3000/sala`.

### Eventos (servidor → cliente)

```javascript
// Mesa cambió de estado
socket.on('mesa-actualizada', { mesaId, estado, capacidad, timestamp })

// Reserva confirmada
socket.on('reserva-confirmada', { reservaId, codigoUnico, timestamp })

// Estado de pacing (semáforo de cocina)
socket.on('pacing-estado', { estado, personas, capacidad, timestamp })

// Lista de espera actualizada
socket.on('lista-espera-actualizada', { esperandoAhora, timestamp })
```

### Eventos (cliente → servidor)

```javascript
// Ping / keep-alive
socket.emit('ping')

// Respuesta
socket.on('pong', { timestamp })
```

---

## 🔐 Autenticación

Todos los endpoints REST requieren encabezado:

```
Authorization: Bearer <token_jwt_supabase>
```

El token se obtiene del JWT de Supabase Auth. El backend valida el token y obtiene el rol del usuario desde la tabla `staff`.

### Roles y permisos

- **gerencia**: acceso total a todas las operaciones
- **hostess**: acceso a mesas, reservas, lista de espera, clientes
- **mesero**: acceso de lectura a la sala

---

## 🛠️ Estructura del proyecto

```
src/
├── main.ts                    # Punto de entrada
├── app.module.ts              # Módulo raíz
├── config/
│   └── supabase.config.ts     # Inicialización de Supabase
├── auth/
│   ├── auth.service.ts        # Validación de JWT y rol
│   ├── auth.guard.ts          # Guard para proteger endpoints
│   └── auth.decorator.ts      # Decoradores @CurrentUser
├── mesas/                     # Gestión de mesas
├── reservas/                  # Gestión de reservas
├── clientes/                  # CRM de huéspedes
├── lista-espera/              # Walk-ins y lista de espera
├── pacing/                    # Motor anti-colisión de cocina
├── sms/                       # SMS bidireccional (Twilio)
├── websocket/                 # Actualizaciones en tiempo real
└── common/                    # Excepciones, interceptores, pipes
```

---

## 📚 Tecnologías

- **NestJS** — Framework backend
- **Supabase** — Base de datos PostgreSQL + Auth
- **Socket.IO** — WebSocket para tiempo real
- **Twilio** — SMS bidireccional
- **TypeScript** — Type-safe

---

## 📝 Notas

- RLS (Row-Level Security) en Supabase protege los datos según el rol del usuario.
- El `service_role` del backend omite RLS, permitiendo operaciones administrativas.
- SMS de Twilio aún requiere integración completa con credenciales reales.
- Motor de pacing está básico; se mejorará con lógica de bloqueo de mesas.

---

**Desarrollado para Tizón Meats — Sistema de gestión premium para restaurantes de cortes.**
