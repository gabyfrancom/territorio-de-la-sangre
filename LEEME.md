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

## 🚀 Publicarla con GitHub Pages (tu URL propia y permanente)

El repositorio ya existe: **github.com/gabyfrancom/territorio-de-la-sangre**.
Solo falta activar la publicación (una sola vez, 1 minuto):

1. Entrá a **https://github.com/gabyfrancom/territorio-de-la-sangre/settings/pages**
2. En **"Build and deployment" → "Source"**, elegí **"Deploy from a branch"**.
3. En **"Branch"**, elegí **main** y la carpeta **/(root)**. Tocá **Save**.
4. Esperá 1-2 minutos. Tu app queda publicada en:
   **https://gabyfrancom.github.io/territorio-de-la-sangre/**

Esa URL es HTTPS, que es lo que Android necesita para instalar la app.

---

## 📱 Para instalarla en tu Android

Una vez publicada en GitHub Pages (paso anterior), ya tenés una URL pública con HTTPS, que es lo que necesita una PWA para instalarse:

1. En tu celular, abrí **Chrome** o **Edge** (ambos instalan PWAs perfectamente; evitá Samsung Internet y Firefox).
2. Entrá a la URL de GitHub Pages (`https://gabyfrancom.github.io/territorio-de-la-sangre/`).
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
| `backup.js` | Botón 💾 para exportar e importar respaldos de tus datos |
| `.nojekyll` | Le dice a GitHub que no procese esto como un sitio Jekyll |

**No borres ninguno.** Todos son necesarios para que funcione.

---


## 💾 Respaldar y restaurar tus datos

La app tiene un botón flotante **💾** (abajo a la derecha) con cuatro opciones:

- **Exportar datos (JSON):** respaldo completo de TODO (INR, pauta, diario, incidencias, items personalizados). Es el formato ideal para guardar y restaurar.
- **Exportar a Excel (.xlsx):** tus datos en planilla, con una hoja por sección (INR, Diario, Incidencias, Pauta, etc.). También sirve como respaldo: se puede reimportar.
- **Exportar a PDF:** un informe prolijo, listo para imprimir o llevarle al hematólogo.
- **Importar respaldo:** elegí un archivo `.json` o `.xlsx` exportado antes y tus datos se restauran en segundos. Sirve también para **pasar tus datos a otro celular o navegador**.

Recomendación: exportá un respaldo una vez por mes, o antes de limpiar el navegador o cambiar de teléfono.

---

## 🔒 Sobre tus datos

Todo lo que cargás en la app (INR, pauta, diario, incidencias, items personalizados) vive en el **almacenamiento del navegador de tu dispositivo**. No se sube a ningún servidor, no hay nube.

Eso tiene una consecuencia: si borrás los datos del navegador, o desinstalás la app, los registros se van con ellos. **Si querés respaldo, exportá manualmente lo importante** (captura de pantalla del histórico INR cada mes, por ejemplo).

Si la usás en computadora y celular, **cada uno tiene sus propios datos**. No se sincronizan entre dispositivos. Esto es por diseño — privacidad sobre comodidad.

---

## 🆘 Si algo no funciona

- **No carga / pantalla en blanco:** abrí la consola del navegador (F12 → Console) y mirá si hay errores. Lo más probable es que falte algún archivo de `vendor/` — revisá que se haya subido completo.
- **No se instala en Android:** usá Chrome o Edge, y la URL tiene que ser HTTPS (GitHub Pages ya cumple esto).
- **Los datos desaparecieron:** revisá que estés en el mismo dispositivo y navegador. Si limpiaste el historial/caché, los datos pueden haberse borrado.

---

**Recordá siempre:** esta app organiza información — no reemplaza a tu hematólogo.
