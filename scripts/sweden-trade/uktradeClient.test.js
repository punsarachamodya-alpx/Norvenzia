'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFixture, useFixtures, fetchOdata } = require('./uktradeClient');

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

test('readFixture loads and parses a real committed fixture', () => {
  const fixture = readFixture('uk/countries.json');
  assert.ok(Array.isArray(fixture.value));
  assert.ok(fixture.value.length > 0);
  const germany = fixture.value.find((c) => c.CountryCodeAlpha === 'DE');
  assert.equal(germany.CountryName, 'Germany');
});

test('fetchOdata replays from a fixture in fixture mode without a network call', async () => {
  const original = process.env.TRADE_USE_FIXTURE;
  process.env.TRADE_USE_FIXTURE = '1';
  try {
    const data = await fetchOdata('OTS?$apply=filter(MonthId eq 202501)/groupby((FlowTypeId),aggregate(Value with sum as TotalValue))', {
      fixtureName: 'uk/ots-total-2025.json'
    });
    assert.ok(Array.isArray(data.value));
    assert.equal(data.value.length, 4); // one row per FlowTypeId (1-4)
  } finally {
    if (original === undefined) delete process.env.TRADE_USE_FIXTURE;
    else process.env.TRADE_USE_FIXTURE = original;
  }
});

test('fetchOdata throws in fixture mode when no fixtureName is given', async () => {
  const original = process.env.TRADE_USE_FIXTURE;
  process.env.TRADE_USE_FIXTURE = '1';
  try {
    await assert.rejects(() => fetchOdata('Country?$top=1'), /fixtureName required in fixture mode/);
  } finally {
    if (original === undefined) delete process.env.TRADE_USE_FIXTURE;
    else process.env.TRADE_USE_FIXTURE = original;
  }
});
