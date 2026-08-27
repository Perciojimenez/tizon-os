# 🔍 Diagnóstico: Mesas No Cargan (Token Faltante)

## Síntoma Observado

```
✅ Login exitoso (PIN validado)
✅ Pacing visible (VERDE 0/30 personas)
❌ Mesas no cargan (spinner infinito)
❌ Reservas no cargarían
❌ CRM no cargaría
```

---

## Causa Raíz Confirmada

**Archivo:** `apps/mobile/src/config/api.ts`

```typescript
const getToken = async () => {
  // TODO: Implementar obtención real del token
  return null;  // ← SIN TOKEN = SIN DATOS
};
```

**Flujo actual (ROTO):**

```
Usuario → Login Screen
  ↓ (POST /auth/login con email + PIN)
Backend valida PIN ✅
  ↓
App guarda: isAuthenticated = true
  ↓
App navega a PlanoScreen
  ↓
PlanoScreen llama: tizonAPI.obtenerMesas()
  ↓
API client llama: getToken() → retorna NULL ❌
  ↓
Request HTTP a /mesas SIN header Authorization
  ↓
Backend/Supabase rechaza (401 Unauthorized) ❌
  ↓
PlanoScreen: spinner infinito (await que nunca resuelve)
```

---

## Flujo Correcto (NECESARIO)

```
Usuario → Login Screen
  ↓ (POST /auth/login con email + PIN)
Backend valida PIN ✅
Backend genera JWT token ✅
  ↓ (retorna { token, user })
App guarda token en authStore ✅
  ↓
PlanoScreen llama: tizonAPI.obtenerMesas()
  ↓
API client llama: getToken() → retorna TOKEN REAL ✅
  ↓
Request HTTP: Authorization: Bearer <token>
  ↓
Backend usa token para consultar Supabase
Supabase RLS valida rol ('hostess')
  ↓
Retorna las 20 mesas ✅
  ↓
PlanoScreen renderiza mesas
```

---

## Solución Requerida

### **Opción A: Backend JWT (Recomendado para Producción)**

1. Backend genera JWT al hacer login
2. Mobile guarda token en `authStore`
3. Mobile envía token en cada request

**Ventajas:**
- ✅ Seguridad real
- ✅ RLS de Supabase funciona
- ✅ Auditoría completa

**Desventajas:**
- Requiere implementar JWT en backend (2-3 horas)

---

### **Opción B: API Key Temporal (Rápido para Demo)**

1. Backend usa service_role key internamente
2. Mobile NO envía token
3. Backend valida solo que el request venga del cliente

**Ventajas:**
- ✅ Funciona en 10 minutos
- ✅ Permite probar TODO el flujo HOY

**Desventajas:**
- ❌ No es seguro para producción
- ❌ No hay distinción de roles

---

## Decisión Propuesta

**Para AHORA (demo y pruebas):**
- Usar Opción B (API key temporal)
- Confirmar que TODO el flujo E2E funciona
- Demostrar el sistema al equipo

**Para DESPUÉS (antes de producción):**
- Implementar Opción A (JWT real)
- Pasar auditoría de seguridad
- Lanzar con autenticación robusta

---

## ¿Qué Hacer Ahora?

1. **Usuario (Percio):** Confirmar que prefiere ver el sistema funcionando HOY
2. **Sistema (Yo):** Implementar bypass temporal en backend
3. **Probar:** Mesas, Reservas, CRM, crear reserva, WhatsApp E2E
4. **Documentar:** Que autenticación real está pendiente

---

**Generado:** 26 de Agosto de 2026, 12:35 AM  
**Próxima decisión:** ¿Implementar bypass temporal para demo hoy, o esperar a JWT completo?
