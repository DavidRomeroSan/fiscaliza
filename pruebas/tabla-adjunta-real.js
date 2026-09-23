/**
 * tabla-adjunta-real.js — Fragmentos (texto + posición) de la relación adjunta
 * de tres decretos de alcaldía reales, tal como los entrega pdf.js, para probar
 * la lectura por columnas de pdfitems.js. Solo la región de la tabla; los NIF
 * de personas y los alumnos citados se han sustituido.
 *
 *   - 2026-1690: celdas alineadas ABAJO, dos filas, fecha partida ("03/09/202" + "6").
 *   - 2026-1683: celdas alineadas ARRIBA, texto libre en ocho líneas.
 *   - 2026-1689: celdas alineadas ABAJO con el total suelto debajo y un punto del RESUELVO pegado.
 */
const it = (str, x, y, width) => ({ str, transform: [1, 0, 0, 1, x, y], width });

export const FILAS_1690 = [
  it("Fecha", 88.9, 367.6, 21.6),
  it("Aplicación", 139.2, 367.6, 38.4),
  it("Importe", 200.1, 367.6, 30.1),
  it("Tercero", 248.8, 367.6, 28.5),
  it("Nombre Ter.", 301.7, 367.6, 47.3),
  it("Texto Libre", 376.4, 367.6, 41.6),
  it("03/09/202", 93.4, 334.1, 38.7),
  it("6", 127.7, 323.1, 4.6),
  it("2026", 139.2, 334.1, 18.1),
  it("9200", 171.5, 334.1, 18.2),
  it("23020", 139.2, 323.1, 22.7),
  it("1.420,86 €", 202.1, 323.1, 38.4),
  it("00000000T", 248.8, 323.1, 41.1),
  it("COBO ORTIZ JUAN", 301.7, 323.1, 66.9),
  it("DIETA ENTERA Y BILLETES AVION VIAJE", 376.4, 356.1, 141.4),
  it("INSTITUCIONAL A ITALIA (PUEB.", 376.4, 345.1, 115.8),
  it("HERMANO PIANEZZA) DIAS 18/09 AL", 376.4, 334.1, 134.1),
  it("22/09, EXPTE. 211/2026", 376.4, 323.1, 88),
  it("03/09/202", 93.4, 297.4, 38.7),
  it("6", 127.7, 286.4, 4.6),
  it("2026", 139.2, 297.4, 18.1),
  it("9200", 171.5, 297.4, 18.2),
  it("23020", 139.2, 286.4, 22.7),
  it("1.117,90 €", 202.1, 286.4, 38.4),
  it("11111111H", 248.8, 286.4, 41.3),
  it("LOPEZ CARREÑO", 301.7, 297.4, 60.8),
  it("ANGEL", 301.7, 286.4, 24.8),
  it("DIETA ENTERA VIAJE INSTITUCIONAL A", 376.4, 308.4, 142.7),
  it("ITALIA (PUEBLO HERMANO PIANEZZA)", 376.4, 297.4, 139.5),
  it("DIAS 18/09 AL 22/09, EXPTE. 211/2026", 376.4, 286.4, 141.9),
  it("2.538,76 €", 207.1, 271.1, 34.1),
  it("En Santa Fe a fecha de firma electrónica", 179.1, 233, 178.2),
  it("DECRETO", 555.3, 370, 77.2),
];

export const FILAS_1683 = [
  it("Fecha", 92.9, 370.3, 25.5),
  it("Aplicación", 155.2, 370.3, 45.5),
  it("Importe", 226.2, 370.3, 34.9),
  it("Tercero", 279.9, 370.3, 33.7),
  it("Nombre Ter.", 343.2, 370.3, 55.5),
  it("Texto Libre", 442.3, 370.3, 50.7),
  it("02/09/2026", 82.9, 358, 45.6),
  it("2026 9200 16200", 141.7, 358, 72.5),
  it("332,02", 230, 358, 27.5),
  it("P1808900C", 273.2, 358, 47.2),
  it("AYUNTAMIENTO", 330.4, 358, 81),
  it("DE GRANADA", 338, 346.4, 65.8),
  it("DIF. POLICIA", 437.4, 358, 60.5),
  it("LOCAL- CURSO TIPO", 419.1, 346.4, 97.2),
  it("A, ALUMNOS D.", 430.7, 334.9, 73.9),
  it("ANA MARIA", 442.3, 323.3, 50.8),
  it("EJEMPLO PRUEBA", 422, 311.8, 91.3),
  it("Y D. JOSE LUIS", 421.3, 300.2, 92.7),
  it("OTRO PRUEBA.", 426, 288.7, 83.2),
  it("EXPTE. 5019/2026", 428.2, 277.1, 78.9),
  it("Si bien, se tendrá que dar cuenta del presente gasto en la próxima Junta de Gobierno", 85.2, 237.1, 424.2),
  it("Local que se celebre.", 85.2, 221.3, 101.1),
  it("DECRETO", 555.3, 370, 77.2),
  it("Número: 2026-1683", 566.3, 371, 79.9),
];

export const FILAS_1689 = [
  it("Fecha", 88.7, 389.8, 24.1),
  it("Aplicación", 150.6, 389.8, 42.8),
  it("Importe", 248.6, 389.8, 33.6),
  it("Tercero", 311.6, 389.8, 31.6),
  it("Nombre Ter.", 364.7, 389.8, 52.4),
  it("Texto Libre", 425.7, 389.8, 46.3),
  it("01/09/2026", 95.4, 351.7, 48.2),
  it("2026", 150.6, 351.7, 20.2),
  it("2318 226 0001", 179.8, 351.7, 60.2),
  it("14.400,00 €", 255.4, 351.7, 47.7),
  it("00000000T", 311.6, 351.7, 43.7),
  it("GALVEZ", 364.7, 376.1, 33.5),
  it("CORTES", 364.7, 363.9, 34.1),
  it("MARCOS", 364.7, 351.7, 30.5),
  it("FACT. 14/2026CENA DE", 425.7, 376.1, 95.3),
  it("MAYORES SANTA FE RE:", 425.7, 363.9, 97.3),
  it("2026-E-RE-5863", 425.7, 351.7, 64.8),
  it("14.400,00 €", 255.4, 336, 47.7),
  it("2.- Dar cuenta en la siguiente Junta de Gobierno Local que se celebre.", 85.2, 297.3, 310.1),
  it("En Santa Fe a fecha de firma electrónica", 179.1, 246.4, 178.2),
  it("DECRETO", 555.3, 370, 77.2),
  it("Número: 2026-1689", 566.3, 371, 79.9),
];

