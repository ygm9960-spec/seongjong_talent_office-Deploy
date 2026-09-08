/**
 * 성종의 인재 선발소 v10.4 - Google Sheets 명예의 전당
 *
 * 사용 순서
 * 1) 빈 Google Sheet를 만든다.
 * 2) 확장 프로그램 > Apps Script에서 이 파일 전체를 붙여 넣는다.
 * 3) setup()을 한 번 실행하고 권한을 허용한다.
 * 4) 배포 > 새 배포 > 웹 앱
 *    - 실행 사용자: 나
 *    - 액세스 권한: 모든 사용자
 * 5) 생성된 /exec URL을 웹앱의 config.js에 붙여 넣는다.
 */

const SHEET_NAME = '명예의전당_기록';
const HEADERS = [
  '기록시각', '학번+이름', '점수', '정확도', '최고콤보', '남은시간',
  '심사인원', '심사번호', '특수심사성공', '돌발이벤트'
];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Google Sheet에서 확장 프로그램 > Apps Script로 열어 실행해 주세요.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (current.join('|') !== HEADERS.join('|')) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, HEADERS.length);
  return '설정 완료';
}

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'leaderboard');
  try {
    if (action === 'ping') return output_({ ok: true, service: 'seongjong-leaderboard' }, e);
    if (action === 'leaderboard') {
      const requested = Number(e.parameter.limit || 20);
      const limit = Math.max(1, Math.min(20, requested));
      return output_({ ok: true, rankings: getLeaderboard_(limit) }, e);
    }
    return output_({ ok: false, error: 'unknown_action' }, e);
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message || err) }, e);
  }
}

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (String(p.action || '') !== 'submit') return json_({ ok: false, error: 'unknown_action' });

    const name = cleanText_(p.name, 24);
    if (!/^\d{4}\s+\S+/.test(name)) return json_({ ok: false, error: 'invalid_name' });

    const score = clampInt_(p.score, 0, 9999999);
    const accuracy = clampInt_(p.accuracy, 0, 100);
    const combo = clampInt_(p.combo, 0, 1000);
    const remaining = clampInt_(p.remaining, 0, 3600);
    const reviewed = clampInt_(p.reviewed, 0, 100);
    const seed = cleanText_(p.seed, 20);
    const specialSuccess = clampInt_(p.specialSuccess, 0, 100);
    const suddenEvents = clampInt_(p.suddenEvents, 0, 100);

    const sheet = sheet_();
    sheet.appendRow([
      new Date(), name, score, accuracy, combo, remaining,
      reviewed, seed, specialSuccess, suddenEvents
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function getLeaderboard_(limit) {
  const sheet = sheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const best = {};

  rows.forEach(function(r) {
    const entry = {
      date: r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ''),
      name: String(r[1] || '').trim(),
      score: Number(r[2] || 0),
      accuracy: Number(r[3] || 0),
      combo: Number(r[4] || 0),
      remaining: Number(r[5] || 0),
      reviewed: Number(r[6] || 0),
      seed: String(r[7] || '')
    };
    if (!entry.name) return;
    const old = best[entry.name];
    if (!old || compare_(entry, old) < 0) best[entry.name] = entry;
  });

  return Object.keys(best)
    .map(function(k) { return best[k]; })
    .sort(compare_)
    .slice(0, limit);
}

function compare_(a, b) {
  return (b.score - a.score) ||
    (b.accuracy - a.accuracy) ||
    (b.combo - a.combo) ||
    (b.remaining - a.remaining) ||
    String(a.date).localeCompare(String(b.date));
}

function sheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('setup()을 먼저 실행해 주세요.');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function cleanText_(value, max) {
  return String(value == null ? '' : value).replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function clampInt_(value, min, max) {
  const n = Math.round(Number(value || 0));
  return Math.max(min, Math.min(max, isFinite(n) ? n : min));
}

function output_(obj, e) {
  const callback = e && e.parameter && String(e.parameter.callback || '');
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(obj);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
