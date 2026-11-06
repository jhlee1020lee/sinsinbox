const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../apps-script/quote-intake.gs'), 'utf8');
const headers = [
  'submittedAt', 'item', 'size', 'strength', 'quantity', 'print', 'shipping',
  'dueDate', 'company', 'phone', 'email', 'extra', 'sourcePage'
];
const currentFields = {
  item: '택배박스 / 골판지 박스', size: '600x400x400', strength: 'A골', qty: '300',
  print_type: '1도 인쇄', shipping_method: '방문수령', due_text: '다음 주',
  company: '테스트 담당자', phone: '01000000000', email: 'test+quote@example.invalid',
  extra: 'A&B 포장\n두 번째 요청', source_page: 'quote.html', website: ''
};

function formEvent(fields = currentFields) {
  const body = new URLSearchParams(fields).toString();
  return {
    parameter: Object.fromEntries(new URLSearchParams(body)),
    postData: { contents: body, type: 'application/x-www-form-urlencoded;charset=UTF-8' }
  };
}

function makeHarness(options = {}) {
  const rows = (options.rows || [headers]).map(row => [...row]);
  const events = [];
  let exists = options.exists !== false;
  const fail = stage => {
    if (options.fail === stage) throw new Error('Internal account details must not reach the response');
  };
  const sheet = {
    getLastRow: () => rows.length,
    appendRow(row) {
      events.push('append');
      fail('append');
      rows.push(Array.from(row));
    }
  };
  const spreadsheet = {
    getSheetByName(name) {
      assert.equal(name, '견적접수');
      return exists ? sheet : null;
    },
    insertSheet(name) {
      assert.equal(name, '견적접수');
      assert.equal(exists, false);
      events.push('create');
      exists = true;
      return sheet;
    }
  };
  const sandbox = {
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty(key) {
          assert.equal(key, 'QUOTE_SPREADSHEET_ID');
          return options.missingId ? '' : 'test-spreadsheet-id';
        }
      })
    },
    LockService: {
      getScriptLock: () => ({
        waitLock(timeout) {
          assert.ok(timeout > 0);
          events.push('lock');
          fail('lock');
        },
        releaseLock() { events.push('release'); }
      })
    },
    SpreadsheetApp: {
      openById(id) {
        assert.equal(id, 'test-spreadsheet-id');
        events.push('open');
        fail('open');
        return spreadsheet;
      },
      getActiveSpreadsheet() { throw new Error('Web apps must use an explicit spreadsheet ID'); },
      flush() {
        events.push('flush');
        fail('flush');
      }
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput(body) {
        events.push('response');
        return {
          setMimeType(type) {
            assert.equal(type, 'application/json');
            return JSON.parse(body);
          }
        };
      }
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'quote-intake.gs' });
  return { rows, events, submit: event => sandbox.doPost(event) };
}

test('current URL-encoded form preserves every field and existing records', () => {
  const previousRow = ['existing record'];
  const harness = makeHarness({ rows: [headers, previousRow] });
  assert.deepEqual(harness.submit(formEvent()), { ok: true });
  assert.deepEqual(harness.rows.slice(0, 2), [headers, previousRow]);
  assert.equal(harness.rows.length, 3);
  assert.match(harness.rows[2][0], /^\d{4}-\d{2}-\d{2}T.*Z$/);
  assert.deepEqual(harness.rows[2].slice(1), [
    currentFields.item, currentFields.size, currentFields.strength, currentFields.qty,
    currentFields.print_type, currentFields.shipping_method, currentFields.due_text,
    currentFields.company, "'" + currentFields.phone, currentFields.email,
    currentFields.extra, currentFields.source_page
  ]);
  assert.deepEqual(harness.events, ['lock', 'open', 'append', 'flush', 'response', 'release']);
});

for (const type of ['application/json', 'text/plain']) {
  test(`legacy JSON fields remain supported with ${type}`, () => {
    const harness = makeHarness();
    const legacy = {
      item: 'box', size: '600x400x400', strength: 'A', quantity: 300,
      print: 'none', shipping: 'pickup', dueDate: 'next week', company: 'Test',
      phone: '01000000000', email: '', extra: 'legacy request', sourcePage: 'product.html'
    };
    assert.deepEqual(harness.submit({ postData: { type, contents: JSON.stringify(legacy) } }), { ok: true });
    assert.deepEqual(harness.rows[1].slice(1), [
      'box', '600x400x400', 'A', '300', 'none', 'pickup', 'next week',
      'Test', "'01000000000", '', 'legacy request', 'product.html'
    ]);
  });
}

test('general inquiry accepts an empty quantity and omitted optional fields', () => {
  const harness = makeHarness();
  const result = harness.submit(formEvent({
    item: '주문 안내', size: '제작 가능 여부 문의', company: '테스트 담당자', phone: '01000000000'
  }));
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(harness.rows[1].slice(3, 8), ['', '', '', '', '']);
});

test('modern field names take precedence, including an explicitly empty quantity', () => {
  const harness = makeHarness();
  const payload = { ...currentFields, qty: '', quantity: '999', sourcePage: 'old.html' };
  assert.equal(harness.submit({ postData: { type: 'application/json', contents: JSON.stringify(payload) } }).ok, true);
  assert.equal(harness.rows[1][4], '');
  assert.equal(harness.rows[1][12], 'quote.html');
});

test('missing required fields and the honeypot are rejected before accessing Sheets', () => {
  for (const key of ['item', 'size', 'company', 'phone', 'website']) {
    const harness = makeHarness();
    const fields = { ...currentFields, [key]: key === 'website' ? 'https://spam.invalid' : '  ' };
    const result = harness.submit(formEvent(fields));
    assert.equal(result.ok, false, key);
    assert.equal(typeof result.message, 'string');
    assert.deepEqual(harness.rows, [headers]);
    assert.deepEqual(harness.events, ['response']);
  }
});

test('malformed payloads produce a JSON error without creating a sheet', () => {
  const cases = [
    undefined, {},
    { postData: { type: 'application/json', contents: '{broken' } },
    { postData: { type: 'application/json', contents: 'null' } },
    { postData: { type: 'application/json', contents: '[]' } },
    { parameter: { ...currentFields, company: { name: 'unexpected object' } } }
  ];
  for (const event of cases) {
    const harness = makeHarness({ exists: false, rows: [] });
    const result = harness.submit(event);
    assert.equal(result.ok, false);
    assert.equal(typeof result.message, 'string');
    assert.deepEqual(harness.rows, []);
    assert.deepEqual(harness.events, ['response']);
  }
});

test('a new or empty sheet receives one header and keeps the original column order', () => {
  for (const exists of [false, true]) {
    const harness = makeHarness({ exists, rows: [] });
    assert.equal(harness.submit(formEvent()).ok, true);
    assert.equal(harness.submit(formEvent()).ok, true);
    assert.equal(harness.rows.length, 3);
    assert.deepEqual(harness.rows[0], headers);
    assert.equal(harness.events.filter(event => event === 'create').length, exists ? 0 : 1);
  }
});

test('user-entered formulas are escaped before storage and phone digits remain text', () => {
  const harness = makeHarness();
  const fields = { ...currentFields, company: '  =1+1', extra: '=SUM(1,2)', size: '=2+2' };
  assert.equal(harness.submit(formEvent(fields)).ok, true);
  const row = harness.rows[1];
  assert.equal(row[2], "'=2+2");
  assert.equal(row[8], "'=1+1");
  assert.equal(row[9], "'01000000000");
  assert.equal(row[11], "'=SUM(1,2)");
  assert.ok(row.every(value => !value.startsWith('=')));
});

test('storage or locking failures never return success or expose internal errors', () => {
  for (const fail of ['lock', 'open', 'append', 'flush']) {
    const harness = makeHarness({ fail });
    const result = harness.submit(formEvent());
    assert.equal(result.ok, false, fail);
    assert.equal(typeof result.message, 'string');
    assert.doesNotMatch(result.message, /Internal account details/);
    assert.equal(harness.events.includes('release'), fail !== 'lock');
    if (fail !== 'flush') assert.deepEqual(harness.rows, [headers]);
  }
});

test('a missing spreadsheet configuration cannot report a successful submission', () => {
  const harness = makeHarness({ missingId: true });
  assert.equal(harness.submit(formEvent()).ok, false);
  assert.deepEqual(harness.events, ['response']);
  assert.deepEqual(harness.rows, [headers]);
});
