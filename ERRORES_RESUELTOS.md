# ✅ Errores Resueltos - Sesión 24 de Agosto 2026

> Documento de verificación de las correcciones implementadas.

---

## 🔴 Error #1: App no abre en teléfono (Timeout - Firewall)

**Estado:** ✅ **Solución lista** (el usuario debe ejecutarla)

### Qué se hizo

1. **Script automático de Windows** (`INICIAR_APP.bat`):
   - Verifica la carpeta correcta
   - Abre el firewall automáticamente (puerto 8081)
   - Instala dependencias si faltan
   - Arranca Expo
   - **Uso:** Click derecho → "Ejecutar como administrador"

2. **Guía de troubleshooting** (`SOLUCION_ERRORES_COMUNES.md`):
   - 6 errores documentados con soluciones paso a paso
   - Verificaciones de red (WiFi, datos móviles, VPN)
   - Tabla de comandos de referencia rápida
   - Plan B con modo túnel

### Próximo paso para el usuario
1. Ve a `C:\Users\perci\Desktop\tizon-os\apps\mobile`
2. Click derecho en `INICIAR_APP.bat` → "Ejecutar como administrador"
3. Escanea el QR con Expo Go

---

## 🔴 Error #2: Login no funciona (`getToken` devuelve `null`)

**Estado:** ✅ **Implementado y verificado** (compila sin errores)

### Qué se hizo

#### 1. `getToken()` ahora es funcional
**Archivo:** `apps/mobile/src/config/api.ts`
- Cambiado de `return null` → lee el token del `authStore`
- Todos los requests al backend ahora llevan `Authorization: Bearer <token>`

#### 2. Login obtiene el rol real de la tabla `staff`
**Archivo:** `apps/mobile/src/screens/LoginScreen.tsx`
- Antes: rol hardcodeado como `'hostess'`
- Ahora: 
  1. Autentica con Supabase Auth (email/password)
  2. Consulta la tabla `staff` para obtener `nombre` y `rol`
  3. Guarda token + usuario completo en el store

#### 3. Persistencia de sesión
**Archivo:** `apps/mobile/src/store/authStore.ts`
- Instalada librería `expo-secure-store`
- Token y usuario se guardan cifrados en el dispositivo
- Al abrir la app, restaura la sesión automáticamente (`loadStoredAuth()`)
- Función `logout()` limpia todo

#### 4. Carga de sesión al inicio
**Archivo:** `apps/mobile/App.tsx`
- Llama a `loadStoredAuth()` en el `useEffect` inicial
- Si hay sesión guardada, el usuario va directo al Home (no al Login)

#### 5. Fix de error JSX en PlanoScreen
**Archivo:** `apps/mobile/src/screens/PlanoScreen.tsx`
- Corregido atributo `style` duplicado en línea 29

### Verificación de compilación

```bash
✅ TypeScript: 2 warnings no críticos (process.env en Expo)
✅ Bundle iOS: Compilado exitosamente (997 módulos, 2.7MB)
✅ Metro: Sin errores
```

### Dependencias agregadas
- `expo-secure-store` (almacenamiento cifrado)

---

## 🔧 Script de Setup: Crear Usuarios en Supabase Auth

**Archivo:** `scripts/crear-usuarios-auth.js`

### ¿Por qué es necesario?
La tabla `staff` ya tiene 5 usuarios (seed.sql), pero esos usuarios **NO existen en Supabase Auth** todavía. Este script los crea para que puedan hacer login.

### ¿Cómo ejecutarlo?

**IMPORTANTE:** Este script requiere el **SERVICE_ROLE_KEY** de Supabase (está en Railway).

1. Ve a Railway → tizon-os → Variables → copia `SUPABASE_SERVICE_ROLE_KEY`
2. Desde la raíz del proyecto:

```bash
cd /home/ubuntu/tizon-os
SUPABASE_SERVICE_ROLE_KEY=tu_key_aqui node scripts/crear-usuarios-auth.js
```

3. El script creará 5 usuarios:
   - laura.menendez@tizonmeats.com (gerencia)
   - sofia.ramirez@tizonmeats.com (hostess) ← **úsala para probar**
   - diego.castillo@tizonmeats.com (hostess)
   - mateo.fuentes@tizonmeats.com (mesero)
   - valentina.ortega@tizonmeats.com (mesero)

4. Contraseña temporal para todos: `tizon2024`

**Solo hay que ejecutarlo UNA vez.** Si ya se ejecutó, mostrará "Ya existe" para cada usuario.

---

## 📊 Resumen de Archivos Modificados/Creados

### Nuevos archivos
- ✅ `INICIAR_APP.bat` - Script automático de inicio (Windows)
- ✅ `SOLUCION_ERRORES_COMUNES.md` - Guía de troubleshooting
- ✅ `scripts/crear-usuarios-auth.js` - Setup de usuarios Auth
- ✅ `ERRORES_RESUELTOS.md` - Este documento

### Archivos modificados (login)
- ✅ `apps/mobile/src/config/api.ts` - getToken() implementado
- ✅ `apps/mobile/src/screens/LoginScreen.tsx` - Login con staff real
- ✅ `apps/mobile/src/store/authStore.ts` - Persistencia con SecureStore
- ✅ `apps/mobile/App.tsx` - Carga sesión al inicio
- ✅ `apps/mobile/src/screens/PlanoScreen.tsx` - Fix style duplicado
- ✅ `apps/mobile/package.json` - Agregado expo-secure-store

---

## 🎯 Estado Actual

| Componente | Estado | Verificado |
|---|---|---|
| Firewall (script .bat) | ✅ Listo | Sintaxis OK |
| Guía de errores | ✅ Completa | 6 escenarios |
| `getToken()` | ✅ Implementado | Código OK |
| Login con staff | ✅ Implementado | Lógica OK |
| Persistencia sesión | ✅ Implementado | SecureStore OK |
| Compilación bundle | ✅ Pasa | 997 módulos, 2.7MB |

---

## ⚠️ Lo Que Falta (Requiere Acción del Usuario)

### 1. Resolver el firewall (Error #1)
**Acción:** Ejecutar `INICIAR_APP.bat` como administrador.

### 2. Crear usuarios en Supabase Auth
**Acción:** Ejecutar `scripts/crear-usuarios-auth.js` con el SERVICE_ROLE_KEY.

### 3. Probar el login end-to-end
**Una vez que 1 y 2 estén hechos:**
- Abrir la app en el teléfono
- Hacer login con `sofia.ramirez@tizonmeats.com` / `tizon2024`
- Verificar que entra al Home y que su rol es `hostess`

---

## 🔐 Credenciales de Prueba

```
Email:    sofia.ramirez@tizonmeats.com
Password: tizon2024
Rol:      hostess
```

**⚠️ Cambiar estas contraseñas antes de producción.**

---

*Todos los cambios están commiteados y listos para push a GitHub.*
