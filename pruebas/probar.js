import { CORPUS } from './corpus.js';
import { anonimizar } from '../js/redact.js';
import { extraerLineas, terceros } from '../js/lineas.js';
import { analizar, fmtEuro } from '../js/parse.js';
import { evaluarDecreto, evaluarPatrones, lecturaOposicion } from '../js/rules.js';
import { limpiar } from '../js/extract.js';

let fallos = 0;
const comprobar = (cond, msg) => {
  if (!cond) { fallos++; console.log(`   ✗ ${msg}`); }
  else console.log(`   ✓ ${msg}`);
};

const fichas = [];
let gil_texto_crudo = '';

for (const caso of CORPUS) {
  console.log(`\n━━━ ${caso.id} ━━━`);

  // Prescan: identifica quién factura antes de anonimizar, para no borrar
  // a los autónomos que son proveedores.
  const proveedores = terceros(extraerLineas(caso.texto));
  const anon = anonimizar(caso.texto, { permitir: proveedores });
  const ficha = analizar(anon.textoAnonimo, caso.id + '.pdf');
  const alertas = evaluarDecreto(ficha);
  if (caso.id === 'gil-corral-pagos-marzo') gil_texto_crudo = caso.texto;
  const lectura = lecturaOposicion(ficha, alertas);
  fichas.push(ficha);

  console.log(`   tipo=${ficha.tipo}  exp=${ficha.expediente}  fecha=${ficha.fecha}`);
  console.log(`   firmante=${ficha.firmante}  mandato=${ficha.mandato.id} (${ficha.mandato.confianza})`);
  console.log(`   importe=${fmtEuro(ficha.importeTotal)}  aplicaciones=${ficha.aplicaciones.slice(0,4).join(', ')}`);
  console.log(`   proveedores=${ficha.proveedores.map(p => p.nombre).join(' | ') || '—'}`);
  console.log(`   reparo=${ficha.reparo.hayReparo} motivos=${(ficha.reparo.motivos||[]).length}`);
  console.log(`   riesgo PII=${anon.riesgo}  personas=${anon.mapa.filter(m=>m.tipo==='PERSONA').length}  contextos=[${anon.contextos.join('; ')}]`);
  console.log(`   alertas=${alertas.length} (${alertas.filter(a=>a.severidad==='alta').length} altas, ${alertas.filter(a=>a.dobleFilo).length} doble filo)`);
  if (ficha.nFacturas) {
    console.log(`   FACTURAS: ${ficha.nFacturas} líneas · suma=${fmtEuro(ficha.sumaLineas)} · declarado=${fmtEuro(ficha.importeTotal)} · cuadra=${ficha.cuadra}`);
    console.log(`   mayores: ${ficha.mayores.slice(0,3).map(l=>`${fmtEuro(l.importe)} ${l.nombre||l.cif||'?'}`).join(' | ')}`);
    console.log(`   terceros: ${ficha.porTercero.slice(0,5).map(t=>`${t.nombre||t.cif} x${t.nFacturas} (${fmtEuro(t.importe)})`).join(' | ')}`);
  }
  const otrosTipos = ficha.lineas.filter(l => !['proveedor'].includes(l.tipo));
  if (otrosTipos.length) {
    console.log(`   otras líneas: ${otrosTipos.map(l => `${l.tipo}:${l.nombre||'(sin nombre)'}`).join(' | ')}`);
  }
  console.log(`   → ${lectura.lineas[0]}`);

  const e = caso.esperado;
  if (e.tipo) comprobar(ficha.tipo === e.tipo, `tipo esperado "${e.tipo}", obtenido "${ficha.tipo}"`);
  if (e.expediente) comprobar(ficha.expediente === e.expediente, `expediente "${e.expediente}" → "${ficha.expediente}"`);
  if (e.importe) comprobar(Math.abs(ficha.importeTotal - e.importe) < 0.02, `importe ${e.importe} → ${ficha.importeTotal}`);
  if (e.mandato) comprobar(ficha.mandato.id === e.mandato, `mandato "${e.mandato}" → "${ficha.mandato.id}"`);
  if (e.nFacturasMin) comprobar(ficha.nFacturas >= e.nFacturasMin, `al menos ${e.nFacturasMin} facturas extraídas → ${ficha.nFacturas}`);
  if (e.terceroTop) comprobar(
    (ficha.porTercero[0]?.cif || ficha.porTercero[0]?.clave) === e.terceroTop,
    `tercero principal "${e.terceroTop}" → "${ficha.porTercero[0]?.cif || ficha.porTercero[0]?.clave}"`);
  if ('vinculacionJuridica' in e) comprobar(
    ficha.vinculacionJuridica === e.vinculacionJuridica,
    `vinculacionJuridica ${e.vinculacionJuridica} → ${ficha.vinculacionJuridica}`);
}

/* ─── comprobaciones específicas de seguridad ─── */

console.log('\n━━━ comprobaciones de anonimización ━━━');
const pagos = CORPUS.find(c => c.id === 'pagos-septiembre');
const anonPagos = anonimizar(pagos.texto);
comprobar(!/NAVARRO ISLA FILOMENA/.test(anonPagos.textoAnonimo), 'nombre de perceptora de ayuda social anonimizado');
comprobar(!/PERFETTI VIDAL LUIS ENRIQUE CAMILO/.test(anonPagos.textoAnonimo), 'segundo perceptor anonimizado');
comprobar(/SERCOVIRA/.test(anonPagos.textoAnonimo), 'razón social de proveedor conservada');
comprobar(anonPagos.riesgo === 'alto', 'riesgo marcado como alto por contexto de servicios sociales');
comprobar(anonPagos.contextos.length >= 2, `contextos sensibles detectados: ${anonPagos.contextos.join('; ')}`);

console.log('\n━━━ proveedores que son personas físicas ━━━');
const ops = CORPUS.find(c => c.id === 'operaciones-agosto');
const provOps = terceros(extraerLineas(ops.texto));
const anonOps = anonimizar(ops.texto, { permitir: provOps });
comprobar(/GARCIA PEREZ GERARDO/.test(anonOps.textoAnonimo), 'autónomo proveedor NO anonimizado (GARCIA PEREZ GERARDO)');
comprobar(/CAMACHO MARTINEZ JOSE/.test(anonOps.textoAnonimo), 'autónomo proveedor NO anonimizado (CAMACHO MARTINEZ JOSE)');
const fOps = analizar(anonOps.textoAnonimo, 'ops.pdf');
const rotonda = fOps.porTercero.find(t => /ROTONDA/.test(t.nombre || ''));
comprobar(rotonda && rotonda.nFacturas >= 6, `ES ROTONDA agrupada con ${rotonda?.nFacturas} facturas`);
const aOps = evaluarDecreto(fOps);
comprobar(aOps.some(a => a.id === 'F03'), 'F03 detecta proveedores repetidos con facturas pequeñas');

console.log('\n━━━ comprobación de atribución política ━━━');
const psoe = fichas.find(f => f.archivo.startsWith('nominas-psoe'));
const pp = fichas.find(f => f.archivo.startsWith('nominas-pp'));
comprobar(psoe.mandato.partido === 'PSOE', `nómina de enero atribuida a PSOE (${psoe.mandato.partido})`);
comprobar(pp.mandato.partido === 'PP', `nómina de noviembre atribuida a PP (${pp.mandato.partido})`);
const alertasPsoe = evaluarDecreto(psoe);
comprobar(alertasPsoe.some(a => a.id === 'P01' && a.dobleFilo),
  'la alerta P01 se activa también sobre el decreto del PSOE y está marcada como doble filo');

console.log('\n━━━ patrones sobre el registro ━━━');
const patrones = evaluarPatrones(fichas);
for (const p of patrones) {
  console.log(`   [${p.id}] ${p.titulo}`);
  console.log(`        ${p.detalle}`);
  if (p.aviso) console.log(`        AVISO: ${p.aviso}`);
}
comprobar(patrones.some(p => p.id === 'Z05'), 'detectada continuidad estructural entre mandatos (Z05)');
const patronesAmpliado = evaluarPatrones([...fichas, ...fichas]);
comprobar(patronesAmpliado.some(p => p.id === "Z02"), "Z02 se activa al superar el umbral de 3 repeticiones");
comprobar(patronesAmpliado.filter(p => p.id === "Z02").length >= patrones.filter(p => p.id === "Z02").length,
  "Z02 crece al ampliar la serie");

console.log('\n━━━ mandato con subperíodos de alcaldía (Gil Corral / Carrasco / Cobo) ━━━');
const gil = fichas.find(f => f.archivo.startsWith('gil-corral-pagos-marzo'));
comprobar(gil.mandato.alcaldia === 'Manuel Alberto Gil Corral', `alcaldía atribuida a Gil Corral → "${gil.mandato.alcaldia}"`);
comprobar(gil.mandato.confianza === 'alta', `confianza alta para Gil Corral → "${gil.mandato.confianza}"`);
comprobar(gil.firmante && /GIL CORRAL/i.test(gil.firmante), `firmante detectado → "${gil.firmante}"`);
const granata = fichas.find(f => f.archivo.startsWith('granata'));
comprobar(granata.mandato.alcaldia === 'Manuel Alberto Gil Corral', `Granata también atribuido a Gil Corral → "${granata.mandato.alcaldia}"`);
comprobar(granata.fecha === '2022-05-17', `fecha de sesión JGL extraída → "${granata.fecha}"`);

console.log('\n━━━ formato D (número de operación) y categorías de línea ━━━');
comprobar(gil.nFacturas >= 4, `al menos 4 líneas de tipo proveedor extraídas → ${gil.nFacturas}`);
const cd = gil.porTercero.find(t => /CD CIUDAD DE SANTA FE/i.test(t.nombre || ''));
comprobar(cd && cd.nFacturas === 3, `CD Ciudad de Santa Fe agrupado en 3 facturas → ${cd?.nFacturas}`);
comprobar(!gil.lineas.some(l => /GIL CORRAL/i.test(l.nombre || '') && l.tipo === 'proveedor'),
  'el kilometraje del alcalde NO se cuenta como proveedor (tipo dieta)');
comprobar(gil.lineas.some(l => l.tipo === 'devolucion' && /GARCIA JIMENEZ/i.test(l.nombre || '')),
  'la devolución de fianza se clasifica como devolución, no como proveedor');
comprobar(!gil.porTercero.some(t => /GARCIA JIMENEZ|AGENCIA ESTATAL/i.test(t.nombre || '')),
  'ni la devolución ni el IRPF entran en el ranking de proveedores');
const totalGil = gil.porTercero.reduce((a, t) => a + t.importe, 0);
comprobar(Math.abs(totalGil - 17303.50) < 0.5, `suma de proveedores reales (deportes) ≈ 17.303,50 € → ${totalGil.toFixed(2)}`);

console.log('\n━━━ anonimización: devolución de fianza con DNI ━━━');
const anonGil = anonimizar(gil_texto_crudo, { permitir: terceros(extraerLineas(gil_texto_crudo)) });
comprobar(!/15474313M/.test(anonGil.textoAnonimo), 'el DNI de la devolución de fianza queda anonimizado');
comprobar(anonGil.riesgo === 'alto', `riesgo alto por contexto de devolución/fianza → "${anonGil.riesgo}"`);
comprobar(/GIL CORRAL/.test(anonGil.textoAnonimo), 'el alcalde sigue visible (cargo público) pese a aparecer también como perceptor de dietas');
comprobar(/CD CIUDAD DE SANTA FE/.test(anonGil.textoAnonimo), 'el club deportivo (proveedor) sigue visible');

console.log('\n━━━ formatoC multi-ítem (tres pólizas MAPFRE en un único RESUELVO) ━━━');
const mapfre = fichas.find(f => f.archivo.startsWith('mapfre'));
comprobar(mapfre.lineas.filter(l => l.formato === 'C').length === 3, `las 3 pólizas se extraen, no solo la primera → ${mapfre.lineas.filter(l => l.formato === 'C').length}`);
comprobar(mapfre.porTercero.length === 1 && mapfre.porTercero[0].nFacturas === 3,
  `las 3 se agrupan bajo el mismo CIF de MAPFRE → ${mapfre.porTercero[0]?.nFacturas} facturas`);
comprobar(Math.abs(mapfre.sumaLineas - 2942.28) < 0.01, `suma de las 3 pólizas = 2.942,28 € → ${mapfre.sumaLineas.toFixed(2)}`);

console.log('\n━━━ pensión vitalicia: alerta y anonimización ━━━');
const renta = fichas.find(f => f.archivo.startsWith('renta-vitalicia'));
const alertasRenta = evaluarDecreto(renta);
comprobar(alertasRenta.some(a => a.id === 'P06'), 'se dispara P06 (pensión sin competencia municipal)');
comprobar(!renta.porTercero.length, 'la beneficiaria de la pensión NO se cuenta como proveedor');
const provRenta = terceros(extraerLineas(CORPUS.find(c => c.id === 'renta-vitalicia').texto));
const anonRenta = anonimizar(CORPUS.find(c => c.id === 'renta-vitalicia').texto, { permitir: provRenta });
comprobar(!/FRANCISCA ÁLVAREZ SÁNCHEZ|FRANCISCA ALVAREZ SANCHEZ/i.test(anonRenta.textoAnonimo), 'el nombre de la beneficiaria fallecida queda anonimizado');
comprobar(!/24093093H/.test(anonRenta.textoAnonimo), 'su NIF queda anonimizado');
comprobar(anonRenta.contextos.some(c => /pensión/i.test(c)), 'se marca el contexto sensible de pensión/defunción');

console.log('\n━━━ formato D con columna de Aplicación: no confundir el código con el importe ━━━');
const seguros = fichas.find(f => f.archivo.startsWith('seguros-sociales-julio-2026'));
const importesReales = [8038.88, 4425.95, 27450.57, 808.52, 7376.52, 4925.74];
const importesExtraidos = seguros.lineas.map(l => l.importe).sort((a, b) => a - b);
comprobar(
  importesExtraidos.length === importesReales.length &&
  importesReales.slice().sort((a, b) => a - b).every((v, i) => Math.abs(v - importesExtraidos[i]) < 0.01),
  `importes reales extraídos, no el código de aplicación → [${importesExtraidos.join(', ')}]`
);
comprobar(seguros.lineas.every(l => l.tipo === 'tributo'), 'las 6 líneas se clasifican como tributo, no como proveedor');
comprobar(seguros.nFacturas === 0 && seguros.porTercero.length === 0,
  'la Seguridad Social no cuenta como proveedor recurrente (nFacturas=0, porTercero vacío)');
comprobar(seguros.sumaLineas === 0, 'sumaLineas (solo cuenta proveedor) se queda en 0, no en 53.026,18 €');

console.log('\n━━━ limpiar(): el pie de "esPublico Gestiona" no contamina la firma ━━━');
// Encontrado validando contra un decreto real de pago de seguros sociales
// (2026-1534): la firma "Fdo. Juan Cobo Ortiz" quedaba justo encima del pie
// de página en la siguiente línea. El pie se limpiaba solo a medias —
// "esPublico" se borraba, "Gestiona" no— y esa palabra suelta se colaba en
// el nombre del firmante, porque el patrón de firmante admite saltos de
// línea dentro del nombre. Resultado real observado: firmante "Juan Cobo
// Ortiz Gestiona" en vez de "Juan Cobo Ortiz".
const textoConPieReal =
  'Fdo. Juan Cobo Ortiz\nCód. Validación: 5XQPWYSPHDNAP3DRENCFTMYDK Verificación: https://santafe.sedelectronica.es/ ' +
  'Documento firmado electrónicamente desde la plataforma esPublico Gestiona | Página 2 de 2';
const limpio = limpiar(textoConPieReal);
comprobar(!/Gestiona/.test(limpio), `"Gestiona" no sobrevive a limpiar() → "${limpio.replace(/\s+/g, ' ').trim()}"`);
comprobar(/Fdo\. Juan Cobo Ortiz/.test(limpio), 'la firma en sí se conserva intacta');

console.log('\n━━━ fmtEuro: separador de miles en importes de 4 cifras ━━━');
// toLocaleString('es-ES', {style:'currency'}) deja estos importes sin el
// punto de los miles (dato CLDR real, no un fallo del entorno de pruebas):
// es justo el rango donde caen muchos decretos, así que se comprueba aparte.
comprobar(fmtEuro(5199.98) === '5.199,98 €', `fmtEuro(5199.98) → "${fmtEuro(5199.98)}"`);
comprobar(fmtEuro(1000) === '1.000,00 €', `fmtEuro(1000) → "${fmtEuro(1000)}"`);
comprobar(fmtEuro(999.98) === '999,98 €', `fmtEuro(999.98) → "${fmtEuro(999.98)}" (sin miles: son 3 cifras)`);
comprobar(fmtEuro(-250.5) === '-250,50 €', `fmtEuro(-250.5) → "${fmtEuro(-250.5)}"`);

console.log('\n━━━ B03 sobrevive al informe consolidado (recalculada sin el texto del decreto) ━━━');
// mostrarInformeConsolidado() en app.js llama a evaluarDecreto(ficha) leyendo
// del registro, que nunca guarda el texto íntegro (ver registry.js). Una
// alerta que dependiera del texto se dispararía en la tarjeta de la sesión y
// nunca en el informe consolidado — justo el bug que este caso comprueba.
const opsDesfavorable = fichas.find(f => f.archivo === 'operaciones-desfavorable.pdf');
comprobar(!!opsDesfavorable.vinculacionJuridica, 'vinculacionJuridica detectada en el análisis en vivo');
const comoSiVinieraDelRegistro = JSON.parse(JSON.stringify(opsDesfavorable));
const alertasDesdeRegistro = evaluarDecreto(comoSiVinieraDelRegistro);
comprobar(alertasDesdeRegistro.some(a => a.id === 'B03'),
  'B03 se dispara recalculando desde una ficha ya guardada, sin el texto original');

console.log(`\n${fallos === 0 ? '✓ TODAS LAS COMPROBACIONES PASAN' : `✗ ${fallos} FALLO(S)`}\n`);
process.exit(fallos ? 1 : 0);
