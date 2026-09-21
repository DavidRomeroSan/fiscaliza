/**
 * exportActa.js — Resumen en Markdown de un acta de Junta de Gobierno Local.
 *
 * Solo hechos que constan en el acta. Las intervenciones y el cierre se citan
 * tal cual, en bloque de cita (">"): son texto del acta, no resumen de quien
 * la procesa. De la apertura solo se dan los nombres de quienes asisten.
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

  const as = a.asistentes;
  if (as) {
    L.push('## Apertura');
    L.push('');
    if (as.presidente.length) L.push(`**Preside:** ${as.presidente.join(', ')}  `);
    if (as.concejales.length) L.push(`**Concejales asistentes:** ${as.concejales.join(', ')}  `);
    if (as.invitados.length) L.push(`**Invitados:** ${as.invitados.join(', ')}  `);
    if (as.secretaria.length) L.push(`**Secretaría:** ${as.secretaria.join(', ')}  `);
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
    if (p.puestos) {
      L.push(`**Puestos de trabajo que ofertan las bases (Anexo ${p.puestos.anexo}):**`);
      L.push('');
      L.push('| Puesto | Plazas |');
      L.push('|---|---|');
      for (const f of p.puestos.filas) L.push(`| ${f.puesto} | ${f.plazas} |`);
      if (p.puestos.total != null) L.push(`| Total | ${p.puestos.total} |`);
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
