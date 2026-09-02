'use strict';

// The shared contract test (DESIGN.md §8): the same assertion logic and a
// copy of the same fixture live in massifyx-intelligence's
// lib/api/contractRules.js + test/fixtures/api-contract-sample.json. If
// either side's contract changes, both copies need updating together.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { assertValidDisruptionEvent } = require('../lib/misContract');

const fixtureEvents = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures', 'mis-api-contract-sample.json'), 'utf8'),
);

test('the recorded MIS fixture satisfies the API contract', () => {
  for (const event of fixtureEvents) {
    assert.doesNotThrow(() => assertValidDisruptionEvent(event));
  }
});

test('rejects a severity outside 1-5', () => {
  assert.throws(
    () => assertValidDisruptionEvent({ ...fixtureEvents[0], severity: 6 }),
    /severity must be an integer 1-5/,
  );
  assert.throws(
    () => assertValidDisruptionEvent({ ...fixtureEvents[0], severity: 0 }),
    /severity must be an integer 1-5/,
  );
});

test('rejects a category outside the fixed enum', () => {
  assert.throws(
    () => assertValidDisruptionEvent({ ...fixtureEvents[0], category: 'sports' }),
    /not in the fixed enum/,
  );
});

test('rejects missing or non-finite lat/lon', () => {
  assert.throws(
    () => assertValidDisruptionEvent({ ...fixtureEvents[0], lat: undefined }),
    /lat\/lon must both be present and finite/,
  );
});

test('rejects a missing id', () => {
  assert.throws(
    () => assertValidDisruptionEvent({ ...fixtureEvents[0], id: '' }),
    /id must be a non-empty stable string/,
  );
});

// eventDate is MIS's newest contract field (fixes old GDELT events sorting
// as "recent" -- see massifyx-intelligence commit 6e6dae8). This site's copy
// of the contract must reject the exact shape of bug that field was added
// to catch: a full timestamp or a non-string Date leaking through instead of
// a plain "YYYY-MM-DD" calendar string.
test('accepts a null or absent eventDate (rows enriched before the column existed)', () => {
  assert.doesNotThrow(() => assertValidDisruptionEvent({ ...fixtureEvents[0], eventDate: null }));
  const { eventDate, ...withoutEventDate } = fixtureEvents[0];
  assert.doesNotThrow(() => assertValidDisruptionEvent(withoutEventDate));
});

test('accepts a well-formed "YYYY-MM-DD" eventDate', () => {
  assert.doesNotThrow(() => assertValidDisruptionEvent({ ...fixtureEvents[0], eventDate: '2026-07-30' }));
});

test('rejects an eventDate that is a full timestamp instead of a plain date', () => {
  assert.throws(
    () => assertValidDisruptionEvent({ ...fixtureEvents[0], eventDate: '2026-07-30T06:02:00.000Z' }),
    /eventDate must be null or a "YYYY-MM-DD" string/,
  );
});

test('rejects a non-string eventDate (e.g. an un-cast Date object)', () => {
  assert.throws(
    () => assertValidDisruptionEvent({ ...fixtureEvents[0], eventDate: new Date('2026-07-30') }),
    /eventDate must be null or a "YYYY-MM-DD" string/,
  );
});
