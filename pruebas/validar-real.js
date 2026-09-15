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
 * USO: node pruebas/validar-real.js [carpeta]
 * Por defecto usa ./Decretos (gitignored: nunca debe entrar en el repo).
 *
 * No escribe el texto íntegro de ningún decreto a disco: solo genera un
 * resumen estructurado (igual que registry.js) y avisos legibles.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const carpeta = process.argv[2] || join(__dirname, '..', 'Decretos');

const pdfjs = await import('../node_modules/pdfjs-dist/legacy/build/pdf.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = join(__dirname, '..', 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');

import { MUNICIPIO } from '../js/config.js';
import { anonimizar } from '../js/redact.js';
import { extraerLineas, terceros } from '../js/lineas.js';
import { analizar, datosNoIncluidos, fmtEuro } from '../js/parse.js';
import { evaluarDecreto, evaluarPatrones } from '../js/rules.js';

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
const fallos = [];
const avisos = []; // { archivo, tipo de aviso, detalle } — para revisar a mano

for (const nombre of archivos) {
  const ruta = join(carpeta, nombre);
  try {
    const buffer = readFileSync(ruta);
    const { texto, paginas, escaneado } = await textoDePdf(buffer);

    if (escaneado || texto.length < 200) {
      fallos.push({ archivo: nombre, motivo: 'PDF sin texto legible (posible escaneo)' });
      continue;
    }

    const proveedores = terceros(extraerLineas(texto));
    const anon = anonimizar(texto, { permitir: proveedores });
    const ficha = analizar(anon.textoAnonimo, nombre);
    const alertas = evaluarDecreto(ficha);
    fichas.push(ficha);

    // Señales de alerta sobre la PROPIA extracción, no sobre el Ayuntamiento:
    // esto es lo que hay que revisar a mano contra el PDF original.
    if (!ficha.decreto) avisos.push({ archivo: nombre, aviso: 'sin número de decreto detectado' });
    if (!ficha.fecha) avisos.push({ archivo: nombre, aviso: 'sin fecha detectada' });
    if (!ficha.firmante) avisos.push({ archivo: nombre, aviso: 'sin firmante detectado' });
    if (ficha.mandato.confianza === 'nula') avisos.push({ archivo: nombre, aviso: 'mandato: confianza NULA' });
    if (ficha.mandato.confianza === 'revisar') avisos.push({ archivo: nombre, aviso: `mandato: confianza A REVISAR — ${ficha.mandato.nota}` });
    if (ficha.cuadra === false) avisos.push({ archivo: nombre, aviso: `F04: la suma de líneas (${fmtEuro(ficha.sumaLineas)}) no cuadra con el total (${fmtEuro(ficha.importeTotal)})` });
    if (ficha.importeTotal == null) avisos.push({ archivo: nombre, aviso: 'sin importe total extraído' });
    if (anon.riesgo === 'alto') avisos.push({ archivo: nombre, aviso: `riesgo ALTO de datos personales — contextos: ${anon.contextos.join('; ')}` });
  } catch (err) {
    fallos.push({ archivo: nombre, motivo: `error de proceso: ${err.message}` });
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
