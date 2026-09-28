/**
 * tablas-columnas-real.js — Fragmentos reales (texto + posición) de tres
 * decretos de "ordenación de pagos", para probar leerTablaPorColumnas() sin
 * depender de pdf.js. Cada bloque es justo lo necesario para reproducir un
 * caso real que rompió el primer intento de lectura.
 *
 *   - FILAS_1793: "Nombre Ter. / Texto Libre / Saldo / Importe" — el ancla
 *     (el importe) va en la PRIMERA línea del bloque.
 *   - FILAS_1789: "Nº Operación / Fase / Fecha / Aplicación / Importe /
 *     Tercero / Nombre Ter. / Texto Libre" — el ancla (el nº de operación)
 *     va en la ÚLTIMA línea del bloque; el nombre se apila por encima.
 *   - FILAS_1783: "Número de Registro / Tercero / Importe / Programa /
 *     Económica / Descripción" — columnas justificadas letra a letra
 *     ("A T H I S A") y un importe corto partido en dos líneas ("1.001," /
 *     "21").
 */
const it = (str, x, y, width) => ({ str, transform: [1, 0, 0, 1, x, y], width });

export const FILAS_1793 = [
  it("Nombre Ter.", 98.1, 477.3, 59),
  it("Texto Libre", 259.3, 477.3, 54),
  it("Saldo", 408.7, 477.3, 27.3),
  it("Importe", 472, 477.3, 36.7),
  it("Líquido", 472.3, 463, 36.2),
  it("ACISA", 112.5, 442.1, 30),
  it("CONTRATO DE MANTENIMIENTO DE", 198.2, 442.1, 176.3),
  it("LAS INSTALACIONES SEMAFORICAS.", 196.2, 428.4, 180.3),
  it("PERIODO: 01/07/2026 AL 31/07/2026", 201.4, 414.8, 169.8),
  it("287,23", 407.1, 442.1, 30.6),
  it("287,23", 475.1, 442.1, 30.6),
  it("ACISA", 112.5, 394.4, 30),
  it("CONTRATO DE MANTENIMIENTO DE", 198.2, 394.4, 176.3),
  it("LAS INSTALACIONES SEMAFORICAS.", 196.2, 380.7, 180.3),
  it("PERIODO: 01/08/2026 al 31/08/2026", 203.6, 367.1, 165.3),
  it("287,23", 407.1, 394.4, 30.6),
  it("287,23", 475.1, 394.4, 30.6),
  it("ACOTA2", 107.6, 346.7, 40.1),
  it("ARQUITECTURA Y", 83.4, 333, 88.5),
  it("GESTIO SLP", 97.8, 319.4, 59.5),
  it("Memoria valorada para las obras de mejora", 189.5, 346.7, 193.6),
  it("del parque infantil en el Camino de El Jau.", 192.3, 333, 188.1),
  it("2026/4/PPOYS-152/2", 238.1, 319.4, 96.3),
  it("1.100,00", 402.9, 346.7, 39),
  it("1.100,00", 470.9, 346.7, 39),
  it("AGROTALLER", 93.9, 299, 67.3),
  it("GABRIEL, SL", 97, 285.3, 61.2),
  it("MANO DE OBRA ( ++++ ANTOLI 1500", 199.2, 299, 174.2),
  it("++++ ) / DESPLAZAMIENTO ( ++++", 204.2, 285.3, 164.2),
  it("ANTOLI 1500 ++++ h ++++ ) / ACEITE", 198.6, 271.7, 175.3),
  it("364,77", 407.1, 299, 30.6),
  it("364,77", 475.1, 299, 30.6),
  it("DECRETO", 555.3, 370, 77.2),
  it("Número: 2026-1793", 566.3, 371, 79.9),
  it("Fecha: 25/09/2026", 566.3, 459.3, 75.2),
];

export const FILAS_1789 = [
  it("Nº Operación", 57.6, 508.3, 50.4),
  it("Fase", 118, 508.3, 18.1),
  it("Fecha", 144, 508.3, 23),
  it("Aplicación", 193, 508.3, 40.4),
  it("Importe", 254.3, 508.3, 29.3),
  it("Tercero", 301.4, 508.3, 29.2),
  it("Nombre Ter.", 351.1, 508.3, 47),
  it("Texto Libre", 434.7, 508.3, 43),
  it("220260011807", 57.7, 470, 53.2),
  it("ADO", 118, 470, 17.3),
  it("23/09/2026", 146, 470, 39.9),
  it("2026", 193, 479.2, 17.7),
  it("132", 226.4, 479.2, 13.2),
  it("16000", 193, 470, 22.1),
  it("27.939,96", 258.8, 470, 35.5),
  it("Q1819002E", 301.4, 470, 42.5),
  it("TESORERIA", 351.1, 497.6, 46.1),
  it("GENERAL", 351.1, 488.4, 38.1),
  it("SEGURIDAD", 351.1, 479.2, 47.4),
  it("SOCIAL GRANADA", 351.1, 470, 73.3),
  it("SEGUROS SOCIALES", 434.7, 488.4, 82.1),
  it("AGOSTO/2026 EXPTE.", 434.7, 479.2, 84.8),
  it("5097/2026", 434.7, 470, 37.7),
  it("TESORERIA", 351.1, 460.3, 46.1),
];

export const FILAS_1783_PAG1 = [
  it("N ú m e r o", 74.3, 291.2, 42.6),
  it("d e", 74.3, 277.2, 12.6),
  it("Registro", 74.3, 263.2, 37.3),
  it("Tercero", 123.6, 291.2, 34.5),
  it("Import", 290.4, 291.2, 32.8),
  it("e", 290.4, 277.2, 5.6),
  it("Fact", 302.9, 277.2, 20.2),
  it("ura", 290.4, 263.2, 14.5),
  it("P r o", 330, 291.2, 18.4),
  it("g r a", 330, 277.2, 17.3),
  it("ma", 330, 263.2, 13.9),
  it("E c o", 356, 291.2, 20.1),
  it("nómi", 356, 277.2, 22),
  it("ca", 356, 263.2, 10.6),
  it("Descripción Aplicación", 384.8, 291.2, 100.7),
  it("2 0 2 6", 74.3, 242.4, 26.5),
  it("ACISA", 123.6, 242.4, 30),
  it("287,23", 290.4, 242.4, 30.6),
  it("9 2 1", 330, 242.4, 19.2),
  it("2 2 7", 356, 242.4, 19.6),
  it("Mantenimiento semáforos", 384.8, 242.4, 115.2),
];

export const FILAS_1783_PAG2 = [
  it("2 0 2 6", 74.3, 412.1, 26.5),
  it("/2653", 74.3, 398.1, 25.1),
  it("A T H I S A", 123.6, 412.1, 41.4),
  it("A N D A L U Z A", 222.9, 412.1, 60.7),
  it("TRATAMIENTOS HIGIENE S.A", 123.6, 398.1, 141.3),
  it("387,20", 290.4, 412.1, 30.6),
  it("313", 330, 412.1, 16.7),
  it("2 2 7", 356, 412.1, 19.6),
  it("9 9 0", 356, 398.1, 19.6),
  it("4", 356, 384.1, 5.6),
  it("Desratización, desinfección y", 384.8, 412.1, 136.2),
  it("desinsectación", 384.8, 398.1, 66.2),
  it("2 0 2 6", 74.3, 363.3, 26.5),
  it("/2733", 74.3, 349.3, 25.1),
  it("A T H I S A", 123.6, 363.3, 41.4),
  it("A N D A L U Z A", 222.9, 363.3, 60.7),
  it("TRATAMIENTOS HIGIENE S.A", 123.6, 349.3, 141.3),
  it("1.001,", 290.4, 363.3, 32.8),
  it("21", 290.4, 349.3, 11.1),
  it("313", 330, 363.3, 16.7),
  it("2 2 7", 356, 363.3, 19.6),
  it("9 9 0", 356, 349.3, 19.6),
  it("Desratización, desinfección y", 384.8, 363.3, 136.2),
  it("desinsectación", 384.8, 349.3, 66.2),
  it("DECRETO", 555.3, 370, 77.2),
  it("Número: 2026-1783", 566.3, 371, 79.9),
];

export const FILAS_1783 = [FILAS_1783_PAG1, FILAS_1783_PAG2];
