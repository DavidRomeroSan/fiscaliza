/**
 * parse.js — Clasificación y extracción de campos.
 *
 * Los patrones están calibrados sobre decretos reales del Ayuntamiento de
 * Santa Fe tramitados en esPublico Gestiona (2023–2026). Otros gestores
 * (Aytos/Sedipualba, Absis) usan encabezados distintos: ver docs/01-arquitectura.md,
 * sección "Portar a otro ayuntamiento".
 */

import { MANDATOS } from './config.js';
import { extraerLineas, agruparPorTercero, mayoresCuantias, sumaLineas } from './lineas.js';
import { esCargoPublico } from './redact.js';

/* ────────────────────────── utilidades ────────────────────────── */

const MESES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

/** "5.199,98" → 5199.98. Tolera el error tipográfico "6.100.33" que aparece en el corpus. */
export function aNumero(str) {
  if (!str) return null;
  let s = String(str).replace(/[\s€]/g, '');
  const ultimaComa = s.lastIndexOf(',');
  const ultimoPunto = s.lastIndexOf('.');
  if (ultimaComa > ultimoPunto) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (ultimoPunto > -1 && s.length - ultimoPunto === 3 && /\./.test(s.slice(0, ultimoPunto))) {
    // "6.100.33" → miles + decimales con punto por error de tecleo
    s = s.slice(0, ultimoPunto).replace(/\./g, '') + '.' + s.slice(ultimoPunto + 1);
  } else {
    s = s.replace(/\.(?=\d{3}\b)/g, '');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Formatea a mano en vez de usar `toLocaleString('es-ES', {style:'currency'…})`:
 * los datos CLDR actuales de "es" fijan `minimumGroupingDigits` en 2, así que
 * el propio Intl del navegador (y de Node) deja SIN separador de miles
 * cualquier importe de cuatro cifras — "5199,98 €" en vez de "5.199,98 €" — y
 * eso no se puede forzar con la opción `minimumGroupingDigits` del propio
 * Intl. Como este es precisamente el rango donde caen muchos importes de
 * decretos municipales, un formateador propio es más fiable que confiar en
 * el locale.
 */
export const fmtEuro = (n) => {
  if (n == null) return 'No consta';
  const signo = n < 0 ? '-' : '';
  const [entero, decimales] = Math.abs(n).toFixed(2).split('.');
  const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${signo}${conMiles},${decimales} €`;
};

function buscar(texto, re, grupo = 1) {
  const m = texto.match(re);
  return m ? (m[grupo] || '').trim() : null;
}

/* ────────────────────────── fecha y mandato ────────────────────────── */

/**
 * Número y fecha reales del decreto, leídos del pie que esPublico Gestiona
 * repite en cada página ("DECRETO" / "Número: 2026-1651" / "Fecha:
 * 28/08/2026", en el margen).
 *
 * Ese pie es texto rotado 90°, y extraerTexto() (ver extract.js) reconstruye
 * líneas agrupando por posición vertical: un giro de 90° hace que sus
 * fragmentos caigan en las mismas filas que líneas de cuerpo con las que no
 * tienen relación. Comprobado contra decretos reales de 2026, "DECRETO",
 * "Número:" y "Fecha:" NO salen garantizados contiguos ni en ese orden — así
 * que buscarlos como una sola frase seguida no funciona. Lo que sí es
 * estable: la mención "Fecha: DD/MM/YYYY" más cercana (antes o después, por
 * distancia de caracteres) al primer "Número: XXXX-NNNN" del texto es la
 * fecha real de ESE decreto — nunca la fecha de una solicitud o de un informe
 * citados en el cuerpo, que quedan mucho más lejos (miles de caracteres, no
 * cientos, en los decretos reales contra los que se ha comprobado esto).
 */
function datosDelPieDecreto(texto) {
  const numMatch = texto.match(/\bN[uú]mero:\s*(\d{4}[-\/]\d{3,5})/i);
  if (!numMatch) return { decreto: null, fecha: null };

  let mejor = null, mejorDist = Infinity;
  for (const f of texto.matchAll(/\bFecha:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/gi)) {
    const d = Math.abs(f.index - numMatch.index);
    if (d < mejorDist) { mejor = f; mejorDist = d; }
  }
  // Comprobado contra decretos reales: la pareja correcta de "Número:" y
  // "Fecha:" del mismo pie cae hasta a ~600 caracteres de distancia (según
  // cómo reparta itemsALineas() el texto rotado entre líneas de cuerpo), pero
  // cualquier otra fecha del cuerpo (solicitud, informe...) queda a miles de
  // caracteres — hay un salto claro entre ambos casos. 1000 dejaría margen de
  // sobra sin cruzar a la zona de las fechas que no son del pie.
  const fecha = mejor && mejorDist < 1000 ? iso(mejor[3], mejor[2], mejor[1]) : null;
  return { decreto: numMatch[1], fecha };
}

/**
 * Los decretos de Santa Fe suelen decir "a fecha de firma electrónica" y no
 * llevan fecha en el cuerpo. La fecha fiable viene de la sesión de la Junta de
 * Gobierno Local, de la propuesta de resolución o del propio ejercicio del
 * expediente. En ese orden de preferencia.
 */
export function extraerFecha(texto) {
  // Se comprueba ANTES que cualquier fecha citada en el cuerpo: validado
  // contra decretos reales de 2026, el patrón genérico de fecha suelta puede
  // coincidir con la fecha de una delegación de Alcaldía citada en el
  // encabezamiento ("Resolución de Alcaldía n.º 2023-1200 de 22 de junio de
  // 2023..."), que no es la fecha de ESTE decreto, sino de la delegación que
  // le da competencia al firmante.
  const delPie = datosDelPieDecreto(texto);
  if (delPie.fecha) return { iso: delPie.fecha, origen: 'Fecha del propio decreto (pie de página)' };

  // El reparo cita siempre informes de Secretaría de 2015 y 2018. Si no se
  // excluyen, el decreto acaba fechado una década antes de existir.
  const limpio = texto.replace(
    /informe[^.]{0,80}de fecha\s+\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}/gi, ' '
  );

  // Fecha contable de las operaciones: "ADO 30/08/2023". Es la más fiable en
  // los decretos de facturas, que no llevan fecha en el cuerpo.
  const ado = [...texto.matchAll(/\b(?:ADO|PMP|RC|O)\s+(\d{2})\/(\d{2})\/(\d{4})\b/g)];
  if (ado.length) {
    const x = ado[0];
    return { iso: iso(x[3], x[2], x[1]), origen: 'Fecha contable de las operaciones' };
  }

  let m = limpio.match(
    /sesi[óo]n celebrada el\s+(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i
  );
  if (m) return { iso: iso(m[3], MESES[m[2].toLowerCase()], m[1]), origen: 'Sesión de la Junta de Gobierno Local' };

  m = limpio.match(/PR\/\d{4}\/\d+\s+de\s+(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
  if (m) return { iso: iso(m[3], MESES[m[2].toLowerCase()], m[1]), origen: 'Propuesta de resolución' };

  m = limpio.match(/Fecha de iniciaci[óo]n:\s*(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
  if (m) return { iso: iso(m[3], MESES[m[2].toLowerCase()], m[1]), origen: 'Fecha de iniciación del expediente' };

  m = limpio.match(/\b(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?(\d{4})\b/i);
  if (m) return { iso: iso(m[3], MESES[m[2].toLowerCase()], m[1]), origen: 'Fecha citada en el asunto' };

  // Se descartan las fechas que forman parte de un periodo de facturación
  // ("01/11/2022 - 30/11/2022"): no son la fecha del decreto.
  const sueltas = [...limpio.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)]
    .filter(x => {
      const antes = limpio.slice(Math.max(0, x.index - 3), x.index);
      const despues = limpio.slice(x.index + x[0].length, x.index + x[0].length + 3);
      return !/-\s*$/.test(antes) && !/^\s*-/.test(despues);
    });
  if (sueltas.length) {
    const x = sueltas[0];
    return { iso: iso(x[3], x[2], x[1]), origen: 'Fecha citada en el documento' };
  }

  // Último recurso: mes y año del asunto ("NÓMINAS NOVIEMBRE 2023").
  m = limpio.match(/\b(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(?:DE\s+)?(\d{4})\b/i);
  if (m) return { iso: iso(m[2], MESES[m[1].toLowerCase()], 15), origen: 'Mes indicado en el asunto (aproximada)' };

  return { iso: null, origen: null };
}

const iso = (y, mth, d) =>
  `${y}-${String(mth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Firmante real del decreto. Determina la atribución política. */
export function extraerFirmante(texto) {
  const patrones = [
    /(?:DON|DOÑA|D\.|D[ªº]\.?)\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{6,60}?),?\s*(?:ALCALDE|ALCALDESA|PRIMER TENIENTE|CONCEJAL)/,
    // Los decretos de facturas los firma con frecuencia el concejal de Hacienda,
    // no la Alcaldía. Sin este patrón el decreto se queda sin firmante y sin
    // atribución de mandato.
    /EL CONCEJAL DELEGADO[^F]{0,80}Fdo\.?:?\s*(?:D\.)?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s.]{6,60})/i,
    // "Dª. PATRICIA CARRASCO FLORES, COMO ALCALDESA PRESIDENTA"
    /(?:DON|DOÑA|D\.|D[ªº]\.?)\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{6,60}?),?\s*(?:COMO\s+)?(?:ALCALDE|ALCALDESA)/,
    // "La Alcaldesa Presidenta Dª. Patricia Carrasco Flores"
    /L[AO]S?\s+ALCALDES?A?\s+PRESIDENT[AE]\s*(?:D[ªº]\.?|D\.)?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s.]{6,60})/i,
    // "EL ALCALDE- PRESIDENTE." (decreto real 2026-1528, ayuda social) tiene
    // GUION Y ESPACIO entre ambas palabras, y un punto antes de "Fdo.": el
    // "[- ]?" original solo admitía UNO de esos dos caracteres separadores
    // (no los dos a la vez), así que el patrón no llegaba a "Fdo." y el
    // decreto se quedaba sin firmante.
    /EL ALCALDE[-\s]*(?:PRESIDENTE)?\.?\s*Fdo\.?:?\s*(?:D\.)?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s.]{6,60})/i,
    /LA ALCALDESA\s*Fdo\.?:?\s*(?:D[ªº]\.)?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s.]{6,60})/i,
  ];
  for (const re of patrones) {
    const v = buscar(texto, re);
    if (v) return v.replace(/\s+/g, ' ').replace(/[.,]$/, '').trim();
  }
  return null;
}

/**
 * ¿Firma un concejal delegado, no la Alcaldía?
 *
 * Validado contra decretos reales de 2026: varios concejales (Hacienda,
 * Urbanismo, Mantenimiento...) firman a diario en virtud de la misma
 * Resolución de Alcaldía nº 2023-1200, de 22 de junio de 2023, que delega
 * la gestión de sus áreas — "EL CONCEJAL DELEGADO" / "LA CONCEJAL DELEGADA".
 * Sin reconocer esto, la atribución de mandato marcaba "confianza: revisar"
 * en la inmensa mayoría de los decretos de la serie, como si una delegación
 * legítima y citada en el propio decreto fuera una anomalía a comprobar.
 */
export function esConcejalDelegado(texto) {
  return /CONCEJAL[A]?\s+DELEGAD[OA]/i.test(texto);
}

/**
 * Cruza fecha y firmante contra la tabla de mandatos.
 *
 * Cada mandato puede cubrir varias alcaldías (ver MANDATOS en config.js): esto
 * no es un detalle menor, es lo que evita atribuir tres años y medio de
 * decretos de un alcalde a su sucesora solo porque comparten mandato y partido.
 * La atribución se resuelve primero a nivel de alcaldía —quién firmaba ese
 * día— y el mandato se deriva de ahí, nunca al revés.
 *
 * `firmaPorDelegacion` evita que una delegación legítima (concejal delegado
 * firmando en su área, cargo público ya verificado en CARGOS_PUBLICOS) se
 * marque como "revisar": solo se exige comprobación manual cuando el firmante
 * no está reconocido, que es el caso realmente dudoso.
 */
export function atribuirMandato(fechaIso, firmante, firmaPorDelegacion = false) {
  const norm = (s) =>
    (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

  const alcaldiaPorFecha = (fecha) => {
    for (const m of MANDATOS) {
      if (fecha < m.desde || fecha > m.hasta) continue;
      const a = (m.alcaldias || []).find(x => fecha >= x.desde && fecha <= x.hasta);
      return { mandato: m, alcaldia: a || null };
    }
    return null;
  };

  const alcaldiaPorNombre = (nombre) => {
    for (const m of MANDATOS) {
      const a = (m.alcaldias || []).find(x => norm(x.nombre) === norm(nombre));
      if (a) return { mandato: m, alcaldia: a };
    }
    return null;
  };

  if (fechaIso) {
    const r = alcaldiaPorFecha(fechaIso);
    if (r) {
      const { mandato, alcaldia } = r;
      const coincide = !firmante || !alcaldia || norm(alcaldia.nombre) === norm(firmante);
      const delegacionReconocida = !coincide && firmaPorDelegacion && firmante && esCargoPublico(firmante);
      let confianza = 'alta', nota = null;
      if (!alcaldia) {
        confianza = 'revisar';
        nota = `La fecha cae en el ${mandato.etiqueta} pero no coincide con ningún subperíodo de alcaldía registrado. Comprueba el dato: puede faltar actualizar config.js.`;
      } else if (!coincide && !delegacionReconocida) {
        confianza = 'revisar';
        nota = `La fecha corresponde a la alcaldía de ${alcaldia.nombre} (${mandato.etiqueta}) pero firma ${firmante}. Puede ser una delegación, una sustitución o un error de fecha.`;
      }
      // Si hay delegación reconocida, se mantiene confianza "alta" y sin nota:
      // el propio decreto ya declara la delegación y el firmante es un cargo
      // público ya verificado, no hace falta volver a comprobarlo cada vez.
      return {
        id: mandato.id, etiqueta: mandato.etiqueta, partido: mandato.partido,
        alcaldia: alcaldia ? alcaldia.nombre : (firmante || null),
        confianza, nota,
      };
    }
  }

  if (firmante) {
    const r = alcaldiaPorNombre(firmante);
    if (r) {
      return {
        id: r.mandato.id, etiqueta: r.mandato.etiqueta, partido: r.mandato.partido,
        alcaldia: r.alcaldia.nombre, confianza: 'media',
        nota: 'Atribuido por firmante: no se ha podido fechar el decreto.',
      };
    }
  }

  return {
    id: null, etiqueta: 'Sin determinar', partido: null, alcaldia: firmante || null, confianza: 'nula',
    nota: 'No se ha podido determinar ni la fecha ni el firmante. No uses este decreto en público sin comprobarlo a mano.',
  };
}

/* ────────────────────────── clasificación ────────────────────────── */

const TIPOS = [
  {
    id: 'nominas',
    nombre: 'Nóminas y seguros sociales',
    test: (t) => /n[óo]minas/i.test(t) && /(seguros sociales|tesorer[íi]a general (?:de la )?seguridad social)/i.test(t),
    peso: 100,
  },
  {
    id: 'reparo',
    nombre: 'Levantamiento de reparo',
    test: (t) => /art[íi]culo\s*217|art\.?\s*217/i.test(t) && /solventar/i.test(t),
    peso: 90,
  },
  {
    id: 'pagos',
    nombre: 'Ordenación de pagos',
    test: (t) => /(procedimiento:\s*pagos|propuesta de pago|ordenar el pago)/i.test(t) || /art[íi]culo\s*186\.1/i.test(t),
    peso: 80,
  },
  {
    id: 'facturas',
    nombre: 'Aprobación de facturas y obligaciones',
    test: (t) => /(reconocimiento de (?:la )?obligaci[óo]n|relaci[óo]n de facturas|aprobaci[óo]n de operaciones|aprobar las siguientes operaciones|aprobaci[óo]n gastos|listado de aprobaci[óo]n|importe tercero nombre ter)/i.test(t),
    peso: 70,
  },
  {
    id: 'junta_gobierno',
    nombre: 'Convocatoria de Junta de Gobierno Local',
    // Peso por encima de 'nominas' (100) a propósito: el orden del día de
    // una convocatoria real (2026-1533) incluye un punto sobre nóminas y
    // seguros sociales entre los ocho a tratar, y con menos peso que
    // 'nominas' la convocatoria entera se etiquetaba como si fuera ella
    // misma la resolución de nóminas — no lo es, solo la convoca.
    test: (t) => /convocatoria/i.test(t) && /junta de gobierno local/i.test(t) && /orden del d[íi]a/i.test(t),
    peso: 110,
  },
  {
    id: 'bonificacion',
    nombre: 'Bonificación fiscal',
    test: (t) => /bonificaci[óo]n/i.test(t) && /(IBI|IVTM|ICIO|tasa|impuesto)/i.test(t),
    peso: 50,
  },
  {
    id: 'multa',
    nombre: 'Sanción o multa',
    // Validado contra decretos reales de licencias de 2026: la cláusula de
    // estilo "se levantará acta de denuncia a los efectos de imponer las
    // sanciones que correspondiesen" aparece en CASI TODAS las licencias y
    // autorizaciones (advierte de lo que podría pasar si se incumplen las
    // condiciones), y con "imponer.{0,20}sanción" a secas bastaba para que
    // el motor etiquetara la licencia entera como si fuera ella misma una
    // sanción. Ahora se exige un acto sancionador real: un expediente
    // sancionador con número concreto, o una resolución que impone la
    // sanción, no una advertencia genérica sobre sanciones futuras.
    test: (t) => /expediente sancionador\s*n[ºo°.]{0,3}\s*\d|procedimiento sancionador\s*n[ºo°.]{0,3}\s*\d|\bSE\s+(?:ACUERDA|RESUELVE|IMPONE)\b[^.]{0,60}\bsanci[óo]n/i.test(t),
    peso: 50,
  },
  {
    id: 'licencia_actividad',
    nombre: 'Licencia de actividad o autorización urbanística',
    // Es, con diferencia, el tipo más repetido del lote de 2026 (casetas,
    // atracciones y puestos de feria): sin esta categoría, más de 100 de
    // 135 decretos caían en "General / no clasificado" solo por no tener
    // clasificador propio, no porque el motor no supiera de qué trataban.
    test: (t) => /procedimiento:\s*licencia (?:de actividades y espect[áa]culos p[úu]blicos|o autorizaci[óo]n urban[íi]stica)/i.test(t),
    peso: 55,
  },
  {
    // El índice del libro de decretos (documento que se sube junto al lote,
    // con la relación de todos los decretos incluidos) no es un decreto:
    // clasificarlo como tal producía número de decreto, fecha y objeto
    // inventados a partir del primer decreto listado dentro del propio
    // índice. Peso máximo: si aparece este patrón, ningún otro clasificador
    // debe competir.
    id: 'indice',
    nombre: 'Índice del libro de decretos (no es un decreto individual)',
    test: (t) => /[ÍI]NDICE DE DOCUMENTOS/i.test(t) && /Libro:?\s*Libro de Decretos/i.test(t),
    peso: 999,
  },
  {
    id: 'solicitud_info',
    nombre: 'Solicitud de información',
    test: (t) => /(solicitud de (?:informaci[óo]n|acceso)|acceso a la informaci[óo]n p[úu]blica)/i.test(t),
    peso: 40,
  },
  {
    // Es el informe anual (o plurianual) del Interventor al Pleno con la
    // relación agregada de reparos del artículo 218 — no un decreto
    // individual. Se distingue aparte porque las fechas que contiene
    // describen el PERIODO que resume ("entre el 1 de enero de 2021 y el 31
    // de diciembre de 2022"), no la fecha del propio informe: si se dejara
    // caer en la extracción de fecha genérica, la primera fecha del periodo
    // se presentaría como si fuera la fecha del documento, y con ella se
    // atribuiría a un mandato que puede no ser el que realmente lo firmó.
    id: 'informe_218',
    nombre: 'Informe anual de reparos (art. 218 TRLRHL)',
    test: (t) => /informe de intervenci[óo]n/i.test(t) && /art[íi]culo\s*218/i.test(t) && /eleva/i.test(t),
    peso: 95,
  },
];

export function clasificar(texto, nLineas = 0) {
  const candidatos = TIPOS.filter(t => t.test(texto)).sort((a, b) => b.peso - a.peso);

  // Una relación de facturas sustancial (≥3 líneas) indica que el decreto
  // versa realmente sobre un lote de gasto. Pero "versa sobre" no es lo mismo
  // que "es indistintamente 'facturas'": una ordenación de pagos (art. 186
  // TRLRHL, con su propio informe de prelación de Tesorería) y una aprobación
  // de gasto (arts. 214-215) son procedimientos legalmente distintos, y las
  // dos contienen listas de líneas por definición. Forzar siempre "facturas"
  // borraría esa distinción y reclasificaría casi cualquier decreto de pagos.
  //
  // Lo que sí hay que corregir es que "reparo" o "general" —que describen una
  // circunstancia o no describen nada— ganen por peso a la categoría que
  // describe el objeto real del decreto cuando ese objeto es identificable.
  // Entre 'facturas' y 'pagos', cuando ambos son candidatos legítimos, gana
  // el que de verdad coincide con el texto (el peso ya refleja eso); esta
  // corrección solo actúa cuando el ganador natural es 'reparo' o no hay
  // ganador.
  if (nLineas >= 3) {
    const top = candidatos[0];
    const esCircunstancial = !top || top.id === 'reparo';
    if (esCircunstancial) {
      const sustantivo = candidatos.find(c => c.id === 'facturas' || c.id === 'pagos');
      if (sustantivo) {
        candidatos.splice(candidatos.indexOf(sustantivo), 1);
        candidatos.unshift(sustantivo);
      } else if (!top) {
        candidatos.unshift({ id: 'facturas', nombre: 'Aprobación de facturas y obligaciones' });
      }
    }
  }

  const principal = candidatos[0] || { id: 'general', nombre: 'General / no clasificado' };
  return {
    tipo: principal.id,
    tipoNombre: principal.nombre,
    // Un decreto de nóminas o facturas puede llevar un reparo embebido:
    // se registra como secundario, no cambia el formato de la ficha.
    secundarios: candidatos.slice(1).map(c => ({ tipo: c.id, nombre: c.nombre })),
  };
}

/* ────────────────────────── extracción de campos ────────────────────────── */

export function extraerExpediente(texto) {
  return (
    // Las convocatorias de Junta de Gobierno Local usan su propio formato
    // "JGL/2026/32" en vez del numérico habitual. Se comprueba antes que el
    // patrón genérico: si no, "Expediente: JGL/2026/32" no casaba (no son
    // solo cifras) y la búsqueda seguía hasta coger, equivocado, el primer
    // expediente numérico citado dentro de un punto del orden del día.
    buscar(texto, /\bExpediente\s*N?[.ºo°]*\s*:?\s*(JGL\/\d{4}\/\d{1,4})/i) ||
    buscar(texto, /\bEXPEDIENTE\s+N?[.ºo°]*\s*:?\s*(\d{1,6}\/\d{4})/i) ||
    buscar(texto, /\bExpediente\s*N?[.ºo°]*\s*:?\s*(\d{1,6}\/\d{4})/i) ||
    buscar(texto, /\bEXTE[.:]?\s*(\d{1,6}\/\d{4})/i) ||
    buscar(texto, /(\d{1,6}\/\d{4})\s+Expediente/i)
  );
}

export function extraerNumeroDecreto(texto, nombreArchivo = '') {
  return (
    // Mismo pie de página que extraerFecha() (ver datosDelPieDecreto). Es la
    // fuente más fiable — se comprueba antes que el patrón genérico de
    // "decreto/resolución nº X", que puede casar con una delegación de
    // Alcaldía citada en el cuerpo en vez de con el número del propio
    // decreto.
    datosDelPieDecreto(texto).decreto ||
    buscar(texto, /(?:decreto|resoluci[óo]n)\s*(?:de alcald[íi]a)?\s*n?[.ºo°]*\s*:?\s*(\d{4}[-\/]\d{3,5})/i) ||
    buscar(texto, /\bPR\/(\d{4}\/\d+)/i) ||
    buscar(nombreArchivo, /(\d{4}[-_]\d{3,5})/) ||
    buscar(nombreArchivo, /_(\d{3})\./)
  );
}

/**
 * Todos los importes del texto, de mayor a menor.
 *
 * En las tablas de "aprobación de operaciones" los importes van SIN símbolo de
 * euro ("2023 9209 22103 76,71"), de modo que exigir el € deja fuera decretos
 * enteros de facturas. Se aceptan también las cantidades con dos decimales que
 * siguen a una aplicación presupuestaria.
 */
export function extraerImportes(texto) {
  const vals = [];
  let m;

  const conEuro = /(\d{1,3}(?:\.\d{3})*(?:[.,]\d{2})?)\s*€/g;
  while ((m = conEuro.exec(texto)) !== null) {
    const n = aNumero(m[1]);
    if (n != null && n > 0) vals.push(n);
  }

  const enTabla = /\b\d{4}\s+\d{3,4}\s+\d{5}\s+(\d{1,3}(?:\.\d{3})*,\d{2})\b/g;
  while ((m = enTabla.exec(texto)) !== null) {
    const n = aNumero(m[1]);
    if (n != null && n > 0) vals.push(n);
  }

  return [...new Set(vals)].sort((a, b) => b - a);
}

/**
 * Importe explícitamente declarado como TOTAL del decreto — solo las dos
 * fórmulas que de verdad resumen el conjunto ("importe total de X€",
 * "ascienden a un importe total X€"). Deliberadamente NO incluye "por
 * importe de X€" a secas: esa fórmula también abre cada punto individual de
 * una propuesta con varios apartados numerados (tres pólizas de seguro en un
 * mismo RESUELVO, por ejemplo), y usarla como "el total" agarra el importe
 * del primer punto y lo presenta como si fuera la suma de los tres — un
 * error real que apareció calibrando contra un decreto así.
 */
function importeTotalExplicito(texto) {
  const decl =
    buscar(texto, /importe\s+total(?:\s+de)?\s+(\d{1,3}(?:\.\d{3})*(?:[.,]\d{2})?)\s*€/i) ||
    buscar(texto, /ascienden a un importe total\s+(\d{1,3}(?:\.\d{3})*(?:[.,]\d{2})?)\s*€/i);
  return decl ? aNumero(decl) : null;
}

/**
 * Importe principal del decreto.
 *
 * Prioridad: el total explícito. Si no consta y el decreto tiene como mucho
 * una línea de proveedor, la fórmula débil "por importe de X€" (fiable
 * cuando solo hay un punto que declarar). Si no consta nada de eso, el mayor
 * importe del documento — descartando antes el bloque de sentencias firmes,
 * porque una condena de 904.861,57 € citada como antecedente no es el gasto
 * que aprueba el decreto.
 */
export function extraerImporteTotal(texto, nLineas = 0) {
  const explicito = importeTotalExplicito(texto);
  if (explicito != null) return explicito;

  if (nLineas <= 1) {
    const debil = buscar(texto, /por importe (?:total )?de\s+(\d{1,3}(?:\.\d{3})*(?:[.,]\d{2})?)\s*€/i);
    if (debil) return aNumero(debil);

    const sinSentencias = texto.replace(/Sentencia firme[\s\S]{0,600}?(?=Sentencia firme|RESUELVO|$)/gi, ' ');
    const todos = extraerImportes(sinSentencias);
    return todos.length ? todos[0] : null;
  }

  // Con varias líneas ya extraídas de forma fiable, "el importe más grande
  // que aparece en el texto" no es una aproximación razonable del total —
  // puede ser, y en la práctica fue, el importe de un solo punto de una
  // propuesta con varios apartados. Mejor no declarar total aquí y dejar que
  // analizar() use la suma real de las líneas.
  return null;
}

/** Aplicaciones presupuestarias: "3231.221.05", "3234.22105", "9212 22100". */
export function extraerAplicaciones(texto) {
  const re = /\b(\d{3,4})[.\s](\d{3})[.\s](\d{2})\b|\b(\d{3,4})[.\s](\d{5})\b/g;
  const out = new Set();
  let m;
  while ((m = re.exec(texto)) !== null) {
    out.add(m[1] ? `${m[1]}.${m[2]}.${m[3]}` : `${m[4]}.${m[5]}`);
  }
  return [...out];
}

/** Proveedores: razón social con marcador societario, o CIF con nombre delante. */
/** "AXIAL MEDITERRANEA S.L." y "AXIAL MEDITERRANEA S.L" son el mismo tercero. */
function claveProveedor(nombre) {
  return nombre.toUpperCase()
    .replace(/[.,]/g, '')
    .replace(/\bS\s?L\s?U\b/g, 'SLU')
    .replace(/\bS\s?L\b/g, 'SL')
    .replace(/\bS\s?A\b/g, 'SA')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extraerProveedores(texto) {
  const out = new Map();

  const reCif = /([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9\s.,&'’-]{3,60}?)\s*\(?\s*(?:CIF|NIF)\s*:?\s*([ABCDEFGHJNPQRSUVW]-?\d{7}-?[0-9A-J])\s*\)?/gi;
  let m;
  while ((m = reCif.exec(texto)) !== null) {
    const nombre = m[1].replace(/\s+/g, ' ').replace(/^(?:a|para el pago a|favor de)\s+/i, '').trim();
    out.set(claveProveedor(nombre), { nombre, cif: m[2].toUpperCase() });
  }

  const reSoc = /\b([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9\s.,&'’-]{3,60}?\s+S\.?\s?[LA]\.?(?:\s?U\.?|\s?P\.?)?)\b/g;
  while ((m = reSoc.exec(texto)) !== null) {
    const nombre = m[1].replace(/\s+/g, ' ').trim();
    const clave = claveProveedor(nombre);
    if (!out.has(clave)) out.set(clave, { nombre, cif: null });
  }

  return [...out.values()];
}

/** Objeto del decreto: el asunto declarado, o la primera frase con contenido. */
export function extraerObjeto(texto) {
  // "Asunto del Expediente:" es una variante real (decretos de licencias y
  // autorizaciones): con el colon opcional del patrón anterior, "Asunto" ya
  // casaba sin haber llegado al colon real, y la captura se quedaba con
  // "del Expediente: Puesta en funcionamiento..." en vez del contenido.
  const asunto = buscar(texto, /\bAsunto(?:\s+del\s+Expediente)?\s*:\s*([^\n]{10,200})/i);
  if (asunto) return asunto.replace(/\s*Procedimiento\s*:.*$/i, '').trim();

  const concepto = buscar(texto, /en concepto de\s+[“"]?([^”"\n.]{10,200})/i);
  if (concepto) return concepto.trim();

  // Exige el colon: sin él, la palabra "propuesta" suelta en medio de una
  // frase de cuerpo ("el Informe-Propuesta emitido por el Equipo de SSC, la
  // Propuesta de Gasto de la Sr. Concejal...", en un decreto real de ayuda
  // social sin campo "Asunto") se colaba entera como si fuera el objeto.
  const propuesta = buscar(texto, /PROPUESTA\s*:\s*([^\n]{10,220})/i);
  if (propuesta) return propuesta.trim();

  // "APROBAR una Ayuda de..." / "APROBAR el pago a...": el verbo resolutivo
  // de los decretos de ayudas y pagos a justificar, que no llevan "Asunto:"
  // ni "PROPUESTA:" propios — sin este fallback, la ficha se quedaba con el
  // objeto vacío pese a que la frase que de verdad importa está ahí.
  // Sin excluir el punto: "a favor de D./Dª ELENA..." tiene el punto de la
  // abreviatura "D." a los pocos caracteres, y con [^\n.] la captura se
  // cortaba ahí ("Aprobar una Ayuda..., a favor de D.") en vez de coger la
  // frase completa. El límite de longitud ya evita que se cuele el párrafo
  // entero. Y se busca sobre el texto con saltos de línea colapsados a
  // espacios: en el PDF real (2026-1528) la frase se parte justo después de
  // "a favor de" por el propio ajuste de línea del documento — no es un
  // punto y aparte — y sin colapsarlo la captura se quedaba ahí cortada.
  const aprobar = buscar(texto.replace(/\s+/g, ' '), /\bAPROBAR\s+([^\n]{10,200})/i);
  if (aprobar) return `Aprobar ${aprobar.trim()}`;

  return null;
}

/**
 * Persona física a favor de quien se reconoce un gasto: ayudas sociales,
 * pagos a justificar, pensiones... — el dato que de verdad importa en estos
 * decretos y que ningún otro campo de la ficha recogía (el objeto suele ser
 * solo el título genérico del programa, "PAGOS AGOSTO 2026" o similar).
 *
 * Solo casa con nombres precedidos de tratamiento (D./Dña./Don/Doña): así se
 * excluyen los "a favor de" que en este corpus son siempre una entidad
 * (NOMINAS, Tesorería General..., una S.L., la Junta de Gobierno) y que ya
 * cubre extraerProveedores(). Si el texto está anonimizado, captura el
 * marcador ([PERSONA_1]) tal cual: sigue identificando que HAY un
 * beneficiario, aunque el nombre esté sustituido.
 */
export function extraerBeneficiario(texto) {
  const m = texto.match(
    /(?:a favor de|para el pago a)\s+(?:D\.?\s*\/\s*D[ªº]\.?|D[ªº]\.?|DON|DO[ÑN]A|D\.)\s*([A-ZÁÉÍÓÚÑ\[][^,.\n(]{2,80}?)(?=\s*(?:,|\.|\(|\bcon\s+(?:DNI|NIF)|\n|$))/i
  );
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

/**
 * Puntos del orden del día de una convocatoria de Junta de Gobierno Local.
 * Sin esto, una convocatoria solo decía "sesión ordinaria del día X a las
 * 9:00" — sin los puntos que se van a tratar, que es justo lo que interesa
 * fiscalizar ANTES de que se celebre la sesión, no después.
 */
export function extraerOrdenDelDia(texto) {
  const bloque = buscar(
    texto,
    /ORDEN DEL D[ÍI]A:?\s*([\s\S]{20,4000}?)(?:\n\s*SEGUNDO\.|\n\s*TERCERO\.|$)/i
  );
  if (!bloque) return [];

  // El pie de esPublico Gestiona (ver datosDelPieDecreto) es texto rotado en
  // el margen: itemsALineas() (extract.js) lo intercala como líneas sueltas
  // entre las del cuerpo, y aquí caería en medio de la frase de un punto del
  // orden del día si no se quita antes de trocear por número.
  const limpio = bloque
    .replace(/^\s*Fecha:\s*\d{1,2}\/\d{1,2}\/\d{4}\s*$/gim, '')
    .replace(/^\s*N[uú]mero:\s*\d{4}[-\/]\d{3,5}\s*$/gim, '')
    .replace(/^\s*DECRETO\s*$/gim, '');

  // Cada punto empieza una línea propia con "N. " (1 o 2 cifras: los códigos
  // de expediente y aplicación del cuerpo tienen 4 cifras o más, así que no
  // se confunden). Se corta en el siguiente punto, en el siguiente apartado
  // con letra (B), C)...) o al final del bloque.
  const puntos = [];
  const re = /(?:^|\n)\s*\d{1,2}\.\s+([\s\S]+?)(?=\n\s*\d{1,2}\.\s|\n\s*[A-Z]\)\s|$)/g;
  let m;
  while ((m = re.exec(limpio)) !== null) {
    const punto = m[1].replace(/\s+/g, ' ').trim();
    if (punto) puntos.push(punto);
  }
  return puntos;
}

/* ────────────────────────── el reparo, en detalle ────────────────────────── */

/**
 * Los motivos son literales recurrentes del Interventor. Reconocerlos permite
 * agrupar reparos por causa a lo largo de meses, que es donde está el patrón.
 */
const MOTIVOS_REPARO = [
  { id: 'contrato_menor_recurrente', etiqueta: 'Prestaciones recurrentes tramitadas como contrato menor',
    re: /car[áa]cter (?:peri[óo]dico|recurrente)|requiere repetidamente en el tiempo|requerimientos sucesivos/i,
    norma: 'Art. 118.1 y 29.8 LCSP 9/2017' },
  { id: 'sin_licitacion', etiqueta: 'Ausencia de procedimiento de licitación',
    re: /no se ha seguido ning[úu]n tipo de procedimiento de licitaci[óo]n|se deber[íi]a haber articulado un procedimiento de licitaci[óo]n/i,
    norma: 'Art. 118.1 LCSP 9/2017' },
  { id: 'sin_informe_justificativo', etiqueta: 'Falta el informe justificativo del contrato',
    re: /informe justificativo del contrato/i,
    norma: 'Art. 118.1 LCSP 9/2017' },
  { id: 'incumple_instruccion_interna', etiqueta: 'Incumplimiento de las instrucciones internas sobre contratos menores',
    re: /Instrucci[óo]n (?:Conjunta )?1\/201[89]/i,
    norma: 'Instrucción Conjunta 1/2018 y 1/2019 del propio Ayuntamiento' },
  { id: 'advertencia_reiterada', etiqueta: 'Advertencia ya formulada en informes anteriores de Secretaría',
    re: /informe emitido (?:por|desde) el [áa]rea de [Ss]ecretar[íi]a de fecha/i,
    norma: 'Informes de Secretaría de 16/07/2015 y 23/04/2018' },
  { id: 'personal_irregularidades', etiqueta: 'Irregularidades en la asignación de trabajo del personal',
    re: /irregularidades en la asignaci[óo]n de trabajo/i,
    norma: 'Reparo de Intervención sobre nóminas' },
  { id: 'personal_contratos_lesivos', etiqueta: 'Contratos laborales que pueden perjudicar a las arcas municipales',
    re: /contratos laborales que pueden ocasionar perjuicio/i,
    norma: 'Reparo de Intervención sobre nóminas' },
  { id: 'competencias_impropias', etiqueta: 'Gastos de servicios que no son competencia municipal',
    re: /no son de competencia municipal|Ley 27\/2013/i,
    norma: 'Ley 27/2013 de racionalización y sostenibilidad de la Administración Local' },
  { id: 'tasa_reposicion', etiqueta: 'Contrataciones sin respetar los límites de la Ley de Presupuestos del Estado',
    re: /art[íi]culo 20 apartado Cinco|art\.?\s*20\.\s*Cinco/i,
    norma: 'Art. 20.Cinco de la Ley de PGE aplicable' },
  { id: 'complementos_personales', etiqueta: 'Irregularidades en el pago de complementos personales',
    re: /complementos personales/i,
    norma: 'Reparo de Intervención sobre nóminas' },
  { id: 'prelacion_pagos', etiqueta: 'Incumplimiento de la prelación legal de pagos',
    re: /no se cumple la prelaci[óo]n de pagos|prelaci[óo]n de pagos imperativa/i,
    norma: 'Art. 187 TRLRHL y art. 14 LO 2/2012' },
  { id: 'sin_plan_disposicion', etiqueta: 'No se ha aprobado el plan de disposición de fondos',
    re: /debe aprobarse un plan de disposici[óo]n de fondos/i,
    norma: 'Art. 187 TRLRHL / RD 500/1990' },
  { id: 'sin_plan_tesoreria', etiqueta: 'No se ha aprobado el plan de tesorería',
    re: /debe aprobarse un plan de tesorer[íi]a/i,
    norma: 'Art. 13.6 y 16.3 LO 2/2012' },
  { id: 'pmp_incumplido', etiqueta: 'Incumplimiento del periodo medio de pago a proveedores',
    re: /no cumple este plazo de periodo medio de pago|debe publicarse el periodo medio de pago/i,
    norma: 'LO 2/2012 y RD 635/2014' },
  { id: 'intereses_demora', etiqueta: 'Devengo de intereses de demora por retraso en el pago',
    re: /intereses de demora|inter[ée]s de demora/i,
    norma: 'Art. 198.4 LCSP 9/2017' },
  { id: 'pension_sin_competencia', etiqueta: 'Pago de una pensión que no es competencia municipal',
    re: /no es competencia (?:del ayuntamiento|municipal) la concesi[óo]n de pensiones|pensi[óo]n[^.]{0,60}no se adecua a la normativa/i,
    norma: 'Texto Refundido de la Ley General de la Seguridad Social (RDL 8/2015) — la concesión de pensiones no es competencia municipal' },
  { id: 'contratacion_fuera_plantilla', etiqueta: 'Personal contratado fuera de plantilla y RPT, con riesgo de relación indefinida',
    re: /personal contratado que no est[áa] previsto en la plantilla ni en la RPT|art[íi]culo 15 del Estatuto de los Trabajadores/i,
    norma: 'Art. 15.1.a, 15.3 y 15.5 del Estatuto de los Trabajadores' },
  { id: 'personal_fuera_grupo_programa', etiqueta: 'Personal trabajando en un grupo de programa distinto del presupuestado',
    re: /grupos de programa \(presupuestarios\) distintos de los previstos|romper la vinculaci[óo]n establecida/i,
    norma: 'Art. 18 RD 500/1990 y Bases de Ejecución del Presupuesto' },
  { id: 'temporalidad_excesiva', etiqueta: 'Volumen de altas de personal temporal incompatible con el carácter excepcional exigido por ley',
    re: /no se proceder[áa] a la contrataci[óo]n de personal temporal[^.]{0,40}salvo (?:en )?casos excepcionales/i,
    norma: 'Art. 19.Dos y 19.Seis de la Ley de Presupuestos Generales del Estado aplicable' },
];

export function analizarReparo(texto) {
  // Los motivos se buscan siempre. En los decretos de ordenación de pagos el
  // informe desfavorable del Tesorero y del Interventor no se enuncia con la
  // fórmula "presenta reparo", y si se condiciona la búsqueda a esa fórmula se
  // pierden las incidencias de tesorería, que son las mejor fundadas de todas.
  const motivos = MOTIVOS_REPARO.filter(m => m.re.test(texto))
    .map(({ id, etiqueta, norma }) => ({ id, etiqueta, norma }));

  const hay = /presenta(?:\s+su)?\s+reparo|se present[óo]\s+reparo|con reparos?\b|nota de reparo|informe de reparo|se informa desfavorablemente/i.test(texto);

  if (!hay) return { hayReparo: false, motivos };

  return {
    hayReparo: true,
    suspensivo: /art[íi]culo\s*216|reparo suspensivo/i.test(texto),
    levantado: /solventar/i.test(texto) && /art[íi]culo\s*217|art\.?\s*217/i.test(texto),
    aFavorDe: buscar(texto, /discrepancia a favor de\s+(?:la\s+)?([^,.\n]{3,60})/i),
    debeIrAlPleno: /art\.?\s*218\s*TRLRHL|dar[áse]{0,3} cuenta al Pleno/i.test(texto),
    debeIrAlTribunalDeCuentas: /Tribunal de Cuentas/i.test(texto),
    fiscalizacionDesfavorable: /desfavorable/i.test(texto),
    motivos,
    // Defensa recurrente del equipo de gobierno: útil para anticipar la réplica.
    defensaHeredado: /(?:se ha encontrado|encontrado) el servicio sin licitar|contratado por la anterior Corporaci[óo]n|se producen desde hace a[ñn]os/i.test(texto),
    defensaEnriquecimientoInjusto: /enriquecimiento injusto/i.test(texto),
    defensaRPT: /(?:nueva\s+)?RPT/i.test(texto),
  };
}

/** Sentencias firmes citadas: contingencia económica declarada en el propio decreto. */
export function extraerSentencias(texto) {
  const re = /Sentencia firme n[ºo°]?\s*([\d\/]+)[^.]{0,400}?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€/gi;
  const out = [];
  let m;
  while ((m = re.exec(texto)) !== null) {
    out.push({ referencia: m[1], importe: aNumero(m[2]), fragmento: m[0].slice(0, 300) });
  }
  return out;
}

/* ────────────────────────── ficha completa ────────────────────────── */

export function analizar(texto, nombreArchivo = '') {
  const lineas = extraerLineas(texto);
  const clasificacion = clasificar(texto, lineas.filter(l => l.tipo === 'proveedor').length);

  // El índice no tiene número, fecha ni firmante propios que extraer: son
  // del lote, no de un decreto. Se corta aquí para no dejar que los patrones
  // genéricos cojan por error el primer decreto listado dentro del índice.
  if (clasificacion.tipo === 'indice') {
    return {
      lineas: [], porTercero: [], mayores: [], nFacturas: 0, sumaLineas: 0, cuadra: null,
      archivo: nombreArchivo,
      ...clasificacion,
      decreto: null,
      expediente: null,
      objeto: 'Índice del libro de decretos: no es un decreto individual, es el listado de la remesa recibida.',
      beneficiario: null,
      ordenDelDia: [],
      fecha: null,
      fechaOrigen: null,
      firmante: null,
      mandato: { id: null, etiqueta: 'No aplica (no es un decreto)', partido: null, alcaldia: null, confianza: 'nula', nota: null },
      importeTotal: null,
      importes: [],
      aplicaciones: [],
      proveedores: [],
      reparo: { hayReparo: false, motivos: [] },
      sentencias: [],
      prorroga: { prorrogado: false },
      vinculacionJuridica: false,
    };
  }

  const fecha = extraerFecha(texto);
  const firmante = extraerFirmante(texto);
  let mandato = atribuirMandato(fecha.iso, firmante, esConcejalDelegado(texto));

  // En un informe anual de reparos, la fecha que se detecta en el cuerpo del
  // texto es casi siempre el inicio del periodo que resume ("entre el 1 de
  // enero de 2021 y el 31 de diciembre de 2022"), no la fecha del propio
  // informe. Presentarla con la misma confianza que la fecha de un decreto
  // individual sería engañoso: el informe puede haberse elevado al Pleno
  // años después del periodo que describe.
  if (clasificacion.tipo === 'informe_218' && mandato.confianza !== 'nula') {
    mandato = {
      ...mandato,
      confianza: 'revisar',
      nota: 'Este es un informe agregado (art. 218): la fecha detectada probablemente sea el INICIO DEL PERIODO que resume, no la fecha en que se elevó el informe al Pleno. Comprueba la fecha real a mano antes de usar la atribución de mandato.',
    };
  }
  const porTercero = agruparPorTercero(lineas);
  const nProveedor = lineas.filter(l => l.tipo === 'proveedor').length;
  const totalDeclarado = extraerImporteTotal(texto, nProveedor);
  const sumaDeLineas = sumaLineas(lineas.filter(l => l.tipo === 'proveedor'));

  return {
    lineas,
    porTercero,
    mayores: mayoresCuantias(lineas.filter(l => l.tipo === 'proveedor'), 8),
    nFacturas: lineas.filter(l => l.tipo === 'proveedor').length,
    sumaLineas: sumaDeLineas,
    // Si la suma de las líneas no cuadra con el total declarado, la extracción
    // se ha dejado facturas por el camino. Se declara en vez de disimularlo.
    cuadra: totalDeclarado == null || sumaDeLineas === 0
      ? null
      : Math.abs(sumaDeLineas - totalDeclarado) < Math.max(1, totalDeclarado * 0.01),
    archivo: nombreArchivo,
    ...clasificacion,
    decreto: extraerNumeroDecreto(texto, nombreArchivo),
    expediente: extraerExpediente(texto),
    objeto: extraerObjeto(texto),
    beneficiario: extraerBeneficiario(texto),
    ordenDelDia: extraerOrdenDelDia(texto),
    fecha: fecha.iso,
    fechaOrigen: fecha.origen,
    firmante,
    mandato,
    importeTotal: totalDeclarado != null ? totalDeclarado : (sumaDeLineas > 0 ? sumaDeLineas : null),
    importes: extraerImportes(texto).slice(0, 12),
    aplicaciones: extraerAplicaciones(texto),
    proveedores: (() => {
      const dePorTercero = porTercero.map(t => ({ nombre: t.nombre || t.cif, cif: t.cif }));
      const delTexto = extraerProveedores(texto);
      const norm = (n) => (n || '').toUpperCase().replace(/[.,]/g, '')
        .replace(/\bS\s?L\s?U\b/g, 'SLU').replace(/\bS\s?L\b/g, 'SL')
        .replace(/\bS\s?A\b/g, 'SA').replace(/\s+/g, ' ').trim();
      const vistos = new Set(dePorTercero.map(p => norm(p.nombre)));
      return [...dePorTercero, ...delTexto.filter(p => {
        const k = norm(p.nombre);
        if (vistos.has(k)) return false;
        vistos.add(k);
        return true;
      })];
    })(),
    reparo: analizarReparo(texto),
    sentencias: extraerSentencias(texto),
    prorroga: /presupuesto de \d{4} prorrogado de (\d{4})/i.test(texto)
      ? { prorrogado: true, desde: buscar(texto, /presupuesto de \d{4} prorrogado de (\d{4})/i) }
      : { prorrogado: false },
    // Imputación a nivel de vinculación jurídica (B01... B03 en rules.js): se
    // extrae aquí, como campo estructurado, porque el registro (registry.js)
    // nunca persiste el texto íntegro del decreto. Si la alerta comprobara el
    // texto directamente —como hacía antes— funcionaría al analizar en vivo
    // pero se quedaría muda para siempre en el informe consolidado, que
    // recalcula las alertas a partir de las fichas guardadas, no del texto.
    vinculacionJuridica: /nivel de vinculaci[óo]n/i.test(texto),
  };
}

/** Campos que no se han podido extraer, para declararlos expresamente en la ficha. */
export function datosNoIncluidos(ficha) {
  if (ficha.tipo === 'indice') return [];
  const faltan = [];
  if (!ficha.decreto) faltan.push('No consta número de decreto.');
  if (!ficha.expediente) faltan.push('No consta número de expediente.');
  if (!ficha.objeto) faltan.push('No se ha podido identificar el objeto del decreto.');
  if (ficha.importeTotal == null) faltan.push('No consta importe económico.');
  if (!ficha.fecha) faltan.push('No consta fecha (el decreto se firma electrónicamente sin fecha en el cuerpo).');
  if (!ficha.firmante) faltan.push('No consta el firmante.');
  if (!ficha.aplicaciones.length) faltan.push('No consta aplicación presupuestaria.');
  if (ficha.cuadra === false) {
    faltan.push(
      `La suma de las facturas extraídas (${fmtEuro(ficha.sumaLineas)}) no coincide con el ` +
      `total declarado (${fmtEuro(ficha.importeTotal)}): la lectura automática ha perdido líneas. ` +
      'Comprueba la relación completa en el decreto original.'
    );
  }
  return faltan;
}
