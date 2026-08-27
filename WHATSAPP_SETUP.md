# 💬 Guía: Activar WhatsApp Business en Tizón OS

## ¿Qué hace esto?
La app enviará mensajes de WhatsApp automáticamente a tus clientes:
- ✅ **Confirmación** al crear una reserva
- ⏰ **Recordatorio** 2 horas antes de la reserva
- 🙏 **Agradecimiento** al marcar una mesa como completada
- 🔔 **Alerta de lista de espera** cuando se libera una mesa

---

## PASO 1 — Crear cuenta Twilio (gratis)

1. Ve a **https://www.twilio.com/try-twilio**
2. Crea una cuenta gratuita (no necesitas tarjeta de crédito para la sandbox)
3. Verifica tu número de teléfono
4. Una vez dentro, ve al **Dashboard** de Twilio

---

## PASO 2 — Unirte al Sandbox de WhatsApp

> El Sandbox es gratuito y permite probar sin aprobación de Meta.

1. En Twilio, busca en el menú: **Messaging → Try it out → Send a WhatsApp message**
2. Anota el **código de unión** que te dará Twilio (ejemplo: `join yellow-fire`)
3. Desde tu WhatsApp personal, **envía ese código** al número:
   - 📱 **+1 415 523 8886** (WhatsApp de Twilio Sandbox)
4. Recibirás una confirmación de que quedaste unido al sandbox

> ⚠️ **Importante:** Cada cliente que quiera recibir mensajes también debe unirse al sandbox enviando ese mismo código. Para producción real, necesitarías aprobar un número de WhatsApp Business con Meta (proceso de ~1-2 semanas).

---

## PASO 3 — Obtener tus credenciales Twilio

En el **Dashboard** de Twilio (https://console.twilio.com):

1. Copia el **Account SID** — empieza con `AC...`
2. Copia el **Auth Token** — haz clic en el ojo para verlo
3. El número de WhatsApp Sandbox es: `whatsapp:+14155238886`

---

## PASO 4 — Configurar las variables en Railway

1. Ve a **https://railway.app** e inicia sesión
2. Haz clic en tu proyecto `tizon-os`
3. Haz clic en el servicio **backend**
4. Ve a la pestaña **Variables**
5. Agrega estas 4 variables (clic en "New Variable" para cada una):

| Variable | Valor |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | Tu Account SID (AC...) |
| `TWILIO_AUTH_TOKEN` | Tu Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+14155238886` |
| `CANAL_DEFAULT` | `whatsapp` |

6. Haz clic en **Deploy** para que Railway reinicie el backend con las nuevas variables

---

## PASO 5 — Actualizar la app y probar

En tu computadora, abre CMD en `C:\Users\perci\Desktop\tizon-os` y ejecuta:

```
ACTUALIZAR_CODIGO.bat
```

Luego construye el APK:

```
CONSTRUIR_APK.bat
```

---

## PASO 6 — Verificar que funciona

1. Instala el nuevo APK en el celular
2. Crea una reserva de prueba con tu número de celular
3. Deberías recibir un WhatsApp de confirmación inmediatamente
4. El recordatorio llegará 2 horas antes de la hora reservada

---

## Pestaña WhatsApp en la App

La app ahora tiene una pestaña **💬 WhatsApp** donde puedes ver:
- Estado de la conexión (activa / no configurada)
- Estadísticas de hoy (enviados, fallidos)
- Desglose por tipo de mensaje
- Historial de los últimos 50 mensajes

---

## ⚠️ Nota sobre la base de datos

El sistema de recordatorios automáticos usa dos campos en la tabla `reservas`:
- `recordatorio_enviado` — fecha/hora en que se envió el recordatorio
- `agradecimiento_enviado` — fecha/hora en que se envió el agradecimiento

**Si ves errores en los logs de Railway,** puede que necesites agregar esas columnas en Supabase.

Para agregarlas, ve a **https://supabase.com** → tu proyecto → **SQL Editor** y ejecuta:

```sql
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS recordatorio_enviado TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS agradecimiento_enviado TIMESTAMP WITH TIME ZONE;
```

---

## Soporte

Si tienes algún problema, revisa los logs en Railway (pestaña **Deployments → View Logs**) y busca mensajes que digan `[SMS]` o `[WhatsApp]`.
