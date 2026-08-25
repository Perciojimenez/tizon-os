# 🛠️ Scripts de Prueba - Tizón OS

Scripts utilitarios para probar el sistema de reservas + WhatsApp.

---

## 📋 Listado de Scripts

### 1. `probar-flujo-e2e.js` ⭐
**Prueba automatizada del flujo completo** (sin necesidad de la app móvil)

**Qué hace:**
- ✅ Login como hostess
- ✅ Busca cliente "Ricardo Pérez"
- ✅ Busca mesa disponible
- ✅ Crea reserva
- ✅ Verifica en base de datos
- ✅ Simula respuesta del cliente por WhatsApp
- ✅ Verifica estado actualizado
- ✅ Consulta log de mensajes

**Uso:**
```bash
node scripts/probar-flujo-e2e.js
```

**Requiere:**
- Backend desplegado en Railway
- Datos de prueba en Supabase (cliente "Ricardo Pérez")

**Salida:**
```
🧪 PRUEBA E2E - FLUJO COMPLETO RESERVAS + WHATSAPP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRUEBA E2E COMPLETADA EXITOSAMENTE
```

---

### 2. `crear-reserva-test-whatsapp.js`
**Crea una reserva de prueba** y envía WhatsApp de confirmación

**Qué hace:**
- ✅ Crea reserva con datos hardcoded
- ✅ Dispara auto-envío de WhatsApp
- ✅ Muestra el código de reserva

**Uso:**
```bash
node scripts/crear-reserva-test-whatsapp.js
```

**Requiere:**
- Backend desplegado
- Cliente "Ricardo Pérez" en BD

---

### 3. `crear-usuarios-auth.js`
**Sincroniza usuarios de Supabase Auth** con la tabla `staff`

**Qué hace:**
- ✅ Lee usuarios de `staff`
- ✅ Crea usuarios en Supabase Auth
- ✅ Genera contraseñas (PIN + "@tizon2024")

**Uso:**
```bash
node scripts/crear-usuarios-auth.js
```

**Requiere:**
- Variables de entorno de Supabase configuradas

---

### 4. `ver-logs-railway.sh`
**Monitorea logs de Railway** filtrando eventos relevantes

**Qué hace:**
- ℹ️ Muestra instrucciones para usar Railway CLI
- ℹ️ Comando manual para filtrar logs

**Uso:**
```bash
bash scripts/ver-logs-railway.sh
```

**Requiere:**
- Railway CLI instalado (`npm install -g @railway/cli`)
- Autenticado (`railway login`)
- Proyecto linkeado (`railway link`)

**Comando manual:**
```bash
railway logs --service tizon-os | grep -E '(WhatsApp|WebSocket|Reserva|📱|🔄|📥)'
```

---

## 🎯 Flujo Recomendado de Pruebas

### Prueba Rápida (Backend Solo)
```bash
# 1. Probar flujo completo automatizado
node scripts/probar-flujo-e2e.js

# 2. Ver logs en Railway (en otra terminal)
railway logs --service tizon-os
```

### Prueba Completa (Con App Móvil)
```bash
# 1. Iniciar servidor de desarrollo
cd apps/mobile
npm start

# 2. Escanear QR desde Expo Go

# 3. En otra terminal, monitorear logs
railway logs --service tizon-os | grep WhatsApp

# 4. Desde la app:
#    - Login: sofia.ramirez@tizonmeats.com / tizon2024
#    - Nueva Reserva → Ricardo Pérez → Mesa 3 → 20:00 → 2 personas
#    - Crear Reserva
```

### Verificación E2E
```bash
# Ver casos de prueba detallados
cat docs/CASOS_PRUEBA_E2E.md

# O abrir en navegador (convertido a HTML)
# Ver: docs/CASOS_PRUEBA_E2E.pdf
```

---

## 🐛 Troubleshooting

### Script falla con "Connection refused"
**Causa:** Backend no está levantado o URL incorrecta

**Solución:**
```bash
# Verificar que Railway está activo
curl https://tizon-os-production.up.railway.app/health

# Si da error 404, el backend está activo (no tiene endpoint /health)
# Si da "Connection refused", el backend no está levantado
```

---

### "Cliente no encontrado"
**Causa:** No hay datos de prueba en Supabase

**Solución:**
```bash
# Aplicar seed data
cd database
bash apply.sh
```

---

### "Token expirado"
**Causa:** Los tokens JWT de autenticación expiran después de X horas

**Solución:**
- El script hace login automáticamente cada vez
- Si el error persiste, verifica las variables de entorno `JWT_SECRET` en Railway

---

## 📚 Documentación Relacionada

- **Flujo E2E completo:** `/FLUJO_E2E_RESERVAS_WHATSAPP.md`
- **Casos de prueba:** `/docs/CASOS_PRUEBA_E2E.md`
- **Cronograma general:** `/CRONOGRAMA_TIZON_OS.md`
- **Trabajo completo:** `/TRABAJO_REALIZADO_COMPLETO.md`

---

*Última actualización: 2026-08-25*
