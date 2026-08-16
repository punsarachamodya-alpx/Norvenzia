'use strict';

// GET-only client for HM Revenue & Customs' UK Trade Info OData API
// (api.uktradeinfo.com) -- the official source for UK Overseas Trade in
// Goods Statistics (OTS): imports/exports by partner country and by SITC
// commodity group, monthly, back to January 2000. No auth, no key -- see
// https://www.uktradeinfo.com/api-documentation ("open access", no
// Authorisation header needed). Rate limit is documented as 60 requests/min
// per IP.
//
// Mirrors scbClient.js's shape (fetch + fixture-replay via TRADE_USE_FIXTURE=1,
// same env var, same fixtures-root convention) but talks OData v4 instead of
// PxWebApi -- this is a plain resource + query-string GET, not a
// table/dimension-selection API, so there's no metadata/chunker step here;
// ukIngest.js builds each query string directly (mostly $apply=filter(...)
// /groupby(...,aggregate(...)) queries that let HMRC's own server do the
// year-level summation, rather than us pulling every raw commodity x country
// x month row and summing client-side).

const fs = require('fs');
const path = require('path');
const { fetchJson } = require('./httpClient');

const BASE_URL = 'https://api.uktradeinfo.com'; // default/fallback, matches country config's own baseUrl
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function useFixtures() {
  return process.env.TRADE_USE_FIXTURE === '1';
}

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8'));
}

// `resource` is a full OData resource + query string, e.g.
// "OTS?$apply=filter(MonthId ge 202501 and MonthId le 202512)/groupby(...)"
// or plain "Country?$top=1000" -- callers (ukIngest.js) build these
// explicitly since there's no generic dimension-selection layer to drive it
// the way ingest.js does for PxWeb. Real (non-fixture) responses are the raw
// OData JSON envelope ({ "@odata.context", value: [...] }); callers read
// `.value`.
async function fetchOdata(resource, { fixtureName, baseUrl = BASE_URL } = {}) {
  if (useFixtures()) {
    if (!fixtureName) throw new Error(`fetchOdata(${resource}): fixtureName required in fixture mode`);
    return readFixture(fixtureName);
  }
  return fetchJson(`${baseUrl}/${resource}`);
}

module.exports = {
  BASE_URL,
  FIXTURES_DIR,
  useFixtures,
  readFixture,
  fetchOdata
};
