'use strict';

// GET-only client for the PxWebApi v2 shape SCB (and, per country config,
// potentially other national statistics offices on the same API) exposes --
// no auth, no key. Every call can be replayed from a saved fixture instead
// of hitting the network by setting TRADE_USE_FIXTURE=1 (same convention as
// spike-scb-fetch.js) -- this is what lets tests and audits reproduce a
// build deterministically.
//
// The base URL is per-country config (see countries/sweden.config.js's
// `baseUrl`), not hardcoded here -- every function below accepts it as an
// option and falls back to SCB's own URL only so existing 2-arg call sites
// (and this module's own tests) keep working unchanged.

const fs = require('fs');
const path = require('path');
const { fetchJson } = require('./httpClient');

const BASE_URL = 'https://statistikdatabasen.scb.se/api/v2'; // default/fallback, not the only valid value
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function useFixtures() {
  return process.env.TRADE_USE_FIXTURE === '1';
}

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8'));
}

async function fetchTableMetadata(tableId, { fixtureName, baseUrl = BASE_URL } = {}) {
  if (useFixtures()) {
    if (!fixtureName) throw new Error(`fetchTableMetadata(${tableId}): fixtureName required in fixture mode`);
    return readFixture(fixtureName);
  }
  return fetchJson(`${baseUrl}/tables/${tableId}/metadata?lang=en`);
}

// Every dimension in the table needs an explicit valuecodes[Dim]=... entry
// or the API 400s with "Missing selection for mandatory variable" -- see
// BUILD_INSTRUCTIONS Appendix. `dimensionCodes` must therefore already cover
// every dimension in the table, one explicit code array each.
function buildDataUrl(tableId, dimensionCodes, baseUrl = BASE_URL) {
  const params = Object.entries(dimensionCodes)
    .map(([dim, codes]) => `valuecodes[${encodeURIComponent(dim)}]=${codes.map(encodeURIComponent).join(',')}`)
    .join('&');
  return `${baseUrl}/tables/${tableId}/data?lang=en&outputFormat=json-stat2&${params}`;
}

async function fetchTableDataChunk(tableId, dimensionCodes, { fixtureName, baseUrl = BASE_URL } = {}) {
  if (useFixtures()) {
    if (!fixtureName) throw new Error(`fetchTableDataChunk(${tableId}): fixtureName required in fixture mode`);
    return readFixture(fixtureName);
  }
  return fetchJson(buildDataUrl(tableId, dimensionCodes, baseUrl));
}

module.exports = {
  BASE_URL,
  FIXTURES_DIR,
  useFixtures,
  readFixture,
  fetchTableMetadata,
  buildDataUrl,
  fetchTableDataChunk
};
