# ✅ App Móvil Lista para Probar

**Fecha**: 2026-08-24 04:23 UTC  
**Estado**: 🟢 OPERACIONAL

---

## 📱 Prueba Ahora en 3 Pasos

### 1️⃣ Descarga Expo Go
- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2️⃣ Conecta a la App
Abre Expo Go → **"Enter URL manually"** → Pega:
```
exp://c646794c8-8081.na120.preview.abacusai.app
```

### 3️⃣ Login
```
Email: sofia.ramirez@tizonmeats.com
Password: TizonOS2024!
```

---

## ✅ Todo Configurado

| Componente | Estado | Detalles |
|------------|--------|----------|
| **Servidor Expo** | 🟢 Activo | Puerto 8081, accesible vía URL pública |
| **Backend API** | 🟢 Activo | Railway: https://tizon-os-production.up.railway.app |
| **Base de datos** | 🟢 Activo | Supabase con 20 mesas, 10 clientes, 3 reservas seed |
| **Usuarios Auth** | ✅ Creados | 5 usuarios de staff listos para login |
| **SMS + WhatsApp** | ✅ Operacional | Doble canal con fallback automático |
| **WebSocket** | ✅ Configurado | Actualizaciones en tiempo real |

---

## 🎯 Funcionalidades Disponibles

### 🗺️ Plano de Mesas
- Ver 20 mesas con estados en tiempo real
- Filtrar por zona (Salón, Terraza, Privado)
- Cambiar estado de mesas

### 📅 Reservas
- Ver 3 reservas activas
- Crear nueva reserva
- **Envío automático** de confirmación por SMS/WhatsApp

### 👤 CRM de Clientes
- 10 clientes con datos completos
- Preferencias, alergias, historial de visitas
- Etiquetas VIP, cumpleaños, corporativo

### ⏱️ Lista de Espera
- 2 walk-ins en espera
- Agregar nuevos clientes
- Notificación automática cuando mesa lista

---

## 🔐 Usuarios de Prueba Disponibles

Todos con password: `TizonOS2024!`

| Email | Rol | Acceso |
|-------|-----|--------|
| sofia.ramirez@tizonmeats.com | **hostess** | ⭐ Recomendado (acceso completo) |
| laura.menendez@tizonmeats.com | gerencia | Acceso total |
| carlos.mendez@tizonmeats.com | hostess | Igual que Sofía |
| david.torres@tizonmeats.com | mesero | Solo lectura |
| isabel.guzman@tizonmeats.com | mesero | Solo lectura |

---

## 📊 Datos Seed en la Base de Datos

### Mesas (20):
- **Salón Principal**: 8 mesas (2-8 personas)
- **Terraza**: 10 mesas (2-6 personas)  
- **Privado**: 2 mesas (10-12 personas)

### Clientes VIP (10):
- Ricardo Salazar: 24 visitas, $48,250 MXN gastados
- Ana Lucía Moreno: 12 visitas, VIP, alérgica a mariscos
- Andrés Beltrán: 19 visitas, cliente frecuente
- + 7 más con datos reales

### Reservas Activas (3):
- **Hoy 20:00** - Ricardo Salazar, Mesa 19 (Privado), 6 personas
- **Hoy 21:00** - Ana Lucía Moreno, Mesa 12 (Terraza), 4 personas
- **Mañana 19:30** - Andrés Beltrán, Mesa 7 (Salón), 2 personas

---

## 🔧 URLs Importantes

| Servicio | URL |
|----------|-----|
| **Expo Dev Server** | exp://c646794c8-8081.na120.preview.abacusai.app |
| **Backend API** | https://tizon-os-production.up.railway.app |
| **Health Check** | https://tizon-os-production.up.railway.app/health |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/gfrfnnlasgepepocjddu |
| **GitHub Repo** | https://github.com/Perciojimenez/tizon-os |

---

## 📖 Documentación Completa

Para instrucciones detalladas, ver: **`GUIA_PRUEBA_MOBILE.md`**

Incluye:
- Solución de problemas
- Arquitectura de la app
- Lista de endpoints API
- Checklist de prueba completa
- Opciones avanzadas (simulador, web)

---

## 🚀 Siguiente: ¿Qué Quieres Probar?

1. **Login y navegación** básica
2. **Crear una reserva** → envía SMS/WhatsApp real
3. **Actualización en tiempo real** de mesas vía WebSocket
4. **CRM**: ver datos de clientes VIP
5. **Lista de espera**: agregar walk-in

---

**¡Todo listo para probar la app móvil de Tizón OS!** 📱🍖

---

## ⚡ Script de Configuración Automática

Si necesitas recrear los usuarios:
```bash
node scripts/crear-usuarios-test.js
```

Crea automáticamente los 5 usuarios de staff en Supabase Auth.
