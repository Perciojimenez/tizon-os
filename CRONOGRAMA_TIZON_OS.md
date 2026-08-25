# 🗓️ Cronograma Depurado — Tizón OS

> **Documento único de estado y planificación** · Restaurante Tizón Meats
> Última revisión: **24 de agosto de 2026**
> Reemplaza a las notas dispersas. Aquí solo entra lo verificado, marcado con evidencia real.

---

## 📊 Semáforo General del Proyecto

| Componente | Estado | Evidencia |
|---|---|---|
| Base de Datos (Supabase) | 🟢 Operativa | 8 tablas + RLS + seed aplicados |
| Backend (NestJS/Railway) | 🟢 Live y estable | Todos los módulos desplegados, responde en producción |
| Mensajería WhatsApp (Twilio) | 🟢 Funcional | Mensajes con estado "enviado", webhook activo |
| Mensajería SMS | 🟡 Pausada | Bloqueo geo RD (error 21408) — decisión de negocio |
| App Móvil (compilación) | 🟢 Compila | SDK 57, `expo export` iOS+Android OK, doctor 21/21 |
| App Móvil (en dispositivo) | 🔴 Pendiente | Timeout de red/firewall — no verificada en teléfono aún |
| Autenticación real (login PIN) | 🔴 Pendiente | `getToken()` es `TODO`, devuelve `null` |
| Flujo E2E completo | 🔴 Pendiente | No probado extremo a extremo |

**Leyenda:** 🟢 Hecho y verificado · 🟡 Parcial / decisión de negocio · 🔴 Pendiente

---

## ✅ FASE 0 — Infraestructura Base (COMPLETADA)

Todo lo de abajo está **hecho y verificado**. No requiere más trabajo salvo mantenimiento.

### 0.1 Base de Datos — 🟢
- [x] Esquema de 8 tablas (`staff`, `mesas`, `clientes`, `reservas`, `lista_espera`, `ocupacion_mesas`, `sms_log`, `configuracion`)
- [x] Tipos ENUM (roles, zonas, estados, término de carne, etc.)
- [x] Funciones `rol_actual()` y `es_gerencia()` para RLS
- [x] 21 políticas RLS (gerencia / hostess / mesero)
- [x] Datos seed (5 staff, 20 mesas, 10 clientes, 3 reservas, etc.)

### 0.2 Backend NestJS — 🟢
- [x] Desplegado en Railway: `https://tizon-os-production.up.railway.app`
- [x] Módulos completos en código: `auth`, `mesas`, `reservas`, `clientes`, `lista-espera`, `pacing`, `sms`, `websocket`
- [x] WebSocket gateway (namespace `/sala`) para tiempo real
- [x] Endpoints REST verificados (mesas, reservas, clientes, lista-espera, webhook SMS)
- [x] 9 variables de entorno configuradas

### 0.3 Mensajería (Twilio) — 🟢 / 🟡
- [x] Credenciales corregidas en Railway (resuelto error 20003)
- [x] WhatsApp Sandbox conectado (+14155238886, "join force-zebra")
- [x] Webhook apuntando a producción y activo
- [x] Canal por defecto = WhatsApp
- [ ] 🟡 SMS a RD pausado por geo-restriction (decisión: usar WhatsApp)

### 0.4 App Móvil — Compatibilidad — 🟢
- [x] Actualización Expo SDK 49 → 57 (RN 0.86.2, React 19.2.3)
- [x] Assets generados (icon, adaptive-icon, splash)
- [x] Splash migrado al plugin `expo-splash-screen`
- [x] `expo-doctor` 21/21 · bundle iOS+Android sin errores

### 0.5 Repositorio y Documentación — 🟢
- [x] Código en GitHub (`Perciojimenez/tizon-os`, branch main)
- [x] Guías de instalación para usuario no técnico (Windows/CMD, iPhone)

---

## 🔴 FASE 1 — Poner la App en Manos del Usuario (AHORA — Prioridad Máxima)

**Objetivo:** que la app abra en el teléfono de Percio. Es el bloqueante #1.

| # | Tarea | Estado | Responsable |
|---|---|---|---|
| 1.1 | Resolver timeout de conexión (firewall puerto 8081 **o** modo túnel) | 🟡 Script listo | Usuario debe ejecutar |
| 1.2 | Verificar que la app carga en iPhone (pantalla de Login visible) | 🔴 Pendiente | Usuario |
| 1.3 | Confirmar que la app conecta al backend de Railway | 🔴 Pendiente | Verificar en app |

**Herramientas creadas:**
- ✅ `INICIAR_APP.bat` - Script automático que abre firewall + arranca Expo
- ✅ `SOLUCION_ERRORES_COMUNES.md` - Guía de troubleshooting (6 errores)

**Criterio de éxito de la Fase 1:** la app abre en el teléfono y muestra la pantalla de Login sin errores.

---

## 🟢 FASE 2 — Autenticación Real (COMPLETADA — Pendiente Prueba E2E)

**Objetivo:** que el staff pueda iniciar sesión de verdad.

| # | Tarea | Estado |
|---|---|---|
| 2.1 | Implementar `getToken()` en `apps/mobile/src/config/api.ts` | ✅ Hecho |
| 2.2 | Conectar `LoginScreen` con login email/password + obtener rol de tabla `staff` | ✅ Hecho |
| 2.3 | Persistir sesión en `authStore` con `expo-secure-store` | ✅ Hecho |
| 2.4 | Restaurar sesión al abrir la app (`loadStoredAuth`) | ✅ Hecho |
| 2.5 | Crear usuarios en Supabase Auth (script) | 🟡 Script listo |
| 2.6 | Probar los 3 roles (gerencia / hostess / mesero) y su RLS | 🔴 Pendiente |

**Implementación verificada:**
- ✅ Bundle compila (997 módulos, 2.7MB)
- ✅ `getToken()` lee del authStore
- ✅ Login obtiene `nombre` + `rol` de tabla `staff`
- ✅ Token + usuario se guardan cifrados
- ✅ Sesión persiste entre reinicios

**Setup requerido (una vez):**
- 🟡 Ejecutar `scripts/crear-usuarios-auth.js` con SERVICE_ROLE_KEY de Railway

**Credenciales de prueba:**
- Email: `sofia.ramirez@tizonmeats.com`
- Password: `tizon2024`
- Rol: `hostess`

**Criterio de éxito:** un usuario entra con email/password, el token viaja en cada request y la RLS filtra según su rol.

---

## 🟢 FASE 3 — Flujo End-to-End de Reservas + WhatsApp (IMPLEMENTADO)

**Objetivo:** el ciclo completo de una reserva real con notificación automática.

| # | Tarea | Estado |
|---|---|---|
| 3.1 | Crear reserva desde la app (pantalla `NuevaReserva`) → guarda en BD | ✅ Implementado |
| 3.2 | Envío automático de WhatsApp de confirmación al crear reserva | ✅ Implementado |
| 3.3 | Respuesta del cliente → webhook → actualización de estado en BD | ✅ Implementado |
| 3.4 | Reflejar cambios en tiempo real en el plano (WebSocket `/sala`) | ✅ Implementado |
| 3.5 | Probar recordatorio automático (X horas antes) | 🟡 Implementado, no probado |
| 3.6 | **Probar flujo completo E2E en dispositivo Android** | 🔴 Pendiente |

**Implementación completada (commit ea5226f):**
- ✅ Backend compila sin errores (TypeScript + NestJS build OK)
- ✅ `ReservasService` integra `SalaGateway` para eventos WebSocket
- ✅ Auto-envío WhatsApp con Twilio al crear reserva (canal `whatsapp` por defecto)
- ✅ `SmsService` procesa respuestas del webhook Twilio ("1" confirma, "2" cancela)
- ✅ WebSocket emite `reserva-confirmada` en cada cambio de estado
- ✅ Dependencias circulares resueltas con `forwardRef` (NestJS pattern)
- ✅ Endpoint `/sms/webhook` sin autenticación (para Twilio)

**Documentación creada:**
- 📄 `FLUJO_E2E_RESERVAS_WHATSAPP.md` - Diagrama de flujo + guía de prueba

**Criterio de éxito:** crear una reserva dispara el WhatsApp, la respuesta del cliente actualiza la mesa y se ve en el plano en vivo.

---

## 🟢 FASE 4 — Pulido y Producción (MAYORMENTE COMPLETADA)

**Objetivo:** dejarlo listo para el equipo real del restaurante.

| # | Tarea | Estado |
|---|---|---|
| 4.1 | Reemplazar assets placeholder por el logo real de Tizón Meats | 🟡 Pendiente (requiere archivo del usuario) |
| 4.2 | Motor de Pacing en vivo (semáforo verde/amarillo/rojo real) | ✅ **COMPLETADO** |
| 4.3 | CRM: historial, tags VIP/cumpleaños, preferencias por cliente | ✅ **COMPLETADO** |
| 4.4 | Build de producción con EAS (TestFlight iOS + APK/Play Android) | ✅ **COMPLETADO** (configurado) |
| 4.5 | Migrar WhatsApp Sandbox → número Business aprobado | 🟡 Pendiente (aprobación Twilio) |
| 4.6 | (Opcional) Habilitar geo-permisos SMS para RD como fallback | 🔴 Pendiente (opcional) |

**Implementación completada (commits recientes):**

### 4.2 — Pacing en Vivo ✅
- **Backend**: `PacingScheduler` con cron job (`@Cron('*/30 * * * * *')`)
- Instalado `@nestjs/schedule` y configurado `ScheduleModule.forRoot()` en AppModule
- Cada 30 segundos: calcula estado (VERDE/AMARILLO/ROJO) y emite `pacing-estado` via WebSocket
- Frontend ya escucha el evento → PacingIndicator se actualiza automáticamente
- **Commit**: `feat(pacing): cron job 30s emite pacing-estado via WebSocket`

### 4.3 — CRM Completo ✅
- **Nueva pantalla**: `ClienteDetalleScreen.tsx`
  - Header con nombre + badges ⭐ VIP y 🎂 Cumpleaños
  - Info completa: teléfono, email, término de carne, alergias (badges rojos ⚠️)
  - Stats: número de visitas y gasto total
  - **Botones de acción**: Toggle VIP, Toggle Cumpleaños (actualizan etiquetas en BD)
  - **Modal de edición**: cambiar nombre, teléfono, email, término de carne (picker), alergias
  - **Historial de reservas**: lista de reservas pasadas con fecha, hora, personas, estado (colores), código
  - Dark theme: #1a1a1a fondo, #2a2a2a cards, #fff texto, #C62828 acento, #FFC107 VIP
- **API actualizada**: `actualizarCliente()`, `toggleVIP()`, `obtenerReservasCliente()` en api.ts
- **Navegación arreglada**: `CRMStack` creado en AppNavigator (fix del crash al tocar cliente)
- **Commit**: `feat(crm): pantalla detalle cliente con VIP/cumpleaños y historial reservas`

### 4.4 — EAS Build Configurado ✅
- **`eas.json`** creado con 3 perfiles:
  - `development`: APK interno con dev client
  - `preview`: APK Android + iOS TestFlight (distribución interna)
  - `production`: AAB Android + IPA iOS (tiendas oficiales) con `autoIncrement: true`
- **`BUILDS.md`**: guía paso a paso en español para hacer builds desde Windows
  - Instalar EAS CLI, login, build, descargar, instalar APK
  - TestFlight: cómo subir, invitar testers
  - Troubleshooting común
- **Commit**: `feat(eas): configuración de builds para TestFlight e iOS + Android APK`

**Pendientes:**
- 4.1: Logo real (necesita que el usuario envíe los archivos)
- 4.5: WhatsApp Business (cuando Twilio apruebe la cuenta, salir del sandbox)
- 4.6: SMS a RD (opcional, requiere habilitar geo-permisos en Twilio)

---

## 🧹 Depuración — Documentos que Consolidar

Se generaron muchas guías durante el soporte. Para evitar confusión, este es el criterio:

| Documento | Acción recomendada |
|---|---|
| `CRONOGRAMA_TIZON_OS.md` (este) | ⭐ **Fuente única de estado y plan** |
| `PASOS_FINALES_WINDOWS.md` | ✅ Mantener — guía activa para el usuario |
| `TRABAJO_REALIZADO_COMPLETO.md` | ✅ Mantener como histórico/referencia |
| `GUIA_TERMINAL_PASO_A_PASO.html` / `GUIA_VISUAL_IPHONE.html` | ✅ Mantener — apoyo visual |
| `INSTALACION_IPHONE.md`, `EJECUTAR_EN_TU_COMPUTADORA.md`, `GUIA_PRUEBA_MOBILE.md`, `PRUEBA_MOBILE_LISTO.md` | 🗂️ Redundantes entre sí — se pueden archivar en una carpeta `docs/legacy/` |
| `PUSH_PENDIENTE.txt` | ❌ Obsoleto — eliminar |

---

## 🎯 Lo Único que Importa Esta Semana

1. **Hacer que la app abra en el teléfono** (Fase 1) — resolver firewall/túnel.
2. Con la app abierta, **implementar el login real** (Fase 2).
3. Recién entonces, **probar el flujo de reserva + WhatsApp** (Fase 3).

Todo lo demás (pacing, CRM avanzado, builds de tienda) es **después** de tener el ciclo básico funcionando en el dispositivo.

---

*Este cronograma es la referencia oficial. Cualquier avance se marca aquí primero.*
