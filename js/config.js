/**
 * config.js — Configuración local del municipio.
 *
 * ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA USAR LA HERRAMIENTA EN OTRO AYUNTAMIENTO.
 *
 * Todo lo demás (extracción, clasificación, alertas) es genérico para decretos
 * de régimen local español tramitados en gestores tipo esPublico Gestiona / Aytos.
 */

export const MUNICIPIO = {
  nombre: 'Santa Fe',
  provincia: 'Granada',
  // Sirve para reconocer el pie de página institucional y limpiarlo del texto.
  pieInstitucional: /Ayuntamiento de Santa Fe[\s\S]{0,120}?Fax:\s*958\s*44\s*26\s*18/gi,
};

/**
 * MANDATOS — crítico para la atribución temporal.
 *
 * Sin esto la herramienta es peligrosa: los reparos estructurales (nóminas,
 * contratación recurrente, prórroga presupuestaria) atraviesan cambios de
 * gobierno y el texto del Interventor es literalmente idéntico bajo distintos
 * alcaldes. Una alerta sin atribución acaba señalando a tu propio partido.
 *
 * CADA MANDATO PUEDE TENER VARIAS ALCALDÍAS. Esto no es una previsión teórica:
 * calibrando la herramienta contra decretos reales apareció un decreto de
 * julio de 2022 firmado por "Manuel Alberto Gil Corral, Alcalde", no por
 * Patricia Carrasco Flores. Verificado por prensa (El Independiente de
 * Granada, La Voz de Granada, 20/01/2023): Gil Corral fue alcalde desde la
 * constitución de 2019 y renunció el 19/01/2023 tras cumplir su compromiso de
 * ejercer solo dos legislaturas (8 años); Carrasco —entonces 2ª teniente de
 * alcalde y concejala de Hacienda— tomó posesión al día siguiente, el
 * 20/01/2023, en un relevo interno del propio PSOE, no por moción de censura.
 * Es decir: de los casi cuatro años del mandato 2019–2023, Gil Corral firmó
 * unos tres años y medio, y Carrasco Flores solo los últimos cinco meses.
 * Tratar todo el mandato como "Carrasco Flores" habría sido un error de
 * atribución sobre la inmensa mayoría de esos decretos.
 *
 * Los rangos son inclusive-inclusive, formato ISO. Los rangos de `alcaldias`
 * deben cubrir sin huecos el rango del mandato que las contiene.
 */
export const MANDATOS = [
  {
    id: 'psoe-2019',
    desde: '2019-06-15',
    hasta: '2023-06-16',
    partido: 'PSOE',
    etiqueta: 'Mandato 2019–2023 (PSOE)',
    alcaldias: [
      { desde: '2019-06-15', hasta: '2023-01-19', nombre: 'Manuel Alberto Gil Corral' },
      { desde: '2023-01-20', hasta: '2023-06-16', nombre: 'Patricia Carrasco Flores' },
    ],
  },
  {
    id: 'pp-2023',
    desde: '2023-06-17',
    hasta: '2027-06-30',
    partido: 'PP',
    etiqueta: 'Mandato 2023–2027 (PP + Vox)',
    alcaldias: [
      { desde: '2023-06-17', hasta: '2027-06-30', nombre: 'Juan Cobo Ortiz' },
    ],
  },
];

/**
 * CARGOS PÚBLICOS — personas que actúan en calidad institucional.
 *
 * NO se anonimizan: son cargos públicos ejerciendo función pública en un
 * documento público. Anonimizarlos vaciaría de contenido el resumen.
 * Cualquier persona que NO esté en esta lista se trata como particular.
 *
 * Normaliza sin tildes y en mayúsculas al comparar (ver redact.js).
 */
export const CARGOS_PUBLICOS = [
  // Alcaldía (los tres, ver nota sobre MANDATOS más arriba)
  'JUAN COBO ORTIZ',
  'PATRICIA CARRASCO FLORES',
  'MANUEL ALBERTO GIL CORRAL',
  // Habilitados nacionales — firman informes, no son "terceros"
  'PABLO EMILIO MARTIN MARTIN',        // Interventor
  // Corporación 2023–2027 (aparecen en decretos de asistencias a órganos)
  'FRANCISCO JAVIER VALENCIA JORDAN',
  'SUSANA LEYVA PEREZ',
  'ANGEL LOPEZ CARREÑO',
  'ANDRES MERLO RODRIGUEZ',
  'MARIA DEL CARMEN GARCIA ROLDAN',
  'MIGUEL IVAN CANALEJO FERNANDEZ',
  'RUBEN MARTINEZ BERMUDEZ',
];

/**
 * ANCLAS PRESUPUESTARIAS — para dimensionar importes en términos reales
 * y no con umbrales inventados.
 *
 * Fuente: Presupuesto municipal aprobado. Actualizar cada ejercicio.
 */
export const PRESUPUESTO = {
  ejercicio: 2026,
  totalGastos: 19718386.95,
  capitulos: {
    1: { nombre: 'Gastos de personal', importe: 6779475.77 },
    2: { nombre: 'Bienes corrientes y servicios', importe: 8227403.09 },
    3: { nombre: 'Gastos financieros', importe: 69322.64 },
    4: { nombre: 'Transferencias corrientes', importe: 1391728.00 },
    5: { nombre: 'Fondo de contingencia', importe: 200000.00 },
    6: { nombre: 'Inversiones reales', importe: 2743365.80 },
  },
};

/**
 * UMBRALES LEGALES DE CONTRATACIÓN (LCSP 9/2017, art. 118).
 * Son estatales: no cambiar salvo reforma legal.
 */
export const UMBRALES_LCSP = {
  contratoMenorServicios: 15000,   // art. 118.1 LCSP
  contratoMenorObras: 40000,       // art. 118.1 LCSP
};

/**
 * Umbral por encima del cual un importe individual se considera
 * "significativo" para este municipio. Calculado como ~0,05 % del
 * presupuesto de gastos, redondeado. Ajustable.
 */
export const UMBRAL_IMPORTE_RELEVANTE = 10000;

/**
 * Nº de apariciones del mismo proveedor en el registro local a partir del cual
 * se considera "recurrente" a efectos del art. 118.1 LCSP.
 */
export const UMBRAL_RECURRENCIA_PROVEEDOR = 3;
