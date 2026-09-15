# Fiscaliza

Resume decretos municipales y señala qué merece una pregunta. Todo el procesamiento ocurre en el navegador: ningún documento sale del equipo.

Herramienta de trabajo interno del Grupo Municipal Socialista de Santa Fe (Granada).

---

## Arrancar

**En local**

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

Los módulos ES no funcionan abriendo `index.html` directamente por `file://`.

**Publicar para el grupo**

Empujar el repositorio a GitHub y activar Pages sobre la rama principal. El procesamiento sigue siendo íntegramente local: lo único que viaja por la red es la propia aplicación.

**Probar el motor**

```bash
node pruebas/probar.js
```

Verifica extracción, anonimización, atribución de mandato (incluidos subperíodos de alcaldía) y alertas contra 11 decretos reales del Ayuntamiento, en 5 formatos de propuesta de gasto. 74 comprobaciones en verde.

---

## Adaptar a otro ayuntamiento

Solo `js/config.js`:

- `MUNICIPIO` — nombre y pie institucional
- `MANDATOS` — periodos, partido y **alcaldías** (un mandato puede tener varias: verificado con un caso real de relevo interno de alcaldía dentro del mismo mandato en Santa Fe). **Imprescindible**: sin esto, las alertas señalan indistintamente a cualquier gobierno, incluido el propio
- `CARGOS_PUBLICOS` — no se anonimizan; el resto de personas sí
- `PRESUPUESTO` — para dimensionar importes con cifras reales

Los patrones de extracción están calibrados sobre esPublico Gestiona.

---

## Estructura

```
index.html              interfaz
css/app.css             estilos
js/config.js            ← lo único que se toca para otro municipio
js/extract.js           PDF/DOCX → texto (local)
js/redact.js            anonimización local con mapa reversible
js/lineas.js             extracción de la relación de facturas (4 formatos)
js/parse.js             clasificación, campos y atribución de mandato
js/rules.js             38 alertas con norma, pregunta, réplica y propuesta
js/registry.js          registro acumulado en IndexedDB
js/export.js            ficha por decreto + informe consolidado de todo el registro
js/app.js               orquestación e interfaz
pruebas/                corpus real y batería de comprobaciones
docs/                   proyecto, arquitectura, catálogo, protocolo
```

---

## Documentación

| | |
|---|---|
| `docs/00-proyecto.md` | Qué es, por qué, qué no hace |
| `docs/01-arquitectura.md` | Especificación técnica, Opción 1 y Opción 3 |
| `docs/02-catalogo-alertas.md` | Las 38 alertas y su base normativa |
| `docs/03-protocolo-uso.md` | Una página para el resto del grupo |
| `docs/04-prompt-claude-code.md` | Para seguir desarrollando |

---

Las alertas no son conclusiones ni acusaciones. Son puntos que merecen una pregunta.
