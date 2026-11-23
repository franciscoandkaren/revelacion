/**
 * Invitación Baby Shower / Revelación: Google Sheets como registro de votos.
 * Google Apps Script, sin servidor ni base de datos propios.
 *
 * Esta versión ya usa la hoja facilitada por los organizadores.
 * 1) En ESA hoja: Extensiones > Apps Script y pega este archivo completo.
 * 2) Ejecuta prepararHoja() una vez y autoriza.
 * 3) Implementar > Nueva implementación > Aplicación web;
 *    Ejecutar como: Yo; acceso: Cualquier persona.
 * 4) Copia la URL /exec generada al config.js del sitio.
 *
 * Se admiten solo predicciones Niño/Niña. Un voto por identificador
 * de navegador, que puede actualizar su selección sin crear otra fila.
 * La hoja contiene nombre, opción y fecha, solo visible a su dueño.
 * No ofrece resultados al público.
 *
 * Advertencia: un endpoint público no impide fraudes intencionales;
 * es apropiado para una votación informal de invitados.
 */
const SPREADSHEET_ID = '1z5aRWKcbPhElHbH5veRp9y9qfASS-pMsEekhc0mzHok';
const VOTES_SHEET = 'Votos';
const SUMMARY_SHEET = 'Resumen';

function libro_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/** Ejecutar una sola vez desde el editor para preparar el libro y autorizar permisos. */
function prepararHoja() {
  const book = libro_();
  let votes = book.getSheetByName(VOTES_SHEET);
  if (!votes) votes = book.insertSheet(VOTES_SHEET);
  const headings = ['Fecha de voto', 'Invitado', 'Predicción', 'Identificador de navegador', 'Último envío'];
  const oldHeadings = votes.getRange(1, 1, 1, headings.length).getValues()[0];
  const hasExistingHeader = oldHeadings.some(value => String(value).trim() !== '');
  if (hasExistingHeader && oldHeadings.some((value, i) => String(value).trim() !== headings[i])) {
    throw new Error('La pestaña Votos ya tiene columnas diferentes. No se modificó para proteger tus datos.');
  }
  votes.getRange(1, 1, 1, headings.length).setValues([headings]);
  votes.getRange(1, 1, 1, headings.length)
    .setBackground('#dce8d7').setFontColor('#344339').setFontWeight('bold');
  votes.setFrozenRows(1);
  votes.setColumnWidth(1, 170);
  votes.setColumnWidth(2, 230);
  votes.setColumnWidth(3, 120);
  votes.setColumnWidth(4, 280);
  votes.setColumnWidth(5, 280);
  votes.getRange('A2:A').setNumberFormat('dd/MM/yyyy HH:mm');
  votes.getRange('B2:E').setNumberFormat('@');

  let summary = book.getSheetByName(SUMMARY_SHEET);
  if (!summary) summary = book.insertSheet(SUMMARY_SHEET);
  const existingSummaryHeadings = summary.getRange('A1:B1').getValues()[0];
  if (existingSummaryHeadings.some(value => String(value).trim() !== '') &&
      (String(existingSummaryHeadings[0]).trim() !== 'Predicción' ||
       String(existingSummaryHeadings[1]).trim() !== 'Cantidad')) {
    throw new Error('La pestaña Resumen contiene otro formato. No se sobrescribió.');
  }
  summary.getRange('A1:B1').setValues([['Predicción', 'Cantidad']]);
  summary.getRange('A2:A4').setValues([['Niño'], ['Niña'], ['Total']]);
  summary.getRange('B2').setFormula('=COUNTIF(Votos!C2:C,"Niño")');
  summary.getRange('B3').setFormula('=COUNTIF(Votos!C2:C,"Niña")');
  summary.getRange('B4').setFormula('=SUM(B2:B3)');
  summary.getRange('A1:B1').setBackground('#dce8d7').setFontWeight('bold');
  summary.setColumnWidth(1, 190);
  summary.setColumnWidth(2, 145);
  summary.setFrozenRows(1);
  SpreadsheetApp.flush();
}

function cleanName_(raw) {
  const name = String(raw || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 60 || /[\x00-\x1f\x7f]/.test(name)) throw new Error('Nombre no válido');
  // Evita que nombres ingresados se ejecuten como fórmulas de Google Sheets.
  return /^[=+\-@]/.test(name) ? "'" + name : name;
}
function validateId_(raw) {
  const id = String(raw || '');
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(id)) throw new Error('Identificador no válido');
  return id;
}
function findVoteRow_(sheet, voteId) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const ids = sheet.getRange(2, 4, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === voteId) return i + 2;
  }
  return 0;
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** POST: recibe un voto y guarda o actualiza una sola fila. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const p = (e && e.parameter) || {};
    const voteId = validateId_(p.voteId);
    const submissionId = validateId_(p.submissionId);
    const guestName = cleanName_(p.guestName);
    const prediction = String(p.prediction || '');
    if (prediction !== 'Niño' && prediction !== 'Niña') throw new Error('Predicción inválida');
    lock.waitLock(15000);
    const votes = libro_().getSheetByName(VOTES_SHEET);
    if (!votes) throw new Error('Debes ejecutar prepararHoja primero');
    const row = findVoteRow_(votes, voteId);
    if (row) {
      // La fecha se actualiza al corregir un voto, sin duplicarlo.
      votes.getRange(row, 1, 1, 5).setValues([[new Date(), guestName, prediction, voteId, submissionId]]);
    } else {
      votes.appendRow([new Date(), guestName, prediction, voteId, submissionId]);
    }
    SpreadsheetApp.flush();
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'No se pudo guardar el voto' });
  } finally {
    try { lock.releaseLock(); } catch (_) { /* lock no adquirido */ }
  }
}

/** GET de solo lectura: confirmar que un envío específico quedó persistido.
 *  Responde SOLO ok/saved; nunca devuelve nombres, votos ni resultados.
 *  Usamos JSONP para consultar desde GitHub Pages sin CORS.
 */
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const callback = String(p.callback || '');
    if (!/^_checkVote_[A-Za-z0-9_]{1,24}$/.test(callback)) {
      return json_({ ok: false, saved: false });
    }
    const voteId = validateId_(p.voteId);
    const submissionId = validateId_(p.submissionId);
    const votes = libro_().getSheetByName(VOTES_SHEET);
    const row = votes ? findVoteRow_(votes, voteId) : 0;
    const saved = Boolean(row && String(votes.getRange(row, 5).getValue()) === submissionId);
    const payload = JSON.stringify({ ok: true, saved: saved });
    return ContentService.createTextOutput(callback + '(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    console.error(err);
    return json_({ ok: false, saved: false });
  }
}
