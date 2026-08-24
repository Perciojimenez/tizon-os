# ✅ WhatsApp + SMS Configuración Completa - Tizón OS

## 🎉 Estado Actual

### Backend Desplegado
- ✅ **Railway**: https://tizon-os-production.up.railway.app
- ✅ **Código**: Doble canal SMS + WhatsApp con fallback automático
- ✅ **Variables de entorno**:
  - `TWILIO_WHATSAPP_NUMBER=+14155238886` (Sandbox)
  - `CANAL_DEFAULT=whatsapp`
  - `TWILIO_PHONE_NUMBER=+14247244485` (SMS fallback)

### Sandbox de WhatsApp Activado
- ✅ **Número del Sandbox**: +1 415 523 8886
- ✅ **Código de activación**: `join force-zebra`
- ✅ **Tu conexión**: Confirmada (enviaste el código)

### Webhook de Twilio
- ✅ **URL**: https://tizon-os-production.up.railway.app/sms/webhook
- ✅ **Configurado**: Recibe SMS y WhatsApp bidireccional

---

## 📱 Cómo Funciona el Sistema de Doble Canal

### Prioridad de Canales
1. **Por defecto**: WhatsApp (configurado en `CANAL_DEFAULT`)
2. **Fallback automático**: Si WhatsApp falla → intenta SMS
3. **Registro**: Guarda en `sms_log` qué canal se usó realmente

### Endpoint de Prueba
**POST** `/sms/test/enviar`

```json
{
  "telefono": "+1234567890",
  "nombre": "Cliente",
  "tipo": "confirmacion",
  "canal": "whatsapp"  // Opcional: "whatsapp" o "sms"
}
```

Si no especificas `canal`, usa el valor de `CANAL_DEFAULT` (actualmente WhatsApp).

---

## 🧪 Probar WhatsApp Ahora

### Paso 1: Actualizar el Script
Edita `/home/ubuntu/test-whatsapp.js` y cambia:

```javascript
const TU_NUMERO = '+14247244485'; // ❌ Este es el número de Twilio
```

Por tu **número de celular real** (el que usaste para conectarte al Sandbox):

```javascript
const TU_NUMERO = '+1XXXXXXXXXX'; // ✅ Tu celular personal
```

### Paso 2: Ejecutar el Test
```bash
cd /home/ubuntu && node test-whatsapp.js
```

### Paso 3: Verificar en WhatsApp
1. Abre WhatsApp en tu celular
2. Busca el chat con **+1 415 523 8886** (el Sandbox)
3. Deberías recibir el mensaje de confirmación de reserva
4. (Opcional) Responde **"1"** para confirmar → el webhook procesará tu respuesta

---

## 🚀 Próximos Pasos (Para Producción Real)

### 1. Aprobar tu Número de WhatsApp con Meta
El Sandbox es solo para pruebas. Para enviar a clientes reales sin que ellos escriban "join":

1. Ve a **Twilio Console → Messaging → Senders → WhatsApp senders**
2. Haz clic en **"Request to enable my Twilio number"**
3. Proporciona:
   - Información de tu negocio (Tizón Meats)
   - Razón de uso (notificaciones de reservas)
   - Plantillas de mensaje (confirmación, recordatorio, etc.)
4. Meta revisa en **1-3 días laborales**

### 2. Crear Plantillas de Mensaje Aprobadas
WhatsApp Business requiere plantillas pre-aprobadas:

```
Nombre: tizon_confirmacion_reserva
Idioma: es
Categoría: UTILITY

Contenido:
¡Hola {{1}}! Tu reserva en Tizón Meats para {{2}} a las {{3}} ({{4}} personas) está confirmada. Código: {{5}}. Te esperamos.
```

### 3. Actualizar Variables de Entorno
Una vez aprobado:

```bash
TWILIO_WHATSAPP_NUMBER=+14247244485  # Tu número aprobado
CANAL_DEFAULT=whatsapp
```

---

## 📊 Diferencias: Sandbox vs. Producción

| Aspecto | Sandbox (Actual) | Producción (Aprobado) |
|---------|------------------|----------------------|
| **Número remitente** | +1 415 523 8886 | Tu número (+1 424...) |
| **Activación** | Cliente debe escribir "join" | Instantáneo |
| **Plantillas** | Cualquier texto | Solo plantillas aprobadas |
| **Límites** | ~100 mensajes/día | Sin límite (pagado) |
| **Costo** | Gratis | ~$0.005/mensaje |
| **Para** | Testing interno | Clientes reales |

---

## 🔧 Arquitectura del Código

### Archivo Principal
`/home/ubuntu/tizon-os/apps/backend/src/sms/sms.service.ts`

### Métodos Clave
```typescript
// Envía por el canal especificado con fallback automático
private async enviarMensaje(
  telefono: string,
  mensaje: string,
  canal: CanalMensaje = this.canalDefault
): Promise<{ sid: string; canal: CanalMensaje }>

// Normaliza el formato según canal
private formatearDireccion(telefono: string, canal: CanalMensaje): string {
  return canal === 'whatsapp' ? `whatsapp:${telefono}` : telefono;
}
```

### Webhook (Recepción de Respuestas)
```typescript
async procesarRespuestaSms(telefono: string, respuesta: string) {
  // Detecta automáticamente si llegó por SMS o WhatsApp
  const esWhatsApp = /^whatsapp:/i.test(telefono);
  const canalEntrante: CanalMensaje = esWhatsApp ? 'whatsapp' : 'sms';
  
  // Normaliza el número (quita prefijo whatsapp:)
  const telefonoLimpio = telefono.replace(/^whatsapp:/i, '').trim();
  
  // Procesa "1" = confirma, "2" = cancela
  // ...
}
```

---

## ✅ Checklist de Configuración

- [x] Código con doble canal desplegado en Railway
- [x] Variables de entorno WhatsApp configuradas
- [x] Sandbox de Twilio activado
- [x] Webhook configurado para recibir respuestas
- [x] Script de prueba creado (`test-whatsapp.js`)
- [ ] Número de teléfono personal actualizado en script
- [ ] Prueba ejecutada y WhatsApp recibido
- [ ] (Futuro) Número de WhatsApp aprobado por Meta para producción

---

## 📞 Soporte

- **Twilio Console**: https://console.twilio.com
- **WhatsApp Sandbox**: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
- **Documentación Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp

---

**Sistema listo para pruebas.** Actualiza el número en `test-whatsapp.js` y ejecuta el script. 🚀
