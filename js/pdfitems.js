/**
 * pdfitems.js — Del texto suelto de pdf.js a líneas y a filas de tabla.
 *
 * Módulo puro (sin pdf.js ni DOM): recibe los `items` de getTextContent() y
 * lo usan tanto el navegador (extract.js) como la validación en Node.
 */

/**
 * Reconstruye líneas a partir de los items de texto de pdf.js.
 * pdf.js devuelve fragmentos sueltos con coordenadas; sin reagrupar por
 * posición vertical, las tablas de los decretos de pagos se convierten en
 * papilla y los importes se despegan de su proveedor.
 */
export function itemsALineas(items) {
  const filas = new Map();
  for (const it of items) {
    if (!it.str || !it.str.trim()) continue;
    const y = Math.round(it.transform[5]);          // posición vertical
    const clave = Math.round(y / 3) * 3;            // tolerancia de 3pt
    if (!filas.has(clave)) filas.set(clave, []);
    filas.get(clave).push({ x: it.transform[4], s: it.str });
  }
  return [...filas.entries()]
    .sort((a, b) => b[0] - a[0])                    // de arriba a abajo
    .map(([, frags]) =>
      frags.sort((a, b) => a.x - b.x).map(f => f.s).join(' ').replace(/\s+/g, ' ').trim()
    )
    .filter(Boolean);
}

/**
 * Relación adjunta de un decreto de alcaldía que aprueba un gasto, con la
 * cabecera "Fecha | Aplicación | Importe | Tercero | Nombre Ter. | Texto Libre".
 *
 * En esa tabla cada celda se parte en varias líneas ("GALVEZ / CORTES /
 * MARCOS", la fecha "03/09/202" + "6") y, según el decreto, las celdas quedan
 * alineadas arriba, abajo o centradas dentro de la fila. Leída por líneas
 * (itemsALineas) sale mezclada; por posición horizontal, no: cada fragmento
 * pertenece a la columna en cuya x cae.
 *
 * Cada fila se ancla en su NIF/CIF (una sola vez por fila) y los demás
 * fragmentos se reparten según la alineación que muestre la tabla.
 *
 * @param {Array<{str:string, transform:number[]}>} items de una página
 * @returns {string[]} una línea por fila: "Relación adjunta (fila): fecha | aplicación | importe | tercero | nombre | texto"
 */
/**
 * Colapsa un fragmento de pdf.js con las letras o dígitos separados por
 * espacios ("A T H I S A", "2 0 2 6"): algunas tablas justifican el texto
 * corto de una columna estrecha estirando el espaciado entre caracteres, y
 * pdf.js lo entrega tal cual, como un único fragmento con esos espacios
 * dentro. Solo une series de tres o más caracteres sueltos seguidos —una
 * palabra normal, o una sigla corta de dos letras ("S.A", "SL"), no se toca.
 */
export function desespaciar(s) {
  return s
    .replace(/(?:^|(?<=\s))(?:[\p{L}\d](?:[ ][\p{L}\d]){2,})(?=\s|$)/gu, (m) => m.replace(/ /g, ''))
    // Un importe corto ("1.001,21") también se justifica así, pero los dos
    // decimales finales quedan pegados en un único fragmento de 2 caracteres
    // ("21"), que la regla de arriba no toca (solo une fragmentos de 1).
    .replace(/(\d,) (\d{2})\b/g, '$1$2');
}

const PIE_ROTADO = /^(?:N[uú]mero:|DECRETO$|Fecha:\s*\d|C[óo]d\. Validaci[óo]n|Verificaci[óo]n:|Ayuntamiento de Santa Fe|Plaza de Espa[ñn]a|P[áa]gina \d+ de \d+)/;

/**
 * Localiza, en los items de una página (normalmente la primera), una fila de
 * cabecera cuyas etiquetas coinciden, en el orden dado, con los patrones de
 * `etiquetas`. Las etiquetas de una tabla justificada pueden llegar troceadas
 * en varias líneas ("Import" / "e Fact" / "ura"): se busca solo la primera
 * línea de cada una.
 *
 * El límite con la columna anterior es, por defecto, el punto medio entre
 * las dos etiquetas — funciona cuando cada etiqueta va centrada sobre una
 * columna cuyo texto empieza más a la izquierda. No sirve cuando la columna
 * anterior es ancha y su contenido real invade buena parte de ese punto
 * medio (un nombre de tercero largo, o un código que no cabe en su celda):
 * ahí hay que fijar el límite a mano con `desde`, mirando la posición real
 * del texto en un ejemplo del propio decreto.
 */
function columnasDeCabecera(itemsCabecera, etiquetas) {
  const it = itemsCabecera.filter(i => i.str && i.str.trim()).map(i => ({ s: i.str.trim(), x: i.transform[4], y: i.transform[5] }));
  const cols = [];
  for (const { nombre, patron, desde } of etiquetas) {
    // Una etiqueta corta en una columna estrecha puede llegar con las letras
    // espaciadas ("P r o"), igual que las celdas del cuerpo de la tabla.
    const cand = it.filter(i => patron.test(desespaciar(i.s))).sort((a, b) => b.y - a.y)[0];
    if (!cand) return null;
    cols.push({ nombre, x: cand.x, y: cand.y, desde });
  }
  // Todas las etiquetas de la cabecera están en la misma banda vertical.
  const yRef = cols[0].y;
  if (cols.some(c => Math.abs(c.y - yRef) > 20)) return null;
  const ordenadas = cols.sort((a, b) => a.x - b.x);
  return {
    yCabecera: Math.max(...cols.map(c => c.y)),
    columnas: ordenadas.map((c, i, arr) => ({
      nombre: c.nombre,
      desde: i === 0 ? -Infinity : (c.desde ?? (arr[i - 1].x + c.x) / 2),
    })),
  };
}

/**
 * Lee una tabla que ocupa varias páginas, con la cabecera solo en la
 * primera y columnas fijas por posición horizontal. Cada fila se reconoce
 * porque su columna `ancla` cumple `prueba` en alguna de sus líneas; el
 * resto de líneas del bloque —el nombre del tercero, la descripción,
 * partidos en varias líneas— se reparte con esa fila.
 *
 * No todas las tablas apilan la continuación de la misma manera: en unas el
 * ancla (importe, número de registro) va en la PRIMERA línea del bloque y lo
 * demás sigue por debajo; en otras el importe y el NIF quedan al pie del
 * bloque y el nombre se apila por encima. `direccion` lo indica: 'adelante'
 * reparte cada línea con la última ancla vista; 'atras', con la próxima.
 *
 * Un salto de página nunca parte una fila por la mitad en los decretos
 * comprobados: cada página se procesa por separado y las columnas y la
 * altura de la cabecera de la primera se reutilizan en el resto, para no
 * arrastrar el título ni el encabezamiento del decreto como si fueran la
 * primera fila.
 *
 * @param {Array<Array>} paginasItems items de getTextContent() de cada página
 * @param {Array<{nombre:string, patron:RegExp}>} etiquetas cabecera, de izquierda a derecha
 * @param {{columna:string, prueba:RegExp}} ancla columna y prueba que marca una fila
 * @param {'adelante'|'atras'} [direccion]
 * @returns {Array<Object>|null} una fila por objeto, con una clave por columna (texto ya desespaciado)
 */
export function leerTablaPorColumnas(paginasItems, etiquetas, ancla, direccion = 'adelante') {
  if (!paginasItems.length) return null;
  const cabecera = columnasDeCabecera(paginasItems[0], etiquetas);
  if (!cabecera) return null;
  const { columnas, yCabecera } = cabecera;
  const columnaDe = (x) => {
    let c = columnas[0].nombre;
    for (const col of columnas) if (x >= col.desde) c = col.nombre; else break;
    return c;
  };
  const nuevaFila = () => { const o = {}; for (const col of columnas) o[col.nombre] = []; return o; };

  const filas = [];
  paginasItems.forEach((itemsPagina, nPagina) => {
    const it = itemsPagina.filter(i => i.str && i.str.trim() && !PIE_ROTADO.test(i.str.trim())
        && (nPagina > 0 || i.transform[5] < yCabecera - 1))
      .map(i => ({ s: i.str.trim(), x: i.transform[4], y: i.transform[5] }));
    const lineas = new Map();
    for (const i of it) {
      const clave = Math.round(i.y / 3) * 3;
      if (!lineas.has(clave)) lineas.set(clave, []);
      lineas.get(clave).push(i);
    }
    // De arriba a abajo: cada línea, con sus fragmentos ya repartidos por columna.
    const lineasPagina = [...lineas.entries()].sort((a, b) => b[0] - a[0]).map(([y, frags]) => {
      const porColumna = new Map();
      for (const f of frags.sort((a, b) => a.x - b.x)) {
        const c = columnaDe(f.x);
        if (!porColumna.has(c)) porColumna.set(c, []);
        porColumna.get(c).push(f.s);
      }
      return { y, porColumna };
    });
    // Un importe corto puede quedar partido entre dos líneas de la misma
    // columna ("1.001," en una, "21" —los dos decimales— en la siguiente):
    // la columna del ancla es tan estrecha que ni un número corto le cabe en
    // una sola línea. Se recompone aquí, antes de decidir qué es una fila.
    for (let i = 0; i < lineasPagina.length - 1; i++) {
      const aqui = lineasPagina[i].porColumna.get(ancla.columna) || [];
      const ultimo = aqui[aqui.length - 1];
      if (!ultimo || !/,$/.test(ultimo)) continue;
      const sig = lineasPagina[i + 1].porColumna.get(ancla.columna) || [];
      if (sig.length === 1 && /^\d{2}$/.test(sig[0])) {
        aqui[aqui.length - 1] = ultimo + sig[0];
        lineasPagina[i + 1].porColumna.set(ancla.columna, []);
      }
    }
    lineasPagina.forEach(l => {
      l.esAncla = ancla.prueba.test((l.porColumna.get(ancla.columna) || []).map(desespaciar).join(' '));
    });
    if (!lineasPagina.some(l => l.esAncla)) return;

    // 'adelante': el ancla ABRE la fila (es su primera línea, lo siguiente
    // se le añade hasta la próxima ancla). 'atras': el ancla CIERRA la fila
    // que se venía acumulando por encima suyo.
    const filasPagina = [];
    let actual = direccion === 'atras' ? nuevaFila() : null;
    for (const l of lineasPagina) {
      if (direccion === 'adelante' && (l.esAncla || !actual)) { actual = nuevaFila(); filasPagina.push(actual); }
      for (const [c, textos] of l.porColumna) actual[c].push(...textos);
      if (direccion === 'atras' && l.esAncla) { filasPagina.push(actual); actual = nuevaFila(); }
    }
    filas.push(...filasPagina);
  });

  return filas.map(f => {
    const out = {};
    for (const col of columnas) out[col.nombre] = (f[col.nombre] || []).map(desespaciar).join(' ').replace(/\s+/g, ' ').trim();
    return out;
  });
}

/**
 * Prueba, sobre los items de todas las páginas de un PDF, cada una de las
 * tablas de varias páginas que se conocen (relación de pagos, seguros
 * sociales, facturas por número de registro). Solo una encaja por decreto,
 * porque cada una exige sus propias etiquetas de cabecera; las demás
 * devuelven `null` sin más. El resultado son líneas de texto —una por
 * fila— que se añaden al final del documento para que lineas.js las lea
 * como una tabla más, igual que hace `relacionAdjunta`.
 *
 * @param {Array<Array>} paginasItems items de getTextContent() de cada página
 * @returns {string[]}
 */
export function leerTablasMultiPagina(paginasItems) {
  const out = [];

  // "Saldo" es propia de esta tabla (la de seguros sociales, más abajo,
  // también tiene "Nombre Ter." / "Texto Libre" / "Importe" pero no "Saldo"):
  // sin exigirla, las dos cabeceras encajarían a la vez en el mismo decreto.
  const pagos = leerTablaPorColumnas(paginasItems,
    [{ nombre: 'nombre', patron: /^Nombre Ter\.?$/ }, { nombre: 'concepto', patron: /^Texto Libre$/ },
     { nombre: 'saldo', patron: /^Saldo$/ }, { nombre: 'importe', patron: /^Importe$/ }],
    { columna: 'importe', prueba: /\d,\d{2}$/ }, 'adelante');
  if (pagos) for (const f of pagos) out.push(`Pagos por nombre (fila): ${f.nombre} | ${f.concepto} | ${f.importe}`);

  const seguros = leerTablaPorColumnas(paginasItems,
    [{ nombre: 'operacion', patron: /^N[ºo]\s*Operaci[óo]n$/ }, { nombre: 'aplicacion', patron: /^Aplicaci[óo]n$/, desde: 155 },
     { nombre: 'importe', patron: /^Importe$/, desde: 248 }, { nombre: 'cif', patron: /^Tercero$/ },
     { nombre: 'nombre', patron: /^Nombre Ter\.?$/ }, { nombre: 'concepto', patron: /^Texto Libre$/ }],
    { columna: 'operacion', prueba: /^\d{9,}\b/ }, 'atras');
  if (seguros) for (const f of seguros) out.push(`Seguros sociales (fila): ${f.importe} | ${f.cif} | ${f.nombre} | ${f.concepto}`);

  // "Programa" y "Económica" no se usan en la salida, pero hay que declararlas
  // igualmente: si no, sus dígitos —contiguos a la izquierda de "Descripción"—
  // caen dentro de la columna "Importe" y le rompen el ancla a cada fila.
  const facturas = leerTablaPorColumnas(paginasItems,
    [{ nombre: 'registro', patron: /^N[uú]mero$/ }, { nombre: 'nombre', patron: /^Tercero$/ },
     { nombre: 'importe', patron: /^Import$/, desde: 287 }, { nombre: 'programa', patron: /^Pro$/ },
     { nombre: 'economica', patron: /^Eco$/ }, { nombre: 'concepto', patron: /^Descripci[óo]n/ }],
    { columna: 'importe', prueba: /\d,\d{2}$/ }, 'adelante');
  if (facturas) for (const f of facturas) out.push(`Facturas por registro (fila): ${f.registro} | ${f.nombre} | ${f.importe} | ${f.concepto}`);

  return out;
}

export function relacionAdjunta(items) {
  const it = items
    .filter(i => i.str && i.str.trim())
    .map(i => ({ s: i.str.trim(), x: i.transform[4], y: i.transform[5], c: i.transform[4] + (i.width || 0) / 2 }));

  const cab = (re) => it.find(i => re.test(i.s));
  const hFecha = cab(/^Fecha$/), hImporte = cab(/^Importe$/), hTercero = cab(/^Tercero$/), hLibre = cab(/^Texto Libre$/);
  if (!hFecha || !hImporte || !hTercero || !hLibre || Math.abs(hFecha.y - hImporte.y) > 3) return [];
  const hApl = it.find(i => /^Aplicaci[óo]n$/.test(i.s) && Math.abs(i.y - hFecha.y) < 3);
  const hNombre = it.filter(i => /^Nombre(?: Ter\.)?$|^Ter\.$/.test(i.s) && Math.abs(i.y - hFecha.y) < 16 && i.x > hTercero.x && i.x < hLibre.x)
    .sort((a, b) => a.x - b.x)[0];
  if (!hApl || !hNombre) return [];

  // Las celdas van centradas en su columna (la cabecera también): cada
  // fragmento pertenece a la columna cuyo centro le queda más cerca.
  const columnas = [
    ['fecha', hFecha.c], ['aplicacion', hApl.c], ['importe', hImporte.c],
    ['tercero', hTercero.c], ['nombre', hNombre.c], ['libre', hLibre.c],
  ].sort((a, b) => a[1] - b[1]);
  const columnaDe = (i) => columnas.reduce((m, col) => (Math.abs(col[1] - i.c) < Math.abs(m[1] - i.c) ? col : m), columnas[0])[0];

  const fin = it.filter(i => i.y < hFecha.y && /^En Santa Fe/.test(i.s)).sort((a, b) => b.y - a.y)[0];
  const ruido = /^(?:N[uú]mero:|DECRETO$|Fecha:\s*\d|C[óo]d\. Validaci|Ayuntamiento de Santa Fe|Plaza de Espa)/;
  // Sin el texto que arranca en el margen izquierdo de la tabla (los puntos del
  // RESUELVO, un párrafo): la única celda que empieza ahí es la fecha, que es solo cifras y barras.
  const region = it.filter(i => i.y < hFecha.y - 2 && (!fin || i.y > fin.y + 2) && !(i.x < hFecha.x + 2 && !/^[\d\/]+$/.test(i.s)) && !ruido.test(i.s));

  const RE_ID = /^(?:[A-Z]\d{7}[A-Z0-9]|[A-Z]\d{8}|\d{8}[A-Z])$/;
  const anclas = region.filter(i => columnaDe(i) === 'tercero' && RE_ID.test(i.s)).sort((a, b) => b.y - a.y);
  if (!anclas.length) return [];

  // Importe suelto de la última línea (el total del decreto): no es de ninguna fila.
  const esTotal = (i) => columnaDe(i) === 'importe' && !anclas.some(a => Math.abs(a.y - i.y) < 3);
  const resto = region.filter(i => !esTotal(i));

  const hayArriba = resto.some(i => i.y > anclas[0].y + 3);
  const hayAbajo = resto.some(i => i.y < anclas[anclas.length - 1].y - 3);
  const alineacion = hayArriba && !hayAbajo ? 'abajo' : (!hayArriba && hayAbajo ? 'arriba' : 'centro');

  const filas = anclas.map(a => ({ ancla: a, items: [] }));
  for (const i of resto) {
    let k;
    if (alineacion === 'abajo') {
      // Pertenece a la primera ancla que está por debajo o a su altura.
      k = filas.findIndex(f => f.ancla.y <= i.y + 3);
      if (k < 0) k = filas.length - 1;
    } else if (alineacion === 'arriba') {
      // A la última ancla que está por encima o a su altura.
      k = -1;
      filas.forEach((f, n) => { if (f.ancla.y >= i.y - 3) k = n; });
      if (k < 0) k = 0;
    } else {
      k = filas.reduce((mejor, f, n) => (Math.abs(f.ancla.y - i.y) < Math.abs(filas[mejor].ancla.y - i.y) ? n : mejor), 0);
    }
    filas[k].items.push(i);
  }

  return filas.map(({ items: fr }) => {
    // La cifra final de una fecha partida ("03/09/202" + "6") cae en la columna de al lado.
    const columna = (i) => (columnaDe(i) === 'aplicacion' && /^\d{1,2}$/.test(i.s) && i.x < hApl.x - 5 ? 'fecha' : columnaDe(i));
    const celda = (col, sep) => fr.filter(i => columna(i) === col)
      .sort((a, b) => (Math.abs(b.y - a.y) > 3 ? b.y - a.y : a.x - b.x))
      .map(i => i.s).join(sep).replace(/\s+/g, ' ').trim();
    return `Relación adjunta (fila): ${celda('fecha', '')} | ${celda('aplicacion', ' ')} | ${celda('importe', ' ')} | ${celda('tercero', ' ')} | ${celda('nombre', ' ')} | ${celda('libre', ' ')}`;
  });
}
