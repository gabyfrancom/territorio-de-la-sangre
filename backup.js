/* Respaldo de datos — Tu sangre, tu territorio
   Exporta e importa todo lo guardado en localStorage (claves sintrom_app_*) */
(function () {
  const PREFIX = 'sintrom_app_';

  function collectData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) {
        try { data[k] = JSON.parse(localStorage.getItem(k)); }
        catch (e) { data[k] = localStorage.getItem(k); }
      }
    }
    return data;
  }

  function exportData() {
    const data = collectData();
    const n = Object.keys(data).length;
    if (n === 0) { alert('No hay datos guardados para exportar.'); return; }
    const payload = {
      app: 'territorio-de-la-sangre',
      version: 1,
      fecha: new Date().toISOString(),
      datos: data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fecha = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = 'respaldo-sintrom-' + fecha + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    setStatus('✅ Respaldo descargado (' + n + ' secciones). Guardalo en un lugar seguro.');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(reader.result);
        const datos = parsed && parsed.datos ? parsed.datos : parsed;
        const keys = Object.keys(datos).filter(function (k) { return k.indexOf(PREFIX) === 0; });
        if (keys.length === 0) {
          setStatus('⚠️ El archivo no contiene datos de esta app.');
          return;
        }
        if (!confirm('Esto reemplazará los datos actuales con los del archivo (' + keys.length + ' secciones). ¿Continuar?')) return;
        keys.forEach(function (k) {
          localStorage.setItem(k, typeof datos[k] === 'string' ? datos[k] : JSON.stringify(datos[k]));
        });
        setStatus('✅ Datos importados. Recargando…');
        setTimeout(function () { location.reload(); }, 800);
      } catch (e) {
        setStatus('⚠️ No se pudo leer el archivo. ¿Es un respaldo de esta app?');
      }
    };
    reader.readAsText(file);
  }

  function setStatus(msg) {
    const el = document.getElementById('bk-status');
    if (el) el.textContent = msg;
  }

  function togglePanel(show) {
    const p = document.getElementById('bk-panel');
    if (p) p.style.display = show ? 'flex' : 'none';
  }

  function build() {
    if (document.getElementById('bk-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'bk-fab';
    fab.title = 'Respaldar o restaurar datos';
    fab.textContent = '💾';
    fab.style.cssText = 'position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));' +
      'width:52px;height:52px;border-radius:50%;border:1px solid rgba(244,63,94,.4);' +
      'background:#1a1a1f;color:#f5f0e8;font-size:22px;z-index:9998;cursor:pointer;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;';
    fab.onclick = function () { togglePanel(true); };

    const panel = document.createElement('div');
    panel.id = 'bk-panel';
    panel.style.cssText = 'position:fixed;inset:0;z-index:9999;display:none;align-items:flex-end;' +
      'justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);';
    panel.onclick = function (e) { if (e.target === panel) togglePanel(false); };

    const card = document.createElement('div');
    card.style.cssText = 'background:linear-gradient(135deg,#1a1a1f,#15151a);border:1px solid rgba(255,255,255,.1);' +
      'border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:420px;color:#f5f0e8;' +
      'font-family:inherit;padding-bottom:calc(24px + env(safe-area-inset-bottom));';

    const btnStyle = 'width:100%;padding:14px;border-radius:12px;border:1px solid rgba(244,63,94,.4);' +
      'background:rgba(244,63,94,.12);color:#f5f0e8;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:10px;';

    card.innerHTML =
      '<div style="font-size:18px;font-weight:700;margin-bottom:4px;">💾 Respaldo de datos</div>' +
      '<div style="font-size:12px;opacity:.6;margin-bottom:16px;line-height:1.5;">Tus datos viven solo en este navegador. ' +
      'Exportá un respaldo para no perderlos si limpiás el navegador o cambiás de dispositivo.</div>' +
      '<button id="bk-export" style="' + btnStyle + '">⬇️ Exportar respaldo (archivo .json)</button>' +
      '<button id="bk-import" style="' + btnStyle + '">⬆️ Importar respaldo</button>' +
      '<input type="file" id="bk-file" accept="application/json,.json" style="display:none">' +
      '<div id="bk-status" style="font-size:12px;opacity:.75;min-height:18px;margin-top:4px;line-height:1.4;"></div>' +
      '<button id="bk-close" style="width:100%;padding:10px;margin-top:8px;border:none;background:none;' +
      'color:rgba(245,240,232,.5);font-size:13px;cursor:pointer;">Cerrar</button>';

    panel.appendChild(card);
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    document.getElementById('bk-export').onclick = exportData;
    document.getElementById('bk-import').onclick = function () { document.getElementById('bk-file').click(); };
    document.getElementById('bk-file').onchange = function (e) {
      if (e.target.files && e.target.files[0]) importData(e.target.files[0]);
      e.target.value = '';
    };
    document.getElementById('bk-close').onclick = function () { togglePanel(false); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
