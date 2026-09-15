# Fiscaliza — qué estamos haciendo y por qué

*Documento explicativo. Grupo Municipal Socialista de Santa Fe. Agosto de 2026.*

---

## 1. El problema

Un concejal de la oposición recibe, cada mes, una remesa de decretos de Alcaldía. En Santa Fe la serie de 2023 supera los ciento sesenta. Cada uno es un PDF de entre dos y quince páginas, redactado en lenguaje administrativo, con la información relevante — el importe, el proveedor, el motivo del reparo, la aplicación presupuestaria — enterrada entre fórmulas jurídicas repetidas.

Leerlos todos es materialmente inviable con dedicación parcial. Y quien no los lee, no fiscaliza: se limita a reaccionar a lo que el gobierno decide contar.

Hay un segundo problema, menos evidente y más importante. Lo que sirve para fiscalizar **casi nunca está en un decreto**. Un contrato menor es un trámite ordinario. El mismo contrato menor con el mismo proveedor doce meses seguidos es un incumplimiento del artículo 118.1 de la Ley de Contratos del Sector Público. Un reparo de Intervención es una discrepancia técnica. El mismo reparo repetido durante tres años es una decisión política sostenida. **El hallazgo está en la serie, y la serie no la ve nadie porque nadie tiene tiempo de reconstruirla a mano.**

## 2. Qué hemos construido

Una herramienta web que hace tres cosas:

**Resume.** Se le sueltan los decretos y devuelve una ficha técnica por cada uno: número, expediente, objeto, fecha, firmante, importe, aplicaciones presupuestarias, motivos del reparo, y —cuando el decreto trae una relación de facturas, que es el caso más habitual— la descomposición línea a línea: quién cobra, cuánto, por qué concepto, y si el importe declarado cuadra con la suma de lo leído. Neutra, sin interpretación, con los datos que no constan declarados expresamente como no constantes.

**Señala.** En documento aparte y claramente etiquetado como criterio editorial, indica qué merece una pregunta: con la norma en que se apoya, la pregunta ya formulada para el pleno, la réplica previsible del equipo de gobierno y una propuesta alternativa en positivo.

**Acumula.** Guarda las fichas en un registro local y detecta lo que no se ve documento a documento: proveedores recurrentes —contando por facturas, no por decretos, para que cuarenta facturas pequeñas del mismo proveedor repartidas en seis remesas no se pierdan como "solo seis decretos"—, motivos de reparo que se repiten, posibles fraccionamientos de contrato, saltos en la numeración de la serie.

## 3. La decisión técnica que lo condiciona todo

Los decretos municipales contienen datos personales reales de vecinos. No es una hipótesis: en un solo decreto de ordenación de pagos del Ayuntamiento de Santa Fe aparecen nombres completos de personas perceptoras de ayudas de atención social básica, del programa extraordinario de urgencia y del programa provincial de intervención familiar, cada una con su número de expediente. Son documentos públicos, pero eso no convierte en aceptable subirlos a un servidor de terceros.

Por eso la herramienta **no tiene servidor**. Todo el procesamiento —lectura del PDF, extracción, anonimización, clasificación, alertas— ocurre dentro del navegador de quien la usa. No hay cuentas, no hay base de datos remota, no hay copia. Los documentos no salen del equipo.

Esto tiene una consecuencia y conviene decirla sin adornos: **una herramienta que no envía nada a ningún modelo de lenguaje no puede razonar**. Detecta lo que se le ha enseñado a detectar y nada más. Esa limitación es real y es el precio de la garantía de privacidad. En el documento de arquitectura se detalla una segunda variante que sí incorpora razonamiento, enviando únicamente texto previamente anonimizado en el propio navegador.

## 4. Cómo se han construido las alertas

No están inventadas. Salen de leer los decretos reales del Ayuntamiento de Santa Fe y de identificar los motivos que el propio Interventor formula, con su literalidad:

- Prestaciones de carácter recurrente tramitadas como contrato menor.
- Ausencia de procedimiento de licitación.
- Falta del informe justificativo del contrato exigido por el artículo 118.1 de la LCSP.
- Incumplimiento de las instrucciones internas 1/2018 y 1/2019 del propio Ayuntamiento.
- Advertencias ya formuladas en informes de Secretaría de 2015 y 2018 que siguen sin corregirse.
- Irregularidades en la asignación de trabajo del personal, en los contratos laborales y en los complementos personales.
- Asunción de gastos de servicios que no son competencia municipal.
- Incumplimiento de la prelación legal de pagos, ausencia de plan de disposición de fondos y de plan de tesorería, periodo medio de pago incumplido y devengo de intereses de demora.
- Sentencias firmes con importes pendientes de contabilización.

Cada alerta lleva la norma que la sostiene. La firmeza viene del dato, no del tono.

## 5. La advertencia que hay que leer dos veces

Al calibrar la herramienta con los decretos reales apareció esto:

> El reparo de la nómina de enero de 2023 lo firma la Alcaldesa. El de noviembre de 2023 lo firma el Alcalde. **El texto del reparo es idéntico, palabra por palabra**: los mismos cinco puntos del Interventor, la misma defensa de la Junta de Gobierno basada en una RPT en elaboración, el mismo levantamiento por el artículo 217.

Es decir: una parte sustancial de las irregularidades que el Interventor viene señalando **no son de este gobierno, son del Ayuntamiento**, y se producen bajo administraciones de distinto color. Lo mismo ocurre con la prórroga presupuestaria y con buena parte de la contratación recurrente.

Una herramienta que se limitara a marcar banderas rojas sería, en este contexto, un arma cargada apuntando hacia dentro. Por eso el sistema:

1. **Atribuye cada decreto a su firmante y a su mandato** antes de evaluar nada. Es un campo de primera clase, no una nota al pie.
2. **Marca como "doble filo"** toda alerta que se active también con decretos de gobiernos anteriores, con un aviso explícito en pantalla y en el documento exportado.
3. **Detecta expresamente la continuidad estructural** entre mandatos y, cuando la encuentra, lo dice sin ambages: *no uses esto como ataque*.
4. **Registra el argumento de la herencia recibida** cuando aparece en el propio decreto, porque es la réplica que se va a recibir y conviene tenerla anticipada.

Esto no debilita la fiscalización. La hace utilizable. Un problema estructural planteado como problema estructural, con propuesta de solución encima de la mesa, sitúa a quien lo plantea por encima del reproche partidista. Planteado como reproche, se devuelve en veinte segundos.

## 6. Segundo hallazgo: el mandato 2019–2023 tuvo dos alcaldías, no una

Calibrando el extractor de facturas contra decretos reales de 2022 apareció algo que la primera versión de esta herramienta tenía mal: un decreto de julio de 2022 lo firma **"Manuel Alberto Gil Corral, Alcalde"**, no Patricia Carrasco Flores.

Verificado por prensa (El Independiente de Granada, La Voz de Granada, 20 de enero de 2023): Gil Corral fue alcalde desde la constitución de la corporación en 2019 y **renunció el 19 de enero de 2023**, tras cumplir su compromiso de ejercer solo dos legislaturas. Carrasco —entonces segunda teniente de alcalde y concejala de Hacienda— tomó posesión al día siguiente, **el 20 de enero de 2023**, en un relevo interno del propio PSOE. No fue una moción de censura: fue un traspaso pactado dentro del grupo, "un relevo generacional y natural" en palabras del propio Gil.

La consecuencia práctica: de los casi cuatro años del mandato 2019–2023, **Gil Corral firmó unos tres años y medio, y Carrasco Flores solo los últimos cinco meses**. Una versión de la herramienta que tratara todo ese mandato como "Carrasco Flores" habría atribuido mal la inmensa mayoría de esos decretos — y como el mecanismo de doble filo depende enteramente de saber quién firmó qué, un error de atribución ahí no es un detalle estético, es el fallo que el propio mecanismo de seguridad existe para evitar.

La tabla de mandatos (`js/config.js`) ahora admite varias alcaldías por mandato, cada una con su propio rango de fechas. La atribución se resuelve primero por alcaldía —quién firmaba ese día— y el mandato se deriva de ahí, nunca al revés. Esto es una lección reutilizable más allá de Santa Fe: **cualquier ayuntamiento con un pacto de gobierno, una rotación de bastón de mando o una moción de censura dentro del mismo mandato necesita esta estructura**, no una casilla de "alcaldía" a secas.

## 7. Verificación con decretos reales: qué se ha corregido

La primera versión de esta herramienta se calibró contra un puñado de decretos. Esta revisión se ha hecho expresamente contra una muestra más amplia y más diversa —incluyendo decretos de "ordenación de pagos" de 2022 con un formato de tabla que la primera versión no leía en absoluto— y ha corregido, entre otras cosas:

- **Un cuarto formato de tabla** ("Nº Operación / Fase / Importe / Saldo", el que usan los decretos de ordenación de pagos) que no encajaba en ninguno de los tres formatos originales y que, sin esta corrección, dejaba esos decretos sin una sola factura extraída.
- **Cuatro categorías de línea que no son "proveedor"**: ayudas sociales, devoluciones de fianzas e ICIO, remesas tributarias obligatorias (IRPF, Seguridad Social) y dietas/kilometraje de cargos y personal. Sin distinguirlas, una devolución de fianza a un vecino o un pago mensual a Hacienda se contaban como si fueran compras a un proveedor, lo que habría falseado precisamente las alertas de proveedor recurrente que son el objeto de este encargo.
- **Una alcaldía sin proteger**: Manuel Alberto Gil Corral no estaba en la lista de cargos públicos, así que su propio nombre se anonimizaba en los decretos que él mismo firmaba.
- **La distinción entre "ordenación de pagos" y "aprobación de gasto"**: un primer intento de arreglo forzaba a clasificar como "facturas" cualquier decreto con una tabla de líneas, lo que borraba la diferencia legal entre ambos procedimientos. Se corrigió para que la relación de facturas se muestre siempre que exista, sin necesidad de aplastar la clasificación del decreto para conseguirlo.

## 8. Lo que la herramienta no hace

Conviene ser explícito, porque la tentación de confiar de más es real.

- **No garantiza la anonimización.** El filtro funciona sobre patrones del lenguaje administrativo español. Falla con nombres poco frecuentes y no puede nada contra la identificación indirecta: en un municipio de veinte mil habitantes, "el titular del expediente de urgencia social del tercer trimestre" identifica a alguien aunque no aparezca su nombre. Hay que revisar antes de compartir. Siempre.
- **No lee PDF escaneados.** Si el documento es una imagen sin capa de texto, la herramienta lo dice y no lo procesa.
- **No emite conclusiones.** Las alertas son puntos que merecen una pregunta. La diferencia entre "aquí hay una irregularidad" y "esto merece una pregunta en el pleno" es la diferencia entre una acusación y una labor de fiscalización.
- **No sustituye la lectura.** Antes de llevar un dato al pleno hay que abrir el decreto y comprobarlo. La herramienta dice dónde mirar; no exime de mirar.
- **No es un producto.** Es una herramienta de trabajo interno. Convertirla en un servicio público para concejales de cualquier municipio exigiría mantenimiento indefinido, soporte y asumir responsabilidad sobre datos de terceros ayuntamientos. Esa decisión no corresponde a una agrupación local.

## 9. Qué aporta al trabajo del grupo

- **Tiempo.** Una remesa de sesenta decretos pasa de una semana de lectura a una tarde de revisión dirigida.
- **Memoria.** El registro acumulado convierte tres años de decretos en una serie consultable. Eso es lo que permite decir "esto lleva ocurriendo veintitrés meses" en lugar de "esto me suena que ya pasó".
- **Rigor.** Cada alerta arrastra su fundamento normativo. Ninguna crítica sale sin norma detrás y sin propuesta alternativa delante.
- **Seguridad.** Frente a la práctica habitual de reenviar PDF con datos de vecinos por correo o mensajería, esto es una mejora objetiva del tratamiento de datos personales del grupo.

## 10. Estado y siguientes pasos

La versión mínima está construida y verificada contra decretos reales del Ayuntamiento: extrae correctamente expediente, importe, fecha, firmante y mandato, distingue los siete tipos de decreto, detecta quince motivos de reparo distintos y seis patrones de serie.

Queda por hacer, por orden:

1. Cargar la serie completa de decretos disponible y revisar a mano una muestra para medir la tasa real de acierto de la extracción.
2. Ajustar el catálogo de alertas con el criterio del grupo: quitar las que generen ruido, añadir las que falten.
3. Decidir si se despliega en una dirección web para el resto del grupo o se queda como herramienta de uso individual.
4. Solo después, y solo si el uso lo justifica, valorar la variante con capacidad de razonamiento descrita en el documento de arquitectura.

---

## Anexo: segunda ronda de validación

Después de cerrar la primera versión se amplió la muestra con decretos de tipos que todavía no se habían probado — pólizas de seguro, una pensión vitalicia, y el informe anual del Interventor al Pleno (art. 218) — buscando expresamente lo que se hubiera quedado sin cubrir. Apareció más de lo esperado:

- **Una propuesta con varios puntos numerados en un mismo "RESUELVO"** (tres pólizas de la misma aseguradora): el extractor solo leía el primero. Ahora lee todos, y de paso corrigió un error más serio — sin esta corrección, el importe "total" del decreto se calculaba mal, tomando el importe del primer punto como si fuera la suma de los tres.
- **Una pensión vitalicia que el propio Interventor identifica como fuera de la competencia municipal** (corresponde a la Seguridad Social), pagada desde un acuerdo de 1997. Es exactamente el tipo de hallazgo fundamentado que esta herramienta debe sacar a la luz: tiene norma, tiene pregunta, tiene propuesta. Nueva alerta (P06).
- **El informe anual de reparos del Interventor al Pleno** confirmó por escrito, con su propia numeración, media docena de irregularidades estructurales que ya venían apareciendo decreto a decreto: personal fuera de plantilla y RPT, contratación temporal por encima de lo que la ley considera excepcional, incumplimiento de la prelación de pagos. Se han añadido como alertas (P07, P08) porque ahora están confirmadas por la propia Intervención, no solo inferidas de casos sueltos.
- **Un tipo de documento que no es un decreto**: el informe agregado del art. 218 no aprueba nada, resume un periodo completo (aquí, dos años). Su fecha en el cuerpo del texto es el inicio de ese periodo, no la fecha del propio informe — si se tratara igual que un decreto, la atribución de mandato podría ser errónea. Ahora se reconoce como categoría aparte y se marca explícitamente para revisar a mano.
- **Una concejala sin identificar con certeza** (Ana Bella Camacho Rodríguez, quien eleva el informe del art. 218 al Pleno): las fuentes públicas encontradas la sitúan como concejala no adscrita hace más de una década; no hay forma de confirmar su adscripción en el expediente de 2025 sin preguntar. **No se ha añadido a la lista de cargos públicos por precaución** — queda pendiente de que confirmes quién es y en qué periodo, para no adjudicar una afiliación política sin verificar.

Estado tras esta ronda: **74 comprobaciones automáticas en verde**, contra once decretos reales de tres alcaldías, cinco formatos de propuesta de gasto y treinta y una alertas distintas.

---

*Las alertas no son conclusiones ni acusaciones. Son puntos que merecen una pregunta.*
