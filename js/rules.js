/**
 * rules.js — Catálogo de alertas.
 *
 * Cada alerta lleva cuatro cosas, y las cuatro importan:
 *   norma        — en qué precepto se apoya (nada de crítica sin fundamento)
 *   pregunta     — qué preguntar en el pleno, formulada como pregunta abierta
 *   replica      — qué va a contestar el equipo de gobierno (anticípala)
 *   propuesta    — qué proponer en positivo (no hay crítica sin alternativa)
 *
 * Y una quinta que es la que evita el tiro en el pie:
 *   dobleFilo    — true si el mismo hecho se produce también bajo gobiernos
 *                  anteriores. Estas alertas no se usan como arma arrojadiza
 *                  sin comprobar antes la serie histórica completa.
 *
 * Las alertas NO son conclusiones. Son puntos que merecen una pregunta.
 */

import {
  UMBRALES_LCSP, UMBRAL_IMPORTE_RELEVANTE, UMBRAL_RECURRENCIA_PROVEEDOR, PRESUPUESTO,
} from './config.js';
import { fmtEuro } from './parse.js';

const tieneMotivo = (f, id) => !!f.reparo?.motivos?.some(m => m.id === id);

/* ══════════════════════ alertas sobre un decreto ══════════════════════ */

export const REGLAS = [

  /* ─────────── Contratación ─────────── */
  {
    id: 'C01', categoria: 'Contratación', severidad: 'alta', dobleFilo: true,
    titulo: 'Prestación recurrente tramitada como contrato menor',
    test: (f) => tieneMotivo(f, 'contrato_menor_recurrente'),
    detalle: () => 'El Interventor señala que la prestación tiene carácter periódico o recurrente, lo que impide calificarla como contrato menor.',
    norma: 'Art. 118.1 y 29.8 de la Ley 9/2017 de Contratos del Sector Público',
    pregunta: '¿Qué calendario de licitación tiene previsto el equipo de gobierno para este servicio, y por qué no se ha licitado hasta ahora?',
    replica: 'Responderán que es un gasto básico y necesario y que el servicio venía sin licitar de la corporación anterior.',
    propuesta: 'Un plan de licitación con fechas para todos los servicios que Intervención viene señalando como recurrentes, aprobado en pleno y con seguimiento trimestral.',
  },
  {
    id: 'C02', categoria: 'Contratación', severidad: 'alta', dobleFilo: true,
    titulo: 'Gasto tramitado sin procedimiento de licitación',
    test: (f) => tieneMotivo(f, 'sin_licitacion'),
    detalle: () => 'El reparo indica expresamente que no se ha seguido ningún procedimiento de licitación.',
    norma: 'Art. 118.1 LCSP 9/2017',
    pregunta: '¿Existe informe del área que justifique la imposibilidad de licitar este contrato?',
    replica: 'Alegarán urgencia o continuidad del servicio.',
    propuesta: 'Publicar en el portal de transparencia la relación de contratos adjudicados sin licitación y el motivo de cada uno.',
  },
  {
    id: 'C03', categoria: 'Contratación', severidad: 'media',
    titulo: 'Falta el informe justificativo del contrato',
    test: (f) => tieneMotivo(f, 'sin_informe_justificativo'),
    detalle: () => 'No consta el informe justificativo que exige la ley para todo contrato menor.',
    norma: 'Art. 118.1 LCSP 9/2017',
    pregunta: '¿Por qué no se emite el informe justificativo previo, siendo un requisito legal y no una formalidad prescindible?',
    replica: 'Falta de personal en el área de contratación.',
    propuesta: 'Una plantilla normalizada de informe justificativo y formación al personal de las áreas gestoras.',
  },
  {
    id: 'C04', categoria: 'Contratación', severidad: 'media',
    titulo: 'Se incumplen las instrucciones internas del propio Ayuntamiento',
    test: (f) => tieneMotivo(f, 'incumple_instruccion_interna'),
    detalle: () => 'El reparo cita el incumplimiento de la Instrucción Conjunta 1/2018 y la Instrucción 1/2019, dictadas por el propio Ayuntamiento.',
    norma: 'Instrucciones internas 1/2018 y 1/2019 sobre contratos menores',
    pregunta: '¿Qué sentido tiene aprobar instrucciones internas de contratación si el propio Ayuntamiento las incumple de forma sistemática?',
    replica: 'Dirán que son orientativas.',
    propuesta: 'Revisar y actualizar las instrucciones, y publicar un informe anual de cumplimiento ante el pleno.',
  },
  {
    id: 'C05', categoria: 'Contratación', severidad: 'alta',
    titulo: 'Advertencia reiterada desde hace años sin corregir',
    test: (f) => tieneMotivo(f, 'advertencia_reiterada'),
    detalle: () => 'El reparo remite a informes de Secretaría de 2015 y 2018 que ya advertían de lo mismo. Es un problema identificado y no corregido.',
    norma: 'Informes de Secretaría de 16/07/2015 y 23/04/2018',
    pregunta: '¿Cuántos años más va a seguir el Ayuntamiento reproduciendo un problema que su propia Secretaría identificó por escrito?',
    replica: 'Que el problema es anterior a este mandato.',
    propuesta: 'Un plan de regularización con calendario cerrado y comparecencia semestral del área de contratación en comisión informativa.',
  },
  {
    id: 'C06', categoria: 'Contratación', severidad: 'alta',
    titulo: 'Importe cercano o superior al umbral del contrato menor',
    // Una nómina de 226.000 € no es un contrato menor: aplicar el umbral ahí
    // produce una alerta absurda que resta credibilidad a todas las demás.
    test: (f) => ['reparo', 'facturas', 'pagos'].includes(f.tipo)
      && f.importeTotal != null
      && f.importeTotal >= UMBRALES_LCSP.contratoMenorServicios * 0.8,
    detalle: (f) => `El importe (${fmtEuro(f.importeTotal)}) se sitúa en el entorno o por encima del umbral legal del contrato menor de servicios (${fmtEuro(UMBRALES_LCSP.contratoMenorServicios)}).`,
    norma: 'Art. 118.1 LCSP 9/2017',
    pregunta: '¿Se ha comprobado que este gasto, sumado a los del mismo objeto en el ejercicio, no supera el umbral del contrato menor?',
    replica: 'Que cada factura por separado está por debajo del umbral.',
    propuesta: 'Publicar un cuadro anual de gasto acumulado por proveedor y objeto contractual.',
  },

  /* ─────────── Relación de facturas ─────────── */
  {
    id: 'F01', categoria: 'Facturas', severidad: 'alta',
    titulo: 'Concentración del gasto en un solo proveedor',
    // Un decreto entero dedicado a un único proveedor es la señal más fuerte
    // de todas, no una excepción que haya que descartar por falta de comparación.
    test: (f) => {
      if (!f.porTercero?.length || !f.sumaLineas) return false;
      const t = f.porTercero[0];
      return t.nFacturas >= 2 && (t.importe / f.sumaLineas) >= 0.5;
    },
    detalle: (f) => {
      const t = f.porTercero[0];
      const pct = (t.importe / f.sumaLineas) * 100;
      const unico = f.porTercero.length === 1;
      return `${t.nombre || t.cif} concentra ${fmtEuro(t.importe)} en ${t.nFacturas} facturas` +
        (unico
          ? ', la totalidad del decreto. Un decreto íntegro dedicado a un solo proveedor apunta a un suministro continuado.'
          : `, el ${pct.toFixed(0)} % del importe del decreto.`);
    },
    norma: 'Art. 118.1 LCSP 9/2017',
    pregunta: '¿Existe contrato formalizado con este proveedor o se le viene abonando factura a factura?',
    replica: 'Que cada factura por separado está por debajo del umbral del contrato menor.',
    propuesta: 'Publicar el gasto acumulado por proveedor y ejercicio, y licitar lo que supere el umbral legal.',
  },
  {
    id: 'F02', categoria: 'Facturas', severidad: 'alta',
    titulo: 'Suministro continuado troceado en facturas pequeñas',
    // Cinco o más facturas del mismo tercero en una sola remesa es, por sí solo,
    // indicio de prestación continuada. Condicionarlo además a superar los
    // 15.000 € dejaba fuera el caso más claro: 26 facturas de la eléctrica que
    // individualmente no llegan a 1.000 € pero se repiten todos los meses.
    test: (f) => f.porTercero?.some(t => t.nFacturas >= 5),
    detalle: (f) => {
      const t = f.porTercero.filter(x => x.nFacturas >= 5).sort((a, b) => b.importe - a.importe)[0];
      const media = t.importe / t.nFacturas;
      const supera = t.importe > UMBRALES_LCSP.contratoMenorServicios;
      return `${t.nombre || t.cif} aparece con ${t.nFacturas} facturas en un único decreto, de ${fmtEuro(media)} de media, que suman ${fmtEuro(t.importe)}` +
        (supera
          ? ` — por encima del umbral del contrato menor de servicios (${fmtEuro(UMBRALES_LCSP.contratoMenorServicios)}).`
          : '. Ninguna llega al umbral por separado, pero la repetición es lo que define la prestación como recurrente.');
    },
    norma: 'Art. 118.1 y 118.2 LCSP 9/2017 (prohibición de fraccionamiento)',
    pregunta: '¿Por qué un suministro continuado del mismo proveedor se tramita como una sucesión de facturas menores en lugar de licitarse?',
    replica: 'Que se trata de consumos periódicos y facturación fraccionada del propio proveedor.',
    propuesta: 'Licitar los suministros de consumo continuado —energía, combustible, material— mediante contrato con plazo y precio unitario.',
  },
  {
    id: 'F03', categoria: 'Facturas', severidad: 'media',
    titulo: 'Proveedor con varias facturas en el mismo decreto',
    test: (f) => f.porTercero?.some(t => t.nFacturas >= 3 && t.nFacturas < 5),
    detalle: (f) => {
      const rep = f.porTercero.filter(t => t.nFacturas >= 3 && t.nFacturas < 5);
      return rep.slice(0, 4).map(t => `${t.nombre || t.cif}: ${t.nFacturas} facturas, ${fmtEuro(t.importe)}`).join(' · ') +
        (rep.length > 4 ? ` y ${rep.length - 4} más.` : '.');
    },
    norma: 'Art. 118.1 LCSP 9/2017',
    pregunta: '¿Se lleva un control del gasto acumulado por proveedor a lo largo del ejercicio?',
    replica: 'Que son importes menores y gastos corrientes.',
    propuesta: 'Cuadro anual de gasto acumulado por proveedor y objeto contractual, con alerta al aproximarse al umbral legal.',
  },
  {
    id: 'F04', categoria: 'Facturas', severidad: 'media',
    titulo: 'La lectura automática no cuadra con el total declarado',
    test: (f) => f.cuadra === false,
    detalle: (f) => `Las facturas leídas suman ${fmtEuro(f.sumaLineas)} frente a los ${fmtEuro(f.importeTotal)} declarados en el decreto. Faltan líneas por extraer.`,
    norma: null,
    pregunta: null,
    replica: null,
    propuesta: 'Revisa la relación completa en el decreto original antes de usar estas cifras.',
  },

  /* ─────────── Personal ─────────── */
  {
    id: 'P01', categoria: 'Personal', severidad: 'alta', dobleFilo: true,
    titulo: 'Nómina aprobada con reparo de Intervención',
    test: (f) => f.tipo === 'nominas' && f.reparo?.hayReparo,
    detalle: () => 'La nómina mensual se aprueba con reparo del Interventor, que la levanta la Alcaldía.',
    norma: 'Arts. 215 y 217 TRLRHL',
    pregunta: '¿Qué actuaciones concretas se han emprendido para que la nómina municipal deje de aprobarse con reparo cada mes?',
    replica: 'Que las irregularidades vienen de años atrás y que se está elaborando una nueva RPT.',
    propuesta: 'Calendario público de aprobación de la RPT con fecha límite y comparecencia del área de personal.',
  },
  {
    id: 'P02', categoria: 'Personal', severidad: 'alta', dobleFilo: true,
    titulo: 'Irregularidades en complementos personales',
    test: (f) => tieneMotivo(f, 'complementos_personales'),
    detalle: () => 'El Interventor señala irregularidades en el pago de complementos personales a diversos empleados.',
    norma: 'Reparo de Intervención sobre nóminas',
    pregunta: '¿Se ha cuantificado el importe de los complementos que Intervención considera irregulares?',
    replica: 'Derechos consolidados de larga data.',
    propuesta: 'Auditoría de retribuciones que cuantifique el problema antes de la RPT, no después.',
  },
  {
    id: 'P03', categoria: 'Personal', severidad: 'alta', dobleFilo: true,
    titulo: 'Contrataciones sin respetar los límites de la Ley de Presupuestos del Estado',
    test: (f) => tieneMotivo(f, 'tasa_reposicion'),
    detalle: () => 'Se señalan contratos formalizados sin respetar el art. 20.Cinco de la Ley de Presupuestos Generales del Estado.',
    norma: 'Art. 20.Cinco de la LPGE aplicable al ejercicio',
    pregunta: '¿Cuántas contrataciones se han realizado al margen de los límites de la Ley de Presupuestos y con qué cobertura jurídica?',
    replica: 'Necesidades urgentes e inaplazables.',
    propuesta: 'Informe anual de cumplimiento de la tasa de reposición ante la comisión informativa correspondiente.',
  },
  {
    id: 'P04', categoria: 'Personal', severidad: 'media', dobleFilo: true,
    titulo: 'Gasto de personal en servicios que no son competencia municipal',
    test: (f) => tieneMotivo(f, 'competencias_impropias'),
    detalle: () => 'Se asumen gastos de nóminas adscritos a servicios que, según la Ley 27/2013, no son competencia municipal.',
    norma: 'Ley 27/2013 de racionalización y sostenibilidad de la Administración Local',
    pregunta: '¿Qué servicios impropios está asumiendo el Ayuntamiento, qué coste tienen y qué se ha reclamado a la administración competente?',
    replica: 'Que son servicios que la ciudadanía necesita y nadie más presta.',
    propuesta: 'Cuantificar el coste de los servicios impropios y reclamar formalmente su financiación a la Junta y a la Diputación.',
  },
  {
    id: 'P06', categoria: 'Personal', severidad: 'alta',
    titulo: 'Pago de una pensión que no es competencia municipal',
    test: (f) => tieneMotivo(f, 'pension_sin_competencia'),
    detalle: () => 'El Interventor señala que el Ayuntamiento abona una pensión cuya concesión corresponde a la Seguridad Social, no al Ayuntamiento.',
    norma: 'Texto Refundido de la Ley General de la Seguridad Social (RDL 8/2015)',
    pregunta: '¿Cuántas pensiones de este tipo sigue abonando el Ayuntamiento, desde cuándo, y qué gestiones se han hecho para transferir la obligación a la Seguridad Social?',
    replica: 'Que se trata de un acto administrativo firme de hace décadas (a menudo un acuerdo de los años 90) y que el Ayuntamiento está obligado a cumplirlo mientras no se revise.',
    propuesta: 'Iniciar el expediente de revisión o subrogación ante la Seguridad Social, y mientras tanto informar al pleno del gasto anual comprometido por este concepto.',
  },
  {
    id: 'P07', categoria: 'Personal', severidad: 'alta',
    titulo: 'Personal contratado fuera de plantilla y RPT',
    test: (f) => tieneMotivo(f, 'contratacion_fuera_plantilla'),
    detalle: () => 'Intervención señala personal con relación contractual que, por su naturaleza, podría considerarse indefinida sin estar prevista en plantilla ni en la RPT.',
    norma: 'Art. 15.1.a, 15.3 y 15.5 del Estatuto de los Trabajadores',
    pregunta: '¿Cuántos empleados están en esta situación y qué plan existe para regularizarla antes de que genere derechos de indefinición?',
    replica: 'Necesidades del servicio no cubiertas por la plantilla vigente.',
    propuesta: 'Actualizar la RPT incluyendo estos puestos o amortizarlos, con calendario público.',
  },
  {
    id: 'P08', categoria: 'Personal', severidad: 'media',
    titulo: 'Volumen de contratación temporal incompatible con el carácter "excepcional" exigido por ley',
    test: (f) => tieneMotivo(f, 'temporalidad_excesiva'),
    detalle: () => 'La ley exige que la contratación temporal sea excepcional; el volumen de altas registrado por Intervención supera lo que puede considerarse excepcional para el tamaño de la plantilla.',
    norma: 'Art. 19.Dos y 19.Seis de la LPGE aplicable',
    pregunta: '¿Cuántas altas de personal temporal se han producido en el último ejercicio y cómo se justifica su carácter excepcional?',
    replica: 'Necesidades estacionales o programas subvencionados con contratación asociada.',
    propuesta: 'Publicar anualmente el número de altas temporales frente a la plantilla estructural, desglosado por programa.',
  },
  {
    id: 'P05', categoria: 'Personal', severidad: 'media',
    titulo: 'La defensa se apoya en una RPT "en elaboración"',
    test: (f) => f.reparo?.defensaRPT,
    detalle: (f) => `El equipo de gobierno justifica el levantamiento del reparo alegando que se está elaborando una nueva RPT${f.fecha ? ` (decreto de ${f.fecha})` : ''}. Comprueba si esa RPT llegó a aprobarse.`,
    norma: 'Art. 90.2 LRBRL',
    pregunta: '¿En qué fecha se aprobará la RPT que se viene anunciando como solución desde hace años?',
    replica: 'Que está en negociación con la representación sindical.',
    propuesta: 'Fijar por acuerdo plenario una fecha límite de aprobación de la RPT.',
  },
  {
    // Estos tres motivos ya los detectaba parse.js (MOTIVOS_REPARO) desde el
    // principio, y docs/00-proyecto.md cita literalmente los dos primeros
    // como ejemplo fundacional de en qué se basa el catálogo — pero nunca se
    // les dio una alerta propia en rules.js. El motivo quedaba registrado en
    // ficha.reparo.motivos y solo asomaba, de rebote, si se repetía tres
    // veces en el registro (Z02): un decreto suelto con esta irregularidad
    // no generaba ningún hallazgo visible, ni en la ficha ni en el informe
    // consolidado. Encontrado revisando a mano el informe consolidado de
    // una serie real contra los PDF originales.
    id: 'P09', categoria: 'Personal', severidad: 'alta', dobleFilo: true,
    titulo: 'Irregularidades en la asignación de trabajo del personal',
    test: (f) => tieneMotivo(f, 'personal_irregularidades'),
    detalle: () => 'El Interventor señala irregularidades en la asignación de trabajo de determinados empleados públicos.',
    norma: 'Reparo de Intervención sobre nóminas',
    pregunta: '¿A qué empleados afecta la irregularidad en la asignación de trabajo que señala Intervención, y qué medida correctora se ha adoptado?',
    replica: 'Que responde a necesidades organizativas del servicio, no a una irregularidad de fondo.',
    propuesta: 'Informe de la Jefatura de Personal que aclare la asignación de tareas cuestionada y su cobertura en la RPT.',
  },
  {
    id: 'P10', categoria: 'Personal', severidad: 'alta', dobleFilo: true,
    titulo: 'Contratos laborales que pueden perjudicar a las arcas municipales',
    test: (f) => tieneMotivo(f, 'personal_contratos_lesivos'),
    detalle: () => 'El Interventor señala la existencia de contratos laborales que pueden ocasionar perjuicio económico al Ayuntamiento.',
    norma: 'Reparo de Intervención sobre nóminas',
    pregunta: '¿Qué contratos laborales identifica Intervención como lesivos para las arcas municipales, y qué perjuicio económico estima?',
    replica: 'Que son compromisos heredados o necesarios para mantener el servicio.',
    propuesta: 'Auditoría jurídica de los contratos señalados, con dictamen sobre su modificación o extinción.',
  },
  {
    id: 'P11', categoria: 'Personal', severidad: 'media',
    titulo: 'Personal trabajando en un grupo de programa distinto del presupuestado',
    test: (f) => tieneMotivo(f, 'personal_fuera_grupo_programa'),
    detalle: () => 'El gasto de personal se imputa a un grupo de programa presupuestario distinto de aquel en el que realmente presta servicio, rompiendo la vinculación jurídica del crédito.',
    norma: 'Art. 18 RD 500/1990 y Bases de Ejecución del Presupuesto',
    pregunta: '¿Cuántos empleados están adscritos presupuestariamente a un programa distinto de aquel en el que realmente trabajan, y por qué no se ha corregido en el presupuesto siguiente?',
    replica: 'Reorganización de servicios pendiente de reflejar en la estructura presupuestaria.',
    propuesta: 'Corregir la adscripción presupuestaria del personal en la próxima elaboración del presupuesto.',
  },

  /* ─────────── Tesorería ─────────── */
  {
    id: 'T01', categoria: 'Tesorería', severidad: 'alta',
    titulo: 'Incumplimiento de la prelación legal de pagos',
    test: (f) => tieneMotivo(f, 'prelacion_pagos'),
    detalle: () => 'Intervención y Tesorería informan desfavorablemente: existen obligaciones de ejercicios cerrados anteriores a las que se propone pagar.',
    norma: 'Art. 187 TRLRHL y art. 14 LO 2/2012',
    pregunta: '¿Con qué criterio se selecciona qué facturas se pagan primero cuando hay obligaciones anteriores pendientes?',
    replica: 'Criterios de urgencia y de mantenimiento de los servicios.',
    propuesta: 'Aprobar el plan de disposición de fondos que la ley exige, que es precisamente lo que fija ese criterio de forma objetiva.',
  },
  {
    id: 'T02', categoria: 'Tesorería', severidad: 'alta',
    titulo: 'No se ha aprobado el plan de disposición de fondos',
    test: (f) => tieneMotivo(f, 'sin_plan_disposicion'),
    detalle: () => 'El informe señala que debe aprobarse un plan de disposición de fondos y no consta aprobado.',
    norma: 'Art. 187 TRLRHL y RD 500/1990',
    pregunta: '¿Por qué no se ha aprobado el plan de disposición de fondos, siendo una obligación legal y no una opción?',
    replica: 'Que está en elaboración.',
    propuesta: 'Presentar el plan de disposición de fondos al pleno en el plazo de tres meses.',
  },
  {
    id: 'T03', categoria: 'Tesorería', severidad: 'alta',
    titulo: 'No se ha aprobado el plan de tesorería',
    test: (f) => tieneMotivo(f, 'sin_plan_tesoreria'),
    detalle: () => 'El informe señala la ausencia del plan de tesorería exigido cuando se incumple el periodo medio de pago.',
    norma: 'Arts. 13.6 y 16.3 LO 2/2012',
    pregunta: '¿Cuándo se va a aprobar el plan de tesorería que exige la ley al superarse el periodo medio de pago?',
    replica: 'Que la situación es coyuntural.',
    propuesta: 'Aprobar el plan de tesorería y publicar mensualmente el periodo medio de pago en el portal de transparencia.',
  },
  {
    id: 'T04', categoria: 'Tesorería', severidad: 'alta',
    titulo: 'Periodo medio de pago incumplido o sin publicar',
    test: (f) => tieneMotivo(f, 'pmp_incumplido'),
    detalle: () => 'La Corporación no cumple el plazo legal de pago a proveedores y/o no publica su periodo medio de pago.',
    norma: 'LO 2/2012 y RD 635/2014',
    pregunta: '¿Cuál es el periodo medio de pago actual del Ayuntamiento y por qué no se publica con la periodicidad que exige la norma?',
    replica: 'Problemas de liquidez heredados.',
    propuesta: 'Publicación mensual del PMP en la web municipal, con serie histórica comparable.',
  },
  {
    id: 'T05', categoria: 'Tesorería', severidad: 'alta',
    titulo: 'Se están devengando intereses de demora',
    test: (f) => tieneMotivo(f, 'intereses_demora'),
    detalle: () => 'El retraso en el pago genera intereses de demora: un sobrecoste directo para las arcas municipales.',
    norma: 'Art. 198.4 LCSP 9/2017 y Ley 3/2004 de morosidad',
    pregunta: '¿Cuánto ha pagado el Ayuntamiento en intereses de demora en los últimos ejercicios?',
    replica: 'Que se está reduciendo la deuda.',
    propuesta: 'Incluir en la liquidación anual una partida explícita de intereses de demora pagados, para que el coste del retraso sea visible.',
  },
  {
    id: 'T07', categoria: 'Tesorería', severidad: 'alta',
    titulo: 'Sentencias firmes con importes pendientes de contabilizar',
    test: (f) => f.sentencias?.length > 0,
    detalle: (f) => {
      const total = f.sentencias.reduce((a, s) => a + (s.importe || 0), 0);
      return `El decreto cita ${f.sentencias.length} sentencia(s) firme(s) con importes asociados que suman ${fmtEuro(total)}, en parte pendientes de contabilización.`;
    },
    norma: 'Principio de imagen fiel de la contabilidad pública (TRLRHL)',
    pregunta: '¿Están estas cantidades reflejadas en la contabilidad municipal y dotadas presupuestariamente?',
    replica: 'Que hay negociación con los acreedores para un calendario de pagos.',
    propuesta: 'Dar cuenta al pleno del estado de todas las sentencias firmes pendientes y su cobertura presupuestaria.',
  },

  /* ─────────── Presupuesto ─────────── */
  {
    id: 'B01', categoria: 'Presupuesto', severidad: 'alta', dobleFilo: true,
    titulo: 'Gasto imputado a un presupuesto prorrogado',
    test: (f) => f.prorroga?.prorrogado,
    detalle: (f) => `El gasto se imputa a un presupuesto prorrogado desde ${f.prorroga.desde}. Gobernar con presupuesto prorrogado limita la inversión y la planificación.`,
    norma: 'Art. 169.6 TRLRHL',
    pregunta: '¿Cuántos ejercicios lleva el Ayuntamiento sin presupuesto propio aprobado en plazo y qué inversiones se han dejado de ejecutar por ello?',
    replica: 'Falta de acuerdo político o retrasos técnicos.',
    propuesta: 'Comprometer por acuerdo plenario la presentación del proyecto de presupuesto antes del 15 de octubre de cada año, como marca la ley.',
  },
  {
    id: 'B02', categoria: 'Presupuesto', severidad: 'informativa',
    titulo: 'Importe significativo en términos del presupuesto municipal',
    test: (f) => f.importeTotal != null && f.importeTotal >= UMBRAL_IMPORTE_RELEVANTE,
    detalle: (f) => {
      const pct = (f.importeTotal / PRESUPUESTO.totalGastos) * 100;
      return `${fmtEuro(f.importeTotal)} equivale al ${pct.toFixed(3)} % del presupuesto de gastos (${fmtEuro(PRESUPUESTO.totalGastos)}, ejercicio ${PRESUPUESTO.ejercicio}).`;
    },
    norma: null,
    pregunta: null,
    replica: null,
    propuesta: null,
  },
  {
    id: 'B03', categoria: 'Presupuesto', severidad: 'media',
    titulo: 'Imputación a nivel de vinculación jurídica',
    test: (f) => !!f.vinculacionJuridica,
    detalle: () => 'El gasto se imputa a nivel de vinculación jurídica y no a la aplicación específica, lo que suele indicar que la aplicación prevista carecía de crédito suficiente.',
    norma: 'Arts. 172 y 173 TRLRHL',
    pregunta: '¿Qué aplicaciones presupuestarias se están agotando de forma sistemática y por qué no se corrigen en la elaboración del presupuesto siguiente?',
    replica: 'Que la vinculación jurídica es un instrumento legal ordinario.',
    propuesta: 'Informe trimestral de ejecución por aplicación, con alerta sobre las partidas que superen el 80 % de ejecución.',
  },

  /* ─────────── Transparencia y procedimiento ─────────── */
  {
    id: 'X01', categoria: 'Transparencia', severidad: 'alta',
    titulo: 'Reparo que debe darse cuenta al Pleno',
    test: (f) => f.reparo?.debeIrAlPleno,
    detalle: () => 'El propio reparo indica que debe darse cuenta al Pleno de la Corporación. Comprueba si ese punto llegó efectivamente al orden del día.',
    norma: 'Art. 218 TRLRHL',
    pregunta: '¿En qué sesión plenaria se dio cuenta de este reparo, tal y como exige el art. 218 del TRLRHL?',
    replica: 'Que se dio cuenta en el informe anual agregado.',
    propuesta: 'Dar cuenta de los reparos en el pleno ordinario siguiente y no de forma agregada a fin de ejercicio.',
  },
  {
    id: 'X02', categoria: 'Transparencia', severidad: 'alta',
    titulo: 'Reparo que debe remitirse al Tribunal de Cuentas',
    test: (f) => f.reparo?.debeIrAlTribunalDeCuentas,
    detalle: () => 'El reparo señala que debe remitirse al Tribunal de Cuentas.',
    norma: 'Art. 218.3 TRLRHL',
    pregunta: '¿Se ha remitido al Tribunal de Cuentas la información sobre acuerdos contrarios a reparos, y en qué fecha?',
    replica: 'Que lo tramita Intervención en el envío anual.',
    propuesta: 'Dar cuenta al pleno del acuse de remisión al Tribunal de Cuentas cada ejercicio.',
  },
  {
    id: 'X03', categoria: 'Transparencia', severidad: 'alta',
    titulo: 'Fiscalización desfavorable',
    test: (f) => f.reparo?.fiscalizacionDesfavorable,
    detalle: () => 'El resultado de la fiscalización previa es desfavorable y aun así se ordena continuar el expediente.',
    norma: 'Arts. 215 a 217 TRLRHL',
    pregunta: '¿Cuántos expedientes se han tramitado con fiscalización desfavorable en lo que va de mandato y por qué importe acumulado?',
    replica: 'Que el levantamiento del reparo es una potestad legal de la Alcaldía.',
    propuesta: 'Publicar en el portal de transparencia la relación de acuerdos adoptados contra el criterio de Intervención.',
  },
  {
    id: 'X04', categoria: 'Documentación', severidad: 'informativa',
    titulo: 'Decreto sin fecha determinable',
    test: (f) => !f.fecha,
    detalle: () => 'El decreto se firma "a fecha de firma electrónica" y no ha sido posible fecharlo a partir del texto. Sin fecha no se puede atribuir a un mandato: compruébalo a mano antes de usarlo.',
    norma: null, pregunta: null, replica: null, propuesta: null,
  },
  {
    id: 'X05', categoria: 'Documentación', severidad: 'informativa',
    titulo: 'El equipo de gobierno alega herencia recibida',
    test: (f) => f.reparo?.defensaHeredado,
    detalle: () => 'El decreto incorpora expresamente el argumento de que la situación viene de la corporación anterior. Es la réplica que vas a recibir: compruébala antes de plantear la crítica.',
    norma: null,
    pregunta: '¿Qué se ha hecho desde el inicio del mandato para corregir una situación que se reconoce heredada?',
    replica: null,
    propuesta: null,
  },
];

/* ══════════════════════ alertas de patrón (necesitan registro) ══════════════════════ */

export const REGLAS_PATRON = [
  {
    id: 'Z01', categoria: 'Patrón', severidad: 'alta',
    titulo: 'Proveedor recurrente a lo largo de la serie',
    evaluar: (registro) => {
      // Se cuenta por FACTURAS, no por decretos: un proveedor con cuarenta
      // facturas pequeñas repartidas en seis remesas es exactamente el caso
      // que el artículo 118.1 quiere impedir, y contando decretos aparecería
      // como "seis", que no dice nada.
      const acum = new Map();
      for (const f of registro) {
        for (const t of f.porTercero || []) {
          const k = t.clave || (t.nombre || '').toUpperCase();
          if (!k) continue;
          if (!acum.has(k)) {
            acum.set(k, { nombre: t.nombre || t.cif, cif: t.cif, nFacturas: 0,
                          importe: 0, decretos: new Set(), anios: new Set(), conReparo: 0 });
          }
          const e = acum.get(k);
          e.nFacturas += t.nFacturas || 0;
          e.importe += t.importe || 0;
          e.decretos.add(f.decreto || f.expediente || f.archivo);
          if (f.fecha) e.anios.add(f.fecha.slice(0, 4));
          if (f.reparo?.hayReparo) e.conReparo++;
          if (!e.nombre && t.nombre) e.nombre = t.nombre;
        }
      }
      return [...acum.values()]
        .filter(e => e.nFacturas >= 5 || e.importe >= UMBRALES_LCSP.contratoMenorServicios)
        .sort((a, b) => b.importe - a.importe)
        .slice(0, 15)
        .map(e => {
          const supera = e.importe >= UMBRALES_LCSP.contratoMenorServicios;
          const anios = [...e.anios].sort();
          return {
            detalle: `${e.nombre}${e.cif ? ` (${e.cif})` : ''}: ${e.nFacturas} facturas por ${fmtEuro(e.importe)} ` +
              `en ${e.decretos.size} decreto(s)` +
              (anios.length ? `, ejercicio(s) ${anios.join(', ')}` : '') +
              (e.conReparo ? `. ${e.conReparo} de esos decretos llevan reparo de Intervención.` : '.') +
              (supera ? ` Supera el umbral del contrato menor de servicios (${fmtEuro(UMBRALES_LCSP.contratoMenorServicios)}).` : ''),
            pregunta: `¿Qué importe total se ha abonado a ${e.nombre} y bajo qué contrato? Si no hay contrato formalizado, ¿en qué fecha se va a licitar?`,
            propuesta: 'Publicar el gasto acumulado por proveedor y ejercicio, y licitar los suministros y servicios continuados.',
            norma: supera ? 'Art. 118.1 LCSP 9/2017' : null,
            referencias: [...e.decretos].slice(0, 12),
          };
        });
    },
  },
  {
    id: 'Z02', categoria: 'Patrón', severidad: 'alta',
    titulo: 'Mismo motivo de reparo repetido en el tiempo',
    evaluar: (registro) => {
      const cuenta = new Map();
      for (const f of registro) {
        for (const m of f.reparo?.motivos || []) {
          if (!cuenta.has(m.id)) cuenta.set(m.id, { etiqueta: m.etiqueta, norma: m.norma, fechas: [], n: 0 });
          const e = cuenta.get(m.id);
          e.n++;
          if (f.fecha) e.fechas.push(f.fecha);
        }
      }
      return [...cuenta.values()]
        .filter(e => e.n >= 3)
        .sort((a, b) => b.n - a.n)
        .map(e => {
          e.fechas.sort();
          const rango = e.fechas.length
            ? ` entre ${e.fechas[0]} y ${e.fechas[e.fechas.length - 1]}`
            : '';
          return {
            detalle: `"${e.etiqueta}" se repite en ${e.n} decretos${rango}. Es un problema estructural, no un caso aislado.`,
            pregunta: `¿Qué medida concreta se ha adoptado para corregir de raíz esta incidencia, que Intervención viene señalando en ${e.n} ocasiones?`,
            propuesta: 'Plan correctivo con hitos verificables y comparecencia periódica ante la comisión informativa.',
            norma: e.norma,
          };
        });
    },
  },
  {
    id: 'Z03', categoria: 'Patrón', severidad: 'alta', dobleFilo: true,
    titulo: 'Reparo sistemático en nóminas mes a mes',
    evaluar: (registro) => {
      const nominas = registro.filter(f => f.tipo === 'nominas' && f.reparo?.hayReparo);
      if (nominas.length < 3) return [];
      const porMandato = new Map();
      for (const f of nominas) {
        const k = f.mandato?.etiqueta || 'Sin determinar';
        porMandato.set(k, (porMandato.get(k) || 0) + 1);
      }
      const desglose = [...porMandato.entries()].map(([k, v]) => `${k}: ${v}`).join(' · ');
      return [{
        detalle: `${nominas.length} nóminas aprobadas con reparo. Desglose por mandato — ${desglose}.`,
        pregunta: '¿Qué se ha hecho para que la nómina municipal deje de aprobarse con reparo todos los meses?',
        propuesta: 'Aprobación de la RPT con fecha comprometida en pleno.',
        aviso: porMandato.size > 1
          ? 'ATENCIÓN: este patrón se produce bajo más de un mandato. Comprueba el desglose antes de usarlo en público.'
          : null,
      }];
    },
  },
  {
    id: 'Z04', categoria: 'Patrón', severidad: 'alta',
    titulo: 'Gasto anual por proveedor por encima del umbral legal',
    evaluar: (registro) => {
      const porAnio = new Map();
      for (const f of registro) {
        const anio = f.fecha ? f.fecha.slice(0, 4) : null;
        if (!anio) continue;
        for (const t of f.porTercero || []) {
          const k = `${t.clave || t.nombre}|${anio}`;
          if (!porAnio.has(k)) porAnio.set(k, { nombre: t.nombre || t.cif, anio, total: 0, nFacturas: 0, decretos: new Set() });
          const e = porAnio.get(k);
          e.total += t.importe || 0;
          e.nFacturas += t.nFacturas || 0;
          e.decretos.add(f.decreto || f.expediente || f.archivo);
        }
      }
      return [...porAnio.values()]
        .filter(e => e.total > UMBRALES_LCSP.contratoMenorServicios)
        .sort((a, b) => b.total - a.total)
        .map(e => ({
          detalle: `${e.nombre} acumula ${fmtEuro(e.total)} en ${e.nFacturas} facturas durante ${e.anio}, repartidas en ${e.decretos.size} decreto(s). El umbral del contrato menor de servicios es de ${fmtEuro(UMBRALES_LCSP.contratoMenorServicios)}.`,
          pregunta: `¿Responden los pagos a ${e.nombre} durante ${e.anio} a un mismo objeto contractual que debería haberse licitado de forma conjunta?`,
          propuesta: 'Análisis anual de gasto acumulado por objeto contractual, previo a la elaboración del presupuesto.',
          norma: 'Art. 118.1 y 118.2 LCSP 9/2017',
          nota: 'Indicio, no conclusión: hay que comprobar que los pagos corresponden efectivamente al mismo objeto contractual.',
          referencias: [...e.decretos].slice(0, 12),
        }));
    },
  },
  {
    id: 'Z05', categoria: 'Patrón', severidad: 'alta',
    titulo: 'Continuidad estructural entre mandatos',
    evaluar: (registro) => {
      const porMotivoMandato = new Map();
      for (const f of registro) {
        const mand = f.mandato?.etiqueta;
        if (!mand || mand === 'Sin determinar') continue;
        for (const m of f.reparo?.motivos || []) {
          if (!porMotivoMandato.has(m.id)) porMotivoMandato.set(m.id, { etiqueta: m.etiqueta, mandatos: new Map() });
          const e = porMotivoMandato.get(m.id);
          e.mandatos.set(mand, (e.mandatos.get(mand) || 0) + 1);
        }
      }
      return [...porMotivoMandato.values()]
        .filter(e => e.mandatos.size > 1)
        .map(e => ({
          detalle: `"${e.etiqueta}" aparece bajo ${e.mandatos.size} mandatos distintos — ` +
            [...e.mandatos.entries()].map(([k, v]) => `${k}: ${v} decretos`).join(' · ') + '.',
          pregunta: null,
          propuesta: 'Plantéalo como problema estructural del Ayuntamiento y no como reproche a un gobierno concreto: la propuesta de solución es tuya y te sitúa por encima del reproche.',
          aviso: 'NO USES ESTO COMO ATAQUE. El mismo hecho se produce bajo gobiernos de distinto color, incluido el vuestro. Si lo lanzas sin matizar, te lo devuelven.',
        }));
    },
  },
  {
    id: 'Z06', categoria: 'Patrón', severidad: 'media',
    titulo: 'Saltos en la numeración de decretos',
    evaluar: (registro) => {
      const nums = registro
        .map(f => {
          const m = (f.decreto || '').match(/(\d{4})[-\/](\d{1,5})/);
          return m ? { anio: m[1], n: parseInt(m[2], 10) } : null;
        })
        .filter(Boolean);
      const porAnio = new Map();
      for (const x of nums) {
        if (!porAnio.has(x.anio)) porAnio.set(x.anio, []);
        porAnio.get(x.anio).push(x.n);
      }
      const out = [];
      for (const [anio, lista] of porAnio) {
        if (lista.length < 5) continue;
        const orden = [...new Set(lista)].sort((a, b) => a - b);
        const huecos = [];
        for (let i = 1; i < orden.length; i++) {
          const salto = orden[i] - orden[i - 1];
          if (salto > 1) huecos.push(`${orden[i - 1] + 1}–${orden[i] - 1}`);
        }
        if (huecos.length) {
          out.push({
            detalle: `En ${anio} faltan los decretos ${huecos.slice(0, 20).join(', ')}${huecos.length > 20 ? '…' : ''} respecto de la serie recibida.`,
            pregunta: `¿Puede facilitarse la relación íntegra de decretos de ${anio}? En la documentación entregada hay saltos en la numeración.`,
            propuesta: 'Acceso permanente del grupo municipal al libro de resoluciones, conforme al ROF.',
            nota: 'Los huecos pueden deberse simplemente a que no has subido todos los decretos. Comprueba antes de preguntar.',
          });
        }
      }
      return out;
    },
  },
];

/* ══════════════════════ ejecución ══════════════════════ */

/**
 * Peso editorial. La severidad dice cuánto importa; el peso, qué va primero.
 * Un hallazgo estructural encabeza la lectura antes que un umbral aritmético.
 */
const PESO = {
  C05: 100, T01: 96, T02: 95, T03: 94, T04: 93, T05: 92, T07: 91,
  // Quién cobra y cuánto encabeza la lectura: es lo primero que hay que saber
  // de una remesa de facturas. El reparo que la acompaña viene después.
  F02: 110, F01: 108, C01: 90, C02: 88, F03: 58, F04: 45, X03: 86, X01: 85, X02: 84, B01: 82,
  P01: 80, P09: 79, P10: 79, P02: 78, P03: 76, C04: 70, C03: 68, P04: 66, P05: 60, P11: 55,
  B03: 50, C06: 30, X05: 20, B02: 10, X04: 5,
};

export function evaluarDecreto(ficha) {
  const out = [];
  for (const r of REGLAS) {
    let activa = false;
    try { activa = !!r.test(ficha); } catch { activa = false; }
    if (!activa) continue;
    out.push({
      id: r.id,
      categoria: r.categoria,
      severidad: r.severidad,
      titulo: r.titulo,
      dobleFilo: !!r.dobleFilo,
      detalle: typeof r.detalle === 'function' ? r.detalle(ficha) : r.detalle,
      norma: r.norma || null,
      pregunta: r.pregunta || null,
      replica: r.replica || null,
      propuesta: r.propuesta || null,
    });
  }
  const orden = { alta: 0, media: 1, baja: 2, informativa: 3 };
  return out.sort((a, b) =>
    orden[a.severidad] - orden[b.severidad] ||
    (PESO[b.id] || 0) - (PESO[a.id] || 0)
  );
}

export function evaluarPatrones(registro) {
  const out = [];
  for (const r of REGLAS_PATRON) {
    let hallazgos = [];
    try { hallazgos = r.evaluar(registro) || []; } catch { hallazgos = []; }
    for (const h of hallazgos) {
      out.push({ id: r.id, categoria: r.categoria, severidad: r.severidad, titulo: r.titulo, dobleFilo: !!r.dobleFilo, ...h });
    }
  }
  return out;
}

/**
 * "Lectura de oposición": las dos o tres líneas de qué se aprende del decreto.
 * Criterio editorial, separado de la ficha técnica. Nunca afirma, siempre pregunta.
 */
export function lecturaOposicion(ficha, alertas) {
  const altas = alertas.filter(a => a.severidad === 'alta');
  if (!altas.length) {
    return {
      lineas: ['Trámite ordinario. No se aprecian elementos que requieran seguimiento a partir del propio texto del decreto.'],
      cautelas: [],
    };
  }

  const lineas = [];
  const cautelas = [];

  const eje = altas[0];
  lineas.push(`${eje.titulo}. ${eje.detalle}`);

  if (altas.length > 1) {
    lineas.push(
      'También concurre: ' + altas.slice(1, 4).map(a => a.titulo.toLowerCase()).join('; ') + '.'
    );
  }

  const pregunta = altas.find(a => a.pregunta)?.pregunta;
  if (pregunta) lineas.push(`Pregunta para el pleno: ${pregunta}`);

  const propuesta = altas.find(a => a.propuesta)?.propuesta;
  if (propuesta) lineas.push(`Propuesta alternativa: ${propuesta}`);

  if (altas.some(a => a.dobleFilo)) {
    cautelas.push(
      'Alguna de estas alertas se activa también con decretos de mandatos anteriores. ' +
      'Comprueba la serie completa antes de usarlo públicamente.'
    );
  }
  if (ficha.mandato?.confianza === 'nula' || ficha.mandato?.confianza === 'revisar') {
    cautelas.push(ficha.mandato.nota);
  }
  if (ficha.reparo?.defensaHeredado) {
    cautelas.push('El propio decreto ya contiene el argumento de la herencia recibida: es la réplica que vas a recibir.');
  }

  return { lineas, cautelas };
}
