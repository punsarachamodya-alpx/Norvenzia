'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ingestPartners, ingestGoods, ingestBalance, sumCompleteYears, stripValidityPrefix, TOTAL_PARTNER_CODE } = require('./tulliIngest');
const country = require('./countries/finland.config');

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

test('stripValidityPrefix removes Uljas\' "(YYYY--.)" validity-period prefix, keeping the real name', () => {
  assert.equal(stripValidityPrefix('(2002--.) Germany'), 'Germany');
  assert.equal(stripValidityPrefix('(2004--2005) Serbia and Montenegro'), 'Serbia and Montenegro');
  assert.equal(stripValidityPrefix('(2002--.) ALL GROUPS'), 'ALL GROUPS');
});

test('sumCompleteYears only keeps years with all 12 months present, within the given range', () => {
  const rows = [
    { keys: ['202401'], vals: [10] },
    { keys: ['202402'], vals: [20] },
    { keys: ['202501'], vals: [5] } // 2025: only 1 of 12 months -- must be dropped
  ];
  // Fill out 2024 to a complete 12 months.
  for (let m = 3; m <= 12; m++) rows.push({ keys: [`2024${String(m).padStart(2, '0')}`], vals: [1] });

  const totals = sumCompleteYears(rows, 2024, 2025);
  assert.equal(totals.has(2025), false);
  assert.equal(totals.get(2024), 10 + 20 + 10); // 10 remaining months at 1 each
});

test('sumCompleteYears excludes years outside the requested firstYear..lastYear range', () => {
  const rows = [{ keys: ['200001'], vals: [999] }];
  const totals = sumCompleteYears(rows, 2002, 2024);
  assert.equal(totals.size, 0);
});

test(
  'ingestPartners replays the real 2024 fixtures and reproduces the already-verified top partners',
  withFixtureMode(async () => {
    const { rows, labels } = await ingestPartners(country);

    assert.equal(rows.length, 508); // 254 countries x import/export

    const totImport = rows.find((r) => r.Handelspartner === TOTAL_PARTNER_CODE && r.ContentsCode === 'IMPORT');
    const totExport = rows.find((r) => r.Handelspartner === TOTAL_PARTNER_CODE && r.ContentsCode === 'EXPORT');
    assert.ok(totImport);
    assert.ok(totExport);
    // Uljas' own "AA" (All countries together) aggregate for 2024, verified
    // against the live API: 74,844,022,539 / 72,126,011,126 raw EUR -> thousands.
    assert.equal(totImport.value, 74844023);
    assert.equal(totExport.value, 72126011);

    // Uljas' own aggregate-country code must never leak through unmapped.
    assert.equal(rows.some((r) => r.Handelspartner === 'AA'), false);

    const de = rows.find((r) => r.Handelspartner === 'DE' && r.ContentsCode === 'IMPORT');
    const se = rows.find((r) => r.Handelspartner === 'SE' && r.ContentsCode === 'IMPORT');
    assert.ok(de);
    assert.ok(se);
    assert.equal(de.value, 10437425); // 10,437,424,524 raw EUR -> thousands, rounded
    assert.equal(labels.Handelspartner.DE, 'Germany');
    assert.equal(labels.Handelspartner.SE, 'Sweden');
    assert.equal(labels.Handelspartner[TOTAL_PARTNER_CODE], 'All countries together');
  })
);

test(
  'ingestGoods replays the real 2024 fixtures and excludes the "0-9" ALL GROUPS aggregate row',
  withFixtureMode(async () => {
    const { rows, labels } = await ingestGoods(country);

    assert.equal(rows.length, 20); // 10 SITC1 sections x import/export
    assert.equal(rows.some((r) => r.VarugruppSITCrev3 === '0-9'), false);

    const sections = new Set(rows.map((r) => r.VarugruppSITCrev3));
    assert.deepEqual([...sections].sort(), ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

    const machinery = rows.find((r) => r.VarugruppSITCrev3 === '7' && r.ContentsCode === 'IMPORT');
    assert.equal(machinery.value, 25849429); // 25,849,429,411 raw EUR -> thousands, rounded
    assert.equal(labels.VarugruppSITCrev3['7'], 'Machinery,transport equipment');
    assert.equal(labels.VarugruppSITCrev3['0-9'], undefined);
  })
);

test(
  'ingestBalance replays the real monthly fixtures and produces one complete-year import/export pair per year 2002-2024',
  withFixtureMode(async () => {
    const { rows } = await ingestBalance(country);

    const years = new Set(rows.map((r) => r.Tid));
    assert.equal(years.size, 23); // 2002..2024 inclusive
    assert.ok(years.has('2002'));
    assert.ok(years.has('2024'));
    // The committed fixtures run through mid-2026 -- partial 2025/2026 years
    // must never appear as if they were complete calendar years.
    assert.equal(years.has('2025'), false);
    assert.equal(years.has('2026'), false);

    const import2024 = rows.find((r) => r.Tid === '2024' && r.ImportExport === 'ITOT');
    const export2024 = rows.find((r) => r.Tid === '2024' && r.ImportExport === 'ETOT');
    assert.ok(import2024);
    assert.ok(export2024);
    // Balance rows are in *millions* EUR (see tulliIngest.js header) so
    // analysis/balance.js's own x1000 conversion yields thousands, matching
    // ingestPartners' independent hero total above (74,844,023 thousand).
    assert.equal(import2024.value, 74844);
    assert.equal(export2024.value, 72126);
  })
);
