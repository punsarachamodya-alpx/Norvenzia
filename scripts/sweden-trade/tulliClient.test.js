'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDataUrl, readFixture, useFixtures, fetchUljasData } = require('./tulliClient');

test('buildDataUrl percent-encodes a normal query but leaves a leading "=" selection operator literal', () => {
  const url = buildDataUrl({
    lang: 'en',
    atype: 'data',
    konv: 'json',
    ifile: '/DATABASE/01 ULKOMAANKAUPPATILASTOT/02 SITC/ULJAS_SITC2',
    'Classification of Products SITC1': '0-9',
    Country: '=ALL',
    Year: '2024',
    Flow: '1'
  });
  assert.match(url, /^https:\/\/uljas\.tulli\.fi\/uljas\/graph\/api\.aspx\?/);
  // The ifile path's spaces and slashes are percent-encoded normally.
  assert.match(url, /ifile=%2FDATABASE%2F01%20ULKOMAANKAUPPATILASTOT%2F02%20SITC%2FULJAS_SITC2/);
  assert.match(url, /Classification%20of%20Products%20SITC1=0-9/);
  // Country's "=ALL" selection operator keeps its leading "=" un-encoded --
  // encoding it to %3D makes Uljas silently resolve the selection to empty
  // (verified against the live API, see tulliClient.js's module comment).
  assert.match(url, /Country==ALL/);
  assert.doesNotMatch(url, /Country=%3DALL/);
});

test('buildDataUrl never encodes the leading "=" for any selection operator (=FIRST, =LAST, etc.)', () => {
  const url = buildDataUrl({ 'Time period': '=FIRST*;12' });
  assert.match(url, /Time%20period==FIRST/);
});

test('readFixture loads and parses a real committed fixture, stripping the UTF-8 BOM Uljas responses carry', () => {
  const fixture = readFixture('fi/sitc2-partners-2024-import-raw.json');
  assert.ok(Array.isArray(fixture));
  assert.equal(fixture.length, 254);
  const totalRow = fixture.find((r) => r.keys[1] === 'AA');
  assert.ok(totalRow);
  assert.equal(totalRow.vals[0], 74844022539);
});

test('useFixtures reflects the TRADE_USE_FIXTURE env var', () => {
  const original = process.env.TRADE_USE_FIXTURE;
  try {
    delete process.env.TRADE_USE_FIXTURE;
    assert.equal(useFixtures(), false);
    process.env.TRADE_USE_FIXTURE = '1';
    assert.equal(useFixtures(), true);
  } finally {
    if (original === undefined) delete process.env.TRADE_USE_FIXTURE;
    else process.env.TRADE_USE_FIXTURE = original;
  }
});

test('fetchUljasData replays from a fixture in fixture mode without a network call', async () => {
  const original = process.env.TRADE_USE_FIXTURE;
  process.env.TRADE_USE_FIXTURE = '1';
  try {
    const data = await fetchUljasData(
      { atype: 'data' },
      { fixtureName: 'fi/kauppatase-monthly-import-raw.json' }
    );
    assert.ok(Array.isArray(data));
    assert.equal(data.length, 293);
  } finally {
    if (original === undefined) delete process.env.TRADE_USE_FIXTURE;
    else process.env.TRADE_USE_FIXTURE = original;
  }
});

test('fetchUljasData throws in fixture mode when no fixtureName is given', async () => {
  const original = process.env.TRADE_USE_FIXTURE;
  process.env.TRADE_USE_FIXTURE = '1';
  try {
    await assert.rejects(() => fetchUljasData({ atype: 'data' }), /fixtureName required in fixture mode/);
  } finally {
    if (original === undefined) delete process.env.TRADE_USE_FIXTURE;
    else process.env.TRADE_USE_FIXTURE = original;
  }
});
