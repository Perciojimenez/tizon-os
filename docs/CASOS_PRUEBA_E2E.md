# 🧪 Casos de Prueba E2E - Tizón OS

> **Objetivo:** Verificar el flujo completo de reservas + WhatsApp + WebSocket en dispositivo real

---

## 📋 Checklist Pre-Prueba

Antes de empezar, verificar que:

- [ ] ✅ Backend desplegado en Railway: https://tizon-os-production.up.railway.app
- [ ] ✅ Base de datos Supabase activa
- [ ] ✅ Variables de entorno Twilio configuradas en Railway
- [ ] ✅ App móvil compilada (Expo SDK 57)
- [ ] ✅ Servidor de desarrollo ejecutándose (`npm start` en `apps/mobile`)
- [ ] 📱 Dispositivo Android con Expo Go instalado
- [ ] 📱 QR escaneado y app abierta
- [ ] 🔐 Credenciales de prueba a mano: `sofia.ramirez@tizonmeats.com` / `tizon2024`

---

## 🎯 Caso 1: Crear Reserva (Happy Path)

**Precondición:** App abierta en pantalla de login

### Pasos:

1. **Login**
   - Email: `sofia.ramirez@tizonmeats.com`
   - Password: `tizon2024`
   - Toca "Iniciar Sesión"

2. **Navegar a Nueva Reserva**
   - Desde el menú principal → "Nueva Reserva" (o "Reservas" → botón "+")

3. **Buscar Cliente**
   - Escribe en el buscador: `Ricardo`
   - Espera resultados (debería aparecer "Ricardo Pérez")
   - Toca para seleccionar

4. **Completar Datos de Reserva**
   - Mesa: `3` (o cualquier mesa libre)
   - Fecha: hoy (por defecto)
   - Hora: `20:00`
   - Comensales: `2`
   - Notas (opcional): `Prueba E2E`

5. **Crear Reserva**
   - Toca el botón "Crear Reserva"
   - **Espera confirmación**

### Resultado Esperado:

#### En la App:
```
✅ Alert: "Reserva creada"
   Código: TZN-XXXXX
   
   Opciones: [OK]
```

#### En Logs de Railway (Backend):
```
📱 WhatsApp de confirmación enviado a Ricardo Pérez (+18095551234)
🔄 WebSocket: Reserva confirmada emitida (TZN-XXXXX)
```

#### En Supabase (Tabla `reservas`):
- Nueva fila con:
  - `codigo_unico`: TZN-XXXXX
  - `estado`: "confirmada"
  - `cliente_id`: ID de Ricardo
  - `mesa_id`: ID de la mesa seleccionada
  - `fecha`: fecha de hoy
  - `hora_inicio`: "20:00"
  - `num_comensales`: 2

#### En Supabase (Tabla `sms_log`):
- Nueva fila con:
  - `tipo`: "confirmacion"
  - `telefono`: "+18095551234"
  - `estado`: "enviado"
  - `canal`: "whatsapp"

#### En WhatsApp (Cliente):
Si el número está en sandbox de Twilio:
```
🍖 Tizón Meats

Confirmamos tu reserva:
📅 25 de agosto, 2026
🕐 20:00
👥 2 personas
🔑 Código: TZN-XXXXX

Responde:
1 - Confirmar
2 - Cancelar
```

---

## 🎯 Caso 2: Cliente Confirma por WhatsApp

**Precondición:** Caso 1 ejecutado exitosamente (reserva creada y WhatsApp enviado)

### Pasos:

1. **Desde el teléfono del cliente** (o número de prueba registrado en sandbox)
   - Abre WhatsApp
   - Busca la conversación con el número de Twilio (`+14155238886` en sandbox)
   - Responde: `1`

2. **En la App (en paralelo)**
   - Mantén la app abierta en la pantalla de "Reservas" o "Plano de Mesas"
   - **No refresques manualmente**

### Resultado Esperado:

#### En Logs de Railway (Backend):
```
📥 Respuesta entrante por whatsapp desde +18095551234: "1"
🔄 WebSocket: Cliente confirmó reserva TZN-XXXXX vía whatsapp
```

#### En Supabase (Tabla `reservas`):
- La fila de la reserva:
  - `estado`: sigue en "confirmada" (ya lo estaba)

#### En Supabase (Tabla `sms_log`):
- Nueva fila con:
  - `tipo`: "recordatorio"
  - `telefono`: "+18095551234"
  - `estado`: "recibido"
  - `notas`: "1 - confirmada (whatsapp)"

#### En la App (Tiempo Real):
- **Console logs** (si las DevTools están abiertas):
  ```
  🔄 WebSocket: Reserva confirmada {reservaId: "...", codigoUnico: "TZN-XXXXX", timestamp: ...}
  ```
- La UI **NO debe requerir refresh manual**
- La reserva sigue apareciendo en la lista

---

## 🎯 Caso 3: Cliente Cancela por WhatsApp

**Precondición:** Caso 1 ejecutado, pero en lugar de "1", el cliente responde "2"

### Pasos:

1. **Crear reserva** (igual que Caso 1)
2. **Cliente responde:** `2` (cancelar)

### Resultado Esperado:

#### En Logs de Railway:
```
📥 Respuesta entrante por whatsapp desde +18095551234: "2"
🔄 WebSocket: Cliente canceló reserva TZN-XXXXX vía whatsapp
```

#### En Supabase (Tabla `reservas`):
- La fila de la reserva:
  - `estado`: **"cancelada"**

#### En Supabase (Tabla `sms_log`):
- Nueva fila con:
  - `notas`: "2 - cancelada (whatsapp)"

#### En la App:
- La reserva cambia de estado a "cancelada" automáticamente
- (Dependiendo de cómo filtre la UI, puede desaparecer o mostrarse como cancelada)

---

## 🎯 Caso 4: WebSocket en Tiempo Real (2 Dispositivos)

**Objetivo:** Verificar que las actualizaciones se propagan a TODOS los clientes conectados

**Precondición:** 2 dispositivos con la app abierta

### Pasos:

1. **Dispositivo A:**
   - Login como hostess
   - Abre la pantalla "Reservas" o "Plano de Mesas"

2. **Dispositivo B:**
   - Login como hostess (otra cuenta o misma)
   - Abre la pantalla "Reservas" o "Plano de Mesas"

3. **Dispositivo A:**
   - Crea una nueva reserva (Caso 1)

### Resultado Esperado:

#### En Dispositivo A:
- Alert de confirmación
- Reserva aparece en la lista inmediatamente

#### En Dispositivo B:
- **SIN tocar nada**
- La nueva reserva **debe aparecer automáticamente** en la lista
- Console log: `🔄 WebSocket: Reserva confirmada`

**Esto confirma que WebSocket funciona en tiempo real entre múltiples clientes.**

---

## 🎯 Caso 5: Script Automatizado (Sin App)

**Objetivo:** Probar el backend sin necesidad de la app móvil

### Pasos:

```bash
cd /path/to/tizon-os
node scripts/probar-flujo-e2e.js
```

### Resultado Esperado:

```
🧪 PRUEBA E2E - FLUJO COMPLETO RESERVAS + WHATSAPP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 PASO 1: Autenticación
   Intentando login como hostess...
   ✅ Login exitoso (token: eyJhbGciOiJIUzI1NiIs...)
   👤 Usuario: Sofía Ramírez (hostess)

📍 PASO 2: Buscar Cliente
   Buscando "Ricardo Pérez"...
   ✅ Cliente encontrado: Ricardo Pérez
      📞 Teléfono: +18095551234
      🆔 ID: abc123...

📍 PASO 3: Buscar Mesa Disponible
   Obteniendo lista de mesas...
   ✅ Mesa disponible: 3
      👥 Capacidad: 4 personas
      📍 Zona: salon_principal
      🆔 ID: def456...

📍 PASO 4: Crear Reserva
   Creando reserva de prueba...
   ✅ Reserva creada exitosamente
      🔑 Código: TZN-ABC123
      📅 Fecha: 2026-08-25
      🕐 Hora: 20:00
      👥 Comensales: 2
      📊 Estado: confirmada
      🆔 ID: ghi789...

📍 PASO 5: Verificar en Base de Datos
   Consultando reserva recién creada...
   ✅ Reserva verificada en BD
      Estado en BD: confirmada
      Código coincide: ✅

📍 PASO 6: Simular Respuesta del Cliente vía WhatsApp
   Simulando webhook de Twilio...
   (El cliente responde "1" para confirmar)
   ✅ Webhook procesado
      Acción: confirmada
      Reserva ID: ghi789...

📍 PASO 7: Verificar Estado Actualizado
   Consultando reserva después de webhook...
   ✅ Estado final verificado
      Estado: confirmada
      ✅ La reserva fue confirmada correctamente

📍 PASO 8: Verificar Log de Mensajes
   Consultando historial de SMS del cliente...
   ✅ Encontrados 2 mensajes
      Último mensaje: recordatorio
      Estado: recibido
      Canal: whatsapp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRUEBA E2E COMPLETADA EXITOSAMENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🐛 Troubleshooting

### ❌ "Error al crear reserva"

**Posibles causas:**
1. Token expirado → Vuelve a hacer login
2. Mesa no existe → Verifica el ID de la mesa
3. Cliente no existe → Verifica el ID del cliente
4. RLS bloqueó la operación → Verifica que el usuario tenga rol `hostess` o `gerencia`

**Solución:**
```bash
# Verificar logs del backend
railway logs --service tizon-os

# Verificar en Supabase
SELECT * FROM staff WHERE email = 'sofia.ramirez@tizonmeats.com';
```

---

### ❌ "WhatsApp no llega al cliente"

**Posibles causas:**
1. Número no registrado en sandbox de Twilio
2. Variables de entorno incorrectas en Railway
3. Error en Twilio (cuota excedida, número bloqueado)

**Solución:**
```bash
# 1. Verificar variables en Railway
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_WHATSAPP_NUMBER

# 2. Registrar número en sandbox
# Desde WhatsApp, envía a +14155238886:
# join <codigo-sandbox>

# 3. Verificar logs de Railway
railway logs --service tizon-os | grep WhatsApp
```

**Verificar en Twilio Console:**
- https://console.twilio.com → Messaging → Logs
- Buscar el mensaje reciente
- Estado debe ser "Delivered"

---

### ❌ "WebSocket no actualiza la app"

**Posibles causas:**
1. App no conectada al WebSocket
2. Evento `reserva-confirmada` no configurado en App.tsx
3. Firewall bloquea WebSocket

**Solución:**
```javascript
// En la consola de React Native (Metro):
// Deberías ver:
// 🔄 WebSocket: Reserva confirmada {reservaId: "...", ...}

// Si no aparece, verifica:
import { socket } from './src/config/socket';

// Y en App.tsx:
socket.on('reserva-confirmada', (data) => {
  console.log('🔄 WebSocket:', data);
});
```

**Verificar en Railway:**
```bash
# Logs deben mostrar:
# [Sala] Cliente conectado: SOCKET_ID
# 🔄 WebSocket: Reserva confirmada emitida (TZN-XXXXX)
```

---

### ❌ "Webhook no procesa respuesta del cliente"

**Posibles causas:**
1. URL del webhook no configurada en Twilio
2. Número del cliente no coincide con el de la BD
3. No hay reservas activas para ese cliente

**Solución:**
```bash
# 1. Verificar URL en Twilio Console
# https://console.twilio.com → Phone Numbers → Manage → Active Numbers
# → Configuración de Mensajería → Webhook:
# https://tizon-os-production.up.railway.app/sms/webhook

# 2. Verificar cliente en Supabase
SELECT id, nombre, telefono FROM clientes WHERE telefono LIKE '%8095551234%';

# 3. Verificar reservas activas
SELECT * FROM reservas WHERE cliente_id = 'ID_CLIENTE' AND estado IN ('confirmada', 'pendiente');
```

---

## 📊 Métricas de Éxito

Al finalizar todas las pruebas, deberías tener:

- [ ] ✅ Al menos 1 reserva creada desde la app
- [ ] ✅ Al menos 1 WhatsApp enviado (verificado en logs)
- [ ] ✅ Al menos 1 respuesta del cliente procesada (webhook)
- [ ] ✅ WebSocket funcionando (logs muestran eventos emitidos)
- [ ] ✅ UI actualizada en tiempo real (sin refresh manual)
- [ ] ✅ Script automatizado pasa todos los pasos

**Si todos los checkboxes están marcados:** 🎉 **Flujo E2E 100% funcional**

---

## 📸 Capturas Recomendadas

Para documentar el éxito:

1. **Pantalla de la app:** Alert "Reserva creada" con código
2. **Logs de Railway:** Mensaje "WhatsApp de confirmación enviado"
3. **Supabase:** Tabla `reservas` con la nueva fila
4. **WhatsApp:** Mensaje recibido en el teléfono del cliente
5. **Logs de Railway:** "Cliente confirmó reserva vía whatsapp"
6. **Consola React Native:** Logs de WebSocket

---

*Última actualización: 2026-08-25*
