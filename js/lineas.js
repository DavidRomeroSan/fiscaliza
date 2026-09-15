/**
 * lineas.js — Descomposición de la relación de facturas.
 *
 * Es el módulo que convierte un decreto de facturas en algo fiscalizable.
 * Sin él sólo se obtiene un importe total, que no dice nada: lo que importa es
 * quién cobra, cuánto, por qué concepto, y cuántas veces aparece el mismo
 * proveedor aunque cada factura sea pequeña.
 *
 * Tres formatos de tabla conviven en los decretos de Santa Fe:
 *
 *   A) Aprobación de operaciones — columna de aplicación presupuestaria
 *      "ADO 30/08/2023 2023 9209 22103 76,71 ES ROTONDA DE SANTA FE SL"
 *      OJO: el importe va SIN símbolo de euro.
 *
 *   B) Relación de facturas por tercero — el CIF es la columna clave
 *      "362,33 € A08431090"  (el nombre aparece en líneas contiguas)
 *
 *   C) Factura única descrita en la propuesta
 *      "por importe total de 1.701,26 € para el pago a AZULEJOS SANTA FE S.L.
 *       (CIF: B18263319) de la Factura 252/2023 ... en concepto de ..."
 */

import { aNumero } from './parse.js';

/**
 * Número monetario español, tolerante a errores de tecleo del propio
 * Ayuntamiento. \d+ (sin tope de 3 cifras) seguido de grupos opcionales de
 * miles con punto y de un decimal opcional con coma. Con un patrón que exige
 * exactamente grupos de 3 dígitos tras el punto, un importe mecanografiado
 * sin separador de miles ni coma decimal —"6292" en vez de "6.292,00", que
 * aparece de verdad en al menos un decreto real— se recorta a "629" y dos
 * cosas se rompen a la vez: el importe queda mal y sobra un "2" suelto que
 * puede colarse en la siguiente búsqueda.
 */
const NUM = String.raw`\d+(?:\.\d{3})*(?:,\d{2})?`;

/* ─────────── clasificación del concepto ─────────── */

/**
 * Distingue al proveedor del beneficiario de una ayuda.
 *
 * La diferencia no es si es persona física o jurídica: un autónomo que factura
 * al Ayuntamiento es proveedor, y su identidad es información pública
 * (art. 8.1.a de la Ley 19/2013). Quien percibe una ayuda de urgencia social,
 * no. Lo que decide es el concepto de la línea.
 */
const CONCEPTO_AYUDA =
  /\b(ayuda|ayudas|atenci[óo]n social|urgencia|emergencia social|intervenci[óo]n familiar|\bPIF\b|beca|subvenci[óo]n nominativa a persona|prestaci[óo]n social|pensi[óo]n (?:vitalicia|excepcional)|defunci[óo]n|fallecimiento)\b/i;

const CONCEPTO_DIETA =
  /\b(asistencias? a (?:juntas|comisiones|pleno)|dieta|indemnizaci[óo]n por (?:asistencia|raz[óo]n del servicio)|tribunal de (?:selecci[óo]n|oposiciones)|kilometraje|kilometr\.|manutenc(?:i[óo]n)?\.?|desplazamiento)\b/i;

/**
 * Devoluciones a particulares: fianzas, autoliquidaciones de ICIO, reintegros
 * por desistimiento. No son compras del Ayuntamiento a un proveedor — son
 * dinero que vuelve a un vecino — así que no deben entrar en el recuento de
 * "proveedor recurrente" y sí deben tratarse como dato personal si llevan
 * nombre y DNI. Nadie licita una devolución de fianza: por eso queda fuera
 * del recuento de proveedores.
 */
const CONCEPTO_DEVOLUCION =
  /\b(devoluci[óo]n|reintegro|fianza|autoliquidaci[óo]n|desistimiento)\b/i;

/**
 * Remesas obligatorias a la administración tributaria o a la Seguridad
 * Social (modelo 111 de IRPF, cuotas TGSS). Son pagos automáticos por
 * imperativo legal, no relaciones contractuales con un proveedor: incluirlas
 * en "proveedor recurrente" sería tan absurdo como fiscalizar que Hacienda
 * cobra todos los meses.
 */
const CONCEPTO_TRIBUTO =
  /\b(modelo\s*1\d{2}\b|\bIRPF\b|tesorer[íi]a general (?:de la )?seguridad social|agencia (?:estatal )?tributaria|retenci[óo]n (?:de )?(?:IRPF|impuestos))\b/i;

export function clasificarLinea(concepto = '') {
  if (CONCEPTO_AYUDA.test(concepto)) return 'ayuda';
  if (CONCEPTO_DEVOLUCION.test(concepto)) return 'devolucion';
  if (CONCEPTO_TRIBUTO.test(concepto)) return 'tributo';
  if (CONCEPTO_DIETA.test(concepto)) return 'dieta';
  return 'proveedor';
}

/* ─────────── reconocimiento de nombres de tercero ─────────── */

const SUFIJO_SOCIETARIO =
  /\b(S\.?\s?L\.?(?:\s?U\.?|\s?P\.?)?|S\.?\s?A\.?(?:\s?U\.?)?|S\.?\s?COOP|C\.?\s?B\.?|SLU|SAU|SLP)\b\.?$/i;

/** Ruido de la tabla que no forma parte del nombre del tercero. */
const RUIDO_LINEA =
  /^(?:Fase|ADO|PMP|RC|FACT|Rect|Mat|Segun detalle|EXTE|RE)\b|^\d|^[-–—]/i;

/**
 * ¿Esta cadena parece el nombre de un tercero?
 * Acepta razones sociales y nombres de autónomos (que en estas tablas van en
 * mayúsculas y con el apellido delante: "GARCIA PEREZ GERARDO").
 */
export function pareceTercero(s) {
  if (!s) return false;
  const t = s.trim().replace(/\s+/g, ' ');
  if (t.length < 4 || t.length > 70) return false;
  if (RUIDO_LINEA.test(t)) return false;
  if (/€/.test(t)) return false;
  const palabras = t.split(' ').filter(Boolean);
  if (palabras.length < 1 || palabras.length > 8) return false;
  // Mayúsculas dominantes: es como se escriben en la columna "Nombre Ter."
  const letras = t.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (!letras.length) return false;
  const proporcionMayus = (t.match(/[A-ZÁÉÍÓÚÑ]/g) || []).length / letras.length;
  return proporcionMayus > 0.65;
}

/** Limpia el nombre del tercero de restos de otras columnas. */
function limpiarTercero(s) {
  return s
    .replace(/\b(?:Fase|Segun detalle documento adjunto|FACT:?.*|Rect\..*|Mat\.:.*|RE[.:].*|EXTE:?.*)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clave de agrupación: prioriza el CIF; si no hay, la razón social normalizada. */
export function claveTercero({ nombre, cif }) {
  if (cif) return cif.toUpperCase().replace(/-/g, '');
  return (nombre || '')
    .toUpperCase()
    .replace(/[.,]/g, '')
    .replace(/\bS\s?L\s?U\b/g, 'SLU')
    .replace(/\bS\s?L\s?P\b/g, 'SLP')
    .replace(/\bS\s?L\b/g, 'SL')
    .replace(/\bS\s?A\s?U\b/g, 'SAU')
    .replace(/\bS\s?A\b/g, 'SA')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ─────────── formato A: aprobación de operaciones ─────────── */

// "ADO 30/08/2023 2023 9209 22103 76,71  ES ROTONDA DE SANTA FE SL"
// La clave económica suele tener 5 dígitos, pero las de inversión llegan a 7
// ("132 6240013"). Exigir exactamente 5 dejaba fuera las partidas más caras.
const RE_ADO = new RegExp(String.raw`\b(ADO|PMP|RC|O)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{4})\s+(\d{3,4})\s+(\d{5,7})\s+(${NUM})\s*(.*)$`);

function formatoA(lineas) {
  const out = [];
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(RE_ADO);
    if (!m) continue;

    const [, fase, fecha, ejercicio, prog, econ, imp, resto] = m;
    let nombre = limpiarTercero(resto);
    let concepto = '';

    // El nombre puede haber caído en la línea siguiente por el corte de columnas.
    if (!pareceTercero(nombre)) {
      for (let j = 1; j <= 2 && i + j < lineas.length; j++) {
        const sig = lineas[i + j];
        if (RE_ADO.test(sig)) break;
        const cand = limpiarTercero(sig);
        if (pareceTercero(cand)) { nombre = cand; break; }
      }
    }

    // El concepto es el texto libre que sigue, hasta la próxima línea de tabla.
    for (let j = 1; j <= 3 && i + j < lineas.length; j++) {
      const sig = lineas[i + j];
      if (RE_ADO.test(sig)) break;
      if (sig && sig !== nombre && !pareceTercero(sig)) { concepto = sig.slice(0, 220); break; }
    }

    out.push({
      importe: aNumero(imp),
      nombre: pareceTercero(nombre) ? nombre : null,
      cif: null,
      concepto,
      aplicacion: `${prog}.${econ}`,
      fase,
      fecha,
      ejercicio,
      formato: 'A',
    });
  }
  return out;
}

/* ─────────── formato B: relación por tercero, con CIF ─────────── */

const RE_CIF = /\b([ABCDEFGHJNPQRSUVW]\d{8}|[ABCDEFGHJNPQRSUVW]-?\d{7}-?[0-9A-J])\b/;
// "362,33 € A08431090"  ·  también "336,88 € A08431090" al final de una línea larga
const RE_IMPORTE_CIF = new RegExp(String.raw`(${NUM})\s*€\s*([ABCDEFGHJNPQRSUVW]\d{8})`);

function formatoB(lineas) {
  const out = [];
  // Índice CIF → nombre, construido con todas las apariciones del documento.
  const nombrePorCif = new Map();
  for (let i = 0; i < lineas.length; i++) {
    const mc = lineas[i].match(RE_CIF);
    if (!mc) continue;
    for (let j = -2; j <= 2; j++) {
      const cand = limpiarTercero(lineas[i + j] || '');
      if (SUFIJO_SOCIETARIO.test(cand) && pareceTercero(cand)) {
        nombrePorCif.set(mc[1], cand);
        break;
      }
    }
  }

  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(RE_IMPORTE_CIF);
    if (!m) continue;
    const cif = m[2];
    let concepto = '';
    for (let j = 1; j <= 2 && i + j < lineas.length; j++) {
      const sig = (lineas[i + j] || '').trim();
      if (RE_IMPORTE_CIF.test(sig) || !sig) continue;
      if (!pareceTercero(sig)) { concepto = sig.slice(0, 220); break; }
    }
    out.push({
      importe: aNumero(m[1]),
      nombre: nombrePorCif.get(cif) || null,
      cif,
      concepto,
      aplicacion: null,
      formato: 'B',
    });
  }
  return out;
}

/* ─────────── formato C: factura única en la propuesta ─────────── */

function formatoC(texto) {
  const aplicacionDe = () =>
    (texto.match(/Aplicaci[óo]n Presupuestaria\s+(\d{3,4}[.\s]\d{3}[.\s]\d{2}|\d{3,4}[.\s]\d{5})/i) || [])[1];

  // Variante 1: "...para el pago a NOMBRE (CIF: XXX) de la Factura N ... en concepto de..."
  const re1 = /por importe total de\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*€\s*para el pago a\s+([^(]{3,70}?)\s*\(\s*(?:CIF|NIF)\s*:?\s*([A-Z]-?\d{7,8}-?[0-9A-J]?)\s*\)\s*de la Factura\s+([^\s]+)[\s\S]{0,120}?en concepto de\s*[“"]?([^”"\n]{3,220})/i;
  const m1 = texto.match(re1);
  if (m1) {
    const ap = aplicacionDe();
    return [{
      importe: aNumero(m1[1]), nombre: m1[2].trim().replace(/\s+/g, ' '), cif: m1[3].toUpperCase(),
      factura: m1[4], concepto: m1[5].trim(), aplicacion: ap ? ap.replace(/\s/g, '.') : null, formato: 'C',
    }];
  }

  // Variante 2: "N.- por importe de X €, a favor de NOMBRE (CIF: XXX), para
  // el pago de [lo que sea] ... con cargo a la Aplicación Presupuestaria APP".
  //
  // Generalizada a propósito. Un primer intento fijaba la frase intermedia
  // ("derivada de la factura número...") y solo capturaba un elemento con
  // .match() en vez de recorrer todos. Los dos supuestos fallaban con un
  // decreto real: tres pólizas de seguro a la misma aseguradora en un único
  // "RESUELVO" numerado 1./2./3., donde la frase intermedia es "para el pago
  // del recibo de la Póliza..." — no "factura" — y son tres apariciones, no
  // una. En vez de perseguir cada redacción nueva con un patrón dedicado, se
  // ancla solo en lo que es estructuralmente estable en cualquier propuesta
  // de gasto: el importe, el CIF entre paréntesis, y el cierre con la
  // aplicación presupuestaria. Lo que hay en medio —factura, recibo, póliza,
  // concepto libre— se captura tal cual como concepto, sin intentar
  // interpretarlo. Con /g se recorren todos los puntos numerados, no solo
  // el primero.
  const re2 = /(?:\d+[.\-]?\s*[-.]\s*)?por importe\s*(?:total)?\s*de\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*€,?\s*a favor de\s+([^(]{3,80}?)\s*\(\s*(?:CIF|NIF)\s*:?\s*([A-Z]-?\d{7,8}-?[0-9A-J]?)\s*\)([\s\S]{0,300}?)(?:con cargo a la|con cargo)\s*(?:la\s*)?[Aa]plicaci[óo]n\s*[Pp]resupuestaria\s+(\d{3,4}[.\s]\d{3}[.\s]\d{2}|\d{3,4}[.\s]\d{5})/g;
  const out2 = [];
  let m2;
  while ((m2 = re2.exec(texto)) !== null) {
    out2.push({
      importe: aNumero(m2[1]),
      nombre: m2[2].trim().replace(/\s+/g, ' '),
      cif: m2[3].toUpperCase(),
      concepto: m2[4].replace(/\s+/g, ' ').trim().slice(0, 220),
      aplicacion: m2[5].replace(/\s/g, '.'),
      formato: 'C',
    });
  }
  if (out2.length) return out2;

  return [];
}

/**
 * Formato D — "Nº Operación Fase Importe Saldo", el que usan los decretos de
 * ORDENACIÓN DE PAGOS (distinto de los de APROBACIÓN DE GASTOS, que llevan
 * columnas de aplicación presupuestaria y son el formato A). Sin aplicación
 * presupuestaria ni fecha en la fila: el número de operación (9 a 14 dígitos)
 * es la única ancla fiable.
 *
 * El nombre del tercero puede ir en la misma línea, en la siguiente, o no
 * existir en absoluto — los "pagos a justificar" se libran a favor de una
 * partida, no de un tercero, y eso es correcto: no deben aparecer como
 * proveedor.
 */
const RE_OPERACION = new RegExp(String.raw`\b(\d{9,14})\s+(ADO|ADOP|PMP|RC|AD|A|D|O|P)\s+(${NUM})\s+(${NUM})\s*(.*)$`);

function formatoD(lineas) {
  const out = [];
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(RE_OPERACION);
    if (!m) continue;
    const [, operacion, fase, imp, , resto] = m;

    let nombre = limpiarTercero(resto);
    let concepto = '';

    if (!pareceTercero(nombre)) {
      for (let j = 1; j <= 3 && i + j < lineas.length; j++) {
        const sig = lineas[i + j];
        if (RE_OPERACION.test(sig)) break;
        const cand = limpiarTercero(sig);
        if (pareceTercero(cand)) { nombre = cand; break; }
      }
    }

    for (let j = 1; j <= 3 && i + j < lineas.length; j++) {
      const sig = lineas[i + j];
      if (RE_OPERACION.test(sig)) break;
      if (sig && sig !== nombre && !pareceTercero(sig)) { concepto = sig.slice(0, 220); break; }
    }
    // El texto libre puede venir ya en la propia línea numérica cuando no hay
    // tercero identificado (típico de los "pago a justificar").
    if (!concepto && resto && !pareceTercero(resto)) concepto = resto.slice(0, 220);

    out.push({
      importe: aNumero(imp),
      nombre: pareceTercero(nombre) ? nombre : null,
      cif: null,
      concepto,
      aplicacion: null,
      operacion, fase,
      formato: 'D',
    });
  }
  return out;
}

/* ─────────── entrada principal ─────────── */

/**
 * Extrae la relación de facturas de un decreto.
 * @returns {Array<{importe, nombre, cif, concepto, aplicacion, tipo, formato}>}
 */
export function extraerLineas(texto) {
  const lineas = texto.split('\n').map(l => l.trim());

  let out = [...formatoC(texto), ...formatoA(lineas), ...formatoB(lineas), ...formatoD(lineas)];

  // Deduplica por importe + tercero: el formato C repite la línea en PROPUESTA
  // y en RESUELVO, y contarla dos veces duplicaría el gasto.
  const vistos = new Set();
  out = out.filter(l => {
    if (l.importe == null || l.importe <= 0) return false;
    const k = `${l.importe}|${claveTercero(l)}|${l.aplicacion || ''}|${(l.concepto || '').slice(0, 60)}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });

  return out.map(l => ({ ...l, tipo: clasificarLinea(`${l.concepto || ''} ${l.nombre || ''}`) }));
}

/** Agrupa las líneas por tercero. Es lo que alimenta la detección de repeticiones. */
export function agruparPorTercero(lineas) {
  const mapa = new Map();
  for (const l of lineas) {
    if (l.tipo !== 'proveedor') continue;      // ayudas y dietas quedan fuera
    if (!l.nombre && !l.cif) continue;
    const k = claveTercero(l);
    if (!mapa.has(k)) {
      mapa.set(k, { clave: k, nombre: l.nombre, cif: l.cif, nFacturas: 0, importe: 0, conceptos: [], aplicaciones: new Set() });
    }
    const e = mapa.get(k);
    e.nFacturas++;
    e.importe += l.importe;
    if (!e.nombre && l.nombre) e.nombre = l.nombre;
    if (!e.cif && l.cif) e.cif = l.cif;
    if (l.concepto && e.conceptos.length < 5) e.conceptos.push(l.concepto.slice(0, 90));
    if (l.aplicacion) e.aplicaciones.add(l.aplicacion);
  }
  return [...mapa.values()]
    .map(e => ({ ...e, aplicaciones: [...e.aplicaciones] }))
    .sort((a, b) => b.importe - a.importe);
}

/** Las facturas de mayor cuantía, con su tercero y su concepto. */
export function mayoresCuantias(lineas, n = 8) {
  return [...lineas].sort((a, b) => b.importe - a.importe).slice(0, n);
}

/** Suma de las líneas de proveedor. Sirve para contrastar con el total declarado. */
export function sumaLineas(lineas) {
  return lineas.reduce((a, l) => a + (l.importe || 0), 0);
}

/**
 * Nombres que NO deben anonimizarse: terceros que facturan al Ayuntamiento.
 * Un autónomo que emite una factura actúa en el tráfico mercantil y su
 * identidad es información pública de contratación. Un perceptor de ayuda
 * social, no: esos se quedan fuera de esta lista y se anonimizan.
 */
export function terceros(lineas) {
  return lineas
    .filter(l => l.tipo === 'proveedor' && l.nombre)
    .map(l => l.nombre);
}
