/**
 * export.js — Salidas.
 *
 * La ficha técnica (neutra) sigue siendo por decreto: es la referencia a la
 * que se vuelve cuando hace falta comprobar un dato concreto. Los HALLAZGOS
 * (antes "lectura de oposición") ya no se exportan uno por decreto — se piden
 * de golpe para no tener que abrir N documentos para ver qué hay que mirar.
 * Todo insight lleva siempre el número de decreto (o expediente) por delante,
 * precisamente para poder volver a uno concreto sin tener que releerlos todos.
 */

import { fmtEuro, datosNoIncluidos } from './parse.js';

/** El identificador por el que se puede volver a encontrar el decreto. */
const refDecreto = (ficha) => ficha.decreto || ficha.expediente || ficha.archivo || 's/n';

/* ─────────── ficha técnica (neutra, por decreto) ─────────── */

export function fichaMarkdown(ficha, opciones = {}) {
  const { anonimo = true } = opciones;
  const L = [];

  L.push(`# Decreto ${ficha.decreto || 's/n'}`);
  L.push('');
  L.push('*Ficha técnica. Contenido extraído del propio decreto, sin interpretación.*');
  L.push('');
  L.push(`**Expediente:** ${ficha.expediente || 'No consta'}  `);
  L.push(`**Tipo:** ${ficha.tipoNombre}  `);
  L.push(`**Objeto:** ${ficha.objeto || 'No consta'}  `);
  L.push(`**Fecha:** ${ficha.fecha || 'No consta'}${ficha.fechaOrigen ? ` _(${ficha.fechaOrigen})_` : ''}  `);
  L.push(`**Firmante:** ${ficha.firmante || 'No consta'}  `);
  L.push(`**Mandato:** ${ficha.mandato?.etiqueta || 'Sin determinar'}${ficha.mandato?.confianza && ficha.mandato.confianza !== 'alta' ? ` _(atribución: ${ficha.mandato.confianza})_` : ''}  `);
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
  if (anonimo) L.push('*Los datos personales de particulares han sido sustituidos por marcadores. Revísalo antes de compartir.*');

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
