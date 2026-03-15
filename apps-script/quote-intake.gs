function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('견적접수');

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('견적접수');
    sheet.appendRow([
      'submittedAt',
      'item',
      'size',
      'strength',
      'quantity',
      'print',
      'shipping',
      'dueDate',
      'company',
      'phone',
      'email',
      'extra',
      'sourcePage'
    ]);
  }

  var payload = {};

  if (e.postData && e.postData.contents) {
    payload = JSON.parse(e.postData.contents);
  }

  sheet.appendRow([
    payload.submittedAt || new Date().toISOString(),
    payload.item || '',
    payload.size || '',
    payload.strength || '',
    payload.quantity || '',
    payload.print || '',
    payload.shipping || '',
    payload.dueDate || '',
    payload.company || '',
    payload.phone || '',
    payload.email || '',
    payload.extra || '',
    payload.sourcePage || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
