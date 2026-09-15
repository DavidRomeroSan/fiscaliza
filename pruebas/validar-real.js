/**
 * validar-real.js — Ejecuta el motor real (el mismo extract.js/parse.js/
 * lineas.js/redact.js/rules.js que usa la app en el navegador) contra una
 * carpeta de decretos reales en PDF, fuera del navegador, para poder
 * validar a escala sin subirlos uno a uno por la interfaz.
 *
 * Reimplementa la extracción de texto de extract.js con pdfjs-dist en Node
 * (misma versión pinchada en extract.js, mismo algoritmo de reconstrucción
 * de líneas por posición) para que el resultado sea fiel a lo que vería
 * un concejal subiendo el mismo PDF en su navegador — no una extracción de
 * texto genérica que podría dar un resultado distinto.
 *
 * USO: node pruebas/validar-real.js [carpeta] [--sin-anonimizar]
 * Por defecto usa ./Decretos (gitignored: nunca debe entrar en el repo).
 *
 * --sin-anonimizar salta el paso de redact.js: analiza el texto tal cual,
 * con nombres y DNI de particulares visibles. Pensado solo para generar el
 * documento de trabajo interno del grupo (resumen_fichas.docx) — nunca para
 * el informe consolidado ni para nada que vaya a salir del grupo municipal.
 *
 * No escribe el texto íntegro de ningún decreto a disco: solo genera un
 * resumen estructurado (igual que registry.js) y avisos legibles.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2).filter(a => a !== '--sin-anonimizar');
const carpeta = args[0] || join(__dirname, '..', 'Decretos');
const sinAnonimizar = process.argv.includes('--sin-anonimizar');

const pdfjs = await import('../node_modules/pdfjs-dist/legacy/build/pdf.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = join(__dirname, '..', 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');

import { MUNICIPIO } from '../js/config.js';
import { anonimizar } from '../js/redact.js';
import { extraerLineas, terceros } from '../js/lineas.js';
import { analizar, datosNoIncluidos, fmtEuro } from '../js/parse.js';
import { evaluarDecreto, evaluarPatrones } from '../js/rules.js';
import { informeConsolidadoMarkdown, resumenFichasMarkdown } from '../js/export.js';
import { resumenFichasDocxBlob } from '../js/exportDocx.js';

/* ─────────── misma reconstrucción de líneas que extract.js ─────────── */

function itemsALineas(items) {
  const filas = new Map();
  for (const it of items) {
    if (!it.str || !it.str.trim()) continue;
    const y = Math.round(it.transform[5]);
    const clave = Math.round(y / 3) * 3;
    if (!filas.has(clave)) filas.set(clave, []);
    filas.get(clave).push({ x: it.transform[4], s: it.str });
  }
  return [...filas.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, frags]) => frags.sort((a, b) => a.x - b.x).map(f => f.s).join(' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function limpiar(texto) {
  return texto
    .replace(MUNICIPIO.pieInstitucional, ' ')
    .replace(/C[óo]d\.\s*Validaci[óo]n:\s*\S+/gi, ' ')
    .replace(/Verificaci[óo]n:\s*https?:\/\/\S+/gi, ' ')
    .replace(/Documento firmado electr[óo]nicamente desde la plataforma \S+(?:\s+Gestiona\b)?/gi, ' ')
    .replace(/P[áa]gina \d+ de \d+/gi, ' ')
    .replace(/Plaza de España, 2[^\n]{0,80}/gi, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function textoDePdf(buffer) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true, isEvalSupported: false }).promise;
  const paginas = [];
  let caracteres = 0;
  for (let n = 1; n <= doc.numPages; n++) {
    const pagina = await doc.getPage(n);
    const contenido = await pagina.getTextContent();
    const lineas = itemsALineas(contenido.items);
    caracteres += lineas.join('').length;
    paginas.push(lineas.join('\n'));
  }
  const escaneado = caracteres < doc.numPages * 120;
  return { texto: limpiar(paginas.join('\n\n')), paginas: doc.numPages, escaneado };
}

/* ─────────── recorrido de la carpeta ─────────── */

const archivos = readdirSync(carpeta).filter(f => /\.pdf$/i.test(f)).sort();
console.log(`Encontrados ${archivos.length} PDF en ${carpeta}\n`);

const fichas = [];
const entradas = []; // { ficha, alertas } — lo que pide informeConsolidadoMarkdown
const fallos = [];
const avisos = []; // { archivo, tipo de aviso, detalle } — para revisar a mano
// Un elemento por archivo subido, EN ORDEN, éxito o fallo — es la cobertura
// que pide resumenFichasMarkdown: se cuenta por archivo, no por número de
// decreto (que no siempre es correlativo y no sirve para saber si falta uno).
const elementosPorArchivo = [];

for (const nombre of archivos) {
  const ruta = join(carpeta, nombre);
  try {
    const buffer = readFileSync(ruta);
    const { texto, paginas, escaneado } = await textoDePdf(buffer);

    if (escaneado || texto.length < 200) {
      const motivo = 'PDF sin texto legible (posible escaneo)';
      fallos.push({ archivo: nombre, motivo });
      elementosPorArchivo.push({ archivo: nombre, error: motivo });
      continue;
    }

    const proveedores = terceros(extraerLineas(texto));
    const anon = anonimizar(texto, { permitir: proveedores });
    const ficha = analizar(sinAnonimizar ? texto : anon.textoAnonimo, nombre);
    const alertas = evaluarDecreto(ficha);
    fichas.push(ficha);
    entradas.push({ ficha, alertas });
    elementosPorArchivo.push({ archivo: nombre, ficha });

    // Señales de alerta sobre la PROPIA extracción, no sobre el Ayuntamiento:
    // esto es lo que hay que revisar a mano contra el PDF original.
    if (!ficha.decreto) avisos.push({ archivo: nombre, aviso: 'sin número de decreto detectado' });
    if (!ficha.fecha) avisos.push({ archivo: nombre, aviso: 'sin fecha detectada' });
    if (!ficha.firmante) avisos.push({ archivo: nombre, aviso: 'sin firmante detectado' });
    if (ficha.mandato.confianza === 'nula') avisos.push({ archivo: nombre, aviso: 'mandato: confianza NULA' });
    if (ficha.mandato.confianza === 'revisar') avisos.push({ archivo: nombre, aviso: `mandato: confianza A REVISAR — ${ficha.mandato.nota}` });
    if (ficha.cuadra === false) avisos.push({ archivo: nombre, aviso: `F04: la suma de líneas (${fmtEuro(ficha.sumaLineas)}) no cuadra con el total (${fmtEuro(ficha.importeTotal)})` });
    if (ficha.importeTotal == null) avisos.push({ archivo: nombre, aviso: 'sin importe total extraído' });
    // anon.riesgo se calcula siempre (aunque se use el texto crudo para la
    // ficha): sigue siendo la señal de qué archivos contienen datos
    // sensibles, útil incluso en modo --sin-anonimizar para saber qué mirar
    // con más cuidado antes de repartir el documento.
    if (anon.riesgo === 'alto') avisos.push({ archivo: nombre, aviso: `riesgo ALTO de datos personales — contextos: ${anon.contextos.join('; ')}` });
  } catch (err) {
    const motivo = `error de proceso: ${err.message}`;
    fallos.push({ archivo: nombre, motivo });
    elementosPorArchivo.push({ archivo: nombre, error: motivo });
  }
}

/* ─────────── resumen ─────────── */

console.log(`━━━ Resumen ━━━`);
console.log(`Procesados con éxito: ${fichas.length} / ${archivos.length}`);
console.log(`Fallos de lectura: ${fallos.length}`);
for (const f of fallos) console.log(`   ✗ ${f.archivo} — ${f.motivo}`);

console.log(`\n━━━ Por tipo ━━━`);
const porTipo = {};
for (const f of fichas) porTipo[f.tipoNombre] = (porTipo[f.tipoNombre] || 0) + 1;
for (const [k, v] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) console.log(`   ${v}\t${k}`);

console.log(`\n━━━ Por mandato ━━━`);
const porMandato = {};
for (const f of fichas) porMandato[f.mandato.etiqueta] = (porMandato[f.mandato.etiqueta] || 0) + 1;
for (const [k, v] of Object.entries(porMandato)) console.log(`   ${v}\t${k}`);

console.log(`\n━━━ Por confianza de atribución de mandato ━━━`);
const porConfianza = {};
for (const f of fichas) porConfianza[f.mandato.confianza] = (porConfianza[f.mandato.confianza] || 0) + 1;
for (const [k, v] of Object.entries(porConfianza)) console.log(`   ${v}\t${k}`);

const importeAcumulado = fichas.reduce((a, f) => a + (f.importeTotal || 0), 0);
console.log(`\nImporte acumulado (de los que tienen importe): ${fmtEuro(importeAcumulado)}`);
console.log(`Total de líneas de factura extraídas: ${fichas.reduce((a, f) => a + f.nFacturas, 0)}`);

console.log(`\n━━━ Avisos a revisar a mano (${avisos.length}) ━━━`);
for (const a of avisos) console.log(`   ! [${a.archivo}] ${a.aviso}`);

console.log(`\n━━━ Alertas del catálogo detectadas ━━━`);
const porAlerta = {};
for (const f of fichas) {
  for (const a of evaluarDecreto(f)) porAlerta[a.id] = (porAlerta[a.id] || 0) + 1;
}
for (const [k, v] of Object.entries(porAlerta).sort((a, b) => b[1] - a[1])) console.log(`   ${v}\t${k}`);

console.log(`\n━━━ Patrones de la serie ━━━`);
const patrones = evaluarPatrones(fichas);
for (const p of patrones) {
  console.log(`   [${p.id}] ${p.titulo}`);
  console.log(`        ${p.detalle}`);
}

// Volcado estructurado completo (sin texto íntegro) para revisión detallada,
// SIEMPRE dentro de la carpeta ya protegida por .gitignore.
const salida = join(carpeta, '_validacion.json');
writeFileSync(salida, JSON.stringify({ generado: new Date().toISOString(), fichas, avisos, fallos }, null, 2));
console.log(`\nVolcado estructurado completo guardado en: ${salida}`);

// Mismo informe consolidado que genera el botón "Informe consolidado" en la
// interfaz — para revisar a mano contra los PDF originales antes de confiar
// en la herramienta para algo público. También dentro de la carpeta protegida.
const resumenRegistro = { total: fichas.length };
const informe = informeConsolidadoMarkdown(entradas, patrones, resumenRegistro);
const salidaInforme = join(carpeta, 'informe_consolidado.md');
writeFileSync(salidaInforme, informe);
console.log(`Informe consolidado (criterio editorial) guardado en: ${salidaInforme}`);

// Hechos objetivos de CADA archivo subido, sin criterio editorial — cobertura
// por archivo, no por número de decreto. Para comprobar la extracción antes
// de que nadie interprete nada.
const resumenFichas = resumenFichasMarkdown(elementosPorArchivo, { anonimo: !sinAnonimizar });
const salidaResumen = join(carpeta, 'resumen_fichas.md');
writeFileSync(salidaResumen, resumenFichas);
console.log(`Resumen de fichas (hechos, sin interpretar) guardado en: ${salidaResumen}`);
console.log(`  → ${elementosPorArchivo.length} archivo(s) recibido(s), ${elementosPorArchivo.filter(e => e.ficha).length} con ficha, ${elementosPorArchivo.filter(e => e.error).length} sin leer.`);

// Mismo resumen, en Word — el formato que de verdad va a usar el grupo.
const salidaDocx = join(carpeta, sinAnonimizar ? 'resumen_fichas_sin_anonimizar.docx' : 'resumen_fichas.docx');
const blobDocx = await resumenFichasDocxBlob(elementosPorArchivo, { anonimo: !sinAnonimizar });
writeFileSync(salidaDocx, Buffer.from(await blobDocx.arrayBuffer()));
console.log(`Resumen de fichas en Word guardado en: ${salidaDocx}${sinAnonimizar ? '  (SIN anonimizar — no compartir fuera del grupo)' : ''}`);
