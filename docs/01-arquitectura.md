# Arquitectura — Opción 1 y Opción 3

*Especificación técnica. Documento de trabajo.*

---

## 0. El compromiso de fondo

Se piden tres cosas que no encajan de forma automática:

1. Web abierta y anónima, sin cuentas.
2. Que el contenido de los decretos no salga del equipo.
3. Que además de resumir, **aprenda** algo útil del decreto.

(1) y (2) son compatibles. (2) y (3) no lo son del todo: razonar sobre lenguaje natural exige un modelo, y un modelo vive en un servidor. Hay dos salidas honestas, y las dos están especificadas aquí.

| | **Opción 1 — Motor de reglas** | **Opción 3 — Anonimización local + análisis externo** |
|---|---|---|
| Procesamiento | 100 % en el navegador | Extracción y anonimización en el navegador; análisis del texto anonimizado en la API |
| Salida de datos | Ninguna | Solo texto con marcadores en lugar de datos personales |
| Capacidad | Detecta lo previsto de antemano | Razona; detecta lo no anticipado |
| Coste | Cero | Por documento procesado |
| Riesgo legal | Mínimo | Bajo pero real |
| Estado | **Construido** | Especificado, sin construir |

Recomendación: **desplegar la Opción 1, usarla una temporada completa, y solo después decidir si la Opción 3 aporta lo suficiente como para asumir su coste y su riesgo.**

---

## 1. Opción 1 — Motor de reglas

### 1.1 Principio

Nada sale del navegador. Ni una petición de red que contenga contenido del documento. La única red que se usa es la de descarga de la propia aplicación y de dos librerías de lectura de ficheros.

### 1.2 Canalización

```
Archivo (PDF/DOCX/TXT)
   │
   ├─▶ extract.js ─── pdf.js / mammoth ──▶ texto plano
   │                  reagrupación por posición vertical
   │                  limpieza de pies institucionales
   │
   ├─▶ redact.js ──── detección de datos personales
   │                  sustitución por marcadores
   │                  mapa reversible SOLO en memoria
   │                  puntuación de riesgo residual
   │
   ├─▶ parse.js ───── clasificación en 7 tipos
   │                  extracción de campos por tipo
   │                  fecha, firmante y ATRIBUCIÓN DE MANDATO
   │                  análisis del reparo y sus motivos
   │
   ├─▶ rules.js ───── 21 alertas de documento
   │                  6 alertas de patrón (necesitan registro)
   │                  marcado de doble filo
   │                  lectura de oposición
   │
   ├─▶ registry.js ── persistencia en IndexedDB
   │                  solo campos estructurados, nunca texto íntegro
   │
   └─▶ export.js ──── ficha técnica (neutra)     ─┐  documentos
                      lectura de oposición (editorial) ─┤  SIEMPRE
                      informe de patrones             ─┘  separados
```

### 1.3 Extracción de texto

**PDF.** `pdf.js` devuelve fragmentos sueltos con coordenadas. Concatenarlos en el orden en que llegan destroza las tablas de los decretos de pagos y despega cada importe de su proveedor. La solución implementada agrupa los fragmentos por posición vertical con una tolerancia de 3 puntos, los ordena por posición horizontal dentro de cada fila y reconstruye la línea.

**Detección de escaneado.** Si el total de caracteres extraídos es inferior a 120 por página, se asume que es un PDF sin capa de texto y se rechaza con un mensaje explícito. No se intenta OCR: añadiría megabytes de dependencias y un margen de error que en documentos con importes no es asumible.

**Limpieza.** Se eliminan pies institucionales, códigos de validación de la sede electrónica y numeraciones de página, que se repiten en cada página y contaminan la extracción.

### 1.4 Anonimización

**Identificadores directos**, por expresión regular: DNI, NIE, IBAN, matrícula de vehículo, referencia catastral, teléfono, correo electrónico.

**Nombres de personas**, por dos vías:

- *Con tratamiento* (`D.`, `Dª`, `DON`, `DOÑA`, `Sr.`, `Sra.`) seguido de dos a cinco palabras capitalizadas. Alta confianza.
- *Secuencias en mayúsculas* de dos a cinco palabras. Es el formato de las tablas de pagos. Confianza media.

Tres salvaguardas, todas necesarias y todas descubiertas probando con decretos reales:

1. **Lista de términos institucionales.** Sin ella se anonimiza medio documento: estos decretos gritan en mayúsculas.
2. **Reconocimiento de cargos públicos por conjunto de tokens.** Los listados escriben "COBO ORTIZ JUAN" y las firmas "Juan Cobo Ortiz". Si solo se compara la cadena completa, un recorte como "JUAN COBO" se escapa y se acaba anonimizando al alcalde en su propio decreto. Se compara si todos los tokens del candidato están contenidos en los de algún cargo conocido.
3. **Recorte por la derecha.** Las tablas encadenan nombre y concepto sin separador: `NAVARRO ISLA FILOMENA AYUDA SEGUNDO SEMESTRE ATENCION SOCIAL BASICA`. Una expresión voraz se traga el conjunto, ve "AYUDA", lo descarta como institucional y deja el nombre al descubierto. Se corta en el primer término institucional y se prueba desde el segmento más largo al más corto.

**Contexto sensible.** Nueve patrones marcan el documento como riesgo alto con independencia de cuántos nombres se detecten: atención social básica, urgencia social, intervención familiar, exclusión social, dependencia o discapacidad, personas menores, exhumaciones, violencia de género, expediente sancionador.

**Mapa reversible.** Cada dato sustituido guarda su equivalencia en memoria. Permite exportar sin datos personales y, en la Opción 3, rehidratar localmente la respuesta.

**Lo que no se puede prometer.** El filtro reduce el riesgo; no lo elimina. Falla con nombres poco frecuentes y no puede nada contra la reidentificación indirecta. La interfaz lo advierte de forma expresa.

### 1.5 Clasificación

Siete tipos, evaluados por peso descendente para que un decreto de nóminas con reparo embebido se clasifique como nóminas y registre el reparo como secundario, sin cambiar el formato de la ficha:

| Tipo | Señal | Peso |
|---|---|---|
| `nominas` | "nóminas" + "seguros sociales" / Tesorería General | 100 |
| `reparo` | art. 217 + "solventar" | 90 |
| `pagos` | "Procedimiento: Pagos" / art. 186.1 / "ordenar el pago" | 80 |
| `facturas` | "reconocimiento de obligación" / "aprobación de operaciones" | 70 |
| `junta_gobierno` | "convocatoria" + JGL + "orden del día" | 60 |
| `bonificacion` | "bonificación" + tributo | 50 |
| `multa` | "expediente sancionador" | 50 |
| `solicitud_info` | "solicitud de información" | 40 |
| `general` | ninguna de las anteriores | — |

### 1.6 Atribución temporal

**Es la pieza crítica del sistema**, no un adorno. Sin ella la herramienta señala indistintamente a cualquier gobierno, incluido el propio.

*Fecha.* Los decretos se firman "a fecha de firma electrónica" y casi nunca llevan fecha en el cuerpo. Se busca, por orden de fiabilidad: fecha contable de la primera operación de la tabla ("ADO 30/08/2023", presente en decretos de pagos y aprobación de gasto), sesión de la Junta de Gobierno Local, propuesta de resolución, fecha de iniciación del expediente, fecha citada en el documento (excluyendo las que aparecen dentro de un informe referenciado, como los informes de Secretaría de 2015 y 2018 que cita casi todo reparo y que si no se excluyen fechan el decreto una década antes de existir), y como último recurso el mes citado en el asunto (marcada como aproximada).

*Firmante.* Varios patrones que cubren encabezado y pie, en mayúsculas y en caja mixta, incluida la fórmula "EL CONCEJAL DELEGADO... Fdo." para decretos que no firma la Alcaldía sino un concejal con delegación (de Hacienda, en los ejemplos reales).

**Mandatos con más de una alcaldía.** La tabla de `config.js` no asume una alcaldía por mandato. Calibrando el extractor contra decretos de 2022 apareció uno firmado por "Manuel Alberto Gil Corral, Alcalde" dentro de lo que la primera versión de la herramienta tenía registrado como el mandato de Patricia Carrasco Flores. Verificado por prensa: Gil Corral fue alcalde desde 2019 y renunció el 19 de enero de 2023 tras dos legislaturas; Carrasco tomó posesión al día siguiente en un relevo interno del PSOE, no por moción de censura. De los casi cuatro años de ese mandato, Gil Corral firmó unos tres años y medio.

La estructura de datos refleja esto:

```js
{
  id: 'psoe-2019', desde: '2019-06-15', hasta: '2023-06-16',
  partido: 'PSOE', etiqueta: 'Mandato 2019–2023 (PSOE)',
  alcaldias: [
    { desde: '2019-06-15', hasta: '2023-01-19', nombre: 'Manuel Alberto Gil Corral' },
    { desde: '2023-01-20', hasta: '2023-06-16', nombre: 'Patricia Carrasco Flores' },
  ],
}
```

*Cruce.* La atribución se resuelve primero por alcaldía —quién firmaba ese día concreto— y el mandato se deriva de ahí, nunca al revés. Si la fecha cae dentro de un mandato pero no coincide con ningún subperíodo de alcaldía registrado, o el firmante no coincide con la alcaldía de esa fecha, se marca `confianza: 'revisar'` con nota explicativa (delegación, sustitución o error de fecha). Sin fecha, se atribuye por nombre de firmante con confianza media. Sin ninguna de las dos cosas, `confianza: 'nula'` y aviso de no usarlo en público sin comprobación manual.

Esto es reutilizable más allá de Santa Fe: cualquier ayuntamiento con pacto de rotación de alcaldía, moción de censura, o cambio de alcalde dentro del mismo mandato necesita esta estructura de subperíodos, no un campo de "alcaldía" a secas.

### 1.7 Extracción de la relación de facturas

Un importe total no dice nada por sí solo; lo que fiscaliza es saber quién cobra, cuánto, y si se repite. `js/lineas.js` descompone la tabla del decreto en líneas. Se han calibrado **cuatro formatos reales**, encontrados los cuatro en decretos distintos del Ayuntamiento — no son una previsión teórica, son lo que había:

| Formato | Cuándo aparece | Columnas | Ancla de extracción |
|---|---|---|---|
| **A** | Aprobación de gastos/operaciones | fase, fecha, ejercicio, aplicación (prog.econ), importe, tercero | La aplicación presupuestaria de 3-4+5 dígitos |
| **B** | Relación de facturas por tercero | importe €, CIF, nombre (en líneas contiguas) | El CIF, formato `[A-Z]\d{8}` |
| **C** | Factura única en la propuesta | dos redacciones distintas encontradas ("para el pago a NOMBRE (CIF)" y "a favor de CIF – NOMBRE") | Frase de la propuesta |
| **D** | Ordenación de pagos | nº de operación (9-14 dígitos), fase, importe, saldo — **sin** aplicación presupuestaria ni fecha en la fila | El nº de operación |

El formato D fue el que más costó encontrar: los decretos de "ordenación de pagos" (art. 186.1 TRLRHL) no llevan aplicación presupuestaria en la tabla —eso ya se fijó al aprobar el gasto— así que ni el formato A ni el B los reconocían. Sin él, esos decretos se quedaban sin una sola factura extraída, que es justo el tipo de decreto con las incidencias de tesorería mejor fundadas (T01-T05 del catálogo).

**Número monetario tolerante a errores de tecleo.** Un decreto real contiene "6292" como importe donde debería decir "6.292,00" — probablemente un error del funcionario al mecanografiar el original. Un patrón que exige grupos exactos de tres cifras tras el separador de miles corta ese número por la mitad. El patrón usado (`\d+(?:\.\d{3})*(?:,\d{2})?`) es deliberadamente más laxo: acepta tanto el formato correcto como el importe pegado sin separadores.

**Categorías de línea.** No todo lo que aparece en una tabla de pagos es una compra a un proveedor:

- `proveedor` — el caso por defecto: una empresa o autónomo que factura.
- `ayuda` — ayudas sociales, PIF, becas.
- `devolucion` — fianzas, devoluciones de ICIO, reintegros: dinero que vuelve a un vecino.
- `tributo` — remesas obligatorias a Hacienda o a la Seguridad Social (modelo 111, TGSS).
- `dieta` — asistencias a órganos, kilometraje, manutención de cargos y personal.

Solo `proveedor` entra en el recuento de proveedores recurrentes (F01-F04, Z01, Z04). Meter una devolución de fianza o una remesa de IRPF en ese recuento no solo sería ruido: sería activamente engañoso, porque ni una ni otra son relaciones contractuales que se puedan licitar.

**Terceros que son personas físicas.** Muchos proveedores del Ayuntamiento son autónomos ("GARCIA PEREZ GERARDO", "CAMACHO MARTINEZ JOSE"), no sociedades. `extraerLineas` los reconoce igual que a una razón social —secuencia en mayúsculas plausible como nombre— y `terceros()` extrae la lista de quienes facturan **antes** de anonimizar, para pasarla como lista de permitidos a `anonimizar()`. Sin este prescan, el propio filtro de datos personales borraría a la mitad de los proveedores reales del Ayuntamiento, que es exactamente lo que se necesita ver.

**Filtro de precisión: nombre de pila.** Las descripciones de factura van en mayúsculas ("PVC BLANCO ESPUMADO", "ALQUILER DE CONTADOR") y sin este filtro se anonimizaban como si fueran personas. Una lista de nombres de pila frecuentes actúa de bisagra: una secuencia en mayúsculas solo se trata como candidata a persona si contiene un nombre reconocible. Se desactiva expresamente en los contextos de máxima cautela (ayudas sociales, dependencia, menores, violencia de género, devolución de fianza) donde es preferible anonimizar de más a arriesgarse a dejar un dato sensible sin cubrir.

**Clasificación del decreto vs. contenido del decreto.** Una relación de facturas sustancial (≥3 líneas) indica que el decreto versa realmente sobre un lote de gasto, pero eso no debe borrar la distinción legal entre "ordenación de pagos" (art. 186, informe propio de prelación de Tesorería) y "aprobación de gasto" (arts. 214-215): son procedimientos distintos y los dos contienen, por definición, listas de líneas. La corrección aplicada solo actúa cuando el candidato ganador por texto es "reparo" —una circunstancia, no el objeto del decreto— o no hay candidato en absoluto; entre "facturas" y "pagos", cuando los dos son candidatos legítimos, gana el que de verdad coincide con el texto. La tabla de facturas se muestra en la interfaz siempre que existan líneas, con independencia de qué tipo se le haya asignado al decreto.

### 1.8 Alertas

21 de documento y 6 de patrón. Catálogo completo en `docs/02-catalogo-alertas.md`.

Cada alerta lleva cinco campos: **norma** en que se apoya, **pregunta** ya redactada para el pleno, **réplica** previsible del gobierno, **propuesta** alternativa en positivo, y **doble filo** si el mismo hecho se produce bajo mandatos anteriores.

Dos decisiones de diseño que importan:

- **Peso editorial separado de la severidad.** La severidad dice cuánto importa; el peso, qué encabeza la lectura. Sin esto, un umbral aritmético genérico lideraba el resumen por delante de un hallazgo estructural.
- **Ámbito por tipo.** El umbral del contrato menor solo se aplica a decretos de reparo y facturas. Aplicarlo a una nómina de 226.000 € producía una alerta absurda que restaba credibilidad a todas las demás.

### 1.9 Registro acumulado

IndexedDB, en el navegador. Se persiste la ficha estructurada: nunca el texto íntegro, nunca el mapa de anonimización, nunca nombres de particulares. Clave estable por número de decreto para evitar duplicados al resubir.

Habilita las seis alertas de patrón, que son las que de verdad aportan: proveedor recurrente, motivo repetido, reparo sistemático en nóminas, posible fraccionamiento, continuidad estructural entre mandatos y saltos en la numeración de la serie.

Copia de seguridad y restauración en JSON, para llevar el registro a otro equipo.

### 1.10 Salidas: consolidado, no por decreto

La ficha técnica sigue siendo la referencia neutra de cada decreto —se ve en pantalla por pestañas, y se puede descargar suelta si hace falta comprobar un dato concreto—, pero **los hallazgos ya no se exportan uno por decreto**. La primera versión generaba un archivo de "lectura de oposición" por cada decreto subido; con una remesa de treinta decretos eso son treinta documentos que hay que abrir uno a uno, que es exactamente el problema que la herramienta debía resolver.

En su lugar, `informeConsolidadoMarkdown()` genera un único documento con todos los hallazgos de todos los decretos del **registro completo** —no solo los de la sesión actual—, ordenados por severidad. Cada hallazgo lleva siempre el número de decreto (o expediente, si no hay número) entre corchetes por delante: es la referencia para volver a un decreto concreto sin tener que releer la remesa entera. Los patrones de serie (proveedor recurrente, motivo repetido) encabezan el informe, porque son más importantes que cualquier hallazgo suelto.

Como el registro solo guarda datos estructurados y no el texto íntegro (§1.9), las alertas se recalculan en el momento a partir de esos datos —`evaluarDecreto(fichaAlmacenada)`— cada vez que se pide el informe. Eso significa que el informe consolidado no depende de la sesión del navegador: subir tres decretos hoy y cinco la semana que viene da un único informe con los ocho la próxima vez que se pida, no documentos sueltos por sesión.

La ficha técnica, en cambio, sí se mantiene separada del criterio editorial: sigue siendo neutra, sin interpretación, y es lo que se puede enseñar a cualquiera sin que lleve encima ningún juicio de valor.

### 1.11 Despliegue

Sitio estático. Sin construcción, sin dependencias de servidor.

- **GitHub Pages** — recomendado. Empujar el repositorio, activar Pages, repartir la dirección. Cero fricción para el resto del grupo y el procesamiento sigue siendo íntegramente local.
- **Local** — `python3 -m http.server` en la carpeta. Los módulos ES no funcionan abriendo el archivo directamente por `file://`.

### 1.12 Portar a otro ayuntamiento

Solo hay que tocar `js/config.js`: municipio, tabla de mandatos, lista de cargos públicos, cifras del presupuesto. Los patrones de extracción están calibrados sobre esPublico Gestiona, el gestor de expedientes más extendido en municipios pequeños y medianos. Otros gestores usan encabezados distintos y exigirían revisar las expresiones regulares de `parse.js`, no el resto del sistema.

---

## 2. Opción 3 — Anonimización local + análisis externo

### 2.1 Qué añade

Razonamiento real. La Opción 1 detecta lo que se le ha enseñado; la Opción 3 detecta lo que no se anticipó. En un decreto atípico —una modificación de crédito, un convenio, una encomienda de gestión— el motor de reglas devuelve poco más que la ficha; un modelo devuelve una lectura.

### 2.2 Canalización

Idéntica a la Opción 1 hasta el paso de anonimización. A partir de ahí:

```
redact.js ──▶ textoAnonimo  ──[red]──▶  API
                mapa (se queda aquí)         │
                                             ▼
                                    ficha + lectura, con marcadores
                                             │
              rehidratar(respuesta, mapa) ◀──┘
                                             │
                                             ▼
                              resultado con datos reales, solo en pantalla
```

**Lo que sale del equipo:** importes, conceptos, aplicaciones presupuestarias, artículos citados, razones sociales, motivos del reparo. Nada de esto identifica a una persona física por sí solo en la inmensa mayoría de los casos.

**Lo que no sale:** nombres de particulares, DNI, IBAN, matrículas, referencias catastrales, direcciones.

### 2.3 Bloqueo por riesgo alto

Si `redact.js` marca el documento como riesgo alto —contexto de servicios sociales, dependencia, menores, violencia de género—, **no se envía nada** sin confirmación explícita del usuario, con la lista de contextos detectados a la vista. La opción por defecto es no enviar y procesar solo con el motor de reglas.

### 2.4 Quién paga

Con una web anónima y sin cuentas, alguien tiene que pagar cada llamada. Si lo asume quien despliega, la factura crece con el uso y no hay forma de acotarla.

Solución: **cada persona introduce su propia clave de API**, que se guarda únicamente en su navegador y no viaja a ningún servidor propio. Coste asumido por quien usa la herramienta, sostenibilidad garantizada, y una garantía adicional de privacidad — quien despliega no ve ni las claves ni el tráfico.

### 2.5 Diseño de la petición

- Sistema: instrucciones de neutralidad estricta para la ficha, criterio editorial separado para la lectura, prohibición de inventar datos ausentes.
- Usuario: texto anonimizado + ficha ya extraída por el motor de reglas + alertas ya detectadas.
- Respuesta en JSON estricto, sin preámbulo ni marcas de código, validada antes de pintar.

El motor de reglas **no se sustituye, se conserva**: el modelo recibe su trabajo hecho y lo amplía. Así los campos duros —importes, expedientes, aplicaciones— siguen saliendo de una extracción determinista y verificable, y el modelo solo aporta donde aporta.

### 2.6 Riesgos que hay que asumir

- Un filtro por reglas nunca es perfecto. Si falla, el dato sale.
- La reidentificación indirecta sobrevive a la anonimización.
- Dependencia de un tercero: disponibilidad, cambios de interfaz, cambios de precio.
- Coste variable no acotado si se centraliza el pago.
- Complejidad de mantenimiento sensiblemente superior.

### 2.7 Condiciones para construirla

No antes de que se cumplan las tres:

1. La Opción 1 lleva al menos un trimestre en uso real.
2. Se ha identificado, con casos concretos, qué se está perdiendo por no tener razonamiento.
3. Se ha medido la tasa de fallo del filtro de datos personales sobre una muestra revisada a mano.

Sin esas tres, construir la Opción 3 es añadir riesgo y coste para resolver un problema que todavía no se ha demostrado que exista.

---

## 3. Protección de datos

**Opción 1.** No hay tratamiento por parte de terceros: el procesamiento es local y el registro vive en el equipo del usuario. El decreto original sigue siendo un documento entregado al grupo municipal en el ejercicio de sus funciones de control, con la base jurídica que eso conlleva. La herramienta reduce el riesgo respecto de la práctica habitual de reenviar PDF completos por correo o mensajería.

**Opción 3.** Se introduce un encargado del tratamiento. Exige, como mínimo: informar al usuario de qué se envía, bloquear por defecto los documentos de riesgo alto, elegir proveedor con garantías de no retención, y dejar constancia escrita de la decisión.

**En ambos casos.** El deber de sigilo del cargo electo sobre los datos a los que accede por razón de su cargo no lo levanta ninguna herramienta. Lo que se publica o se comparte es responsabilidad de quien lo hace.
