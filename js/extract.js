/**
 * extract.js — PDF/DOCX → texto plano. Todo en el navegador.
 *
 * Ni un byte del documento sale del equipo. pdf.js y mammoth se cargan como
 * librerías estáticas; procesan el ArrayBuffer en memoria local.
 */

import { MUNICIPIO } from './config.js';

const PDFJS_SRC = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
const MAMMOTH_SRC = 'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js';

let pdfjsLib = null;
let mammothReady = null;

async function cargarPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import(/* @vite-ignore */ PDFJS_SRC);
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return pdfjsLib;
}

function cargarMammoth() {
  if (mammothReady) return mammothReady;
  mammothReady = new Promise((resolve, reject) => {
    if (window.mammoth) return resolve(window.mammoth);
    const s = document.createElement('script');
    s.src = MAMMOTH_SRC;
    s.onload = () => resolve(window.mammoth);
    s.onerror = () => reject(new Error('No se pudo cargar el lector de Word.'));
    document.head.appendChild(s);
  });
  return mammothReady;
}

/**
 * Reconstruye líneas a partir de los items de texto de pdf.js.
 * pdf.js devuelve fragmentos sueltos con coordenadas; sin reagrupar por
 * posición vertical, las tablas de los decretos de pagos se convierten en
 * papilla y los importes se despegan de su proveedor.
 */
function itemsALineas(items) {
  const filas = new Map();
  for (const it of items) {
    if (!it.str || !it.str.trim()) continue;
    const y = Math.round(it.transform[5]);          // posición vertical
    const clave = Math.round(y / 3) * 3;            // tolerancia de 3pt
    if (!filas.has(clave)) filas.set(clave, []);
    filas.get(clave).push({ x: it.transform[4], s: it.str });
  }
  return [...filas.entries()]
    .sort((a, b) => b[0] - a[0])                    // de arriba a abajo
    .map(([, frags]) =>
      frags.sort((a, b) => a.x - b.x).map(f => f.s).join(' ').replace(/\s+/g, ' ').trim()
    )
    .filter(Boolean);
}

async function textoDePdf(buffer) {
  const pdfjs = await cargarPdfJs();
  const doc = await pdfjs.getDocument({ data: buffer, useSystemFonts: true }).promise;
  const paginas = [];
  let caracteres = 0;

  for (let n = 1; n <= doc.numPages; n++) {
    const pagina = await doc.getPage(n);
    const contenido = await pagina.getTextContent();
    const lineas = itemsALineas(contenido.items);
    caracteres += lineas.join('').length;
    paginas.push(lineas.join('\n'));
  }

  // Heurística de PDF escaneado: muchas páginas, casi ningún carácter.
  const escaneado = caracteres < doc.numPages * 120;
  return { texto: paginas.join('\n\n'), paginas: doc.numPages, escaneado };
}

async function textoDeDocx(buffer) {
  const mammoth = await cargarMammoth();
  const r = await mammoth.extractRawText({ arrayBuffer: buffer });
  return { texto: r.value, paginas: null, escaneado: false };
}

/** Quita pies institucionales y códigos de validación repetidos en cada página. */
function limpiar(texto) {
  return texto
    .replace(MUNICIPIO.pieInstitucional, ' ')
    .replace(/C[óo]d\.\s*Validaci[óo]n:\s*\S+/gi, ' ')
    .replace(/Verificaci[óo]n:\s*https?:\/\/\S+/gi, ' ')
    .replace(/Documento firmado electr[óo]nicamente desde la plataforma \S+/gi, ' ')
    .replace(/P[áa]gina \d+ de \d+/gi, ' ')
    .replace(/Plaza de España, 2[^\n]{0,80}/gi, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * @param {File} file
 * @returns {Promise<{texto:string, paginas:number|null, escaneado:boolean, nombre:string}>}
 */
export async function extraerTexto(file) {
  const buffer = await file.arrayBuffer();
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  let bruto;
  if (ext === 'pdf') bruto = await textoDePdf(buffer);
  else if (ext === 'docx') bruto = await textoDeDocx(buffer);
  else if (ext === 'txt') bruto = { texto: new TextDecoder().decode(buffer), paginas: null, escaneado: false };
  else throw new Error(`Formato no admitido: .${ext}. Usa PDF, DOCX o TXT.`);

  return { ...bruto, texto: limpiar(bruto.texto), nombre: file.name };
}
