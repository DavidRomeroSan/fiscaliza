/**
 * corpus.js — Fragmentos reales de decretos del Ayuntamiento de Santa Fe,
 * usados para verificar la extracción. Los nombres de particulares se han
 * sustituido ya en origen; los cargos públicos y las razones sociales se
 * conservan porque son datos públicos necesarios para la prueba.
 */

export const CORPUS = [

{
  id: 'reparo-axial',
  esperado: { tipo: 'reparo', expediente: '9385/2023', importe: 5199.98, mandato: 'pp-2023' },
  texto: `EXPEDIENTE 9385/2023

DON JUAN COBO ORTIZ, ALCALDE PRESIDENTE DEL EXCMO. AYUNTAMIENTO DE SANTA FE (GRANADA), En uso de las facultades que me confiere el artículo 21.1.f) de la Ley 7/85 de 2 de abril.

A la vista del acuerdo adoptado por la Junta de Gobierno Local en sesión celebrada el 05 de diciembre de 2023, consistentes en:

"PROPUESTA: Autorización del gasto, disposición del crédito y reconocimiento de obligación por importe total de 5.199,98 € para el pago a AXIAL MEDITERRANEA S.L. (CIF: B98792708) de la Factura F-2300671/2023 que cuentan con el "visto bueno" en la cadena de conformidad, emitida en concepto de "Servicio de catering entero y triturado para la Escuela Infantil Bernard Van Leer durante el mes de octubre de 2023"; con cargo a la Aplicación Presupuestaria 3231.221.05 "Escuela Infantil Bernard Van Leer. Productos alimenticios" del Presupuesto de 2023 prorrogado de 2021."

Visto que por el Sr. Interventor, de acuerdo con lo previsto en el artículo 215 del texto refundido de la Ley Reguladora de las Haciendas Locales presenta reparo resaltando los términos siguientes: "Analizada la propuesta, desde esta Intervención se aprecia que no se está dando cumplimiento a la Instrucción Conjunta 1/2018 sobre los Contratos Menores en el Ayuntamiento de Santa Fe, en concordancia con la Instrucción 1/2019 de 28 de febrero, sobre contratos menores, regulados en la Ley 9/2017 de 8 de noviembre; no se tiene conocimiento de la existencia del preceptivo "Informe justificativo del contrato" emitido por el área interesada en la contratación exigido en el art. 118.1 de la Ley 9/2017 de 8 de noviembre de Contratos del Sector Público, toda vez que no se ha seguido ningún tipo de procedimiento de licitación. Así mismo se trata de requerimientos sucesivos que se producen repetidamente en el tiempo. Por esta razón, reitero como en otras ocasiones, que existe informe emitido por el área de Secretaría de fecha 16 de julio de 2015, sobre contratación menor de prestaciones para cubrir necesidades de carácter recurrente o periódico. Por otro lado, también existe informe emitido desde el área de secretaría de fecha 23 de abril de 2018, con ocasión de contrataciones similares donde a su vez se remite al informe de fecha 16 de julio de 2015 señalando que la información tiene plena vigencia pese al cambio legislativo operado por la nueva LCSP, reduciendo el umbral del valor estimado del contrato para poder recurrir a la contratación menor, lo que implica un incremento en las cautelas para este tipo de adjudicaciones. Por todo lo expuesto, entiendo que se debería haber articulado un procedimiento de licitación de acuerdo con lo previsto en la mencionada LCSP. De este reparo deberá darse cuenta al Pleno de la Corporación y al Tribunal de Cuentas (art. 218TRLRHL)."

Visto que la Junta de Gobierno Local en esta misma sesión, presenta su discrepancia contra la nota de reparo referida, entendiendo que se trata de gastos básicos y necesarios para el normal funcionamiento de los servicios municipales y que esta Corporación se ha encontrado el servicio sin licitar, contratado por la anterior Corporación para el servicio de catering entero y triturado para la Escuela Infantil Bernard Van Leer.

No obstante, habiéndose prestado el servicio facturado y para evitar el enriquecimiento injusto de la Administración que supondría no abonar sus haberes a los que efectivamente han prestado sus servicios, esta Junta de Gobierno considera conveniente continuar con la tramitación del expediente. Por tanto,

RESUELVO

Solventar, en los términos previstos en el artículo 217 del texto refundido de la Ley Reguladora de las Hacienda Locales, la discrepancia a favor de la Junta de Gobierno, en base a los argumentos presentados y ordenar la continuación del expediente.

Santa Fe a fecha de firma electrónica EL ALCALDE PRESIDENTE Fdo. Juan Cobo Ortiz`
},

{
  id: 'operaciones-desfavorable',
  esperado: { tipo: 'reparo', expediente: '10424/2023', importe: 6100.33, mandato: 'pp-2023', vinculacionJuridica: true },
  texto: `RESOLUCIÓN

10424/2023 Expediente nº: Resolución con número y fecha establecidos al margen Propuesta de Gasto Procedimiento:

DON JUAN COBO ORTIZ, ALCALDE-PRESIDENTE, DEL EXCMO.AYUNTAMIENTO DE SANTA FE (GRANADA), en uso de las atribuciones que me confiere la vigente legislación Régimen Local, vengo a dictar la siguiente

HECHOS Y FUNDAMENTOS DE DERECHO

Vista la relación de operaciones anexas.

Visto que por el Sr. Interventor, de acuerdo con lo previsto en el art. 215 del Texto Refundido de la Ley Reguladora de Haciendas Locales se presentó reparo resaltando los términos siguientes:

"Que se trata de contratos de servicios, que aunque se quieren considerar como contrato menor de los previstos en el art. 29.8 de la LCSP, cuando señala que: "los contratos menores definidos en el apartado primero del artículo 118 no podrán tener una duración superior a un año ni ser objeto de prórroga"; no pueden calificarse como "contrato menor" (art. 118.1 LCSP), toda vez que las prestaciones a contratar tienen carácter periódico o recurrente. Al mismo tiempo, trae causa de un contrato menor sucesivo que se requiere repetidamente en el tiempo. Por ésta razón, reitero como en otras ocasiones, que existe informe emitido desde el área de secretaría de fecha 16 de julio de 2015, sobre "contratación menor de prestaciones para cubrir necesidades de carácter recurrente o periódico". Por todo lo expuesto, entiendo que se debería haber articulado un procedimiento de licitación de acuerdo con lo previsto en la mencionada LCSP.

De este reparo deberá darse cuenta al Pleno de la Corporación y al Tribunal de Cuentas (art. 218TRLRHL).

Se presenta discrepancia contra la nota de reparo referida, apoyándose en que se trata de un gasto básico y necesario para el normal funcionamiento de los servicios municipales y la suspensión del expediente tendría consecuencias negativas para el municipio, se considera conveniente continuar con la tramitación del mismo. Por tanto,

Vista la propuesta de resolución PR/2023/1263 de 29 de diciembre de 2023.

RESOLUCIÓN

PRIMERO: Solventar, en los términos previsto en el artículo 217 del Texto Refundido de la Ley Reguladora de las Haciendas Locales, la discrepancia en base a los argumentos presentados y ordenar la continuación de los expedientes.

SEGUNDO: Autorización el gasto, disposición del crédito y reconociendo de cada una de las obligaciones anteriormente señaladas que ascienden a un importe total 6.100.33€ , con cargo a la Aplicaciones Presupuestarias:3234.22105- y a Nivel de Vinculación en las Aplicaciones Presupuestarias: 912.22601- del Presupuesto de 2023 prorrogado de 2021.

TERCERO: Comunicar el presente Decreto a las Oficinas de Intervención y Tesorería para que se dé cumplimiento del mismo.

En Santa Fe, a fecha de firma electrónica. EL ALCALDE-PRESIDENTE Fdo.: D. Juan Cobo Ortiz

EXTE: 10424/2023

LISTADO DE APROBACION DESFAVORABLE 29-12-2023

2023 3234 22105 4.637,33 € AXIAL MEDITERRANEA S.L.

EL INTERVENTOR Fdo. Pablo Emilio Martín Martín`
},

{
  id: 'nominas-pp-noviembre',
  esperado: { tipo: 'nominas', expediente: '8919/2023', mandato: 'pp-2023' },
  texto: `Resolución de Alcaldía Expediente N.º: 8919/2023 Asunto: NOMINAS Y SEGUROS SOCIALES NOVIEMBRE 2023 CON REPAROS Procedimiento: NOMINAS Fecha de iniciación: 28 de noviembre de 2023

DON JUAN COBO ORTIZ, ALCALDE PRESIDENTE DEL EXCMO. AYUNTAMIENTO DE SANTA FE (GRANADA) En uso de las facultades que me confiere el artículo 21.1.f) de la Ley 7/85 de 2 de abril.

A la vista de los acuerdos adoptados por la Junta de Gobierno Local en sesión celebrada el 28 de noviembre de 2023, consistentes en:

1.- autorización, disposición y reconocimiento de un gasto por importe de 226.414,94 € a favor de NOMINAS con cargo a las aplicaciones presupuestarias siguientes: 151.120.03, 151.120.06, 151.121.00, 231.120.01, 3231.131.00, 9202.131.00 y 9208.131.00 en concepto de NÓMINAS CON REPAROS NOVIEMBRE 2023.

2.- autorización, disposición y reconocimiento de un gasto por importe de 88.234,51 € a favor de Tesorería General Seguridad Social Granada con cargo a las aplicaciones presupuestarias siguientes: 151.160.00, 231.160.00, 3231.160.00 en concepto de SEGUROS SOCIALES CON REPAROS NOVIEMBRE 2023.

Visto que por el Sr. Interventor, de acuerdo con lo previsto en el artículo 215 del texto refundido de la Ley Reguladora de las Haciendas Locales presenta reparo resaltando los términos siguientes: "Reitero el comentario que acompaña al acuerdo de aprobación en Junta de Gobierno Local en que se aprueba la nómina del mes, relativo a determinados aspectos de dicha nómina: - Irregularidades en la asignación de trabajo de determinados empleados públicos. - Existencia de contratos laborales que pueden ocasionar perjuicio a las arcas municipales - Asunción de gastos derivados de nóminas adscritos a servicios que, de acuerdo con la Ley 27/2013 no son de competencia municipal. - Existencia de contratos realizados sin respeto a lo previsto en el artículo 20 apartado Cinco de la Ley 31/2022, de 23 de diciembre, de Presupuestos Generales del Estado para el año 2023. - Irregularidades en el pago de Complementos Personales a diversos empleados.

De este reparo deberá darse cuenta al Pleno de la Corporación y al Tribunal de Cuentas (art. 218 TRLRHL)"

Visto que la Junta de Gobierno Local en esta misma sesión, presenta su discrepancia contra la nota de reparo referida, entendiendo que habiéndose prestado el servicio por el personal incluido en las nóminas y seguros sociales citados del Ayuntamiento en el mes de NOVIEMBRE de 2023, teniendo en cuenta que se está elaborando una nueva RPT para solventar muchas de las discrepancias que se plantean, toda vez que muchas de las circunstancias que a juicio del Interventor resultan irregulares, se producen desde hace años no siendo la Junta de Gobierno la que suscribe y para evitar el enriquecimiento injusto de la Administración que supondría no abonar sus haberes a los que efectivamente han prestado sus servicios, se considera conveniente continuar con la tramitación del expediente.

RESUELVO

Solventar, en los términos previstos en el artículo 217 del texto refundido de la Ley Reguladora de las Hacienda Locales, la discrepancia a favor de la Junta de Gobierno, en base a los argumentos presentados y ordenar la continuación del expediente.

Santa Fe a fecha de firma electrónica EL ALCALDE PRESIDENTE Fdo. Juan Cobo Ortiz`
},

{
  id: 'nominas-psoe-enero',
  esperado: { tipo: 'nominas', mandato: 'psoe-2019' },
  texto: `DOÑA PATRICIA CARRASCO FLORES, ALCALDESA PRESIDENTA DEL EXCMO AYUNTAMIENTO DE SANTA FE (GRANADA), En uso de las facultades que me confiere el artículo 21.1.f) de la Ley 7/85 de 2 de abril.

A la vista de los acuerdos adoptados por la Junta de Gobierno Local en sesión celebrada el 26 de enero de 2023, consistentes en:

1.- autorización, disposición y reconocimiento de un gasto por importe de 220.842,33 € a favor de NOMINAS con cargo a las aplicaciones presupuestarias siguientes: 151.120.03, 151.120.06, 231.120.01, 3231.131.00, 9208.131.00 en concepto de NÓMINAS CON REPAROS ENERO 2023.

2.- autorización, disposición y reconocimiento de un gasto por importe de 83.095,90 € a favor de Tesorería General Seguridad Social Granada con cargo a las aplicaciones presupuestarias siguientes: 151.160.00, 231.160.00 en concepto de SEGUROS SOCIALES CON REPAROS ENERO 2022.

Visto que por el Sr. Interventor, de acuerdo con lo previsto en el artículo 215 del texto refundido de la Ley Reguladora de las Haciendas Locales presenta reparo resaltando los términos siguientes: "Reitero el comentario que acompaña al acuerdo de aprobación en Junta de Gobierno Local en que se aprueba la nómina del mes, relativo a determinados aspectos de dicha nómina: - Irregularidades en la asignación de trabajo de determinados empleados públicos. - Existencia de contratos laborales que pueden ocasionar perjuicio a las arcas municipales - Asunción de gastos derivados de nóminas adscritos a servicios que, de acuerdo con la Ley 27/2013 no son de competencia municipal. - Existencia de contratos realizados sin respeto a lo previsto en el artículo 20 apartado Cinco de la Ley 31/2022, de 23 de diciembre, de Presupuestos Generales del Estado para el año 2023. - Irregularidades en el pago de Complementos Personales a diversos empleados.

De este reparo deberá darse cuenta al Pleno de la Corporación y al Tribunal de Cuentas (art. 218 TRLRHL)"

Visto que la Junta de Gobierno Local en esta misma sesión, presenta su discrepancia contra la nota de reparo referida, entendiendo que habiéndose prestado el servicio por el personal incluido en las nóminas y seguros sociales citados del Ayuntamiento en el mes de ENERO de 2023, teniendo en cuenta que se está elaborando una nueva RPT para solventar muchas de las discrepancias que se plantean, toda vez que muchas de las circunstancias que a juicio del Interventor resultan irregulares, se producen desde hace años no siendo la Junta de Gobierno la que suscribe y para evitar el enriquecimiento injusto de la Administración que supondría no abonar sus haberes a los que efectivamente han prestado sus servicios, se considera conveniente continuar con la tramitación del expediente.RESUELVO

Solventar, en los términos previstos en el artículo 217 del texto refundido de la Ley Reguladora de las Hacienda Locales, la discrepancia a favor de la Junta de Gobierno, en base a los argumentos presentados y ordenar la continuación del expediente.

Santa Fe a fecha de firma electrónica LA ALCALDESA Fdo. Patricia Carrasco flores`
},

{
  id: 'pagos-septiembre',
  esperado: { tipo: 'pagos', expediente: '5692/2023', mandato: 'pp-2023' },
  texto: `Expediente nº: 5692/2023 Asunto: Propuesta de pago Procedimiento: Pagos 29 septiembre 2023

D. Juan Cobo Ortiz, Alcalde Presidente del Excmo. Ayuntamiento de Santa Fe (Granada), en virtud de la competencia que me otorga el artículo 186.1 del RD 2/2004 por el que se aprueba el Texto Refundido de la Ley Reguladora de las Haciendas Locales, en relación a las siguientes obligaciones reconocidas:

220230009531 ADO 2.500,00 2.500,00 PAGO A JUSTIFICAR PARA MATERIAL ILUMINACIÓN Y SONIDO FESTIVAL HUMOR 2023 EXTE: 6417/2023

220230009532 ADO 2.000,00 2.000,00 ORTEGA MARTINEZ JOSE MARIA PAGO A JUSTIFICAR PARA GASTOS DE PRODUCCIÓN FESTIVAL HUMOR 2023 EXTE: 6426/2023

220230009544 ADO 274,00 274,00 NAVARRO ISLA FILOMENA AYUDA SEGUNDO SEMESTRE 2023 ATENCION SOCIAL BASICA 6391/2023, Dª CAROLINA DIAZ RETAMERO

220230009545 ADO 600,00 600,00 PERFETTI VIDAL LUIS ENRIQUE CAMILO PROGRAMA AYUDA PROGRAMA EXTRAOR.URGENCIA 2023, Dª JACQUELINE FREIRE SALAS, EXPTE. 6390/2023

320230001115 PMP 2.430,00 405,00 ANES JOANA PATRICIA AYUDA PROGRAMA PROVINC.INTERVENCION FAMILIAR (PIF) EXPTE. 2924/2023

220230000294 ADO 544.596,48 145.000,00 SERCOVIRA TN DE RESIDUOS RECOGIDOS EN EL MUNICIPIO DURANTE EL AÑO 2021

220230009546 ADO 1.450,00 1.421,00 COBO ORTIZ JUAN ASISTENCIAS A JUNTAS DE GOBIERNO, COMISIONES INFORMATIVAS Y PLENO SEPTIEMBRE 2023 EXTE: 745/2023

220230009554 ADO 560,00 470,40 CARRASCO FLORES PATRICIA ASISTENCIAS A COMISIONES INFORMATIVAS Y PLENO SEPTIEMBRE 2023 EXTE: 745/2023

Vistas las previsiones de tesorería y la liquidez disponible y los datos del pendiente de pago a fecha actual que obran en el expediente, visto el informe de reparo que consta en el expediente y visto informe del Tesorero accidental y del Interventor que expone:

"1. La prelación de pagos imperativa por Ley, que salvo mejor criterio fundado en derecho, debería respetarse, es la siguiente: 1º. Endeudamiento (artículo 14 Ley Orgánica 2/2012). 2º. Gastos de personal (artículo 187 RD 2/2004). 3º. Obligaciones contraídas en ejercicios cerrados (artículo 187 RD 2/2004) por orden de incoación de expediente.

A fecha actual existen en contabilidad obligaciones pendientes de pago de ejercicios cerrados, aprobadas con anterioridad a las propuestas, por lo cual no se cumple la prelación de pagos imperativa por Ley, y se informa desfavorablemente.

En la propuesta de pago, tampoco se está haciendo uso de toda la liquidez disponible para pagar obligaciones reconocidas pendientes de pago.

2. Debe aprobarse un plan de disposición de fondos en base al artículo 187 del RD 2/2004, que respete el cumplimiento de los plazos recogidos en la normativa de morosidad.

La Corporación no cumple este plazo de periodo medio de pago a proveedores actualmente.

5. En resumen de todo lo expuesto hasta el momento, deben corregirse las siguientes incidencias: - Debe publicarse el periodo medio de pago conforme al artículo 16.3 de la Ley orgánica 2/2012 y el RD 635/2014. - Debe aprobarse un plan de disposición de fondos en base al artículo 187 del RD 2/2004. - Debe aprobarse un plan de tesorería conforme al artículo 16.3 de la Ley orgánica 2/2012. - Debe llevarse a cabo el cumplimiento de los plazos establecidos en el artículo 198.4 de la Ley 9/2017. El no cumplimiento de estos plazos conlleva a un mayor coste para el Ayuntamiento ya que se están devengando intereses de demora. - Debe respetarse la prelación de pagos, por imperativo legal.

6. Se tiene constancia de las siguientes Sentencias firmes y decretos de aprobación de costas e intereses al haber adquirido firmeza:

- Sentencia firme nº 128/16 dictada por el Juzgado Contencioso-Administrativo nº 1 de Granada, declara el derecho del actor a percibir la cantidad de 904.861,57 € más los intereses moratorios de la ley contra la morosidad a favor de ANFRASA S.L, que si bien se encuentra pagada en su totalidad, de la misma resta por abonar el importe correspondiente a las costas judiciales que están igualmente pendientes de contabilización y que ascienden a un total entre liquidación de intereses y tasación de costas hasta la fecha de 342.471,00 euros, si bien aún no es firme.

- Sentencia firme nº 397/14 dictada por el Juzgado Contencioso-Administrativo nº 1 de Granada, declara el derecho del actor a percibir la cantidad de 617.539,71 € en concepto de principal y la cantidad de 279.533,16 en concepto de intereses más los intereses moratorios de la ley contra la morosidad a favor de ANFRASA S.L.

- Sentencia firme nº 292/17 dictada por el Juzgado Contencioso-Administrativo nº 2 de Granada, declara el derecho del actor a percibir la cantidad de 115.194,78 € más los intereses moratorios de la ley contra la morosidad a favor de ANFRASA S.L.

RESUELVO

- Ordenar el pago de la relación propuesta y contenida en la presente resolución.

En Santa Fe a fecha de firma electrónica EL ALCALDE PRESIDENTE Fdo. D. JUAN COBO ORTIZ`
},


{
  id: 'facturas-gas-natural',
  esperado: { tipo: 'facturas', mandato: 'psoe-2019', nFacturasMin: 20, terceroTop: 'A08431090' },
  texto: `Dª. PATRICIA CARRASCO FLORES, COMO ALCALDESA PRESIDENTA DEL EXCMO. AYUNTAMIENTO DE SANTA FE (GRANADA).

DECRETO: Que en uso de las facultades que me confiere la vigente legislación del Régimen Local, en especial los artículos 185 del texto refundido de la Ley Reguladora de las Haciendas Locales aprobado por R.D.L. 2/2004 de 5 de marzo y 55 y siguientes del R.D. 500/1990.

HERESUELTO: Aprobar las siguientes operaciones con cargo al vigente Presupuesto Municipal:

Importe Tercero Nombre Ter. Texto Libre

362,33 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
Rect. FE22321408970883 / IMPUESTO SOBRE ELECTRICIDAD 01/11/2022 - 30/11/2022
325,01 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
Rect. FE22321402348779 / IMPUESTO SOBRE ELECTRICIDAD 01/09/2022 - 30/09/2022
369,12 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
Rect. FE22321405854321 / IMPUESTO SOBRE ELECTRICIDAD 01/10/2022 - 31/10/2022
873,24 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 31/12/2022 CUPS ES0031103288219002YR0F Direccion PS BOABDIL,1
417,44 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 31/12/2022 CUPS ES0031103558536001BR0F Direccion PS PINTOR JUAN RUIZ
347,12 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
IMPUESTO SOBRE ELECTRICIDAD 01/12/2022 - 31/12/2022 CUPS ES0031103289132001AS0F Direccion PS ESPAÑA
957,03 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 31/12/2022 CUPS ES0031103289780002WZ0F Direccion PS CELESTINO MUTIS
444,31 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 31/12/2022 CUPS ES0031103290044001AL0F Direccion PS PINTOR LOPEZ MEZ
336,88 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 31/12/2022 CUPS ES0031105149905001XJ0F Direccion PS TIKAZ
642,67 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 31/12/2022 CUPS ES0031103291255001DT0F Direccion PS REDONDA
211,51 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
IMPUESTO SOBRE ELECTRICIDAD 01/12/2022 - 31/12/2022 CUPS ES0031105294014001MY0F Direccion PS VEINTIOCHO
655,92 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 31/12/2022 CUPS ES0031103288769002EW0F Direccion PS CRUCES,48
63,50 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
IMPUESTO SOBRE ELECTRICIDAD 01/12/2022 - 31/12/2022 CUPS ES0031103727343001FL0F Direccion PS ISABEL L
314,47 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
IMPUESTO SOBRE ELECTRICIDAD 01/12/2022 - 31/12/2022 CUPS ES0031103290269001BX0F Direccion PS RECTOR
651,89 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 31/12/2022 CUPS ES0031103291260001LD0F Direccion PS REDONDA,0005
326,59 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 09/12/2022 - 09/01/2023 CUPS ES0031103289998001GL0F Direccion PS PIEDRA,0002
811,38 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
Rect. FE22321399210482 / ALQUILER DE CONTADOR 01/08/2022 - 31/08/2022
697,15 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
Rect. FE22321402689713 / ALQUILER DE CONTADOR 01/09/2022 - 30/09/2022
639,06 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
Rect. FE22321405878099 / ALQUILER DE CONTADOR 01/10/2022 - 31/10/2022
851,11 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
Rect. FE22321409378739 / ALQUILER DE CONTADOR 01/11/2022 - 30/11/2022
566,80 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 13/12/2022 - 11/01/2023 CUPS ES0031103531345001QS0F Direccion PS HISPANIDAD,36
530,37 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 12/12/2022 - 12/01/2023 CUPS ES0031103551427002KA0F Direccion PS JAU,7
365,82 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 13/01/2023 - 13/01/2023 CUPS ES0031103290295001ZC0F Direccion PS ROMEROS,2
297,53 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 13/01/2023 - 13/01/2023 CUPS ES0031103715904001NT0F Direccion PS ALCALDE ENRIQUE
91,17 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
IMPUESTO SOBRE ELECTRICIDAD 16/12/2022 - 16/01/2023 CUPS ES0031103661918006JL0F Direccion PS TUCA
213,15 € A08431090
GAS NATURAL SERVICIOS SDG. S.A.
ALQUILER DE CONTADOR 01/12/2022 - 29/12/2022 CUPS ES0031104861985001MQ0F Direccion PS PABLO PICASSO
29.864,30 €

En relación con la factura referida y de acuerdo con lo previsto en el artículo 214 del texto refundido de la Ley Reguladora de las Haciendas Locales, informo favorablemente la propuesta de aprobación.

EnSantaFe a fecha de firma electrónica La Alcaldesa Presidenta Dª. Patricia Carrasco Flores`
},

{
  id: 'operaciones-agosto',
  esperado: { tipo: 'facturas', expediente: '5672/2023', importe: 6772.18, mandato: 'pp-2023', nFacturasMin: 20 },
  texto: `Resolución de Alcaldía Expediente N.º: 5672/2023 Asunto: Aprobación Gastos.

DON RUBÉN MARTINEZ BERMÚDEZ CONCEJAL DE HACIENDA Y GESTIÓN ECONÓMICA, JUVENTUD, NUEVAS TECNOLOGÍAS, FIESTAS Y COMUNICACIÓN, DEL EXMO. AYUNTAMIENTO DE SANTA FE (GRANADA);

DECRETO: Que en uso de las facultades que me confiere la vigente legislación del Régimen Local, en especial los artículos 185 del texto refundido de la Ley Reguladora de las Haciendas Locales.

Vista la propuesta para autorización del gasto, disposición del crédito y reconocimiento de las siguientes obligación por importe total de 6.772,18 €, con cargo a las Aplicaciones Presupuestarias del Presupuesto de 2.023 prorrogado de 2.021 que así mismo se mencionan:

Aplicación Importe Nombre Ter. Texto Libre

ADO 30/08/2023 2023 340 22699 1,14 CAJA RURAL DE GRANADA
GASTOS FACTURACION COMERCIO POR COBROS CON TARJETA EN EL POLIDEPORTIVO
ADO 30/08/2023 2023 339 22609 242,00
MARIA DOLORES CRUZ SANCHEZ
Fase
ADO 30/08/2023 2023 1641 22000 96,00 GARCIA PEREZ GERARDO
FACT: 0002982 TRANSPORTES DE CONTENEDOR HASTA LA PLANTA RE. 2023-E-RE-3592
ADO 30/08/2023 2023 132 22104 240,90 TECNOL
MATERIAL ENTREGADO EN LA JEFATURA POLICIA LOCAL / CHAQUETA TRAJE DE GALA
ADO 30/08/2023 2023 132 22000 779,60 TECNOL
SECTOR 112 MATERIAL POLICIAL
ADO 30/08/2023 2023 171 22626 133,90 BIOMASA DEL GUADALQUIVIR S.A.
FACT: S230475 SERVICIO DE TRANSPORTE, RECEPCION Y TRATAMIENTO CONTENEDOR RESIDUOS VEGETALES
ADO 30/08/2023 2023 9209 22000 151,25 LOPEZ LOPEZ JOSE MANUEL
FACT: 70 REVESTIMIENTO DE PARED VERTICAL EN CALLE BRIVIESCA (GRAFITI)
ADO 30/08/2023 2023 9209 22103 76,71 ES ROTONDA DE SANTA FE SL
FACT: 23300165 FURGON ELECTRICISTA DIESEL RE: 2023-E-RE-3712
ADO 30/08/2023 2023 9209 22103 16,19 ES ROTONDA DE SANTA FE SL
FACT: 23300168 SIN PLOMO GRUPO ELECTROGENO RE. 2023-E-RE-3712
ADO 30/08/2023 2023 9209 22103 59,16 ES ROTONDA DE SANTA FE SL
FACT: 23300169 DIESEL DUMPER RE. 2023-E-RE-3712
ADO 30/08/2023 2023 171 22626 42,35 SUMINISTROS INDUSTRIALES TEYMO SL
MANO DE OBRA
ADO 30/08/2023 2023 171 22626 22,63 SUMINISTROS INDUSTRIALES TEYMO SL
PAQUETE BRIDA NYLON 7.6X540 (100 UDS)
ADO 30/08/2023 2023 9209 22000 128,56 SUMINISTROS INDUSTRIALES TEYMO SL
FOCO PORTA LED BATERIA EXTR 50W 2000 L
ADO 30/08/2023 2023 9209 22000 168,02 ALVAREZ MARTIN JOSE ANTONIO
Segun detalle documento adjunto
ADO 30/08/2023 2023 171 22626 91,28 ALVAREZ MARTIN JOSE ANTONIO
Segun detalle documento adjunto
ADO 30/08/2023 2023 9209 21300 487,71 AUTOMOCION F. PIÑAR E HIJOS SL
MATRICULA 3046FBX FOCUS / REVISAR PERDIDA LIQUIDO DIRECCION
ADO 30/08/2023 2023 9209 22000 306,25 AZULEJOS SANTA FE S.L.
FACT: MANTENIMIENTO RE: 2023-E-RE-234
ADO 30/08/2023 2023 171 22103 135,56 ES ROTONDA DE SANTA FE SL
FACT: 23100284 DIESEL, SIN PLOMO RE. 2023-E-RE-3753
ADO 30/08/2023 2023 1641 22000 16,62 ES ROTONDA DE SANTA FE SL
FACT: 23100285 SIN PLOMO 95 RE: 2023-E-RE-3753
ADO 30/08/2023 2023 9209 22103 16,59 ES ROTONDA DE SANTA FE SL
FACT: 23100286 SIN PLOMO 95 RE. 203-E-RE-3753
ADO 30/08/2023 2023 171 22626 40,22 SUMINISTROS INDUSTRIALES TEYMO SL
CABEZAL UNIVERSAL DESBROZADORA ALUMINIO / ACEITE CADENA MOTOSIERRA
ADO 30/08/2023 2023 171 22626 594,00 PEREZ VILLALTA MARCO ANTONIO
Rect. 23000288 / ALQUILER CONTENEDOR PODA PARQUES Y JARDINES
ADO 30/08/2023 2023 920 22626 296,45 PEREZ VILLALTA MARCO ANTONIO
servicio de sillas tapizadas negras y mesas grandes para las mesas electorales de las Elecciones Generales del 23 de Julio
ADO 30/08/2023 2023 9209 22103 30,00 MORENO NAVARRO VICTOR MANUEL
FACT: 23100288 DIESEL ELECTRICISTA RE: 2023-E-RE-3768
ADO 30/08/2023 2023 171 22103 70,00 ES ROTONDA DE SANTA FE SL
FACT: 23100287 DIESEL CAMION 6171 FDN RE: 2023-E-RE-3768
ADO 30/08/2023 2023 9209 22000 33,88 CAMACHO MARTINEZ JOSE
FACT: 2300117 PLACA DE PVC BLANCO ESPUMADO 5mm RE-2023-E-RE-3773
ADO 30/08/2023 2023 133 22706 267,71 CAMACHO MARTINEZ JOSE
FACT: 2300118 DUPLICADOS VADO PERMANENTE EN COMPOSITE RE: 2023-E-RE-3774
ADO 30/08/2023 2023 132 6240013 1.633,50 GRANADA COMUNICACIONES 2012 SLU
VEHICULO POLICIAL EN RENTING CON EQUIPAMIENTO / RENTING MOTOCICLETA POLICIAL

6.772,18

Visto que por el Sr. Interventor, de acuerdo con lo previsto en el art. 215 del Texto Refundido de la Ley Reguladora de Haciendas Locales se presentó reparo resaltando los términos siguientes:

"Se trata de facturas para las que no existe un procedimiento de licitación y al mismo tiempo aunque en su mayoría se quieren considerar como contrato menor de los previstos en el art. 29.8 de la LCSP; no pueden calificarse como "contrato menor" (art. 118.1 LCSP), toda vez que las prestaciones a contratar tienen carácter periódico o recurrente. Al mismo tiempo, trae causa de un contrato menor sucesivo que se requiere repetidamente en el tiempo. Por ésta razón, reitero como en otras ocasiones, que existe informe emitido desde el área de secretaría de fecha 16 de julio de 2015, sobre "contratación menor de prestaciones para cubrir necesidades de carácter recurrente o periódico". Por todo lo expuesto, entiendo que se debería haber articulado un procedimiento de licitación de acuerdo con lo previsto en la mencionada LCSP.

De este reparo deberá darse cuenta al Pleno de la Corporación y al Tribunal de Cuentas (art. 218TRLRHL).

Se presenta discrepancia contra la nota de reparo referida, apoyándose en que se trata de un gasto básico y necesario para el normal funcionamiento de los servicios municipales.

RESUELVO

PRIMERO: Solventar, en los términos previsto en el artículo 217 del Texto Refundido de la Ley Reguladora de las Haciendas Locales, la discrepancia en base a los argumentos presentados y ordenar la continuación de los expedientes.

En SantaFe a fecha de firma electrónica EL CONCEJAL DELEGADO DE HACIENDA Y GESTION ECONOMICA Fdo. Rubén Martínez Bermúdez`
},


{
  id: 'gil-corral-pagos-marzo',
  // Es un decreto de ORDENACIÓN DE PAGOS (art. 186.1), no de aprobación de
  // gasto: la distinción es real (informe de prelación de Tesorería, no
  // levantamiento de reparo por Alcaldía) y debe conservarse aunque también
  // contenga una relación de facturas — de eso trata precisamente el ajuste
  // que se acaba de hacer en clasificar().
  esperado: { tipo: 'pagos', expediente: '1009/2022', mandato: 'psoe-2019' },
  texto: `Expediente nº: 1009/2022 Asunto: Propuesta de pago Procedimiento: pagos marzo 2022

D. Manuel Alberto Gil Corral, Alcalde del Ayuntamiento de Santa Fe (Granada), en virtud de la competencia que me otorga el artículo 186.1 del RD 2/2004 por el que se aprueba el Texto Refundido de la Ley Reguladora de las Haciendas Locales, en relación a las siguientes obligaciones reconocidas:

Nº Operación Fase Importe Saldo Nombre Ter. Texto Libre

220220001680 ADO 2.823,50 2.823,50
CD CIUDAD DE SANTA FE
FACT. 04/2022, ORGANIZACIÓN PARTIDOS, ARBITRAJES Y GASTOS FEDERATIVOS RE: 2022-E-RE-753
220220001681 ADO 4.990,00 4.990,00
CD CIUDAD DE SANTA FE
FACT. 5/2022, FEBRERO/2022, MONITORES DEPORTIVOS ESCUELA MUNICIPAL DE FUTBOL EN VIRTUD CONVENIO RE: 2022-E-RE-754
220220001682 ADO 4.990,00 4.990,00
CD CIUDAD DE SANTA FE
FACT. 3/2022, FEBRERO/2022, MONITORES DEPORTIVOS ESCUELA MUNICIPAL FUTBOL SALA RE: 2022-E-RE-756
220220001683 ADO 4.500,00 4.500,00
CLUB BALONCESTO SANTA FE
FACT. 02/2022, FEBRERO/2022, MONITORES BALONCESTO RE; 2022-E-RE-757
220220001662 ADO 262,77 262,77
GIL CORRAL MANUEL ALBERTO
KILOMETR.MANUTENC.VIAJE PALOS 11 AL 13/03/22, "529 ANIVERS.REGRESO PUERTO PALOS CARABELAS PINTA Y NIÑA" EXPTE.697/2022
320220000401 PMP 16,00 16,00
GARCIA JIMENEZ FRANCISCO JAVIER
FIANZA. FRANCISCO JAVIER GARCIA JIMENEZ 15474313M. DEVOLUCION DE FIANZA GESTION DE RESIDUOS LO 2550/2021. EXPT.2550/2021
320220000464 PMP 898,62 898,62
DELEGACION DE LA AGENCIA ESTATAL DE ADMINISTRACION TRIBUTARIA DE GRANADA
MODELO 111, IRPF FEBRERO 2022, PERSONAL AYUNTAMIENTO, CORPORACION Y PROFESIONALES

Vistas las previsiones de tesorería y la liquidez disponible y los datos del pendiente de pago a fecha actual que obran en el expediente, visto el informe de reparo que consta en el expediente y visto informe de la Tesorera y del Interventor que expone:

"1. La prelación de pagos imperativa por Ley, que salvo mejor criterio fundado en derecho, debería respetarse, es la siguiente: 1º. Endeudamiento (artículo 14 Ley Orgánica 2/2012). 2º. Gastos de personal (artículo 187 RD 2/2004). 3º. Obligaciones contraídas en ejercicios cerrados (artículo 187 RD 2/2004) por orden de incoación de expediente.

A fecha actual existen en contabilidad obligaciones pendientes de pago de ejercicios cerrados, aprobadas con anterioridad a las propuestas, por lo cual no se cumple la prelación de pagos imperativa por Ley, y se informa desfavorablemente.

2. Debe aprobarse un plan de disposición de fondos en base al artículo 187 del RD 2/2004.

La Corporación no cumple este plazo de periodo medio de pago a proveedores actualmente.

6. Se tiene constancia de las siguientes Sentencias firmes:

- Sentencia firme nº 397/14 dictada por el Juzgado Contencioso-Administrativo nº 1 de Granada, donde se declara el derecho del actor a percibir la cantidad de 617.539,71 €, más los intereses moratorios de la ley de lucha contra la morosidad, con condena en costas para la Administración demandada.

- Sentencia firme nº 128/16 dictada por el Juzgado Contencioso-Administrativo nº 1 de Granada, donde se declara el derecho del actor a percibir la cantidad de 904.861,57 €, más los intereses moratorios de la ley de lucha contra la morosidad a favor de ANFRASA S.L.

RESUELVO

- Ordenar el pago de la relación propuesta y contenida en la presente resolución.

En Santa Fe a fecha de firma electrónica El Alcalde Fdo. D. Manuel Alberto Gil Corral`
},

{
  id: 'granata-reparo-gil-corral',
  esperado: { mandato: 'psoe-2019', importe: 10991.64 },
  texto: `DON MANUEL ALBERTO GIL CORRAL, ALCALDE PRESIDENTE EN FUNCIONES DEL EXCMO AYUNTAMIENTO DE SANTA FE (GRANADA), En uso de las facultades que me confiere el artículo 21.1.f) de la Ley 7/85 de 2 de abril.

A la vista del acuerdo adoptado por la Junta de Gobierno Local en sesión celebrada el 17 de mayo de 2022 consistente en: "Autorización del gasto, disposición del crédito y reconocimiento de obligación a favor de B06812242 – GRANATA PRODUCCIONES SL por importe de 10.991,64 € (diez mil novecientos noventa y un euros con sesenta y cuatro céntimos), derivada de la factura que ha presentado con número 109 y fecha 21-04-2022 y que causó entrada en el registro correspondiente con fecha 22-04-2022, con cargo a la aplicación presupuestaria 3342.226.99 "Promoción Cultural. Capitulaciones. Otros gastos diversos" del Presupuesto de 2022 prorrogado de 2021.".

Visto que por el Sr. Interventor, de acuerdo con lo previsto en el artículo 215 del texto refundido de la Ley Reguladora de las Haciendas Locales presentó reparo resaltando los términos siguientes: "Analizada la propuesta, desde esta Intervención se aprecia que no se está dando cumplimiento a la Instrucción Conjunta 1/2018 sobre los Contratos Menores en el Ayuntamiento de Santa Fe, no se tiene conocimiento de la existencia del preceptivo "Informe justificativo del contrato" emitido por el área interesada en la contratación exigido en el art. 118.1 de la Ley 9/2017 de 8 de noviembre de Contratos del Sector Público, toda vez que no se ha seguido ningún tipo de procedimiento de licitación.

De este reparo deberá darse cuenta al Pleno de la Corporación y al Tribunal de Cuentas (art. 218TRLRHL).

Visto que la Junta de Gobierno Local en esta misma sesión, presenta su discrepancia contra la nota de reparo referida, apoyándose en que se trata de un gasto básico y necesario para el normal funcionamiento de los servicios municipales y dado que se ha prestado el servicio facturado por lo que la no aprobación implicaría el enriquecimiento injusto de la administración, se considera conveniente continuar con la tramitación del expediente. Por tanto

RESUELVO

PRIMERO: Solventar, en los términos previstos en el artículo 217 del texto refundido de la Ley Reguladora de las Haciendas Locales, la discrepancia en base los argumentos presentados y ordenar la continuación del expediente.

Lo manda y firma el Sr. Alcalde en Santa Fe a fecha de firma electrónica

EL ALCALDE Fdo. Manuel Alberto Gil Corral`
},


{
  id: 'mapfre-multiitem',
  esperado: { mandato: 'psoe-2019', importe: 2942.28 },
  texto: `DON MANUEL ALBERTO GIL CORRAL, ALCALDE PRESIDENTE DEL EXCMO AYUNTAMIENTO DE SANTA FE (GRANADA), En uso de las facultades que me confiere el artículo 21.1.f) de la Ley 7/85 de 2 de abril.

A la vista de los acuerdos adoptados por la Junta de Gobierno Local en sesión celebrada el 11 de enero de 2022, consistentes en: "PROPUESTA: Autorización del gasto, disposición del crédito y reconocimiento de las siguientes obligaciones: 1.- por importe de 1.083,76 €, a favor de la COMPAÑÍA MAPFRE ESPAÑA COMPAÑÍA DE SEGUROS Y REASEGUROS S.A. (CIF: A28141935), para el pago del recibo de la Póliza 0781780027409 del Seguro de Multirriesgo Empresarial de instalaciones deportivas al aire libre, del campo de fútbol de césped, con período de vigencia del 11-01-2022 al 11-01-2023; con cargo a la Aplicación Presupuestaria 342.224.00 "Promoción y fomento del deporte. Primas de Seguros" del Presupuesto de 2.022 prorrogado de 2.021.

2.- por importe de 998,81 €, a favor de MAPFRE ESPAÑA, COMPAÑÍA DE SEGUROS Y REASEGUROS S.A. (CIF: A28141935), para el pago del recibo de la Póliza nº 0781182546919 del Seguro de Multirriesgo Empresarial del Centro Guadalinfo y Centro de Mayores, con vigencia del 19-01-2022 al 19-01-2023; con cargo a la Aplicación Presupuestaria 231.224.00 "Asistencia Social Primaria. Primas de Seguros" del Presupuesto de 2.022 prorrogado de 2.021.

3.- por importe de 859,71 €, a favor de MAPFRE ESPAÑA COMPAÑÍA DE SEGUROS Y REASEGUROS S.A. (CIF: A28141935), para el pago del recibo de la Póliza nº 0746080006482 del Seguro Multirriesgo Comercios del Centro de Servicios Sociales, con vigencia del 22-01-2022 al 22-01-2023; con cargo a la Aplicación Presupuestaria 231.224.00 "Asistencia Social Primaria. Primas de Seguros" del Presupuesto de 2.022 prorrogado de 2.021."

Visto que por el Sr. Interventor, de acuerdo con lo previsto en el artículo 215 del texto refundido de la Ley Reguladora de las Haciendas Locales presentó reparo resaltando los términos siguientes: "Que se trata de contratos de servicios, que aunque se quieren considerar como contratos menores de los previstos en el art. 29.8 de la LCSP; no pueden calificarse como "contrato menor" (art. 118.1 LCSP), toda vez que las prestaciones a contratar tienen carácter periódico o recurrente. Al mismo tiempo, traen causa de un contrato menor sucesivo que se requiere repetidamente en el tiempo. Por ésta razón, reitero como en otras ocasiones, que existe informe emitido desde el área de secretaría de fecha 16 de julio de 2015, sobre "contratación menor de prestaciones para cubrir necesidades de carácter recurrente o periódico". Por todo lo expuesto, entiendo que se debería haber articulado un procedimiento de licitación de acuerdo con lo previsto en la mencionada LCSP.

De este reparo deberá darse cuenta al Pleno de la Corporación y al Tribunal de Cuentas (art. 218TRLRHL)."

RESUELVO

PRIMERO: Solventar, en los términos previstos en el artículo 217 del texto refundido de la Ley Reguladora de las Haciendas Locales, la discrepancia en base los argumentos presentados y ordenar la continuación del expediente.

Lo manda y firma el Sr. Alcalde en Santa Fe a fecha de firma electrónica

EL ALCALDE Fdo. Manuel Alberto Gil Corral`
},

{
  id: 'renta-vitalicia',
  esperado: { expediente: '302/2022', mandato: 'psoe-2019', importe: 1098.53 },
  texto: `EXPEDIENTE 302/2022

DON MANUEL ALBERTO GIL CORRAL, ALCALDE PRESIDENTE DEL EXCMO. AYUNTAMIENTO DE SANTA FE (GRANADA), En uso de la facultades que me confiere el artículo 21.1.f) de la Ley 7/85 de 2 de abril.

Vista la propuesta de Hacienda del tenor literal siguiente: PROPUESTA: Autorización del gasto, disposición del crédito y reconocimiento de obligación por importe de 1.098,53 € (48,08 € revalorización renta enero 2022 más 787,84 € renta febrero 2022 más 262,61 € parte proporcional paga extra junio), para el pago a DOÑA FRANCISCA ÁLVAREZ SÁNCHEZ (NIF: 24093093H), en concepto de última pensión vitalicia correspondiente al mes de febrero de 2022 por defunción de la Sra. Álvarez Sánchez el día 16-02-2022, aprobada por Acuerdo de Comisión de Gobierno de fecha once de noviembre de 1997; con cargo a la Aplicación Presupuestaria 211.161.03 "Pensiones. Pensiones excepcionales" del Presupuesto de 2022 prorrogado de 2.011.

Visto que el Sr, Interventor, de acuerdo con lo previsto en el artículo 215 del texto refundido de la Ley Reguladora de las Hacienda Locales presentó reparo cuyo tenor literal es el siguiente: "El pago de la pensión no se adecua a la normativa vigente al respecto ya que como en su día informó la intervención sobre este particular, informe al que me remito, no es competencia del Ayuntamiento la concesión de pensiones que corresponden a la seguridad social. De este reparo deberá darse cuenta al Pleno de la Corporación y al Tribunal de Cuentas (art. 218TRLRHL)".

RESUELVO

PRIMERO.- Solventar, en los términos previstos en el artículo 217 del texto refundido de la Ley Reguladora de las Hacienda Locales, la discrepancia dado que se trata de un acto administrativo firme, por lo que este Ayuntamiento está obligado a su cumplimiento, en virtud del Acuerdo de la Comisión de Gobierno que en su día resolvió.

SEGUNDO.- La autorización del gasto, disposición del crédito y reconocimiento de obligación por importe de 1.098,53 €, para el pago a DOÑA FRANCISCA ÁLVAREZ SÁNCHEZ (NIF: 24093093H), en concepto de última pensión vitalicia correspondiente al mes de febrero de 2022 por defunción de la Sra. Álvarez Sánchez el día 16-02-2022, aprobada por Acuerdo de Comisión de Gobierno de fecha once de noviembre de 1997; con cargo a la Aplicación Presupuestaria 211.161.03 "Pensiones. Pensiones excepcionales" del Presupuesto de 2022 prorrogado de 2.011.

TERCERO.- Comunicar el presente Decreto a las Oficinas de Intervención y Tesorería para que se dé cumplimiento del mismo.

En Santa Fe a fecha de firma electrónica EL ALCALDE Fdo. Manuel Alberto Gil Corral`
},

{
  id: 'seguros-sociales-julio-2026',
  // Formato D con una variante real no vista hasta ahora: "Fase Aplicación
  // Importe" (un código presupuestario sin decimales antes del importe real),
  // en vez de "Fase Importe Saldo". Tomar a ciegas el primer número tras la
  // fase leía el código de aplicación "16000" como si fueran 16.000 € en cada
  // línea, e infló el total de un decreto real de 168.613,29 € (el que
  // declara el propio PDF) a más de 2.166.595 €, además de contar a la
  // Seguridad Social como "proveedor recurrente" por esa cifra falsa.
  esperado: { tipo: 'pagos', expediente: '4496/2026', mandato: 'pp-2023' },
  texto: `Expediente nº : 4496/ 2026 Asunto: Propuesta de pago Procedimiento: Seguros sociales JULIO 2026

D. Juan Cobo Ortiz, Alcalde Presidente del Excmo. Ayuntamiento de Santa Fe (GRANADA). En uso de las facultades que me confiere el artículo 21.1.f de la Ley 7/85 de 2 de abril, Reguladora de las Bases de Régimen Local, y el artículo 186.1 del RD 2/2004 por el que se aprueba el Texto Refundido de la Ley Reguladora de las Haciendas Locales, prevista igualmente en las Bases de Ejecución del Presupuesto Municipal vigente,

RESUELVO

Ordenar el pago de los seguros sociales de JULIO/2026, con el detalle de aplicaciones presupuestarias, importes brutos siguientes y por los importes líquidos que se reflejan:

Nº Operación Fase Aplicación Importe Nombre Ter. Texto Libre
2026 9208 TESORERIA GENERAL JUNIO/2026, SEGUROS SOCIALES LABORALES.
220260010031 ADO 16000 8.038,88 SEGURIDAD SOCIAL GRANADA EXPTE. 3779/2026
JULIO 2026 SEGUROS SOCIALES, MIEMBROS
2026 912 TESORERIA GENERAL DE LA CORPORACION Y PERSONAL DE
220260011104 ADO 16000 4.425,95 SEGURIDAD SOCIAL GRANADA CONFIANZA. EXPTE. 4496/2026
2026 132 TESORERIA GENERAL JULIO/2026, SEGUROS SOCIALES
220260011105 ADO 16000 27.450,57 SEGURIDAD SOCIAL GRANADA FUNCIONARIOS. EXPTE. 4496/2026
2026 151 TESORERIA GENERAL JULIO/2026, SEGUROS SOCIALES PERSONAL
220260011106 ADO 16000 808,52 SEGURIDAD SOCIAL GRANADA LABORAL. EXPTE. 4496/2026
2026 1531 TESORERIA GENERAL JULIO 2026 SEGUROS SOCIALES PROGRAMAS
220260011108 ADO 61962 7.376,52 SEGURIDAD SOCIAL GRANADA EXPEDIENTE 4496/2026
CUOTA SEGURIDAD SOCIALTRABAJADOR
TESORERIA GENERAL MENOS PAGOSDELEGADOS POR IT. EXPTE.
320260001262 PMP 20030 4.925,74 SEGURIDAD SOCIAL GRANADA 4496/2026

168.613,29

En Santa Fe a fecha de firma electrónica
El Alcalde Presidente
Fdo. Juan Cobo Ortiz`
},

{
  id: 'delegacion-merlo-urbanismo',
  // Confirmado con David: varios concejales firman a diario por delegación
  // (Hacienda, Urbanismo, Mantenimiento...) citando todos la misma
  // Resolución de Alcaldía 2023-1200. Sin reconocerlo, la atribución de
  // mandato marcaba "confianza: revisar" en el 85 % de una serie real de
  // 2026, como si una delegación legítima fuera una anomalía.
  esperado: { mandato: 'pp-2023' },
  texto: `EXPEDIENTE 9001/2026 Asunto: Autorización caseta

DON ANDRES MERLO RODRIGUEZ, CONCEJAL DELEGADO DE URBANISMO, PERSONAL Y CONTRATACIÓN DEL EXCMO AYUNTAMIENTO DE SANTA FE (GRANADA), en virtud de Resolución de Alcaldía n.º 2023-1200, de 22 de junio de 2023, y en uso de las atribuciones que legalmente me confiere la vigente Legislación de Régimen Local, vengo a dictar el siguiente

HECHOS Y FUNDAMENTOS DE DERECHO

Vista la solicitud presentada para la instalación de casetas de feria con motivo de la celebración de las Fiestas de Santa Fe 2026.

Fecha: 27/08/2026

RESOLUCIÓN

PRIMERO: Conceder la autorización solicitada.

En Santa Fe a fecha de firma electrónica.

EL CONCEJAL DELEGADO
Fdo. D. Andrés Merlo Rodríguez.`
},

{
  id: 'delegacion-leyva-mantenimiento',
  esperado: { mandato: 'pp-2023' },
  texto: `RESOLUCIÓN Expediente nº: 4658/2026

DOÑA SUSANA LEYVA PEREZ, CONCEJAL DELEGADA DE MANTENIMIENTO, MEDIO AMBIENTE, GOBERNACIÓN, PATRIMONIO, OBRAS PÚBLICAS E INFRAESTRUCTURAS DEL EXCMO. AYUNTAMIENTO DE SANTA FE, en virtud de Resolución de Alcaldía n.º 2023-1200, de 22 de junio de 2023, y en uso de las atribuciones que me confiere la Legislación vigente de Régimen Local vengo a dictar la siguiente

HECHOS Y FUNDAMENTOS DE DERECHO

Visto el escrito presentado en el que solicita que se pinte la línea amarilla frente a su vado.

Fecha: 26/08/2026

RESOLUCIÓN

PRIMERO: Autorizar la línea amarilla del vado.

En Santa Fe, a fecha de firma electrónica

LA CONCEJAL DELEGADA
FDO: Dª. Susana Leyva Pérez.`
},

{
  id: 'licencia-caseta-joven-2026-1651',
  // Extracto real del decreto 2026-1651 (licencia de caseta, Fiestas de San
  // Agustín 2026), con el mismo desorden que produce pdf.js de verdad sobre
  // este documento: el pie rotado de esPublico Gestiona ("DECRETO" /
  // "Número: 2026-1651" / "Fecha: 28/08/2026") NO sale contiguo — itemsALineas()
  // (extract.js) agrupa por altura, y al estar girado 90° sus fragmentos
  // caen mezclados con líneas de cuerpo sin relación, en un orden distinto
  // cada vez. "Fecha: 28/08/2026" queda aquí varias líneas ANTES que
  // "Número: 2026-1651", que a su vez queda pegado a un fragmento de
  // "SEGUNDO.- Vista la documentación...". Esto tumbó el primer intento de
  // arreglo (que asumía "DECRETO Número: X Fecha: Y" como frase seguida).
  // Además, el patrón genérico de número/fecha cogía "Resolución de Alcaldía
  // n.º 2023-1200 de 22 de junio de 2023" (la delegación que da competencia
  // al firmante, citada en el encabezamiento) en vez del número y fecha
  // reales del decreto. Y la cláusula de estilo sobre sanciones futuras
  // ("imponer las sanciones que correspondiesen") etiquetaba la licencia
  // entera como "Sanción o multa".
  esperado: { tipo: 'licencia_actividad', expediente: '5002/2026' },
  texto: `RESOLUCIÓN
Expediente nº: 5002/2026
Resolución con número y fecha establecidos al margen
Procedimiento: Licencia de Actividades y Espectáculos Públicos
Asunto del Expediente: Puesta en funcionamiento de CASETA JOVEN durante Fiestas Santa Fe 2026 (KOMMAFEST S.L)

DON RUBEN MARTINEZ BERMUDEZ, CONCEJAL DELEGADO DE HACIENDA Y GESTION ECONOMICA, JUVENTUD, NUEVAS TECNOLOGIAS, FIESTAS, COMUNICACION Y ACTIVIDADES DEL EXCMO. AYUNTAMIENTO DE SANTA FE (GRANADA), en virtud de Resolución de Alcaldía n.º 2023-1200 de 22 de junio de 2023 y Resolución de Alcaldía nº. 2025-2549 de 19 de noviembre de 2025, y en uso de las atribuciones que me confiere la vigente Legislación de Régimen Local, vengo a dictar la siguiente

HECHOS Y FUNDAMENTOS DE DERECHO

PRIMERO. Vista la solicitud presentada para la instalación casetas Joven de feria con motivo de la celebración de las Fiestas Patronales de San Agustín 2026, durante los días 27 a 30 de agosto de 2026, por: 5002/2026 Licencia de puesta en funcionamiento KOMMAFEST SL CASETA JOVEN

Fecha: 28/08/2026

SEGUNDO.- Vista la documentación presentada por el interesado y el informe emitido por el Número: 2026-1651
DECRETO
Ingeniero Técnico Municipal de fecha 27 de agosto de 2026, las actividades solicitadas están consideradas como una actividad recreativa ocasional y extraordinaria.

RESOLUCIÓN

PRIMERO: Conceder a KOMMAFEST SL, autorización para la INSTALACIÓN y PUESTA EN FUNCIONAMIENTO de una Caseta Joven.

TERCERO: Háganse las notificaciones que procedan, encomendando a la Jefatura de la Policía Local la supervisión, vigilancia y control de la actividad, de forma que si comprobasen que no se están cumpliendo las condiciones u obligaciones indicadas, levantarán acta de denuncia a los efectos de imponer las sanciones que correspondiesen, dando traslado a esta Concejalía para adoptar la resolución que procediese.

ºEn Santa Fe, a fecha de firma electrónica.
EL CONCEJAL DELEGADO.
Fdo.: D. Rubén Martínez Bermúdez.`
},

{
  id: 'ayuda-social-basica-2026-1528',
  // Extracto real del decreto 2026-1528 (Programa Municipal de Atención
  // Social Básica). No lleva "Asunto:" ni "PROPUESTA:" propios — solo un
  // título de portada — así que extraerObjeto() se quedaba con la basura que
  // devolvía el patrón suelto de "PROPUESTA" ("emitido por el Equipo de SSC,
  // la Propuesta de Gasto de la...", cogido de en medio de una frase). Y el
  // punto en "EL ALCALDE- PRESIDENTE." (antes de "Fdo.") rompía el patrón de
  // firmante. Además, es el caso de uso real de extraerBeneficiario(): el
  // dato que de verdad importa en este tipo de decreto (a quién se le
  // reconoce la ayuda) no lo recogía ningún campo de la ficha.
  esperado: { tipo: 'general', expediente: '4848/2026' },
  texto: `08 RESOLUCIÓN DE ALCALDÍA:
Programa Municipal de Atención Social Básica 2026
Nº EXPEDIENTE: 4848/2026

D. JUAN COBO ORTIZ, Alcalde - Presidente del Ayuntamiento de Santa Fe, en uso de las atribuciones que la vigente Legislación de Régimen Local me confiere, he dictado el siguiente

RESOLUCIÓN:

Vistas las circunstancias que concurren en el expediente tramitado por los Servicios Sociales Comunitarios Municipales de D./Dª ELENA GRANADOS MATEOS con DNI Nº 74639163T, el Informe-Propuesta emitido por el Equipo de SSC, la Propuesta de Gasto de la Sr. Concejal-Delegado de Hacienda y Gestión Económica, y el Informe de Intervención, es por lo que, de conformidad con lo establecido en el art. 21.1 g) de la Ley 7/1985, de 2 de abril, Reguladora de las Bases de Régimen Local, HE RESUELTO:

Fecha: 24/08/2026

1. APROBAR una Ayuda de Atención Social Básica, a favor de
D./Dª ELENA GRANADOS MATEOS con DNI Nº 74639163T
dentro del ámbito del "Programa Municipal de Atención Social Básica, 2026", gestionado por este Ayuntamiento de Santa Fe, por importe de DOS MIL SEISCIENTOS EUROS (2.600€), con cargo a la Aplicación Presupuestaria Nº 2410.480.00.01 para el

Número: 2026-1528
DECRETO

"Programa Municipal de Atención Social Básica 2026"

2. Dar traslado de esta Resolución para su tramitación que proceda a Intervención y Tesorería, así como al mismo Área de SSC.

En Santa Fe, a fecha de firma electrónica

EL ALCALDE- PRESIDENTE.
Fdo. Juan Cobo Ortiz.`
},

{
  id: 'convocatoria-jgl-2026-1533',
  // Extracto real del decreto 2026-1533 (convocatoria de JGL), con el mismo
  // desorden que produce pdf.js: los fragmentos del pie ("Fecha: ...",
  // "Número: ...", "DECRETO" sueltos) se intercalan como líneas propias
  // dentro del bloque del orden del día, partiendo la frase del punto 3 y
  // separando las dos líneas del punto 5. Y el punto "2024/4/PIDE-21." del
  // punto 5 tiene un número de 1-2 cifras seguido de punto EN MEDIO de una
  // línea — sin anclar la búsqueda al principio de línea, se confundía con
  // el arranque de un punto nuevo del orden del día.
  esperado: { tipo: 'junta_gobierno', expediente: 'JGL/2026/32' },
  texto: `Expediente: JGL/2026/32
Asunto: Resolución de Alcaldía

DECRETO

De conformidad con lo dispuesto en el artículo 21.c) de la Ley 7/1985 de 2 de abril Reguladora de las Bases del Régimen Local y arts. 41.4 y 112.3 del Real Decreto 2568/1986 de 28 de noviembre por el que se aprueba el Reglamento de Organización, Funcionamiento y Régimen Jurídico de las Entidades Locales, RESUELVO:

PRIMERO. Convocar Sesión de carácter ordinario, a celebrar por la Junta de Gobierno Local el día 25 de agosto de 2026 a las 9:00 horas, en primera convocatoria y una hora más tarde en segunda convocatoria en caso de no existir el quórum exigido en la primera, en el Despacho de Alcaldía del Ayuntamiento, a fin de resolver los puntos incluidos en el siguiente ORDEN DEL DÍA:

A) Parte resolutiva.

1. Aprobación del Acta de la sesión extraordinaria celebrada el día 13 de agosto de 2026.
2. HACIENDA Y GESTIÓN ECONÓMICA. Expediente 4983/2026. Propuesta de Gasto.
3. HACIENDA Y GESTIÓN ECONÓMICA. Expediente 4496/2026. Aprobación nóminas
Fecha: 24/08/2026
agosto y seguros sociales de julio 2026.
4. PERSONAL. Expediente 4410/2026. Reconocimiento de Antigüedad por el Personal de la Entidad.
5. CONTRATACIONES. Expediente 8886/2025. Aprobación de la certificación nº 2 referida al
expediente de contratación para las "obras en el polideportivo municipal de deportes
Número: 2026-1533
DECRETO
181755908: Pabellón mejora de salas, eficiencia energética, acondicionamiento de canastas, sustitución puerta emergencia, etc. 2024/4/PIDE-21.
6. CONTRATACIÓN. Expediente 2061/2025. Acuerdo de revocación del acuerdo adoptado en el punto nº 6 del orden de la sesión de la Junta de Gobierno Local de 2 de junio de 2026
7. CONTRATACIÓN. Expediente 1748/2026. Adjudicación de la concesión demanial de uso privativo del puesto nº 6 del Mercado de Abastos destinado a frutería.
8. CONTRATACIÓN. Expediente 3484/2026. cesión de uso provisional de los espacios destinados en el PP2 a la siguiente Asociación o Entidad Ciudadana de Santa Fe para la instalación y explotación de una de las tres casetas de asociaciones o tradicionales en el marco de la celebración de las Fiestas de Santa Fe 2026.

B) Comunicaciones de interés.

C) Asuntos urgentes.

SEGUNDO. Notificar la presente Resolución a los miembros integrantes de la Junta de Gobierno Local, advirtiéndoles que, conforme a lo dispuesto en el art. 12.1 del ROF, deberán comunicar con la antelación necesaria cualquier causa justificada que implique la imposibilidad de asistir a la citada sesión.

TERCERO. Que por la Secretaría General se ponga a disposición de los/as Sres./as Concejales/as la documentación de los asuntos incluidos en el orden del día.

Fecha: 24/08/2026
Número: 2026-1533
DECRETO`
},

{
  id: 'exencion-ibi-desestimada-2026-1697',
  // Extracto real del decreto 2026-1697. Trampa real: el bloque "HECHOS Y
  // FUNDAMENTOS DE DERECHO" tiene SU PROPIA numeración PRIMERO/SEGUNDO
  // (argumentando por qué no procede la exención), sin ningún "RESOLUCIÓN"
  // ni "DISPONGO" delante — así que extraerResolucion() no puede anclarse a
  // "el primer PRIMERO", tiene que ser al último encabezado "RESOLUCIÓN".
  esperado: { tipo: 'general', expediente: '5176/2026' },
  texto: `RESOLUCIÓN
Expediente nº: 5176/2026
Asunto del Expediente: EXENCIÓN IBI CONJUNTO HISTÓRICO FERNANDO ARIZA DÍAZ

DON RUBEN MARTINEZ BERMUDEZ, CONCEJAL DELEGADO DE HACIENDA Y GESTION ECONOMICA, en virtud de Resolución de Alcaldía n.º 2023-1200 de 22 de junio de 2023, vengo a dictar la siguiente

HECHOS Y FUNDAMENTOS DE DERECHO

PRIMERO. En la Ordenanza fiscal reguladora del Impuesto sobre Bienes Inmuebles, aprobada por este Ayuntamiento, recoge en el artículo 3, que estarán exentos los inmuebles declarados monumento o jardín histórico.

SEGUNDO. NO consta que el inmueble se incluya "Catálogo Urbanístico de Bienes y Espacios Protegidos" del Conjunto Histórico de Santa Fe.

A la vista de todo ello, se informa QUE NO PROCEDE la exención prevista.

RESOLUCIÓN

PRIMERO. Desestimar la solicitud al no cumplir los requisitos recogidos en la Ordenanza fiscal
reguladora.
SEGUNDO. Notificar el presente Decreto al interesado.

ºEn Santa Fe, a fecha de firma electrónica.
EL CONCEJAL DELEGADO.
Fdo.: D. Rubén Martínez Bermúdez.`
},

{
  id: 'periodicidad-jgl-disponsgo-2026-1694',
  // Extracto real del decreto 2026-1694: usa "DISPONGO" como encabezado del
  // punto resolutivo, no "RESOLUCIÓN" — hay que reconocer ambos.
  esperado: { expediente: '3782/2023' },
  texto: `Expediente: 3782/2023
Asunto: Modificación de la periodicidad de las sesiones de la Junta de Gobierno Local

DON JUAN COBO ORTIZ, ALCALDE-PRESIDENTE DEL EXCMO. AYUNTAMIENTO DE SANTA FE, en uso de las atribuciones que me confiere la Ley 7/1985, vengo a dictar el siguiente:

DECRETO

CONSIDERANDO que la Junta de Gobierno Local es un órgano colegiado necesario.

En ejercicio de las atribuciones que confiere a esta Alcaldía, HE RESUELTO :

DISPONGO

PRIMERO.- Modificar la periodicidad de la celebración de las sesiones ordinarias de la Junta de
Gobierno Local, fijándose los miércoles a las 9:00 h de la mañana.
SEGUNDO .- Lo acordado en este Decreto surtirá efectos desde el día siguiente al de la fecha del mismo.

En Santa Fe, a fecha de firma electrónica.
EL ALCALDE-PRESIDENTE`
},

{
  id: 'sanciones-trafico-masivo-2026-1695',
  // Extracto real del decreto 2026-1695: decenas de expedientes sancionadores
  // de tráfico en una tabla, sin ningún punto resolutivo limpio que resumir
  // ("DISPONGO :" va seguido de prosa continua en la misma línea, no es un
  // encabezado de sección) — lo que importa aquí es el recuento total.
  esperado: { expediente: '4809/2026' },
  texto: `Expte. 4809/2026.
Procedimiento: Procedimientos Sancionadores en materia de Tráfico.

DON JUAN COBO ORTIZ, ALCALDE-PRESIDENTE DEL EXCMO. AYUNTAMIENTO DE SANTA FE (GRANADA), en uso de las atribuciones que me confiere la vigente Legislación de Régimen Local,

RESUELVO :

Instruidos por el Servicio Provincial Tributario, los correspondientes procedimientos sobre los expedientes incoados por infracciones en materia de tráfico, abajo detallados.

DISPONGO : la conclusión de los mismos y, al estimar cometidos los hechos denunciados, la imposición de las sanciones por las infracciones a la normativa de tráfico cuyos datos se detallan más abajo.

Municipio: SANTA FE
Total expedientes: 17, desde CORTES FERNANDEZ MANUEL hasta PLAKIA SYSTEMS SL:

Total núm. Expedientes: 17 Total Importe principal: 8.700,00 €

En Santa Fe a fecha de firma electrónica.
EL ALCALDE-PRESIDENTE`
},

{
  id: 'indice-libro-decretos',
  // El índice del lote (se sube junto a los decretos) no es un decreto: sin
  // reconocerlo aparte, el motor le atribuía número, fecha y objeto sacados
  // del primer decreto que lista el propio índice.
  esperado: { tipo: 'indice' },
  texto: `Libro: Libro de Decretos
Apertura: 1 de abril de 2015

ÍNDICE DE DOCUMENTOS

DECRETO 2026-1651 [Resolución PR/2026/1651 - Actuación genérica sin firma de propuesta] (4SDTH6YALT9M2JD7SJJNFW26Y)
DECRETO 2026-1650 [Resolución PR/2026/1650 - Actuación genérica sin firma de propuesta] (5YKFGCS5CAWSM3DLCAPDW655E)`
},

];