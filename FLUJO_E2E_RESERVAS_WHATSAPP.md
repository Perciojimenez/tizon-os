# 🎯 Flujo End-to-End: Reservas + WhatsApp + Tiempo Real

> **Estado:** ✅ IMPLEMENTADO Y COMPILADO (commit ea5226f)

Este documento explica el flujo completo de creación de reservas con confirmación automática vía WhatsApp y actualizaciones en tiempo real.

---

## 📱 Flujo Completo (Automatizado)

```
1. HOSTESS crea reserva en la app
         ↓
2. Backend registra en Supabase
         ↓
3. 📲 AUTO-ENVÍO WhatsApp al cliente
   "Confirmamos tu reserva para 2 personas
    el 24/08/2026 a las 20:00.
    Código: TZN-ABC123
    Responde 1 para confirmar o 2 para cancelar"
         ↓
4. CLIENTE responde por WhatsApp: "1"
         ↓
5. 🔄 Webhook Twilio → Backend procesa
         ↓
6. Backend actualiza estado en Supabase
         ↓
7. 🔄 WebSocket emite evento tiempo real
         ↓
8. ✅ APP actualiza plano de mesas SIN refrescar
```

---

## 🔧 Componentes Implementados

### 1. Backend (NestJS)

**Archivos modificados:**
- `apps/backend/src/reservas/reservas.service.ts` ✅
  - Crea reserva → emite evento WebSocket
  - Envía WhatsApp automático con código único
  - Actualiza estado → emite evento WebSocket

- `apps/backend/src/sms/sms.service.ts` ✅
  - Recibe respuesta WhatsApp del cliente
  - Procesa "1" (confirmar) o "2" (cancelar)
  - Actualiza Supabase + emite evento WebSocket

- `apps/backend/src/websocket/websocket.gateway.ts` ✅
  - Emite `reserva-confirmada` cuando se crea/actualiza
  - Todos los clientes conectados reciben actualización

**Webhook configurado:**
```
POST /sms/webhook
Body: { From: "whatsapp:+18095551234", Body: "1" }
```

Este endpoint ya está en el backend y **NO requiere autenticación** (Twilio llama directamente).

---

## 📊 Datos de Prueba Disponibles

### Clientes con Teléfono (para probar WhatsApp)

Estos clientes **ya existen en Supabase** (del seed.sql):

| Nombre | Teléfono | Mesa Favorita | Preferencia Carne |
|---|---|---|---|
| Ricardo Pérez | +18095551234 | Mesa 3 (4 personas) | 3/4 |
| Mariana López | +18295559876 | Mesa 8 (2 personas) | Término medio |
| Carlos Rodríguez | +18095554321 | Mesa 12 (6 personas) | Bien cocido |

**⚠️ IMPORTANTE:** Para que WhatsApp funcione, el número del cliente **debe estar registrado en el sandbox de Twilio** (o usar tu número Twilio aprobado).

---

## 🧪 Cómo Probar el Flujo Completo

### Paso 1: Abrir la App en tu Android

1. Escanea el QR (servidor túnel sigue activo)
2. Login con: `sofia.ramirez@tizonmeats.com` / `tizon2024`
3. Ve a la pantalla **"Reservas"** (o **"Nueva Reserva"**)

### Paso 2: Crear una Reserva de Prueba

Desde la app (o si prefieres, desde un cliente HTTP):

**Opción A — Desde la App:**
- Buscar cliente: "Ricardo" → seleccionar **Ricardo Pérez**
- Mesa: 3
- Fecha: hoy (2026-08-25)
- Hora: 20:00
- Comensales: 2
- Toca **"Crear Reserva"**

**Opción B — Desde cURL/Postman:**
```bash
# Primero obten el token (login):
curl -X POST https://tizon-os-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sofia.ramirez@tizonmeats.com","password":"tizon2024"}'

# Luego crea la reserva:
curl -X POST https://tizon-os-production.up.railway.app/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "clienteId": "ID_DEL_CLIENTE_RICARDO",
    "mesaId": "ID_DE_MESA_3",
    "fecha": "2026-08-25",
    "horaInicio": "20:00",
    "numComensales": 2
  }'
```

### Paso 3: Verificar el Envío de WhatsApp

**En los logs del backend (Railway):**
```
📱 WhatsApp de confirmación enviado a Ricardo Pérez (+18095551234)
🔄 WebSocket: Reserva confirmada emitida (TZN-ABC123)
```

**El cliente recibe:**
```
🍖 Tizón Meats

Confirmamos tu reserva:
📅 25 de agosto, 2026
🕐 20:00
👥 2 personas
🔑 Código: TZN-ABC123

Responde:
1 - Confirmar
2 - Cancelar
```

### Paso 4: Cliente Responde por WhatsApp

El cliente (o tú desde su número de prueba) envía:
```
1
```

### Paso 5: Verificar Webhook y Actualización

**Backend recibe webhook:**
```
📥 Respuesta entrante por whatsapp desde +18095551234: "1"
🔄 WebSocket: Cliente confirmó reserva TZN-ABC123 vía whatsapp
```

**En Supabase:**
- Tabla `reservas` → estado cambia a `'confirmada'`
- Tabla `sms_log` → nueva entrada con respuesta del cliente

**En la App (tiempo real):**
- El plano de mesas se actualiza automáticamente
- La reserva cambia de estado sin refrescar manualmente

---

## 🔐 Configuración de Twilio (Ya está en Railway)

Las variables de entorno ya configuradas:

```env
TWILIO_ACCOUNT_SID=AC**********************
TWILIO_AUTH_TOKEN=**************************
TWILIO_PHONE_NUMBER=+14247244485  # SMS
TWILIO_WHATSAPP_NUMBER=+14155238886  # WhatsApp sandbox
CANAL_DEFAULT=whatsapp  # Usar WhatsApp por defecto
```

**URL del Webhook Twilio:**
```
https://tizon-os-production.up.railway.app/sms/webhook
```

Esta URL debe estar configurada en:
1. Twilio Console → Phone Numbers → tu número de WhatsApp
2. Messaging Configuration → "A MESSAGE COMES IN" → Webhook URL (arriba)

---

## ✅ Verificación de Componentes

| Componente | Estado | Verificación |
|---|---|---|
| Backend compila | ✅ | `npm run build` exitoso |
| WebSocket activo | ✅ | Gateway exportado en módulos |
| Endpoint crear reserva | ✅ | POST `/reservas` |
| Auto-envío WhatsApp | ✅ | `smsService.enviarSmsConfirmacion()` |
| Webhook respuestas | ✅ | POST `/sms/webhook` (sin auth) |
| Procesar "1" o "2" | ✅ | `procesarRespuestaSms()` |
| Emitir eventos WS | ✅ | `salaGateway.emitirReservaConfirmada()` |
| App mobile escucha WS | ⚠️ | **Pendiente verificar** (código existe en App.tsx) |

---

## 🎯 Próximos Pasos (Probar en Dispositivo)

1. **Verificar la app escucha WebSocket:**
   - Archivo: `apps/mobile/App.tsx`
   - Buscar: `socket.on('reserva-confirmada', ...)`
   - Confirmar que actualiza el state cuando llega el evento

2. **Probar flujo completo en tu Android:**
   - Crear reserva desde la app
   - Verificar que el WhatsApp sale (logs de Railway)
   - Responder "1" desde el número del cliente
   - Confirmar que la UI se actualiza sola

3. **Configurar número Twilio aprobado:**
   - Actualmente estamos en **sandbox mode**
   - Para producción: aprobar un número de WhatsApp Business en Twilio
   - Actualizar `TWILIO_WHATSAPP_NUMBER` en Railway

---

## 🐛 Troubleshooting

### WhatsApp no llega al cliente

**Posible causa:** El número no está en el sandbox de Twilio.

**Solución:**
1. Ve a Twilio Console → Messaging → Try it out → WhatsApp Sandbox
2. Desde el teléfono del cliente, envía el código de join: `join <tu-codigo-sandbox>`
3. Vuelve a crear la reserva

### Webhook no procesa respuesta

**Verificar logs en Railway:**
```bash
# Ver logs en vivo
railway logs --service tizon-os
```

**Verificar en Supabase:**
```sql
SELECT * FROM sms_log ORDER BY created_at DESC LIMIT 10;
```

### WebSocket no actualiza la app

**Verificar conexión:**
1. Abre las DevTools del navegador (si estás en web)
2. Consola → debe decir: `[Sala] Cliente conectado: SOCKET_ID`

**Verificar que el evento se emite:**
- Logs de Railway deben mostrar: `🔄 WebSocket: Reserva confirmada emitida`

---

## 📈 Métricas del Flujo (Una vez funcionando)

- ⏱️ **Tiempo promedio:** Crear reserva → WhatsApp enviado < 2 segundos
- 📲 **Tasa de entrega WhatsApp:** ~99% (Twilio SLA)
- 🔄 **Latencia WebSocket:** < 500ms (actualización en tiempo real)
- ✅ **Tasa de confirmación clientes:** Por medir

---

*Backend compilado y verificado. Listo para pruebas E2E en dispositivo Android.*
