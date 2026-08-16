'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ingestUkPartners, ingestUkGoods, ingestUkBalance, planBalanceChunks, isImportFlow, isExportFlow } = require('./ukIngest');
const country = require('./countries/uk.config');

function withFixtureMode(fn) {
  return async (t) => {
    const original = process.env.TRADE_USE_FIXTURE;
    process.env.TRADE_USE_FIXTURE = '1';
    t.after(() => {
      if (original === undefined) delete process.env.TRADE_USE_FIXTURE;
      else process.env.TRADE_USE_FIXTURE = original;
    });
    await fn();
  };
}

test('planBalanceChunks splits 2000-2025 into the 5 windows the committed fixtures cover', () => {
  const chunks = planBalanceChunks(2000, 2025);
  assert.deepEqual(chunks, [
    { start: 2000, end: 2004 },
    { start: 2005, end: 2009 },
    { start: 2010, end: 2014 },
    { start: 2015, end: 2019 },
    { start: 2020, end: 2025 }
  ]);
});

test('isImportFlow/isExportFlow classify OTS FlowTypeId correctly (1/3=import, 2/4=export)', () => {
  assert.equal(isImportFlow(1), true);
  assert.equal(isImportFlow(3), true);
  assert.equal(isImportFlow(2), false);
  assert.equal(isExportFlow(2), true);
  assert.equal(isExportFlow(4), true);
  assert.equal(isExportFlow(1), false);
});

test(
  'ingestUkPartners replays the real 2025 fixtures and reproduces the already-verified top partners',
  withFixtureMode(async () => {
    const { rows, labels } = await ingestUkPartners(country);

    const totImport = rows.find((r) => r.Handelspartner === 'TOT' && r.ContentsCode === 'IMPORT');
    const totExport = rows.find((r) => r.Handelspartner === 'TOT' && r.ContentsCode === 'EXPORT');
    assert.ok(totImport);
    assert.ok(totExport);
    // Independent all-country total for 2025 (FlowType 1+3 imports), verified
    // against the live API's own $apply=groupby((FlowTypeId),...) query:
    // 327,870,927,952 + 395,137,398,909 = 723,008,326,861 raw GBP -> thousands.
    assert.equal(totImport.value, 723008327);
    assert.equal(totExport.value, 426241692);

    // UK itself and every known pseudo/adjustment country id must never
    // appear as a partner row.
    assert.equal(rows.some((r) => r.Handelspartner === 'GB'), false);

    const us = rows.find((r) => r.Handelspartner === 'US' && r.ContentsCode === 'IMPORT');
    const de = rows.find((r) => r.Handelspartner === 'DE' && r.ContentsCode === 'IMPORT');
    assert.ok(us);
    assert.ok(de);
    assert.equal(us.value, 75932081); // 75,932,081,393 raw GBP -> thousands, rounded
    assert.equal(de.value, 74665633);
    assert.equal(labels.Handelspartner.US, 'United States');
    assert.equal(labels.Handelspartner.DE, 'Germany');
  })
);

test(
  'ingestUkGoods replays the real 2025 fixtures and rolls ~3,600 SITC codes up to the 10 top-level sections',
  withFixtureMode(async () => {
    const { rows, labels } = await ingestUkGoods(country);

    const sections = new Set(rows.map((r) => r.VarugruppSITCrev3));
    assert.deepEqual([...sections].sort(), ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    assert.equal(rows.length, 20); // 10 sections x import/export

    const machinery = rows.find((r) => r.VarugruppSITCrev3 === '7' && r.ContentsCode === 'IMPORT');
    assert.equal(machinery.value, 228895894);
    assert.equal(labels.VarugruppSITCrev3['7'], 'Machinery & transport equipment');
  })
);

test(
  'ingestUkBalance replays the real 2000-2025 fixtures and produces one import/export pair per year',
  withFixtureMode(async () => {
    const { rows } = await ingestUkBalance(country);

    const years = new Set(rows.map((r) => r.Tid));
    assert.equal(years.size, 26); // 2000..2025 inclusive
    assert.ok(years.has('2000'));
    assert.ok(years.has('2025'));

    const import2025 = rows.find((r) => r.Tid === '2025' && r.ImportExport === 'ITOT');
    const export2025 = rows.find((r) => r.Tid === '2025' && r.ImportExport === 'ETOT');
    assert.ok(import2025);
    assert.ok(export2025);
    // Balance rows are in *millions* GBP (see ukIngest.js header) so
    // analysis/balance.js's own x1000 conversion yields thousands, matching
    // the independent hero total above (723,008,327 thousand).
    assert.equal(import2025.value, 723008);
    assert.equal(export2025.value, 426242);
  })
);
