/**
 * exportActa.js — Resumen en Markdown de un acta de Junta de Gobierno Local.
 *
 * Solo hechos que constan en el acta. Las intervenciones, la apertura y el
 * cierre se citan tal cual, en bloque de cita (">"): son texto del acta, no
 * resumen de quien la procesa.
 */

const dmy = (iso) => (iso ? iso.split('-').reverse().join('/') : null);

export function actaMarkdown(a) {
  const L = [];
  const sesion = [a.tipoSesion ? `sesión ${a.tipoSesion}` : 'sesión', a.fechaSesion ? `del ${dmy(a.fechaSesion)}` : null]
    .filter(Boolean).join(' ');

  L.push(`# Acta ${a.expedienteSesion || 's/n'} — ${sesion}`);
  L.push('');
  if (a.numeroActa) L.push(`**Acta nº:** ${a.numeroActa}  `);
  if (a.fechaFirma) L.push(`**Fecha de firma:** ${dmy(a.fechaFirma)}  `);
  if (a.expedienteSesion) L.push(`**Expediente de la sesión:** ${a.expedienteSesion}  `);
  L.push('');

  if (a.apertura) {
    L.push('## Apertura');
    L.push('');
    L.push(`> ${a.apertura}`);
    L.push('');
  }

  L.push(`## Puntos del orden del día — ${a.puntos.length}`);
  L.push('');
  for (const p of a.puntos) {
    L.push(`### ${p.numero}.- ${p.area ? `${p.area}. ` : ''}${p.objeto}`);
    L.push('');
    if (p.area) L.push(`**Área:** ${p.area}  `);
    if (p.expediente) L.push(`**Expediente:** ${p.expediente}  `);
    if (p.sentido) L.push(`**Sentido:** ${p.sentido}  `);
    if (p.votos) {
      const v = p.votos;
      const cabecera = [p.tipoVotacion, p.mayoria].filter(Boolean).join(' · ');
      L.push(`**Votación:** ${cabecera ? `${cabecera} · ` : ''}a favor ${v.aFavor}, en contra ${v.enContra}, abstenciones ${v.abstenciones}, ausentes ${v.ausentes}  `);
    }
    L.push('');

    if (p.intervenciones.length) {
      L.push('**Intervenciones** (literal):');
      L.push('');
      for (const i of p.intervenciones) { L.push(`> ${i}`); L.push(''); }
    }
    if (p.acuerdos.length) {
      L.push('**Acuerdo:**');
      L.push('');
      for (const x of p.acuerdos) L.push(`- ${x}`);
      L.push('');
    }
    if (p.resolucion.length) {
      L.push('**Resolución:**');
      L.push('');
      for (const r of p.resolucion) L.push(`- **${r.ordinal}.** ${r.texto}`);
      L.push('');
    }
    if (p.importes.length) {
      L.push(`**Importes que constan en la resolución:** ${p.importes.join(' · ')}  `);
      L.push('');
    }
    if (p.anexos.length) {
      L.push('**Anexos:**');
      L.push('');
      for (const x of p.anexos) L.push(`- ${x}`);
      L.push('');
    }
  }

  if (a.cierre) {
    L.push('## Cierre');
    L.push('');
    L.push(`> ${a.cierre}`);
    L.push('');
  }
  return L.join('\n');
}
