function doPost(e) {
  var row;

  try {
    var payload = readQuotePayload_(e);
    if (readQuoteField_(payload, 'website')) {
      return quoteResponse_({ ok: false, message: '전송에 실패했습니다.' });
    }

    row = [
      new Date().toISOString(),
      readQuoteField_(payload, 'item'),
      readQuoteField_(payload, 'size'),
      readQuoteField_(payload, 'strength'),
      readQuoteField_(payload, 'qty', 'quantity'),
      readQuoteField_(payload, 'print_type', 'print'),
      readQuoteField_(payload, 'shipping_method', 'shipping'),
      readQuoteField_(payload, 'due_text', 'dueDate'),
      readQuoteField_(payload, 'company'),
      readQuoteField_(payload, 'phone'),
      readQuoteField_(payload, 'email'),
      readQuoteField_(payload, 'extra'),
      readQuoteField_(payload, 'source_page', 'sourcePage')
    ];

    // 상담 문의는 수량 없이 접수할 수 있습니다.
    if (!row[1] || !row[2] || !row[8] || !row[9]) {
      return quoteResponse_({ ok: false, message: '품목, 문의 내용, 상호 또는 담당자명, 연락처를 확인해 주세요.' });
    }
  } catch (error) {
    return quoteResponse_({ ok: false, message: '입력한 내용을 확인한 뒤 다시 시도해 주세요.' });
  }

  var lock;
  var locked = false;

  try {
    var spreadsheetId = PropertiesService.getScriptProperties().getProperty('QUOTE_SPREADSHEET_ID');
    if (!spreadsheetId || !spreadsheetId.trim()) {
      throw new Error('Missing quote spreadsheet ID');
    }

    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    locked = true;

    var spreadsheet = SpreadsheetApp.openById(spreadsheetId.trim());
    var sheet = spreadsheet.getSheetByName('견적접수') || spreadsheet.insertSheet('견적접수');

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'submittedAt', 'item', 'size', 'strength', 'quantity', 'print', 'shipping',
        'dueDate', 'company', 'phone', 'email', 'extra', 'sourcePage'
      ]);
    }

    sheet.appendRow(row.map(function (value, index) {
      // 수식 실행을 막고 연락처의 앞자리 0을 보존합니다.
      return value && (value.charAt(0) === '=' || index === 9) ? "'" + value : value;
    }));
    SpreadsheetApp.flush();

    return quoteResponse_({ ok: true });
  } catch (error) {
    return quoteResponse_({ ok: false, message: '접수 여부를 확인하지 못했습니다. 전화 또는 이메일로 접수 여부를 확인해 주세요.' });
  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}

function readQuotePayload_(e) {
  if (!e) {
    throw new Error('Missing request');
  }

  var contents = e.postData && e.postData.contents ? e.postData.contents.trim() : '';
  var contentType = e.postData && e.postData.type ? e.postData.type.toLowerCase() : '';
  var payload = contentType.indexOf('application/json') === 0 || contents.charAt(0) === '{'
    ? JSON.parse(contents)
    : e.parameter;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid request');
  }

  return payload;
}

function readQuoteField_(payload, key, legacyKey) {
  var value = Object.prototype.hasOwnProperty.call(payload, key)
    ? payload[key]
    : legacyKey ? payload[legacyKey] : '';

  if (value == null) {
    return '';
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error('Invalid field');
  }

  return String(value).trim();
}

function quoteResponse_(result) {
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
