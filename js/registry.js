/**
 * registry.js — Registro acumulado local.
 *
 * Guarda las FICHAS (datos estructurados ya anonimizados), nunca el texto
 * íntegro del decreto ni el mapa de datos personales. Vive en IndexedDB,
 * dentro del navegador del usuario. No hay servidor, no hay cuenta, no hay
 * sincronización: si se borran los datos del navegador, el registro desaparece.
 *
 * Existe por una razón: el patrón que sirve para fiscalizar no está en un
 * decreto, está en la serie. Un contrato menor es un trámite; el mismo contrato
 * menor doce meses seguidos es otra cosa.
 */

const DB_NOMBRE = 'fiscaliza';
const DB_VERSION = 1;
const ALMACEN = 'fichas';

let dbPromesa = null;

function abrir() {
  if (dbPromesa) return dbPromesa;
  dbPromesa = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOMBRE, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ALMACEN)) {
        const store = db.createObjectStore(ALMACEN, { keyPath: 'clave' });
        store.createIndex('fecha', 'fecha');
        store.createIndex('tipo', 'tipo');
        store.createIndex('mandato', 'mandatoId');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('No se ha podido abrir el registro local. ¿Estás en modo incógnito?'));
  });
  return dbPromesa;
}

function tx(modo) {
  return abrir().then(db => db.transaction(ALMACEN, modo).objectStore(ALMACEN));
}

/**
 * Clave estable para evitar duplicados si se vuelve a subir el mismo decreto.
 * Prioridad: nº de decreto > nº de expediente > nombre de archivo.
 */
function claveDe(ficha) {
  return `${ficha.decreto || ficha.expediente || ficha.archivo || 'sin-id'}`
    .toUpperCase().replace(/\s+/g, '');
}

/**
 * Lo que se persiste. Deliberadamente reducido: sin texto completo,
 * sin mapa de anonimización, sin nombres de particulares.
 */
function paraGuardar(ficha) {
  return {
    clave: claveDe(ficha),
    archivo: ficha.archivo,
    decreto: ficha.decreto,
    expediente: ficha.expediente,
    objeto: ficha.objeto,
    fecha: ficha.fecha,
    tipo: ficha.tipo,
    tipoNombre: ficha.tipoNombre,
    firmante: ficha.firmante,
    mandato: ficha.mandato,
    mandatoId: ficha.mandato?.id || null,
    importeTotal: ficha.importeTotal,
    aplicaciones: ficha.aplicaciones,
    proveedores: ficha.proveedores,
    // El desglose por tercero es lo que permite contar repeticiones entre
    // decretos. Sin él sólo se sabe que un proveedor "aparece", no cuántas
    // facturas ni por cuánto.
    porTercero: (ficha.porTercero || []).map(t => ({
      clave: t.clave, nombre: t.nombre, cif: t.cif,
      nFacturas: t.nFacturas, importe: t.importe, aplicaciones: t.aplicaciones,
    })),
    nFacturas: ficha.nFacturas || 0,
    sumaLineas: ficha.sumaLineas || 0,
    reparo: ficha.reparo,
    sentencias: ficha.sentencias,
    prorroga: ficha.prorroga,
    vinculacionJuridica: ficha.vinculacionJuridica,
    guardadoEn: new Date().toISOString(),
  };
}

export async function guardar(ficha) {
  const store = await tx('readwrite');
  return new Promise((resolve, reject) => {
    const req = store.put(paraGuardar(ficha));
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function guardarVarias(fichas) {
  for (const f of fichas) await guardar(f);
  return fichas.length;
}

export async function listar() {
  const store = await tx('readonly');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function borrarTodo() {
  const store = await tx('readwrite');
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function borrar(clave) {
  const store = await tx('readwrite');
  return new Promise((resolve, reject) => {
    const req = store.delete(clave);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/** Estadísticas para la cabecera del registro. */
export async function resumen() {
  const todas = await listar();
  const conReparo = todas.filter(f => f.reparo?.hayReparo);
  const importe = todas.reduce((a, f) => a + (f.importeTotal || 0), 0);
  const facturas = todas.reduce((a, f) => a + (f.nFacturas || 0), 0);
  const porMandato = {};
  for (const f of todas) {
    const k = f.mandato?.etiqueta || 'Sin determinar';
    porMandato[k] = (porMandato[k] || 0) + 1;
  }
  const fechas = todas.map(f => f.fecha).filter(Boolean).sort();
  return {
    total: todas.length,
    conReparo: conReparo.length,
    facturas,
    importeAcumulado: importe,
    porMandato,
    desde: fechas[0] || null,
    hasta: fechas[fechas.length - 1] || null,
  };
}

/** Copia de seguridad del registro, para llevarlo a otro equipo. */
export async function exportarJson() {
  const todas = await listar();
  return JSON.stringify(
    { version: DB_VERSION, exportado: new Date().toISOString(), fichas: todas },
    null, 2
  );
}

export async function importarJson(texto) {
  const datos = JSON.parse(texto);
  if (!Array.isArray(datos.fichas)) throw new Error('El archivo no tiene el formato esperado.');
  const store = await tx('readwrite');
  await Promise.all(datos.fichas.map(f => new Promise((res, rej) => {
    const req = store.put(f);
    req.onsuccess = res;
    req.onerror = () => rej(req.error);
  })));
  return datos.fichas.length;
}
