# ✅ Pasos Finales — Versión Actualizada con Script Automático

## 🎯 Qué Estaba Pasando (Resuelto)

Había **2 problemas** que impedían que la app abriera en el teléfono:

1. **Versión vieja de Expo**: El proyecto usaba SDK 49 (2023) y Expo Go de hoy solo funciona con SDK 57 → **✅ Actualizado**
2. **Firewall de Windows bloqueando el puerto 8081** → **✅ Ahora hay un script .bat que lo abre automáticamente**

**Todo está arreglado y subido a GitHub.** Ahora solo necesitas descargar la versión nueva.

---

## 📋 Los 5 Comandos (Símbolo del Sistema / CMD)

> ⚠️ Usa **CMD** (ventana negra), NO PowerShell (ventana azul).
> Ábrelo con: tecla Windows → escribe `cmd` → Enter.

### 1️⃣ Borra la versión vieja del Escritorio

```
rmdir /s /q "%USERPROFILE%\Desktop\tizon-os"
```
*(Si te pregunta, escribe `S` y Enter. Si dice que no existe, no pasa nada, continúa.)*

### 2️⃣ Ve al Escritorio

```
cd %USERPROFILE%\Desktop
```

### 3️⃣ Descarga la versión NUEVA y actualizada

```
git clone https://github.com/Perciojimenez/tizon-os.git
```
*(Espera 15-30 segundos.)*

### 4️⃣ Entra a la carpeta de la app

```
cd tizon-os\apps\mobile
```

### 5️⃣ Instala las dependencias

```
npm install
```
*(Espera 1-3 minutos. Verás muchos mensajes amarillos "warn" — son normales, NO son errores.)*

---

## 🚀 Arrancar el Servidor (2 Opciones)

### ⭐ OPCIÓN A — Script Automático (RECOMENDADA)

1. Abre el **Explorador de Archivos** → ve a: `C:\Users\perci\Desktop\tizon-os\apps\mobile`
2. Busca el archivo **`INICIAR_APP.bat`**
3. **Click derecho** en el archivo → **"Ejecutar como administrador"**
4. Cuando te pregunte "¿Quieres permitir que esta aplicación haga cambios?", click en **"Sí"**

El script hace TODO automáticamente:
- ✅ Abre el firewall (puerto 8081)
- ✅ Verifica dependencias
- ✅ Arranca Expo
- ✅ Muestra el QR

**⚠️ IMPORTANTE:** Tienes que ejecutarlo **como administrador** (click derecho → "Ejecutar como administrador"), sino no podrá abrir el firewall.

---

### 🔧 OPCIÓN B — Manual (Si la Opción A no funciona)

Desde CMD (ya debes estar en `tizon-os\apps\mobile`):

```
npm start
```

Si aparece una ventana del Firewall de Windows:
- **Marca "Redes privadas"**
- **Click en "Permitir acceso"**

---

## 📱 Cuando Aparezca el Código QR

Ahora que el proyecto está actualizado, el QR **sí va a funcionar**:

- **iPhone:** Abre **Expo Go** → toca **"Scan QR code"** → apunta al QR de la ventana CMD
- **Android:** Abre **Expo Go** → toca **"Scan QR code"** → apunta al QR

Espera 30-60 segundos (la primera vez compila) → ¡La app abre! 🎉

---

## 🛡️ IMPORTANTE — Ventana del Firewall

La **primera vez** que corras `npm start`, Windows mostrará una ventana:

> *"¿Desea permitir que Node.js se comunique en estas redes?"*

**→ Marca "Redes privadas" → click en "Permitir acceso"** ✅

Sin esto, el teléfono no conecta. Es solo la primera vez.

---

## 📶 Requisito de Red

- El **teléfono y la PC deben estar en el mismo WiFi**.
- Desactiva los **datos móviles** del teléfono mientras pruebas (para que use el WiFi).
- Si tienes **VPN**, desactívala.

---

## 🆘 Si Vuelve a Fallar la Conexión (modo túnel)

Si el teléfono no conecta por WiFi, prueba el modo túnel. Detén el servidor con `Ctrl + C` y corre:

```
npx expo start --tunnel
```

*(Si pregunta instalar algo, escribe `y` + Enter. Si da un error la primera vez, ejecútalo una segunda vez.)*

---

## ✅ Resumen

| Paso | Comando |
|------|---------|
| 1 | `rmdir /s /q "%USERPROFILE%\Desktop\tizon-os"` |
| 2 | `cd %USERPROFILE%\Desktop` |
| 3 | `git clone https://github.com/Perciojimenez/tizon-os.git` |
| 4 | `cd tizon-os\apps\mobile` |
| 5 | `npm install` y luego `npm start` |

La **próxima vez** que quieras abrir la app, solo necesitas los pasos 4 y 5 (ya no hay que borrar ni descargar de nuevo).

---

**¿Algún error?** Copia el mensaje exacto y te ayudo al instante. 💪
