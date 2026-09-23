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
