/**
 * app.js — Orquestación e interfaz.
 *
 * Flujo por archivo:
 *   extraer texto (local) → anonimizar (local) → clasificar y extraer campos
 *   → evaluar alertas → guardar ficha en el registro local → pintar.
 *
 * El texto íntegro nunca se persiste. Vive en memoria mientras dura la sesión.
 */

import { extraerTexto } from './extract.js';
import { anonimizar } from './redact.js';
import { extraerLineas, terceros } from './lineas.js';
import { analizar, datosNoIncluidos, fmtEuro } from './parse.js';
import { evaluarDecreto, evaluarPatrones, lecturaOposicion } from './rules.js';
import * as registro from './registry.js';
import {
  fichaMarkdown, informeConsolidadoMarkdown, descargar, nombreArchivo,
} from './export.js';

// La librería docx (y su descarga desde CDN) solo se carga la primera vez
// que alguien pide de verdad un archivo Word — nunca al abrir la aplicación.
let exportDocxMod = null;
async function cargarExportDocx() {
  if (!exportDocxMod) exportDocxMod = await import('./exportDocx.js');
  return exportDocxMod;
}

/** Deshabilita el botón mientras se genera el documento, para que no se pulse dos veces. */
async function conBotonOcupado(boton, textoOcupado, tarea) {
  const original = boton.textContent;
  boton.disabled = true;
  boton.textContent = textoOcupado;
  try {
    await tarea();
  } catch (err) {
    mostrarEstado('No se ha podido generar el documento Word: ' + err.message, 'error');
  } finally {
    boton.disabled = false;
    boton.textContent = original;
  }
}

async function descargarFichaDocx(ficha, boton) {
  await conBotonOcupado(boton, 'Generando…', async () => {
    const { fichaDocxBlob } = await cargarExportDocx();
    descargar(nombreArchivo(ficha, 'ficha', 'docx'), await fichaDocxBlob(ficha),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });
}

const $ = (sel) => document.querySelector(sel);
const sesion = new Map();   // id → { ficha, alertas, lectura, aviso }
let contador = 0;

/* ─────────────── utilidades de pintado ─────────────── */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function severidadMaxima(alertas) {
  for (const s of ['alta', 'media', 'baja', 'informativa']) {
    if (alertas.some(a => a.severidad === s)) return s;
  }
  return 'ninguna';
}

const ETIQUETA_SELLO = {
  alta: 'Requiere atención',
  media: 'Revisar',
  baja: 'Menor',
  informativa: 'Informativo',
  ninguna: 'Sin alertas',
};

function mostrarEstado(texto, tipo = 'trabajando') {
  const el = $('#estado');
  el.textContent = texto;
  el.className = `estado estado--${tipo}`;
  el.hidden = false;
}

const ocultarEstado = () => { $('#estado').hidden = true; };

/* ─────────────── ficha técnica ─────────────── */

function pintarFicha(ficha) {
  const filas = [
    ['Expediente', ficha.expediente || 'No consta', true],
    ['Tipo', ficha.tipoNombre, false],
    ['Objeto', ficha.objeto || 'No consta', false],
    ['Fecha', ficha.fecha ? `${ficha.fecha}${ficha.fechaOrigen ? ` · ${ficha.fechaOrigen}` : ''}` : 'No consta', true],
    ['Firmante', ficha.firmante || 'No consta', false],
    ['Mandato', `${ficha.mandato?.etiqueta || 'Sin determinar'}${ficha.mandato?.confianza && ficha.mandato.confianza !== 'alta' ? ` (atribución ${ficha.mandato.confianza})` : ''}`, false],
    ['Importe', fmtEuro(ficha.importeTotal), true],
  ];

  let html = '<dl class="campos">';
  for (const [k, v, mono] of filas) {
    html += `<dt>${esc(k)}</dt><dd class="${mono ? 'dato' : ''}">${esc(v)}</dd>`;
  }
  if (ficha.aplicaciones?.length) {
    html += `<dt>Aplicaciones</dt><dd class="dato">${esc(ficha.aplicaciones.join(' · '))}</dd>`;
  }
  html += '</dl>';

  if (ficha.mandato?.nota) {
    html += `<div class="cautela"><span class="cautela__marca">!</span><span>${esc(ficha.mandato.nota)}</span></div>`;
  }

  // Relación de facturas: quién cobra, cuánto y por qué concepto.
  if (ficha.nFacturas > 0) {
    html += `<h4 class="subtitulo">Relación de facturas · ${ficha.nFacturas} líneas</h4>`;

    if (ficha.cuadra === false) {
      html += `<div class="cautela"><span class="cautela__marca">!</span><span>Las facturas leídas suman ${esc(fmtEuro(ficha.sumaLineas))} frente a los ${esc(fmtEuro(ficha.importeTotal))} declarados: la lectura automática ha perdido líneas. Comprueba la relación completa en el decreto original.</span></div>`;
    }

    html += '<table class="facturas"><thead><tr><th>Tercero</th><th class="num">Facturas</th><th class="num">Importe</th><th class="num">% decreto</th></tr></thead><tbody>';
    for (const t of ficha.porTercero.slice(0, 12)) {
      const pct = ficha.sumaLineas ? (t.importe / ficha.sumaLineas) * 100 : 0;
      html += `<tr>
        <td>${esc(t.nombre || t.cif || '—')}${t.cif && t.nombre ? ` <span class="norma">${esc(t.cif)}</span>` : ''}</td>
        <td class="num">${t.nFacturas}</td>
        <td class="num">${esc(fmtEuro(t.importe))}</td>
        <td class="num">${pct.toFixed(0)} %</td>
      </tr>`;
    }
    html += '</tbody></table>';
    if (ficha.porTercero.length > 12) {
      html += `<p class="norma">y ${ficha.porTercero.length - 12} tercero(s) más.</p>`;
    }

    if (ficha.mayores?.length > 1) {
      html += '<h4 class="subtitulo">Facturas de mayor cuantía</h4><ul class="viñetas">';
      for (const l of ficha.mayores.slice(0, 6)) {
        html += `<li><strong>${esc(fmtEuro(l.importe))}</strong> — ${esc(l.nombre || l.cif || 'tercero no identificado')}` +
          (l.concepto ? `<br><span class="norma">${esc(l.concepto.slice(0, 150))}</span>` : '') +
          (l.aplicacion ? ` <span class="norma">· ${esc(l.aplicacion)}</span>` : '') + '</li>';
      }
      html += '</ul>';
    }
  } else if (ficha.proveedores?.length) {
    html += '<h4 class="subtitulo">Terceros identificados</h4><ul class="viñetas">';
    for (const p of ficha.proveedores) {
      html += `<li>${esc(p.nombre)}${p.cif ? ` <span class="norma">${esc(p.cif)}</span>` : ''}</li>`;
    }
    html += '</ul>';
  }

  if (ficha.reparo?.hayReparo) {
    html += '<h4 class="subtitulo">Reparo de Intervención</h4><ul class="viñetas">';
    if (ficha.reparo.levantado) {
      html += `<li>Solventado por Alcaldía (art. 217 TRLRHL)${ficha.reparo.aFavorDe ? ` a favor de ${esc(ficha.reparo.aFavorDe)}` : ''}</li>`;
    }
    if (ficha.reparo.fiscalizacionDesfavorable) html += '<li>Resultado de la fiscalización: desfavorable</li>';
    if (ficha.reparo.debeIrAlPleno) html += '<li>Debe darse cuenta al Pleno (art. 218 TRLRHL)</li>';
    if (ficha.reparo.debeIrAlTribunalDeCuentas) html += '<li>Debe remitirse al Tribunal de Cuentas</li>';
    for (const m of ficha.reparo.motivos || []) {
      html += `<li>${esc(m.etiqueta)} <span class="norma">— ${esc(m.norma)}</span></li>`;
    }
    html += '</ul>';
  }

  if (ficha.sentencias?.length) {
    html += '<h4 class="subtitulo">Sentencias firmes citadas</h4><ul class="viñetas">';
    for (const s of ficha.sentencias) {
      html += `<li>Sentencia nº ${esc(s.referencia)} — ${esc(fmtEuro(s.importe))}</li>`;
    }
    html += '</ul>';
  }

  const faltan = datosNoIncluidos(ficha);
  if (faltan.length) {
    html += '<div class="ausentes"><strong>Datos no incluidos en el decreto</strong><ul>';
    for (const d of faltan) html += `<li>${esc(d)}</li>`;
    html += '</ul></div>';
  }

  return html;
}

/* ─────────────── lectura de oposición ─────────────── */

function pintarLectura(ficha, alertas, lectura, aviso) {
  let html = '';

  for (const a of (aviso?.avisos || [])) {
    html += `<div class="cautela"><span class="cautela__marca">DATOS</span><span>${esc(a)}</span></div>`;
  }
  for (const c of (lectura.cautelas || [])) {
    html += `<div class="cautela"><span class="cautela__marca">!</span><span>${esc(c)}</span></div>`;
  }

  html += '<div class="resumen-lectura">';
  for (const l of lectura.lineas) html += `<p>${esc(l)}</p>`;
  html += '</div>';

  if (!alertas.length) return html;

  for (const a of alertas) {
    html += `<div class="alerta" data-sev="${a.severidad}">
      <div class="alerta__cabeza">
        <span class="alerta__codigo">${esc(a.id)}</span>
        <span class="alerta__titulo">${esc(a.titulo)}</span>
      </div>
      <p class="alerta__detalle">${esc(a.detalle)}</p>`;

    const campos = [
      ['Norma', a.norma], ['Pregunta', a.pregunta],
      ['Réplica', a.replica], ['Propuesta', a.propuesta],
    ].filter(([, v]) => v);

    if (campos.length) {
      html += '<div class="alerta__campos">';
      for (const [k, v] of campos) {
        html += `<span class="alerta__etiqueta">${esc(k)}</span><span>${esc(v)}</span>`;
      }
      html += '</div>';
    }

    if (a.dobleFilo) {
      html += `<div class="doblefilo"><strong>Doble filo.</strong> Este hecho se produce también bajo mandatos anteriores. Comprueba la serie completa antes de usarlo en público.</div>`;
    }
    html += '</div>';
  }

  return html;
}

/* ─────────────── tarjeta ─────────────── */

function pintarTarjeta(id, { ficha, alertas, lectura, aviso }) {
  const max = severidadMaxima(alertas);
  const art = document.createElement('article');
  art.className = 'decreto';
  art.dataset.max = max;
  art.dataset.id = id;

  const tira = [
    ficha.expediente ? `EXP <b>${esc(ficha.expediente)}</b>` : null,
    ficha.fecha ? `<b>${esc(ficha.fecha)}</b>` : 'SIN FECHA',
    ficha.mandato?.etiqueta ? esc(ficha.mandato.etiqueta) : null,
    ficha.importeTotal != null ? `<b>${esc(fmtEuro(ficha.importeTotal))}</b>` : null,
    ficha.nFacturas ? `${ficha.nFacturas} facturas · ${ficha.porTercero.length} terceros` : null,
    aviso?.riesgo === 'alto' ? `<span class="tira__aviso">DATOS SENSIBLES</span>` : null,
  ].filter(Boolean).join('</span><span>');

  art.innerHTML = `
    <div class="decreto__cabeza">
      <span class="decreto__id">${esc(ficha.decreto || 's/n')}</span>
      <div class="decreto__texto">
        <p class="decreto__tipo">${esc(ficha.tipoNombre)}</p>
        <p class="decreto__objeto">${esc(ficha.objeto || ficha.archivo)}</p>
      </div>
      <span class="sello sello--${max}">${esc(ETIQUETA_SELLO[max])}</span>
    </div>

    <div class="tira"><span>${tira}</span></div>

    <div class="pestanas" role="tablist">
      <button class="pestana" role="tab" aria-selected="true"  data-panel="ficha">Ficha técnica</button>
      <button class="pestana" role="tab" aria-selected="false" data-panel="lectura">Lectura de oposición${alertas.length ? ` (${alertas.length})` : ''}</button>
    </div>

    <div class="panel" data-panel="ficha">${pintarFicha(ficha)}
      <div class="acciones">
        <button class="boton" data-accion="descargar-ficha">Descargar ficha (Markdown)</button>
        <button class="boton" data-accion="descargar-ficha-docx">Descargar ficha (Word)</button>
      </div>
    </div>

    <div class="panel" data-panel="lectura" hidden>${pintarLectura(ficha, alertas, lectura, aviso)}
      <p class="norma">Este hallazgo entra en el informe consolidado — no hace falta descargarlo aparte.</p>
    </div>`;

  art.addEventListener('click', (ev) => {
    const pestana = ev.target.closest('.pestana');
    if (pestana) {
      for (const b of art.querySelectorAll('.pestana')) {
        b.setAttribute('aria-selected', String(b === pestana));
      }
      for (const p of art.querySelectorAll('.panel')) {
        p.hidden = p.dataset.panel !== pestana.dataset.panel;
      }
      return;
    }
    const accion = ev.target.closest('[data-accion]')?.dataset.accion;
    if (accion === 'descargar-ficha') {
      descargar(nombreArchivo(ficha, 'ficha'), fichaMarkdown(ficha));
    } else if (accion === 'descargar-ficha-docx') {
      descargarFichaDocx(ficha, ev.target.closest('[data-accion]'));
    }
  });

  return art;
}

/* ─────────────── procesamiento ─────────────── */

async function procesar(archivos) {
  const lista = [...archivos].filter(f => /\.(pdf|docx|txt)$/i.test(f.name));
  if (!lista.length) {
    mostrarEstado('Ninguno de esos archivos es un PDF, DOCX o TXT.', 'error');
    return;
  }

  $('#vacio').hidden = true;
  const nuevas = [];
  let fallos = 0;

  for (let i = 0; i < lista.length; i++) {
    const archivo = lista[i];
    mostrarEstado(`Analizando ${i + 1} de ${lista.length} — ${archivo.name}`);
    try {
      const { texto, escaneado } = await extraerTexto(archivo);

      if (escaneado || texto.length < 200) {
        throw new Error('El documento no contiene texto legible. Probablemente sea un PDF escaneado sin OCR.');
      }

      // Prescan: identificar quién factura ANTES de anonimizar. Muchos
      // proveedores del Ayuntamiento son autónomos, y borrar su nombre
      // dejaría sin datos justamente el análisis de repeticiones.
      const proveedores = terceros(extraerLineas(texto));
      const aviso = anonimizar(texto, { permitir: proveedores });
      const ficha = analizar(aviso.textoAnonimo, archivo.name);
      const alertas = evaluarDecreto(ficha);
      const lectura = lecturaOposicion(ficha, alertas);

      const id = `d${++contador}`;
      const entrada = { ficha, alertas, lectura, aviso };
      sesion.set(id, entrada);
      nuevas.push(ficha);

      $('#lista').prepend(pintarTarjeta(id, entrada));
    } catch (err) {
      fallos++;
      const art = document.createElement('article');
      art.className = 'decreto';
      art.dataset.max = 'ninguna';
      art.innerHTML = `
        <div class="decreto__cabeza">
          <span class="decreto__id">—</span>
          <div class="decreto__texto">
            <p class="decreto__tipo">No se ha podido analizar</p>
            <p class="decreto__objeto">${esc(archivo.name)}</p>
          </div>
          <span class="sello sello--ninguna">Sin leer</span>
        </div>
        <div class="panel"><p class="alerta__detalle">${esc(err.message)}</p></div>`;
      $('#lista').prepend(art);
    }
  }

  try {
    await registro.guardarVarias(nuevas);
  } catch (err) {
    mostrarEstado('Los decretos se han analizado, pero no se han podido guardar en el registro local: ' + err.message, 'error');
    return;
  }

  await refrescarRegistro();
  if (fallos) {
    mostrarEstado(`${nuevas.length} decreto(s) analizados. ${fallos} no se han podido leer.`, 'error');
  } else {
    ocultarEstado();
  }
}

/* ─────────────── registro y patrones ─────────────── */

async function refrescarRegistro() {
  const r = await registro.resumen();
  $('#barraRegistro').innerHTML = `Registro local: <strong>${r.total}</strong> decretos`;

  if (!r.total) {
    $('#panelRegistro').innerHTML = '<p class="nota-privacidad">Sin decretos guardados todavía.</p>';
    return;
  }

  let html = `
    <div class="cifra"><span>Decretos</span><b>${r.total}</b></div>
    <div class="cifra"><span>Con reparo</span><b>${r.conReparo}</b></div>
    <div class="cifra"><span>Facturas leídas</span><b>${r.facturas}</b></div>
    <div class="cifra"><span>Importe acumulado</span><b>${fmtEuro(r.importeAcumulado)}</b></div>`;
  if (r.desde) html += `<div class="cifra"><span>Periodo</span><b>${r.desde} → ${r.hasta}</b></div>`;
  html += '<h3 class="bloque__titulo" style="margin-top:14px">Por mandato</h3>';
  for (const [k, v] of Object.entries(r.porMandato)) {
    html += `<div class="cifra"><span>${esc(k)}</span><b>${v}</b></div>`;
  }

  // El registro vive solo en este navegador. Si trabajas también desde otro
  // ordenador, esto es lo único que te avisa de que hay decretos aquí que
  // todavía no has llevado al otro sitio.
  const pendientes = await registro.pendientesDeCopia();
  if (pendientes > 0) {
    html += `<div class="cautela"><span class="cautela__marca">!</span><span>${pendientes} decreto(s) sin copia de seguridad. Si usas también otro ordenador, exporta antes de cambiar de equipo.</span></div>`;
  }

  $('#panelRegistro').innerHTML = html;
}

async function mostrarInformeConsolidado() {
  const todas = await registro.listar();
  if (!todas.length) {
    mostrarEstado('Todavía no hay decretos en el registro. Sube alguno primero.', 'error');
    return;
  }

  // El registro guarda datos estructurados, no el texto íntegro (ver registry.js):
  // las alertas se recalculan aquí a partir de esos datos. Así el informe
  // refleja SIEMPRE todo lo acumulado, no solo lo subido en esta sesión —
  // subir tres decretos hoy y cinco la semana pasada da un único informe con
  // los ocho, no dos documentos sueltos.
  const entradas = todas.map(ficha => ({ ficha, alertas: evaluarDecreto(ficha) }));
  const patrones = todas.length >= 3 ? evaluarPatrones(todas) : [];
  const r = await registro.resumen();
  const totalAlertas = entradas.reduce((a, e) => a + e.alertas.length, 0);

  const art = document.createElement('article');
  art.className = 'decreto';
  const hayAlta = entradas.some(e => e.alertas.some(a => a.severidad === 'alta')) || patrones.some(p => p.severidad === 'alta');
  art.dataset.max = hayAlta ? 'alta' : 'informativa';

  let cuerpo = '';

  if (todas.length < 3) {
    cuerpo += `<p class="norma">Con menos de 3 decretos en el registro no se buscan patrones de serie todavía — solo los hallazgos de cada decreto por separado. Sigue añadiendo para que aparezcan proveedores recurrentes y motivos repetidos.</p>`;
  }

  if (patrones.length) {
    cuerpo += '<h4 class="subtitulo">Patrones de la serie completa</h4>';
    for (const p of patrones) {
      cuerpo += `<div class="alerta" data-sev="${p.severidad}">
        <div class="alerta__cabeza">
          <span class="alerta__codigo">${esc(p.id)}</span>
          <span class="alerta__titulo">${esc(p.titulo)}</span>
        </div>
        <p class="alerta__detalle">${esc(p.detalle)}</p>`;
      const campos = [['Norma', p.norma], ['Pregunta', p.pregunta], ['Propuesta', p.propuesta], ['Nota', p.nota]]
        .filter(([, v]) => v);
      if (campos.length) {
        cuerpo += '<div class="alerta__campos">';
        for (const [k, v] of campos) cuerpo += `<span class="alerta__etiqueta">${esc(k)}</span><span>${esc(v)}</span>`;
        cuerpo += '</div>';
      }
      if (p.aviso) cuerpo += `<div class="doblefilo"><strong>Aviso.</strong> ${esc(p.aviso)}</div>`;
      if (p.referencias?.length) {
        cuerpo += `<div class="alerta__campos"><span class="alerta__etiqueta">Decretos</span><span class="dato">${esc(p.referencias.join(', '))}</span></div>`;
      }
      cuerpo += '</div>';
    }
  }

  cuerpo += `<h4 class="subtitulo">Hallazgos por decreto — ${totalAlertas} en total</h4>`;
  if (!totalAlertas) {
    cuerpo += '<p class="norma">Ningún decreto del registro tiene hallazgos que señalar.</p>';
  } else {
    const orden = { alta: 0, media: 1, baja: 2, informativa: 3 };
    const filas = entradas.flatMap(({ ficha, alertas }) =>
      alertas.map(a => ({ ficha, alerta: a })));
    filas.sort((a, b) => orden[a.alerta.severidad] - orden[b.alerta.severidad]);
    for (const { ficha, alerta: a } of filas.slice(0, 25)) {
      const ref = ficha.decreto || ficha.expediente || ficha.archivo || 's/n';
      cuerpo += `<div class="alerta" data-sev="${a.severidad}">
        <div class="alerta__cabeza">
          <span class="alerta__codigo">[Decreto ${esc(ref)}]</span>
          <span class="alerta__titulo">${esc(a.titulo)}${a.dobleFilo ? ' ⚠︎' : ''}</span>
        </div>
        <p class="alerta__detalle">${esc(a.detalle)}</p>
      </div>`;
    }
    if (filas.length > 25) {
      cuerpo += `<p class="norma">y ${filas.length - 25} hallazgo(s) más — están todos en el documento descargado.</p>`;
    }
  }

  art.innerHTML = `
    <div class="decreto__cabeza">
      <span class="decreto__id">INFORME</span>
      <div class="decreto__texto">
        <p class="decreto__tipo">Consolidado de todo el registro</p>
        <p class="decreto__objeto">${todas.length} decretos · ${totalAlertas} hallazgo(s) · ${patrones.length} patrón(es)</p>
      </div>
      <span class="sello sello--${hayAlta ? 'alta' : 'informativa'}">Criterio editorial</span>
    </div>
    <div class="panel">${cuerpo}
      <div class="acciones">
        <button class="boton boton--principal" data-accion="descargar-consolidado">Descargar informe consolidado (Markdown)</button>
        <button class="boton" data-accion="descargar-consolidado-docx">Descargar informe consolidado (Word)</button>
      </div>
    </div>`;

  art.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-accion="descargar-consolidado"]')) {
      descargar(`informe_consolidado_${new Date().toISOString().slice(0, 10)}.md`,
        informeConsolidadoMarkdown(entradas, patrones, r));
    } else if (ev.target.closest('[data-accion="descargar-consolidado-docx"]')) {
      conBotonOcupado(ev.target.closest('[data-accion]'), 'Generando…', async () => {
        const { informeConsolidadoDocxBlob } = await cargarExportDocx();
        descargar(`informe_consolidado_${new Date().toISOString().slice(0, 10)}.docx`,
          await informeConsolidadoDocxBlob(entradas, patrones, r),
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      });
    }
  });

  $('#vacio').hidden = true;
  $('#lista').prepend(art);
  ocultarEstado();
}

/* ─────────────── resumen completo de un lote (Word, uso interno) ─────────────── */

let archivosLote = null;

function mostrarEstadoLote(texto, tipo = 'trabajando') {
  const el = $('#estadoLote');
  el.textContent = texto;
  el.className = `estado estado--${tipo}`;
  el.hidden = false;
}
const ocultarEstadoLote = () => { $('#estadoLote').hidden = true; };

/**
 * Procesa un lote completo para el resumen en Word — un flujo aparte de
 * procesar(), efímero: NO guarda nada en el registro acumulado (registry.js).
 * Es deliberado: con la casilla "sin anonimizar" marcada se generarían
 * fichas con datos personales reales, y esos no deben mezclarse nunca con el
 * registro persistente que alimenta el informe consolidado.
 */
async function generarResumenLote(archivos, sinAnonimizar, boton) {
  const lista = [...archivos].filter(f => /\.(pdf|docx|txt)$/i.test(f.name));
  if (!lista.length) {
    mostrarEstadoLote('Ninguno de esos archivos es un PDF, DOCX o TXT.', 'error');
    return;
  }

  const original = boton.textContent;
  boton.disabled = true;
  try {
    const elementos = [];
    for (let i = 0; i < lista.length; i++) {
      const archivo = lista[i];
      boton.textContent = `Analizando ${i + 1}/${lista.length}…`;
      mostrarEstadoLote(`Analizando ${i + 1} de ${lista.length} — ${archivo.name}`);
      try {
        const { texto, escaneado } = await extraerTexto(archivo);
        if (escaneado || texto.length < 200) {
          throw new Error('PDF sin texto legible (posible escaneo)');
        }
        const proveedores = terceros(extraerLineas(texto));
        const anon = anonimizar(texto, { permitir: proveedores });
        const ficha = analizar(sinAnonimizar ? texto : anon.textoAnonimo, archivo.name);
        elementos.push({ archivo: archivo.name, ficha });
      } catch (err) {
        elementos.push({ archivo: archivo.name, error: err.message });
      }
    }

    boton.textContent = 'Generando Word…';
    mostrarEstadoLote('Generando el documento Word…');
    const { resumenFichasDocxBlob } = await cargarExportDocx();
    const blob = await resumenFichasDocxBlob(elementos, { anonimo: !sinAnonimizar });
    const fecha = new Date().toISOString().slice(0, 10);
    descargar(`resumen_decretos_${fecha}${sinAnonimizar ? '_sin_anonimizar' : ''}.docx`, blob,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    const conFicha = elementos.filter(e => e.ficha).length;
    mostrarEstadoLote(
      `Listo: ${elementos.length} archivo(s) recibido(s), ${conFicha} con ficha, ${elementos.length - conFicha} sin leer.`);
    setTimeout(ocultarEstadoLote, 8000);
  } catch (err) {
    mostrarEstadoLote('No se ha podido generar el resumen: ' + err.message, 'error');
  } finally {
    boton.disabled = false;
    boton.textContent = original;
  }
}

/* ─────────────── enlaces de la interfaz ─────────────── */

function iniciar() {
  const zona = $('#zonaSoltar');
  const entrada = $('#entradaArchivos');

  zona.addEventListener('click', () => entrada.click());
  zona.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrada.click(); }
  });
  entrada.addEventListener('change', () => { procesar(entrada.files); entrada.value = ''; });

  for (const ev of ['dragenter', 'dragover']) {
    zona.addEventListener(ev, (e) => { e.preventDefault(); zona.dataset.activo = 'true'; });
  }
  for (const ev of ['dragleave', 'drop']) {
    zona.addEventListener(ev, (e) => { e.preventDefault(); zona.dataset.activo = 'false'; });
  }
  zona.addEventListener('drop', (e) => procesar(e.dataTransfer.files));

  // El navegador abre el archivo si se suelta fuera de la zona: evitarlo.
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  $('#btnPatrones').addEventListener('click', mostrarInformeConsolidado);

  $('#btnExportarRegistro').addEventListener('click', async () => {
    descargar(`registro_fiscaliza_${new Date().toISOString().slice(0, 10)}.json`,
      await registro.exportarJson(), 'application/json');
    registro.marcarCopiaHecha();
    await refrescarRegistro();
  });

  $('#btnImportarRegistro').addEventListener('click', () => $('#entradaRegistro').click());
  $('#entradaRegistro').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      // Se combina con lo que ya hay en este navegador, no lo sustituye: así
      // se puede traer aquí lo analizado en otro ordenador sin perder nada.
      const r = await registro.importarJson(await f.text());
      await refrescarRegistro();
      mostrarEstado(
        r.nuevos > 0
          ? `${r.nuevos} decreto(s) nuevo(s) añadidos al registro${r.actualizados ? ` (${r.actualizados} ya existían y se han actualizado)` : ''}.`
          : `Nada nuevo que añadir: los ${r.actualizados} decretos del archivo ya estaban en este registro.`
      );
      setTimeout(ocultarEstado, 4000);
    } catch (err) {
      mostrarEstado('No se ha podido restaurar: ' + err.message, 'error');
    }
    e.target.value = '';
  });

  $('#btnBorrarRegistro').addEventListener('click', async () => {
    if (!confirm('Se borrarán todas las fichas guardadas en este navegador. No hay copia en ningún otro sitio. ¿Continuar?')) return;
    await registro.borrarTodo();
    await refrescarRegistro();
    mostrarEstado('Registro borrado.');
    setTimeout(ocultarEstado, 2500);
  });

  refrescarRegistro().catch(() => {
    mostrarEstado('No se ha podido abrir el registro local. Si estás en modo incógnito, el historial no se guardará.', 'error');
  });

  const entradaLote = $('#entradaLote');
  const btnSeleccionarLote = $('#btnSeleccionarLote');
  const btnResumenLote = $('#btnResumenLote');

  btnSeleccionarLote.addEventListener('click', () => entradaLote.click());
  entradaLote.addEventListener('change', () => {
    archivosLote = entradaLote.files.length ? entradaLote.files : null;
    btnResumenLote.disabled = !archivosLote;
    btnSeleccionarLote.textContent = archivosLote
      ? `${archivosLote.length} archivo(s) seleccionados — cambiar`
      : 'Seleccionar archivos del lote';
  });
  btnResumenLote.addEventListener('click', () => {
    if (!archivosLote) return;
    generarResumenLote(archivosLote, $('#chkSinAnonimizar').checked, btnResumenLote);
  });
}

iniciar();
