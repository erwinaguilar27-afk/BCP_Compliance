// PTO & BCP Compliance Calendar - Google Apps Script backend
// Paste into Extensions > Apps Script of a Google Sheet, then deploy as a web app
// (Execute as: Me, Who has access: Anyone). Everyone can read; only people with an admin key can add, edit or delete.
const SHEET = 'PTO';
const HEAD = ['id', 'name', 'type', 'start', 'end', 'bcpSent', 'bcpDiscussion', 'note'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) {
    s = ss.insertSheet(SHEET);
    s.appendRow(HEAD);
    s.getRange('A:H').setNumberFormat('@STRING@'); // keep dates as text
    s.setFrozenRows(1);
  }
  return s;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function ids_(s) {
  return s.getRange(1, 1, s.getLastRow(), 1).getDisplayValues().map(r => r[0]);
}
function rows_(s) {
  return s.getDataRange().getDisplayValues().slice(1).filter(r => r[0]).map(r => ({
    id: r[0], name: r[1], type: r[2], start: r[3], end: r[4],
    bcpSent: r[5] === 'TRUE', bcpDiscussion: r[6] === 'TRUE', note: r[7]
  }));
}
// Admin keys live in Project Settings > Script properties > ADMIN_KEYS (comma-separated),
// never in this file, so they are not exposed if the repo is public.
function isAdmin_(k) {
  const v = PropertiesService.getScriptProperties().getProperty('ADMIN_KEYS') || '';
  return !!k && v.split(',').map(x => x.trim()).filter(Boolean).indexOf(String(k)) > -1;
}
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'auth') return out_(isAdmin_(p.key) ? { ok: true } : { ok: false, error: 'Not authorized' });
  if ((p.action === 'save' || p.action === 'delete') && !isAdmin_(p.key)) return out_({ ok: false, error: 'Not authorized' });
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const s = sheet_();
    if (p.action === 'save') {
      const d = JSON.parse(p.data);
      if (!d.id || !d.name || !DATE_RE.test(d.start) || !DATE_RE.test(d.end)) throw new Error('Invalid entry');
      const row = [String(d.id).slice(0, 40), String(d.name).slice(0, 100),
        d.type === 'Holiday Switch' ? 'Holiday Switch' : 'PTO', d.start, d.end,
        d.bcpSent ? 'TRUE' : 'FALSE', d.bcpDiscussion ? 'TRUE' : 'FALSE', String(d.note || '').slice(0, 500)];
      const i = ids_(s).indexOf(row[0]);
      const r = i > 0 ? i + 1 : s.getLastRow() + 1;
      s.getRange(r, 1, 1, HEAD.length).setNumberFormat('@STRING@').setValues([row]);
    } else if (p.action === 'delete') {
      const i = ids_(s).indexOf(p.id);
      if (i > 0) s.deleteRow(i + 1);
    }
    return out_({ ok: true, entries: rows_(s) });
  } catch (err) {
    return out_({ ok: false, error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
