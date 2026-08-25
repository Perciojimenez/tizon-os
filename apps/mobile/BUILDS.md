# 📦 Guía de Builds — Tizón OS (iOS TestFlight + Android APK)

> Esta guía te explica **paso a paso** cómo generar las versiones instalables de la app usando **EAS Build** (el servicio de compilación en la nube de Expo). No necesitas Mac ni Android Studio: todo se compila en los servidores de Expo.

---

## 🎯 ¿Qué vamos a generar?

| Plataforma | Resultado | Para qué sirve |
|---|---|---|
| **iOS** | Build en TestFlight | Instalar en iPhone vía la app TestFlight |
| **Android** | Archivo `.apk` | Instalar directamente en cualquier Android |

---

## ✅ Requisitos Previos

Antes de empezar necesitas:

1. **Node.js instalado** (ya lo tienes si ejecutaste la app antes)
2. **Cuenta de Expo** (gratis) → https://expo.dev/signup
3. Para **iOS/TestFlight:** una cuenta de **Apple Developer** (99 USD/año) → https://developer.apple.com/programs/
4. Para **Android APK:** ¡nada más! No requiere cuenta de pago.

> 💡 **Consejo:** Si solo quieres probar rápido, empieza por el **APK de Android** — no requiere cuenta de pago ni configuración de Apple.

---

## 🪟 PASO 1 — Abrir CMD (Símbolo del sistema)

En Windows:
1. Presiona la tecla **Windows**
2. Escribe: `cmd`
3. Presiona **Enter**

> ⚠️ Usa **CMD**, NO PowerShell (PowerShell bloquea algunos comandos de npm).

Luego navega a la carpeta de la app:

```cmd
cd Desktop\tizon-os\apps\mobile
```

---

## 📥 PASO 2 — Instalar EAS CLI

Copia y pega este comando (instala la herramienta de builds de Expo):

```cmd
npm install -g eas-cli
```

Espera a que termine (puede tardar 1-2 minutos). Para verificar que quedó instalado:

```cmd
eas --version
```

Debe mostrar un número de versión (ej: `eas-cli/12.x.x`).

---

## 🔐 PASO 3 — Iniciar sesión en Expo

```cmd
eas login
```

Te pedirá:
- **Email o usuario** de tu cuenta Expo
- **Contraseña**

> Si no tienes cuenta, créala primero en https://expo.dev/signup

---

## ⚙️ PASO 4 — Vincular el proyecto (solo la primera vez)

Este comando conecta la carpeta con tu cuenta de Expo y genera el `projectId` real:

```cmd
eas init
```

- Cuando pregunte si quieres crear un nuevo proyecto, responde **Yes** (Y).
- Esto actualizará automáticamente el `projectId` dentro de `app.json`.

> 📝 **Nota técnica:** El `app.json` trae un `projectId` de marcador de posición (`"tizon-os"`). El comando `eas init` lo reemplazará por el ID real (un código largo tipo `xxxx-xxxx-xxxx`). Es normal y necesario.

---

## 🤖 PASO 5A — Build de Android (APK) ⭐ Recomendado empezar aquí

```cmd
eas build --platform android --profile preview
```

Lo que pasará:
1. EAS subirá tu código a la nube
2. Compilará el APK en sus servidores (tarda ~10-20 min)
3. Te dará un **enlace** para ver el progreso y descargar

Cuando termine verás algo como:
```
✔ Build finished
🤖 Android app:
https://expo.dev/artifacts/eas/xxxxxxxx.apk
```

### 📲 Cómo instalar el APK en tu Android

1. Abre ese **enlace** desde el navegador **de tu teléfono Android**
2. Toca **Descargar** (se baja el archivo `.apk`)
3. Abre el archivo descargado
4. Android te preguntará si permites instalar de "fuentes desconocidas" → **Permitir**
5. Toca **Instalar**
6. ¡Listo! La app "Tizón OS" aparecerá en tu pantalla de inicio

> 💡 También puedes escanear el **código QR** que EAS muestra al final del build directamente con la cámara del Android.

---

## 🍎 PASO 5B — Build de iOS (TestFlight)

> ⚠️ Requiere cuenta de **Apple Developer** activa (99 USD/año).

```cmd
eas build --platform ios --profile preview
```

Durante el proceso EAS te pedirá:
1. **Iniciar sesión con tu Apple ID** (el de tu cuenta de desarrollador)
2. EAS creará automáticamente los **certificados** y **perfiles de aprovisionamiento** (di **Yes** a todo — EAS lo gestiona por ti)
3. Compilará en la nube (~15-25 min)

Cuando termine, tendrás un archivo `.ipa` listo para subir a TestFlight.

### 🚀 Cómo subir a TestFlight

**Opción A — Automática (recomendada):**

```cmd
eas submit --platform ios --profile production
```

Esto sube el build directamente a App Store Connect. Te pedirá:
- **Apple ID**
- El **App Store Connect App ID** (lo obtienes al crear la app en https://appstoreconnect.apple.com)

**Opción B — Manual:**
1. Descarga el archivo `.ipa` del enlace que da EAS
2. Súbelo con **Transporter** (app gratis de Mac App Store) o desde App Store Connect

### 👥 Cómo invitar testers a TestFlight

1. Entra a https://appstoreconnect.apple.com
2. Ve a tu app → pestaña **TestFlight**
3. En **Testers internos** o **Grupos de testers externos**, toca **+**
4. Agrega el **email** de cada persona que probará la app
5. Ellos recibirán una invitación por correo
6. Deben instalar la app **TestFlight** desde el App Store y aceptar la invitación
7. ¡Ya pueden instalar y probar Tizón OS!

---

## 📊 Ver el progreso de tus builds

Todos tus builds quedan registrados en tu panel de Expo:

👉 **https://expo.dev** → inicia sesión → tu proyecto → pestaña **Builds**

Ahí puedes:
- Ver el estado (en cola, compilando, terminado, fallido)
- Descargar los archivos `.apk` / `.ipa`
- Ver los logs si algo falla

---

## 🧩 Perfiles de Build disponibles (`eas.json`)

| Perfil | Android | iOS | Uso |
|---|---|---|---|
| `development` | APK con dev client | — | Desarrollo con recarga en vivo |
| `preview` | APK instalable | Build interno | **Pruebas** (TestFlight + APK) ⭐ |
| `production` | AAB (Play Store) | Build de tienda | Publicación final en tiendas |

**Comandos rápidos:**

```cmd
:: Android APK para probar
eas build --platform android --profile preview

:: iOS para TestFlight
eas build --platform ios --profile preview

:: Ambas plataformas a la vez
eas build --platform all --profile preview

:: Producción Android (Google Play - archivo AAB)
eas build --platform android --profile production
```

---

## 🐛 Problemas comunes

### ❌ "eas: command not found"
EAS CLI no se instaló bien. Vuelve a ejecutar:
```cmd
npm install -g eas-cli
```
Cierra y reabre CMD después.

### ❌ "You must be logged in"
No has iniciado sesión. Ejecuta:
```cmd
eas login
```

### ❌ El build de iOS pide certificados
Responde **Yes** a todo — EAS crea y gestiona los certificados automáticamente por ti. Solo necesitas tu Apple ID de desarrollador.

### ❌ "Invalid projectId"
No vinculaste el proyecto. Ejecuta:
```cmd
eas init
```

### ❌ El APK no instala en Android ("app no instalada")
- Asegúrate de permitir "instalar de fuentes desconocidas"
- Desinstala cualquier versión anterior de la app antes de instalar la nueva

---

## 📝 Resumen ultra-rápido (para copiar y pegar)

```cmd
:: 1. Instalar herramienta
npm install -g eas-cli

:: 2. Iniciar sesión
eas login

:: 3. Vincular proyecto (solo 1a vez)
eas init

:: 4. Build Android (APK) - empieza aquí
eas build --platform android --profile preview

:: 5. Build iOS (TestFlight)
eas build --platform ios --profile preview

:: 6. Subir a TestFlight
eas submit --platform ios --profile production
```

---

*Documentación de builds — Tizón OS. Compilación en la nube con EAS Build (Expo).*
