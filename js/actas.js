/**
 * actas.js — Actas de la Junta de Gobierno Local.
 *
 * Solo recoge lo que el acta dice, tal cual: cabecera, título de cada punto,
 * sentido y recuento de la votación, las intervenciones citadas literalmente,
 * los puntos de la resolución y los anexos. No interpreta ni cruza datos.
 *
 * Calibrado sobre el acta real JGL/2026/31 (sesión extraordinaria del
 * 13/08/2026), tal y como la reconstruye extract.js: el pie rotado de
 * esPublico Gestiona ("Fecha:", "Número:", "ACTA DE JUNTA DE GOBIERNO")
 * queda intercalado entre líneas de cuerpo — a veces solo, a veces pegado al
 * final de una línea — y hay que quitarlo antes de trocear por puntos.
 */

import { datosDelPieDecreto } from './parse.js';

const MESES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

// Sin /i y a inicio de línea, a propósito: una convocatoria de JGL también
// dice "Aprobación del Acta de la sesión extraordinaria…" y "A) Parte
// resolutiva." en su orden del día, y con una regex permisiva se tomaría por
// un acta. El acta real lleva el encabezado entero en mayúsculas.
export const esActa = (texto) =>
  /^ACTA DE LA SESI[ÓO]N\s+(?:ORDINARIA|EXTRAORDINARIA)/m.test(texto) && /^A\)\s*PARTE RESOLUTIVA/m.test(texto);

const ORDINAL = /^(PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|S[ÉE]PTIMO|OCTAVO|NOVENO|D[ÉE]CIMO|[UÚ]NICO)\b\s*[.:\-]/i;
const ABREVIATURA_FINAL = /\b(?:Sr|Sra|Sres|Sras|Dª|D\.ª|D|Excmo|Ilmo|Art|art|nº|Nº|Dr|Dra|Gral)\.$/;

const dmy = (iso) => (iso ? iso.split('-').reverse().join('/') : null);
const unir = (lineas) => lineas.join(' ').replace(/\s+/g, ' ').trim();

function limpiarPie(texto, pie) {
  let t = texto
    .replace(/^[ \t]*Fecha:\s*\d{1,2}\/\d{1,2}\/\d{4}[ \t]*$/gim, '')
    .replace(/^[ \t]*N[uú]mero:\s*\d{4}[-\/]\d{3,5}[ \t]*$/gim, '')
    .replace(/^[ \t]*ACTA DE JUNTA DE GOBIERNO[ \t]*$/gim, '')
    .replace(/^[ \t]*\|[ \t]*$/gm, '');
  if (pie.decreto) t = t.replace(new RegExp(`[ \\t]*N[uú]mero:\\s*${pie.decreto}\\b`, 'g'), '');
  if (pie.fecha) t = t.replace(new RegExp(`[ \\t]*Fecha:\\s*${dmy(pie.fecha)}`, 'g'), '');
  return t.replace(/[ \t]*\bACTA DE JUNTA DE GOBIERNO\b[ \t]*$/gm, '');
}

/** Agrupa líneas en párrafos: una línea que acaba en punto y va seguida de
 * una en mayúscula abre párrafo nuevo, salvo que ese punto sea de una
 * abreviatura ("por la Sra." / "Concejal…"). */
function parrafos(lineas) {
  const out = [];
  let actual = '';
  for (const l of lineas) {
    const cierra = actual && /[.:;]$/.test(actual) && !ABREVIATURA_FINAL.test(actual);
    if (cierra && /^[A-ZÁÉÍÓÚÑ"“0-9]/.test(l)) { out.push(actual); actual = l; }
    else actual = actual ? `${actual} ${l}` : l;
  }
  if (actual) out.push(actual);
  return out;
}

const INICIO_INTERVENCION = /^(?:Por (?:el|la) |El resto de miembros|Interviene|Toma la palabra)/i;
const FIN_INTERVENCION = /^(?:A continuaci[óo]n, se somete|Se somete|Sometido|La Junta de Gobierno, a la vista)/i;

function intervenciones(ps) {
  const out = [];
  let dentro = false;
  for (const p of ps) {
    if (!dentro && INICIO_INTERVENCION.test(p)) dentro = true;
    else if (dentro && FIN_INTERVENCION.test(p)) dentro = false;
    if (dentro) out.push(p);
  }
  return out;
}

/** Cada punto de la resolución, cortado donde empieza la lista o la tabla
 * que introduce ("…las siguientes condiciones:"), no el clausulado entero. */
function puntosDeResolucion(lineas) {
  const puntos = [];
  let actual = null;
  for (const l of lineas) {
    const m = l.match(ORDINAL);
    if (m) {
      const resto = l.replace(ORDINAL, '').trim();
      actual = { ordinal: m[1].toUpperCase(), lineas: [resto], cortado: /:$/.test(resto) };
      puntos.push(actual);
      continue;
    }
    if (!actual || actual.cortado) continue;
    if (/^\d{1,2}[ª.]-?\s/.test(l)) { actual.cortado = true; continue; }
    actual.lineas.push(l);
    if (/:$/.test(l)) actual.cortado = true;
  }
  return puntos.map(p => ({ ordinal: p.ordinal, texto: unir(p.lineas) }));
}

function importes(texto) {
  const vistos = [];
  for (const m of texto.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*€/g)) {
    if (!vistos.includes(m[1])) vistos.push(m[1]);
  }
  return vistos.map(v => `${v} €`);
}

function analizarPunto(numero, bloque) {
  const tieneVotacion = bloque.slice(0, 8).some(l => /^(Favorable|Desfavorable)\b/.test(l));
  const titulo = [bloque[0].replace(/^\d{1,2}\.-\s+/, '')];
  let j = 1;
  while (j < bloque.length && j < 7) {
    if (tieneVotacion ? /^(Favorable|Desfavorable)\b|^Tipo de votaci/i.test(bloque[j]) : /\.$/.test(titulo[titulo.length - 1])) break;
    titulo.push(bloque[j]);
    j++;
  }
  const tituloTxt = unir(titulo);
  const m = tituloTxt.match(/^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ,]+?)\.\s+Expediente\s+(\S+?)\.\s+(.+)$/);

  const cabecera = unir(bloque.slice(j, j + 8));
  const sentido = cabecera.match(/\b(Favorable|Desfavorable)\b/)?.[1] || null;
  const votos = cabecera.match(/A favor:\s*(\d+),\s*En contra:\s*(\d+),\s*Abstenciones:\s*(\d+),\s*Ausentes:\s*(\d+)/);

  const iHechos = bloque.findIndex((l, i) => i >= j && /^Hechos y fundamentos de derecho/i.test(l));
  const iResol = bloque.map((l, i) => (/^Resoluci[óo]n:?$/i.test(l) ? i : -1)).filter(i => i >= 0).pop() ?? -1;
  const finZona = [iHechos, iResol].filter(i => i >= 0).sort((a, b) => a - b)[0] ?? bloque.length;
  const zona = parrafos(bloque.slice(j, finZona));

  let resolucion = [];
  let anexos = [];
  let textoResolucion = '';
  if (iResol >= 0) {
    let iAnexos = bloque.findIndex((l, i) => i > iResol && /^Documentos anexos:?/i.test(l));
    const fin = iAnexos >= 0 ? iAnexos : bloque.length;
    const lineasRes = bloque.slice(iResol + 1, fin);
    textoResolucion = lineasRes.join(' ');
    resolucion = puntosDeResolucion(lineasRes);
    if (iAnexos >= 0) {
      for (const l of bloque.slice(iAnexos + 1)) {
        if (/^Anexo\s+\d+\./i.test(l)) anexos.push(l);
        else if (anexos.length) anexos[anexos.length - 1] += ` ${l}`;
      }
    }
  }

  return {
    numero,
    area: m ? m[1] : null,
    expediente: m ? m[2] : null,
    objeto: m ? m[3] : tituloTxt,
    sentido,
    tipoVotacion: cabecera.match(/Tipo de votaci[óo]n:\s*(\S+)/i)?.[1] || null,
    mayoria: cabecera.match(/Tipo de mayor[ií]a:\s*(\S+)/i)?.[1] || null,
    votos: votos ? { aFavor: +votos[1], enContra: +votos[2], abstenciones: +votos[3], ausentes: +votos[4] } : null,
    intervenciones: intervenciones(zona),
    acuerdos: votos ? [] : zona.filter(p => /\bACUERDA\b/.test(p)),
    resolucion,
    importes: importes(textoResolucion),
    anexos: anexos.map(a => a.replace(/\s+/g, ' ').trim()),
  };
}

export function analizarActa(textoBruto, nombreArchivo = '') {
  const pie = datosDelPieDecreto(textoBruto);
  const lineas = limpiarPie(textoBruto, pie).split('\n').map(l => l.trim()).filter(Boolean);

  const iSesion = lineas.findIndex(l => /^ACTA DE LA SESI[ÓO]N/i.test(l));
  const tituloSesion = [];
  for (let i = iSesion; i >= 0 && i < lineas.length && tituloSesion.length < 4; i++) {
    tituloSesion.push(lineas[i]);
    if (/\.$/.test(lineas[i])) break;
  }
  const titulo = unir(tituloSesion);
  const f = titulo.match(/EL D[ÍI]A\s+(\d{1,2})\s+DE\s+([A-ZÁÉÍÓÚ]+)\s+DE\s+(\d{4})/i);
  const mes = f ? MESES[f[2].toLowerCase()] : null;

  const iApertura = lineas.findIndex(l => /^En la ciudad de/i.test(l));
  const iPartes = lineas.findIndex(l => /^A\)\s*PARTE RESOLUTIVA/i.test(l));
  const iCierre = lineas.findIndex((l, i) => i > iPartes && /^Y no habiendo m[aá]s asuntos/i.test(l));
  const iFirma = lineas.findIndex((l, i) => i > Math.max(iCierre, 0) && /^DOCUMENTO FIRMADO/i.test(l));

  const puntos = [];
  const fin = iCierre >= 0 ? iCierre : (iFirma >= 0 ? iFirma : lineas.length);
  const cabeceras = [];
  let esperado = 1;
  for (let i = iPartes + 1; i < fin; i++) {
    const m = lineas[i].match(/^(\d{1,2})\.-\s+(.+)$/);
    if (!m || +m[1] !== esperado) continue;
    // Una sublista "1.- 2.- 3.-" dentro de un informe reproducido en el acta
    // sigue la misma numeración: los puntos reales llevan el área en
    // mayúsculas ("HACIENDA Y GESTIÓN ECONÓMICA.") salvo el primero.
    if (esperado > 1 && !/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ,]{3,}\./.test(m[2])) continue;
    cabeceras.push(i);
    esperado++;
  }
  cabeceras.forEach((ini, k) => {
    const hasta = k + 1 < cabeceras.length ? cabeceras[k + 1] : fin;
    puntos.push(analizarPunto(k + 1, lineas.slice(ini, hasta)));
  });

  return {
    archivo: nombreArchivo,
    numeroActa: pie.decreto,
    fechaFirma: pie.fecha,
    expedienteSesion: titulo.match(/JGL\/\d{4}\/\d+/)?.[0] || lineas.join(' ').match(/JGL\/\d{4}\/\d+/)?.[0] || null,
    tipoSesion: titulo.match(/SESI[ÓO]N\s+(ORDINARIA|EXTRAORDINARIA)/i)?.[1].toLowerCase() || null,
    fechaSesion: f && mes ? `${f[3]}-${String(mes).padStart(2, '0')}-${String(f[1]).padStart(2, '0')}` : null,
    apertura: iApertura >= 0 && iPartes > iApertura ? unir(lineas.slice(iApertura, iPartes)) : null,
    puntos,
    cierre: iCierre >= 0 ? unir(lineas.slice(iCierre, iFirma > iCierre ? iFirma : iCierre + 4)) : null,
  };
}
