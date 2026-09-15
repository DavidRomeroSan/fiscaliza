# Prompt de continuación para Claude Code

*Pega el bloque de "Contexto" en Claude Code, dentro de la carpeta del repositorio, para seguir trabajando sobre la base ya construida.*

---

## Contexto para pegar

```
Trabajo sobre "Fiscaliza", una herramienta web para resumir decretos municipales
españoles y señalar qué merece una pregunta desde la oposición. Está construida,
verificada (74 comprobaciones automáticas en verde) y funcionando. Antes de tocar
nada, lee docs/00-proyecto.md, docs/01-arquitectura.md y docs/02-catalogo-alertas.md.

Restricciones que no se negocian:

1. TODO el procesamiento ocurre en el navegador. Ninguna petición de red puede
   contener contenido de un decreto. No introduzcas backend, telemetría, analítica
   ni CDN que reciba datos.

2. Los HALLAZGOS (alertas, criterio editorial) ya NO se exportan uno por decreto.
   Se piden de golpe con "Informe consolidado" (js/export.js →
   informeConsolidadoMarkdown), que recorre el REGISTRO COMPLETO —no solo la
   sesión actual— y etiqueta cada hallazgo con su número de decreto entre
   corchetes. Si tocas la exportación, no vuelvas a un archivo por decreto: es
   justo el problema que este diseño resuelve. La FICHA TÉCNICA sí sigue siendo
   por decreto y neutra — esa separación (dato vs. criterio editorial) no se toca.

3. La atribución de mandato (js/config.js → MANDATOS) es crítica, y un mandato
   puede tener VARIAS alcaldías (verificado: en el mandato 2019-2023 de Santa Fe
   hubo un relevo interno de alcaldía a mitad de mandato — Gil Corral hasta
   19/01/2023, Carrasco Flores desde el día siguiente). No asumas una alcaldía
   por mandato al añadir datos de otro municipio: compruébalo con una fuente
   verificable (prensa local, boletín oficial), nunca lo des por sentado a
   partir de lo que insinúe un solo decreto. Un error de atribución aquí no es
   cosmético: invalida el propósito del mecanismo de doble filo.

4. Toda alerta que pueda activarse con decretos de gobiernos anteriores va
   marcada dobleFilo: true. Si añades una alerta, decide esto conscientemente
   antes de darla por terminada.

5. Ninguna alerta entra sin base normativa citable (js/rules.js → campo `norma`)
   y sin propuesta alternativa (`propuesta`). Si no hay norma detrás, es una
   opinión, no una alerta.

6. Los cargos públicos NO se anonimizan; los particulares SÍ. La lógica está en
   js/redact.js → esCargoPublico(), que compara por conjunto de tokens porque los
   listados de pagos escriben "COBO ORTIZ JUAN" y las firmas "Juan Cobo Ortiz".
   Antes de añadir a alguien a CARGOS_PUBLICOS (config.js), confirma su cargo y
   periodo con una fuente verificable — no lo añadas por aparecer una vez
   firmando algo. Si no puedes confirmarlo, déjalo fuera: el efecto por defecto
   es anonimizar, que es el lado seguro.

7. Los proveedores (autónomos incluidos) NO se anonimizan; ayudas sociales,
   devoluciones/fianzas, remesas tributarias y dietas/pensiones SÍ. La lista de
   categorías está en js/lineas.js → clasificarLinea(). Si aparece un concepto
   nuevo que no encaje en ninguna, para a pensar en qué categoría entra antes
   de dejarlo caer por defecto en "proveedor" — la diferencia es la que separa
   una compra pública de un dato personal de un vecino.

Antes de dar por buena cualquier modificación, ejecuta:
   node pruebas/probar.js
Deben pasar las 74 comprobaciones. Si tocas la extracción (parse.js, lineas.js,
redact.js), añade el caso nuevo a pruebas/corpus.js con su bloque `esperado` —
a poder ser con texto de un decreto real, no inventado: casi todos los fallos
reales hasta ahora aparecieron probando contra decretos reales, no imaginando
casos.
```

---

## Cómo empezar a validar, en orden

**1. Arranca la herramienta.**
```bash
python3 -m http.server 8000
# abre http://localhost:8000 — no funciona con file:// directo (módulos ES)
```

**2. Confirma que el motor sigue sano antes de tocar nada.**
```bash
node pruebas/probar.js
```
Si algo falla nada más clonar el repo, algo se ha corrompido en el traslado — no sigas hasta que pase.

**3. Carga una tanda real de decretos.**
Diez o veinte, variados si puedes: alguno de facturas, alguno de nóminas, alguno de pagos. Súbelos a la web. Revisa las tarjetas por encima — no hace falta leer cada ficha con lupa todavía.

**4. Pulsa "Informe consolidado" y lee el documento entero, no solo el principio.**
Esto es lo que de verdad hay que validar: ¿el número de decreto de cada hallazgo es el correcto? ¿los importes cuadran con lo que dice el PDF original? ¿algún proveedor aparece anonimizado por error, o algún particular aparece sin anonimizar?

**5. Anota cada discrepancia con el decreto exacto donde ocurrió.**
"El importe de tal alerta no coincide" no es accionable; "en el decreto 2023-1327, la línea de FCC S.L. suma 4.200 € pero el PDF dice 4.450 €" sí lo es. Con eso, pídele a Claude Code que lo añada como caso a `pruebas/corpus.js` y lo corrija.

**6. Solo cuando la tasa de acierto sea la que necesitas, pasa a las tareas pendientes de abajo.**

---

## Tareas pendientes, por orden

**1. Validar contra la serie completa. [la más importante, sigue sin hacerse a escala]**
Todo lo de la sección anterior. 11 decretos calibran el motor; no lo validan. Hazlo con al menos 30-40 antes de confiar en las cifras para algo público.

**2. Confirmar la adscripción de Ana Bella Camacho Rodríguez.**
Aparece elevando un informe del Interventor al Pleno (expediente 3232/2025). Las fuentes públicas encontradas la sitúan como concejala no adscrita hace más de una década; no hay confirmación de su rol actual. No se ha añadido a CARGOS_PUBLICOS por esto. Si David confirma cargo y periodo, añadirla en config.js; si no, dejarla como está (anonimizada por defecto).

**3. Falsos positivos del filtro de datos personales, a escala.**
Con la serie completa cargada, revisar qué se anonimiza que no debería (proveedores tomados por personas, instituciones sin nombre de pila) y qué se escapa (nombres poco frecuentes, identificación indirecta). Ajustar `NO_PERSONAS` y `NOMBRES_PILA` en `js/redact.js`.

**4. Exportación a DOCX.**
Ahora se exporta Markdown. Añadir DOCX con la librería `docx` desde CDN para la ficha técnica y el informe consolidado, manteniendo la separación entre ambos.

**5. Vista de serie temporal en la interfaz.**
Una tabla del registro filtrable por tipo, mandato, proveedor y motivo de reparo, para no depender solo del informe descargado a la hora de explorar.

**6. Cruce con el programa electoral.**
Detectar cuándo un decreto afecta a un compromiso incumplido del programa del gobierno. Requiere una tabla de compromisos con palabras clave en `config.js`. Alto valor, esfuerzo medio.

**7. El tipo `informe_218` está detectado pero no explotado.**
El informe anual de reparos del Interventor al Pleno se reconoce y no rompe nada, pero solo se lee su fecha y firmante — no se extraen sus propios hallazgos (la lista numerada de irregularidades que trae). Si aparecen más de estos informes en la serie real, vale la pena parsear esa lista tal como se hizo a mano para P06-P08.

---

## Lo que NO hay que hacer

- **No construir la Opción 3** (envío a la API) hasta cumplir las tres condiciones de `docs/01-arquitectura.md` §2.7 — un trimestre de uso real de la Opción 1, casos concretos de qué se pierde sin razonamiento, y la tasa de fallo del filtro medida a mano.
- **No añadir framework.** Es JavaScript con módulos ES y sin construcción, a propósito: tiene que poder desplegarse en GitHub Pages y abrirse dentro de cinco años sin que nada se haya podrido.
- **No volver a un documento por decreto.** El informe consolidado existe precisamente porque un documento por decreto no se usaba. Si una tarea nueva parece pedirlo, es que está mal planteada.
- **No suavizar los avisos.** Los mensajes sobre riesgo de datos y doble filo están redactados en tono seco deliberadamente. Un aviso amable no se lee.
- **No añadir alertas sin norma**, ni cargos públicos ni motivos de reparo sin poder citar de dónde salen. Si no hay fuente, no entra.
