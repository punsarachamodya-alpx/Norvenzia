'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  adaptMetadata,
  adaptDataset,
  buildDataRequestBody,
  fetchTableMetadata,
  fetchTableDataChunk
} = require('./statbankDkClient');
const { readFixture } = require('./scbClient');

test('buildDataRequestBody produces a POST body with one {code,values} entry per dimension', () => {
  const body = buildDataRequestBody('KN8Y', { VARE: ['TOT'], LAND: ['DE', 'SE'], INDUD: ['1', '2'] });
  assert.equal(body.table, 'KN8Y');
  assert.equal(body.format, 'JSONSTAT');
  assert.equal(body.lang, 'en');
  assert.deepEqual(body.variables, [
    { code: 'VARE', values: ['TOT'] },
    { code: 'LAND', values: ['DE', 'SE'] },
    { code: 'INDUD', values: ['1', '2'] }
  ]);
});

test('adaptMetadata converts DST\'s real KN8Y tableinfo response into the {id, dimension} shape ingest.js expects', () => {
  const raw = readFixture('dk/kn8y-metadata.json');
  const metadata = adaptMetadata(raw);

  assert.deepEqual(metadata.id, ['INDUD', 'VARE', 'LAND', 'ENHED', 'Tid']);
  // Real DST category codes/labels -- not invented -- confirmed live against
  // https://api.statbank.dk/v1/tableinfo/KN8Y?lang=en.
  assert.equal(metadata.dimension.INDUD.category.index['1'], 0);
  assert.equal(metadata.dimension.INDUD.category.label['1'], 'Imports');
  assert.equal(metadata.dimension.LAND.category.label.DE, 'Germany');
  assert.equal(metadata.dimension.LAND.category.label.SE, 'Sweden');
  assert.ok(Object.keys(metadata.dimension.LAND.category.index).includes('TOT'));
});

test('adaptMetadata converts DST\'s real UHM tableinfo response, including its non-ASCII "SÆSON" dimension id', () => {
  const raw = readFixture('dk/uhm-metadata.json');
  const metadata = adaptMetadata(raw);

  assert.deepEqual(metadata.id, ['POST', 'INDUD', 'LAND', 'ENHED', 'SÆSON', 'Tid']);
  assert.equal(metadata.dimension.POST.category.label['1.A.A.1.Z'], 'GOODS THAT CROSSES DANISH BORDERS');
  assert.equal(metadata.dimension.LAND.category.label.W1, 'REST OF THE WORLD');
});

test('adaptDataset converts DST\'s real KN8Y data response (nested id/size/role inside `dimension`, wrapped in an outer "dataset" key) into the flat JSON-stat2 shape jsonStatParser.parseJsonStat expects', () => {
  const raw = readFixture('dk/kn8y-partners-2025-raw.json');
  const dataset = adaptDataset(raw);

  assert.deepEqual(dataset.id, ['INDUD', 'VARE', 'LAND', 'ENHED', 'ContentsCode', 'Tid']);
  assert.deepEqual(dataset.size, [2, 1, 267, 1, 1, 1]);
  assert.ok(Array.isArray(dataset.value));
  assert.equal(dataset.value.length, 2 * 267);
  // Per-dimension category info survives the reshape unchanged.
  assert.equal(dataset.dimension.LAND.category.label.DE, 'Germany');
});

test('fetchTableMetadata/fetchTableDataChunk replay real committed DK fixtures end to end in fixture mode', async () => {
  const original = process.env.TRADE_USE_FIXTURE;
  process.env.TRADE_USE_FIXTURE = '1';
  try {
    const metadata = await fetchTableMetadata('KN8Y', { fixtureName: 'dk/kn8y-metadata.json' });
    assert.deepEqual(metadata.id, ['INDUD', 'VARE', 'LAND', 'ENHED', 'Tid']);

    const dataset = await fetchTableDataChunk(
      'KN8Y',
      { VARE: ['TOT'], LAND: ['TOT'], INDUD: ['1', '2'], ENHED: ['99'], Tid: ['2025'] },
      { fixtureName: 'dk/kn8y-balance-1988-2025-raw.json' }
    );
    assert.deepEqual(dataset.id, ['INDUD', 'VARE', 'LAND', 'ENHED', 'ContentsCode', 'Tid']);
    assert.ok(dataset.value.length > 0);
  } finally {
    if (original === undefined) delete process.env.TRADE_USE_FIXTURE;
    else process.env.TRADE_USE_FIXTURE = original;
  }
});

test('fetchTableMetadata throws in fixture mode without a fixtureName, same contract as scbClient.js', async () => {
  const original = process.env.TRADE_USE_FIXTURE;
  process.env.TRADE_USE_FIXTURE = '1';
  try {
    await assert.rejects(() => fetchTableMetadata('KN8Y', {}), /fixtureName required in fixture mode/);
  } finally {
    if (original === undefined) delete process.env.TRADE_USE_FIXTURE;
    else process.env.TRADE_USE_FIXTURE = original;
  }
});
