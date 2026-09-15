# Catálogo de alertas

*41 alertas: 35 de documento y 6 de patrón. Derivadas de los motivos que el propio Interventor formula en los decretos reales del Ayuntamiento de Santa Fe.*

**Cómo leer este catálogo.** Una alerta no afirma que exista una irregularidad. Señala un punto que merece una pregunta. La columna *doble filo* marca las que se activan también con decretos de mandatos anteriores: esas exigen comprobar la serie completa antes de usarse en público.

---

## Contratación

| ID | Alerta | Sev. | Doble filo |
|---|---|---|---|
| C01 | Prestación recurrente tramitada como contrato menor | Alta | Sí |
| C02 | Gasto tramitado sin procedimiento de licitación | Alta | Sí |
| C03 | Falta el informe justificativo del contrato | Media | — |
| C04 | Se incumplen las instrucciones internas del propio Ayuntamiento | Media | — |
| C05 | Advertencia reiterada desde hace años sin corregir | Alta | — |
| C06 | Importe cercano o superior al umbral del contrato menor | Alta | — |

**C01** — *Art. 118.1 y 29.8 LCSP.* El Interventor señala que la prestación tiene carácter periódico o recurrente, lo que impide calificarla como contrato menor.
· Pregunta: ¿Qué calendario de licitación hay previsto para este servicio, y por qué no se ha licitado hasta ahora?
· Réplica previsible: gasto básico y necesario; el servicio venía sin licitar de la corporación anterior.
· Propuesta: plan de licitación con fechas para todos los servicios que Intervención señala como recurrentes, aprobado en pleno y con seguimiento trimestral.

**C05** — *Informes de Secretaría de 16/07/2015 y 23/04/2018.* La alerta con más recorrido de todo el catálogo: el propio reparo remite a informes internos que ya advertían de lo mismo hace una década. Es un problema identificado por escrito y no corregido.
· Pregunta: ¿Cuántos años más va a seguir el Ayuntamiento reproduciendo un problema que su propia Secretaría identificó por escrito?

**C06** — Solo se aplica a decretos de tipo *reparo* y *facturas*. Aplicar el umbral del contrato menor a una nómina de 226.000 € produce una alerta absurda que resta credibilidad a todas las demás.

---

## Personal

| ID | Alerta | Sev. | Doble filo |
|---|---|---|---|
| P01 | Nómina aprobada con reparo de Intervención | Alta | **Sí** |
| P02 | Irregularidades en complementos personales | Alta | **Sí** |
| P03 | Contrataciones sin respetar los límites de la LPGE | Alta | **Sí** |
| P04 | Gasto de personal en servicios no competenciales | Media | **Sí** |
| P05 | La defensa se apoya en una RPT "en elaboración" | Media | — |
| P06 | Pago de una pensión que no es competencia municipal | Alta | — |
| P07 | Personal contratado fuera de plantilla y RPT | Alta | — |
| P08 | Volumen de contratación temporal incompatible con el carácter "excepcional" | Media | — |
| P09 | Irregularidades en la asignación de trabajo del personal | Alta | **Sí** |
| P10 | Contratos laborales que pueden perjudicar a las arcas municipales | Alta | **Sí** |
| P11 | Personal en un grupo de programa distinto del presupuestado | Media | — |

**Las seis primeras y P09-P10 son doble filo sin excepción.** El texto del reparo de nóminas es idéntico bajo la alcaldía del PSOE y la del PP: los mismos cinco puntos, la misma defensa. Usar cualquiera de ellas sin desglosar por mandato es una invitación a que te la devuelvan.

**P09 y P10** — Los dos motivos que dieron origen a este catálogo (docs/00-proyecto.md los cita como el ejemplo fundacional) se detectaban desde el principio en `parse.js` pero nunca tuvieron alerta propia en `rules.js`: un decreto suelto con cualquiera de las dos irregularidades no generaba ningún hallazgo visible, ni en la ficha ni en el informe consolidado — solo asomaban de rebote si se repetían tres veces (Z02). Encontrado revisando a mano el informe consolidado de una serie real contra los PDF originales.

**P05** — La defensa de la RPT en elaboración aparece en decretos de 2023. Comprobar si esa RPT llegó a aprobarse convierte una excusa repetida en una pregunta con fecha.

**P06** — *RDL 8/2015 (Ley General de la Seguridad Social).* Encontrada en un decreto real: una pensión vitalicia por importe mensual variable, concedida por acuerdo de 1997, que el propio Interventor señala que corresponde a la Seguridad Social y no al Ayuntamiento. No es una hipótesis — está en el informe anual de reparos del Interventor al Pleno como irregularidad nº 7 de una lista de ocho.
· Pregunta: ¿cuántas pensiones de este tipo sigue pagando el Ayuntamiento y qué gestiones hay para transferirlas?

**P07 y P08** — Nacen directamente del informe anual del art. 218: personal cuya relación contractual podría considerarse indefinida sin estar prevista en plantilla, y un volumen de altas temporales (163 en un año, sobre una plantilla de 152) que la propia Intervención señala como incompatible con el carácter excepcional que exige la ley de presupuestos. Al estar confirmadas por escrito por la Intervención, no solo inferidas de decretos sueltos, se tratan con severidad alta y media respectivamente.

---

## Tesorería

| ID | Alerta | Sev. |
|---|---|---|
| T01 | Incumplimiento de la prelación legal de pagos | Alta |
| T02 | No se ha aprobado el plan de disposición de fondos | Alta |
| T03 | No se ha aprobado el plan de tesorería | Alta |
| T04 | Periodo medio de pago incumplido o sin publicar | Alta |
| T05 | Se están devengando intereses de demora | Alta |
| T07 | Sentencias firmes con importes pendientes de contabilizar | Alta |

**El bloque más limpio del catálogo.** Ninguna es doble filo, todas se apoyan en informes expresos del Tesorero y del Interventor incorporados al propio decreto, y todas tienen una propuesta alternativa evidente: aprobar lo que la ley exige aprobar.

**T01** — *Art. 187 TRLRHL y art. 14 LO 2/2012.* Intervención y Tesorería informan desfavorablemente: existen obligaciones de ejercicios cerrados anteriores a las que se propone pagar.
· Propuesta: aprobar el plan de disposición de fondos, que es exactamente lo que fija ese criterio de forma objetiva.

**T05** — *Art. 198.4 LCSP.* El retraso genera intereses de demora: sobrecoste directo y cuantificable.
· Propuesta: incluir en la liquidación anual una partida explícita de intereses de demora pagados, para que el coste del retraso sea visible.

**T07** — Detecta las sentencias firmes citadas en el decreto y suma sus importes. En un solo decreto de pagos aparecen tres sentencias con más de 600.000 € en costas pendientes de contabilización.
· Pregunta: ¿Están estas cantidades reflejadas en la contabilidad municipal y dotadas presupuestariamente?

*Nota técnica:* estos importes se excluyen expresamente del cálculo del importe principal del decreto. Presentar una condena judicial citada como antecedente como si fuera el gasto aprobado sería un error grave.

---

## Relación de facturas

| ID | Alerta | Sev. |
|---|---|---|
| F01 | Concentración del gasto en un solo proveedor | Alta |
| F02 | Suministro continuado troceado en facturas pequeñas | Alta |
| F03 | Proveedor con varias facturas en el mismo decreto | Media |
| F04 | La lectura automática no cuadra con el total declarado | Media |

Estas cuatro nacen de un encargo distinto de las anteriores: no fiscalizar el reparo que acompaña al decreto, sino leer bien la propia relación de facturas — quién cobra, cuánto, y si se repite. Se apoyan en un extractor de líneas (`js/lineas.js`) que descompone la tabla del decreto en filas: importe, tercero, concepto y aplicación presupuestaria, con cuatro formatos reales calibrados contra decretos del Ayuntamiento (ver `docs/01-arquitectura.md` §1.7).

**F01** — Un único proveedor concentra la mitad o más del importe del decreto. Incluye el caso límite de un decreto *entero* dedicado a un solo proveedor (p. ej. 26 facturas de la eléctrica en una sola remesa): eso no es una excepción a descartar, es la señal más clara de las cuatro.
· Pregunta: ¿existe contrato formalizado con este proveedor o se le viene abonando factura a factura?

**F02** — Cinco o más facturas del mismo tercero en un único decreto, sin exigir que superen el umbral legal por separado. Calibrada exactamente contra el caso de 26 facturas de una eléctrica de menos de 1.000 € cada una: ninguna llega al umbral del contrato menor, pero la repetición es lo que la Ley 9/2017 (art. 118.1 y 118.2) quiere impedir. Es la alerta con más peso editorial del catálogo: encabeza la lectura de oposición cuando aparece.
· Pregunta: ¿por qué un suministro continuado se tramita como una sucesión de facturas menores en lugar de licitarse?

**F03** — Entre tres y cuatro facturas del mismo proveedor, por debajo del umbral. Menos contundente que F02, pero indica que conviene empezar a llevar la cuenta.

**F04** — La suma de las líneas leídas no coincide con el total que declara el decreto: la lectura automática ha perdido facturas (columnas mal alineadas, tabla partida entre páginas). No es una alerta sobre el Ayuntamiento, es una advertencia sobre la propia herramienta: **no uses las cifras de ese decreto sin comprobar la relación completa en el original.**

**Categorías que quedan fuera del recuento de proveedores.** No todo lo que aparece en una relación de pagos es una compra a un proveedor, y contarlo como tal falsearía las alertas F01-F03:

- **Ayuda** — ayudas sociales, PIF, becas, prestaciones a personas concretas.
- **Devolución** — fianzas, devoluciones de ICIO, reintegros por desistimiento: dinero que vuelve a un vecino, no una compra del Ayuntamiento.
- **Tributo** — remesas obligatorias a Hacienda (modelo 111 de IRPF) o a la Tesorería General de la Seguridad Social: pagos automáticos por imperativo legal, no proveedores que se puedan licitar.
- **Dieta** — asistencias a órganos colegiados, kilometraje, manutención de cargos y personal.

Estas cuatro categorías se anonimizan si llevan nombre de un particular (salvo que la persona sea, además, un cargo público reconocido). Un proveedor, en cambio, nunca se anonimiza: quién cobra del erario es información pública de contratación.

## Presupuesto

| ID | Alerta | Sev. | Doble filo |
|---|---|---|---|
| B01 | Gasto imputado a un presupuesto prorrogado | Alta | Sí |
| B02 | Importe significativo en términos del presupuesto municipal | Informativa | — |
| B03 | Imputación a nivel de vinculación jurídica | Media | — |

**B01** — Los decretos citan "Presupuesto de 2023 prorrogado de 2021". Doble filo: la prórroga atraviesa el cambio de gobierno.

**B02** — No es un hallazgo, es contexto. Sitúa el importe como porcentaje del presupuesto de gastos para que la cifra signifique algo.

**B03** — La imputación a nivel de vinculación suele indicar que la aplicación prevista carecía de crédito suficiente.

---

## Transparencia y documentación

| ID | Alerta | Sev. |
|---|---|---|
| X01 | Reparo que debe darse cuenta al Pleno | Alta |
| X02 | Reparo que debe remitirse al Tribunal de Cuentas | Alta |
| X03 | Fiscalización desfavorable | Alta |
| X04 | Decreto sin fecha determinable | Informativa |
| X05 | El equipo de gobierno alega herencia recibida | Informativa |

**X01 y X02** — *Art. 218 TRLRHL.* Los propios reparos dicen que deben darse cuenta al Pleno y remitirse al Tribunal de Cuentas. Verificar si eso ocurrió es una línea de fiscalización entera, y de procedimiento, no de fondo: no admite la réplica de la herencia recibida.

**X05** — No es una alerta contra el gobierno, es una alerta **para ti**: el decreto ya contiene la réplica que vas a recibir. Tenerla anticipada vale más que la crítica.

---

## Patrón (requieren registro acumulado)

| ID | Alerta | Sev. | Umbral |
|---|---|---|---|
| Z01 | Proveedor recurrente con reparos | Alta | ≥3 decretos |
| Z02 | Mismo motivo de reparo repetido en el tiempo | Alta | ≥3 apariciones |
| Z03 | Reparo sistemático en nóminas mes a mes | Alta | ≥3 nóminas |
| Z04 | Posible fraccionamiento de contrato | Alta | ≥2 pagos y >15.000 €/año |
| Z05 | Continuidad estructural entre mandatos | Alta | ≥2 mandatos |
| Z06 | Saltos en la numeración de decretos | Media | ≥5 decretos del año |

**Aquí está el valor real de la herramienta.** Un contrato menor es un trámite; el mismo contrato menor doce meses seguidos es otra cosa.

**Z03** desglosa siempre por mandato y avisa cuando el patrón cruza gobiernos.

**Z04** es un indicio, no una conclusión: hay que comprobar que los pagos corresponden efectivamente al mismo objeto contractual antes de hablar de fraccionamiento.

**Z05 no es un arma, es un extintor.** Cuando un motivo aparece bajo gobiernos de distinto color, la herramienta lo dice y añade: *no uses esto como ataque*. La propuesta que acompaña es plantearlo como problema estructural del Ayuntamiento con solución encima de la mesa, lo que sitúa a quien lo plantea por encima del reproche partidista.

**Z06** puede deberse simplemente a que no se han subido todos los decretos. La alerta lo advierte. Si la serie está completa, es una pregunta legítima de acceso a la información.

---

## Cómo ajustar el catálogo

En `js/rules.js`. Cada regla es un objeto con `test`, `detalle`, `norma`, `pregunta`, `replica`, `propuesta` y `dobleFilo`. Añadir una alerta es añadir un objeto al array `REGLAS`; quitarla, borrarlo.

El orden de aparición en la lectura lo gobierna el mapa `PESO`, independiente de la severidad: la severidad dice cuánto importa, el peso dice qué va primero.

**Criterio para añadir una alerta nueva:** que se apoye en un precepto concreto o en un informe interno citable, y que tenga una propuesta alternativa. Si no hay norma detrás o no hay propuesta delante, no es una alerta: es una opinión, y las opiniones no van en esta herramienta.
