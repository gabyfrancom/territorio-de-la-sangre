# Sangre, Territorio — Sintrom App

App de gestión de anticoagulación con acenocumarol (Sintrom).
Funciona en **computadora** y se instala como **app en Android**.
No necesita internet para funcionar (todo lo pesado —React, Recharts, estilos— está incluido localmente en `vendor/`).

---

## 🖥️ Para usarla en la computadora

**Opción A — Directo (sin internet, sin instalar nada):**

1. Descomprimí este ZIP en una carpeta cualquiera.
2. Doble click en `index.html`.
3. Se abre en tu navegador. Listo.

**Opción B — Servidor local (si la Opción A no anduviera):**

1. Abrí una terminal en la carpeta donde descomprimiste.
2. Escribí: `python3 -m http.server 8080`
3. En el navegador, andá a: `http://localhost:8080`

---

## 🚀 Cómo subirla a GitHub y publicarla (GitHub Pages)

1. Andá a **https://github.com/new** y creá un repositorio nuevo (público), por ejemplo llamado `sangre-territorio`. No marques ninguna casilla de "Add README" — dejalo vacío.
2. En la página del repo recién creado, click en **"uploading an existing file"** (o "Add file" → "Upload files").
3. Arrastrá **todo el contenido de esta carpeta** (incluida la carpeta `vendor/`) a la ventana de subida.
4. Hacé commit ("Commit changes").
5. Andá a **Settings → Pages** del repo. En "Build and deployment" → "Source", elegí **"GitHub Actions"**.
6. Andá a la pestaña **"Actions"** del repo: debería haber corrido (o estar corriendo) el workflow "Deploy static site to GitHub Pages". Esperá a que termine (tilde verde).
7. Tu app va a quedar publicada en `https://<tu-usuario>.github.io/sangre-territorio/`.

No hace falta tocar nada más: el workflow (`.github/workflows/deploy.yml`) ya está armado para publicar la app tal cual, sin ningún paso de build.

---

## 📱 Para instalarla en tu Android

Una vez publicada en GitHub Pages (paso anterior), ya tenés una URL pública con HTTPS, que es lo que necesita una PWA para instalarse:

1. En tu celular, abrí **Chrome** (no Samsung Browser, no Firefox — Chrome funciona mejor con PWAs).
2. Entrá a la URL de GitHub Pages (`https://<tu-usuario>.github.io/sangre-territorio/`).
3. Tocá los **tres puntos arriba a la derecha**.
4. Elegí **"Instalar app"** (o "Añadir a pantalla de inicio").
5. Confirmá.

Aparece en tu pantalla de inicio como cualquier otra app, con el ícono de la gota roja, a pantalla completa. La primera vez que la abrís descarga todo; **después funciona sin internet**.

---

## 🗂️ Qué archivo es cada cosa

| Archivo / carpeta | Para qué |
|---|---|
| `index.html` | La página principal de la app |
| `app.js` | Toda la lógica de la app (ya compilada, sin necesidad de Babel) |
| `vendor/` | React, ReactDOM, Recharts, PropTypes y los estilos — todo local, sin CDNs |
| `manifest.json` | Le dice a Android que es instalable y cómo se ve |
| `sw.js` | Service worker — hace que funcione offline |
| `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` | Íconos para distintos tamaños de pantalla |
| `.github/workflows/deploy.yml` | Publica la app en GitHub Pages automáticamente en cada push |
| `.nojekyll` | Le dice a GitHub que no procese esto como un sitio Jekyll |

**No borres ninguno.** Todos son necesarios para que funcione.

---

## 🔒 Sobre tus datos

Todo lo que cargás en la app (INR, pauta, diario, incidencias, items personalizados) vive en el **almacenamiento del navegador de tu dispositivo**. No se sube a ningún servidor, no hay nube.

Eso tiene una consecuencia: si borrás los datos del navegador, o desinstalás la app, los registros se van con ellos. **Si querés respaldo, exportá manualmente lo importante** (captura de pantalla del histórico INR cada mes, por ejemplo).

Si la usás en computadora y celular, **cada uno tiene sus propios datos**. No se sincronizan entre dispositivos. Esto es por diseño — privacidad sobre comodidad.

---

## 🆘 Si algo no funciona

- **No carga / pantalla en blanco:** abrí la consola del navegador (F12 → Console) y mirá si hay errores. Lo más probable es que falte algún archivo de `vendor/` — revisá que se haya subido completo.
- **No se instala en Android:** tiene que ser Chrome, y la URL tiene que ser HTTPS (GitHub Pages ya cumple esto).
- **Los datos desaparecieron:** revisá que estés en el mismo dispositivo y navegador. Si limpiaste el historial/caché, los datos pueden haberse borrado.

---

**Recordá siempre:** esta app organiza información — no reemplaza a tu hematólogo.
