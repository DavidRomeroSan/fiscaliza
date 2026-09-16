/**
 * exportDocx.js — Las mismas dos salidas que export.js (ficha técnica e
 * informe consolidado), en formato Word en vez de Markdown.
 *
 * Mismo contenido, misma separación entre la ficha (neutra, por decreto) y
 * el informe consolidado (criterio editorial, de todo el registro): esa
 * separación es la regla que no se toca, y cambiar el formato de salida no
 * es motivo para difuminarla.
 *
 * La librería `docx` se carga desde CDN solo cuando de verdad se pide una
 * descarga en Word — nunca al abrir la aplicación ni al generar Markdown —
 * igual que pdf.js y mammoth se cargan bajo demanda en extract.js.
 */

import { fmtEuro, datosNoIncluidos } from './parse.js';

const DOCX_SRC = 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.mjs';
let docxLib = null;

async function cargarDocx() {
  if (docxLib) return docxLib;
  // En Node (pruebas/validar-real.js, sin `window`) se usa el paquete local
  // — mismo pin de versión que el CDN — para poder validar la salida en Word
  // a escala sin depender de un navegador. En el navegador real esta rama
  // nunca se toma: siempre se carga desde CDN, como el resto del proyecto.
  docxLib = typeof window === 'undefined'
    ? await import('docx')
    : await import(/* @vite-ignore */ DOCX_SRC);
  return docxLib;
}

const refDecreto = (ficha) => ficha.decreto || ficha.expediente || ficha.archivo || 's/n';

/* ─────────── helpers de construcción ─────────── */

function h1(docx, texto) {
  return new docx.Paragraph({ text: texto, heading: docx.HeadingLevel.HEADING_1, spacing: { after: 200 } });
}
function h2(docx, texto) {
  return new docx.Paragraph({ text: texto, heading: docx.HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 } });
}
function h3(docx, texto) {
  return new docx.Paragraph({ text: texto, heading: docx.HeadingLevel.HEADING_3, spacing: { before: 160, after: 100 } });
}
function parrafo(docx, texto, opciones = {}) {
  return new docx.Paragraph({ children: [new docx.TextRun(texto)], spacing: { after: 120 }, ...opciones });
}
function italica(docx, texto) {
  return new docx.Paragraph({ children: [new docx.TextRun({ text: texto, italics: true })], spacing: { after: 160 } });
}
/** "Etiqueta: valor", con la etiqueta en negrita. */
function campo(docx, etiqueta, valor) {
  return new docx.Paragraph({
    children: [
      new docx.TextRun({ text: `${etiqueta}: `, bold: true }),
      new docx.TextRun(String(valor ?? 'No consta')),
    ],
    spacing: { after: 60 },
  });
}
function vineta(docx, texto) {
  return new docx.Paragraph({ children: [new docx.TextRun(texto)], bullet: { level: 0 }, spacing: { after: 60 } });
}
function celda(docx, texto, opciones = {}) {
  return new docx.TableCell({
    children: [new docx.Paragraph({ children: [new docx.TextRun({ text: String(texto), bold: !!opciones.cabecera })] })],
    width: opciones.width ? { size: opciones.width, type: docx.WidthType.PERCENTAGE } : undefined,
  });
}
function filaTabla(docx, celdas) {
  return new docx.TableRow({ children: celdas });
}

/** Aviso destacado (fondo gris claro), para las cautelas de doble filo, datos sensibles, etc. */
function aviso(docx, texto) {
  return new docx.Paragraph({
    children: [new docx.TextRun({ text: `⚠ ${texto}`, italics: true })],
    shading: { fill: 'F0F0F0' },
    spacing: { before: 80, after: 120 },
  });
}

/* ─────────── ficha técnica (neutra, por decreto) ─────────── */

/**
 * Construye los párrafos/tablas de una ficha, sin envolverlos en un
 * documento — así se puede usar tanto para la descarga de una ficha suelta
 * (fichaDocxBlob) como para pegar 135 fichas seguidas en un único Word
 * (resumenFichasDocxBlob) sin duplicar la lógica de construcción.
 *
 * `opciones.mostrarMandato` (por defecto true): se puede omitir cuando el
 * lote entero es del mismo mandato y el dato no aporta nada — pedido
 * explícitamente para el resumen de un lote de validación de 2026.
 */
function fichaDocxChildren(docx, ficha, opciones = {}) {
  const { mostrarMandato = true } = opciones;
  const hijos = [];

  if (ficha.tipo === 'indice') {
    hijos.push(h1(docx, 'Índice del libro de decretos'));
    hijos.push(italica(docx, 'No es un decreto individual: es el listado de la remesa recibida.'));
    return hijos;
  }

  hijos.push(h1(docx, `Decreto ${ficha.decreto || 's/n'}`));
  hijos.push(italica(docx, 'Ficha técnica. Contenido extraído del propio decreto, sin interpretación.'));

  hijos.push(campo(docx, 'Expediente', ficha.expediente || 'No consta'));
  hijos.push(campo(docx, 'Tipo', ficha.tipoNombre));
  hijos.push(campo(docx, 'Objeto', ficha.objeto || 'No consta'));
  if (ficha.beneficiario) hijos.push(campo(docx, 'Beneficiario', ficha.beneficiario));
  hijos.push(campo(docx, 'Fecha', ficha.fecha ? `${ficha.fecha}${ficha.fechaOrigen ? ` (${ficha.fechaOrigen})` : ''}` : 'No consta'));
  hijos.push(campo(docx, 'Firmante', ficha.firmante || 'No consta'));
  if (mostrarMandato) {
    hijos.push(campo(docx, 'Mandato',
      `${ficha.mandato?.etiqueta || 'Sin determinar'}${ficha.mandato?.confianza && ficha.mandato.confianza !== 'alta' ? ` (atribución: ${ficha.mandato.confianza})` : ''}`));
  }
  hijos.push(campo(docx, 'Importe', fmtEuro(ficha.importeTotal)));

  if (ficha.ordenDelDia?.length) {
    hijos.push(h2(docx, `Orden del día — ${ficha.ordenDelDia.length} punto(s)`));
    ficha.ordenDelDia.forEach((punto) => hijos.push(vineta(docx, punto)));
  }

  if (ficha.aplicaciones?.length) {
    hijos.push(campo(docx, 'Aplicaciones presupuestarias', ficha.aplicaciones.join(', ')));
  }

  if (ficha.nFacturas > 0) {
    hijos.push(h2(docx, `Relación de facturas — ${ficha.nFacturas} líneas`));
    if (ficha.cuadra === false) {
      hijos.push(aviso(docx,
        `Las facturas leídas suman ${fmtEuro(ficha.sumaLineas)} frente a los ${fmtEuro(ficha.importeTotal)} declarados. ` +
        'La lectura automática ha perdido líneas: comprueba la relación completa en el decreto original.'));
    }
    const filas = [filaTabla(docx, [
      celda(docx, 'Tercero', { cabecera: true, width: 50 }),
      celda(docx, 'Facturas', { cabecera: true, width: 15 }),
      celda(docx, 'Importe', { cabecera: true, width: 20 }),
      celda(docx, '% decreto', { cabecera: true, width: 15 }),
    ])];
    for (const t of ficha.porTercero) {
      const pct = ficha.sumaLineas ? (t.importe / ficha.sumaLineas) * 100 : 0;
      filas.push(filaTabla(docx, [
        celda(docx, `${t.nombre || t.cif || '—'}${t.cif && t.nombre ? ` (${t.cif})` : ''}`),
        celda(docx, t.nFacturas),
        celda(docx, fmtEuro(t.importe)),
        celda(docx, `${pct.toFixed(0)} %`),
      ]));
    }
    hijos.push(new docx.Table({ rows: filas, width: { size: 100, type: docx.WidthType.PERCENTAGE } }));
    hijos.push(parrafo(docx, ''));

    if (ficha.mayores?.length > 1) {
      hijos.push(h3(docx, 'Facturas de mayor cuantía'));
      for (const l of ficha.mayores) {
        hijos.push(vineta(docx,
          `${fmtEuro(l.importe)} — ${l.nombre || l.cif || 'tercero no identificado'}` +
          (l.concepto ? `. ${l.concepto.slice(0, 160)}` : '') +
          (l.aplicacion ? ` (${l.aplicacion})` : '')));
      }
    }
  } else if (ficha.proveedores?.length) {
    hijos.push(h2(docx, 'Terceros identificados'));
    for (const p of ficha.proveedores) {
      hijos.push(vineta(docx, `${p.nombre}${p.cif ? ` (${p.cif})` : ''}`));
    }
  }

  if (ficha.reparo?.hayReparo) {
    hijos.push(h2(docx, 'Reparo de Intervención'));
    hijos.push(vineta(docx, `Reparo${ficha.reparo.suspensivo ? ' suspensivo' : ''}: sí`));
    if (ficha.reparo.levantado) {
      hijos.push(vineta(docx,
        `Solventado por Alcaldía (art. 217 TRLRHL)${ficha.reparo.aFavorDe ? ` a favor de ${ficha.reparo.aFavorDe}` : ''}`));
    }
    if (ficha.reparo.fiscalizacionDesfavorable) hijos.push(vineta(docx, 'Resultado de la fiscalización: desfavorable'));
    if (ficha.reparo.debeIrAlPleno) hijos.push(vineta(docx, 'Debe darse cuenta al Pleno (art. 218 TRLRHL)'));
    if (ficha.reparo.debeIrAlTribunalDeCuentas) hijos.push(vineta(docx, 'Debe remitirse al Tribunal de Cuentas'));
    if (ficha.reparo.motivos?.length) {
      hijos.push(h3(docx, 'Motivos señalados por Intervención'));
      for (const m of ficha.reparo.motivos) hijos.push(vineta(docx, `${m.etiqueta} — ${m.norma}`));
    }
  }

  if (ficha.sentencias?.length) {
    hijos.push(h2(docx, 'Sentencias firmes citadas'));
    for (const s of ficha.sentencias) hijos.push(vineta(docx, `Sentencia nº ${s.referencia} — ${fmtEuro(s.importe)}`));
  }

  if (ficha.prorroga?.prorrogado) {
    hijos.push(campo(docx, 'Presupuesto', `prorrogado desde ${ficha.prorroga.desde}`));
  }

  const faltan = datosNoIncluidos(ficha);
  if (faltan.length) {
    hijos.push(h2(docx, 'Datos no incluidos en el decreto'));
    for (const d of faltan) hijos.push(vineta(docx, d));
  }

  return hijos;
}

/**
 * Aviso de cierre: cambia según si el texto de origen se anonimizó o no.
 * Usa la misma clave `anonimo` (no `sinAnonimizar`) que fichaMarkdown() y
 * fichaDocxChildren() — una discrepancia de nombre aquí haría que este aviso
 * dijera SIEMPRE "sustituidos por marcadores", incluso en un documento con
 * los nombres y DNI reales, que es precisamente el caso que más importa
 * advertir bien.
 */
function avisoCierre(docx, { anonimo = true } = {}) {
  return italica(docx, `Generado el ${new Date().toLocaleDateString('es-ES')}. Documento de trabajo interno. ` +
    (anonimo
      ? 'Los datos personales de particulares han sido sustituidos por marcadores. Revísalo antes de compartir.'
      : 'Contiene datos personales SIN anonimizar (nombres, DNI de particulares). No lo compartas fuera del grupo municipal.'));
}

export async function fichaDocxBlob(ficha, opciones = {}) {
  const docx = await cargarDocx();
  const hijos = fichaDocxChildren(docx, ficha, opciones);
  hijos.push(avisoCierre(docx, opciones));
  const doc = new docx.Document({ sections: [{ children: hijos }] });
  return docx.Packer.toBlob(doc);
}

/* ─────────── resumen de fichas (todo el lote, un único Word) ─────────── */

/**
 * Un único documento Word con la ficha técnica de cada archivo del lote, en
 * el mismo orden en que se subieron — pensado para validar un lote entero
 * (p. ej. 135 decretos) de una sentada, igual que resumenFichasMarkdown()
 * pero en formato Word. `elementos` es un array de { archivo, ficha } o
 * { archivo, error }, uno por CADA archivo subido (éxito o fallo): la
 * cobertura se cuenta por archivo, no por número de decreto, que no siempre
 * es correlativo.
 */
export async function resumenFichasDocxBlob(elementos, opciones = {}) {
  // Un lote de validación suele ser de un único mandato: repetirlo 135 veces
  // no aporta nada, así que aquí se omite por defecto (a diferencia de
  // fichaDocxBlob, donde si tiene sentido para una ficha suelta).
  const opts = { mostrarMandato: false, ...opciones };
  // `titulo` es el mismo texto que usa app.js para el nombre del archivo
  // descargado (sin la extensión): el encabezado del documento y los
  // metadatos de Word llevan siempre el mismo título que el propio archivo.
  const titulo = opts.titulo || 'Resumen de decretos — hechos objetivos';
  const docx = await cargarDocx();
  const hijos = [];

  hijos.push(h1(docx, titulo));
  hijos.push(italica(docx, 'Ficha técnica de cada archivo recibido, sin interpretación. El análisis es posterior y humano.'));

  const noLeidos = elementos.filter(e => !e.ficha);
  hijos.push(parrafo(docx,
    `Archivos recibidos: ${elementos.length} · Analizados: ${elementos.length - noLeidos.length} · No se pudieron leer: ${noLeidos.length}`));

  if (noLeidos.length) {
    hijos.push(h2(docx, 'Archivos que no se han podido leer'));
    for (const e of noLeidos) hijos.push(vineta(docx, `${e.archivo} — ${e.error}`));
  }

  for (const e of elementos) {
    if (!e.ficha) continue;
    hijos.push(parrafo(docx, `Archivo: ${e.archivo}`, { pageBreakBefore: hijos.length > 1 }));
    hijos.push(...fichaDocxChildren(docx, e.ficha, opts));
  }

  hijos.push(avisoCierre(docx, opts));

  const doc = new docx.Document({ title: titulo, sections: [{ children: hijos }] });
  return docx.Packer.toBlob(doc);
}

/* ─────────── informe consolidado (todos los hallazgos juntos) ─────────── */

export async function informeConsolidadoDocxBlob(entradas, patrones = [], resumenRegistro = null) {
  const docx = await cargarDocx();
  const hijos = [];

  hijos.push(h1(docx, 'Informe consolidado — hallazgos'));
  hijos.push(new docx.Paragraph({
    children: [new docx.TextRun({ text: 'Criterio editorial. Uso interno del grupo municipal.', bold: true })],
    spacing: { after: 120 },
  }));
  hijos.push(italica(docx,
    'Las alertas no son conclusiones ni acusaciones. Son puntos que merecen una pregunta. ' +
    'Cada hallazgo lleva el número de decreto entre corchetes: es la referencia para volver al original.'));

  const nDecretos = entradas.length;
  const totalAlertas = entradas.reduce((a, e) => a + e.alertas.length, 0);
  hijos.push(parrafo(docx,
    `Decretos analizados: ${nDecretos} · Hallazgos totales: ${totalAlertas}` +
    (resumenRegistro ? ` · Decretos en el registro acumulado: ${resumenRegistro.total}` : '')));

  if (patrones.length) {
    hijos.push(h2(docx, 'Patrones — solo visibles mirando la serie completa'));
    for (const p of patrones) {
      hijos.push(vineta(docx, `[${p.id}] ${p.titulo}${p.dobleFilo ? ' ⚠' : ''} — ${p.detalle}`));
      if (p.pregunta) hijos.push(parrafo(docx, `Pregunta: ${p.pregunta}`));
      if (p.propuesta) hijos.push(parrafo(docx, `Propuesta: ${p.propuesta}`));
      if (p.aviso) hijos.push(aviso(docx, p.aviso));
      if (p.referencias?.length) hijos.push(parrafo(docx, `Decretos: ${p.referencias.join(', ')}`));
    }
  }

  const filas = [];
  for (const { ficha, alertas } of entradas) {
    for (const a of alertas) filas.push({ ref: refDecreto(ficha), ficha, alerta: a });
  }

  const orden = { alta: 0, media: 1, baja: 2, informativa: 3 };
  const etiquetaSev = { alta: 'Prioridad alta', media: 'Prioridad media', baja: 'Prioridad baja', informativa: 'Informativo' };

  for (const sev of ['alta', 'media', 'baja', 'informativa']) {
    const grupo = filas.filter(f => f.alerta.severidad === sev)
      .sort((a, b) => (a.ficha.fecha || '').localeCompare(b.ficha.fecha || '') || a.ref.localeCompare(b.ref));
    if (!grupo.length) continue;

    hijos.push(h2(docx, etiquetaSev[sev]));
    for (const { ref, ficha, alerta: a } of grupo) {
      hijos.push(h3(docx, `[Decreto ${ref}] ${a.titulo}${a.dobleFilo ? ' ⚠' : ''}`));
      if (ficha.objeto) {
        hijos.push(italica(docx,
          `${ficha.objeto}${ficha.fecha ? ` — ${ficha.fecha}` : ''}${ficha.mandato?.etiqueta ? ` — ${ficha.mandato.etiqueta}` : ''}`));
      }
      hijos.push(parrafo(docx, a.detalle));
      if (a.norma) hijos.push(vineta(docx, `Base normativa: ${a.norma}`));
      if (a.pregunta) hijos.push(vineta(docx, `Pregunta: ${a.pregunta}`));
      if (a.replica) hijos.push(vineta(docx, `Réplica previsible: ${a.replica}`));
      if (a.propuesta) hijos.push(vineta(docx, `Propuesta alternativa: ${a.propuesta}`));
      if (a.dobleFilo) {
        hijos.push(aviso(docx, 'Doble filo: este hecho también se produce bajo mandatos anteriores. Comprueba la serie antes de usarlo.'));
      }
    }
  }

  if (!totalAlertas && !patrones.length) {
    hijos.push(parrafo(docx, 'No hay hallazgos que señalar en los decretos analizados.'));
  }

  hijos.push(italica(docx, `Generado el ${new Date().toLocaleDateString('es-ES')}. Uso interno del grupo municipal.`));

  const doc = new docx.Document({ sections: [{ children: hijos }] });
  return docx.Packer.toBlob(doc);
}
