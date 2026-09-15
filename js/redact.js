/**
 * redact.js — Detección y sustitución local de datos personales.
 *
 * Qué hace: localiza datos identificativos de particulares y los sustituye por
 * marcadores ([PERSONA_1], [DNI_1]…), guardando el mapa de equivalencias
 * SOLO en memoria del navegador. Permite (a) exportar fichas sin datos
 * personales y (b) en la Opción 3, enviar a analizar un texto ya anonimizado
 * y rehidratarlo localmente al recibir la respuesta.
 *
 * Qué NO hace: garantizar la anonimización. Es un filtro por reglas sobre
 * lenguaje administrativo. Falla con nombres poco frecuentes, con datos
 * identificativos indirectos ("el vecino del nº 4 de la calle X") y con
 * cualquier construcción que no siga los patrones previstos. En un municipio
 * pequeño la reidentificación indirecta es trivial aunque el nombre no aparezca.
 *
 * Regla de uso: revisar siempre el resultado antes de compartirlo.
 */

import { CARGOS_PUBLICOS } from './config.js';

/** Quita tildes y pasa a mayúsculas, para comparar nombres de forma estable. */
const norm = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

/** Quita tratamientos iniciales: "DON JUAN COBO ORTIZ" → "JUAN COBO ORTIZ". */
function sinTratamiento(s) {
  return s.replace(/^\s*(?:DON|DOÑA|D\.?|D[ªº]\.?|SR\.?|SRA\.?|FDO\.?:?)\s+/i, '').trim();
}

const CARGOS_NORM = new Set(CARGOS_PUBLICOS.map(norm));
const CARGOS_TOKENS = CARGOS_PUBLICOS.map(c => new Set(norm(c).split(/\s+/)));

/**
 * ¿Es un cargo público, aunque venga incompleto o con el orden cambiado?
 *
 * Los listados de pagos escriben "COBO ORTIZ JUAN" y las firmas "Juan Cobo
 * Ortiz". Y si sólo se compara la cadena completa, un recorte como "JUAN COBO"
 * se escapa y acaba anonimizando al alcalde en su propio decreto. Se compara
 * por conjunto de apellidos y nombre: si todo lo que hay está dentro de un
 * cargo conocido, es ese cargo.
 */
export function esCargoPublico(candidato) {
  const tokens = norm(sinTratamiento(candidato)).split(/\s+/).filter(w => w.length > 2);
  if (tokens.length < 2) return false;
  return CARGOS_TOKENS.some(set => tokens.every(t => set.has(t)));
}

/**
 * Términos en mayúsculas que NO son personas. Sin esto el detector
 * anonimizaría medio decreto: estos documentos gritan en mayúsculas.
 */
const NO_PERSONAS = new Set([
  // Tratamientos y artículos: si entran en la secuencia, el nombre deja de
  // coincidir con la lista de cargos públicos y se anonimiza al alcalde.
  'DON', 'DOÑA', 'SR', 'SRA', 'DA', 'EL', 'LA', 'LOS', 'LAS', 'FDO',
  'DE', 'DEL', 'Y', 'CON', 'EN', 'POR', 'PARA', 'SIN', 'SOBRE', 'HASTA', 'DESDE',
  // Vocabulario de las descripciones de factura: sin esto se anonimizan
  // los conceptos ("PVC BLANCO ESPUMADO", "CHAQUETA TRAJE DE GALA").
  'MATERIAL', 'TARJETA', 'CONTENEDOR', 'CHAQUETA', 'TRAJE', 'GALA', 'PANTALON',
  'PARED', 'VERTICAL', 'CALLE', 'PLAZA', 'AVENIDA', 'PVC', 'BLANCO', 'NEGRO',
  'ESPUMADO', 'DUPLICADOS', 'VADO', 'PERMANENTE', 'ALQUILER', 'PODA', 'PARQUES',
  'JARDINES', 'DIESEL', 'ELECTRICISTA', 'GASOLINA', 'PLOMO', 'COMBUSTIBLE',
  'COBROS', 'PAGOS', 'FACTURACION', 'COMERCIO', 'POLIDEPORTIVO', 'JEFATURA',
  'POLICIAL', 'SECTOR', 'ENTREGADO', 'REVESTIMIENTO', 'GRAFITI', 'FURGON',
  'CAMION', 'VEHICULO', 'RENTING', 'MOTOCICLETA', 'EQUIPAMIENTO', 'SUMINISTRO',
  'SUMINISTROS', 'TRANSPORTE', 'TRANSPORTES', 'RESIDUOS', 'VEGETALES', 'PLANTA',
  'MESAS', 'SILLAS', 'ELECTORALES', 'ELECCIONES', 'GENERALES', 'MANTENIMIENTO',
  'OBRA', 'ALBARAN', 'UNIVERSAL', 'ACEITE', 'CADENA', 'MOTOSIERRA', 'FOCO',
  'BATERIA', 'BRIDA', 'NYLON', 'PAQUETE', 'MANO', 'GRUPO', 'ELECTROGENO',
  'IMPUESTO', 'ELECTRICIDAD', 'CONTADOR', 'CUPS', 'DIRECCION', 'ENERGIA',
  'JUNTA', 'GOBIERNO', 'LOCAL', 'AYUNTAMIENTO', 'EXCMO', 'EXCMA', 'ILMO',
  'ALCALDE', 'ALCALDESA', 'PRESIDENTE', 'PRESIDENTA', 'CONCEJAL', 'CONCEJALA',
  'DELEGADO', 'DELEGADA', 'TENIENTE', 'INTERVENTOR', 'INTERVENCION', 'SECRETARIO',
  'SECRETARIA', 'TESORERO', 'TESORERIA', 'GENERAL', 'SEGURIDAD', 'SOCIAL',
  'NOMINAS', 'SEGUROS', 'SOCIALES', 'RESOLUCION', 'RESUELVO', 'DISPONGO',
  'DECRETO', 'PROPUESTA', 'EXPEDIENTE', 'EXTE', 'PRIMERO', 'SEGUNDO', 'TERCERO',
  'CUARTO', 'QUINTO', 'IMPORTE', 'TOTAL', 'FACTURA', 'FACT', 'PAGO', 'PAGOS',
  'GASTO', 'CREDITO', 'APLICACION', 'PRESUPUESTARIA', 'PRESUPUESTO', 'EJERCICIO',
  'LISTADO', 'APROBACION', 'DESFAVORABLE', 'FAVORABLE', 'REPARO', 'REPAROS',
  'DISCREPANCIA', 'CORPORACION', 'MUNICIPAL', 'MUNICIPIO', 'SANTA', 'FE',
  'GRANADA', 'ANDALUCIA', 'ESPAÑA', 'DIPUTACION', 'PROVINCIAL', 'JUNTA',
  'ESCUELA', 'INFANTIL', 'CENTRO', 'MAYORES', 'POLICIA', 'PROTECCION', 'CIVIL',
  'SERVICIO', 'SERVICIOS', 'CONTRATO', 'CONTRATOS', 'MENOR', 'MENORES',
  'ATENCION', 'BASICA', 'AYUDA', 'AYUDAS', 'PROGRAMA', 'URGENCIA', 'FAMILIAR',
  'INTERVENCION', 'ASISTENCIAS', 'COMISIONES', 'INFORMATIVAS', 'PLENO',
  'DOCUMENTO', 'FIRMADO', 'ELECTRONICAMENTE', 'FECHA', 'FIRMA', 'ANEXO',
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
  'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE', 'EXTRA', 'ATRASOS',
  'REMESA', 'MENU', 'ENTERO', 'TRITURADO', 'CATERING', 'RESIDUOS', 'RECOGIDA',
  'MANTENIMIENTO', 'OBRAS', 'PUBLICAS', 'URBANISMO', 'HACIENDA', 'CULTURA',
  'DEPORTES', 'EDUCACION', 'BIENESTAR', 'PERSONAL', 'RPT', 'LCSP', 'TRLRHL',
  'IBI', 'IVTM', 'IAE', 'CIF', 'NIF', 'ADO', 'PMP', 'RC', 'PIF', 'EDUSI',
]);

/** Marcadores de razón social: si aparecen, es empresa, no persona. */
const MARCA_EMPRESA =
  /\b(S\.?\s?L\.?(?:\s?U\.?|\s?P\.?)?|S\.?\s?A\.?(?:\s?U\.?)?|S\.?\s?COOP|C\.?\s?B\.?|SOCIEDAD|ASOCIACION|FEDERACION|FUNDACION|CLUB|C\.?D\.?|UTE|EMPRESA|GRUPO|COMUNIDAD DE (?:BIENES|PROPIETARIOS))\b/i;

/**
 * Contextos que indican datos de personas en situación de vulnerabilidad.
 * Si aparecen, el documento se marca como riesgo alto con independencia de
 * cuántos nombres se hayan detectado.
 */
const CONTEXTO_SENSIBLE = [
  { re: /atenci[óo]n social b[áa]sica/i, etiqueta: 'Ayudas de atención social básica' },
  { re: /(?:ayuda|programa)[^.\n]{0,40}urgencia/i, etiqueta: 'Ayudas de emergencia o urgencia social' },
  { re: /intervenci[óo]n familiar|\bPIF\b/i, etiqueta: 'Programa de intervención familiar' },
  { re: /emergencia social|exclusi[óo]n social/i, etiqueta: 'Emergencia o exclusión social' },
  { re: /dependencia|discapacidad|minusval[íi]a/i, etiqueta: 'Datos de salud o dependencia' },
  { re: /menor(?:es)? (?:de edad|tutelad)/i, etiqueta: 'Personas menores de edad' },
  { re: /exhumaci[óo]n|inhumaci[óo]n|nicho|cementerio/i, etiqueta: 'Datos de personas fallecidas y familiares' },
  { re: /violencia de g[ée]nero/i, etiqueta: 'Violencia de género' },
  { re: /expediente sancionador|infracci[óo]n|denuncia/i, etiqueta: 'Expediente sancionador' },
  { re: /pensi[óo]n (?:vitalicia|excepcional)|defunci[óo]n|fallecimiento/i, etiqueta: 'Pensión vitalicia o datos de defunción de una persona' },
];

/** Patrones de identificadores directos. Orden importante: el más específico primero. */
const PATRONES = [
  { tipo: 'DNI',      re: /\b\d{8}\s?-?\s?[A-HJ-NP-TV-Z]\b/g },
  { tipo: 'NIE',      re: /\b[XYZ]\s?-?\s?\d{7}\s?-?\s?[A-HJ-NP-TV-Z]\b/g },
  { tipo: 'IBAN',     re: /\bES\d{2}[\s-]?(?:\d{4}[\s-]?){4}\d{4}\b/g },
  { tipo: 'MATRICULA',re: /\b(?:[A-Z]{1,2}[\s-]?)?\d{4}[\s-]?[BCDFGHJKLMNPRSTVWXYZ]{3}\b/g },
  { tipo: 'CATASTRO', re: /\b\d{7}[A-Z]{2}\d{4}[A-Z]\d{4}[A-Z]{2}\b/g },
  { tipo: 'TELEFONO', re: /\b(?:\+34[\s-]?)?[6789]\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/g },
  { tipo: 'EMAIL',    re: /\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g },
];

/** Nombre precedido de tratamiento: D., Dª, DON, DOÑA, Sr., Sra. */
const RE_TRATAMIENTO =
  /\b(?:D\.|D[ªº]\.?|DON|DOÑA|Don|Doña|Sr\.|Sra\.|D\/Dª)\s+((?:[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ'’-]+(?:\s+(?:de|del|la|las|los|y)\s+)?\s*){2,5})/g;

/** Secuencia de 2 a 5 palabras en mayúsculas: el formato de las tablas de pagos. */
const RE_MAYUSCULAS =
  /\b([A-ZÁÉÍÓÚÑ]{3,}(?:\s+(?:DE|DEL|LA|LAS|LOS|Y)\s+)?(?:\s+[A-ZÁÉÍÓÚÑ]{3,}){1,4})\b/g;

/**
 * Nombres de pila frecuentes en España e Hispanoamérica.
 *
 * Sirven de filtro de precisión: en estos decretos, una secuencia en mayúsculas
 * que no contiene ningún nombre de pila casi siempre es la descripción de una
 * factura, no una persona. Sin este filtro se anonimizan los conceptos y la
 * ficha se vuelve ilegible.
 *
 * LIMITACIÓN CONOCIDA: un nombre poco frecuente o extranjero que no esté en la
 * lista se escapa. Por eso en los contextos sensibles (ayudas sociales) el
 * filtro se desactiva y se anonimiza cualquier secuencia, aunque sobre-anonimice.
 */
const NOMBRES_PILA = new Set(`
ANA ANTONIO CARMEN JOSE MANUEL FRANCISCO LAURA DAVID MARIA JUAN JAVIER DANIEL
ISABEL PILAR CRISTINA MARTA ANGEL MIGUEL RAFAEL PEDRO PABLO JESUS SERGIO JORGE
ALBERTO FERNANDO LUIS ALEJANDRO RAUL ENRIQUE RICARDO VICENTE RUBEN OSCAR ANDRES
IGNACIO ROBERTO EDUARDO SANTIAGO VICTOR IVAN ADRIAN MARCOS ALVARO GONZALO HUGO
DIEGO MARIO SAMUEL AITOR JOAQUIN GUILLERMO GABRIEL NICOLAS EMILIO TOMAS AGUSTIN
LORENZO SALVADOR RAMON JULIO CESAR FELIX ARTURO MARCO CAMILO GERARDO ISMAEL
DOLORES JOSEFA ROSA ANTONIA FRANCISCA ELENA CONCEPCION MERCEDES JULIA LUCIA
SILVIA MONICA PATRICIA SANDRA BEATRIZ ROCIO SUSANA RAQUEL EVA NURIA SONIA
ALICIA IRENE CLARA SARA NEREA ANDREA PAULA NATALIA VERONICA LORENA YOLANDA
INMACULADA ENCARNACION AMPARO MILAGROS SOLEDAD REMEDIOS PURIFICACION ASUNCION
TERESA MARGARITA VICTORIA ESPERANZA CONSUELO GLORIA NIEVES ANGELES ANGELA
FILOMENA CAROLINA JACQUELINE JOANA VANESA TAMARA NOELIA CRISTIAN JONATHAN
KEVIN BRAYAN YASMINA FATIMA MOHAMED AHMED KARIM SAID YOUSSEF ABDEL RACHID
`.trim().split(/\s+/));

const tieneNombrePila = (tokens) => tokens.some(t => NOMBRES_PILA.has(t));

function esCandidatoPersona(bruto, contexto, exigirNombrePila = true) {
  const n = norm(sinTratamiento(bruto));
  const palabras = n.split(/\s+/).filter(w => w.length > 1);
  if (palabras.length < 2 || palabras.length > 5) return false;
  if (esCargoPublico(bruto)) return false;                     // cargo público
  if (palabras.some(w => NO_PERSONAS.has(w))) return false;    // término institucional
  if (MARCA_EMPRESA.test(contexto)) return false;              // razón social
  if (/\d/.test(bruto)) return false;
  if (exigirNombrePila && !tieneNombrePila(palabras)) return false;
  return true;
}

/** En estos contextos se anonimiza sin exigir nombre de pila reconocible. */
const CONTEXTO_MAXIMA_CAUTELA =
  /\b(ayuda|atenci[óo]n social|urgencia|emergencia social|intervenci[óo]n familiar|\bPIF\b|beca|exhumaci[óo]n|inhumaci[óo]n|sancionador|infracci[óo]n|dependencia|discapacidad|menor(?:es)? de edad|violencia de g[ée]nero|devoluci[óo]n de fianza|devoluci[óo]n.{0,20}\bICIO\b|reintegro|desistimiento|pensi[óo]n (?:vitalicia|excepcional)|defunci[óo]n|fallecimiento)\b/i;

/**
 * Anonimiza un texto.
 * @param {string} texto
 * @returns {{
 *   textoAnonimo: string,
 *   mapa: Array<{marcador:string, original:string, tipo:string}>,
 *   riesgo: 'alto'|'medio'|'bajo',
 *   contextos: string[],
 *   avisos: string[]
 * }}
 */
export function anonimizar(texto, opciones = {}) {
  // `permitir` recibe los nombres de terceros que facturan al Ayuntamiento.
  // No se anonimizan: quién cobra del erario es información pública de
  // contratación, y sin ellos la detección de proveedores recurrentes —que es
  // el objeto de la herramienta— se queda sin datos.
  const permitidos = new Set((opciones.permitir || []).map(norm));
  const esPermitido = (s) => {
    const n = norm(sinTratamiento(s));
    if (permitidos.has(n)) return true;
    // Coincidencia por subconjunto: la tabla puede recortar el nombre.
    const tk = n.split(/\s+/).filter(w => w.length > 2);
    if (tk.length < 2) return false;
    return [...permitidos].some(pn => {
      const pt = new Set(pn.split(/\s+/));
      return tk.every(t => pt.has(t));
    });
  };

  const mapa = [];
  const vistos = new Map();      // original → marcador (mismo dato, mismo marcador)
  const contadores = {};
  let out = texto;

  const marcadorPara = (original, tipo) => {
    const clave = `${tipo}::${norm(original)}`;
    if (vistos.has(clave)) return vistos.get(clave);
    contadores[tipo] = (contadores[tipo] || 0) + 1;
    const marcador = `[${tipo}_${contadores[tipo]}]`;
    vistos.set(clave, marcador);
    mapa.push({ marcador, original, tipo });
    return marcador;
  };

  // 1. Identificadores directos.
  for (const { tipo, re } of PATRONES) {
    out = out.replace(re, (m) => marcadorPara(m.trim(), tipo));
  }

  // 2. Nombres con tratamiento (alta confianza).
  out = out.replace(RE_TRATAMIENTO, (m, nombre) => {
    // La captura puede arrastrar el término que sigue al nombre
    // ("D. Juan Cobo Ortiz EXTE: 10424/2023"). Se poda por la derecha.
    let palabras = nombre.trim().replace(/\s+/g, ' ').split(' ');
    while (palabras.length > 2 && NO_PERSONAS.has(norm(palabras[palabras.length - 1]))) {
      palabras.pop();
    }
    // El corte por término institucional también aplica aquí: "RUBÉN MARTINEZ
    // BERMÚDEZ CONCEJAL DE" debe quedar en el nombre para reconocer el cargo.
    const corteT = palabras.findIndex(w => NO_PERSONAS.has(norm(w)));
    if (corteT >= 2) palabras = palabras.slice(0, corteT);
    const limpio = palabras.join(' ');
    if (esCargoPublico(limpio) || esPermitido(limpio)) return m;
    return m.slice(0, m.length - nombre.length) + marcadorPara(limpio, 'PERSONA') +
           nombre.slice(limpio.length);
  });

  // 3. Secuencias en mayúsculas (confianza media).
  //
  // Las tablas de pagos encadenan nombre y concepto sin separador:
  // "NAVARRO ISLA FILOMENA AYUDA SEGUNDO SEMESTRE ATENCION SOCIAL BASICA".
  // Una expresión regular voraz se traga el conjunto, ve "AYUDA" y lo descarta,
  // dejando el nombre al descubierto. Por eso recortamos por la derecha hasta
  // dar con un segmento que sí sea un nombre plausible.
  out = out.replace(RE_MAYUSCULAS, (m, _g, offset, full) => {
    const contexto = full.slice(Math.max(0, offset - 60), offset + m.length + 60);
    // Si cualquier parte de la secuencia identifica a un cargo público,
    // se deja intacta: no es un particular.
    if (esCargoPublico(m) || esPermitido(m)) return m;

    let palabras = m.trim().split(/\s+/);

    // Corta en el primer término institucional: lo que va detrás no es nombre.
    const corte = palabras.findIndex(w => NO_PERSONAS.has(norm(w)));
    const cabeza = corte > 0 ? palabras.slice(0, corte) : (corte === 0 ? [] : palabras);

    for (let n = Math.min(cabeza.length, 5); n >= 2; n--) {
      const candidato = cabeza.slice(0, n).join(' ');
      if (esCargoPublico(candidato) || esPermitido(candidato)) return m;
      // Donde hay personas vulnerables se anonimiza aunque el nombre no se
      // reconozca; en el resto se exige un nombre de pila para no destrozar
      // las descripciones de las facturas.
      const exigir = !CONTEXTO_MAXIMA_CAUTELA.test(contexto);
      if (!esCandidatoPersona(candidato, contexto, exigir)) continue;
      const marcador = marcadorPara(sinTratamiento(candidato), 'PERSONA');
      return m.replace(candidato, marcador);
    }
    return m;
  });

  // 4. Contexto sensible.
  const contextos = CONTEXTO_SENSIBLE.filter(c => c.re.test(texto)).map(c => c.etiqueta);

  // 5. Riesgo residual.
  const nPersonas = mapa.filter(m => m.tipo === 'PERSONA').length;
  const nIds = mapa.filter(m => ['DNI', 'NIE', 'IBAN'].includes(m.tipo)).length;
  let riesgo = 'bajo';
  if (contextos.length > 0 || nIds > 0) riesgo = 'alto';
  else if (nPersonas > 0) riesgo = 'medio';

  const avisos = [];
  if (contextos.length) {
    avisos.push(
      'Este decreto afecta a personas en situaciones protegidas (' +
      contextos.join('; ') + '). No lo compartas ni lo publiques sin revisarlo entero.'
    );
  }
  if (nPersonas > 8) {
    avisos.push(
      `Se han detectado ${nPersonas} nombres de particulares. Los listados largos ` +
      'suelen contener nombres que el filtro no reconoce: revisa el texto original.'
    );
  }
  if (riesgo !== 'bajo') {
    avisos.push(
      'El filtro reduce el riesgo, no lo elimina. En un municipio pequeño una ' +
      'persona puede ser identificable por el contexto aunque su nombre esté oculto.'
    );
  }

  return { textoAnonimo: out, mapa, riesgo, contextos, avisos };
}

/** Devuelve los datos originales a un texto anonimizado. Solo local. */
export function rehidratar(texto, mapa) {
  let out = texto;
  // De más largo a más corto para que [PERSONA_10] no lo pise [PERSONA_1].
  const ordenado = [...mapa].sort((a, b) => b.marcador.length - a.marcador.length);
  for (const { marcador, original } of ordenado) {
    out = out.split(marcador).join(original);
  }
  return out;
}
