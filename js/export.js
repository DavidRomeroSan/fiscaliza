/**
 * export.js — Salidas.
 *
 * La ficha técnica (neutra) sigue siendo por decreto: es la referencia a la
 * que se vuelve cuando hace falta comprobar un dato concreto. Los HALLAZGOS
 * (antes "lectura de oposición") ya no se exportan uno por decreto — se piden
 * de golpe para no tener que abrir N documentos para ver qué hay que mirar.
 * Todo insight lleva siempre el número de decreto (o expediente) por delante,
 * precisamente para poder volver a uno concreto sin tener que releerlos todos.
 *
 * Tercera salida, para validar la extracción a escala: resumenFichasMarkdown()
 * junta las fichas técnicas de todos los archivos subidos en un único
 * documento, sin criterio editorial (eso es informeConsolidadoMarkdown) y con
 * cobertura por ARCHIVO — no por número de decreto, que no siempre es
 * correlativo.
 */

import { fmtEuro, datosNoIncluidos } from './parse.js';

/** El identificador por el que se puede volver a encontrar el decreto. */
const refDecreto = (ficha) => ficha.decreto || ficha.expediente || ficha.archivo || 's/n';

/* ─────────── ficha técnica (neutra, por decreto) ─────────── */

export function fichaMarkdown(ficha, opciones = {}) {
  const { anonimo = true, mostrarMandato = true } = opciones;
  const L = [];

  if (ficha.tipo === 'indice') {
    L.push('# Índice del libro de decretos');
    L.push('');
    L.push('*No es un decreto individual: es el listado de la remesa recibida.*');
    return L.join('\n');
  }

  L.push(`# Decreto ${ficha.decreto || 's/n'}`);
  L.push('');
  L.push('*Ficha técnica. Contenido extraído del propio decreto, sin interpretación.*');
  L.push('');
  L.push(`**Expediente:** ${ficha.expediente || 'No consta'}  `);
  L.push(`**Tipo:** ${ficha.tipoNombre}  `);
  L.push(`**Objeto:** ${ficha.objeto || 'No consta'}  `);
  if (ficha.beneficiario) L.push(`**Beneficiario:** ${ficha.beneficiario}  `);
  L.push(`**Fecha:** ${ficha.fecha || 'No consta'}${ficha.fechaOrigen ? ` _(${ficha.fechaOrigen})_` : ''}  `);
  L.push(`**Firmante:** ${ficha.firmante || 'No consta'}  `);
  if (mostrarMandato) {
    L.push(`**Mandato:** ${ficha.mandato?.etiqueta || 'Sin determinar'}${ficha.mandato?.confianza && ficha.mandato.confianza !== 'alta' ? ` _(atribución: ${ficha.mandato.confianza})_` : ''}  `);
  }
  L.push(`**Importe:** ${fmtEuro(ficha.importeTotal)}`);
  L.push('');

  if (ficha.aplicaciones?.length) {
    L.push('**Aplicaciones presupuestarias:** ' + ficha.aplicaciones.join(', '));
    L.push('');
  }

  if (ficha.nFacturas > 0) {
    L.push(`## Relación de facturas — ${ficha.nFacturas} líneas`);
    L.push('');
    if (ficha.cuadra === false) {
      L.push(`> **Aviso:** las facturas leídas suman ${fmtEuro(ficha.sumaLineas)} frente a los ` +
             `${fmtEuro(ficha.importeTotal)} declarados. La lectura automática ha perdido líneas: ` +
             'comprueba la relación completa en el decreto original.');
      L.push('');
    }
    L.push('| Tercero | Facturas | Importe | % decreto |');
    L.push('|---|---:|---:|---:|');
    for (const t of ficha.porTercero) {
      const pct = ficha.sumaLineas ? (t.importe / ficha.sumaLineas) * 100 : 0;
      L.push(`| ${t.nombre || t.cif || '—'}${t.cif && t.nombre ? ` (${t.cif})` : ''} | ${t.nFacturas} | ${fmtEuro(t.importe)} | ${pct.toFixed(0)} % |`);
    }
    L.push('');
    if (ficha.mayores?.length > 1) {
      L.push('**Facturas de mayor cuantía**');
      L.push('');
      for (const l of ficha.mayores) {
        L.push(`- **${fmtEuro(l.importe)}** — ${l.nombre || l.cif || 'tercero no identificado'}` +
          (l.concepto ? `. ${l.concepto.slice(0, 160)}` : '') +
          (l.aplicacion ? ` *(${l.aplicacion})*` : ''));
      }
      L.push('');
    }
  } else if (ficha.proveedores?.length) {
    L.push('**Terceros identificados:**');
    for (const p of ficha.proveedores) {
      L.push(`- ${p.nombre}${p.cif ? ` (${p.cif})` : ''}`);
    }
    L.push('');
  }

  if (ficha.reparo?.hayReparo) {
    L.push('## Reparo de Intervención');
    L.push('');
    L.push(`- Reparo${ficha.reparo.suspensivo ? ' suspensivo' : ''}: sí`);
    if (ficha.reparo.levantado) L.push(`- Solventado por Alcaldía (art. 217 TRLRHL)${ficha.reparo.aFavorDe ? ` a favor de ${ficha.reparo.aFavorDe}` : ''}`);
    if (ficha.reparo.fiscalizacionDesfavorable) L.push('- Resultado de la fiscalización: desfavorable');
    if (ficha.reparo.debeIrAlPleno) L.push('- Debe darse cuenta al Pleno (art. 218 TRLRHL)');
    if (ficha.reparo.debeIrAlTribunalDeCuentas) L.push('- Debe remitirse al Tribunal de Cuentas');
    if (ficha.reparo.motivos?.length) {
      L.push('');
      L.push('**Motivos señalados por Intervención:**');
      for (const m of ficha.reparo.motivos) L.push(`- ${m.etiqueta} — *${m.norma}*`);
    }
    L.push('');
  }

  if (ficha.sentencias?.length) {
    L.push('## Sentencias firmes citadas');
    L.push('');
    for (const s of ficha.sentencias) L.push(`- Sentencia nº ${s.referencia} — ${fmtEuro(s.importe)}`);
    L.push('');
  }

  if (ficha.prorroga?.prorrogado) {
    L.push(`**Presupuesto:** prorrogado desde ${ficha.prorroga.desde}`);
    L.push('');
  }

  const faltan = datosNoIncluidos(ficha);
  if (faltan.length) {
    L.push('## Datos no incluidos en el decreto');
    L.push('');
    for (const d of faltan) L.push(`- ${d}`);
    L.push('');
  }

  L.push('---');
  L.push(`*Generado el ${new Date().toLocaleDateString('es-ES')}. Documento de trabajo interno.*`);
  L.push(anonimo
    ? '*Los datos personales de particulares han sido sustituidos por marcadores. Revísalo antes de compartir.*'
    : '*Contiene datos personales SIN anonimizar (nombres, DNI de particulares). No lo compartas fuera del grupo municipal.*');

  return L.join('\n');
}

/* ─────────── resumen de todos los archivos (hechos, sin criterio editorial) ─────────── */

/**
 * La ficha técnica de cada archivo subido, una detrás de otra, en un único
 * documento — sin pregunta, réplica ni propuesta: eso es criterio editorial
 * y va en el informe consolidado, no aquí. Pensado para comprobar la
 * extracción a escala: la cobertura se cuenta por ARCHIVO subido, no por
 * número de decreto (que no siempre es correlativo y no sirve para saber si
 * falta alguno). Si se suben 135 archivos, aparecen 135 entradas — con lo
 * que se ha podido extraer, o con el motivo por el que no.
 *
 * `elementos`: array de `{ archivo, ficha }` (procesado con éxito) o
 * `{ archivo, error }` (no se pudo leer), EN EL ORDEN en que se subieron.
 *
 * `opciones` se reenvía a fichaMarkdown() en cada entrada: `mostrarMandato`
 * (por defecto false aquí — un lote de validación suele ser de un único
 * mandato, y repetirlo 135 veces no aporta nada) y `anonimo` (por defecto
 * true; en false, el texto de origen no se ha anonimizado y así se advierte
 * en el pie de cada ficha).
 */
export function resumenFichasMarkdown(elementos, opciones = {}) {
  const { mostrarMandato = false, anonimo = true } = opciones;
  const L = [];
  L.push('# Resumen de decretos — hechos objetivos');
  L.push('');
  L.push('*Ficha técnica de cada archivo recibido, sin interpretación. El análisis es posterior y humano.*');
  L.push('');

  const noLeidos = elementos.filter(e => !e.ficha);
  L.push(`Archivos recibidos: ${elementos.length} · Analizados: ${elementos.length - noLeidos.length} · No se pudieron leer: ${noLeidos.length}`);
  L.push('');

  if (noLeidos.length) {
    L.push('## Archivos que no se han podido leer');
    L.push('');
    for (const e of noLeidos) L.push(`- **${e.archivo}** — ${e.error}`);
    L.push('');
  }

  for (const e of elementos) {
    if (!e.ficha) continue;
    L.push(`**Archivo:** \`${e.archivo}\``);
    L.push('');
    L.push(fichaMarkdown(e.ficha, { mostrarMandato, anonimo }));
    L.push('');
    L.push('---');
    L.push('');
  }

  return L.join('\n');
}

/* ─────────── informe consolidado (todos los hallazgos juntos) ─────────── */

/**
 * Un único documento con todos los hallazgos de todos los decretos
 * analizados, ordenados por prioridad. Cada línea lleva el número de decreto
 * (o expediente, si no hay número) delante — esa es la referencia para volver
 * a un decreto concreto sin tener que releer la remesa entera.
 *
 * `entradas` es un array de { ficha, alertas, lectura }.
 * `patrones` y `resumenRegistro` son opcionales: si se pasan, el informe
 * abre con lo que solo se ve mirando la serie completa (proveedores
 * recurrentes, motivos repetidos), que es más importante que cualquier
 * hallazgo suelto de un decreto individual.
 */
export function informeConsolidadoMarkdown(entradas, patrones = [], resumenRegistro = null) {
  const L = [];
  L.push('# Informe consolidado — hallazgos');
  L.push('');
  L.push('**Criterio editorial. Uso interno del grupo municipal.**');
  L.push('');
  L.push('*Las alertas no son conclusiones ni acusaciones. Son puntos que merecen una pregunta.*');
  L.push('*Cada hallazgo lleva el número de decreto entre corchetes: es la referencia para volver al original.*');
  L.push('');

  const nDecretos = entradas.length;
  const totalAlertas = entradas.reduce((a, e) => a + e.alertas.length, 0);
  L.push(`Decretos analizados: ${nDecretos} · Hallazgos totales: ${totalAlertas}` +
    (resumenRegistro ? ` · Decretos en el registro acumulado: ${resumenRegistro.total}` : ''));
  L.push('');

  // ── patrones: lo que solo se ve mirando la serie completa ──
  if (patrones.length) {
    L.push('## Patrones — solo visibles mirando la serie completa');
    L.push('');
    for (const p of patrones) {
      L.push(`- **[${p.id}] ${p.titulo}${p.dobleFilo ? ' ⚠︎' : ''}** — ${p.detalle}`);
      if (p.pregunta) L.push(`  Pregunta: ${p.pregunta}`);
      if (p.propuesta) L.push(`  Propuesta: ${p.propuesta}`);
      if (p.aviso) L.push(`  ⚠︎ ${p.aviso}`);
      if (p.referencias?.length) L.push(`  Decretos: ${p.referencias.join(', ')}`);
    }
    L.push('');
  }

  // ── hallazgos por decreto, agrupados por severidad y con el número siempre visible ──
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

    L.push(`## ${etiquetaSev[sev]}`);
    L.push('');
    for (const { ref, ficha, alerta: a } of grupo) {
      L.push(`### [Decreto ${ref}] ${a.titulo}${a.dobleFilo ? ' ⚠︎' : ''}`);
      L.push('');
      if (ficha.objeto) L.push(`*${ficha.objeto}${ficha.fecha ? ` — ${ficha.fecha}` : ''}${ficha.mandato?.etiqueta ? ` — ${ficha.mandato.etiqueta}` : ''}*`);
      L.push('');
      L.push(a.detalle);
      L.push('');
      if (a.norma) L.push(`- **Base normativa:** ${a.norma}`);
      if (a.pregunta) L.push(`- **Pregunta:** ${a.pregunta}`);
      if (a.replica) L.push(`- **Réplica previsible:** ${a.replica}`);
      if (a.propuesta) L.push(`- **Propuesta alternativa:** ${a.propuesta}`);
      if (a.dobleFilo) L.push('- **⚠︎ Doble filo:** este hecho también se produce bajo mandatos anteriores. Comprueba la serie antes de usarlo.');
      L.push('');
    }
  }

  if (!totalAlertas && !patrones.length) {
    L.push('No hay hallazgos que señalar en los decretos analizados.');
    L.push('');
  }

  L.push('---');
  L.push(`*Generado el ${new Date().toLocaleDateString('es-ES')}. Uso interno del grupo municipal.*`);
  return L.join('\n');
}

/* ─────────── descarga ─────────── */

export function descargar(nombre, contenido, tipo = 'text/markdown;charset=utf-8') {
  const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const nombreArchivo = (ficha, sufijo, extension = 'md') =>
  `decreto_${(ficha.decreto || ficha.expediente || 'sn').replace(/[\/\s]/g, '-')}_${sufijo}.${extension}`;
