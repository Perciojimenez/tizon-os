# ✅ Pasos Finales — Ya Arreglé el Problema

## 🎯 Qué Estaba Pasando

El error *"There was a problem running the requested app"* pasaba porque el proyecto usaba una **versión vieja de Expo (SDK 49, de 2023)** y el **Expo Go** que descargaste hoy solo funciona con la **versión nueva (SDK 57)**.

**Ya actualicé todo el proyecto a Expo SDK 57** y lo probé (compila sin errores en iPhone y Android). También arreglé unas imágenes que faltaban. Todo está subido a GitHub. ✅

Ahora solo necesitas **descargar la versión nueva** en tu PC. Son 5 comandos.

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

### 5️⃣ Instala y arranca

```
npm install
```
*(Espera 1-3 minutos. Verás muchos mensajes amarillos "warn" — son normales, NO son errores.)*

```
npm start
```

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
