/* Respaldo de datos — Tu sangre, tu territorio
   Exporta a JSON / Excel / PDF e importa desde JSON o Excel.
   Los datos viven en localStorage (claves sintrom_app_*). */
(function () {
  const PREFIX = 'sintrom_app_';

  /* ---------- utilidades ---------- */
  function loadScript(srcs) {
    // Intenta cada URL en orden (local primero, CDN de respaldo)
    return new Promise(function (res, rej) {
      let i = 0;
      function tryNext() {
        if (i >= srcs.length) { rej(new Error('No se pudo cargar la libreria')); return; }
        const s = document.createElement('script');
        s.src = srcs[i++];
        s.onload = res;
        s.onerror = tryNext;
        document.head.appendChild(s);
      }
      tryNext();
    });
  }
  const LIB_XLSX = ['vendor/xlsx.full.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
  const LIB_JSPDF = ['vendor/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
  const LIB_AUTOTABLE = ['vendor/jspdf.plugin.autotable.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'];
  function ensureXLSX() {
    if (window.XLSX) return Promise.resolve();
    return loadScript(LIB_XLSX);
  }
  function ensurePDF() {
    if (window.jspdf) return Promise.resolve();
    return loadScript(LIB_JSPDF)
      .then(function () { return loadScript(LIB_AUTOTABLE); });
  }
  function getJSON(key, fallback) {
    try { const v = localStorage.getItem(PREFIX + key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function setJSON(key, value) { localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
  function fechaHoy() { return new Date().toISOString().slice(0, 10); }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }
  function setStatus(msg) {
    const el = document.getElementById('bk-status');
    if (el) el.textContent = msg;
  }
  function stripEmoji(s) {
    return String(s == null ? '' : s).replace(/[^\u0000-\u00FF\u2013\u2014\u20AC]/g, '').trim();
  }

  /* ---------- esquema de secciones (compartido export/import) ---------- */
  const LIST_SECTIONS = [
    { key: 'inr_records',         sheet: 'INR',          titulo: 'Historico INR' },
    { key: 'daily_entries',       sheet: 'Diario',       titulo: 'Diario' },
    { key: 'incidents',           sheet: 'Incidencias',  titulo: 'Incidencias' },
    { key: 'custom_alimentos',    sheet: 'Alimentos',    titulo: 'Alimentos personalizados' },
    { key: 'custom_bebidas',      sheet: 'Bebidas',      titulo: 'Bebidas personalizadas' },
    { key: 'custom_medicamentos', sheet: 'Medicamentos', titulo: 'Medicamentos personalizados' },
    { key: 'custom_suplementos',  sheet: 'Suplementos',  titulo: 'Suplementos personalizados' }
  ];

  function pautaToRows(p) {
    if (!p || !p.dosis) return [];
    return Object.keys(p.dosis).map(function (dia) { return { dia: dia, dosis: p.dosis[dia] }; });
  }
  function rowsToPauta(rows) {
    const dosis = {};
    rows.forEach(function (r) { if (r.dia) dosis[String(r.dia)] = String(r.dosis == null ? '' : r.dosis); });
    return Object.keys(dosis).length ? { dosis: dosis } : null;
  }
  function configToRows() {
    const t = getJSON('inr_target', null);
    const pc = getJSON('proximo_control', '');
    const rows = [];
    if (t) { rows.push({ clave: 'inr_min', valor: t.min }); rows.push({ clave: 'inr_max', valor: t.max }); }
    if (pc) rows.push({ clave: 'proximo_control', valor: pc });
    return rows;
  }
  function rowsToConfig(rows) {
    let min = null, max = null, pc = null;
    rows.forEach(function (r) {
      if (r.clave === 'inr_min') min = parseFloat(r.valor);
      if (r.clave === 'inr_max') max = parseFloat(r.valor);
      if (r.clave === 'proximo_control') pc = String(r.valor);
    });
    if (min != null && !isNaN(min) && max != null && !isNaN(max)) setJSON('inr_target', { min: min, max: max });
    if (pc) setJSON('proximo_control', pc);
  }

  /* ---------- EXPORTAR JSON ---------- */
  function exportJSON() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) {
        try { data[k] = JSON.parse(localStorage.getItem(k)); }
        catch (e) { data[k] = localStorage.getItem(k); }
      }
    }
    if (Object.keys(data).length === 0) { setStatus('⚠️ No hay datos guardados para exportar.'); return; }
    const payload = { app: 'territorio-de-la-sangre', version: 1, fecha: new Date().toISOString(), datos: data };
    download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      'respaldo-sintrom-' + fechaHoy() + '.json');
    setStatus('✅ Respaldo JSON descargado (' + Object.keys(data).length + ' secciones).');
  }

  /* ---------- EXPORTAR EXCEL ---------- */
  function exportExcel() {
    setStatus('Generando Excel…');
    ensureXLSX().then(function () {
      const wb = XLSX.utils.book_new();
      let hojas = 0;
      LIST_SECTIONS.forEach(function (sec) {
        const rows = getJSON(sec.key, []);
        if (Array.isArray(rows) && rows.length) {
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sec.sheet);
          hojas++;
        }
      });
      const pauta = pautaToRows(getJSON('sintrom_pauta', null));
      if (pauta.length) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pauta), 'Pauta'); hojas++; }
      const cfg = configToRows();
      if (cfg.length) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cfg), 'Config'); hojas++; }
      if (!hojas) { setStatus('⚠️ No hay datos guardados para exportar.'); return; }
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      download(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'respaldo-sintrom-' + fechaHoy() + '.xlsx');
      setStatus('✅ Excel descargado (' + hojas + ' hojas).');
    }).catch(function () { setStatus('⚠️ No se pudo generar el Excel.'); });
  }

  /* ---------- EXPORTAR PDF ---------- */
  function exportPDF() {
    setStatus('Generando PDF…');
    ensurePDF().then(function () {
      const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
      let y = 18;
      doc.setFontSize(18); doc.setTextColor(190, 30, 60);
      doc.text('Tu sangre, tu territorio — Informe', 14, y); y += 7;
      doc.setFontSize(10); doc.setTextColor(90, 90, 90);
      doc.text('Generado el ' + new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), 14, y); y += 4;
      doc.setFontSize(8);
      doc.text('Informacion orientativa. No reemplaza el criterio de tu hematologo.', 14, y); y += 6;

      function sectionTitle(t) {
        if (y > 265) { doc.addPage(); y = 18; }
        doc.setFontSize(13); doc.setTextColor(30, 30, 30);
        doc.text(t, 14, y); y += 5;
      }
      function table(head, body) {
        doc.autoTable({
          startY: y, head: [head], body: body,
          styles: { fontSize: 8, cellPadding: 1.6 },
          headStyles: { fillColor: [190, 30, 60] },
          margin: { left: 14, right: 14 },
          theme: 'striped'
        });
        y = doc.lastAutoTable.finalY + 8;
      }

      // Resumen
      const t = getJSON('inr_target', null);
      const pc = getJSON('proximo_control', '');
      if (t || pc) {
        sectionTitle('Resumen');
        const rows = [];
        if (t) rows.push(['Rango objetivo INR', String(t.min) + ' - ' + String(t.max)]);
        if (pc) rows.push(['Proximo control', stripEmoji(pc)]);
        table(['Dato', 'Valor'], rows);
      }
      // Pauta
      const pauta = pautaToRows(getJSON('sintrom_pauta', null));
      if (pauta.length) {
        sectionTitle('Pauta semanal de Sintrom');
        table(['Dia', 'Dosis'], pauta.map(function (r) { return [r.dia, String(r.dosis)]; }));
      }
      // Secciones tipo lista
      LIST_SECTIONS.forEach(function (sec) {
        const rows = getJSON(sec.key, []);
        if (!Array.isArray(rows) || !rows.length) return;
        sectionTitle(sec.titulo + ' (' + rows.length + ')');
        const cols = [];
        rows.forEach(function (r) {
          Object.keys(r).forEach(function (k) { if (k !== 'id' && cols.indexOf(k) === -1) cols.push(k); });
        });
        table(cols, rows.map(function (r) {
          return cols.map(function (c) { return stripEmoji(typeof r[c] === 'object' ? JSON.stringify(r[c]) : r[c]); });
        }));
      });

      doc.save('informe-sintrom-' + fechaHoy() + '.pdf');
      setStatus('✅ PDF descargado. Ideal para llevar al hematologo.');
    }).catch(function () { setStatus('⚠️ No se pudo generar el PDF.'); });
  }

  /* ---------- IMPORTAR (JSON o Excel) ---------- */
  function applyJSON(datos) {
    const keys = Object.keys(datos).filter(function (k) { return k.indexOf(PREFIX) === 0; });
    if (!keys.length) return 0;
    keys.forEach(function (k) {
      localStorage.setItem(k, typeof datos[k] === 'string' ? datos[k] : JSON.stringify(datos[k]));
    });
    return keys.length;
  }

  function importFile(file) {
    const isExcel = /\.xlsx?$/i.test(file.name);
    if (isExcel) {
      setStatus('Leyendo Excel…');
      ensureXLSX().then(function () {
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const wb = XLSX.read(reader.result, { type: 'array' });
            let secciones = 0;
            LIST_SECTIONS.forEach(function (sec) {
              const ws = wb.Sheets[sec.sheet];
              if (!ws) return;
              const rows = XLSX.utils.sheet_to_json(ws);
              if (rows.length) { setJSON(sec.key, rows); secciones++; }
            });
            const wsP = wb.Sheets['Pauta'];
            if (wsP) {
              const p = rowsToPauta(XLSX.utils.sheet_to_json(wsP));
              if (p) { setJSON('sintrom_pauta', p); secciones++; }
            }
            const wsC = wb.Sheets['Config'];
            if (wsC) { rowsToConfig(XLSX.utils.sheet_to_json(wsC)); secciones++; }
            if (!secciones) { setStatus('⚠️ El Excel no contiene hojas de esta app.'); return; }
            if (!confirm('Esto reemplazara los datos actuales con los del Excel (' + secciones + ' secciones). ¿Continuar?')) return;
            setStatus('✅ Datos importados desde Excel. Recargando…');
            setTimeout(function () { location.reload(); }, 800);
          } catch (e) { setStatus('⚠️ No se pudo leer el Excel.'); }
        };
        reader.readAsArrayBuffer(file);
      }).catch(function () { setStatus('⚠️ No se pudo cargar el lector de Excel.'); });
    } else {
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const parsed = JSON.parse(reader.result);
          const datos = parsed && parsed.datos ? parsed.datos : parsed;
          const n = applyJSON(datos);
          if (!n) { setStatus('⚠️ El archivo no contiene datos de esta app.'); return; }
          if (!confirm('Esto reemplazara los datos actuales con los del archivo (' + n + ' secciones). ¿Continuar?')) return;
          setStatus('✅ Datos importados. Recargando…');
          setTimeout(function () { location.reload(); }, 800);
        } catch (e) { setStatus('⚠️ No se pudo leer el archivo. ¿Es un respaldo de esta app?'); }
      };
      reader.readAsText(file);
    }
  }

  /* ---------- UI ---------- */
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
      'font-family:inherit;padding-bottom:calc(24px + env(safe-area-inset-bottom));max-height:85vh;overflow-y:auto;';

    const btnStyle = 'width:100%;padding:13px;border-radius:12px;border:1px solid rgba(244,63,94,.4);' +
      'background:rgba(244,63,94,.12);color:#f5f0e8;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:8px;text-align:left;';

    card.innerHTML =
      '<div style="font-size:18px;font-weight:700;margin-bottom:4px;">💾 Respaldo de datos</div>' +
      '<div style="font-size:12px;opacity:.6;margin-bottom:14px;line-height:1.5;">Tus datos viven solo en este navegador. ' +
      'Exportalos para no perderlos o para pasarlos a otro dispositivo.</div>' +
      '<button id="bk-exp-json" style="' + btnStyle + '">⬇️ Exportar datos (JSON — respaldo completo)</button>' +
      '<button id="bk-exp-xlsx" style="' + btnStyle + '">📊 Exportar a Excel (.xlsx)</button>' +
      '<button id="bk-exp-pdf" style="' + btnStyle + '">📄 Exportar a PDF (informe para el médico)</button>' +
      '<button id="bk-import" style="' + btnStyle + '">⬆️ Importar respaldo (JSON o Excel)</button>' +
      '<input type="file" id="bk-file" accept="application/json,.json,.xlsx,.xls" style="display:none">' +
      '<div id="bk-status" style="font-size:12px;opacity:.75;min-height:18px;margin-top:4px;line-height:1.4;"></div>' +
      '<button id="bk-close" style="width:100%;padding:10px;margin-top:6px;border:none;background:none;' +
      'color:rgba(245,240,232,.5);font-size:13px;cursor:pointer;">Cerrar</button>';

    panel.appendChild(card);
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    document.getElementById('bk-exp-json').onclick = exportJSON;
    document.getElementById('bk-exp-xlsx').onclick = exportExcel;
    document.getElementById('bk-exp-pdf').onclick = exportPDF;
    document.getElementById('bk-import').onclick = function () { document.getElementById('bk-file').click(); };
    document.getElementById('bk-file').onchange = function (e) {
      if (e.target.files && e.target.files[0]) importFile(e.target.files[0]);
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
