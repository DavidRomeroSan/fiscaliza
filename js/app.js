/**
 * app.js — Orquestación e interfaz.
 *
 * Flujo, deliberadamente en dos pasos: subir archivos, generar y descargar
 * el resumen en Word. Nada se guarda entre sesiones ni se persiste en este
 * navegador — cada vez que se genera el resumen se parte de cero.
 *
 * Por archivo: extraer texto (local) → anonimizar (local, salvo que la
 * casilla diga lo contrario) → clasificar y extraer campos → volcar al Word.
 * El texto íntegro nunca se persiste: vive en memoria mientras dura la carga.
 */

import { extraerTexto } from './extract.js';
import { anonimizar } from './redact.js';
import { extraerLineas, terceros } from './lineas.js';
import { analizar } from './parse.js';
import { descargar } from './export.js';

// La librería docx (y su descarga desde CDN) solo se carga la primera vez
// que alguien pide de verdad el Word — nunca al abrir la aplicación.
let exportDocxMod = null;
async function cargarExportDocx() {
  if (!exportDocxMod) exportDocxMod = await import('./exportDocx.js');
  return exportDocxMod;
}

const $ = (sel) => document.querySelector(sel);
let archivosSeleccionados = null;

function mostrarEstado(texto, tipo = 'trabajando') {
  const el = $('#estado');
  el.textContent = texto;
  el.className = `estado estado--${tipo}`;
  el.hidden = false;
}
const ocultarEstado = () => { $('#estado').hidden = true; };

/**
 * Genera el resumen en Word de todos los archivos subidos. Efímero: no
 * guarda nada entre sesiones — con la casilla marcada se generan fichas con
 * datos personales reales, y no deben persistir en ningún sitio más que en
 * el documento que se descarga.
 */
async function generarResumen(archivos, sinAnonimizar, boton) {
  const lista = [...archivos].filter(f => /\.(pdf|docx|txt)$/i.test(f.name));
  if (!lista.length) {
    mostrarEstado('Ninguno de esos archivos es un PDF, DOCX o TXT.', 'error');
    return;
  }

  const original = boton.textContent;
  boton.disabled = true;
  try {
    const elementos = [];
    for (let i = 0; i < lista.length; i++) {
      const archivo = lista[i];
      boton.textContent = `Analizando ${i + 1}/${lista.length}…`;
      mostrarEstado(`Analizando ${i + 1} de ${lista.length} — ${archivo.name}`);
      try {
        const { texto, escaneado } = await extraerTexto(archivo);
        if (escaneado || texto.length < 200) {
          throw new Error('PDF sin texto legible (posible escaneo)');
        }
        // Prescan: identificar quién factura ANTES de anonimizar. Muchos
        // proveedores del Ayuntamiento son autónomos, y borrar su nombre
        // dejaría sin datos justamente el análisis de repeticiones.
        const proveedores = terceros(extraerLineas(texto));
        const anon = anonimizar(texto, { permitir: proveedores });
        const ficha = analizar(sinAnonimizar ? texto : anon.textoAnonimo, archivo.name);
        elementos.push({ archivo: archivo.name, ficha });
      } catch (err) {
        elementos.push({ archivo: archivo.name, error: err.message });
      }
    }

    boton.textContent = 'Generando Word…';
    mostrarEstado('Generando el documento Word…');
    const { resumenFichasDocxBlob } = await cargarExportDocx();
    const blob = await resumenFichasDocxBlob(elementos, { anonimo: !sinAnonimizar });
    const fecha = new Date().toISOString().slice(0, 10);
    descargar(`resumen_decretos_${fecha}${sinAnonimizar ? '_sin_anonimizar' : ''}.docx`, blob,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    const conFicha = elementos.filter(e => e.ficha).length;
    mostrarEstado(
      `Listo: ${elementos.length} archivo(s) recibido(s), ${conFicha} con ficha, ${elementos.length - conFicha} sin leer.`);
    setTimeout(ocultarEstado, 8000);
  } catch (err) {
    mostrarEstado('No se ha podido generar el resumen: ' + err.message, 'error');
  } finally {
    boton.disabled = false;
    boton.textContent = original;
  }
}

/* ─────────────── enlaces de la interfaz ─────────────── */

function iniciar() {
  const zona = $('#zonaSoltar');
  const entrada = $('#entradaArchivos');
  const btnGenerar = $('#btnGenerarResumen');

  const seleccionar = (archivos) => {
    archivosSeleccionados = archivos.length ? archivos : null;
    btnGenerar.disabled = !archivosSeleccionados;
    mostrarEstado(
      archivosSeleccionados
        ? `${archivosSeleccionados.length} archivo(s) seleccionados — listo para generar el resumen.`
        : 'Ningún archivo seleccionado.',
      archivosSeleccionados ? 'trabajando' : 'error'
    );
  };

  zona.addEventListener('click', () => entrada.click());
  zona.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrada.click(); }
  });
  entrada.addEventListener('change', () => seleccionar(entrada.files));

  for (const ev of ['dragenter', 'dragover']) {
    zona.addEventListener(ev, (e) => { e.preventDefault(); zona.dataset.activo = 'true'; });
  }
  for (const ev of ['dragleave', 'drop']) {
    zona.addEventListener(ev, (e) => { e.preventDefault(); zona.dataset.activo = 'false'; });
  }
  zona.addEventListener('drop', (e) => seleccionar(e.dataTransfer.files));

  // El navegador abre el archivo si se suelta fuera de la zona: evitarlo.
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  btnGenerar.addEventListener('click', () => {
    if (!archivosSeleccionados) return;
    generarResumen(archivosSeleccionados, $('#chkSinAnonimizar').checked, btnGenerar);
  });
}

iniciar();
