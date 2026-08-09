'use strict';

// GET-only client for Finnish Customs' (Tulli) Uljas statistical database
// (uljas.tulli.fi) -- a different API shape from PxWebApi (see
// scbClient.js): one query type per interface level (atype=stats|dims|
// class|data), konv=json for JSON output, `ifile` selects the statistics
// cube (a full path, not a short table id), and each dimension is its own
// query param -- e.g. `Country=DE` selects one value, `Country==ALL`
// selects every value for that dimension in one request (verified against
// the live API: a single `Country==ALL` call returns all 254 country/
// aggregate rows). See "Instructions for API manual" (linked from
// https://tilastot.tulli.fi/en/uljas-statistical-database/uljas-api) for
// the full selection-operator syntax (=ALL/=FIRST N/=LAST N/=ALLBUT N/=GEN).
//
// Two live-verified quirks this client works around:
//
// 1. Special selection operators (=ALL etc.) must be sent with a literal,
//    un-percent-encoded leading "=" -- Uljas' server-side query parser
//    appears to scan the raw (undecoded) query string for a literal "=="
//    to recognise them, so encoding it to "%3D" makes the selection
//    silently resolve to empty (verified live: `Country=%3DALL` returns no
//    rows, `Country==ALL` returns all 254). buildDataUrl below therefore
//    never encodes a value's leading "=".
//
// 2. Real (non-fixture) requests use Node's built-in `https` module rather
//    than the global fetch() this repo's other client (httpClient.js) uses.
//    Verified live and reproduced consistently: Uljas' server (an older
//    IIS/ASP.NET box) returns a bare HTTP 500 to every request made through
//    Node's fetch()/undici -- varying headers, Accept-Encoding and HTTP
//    version made no difference -- while the identical URL succeeds every
//    time through curl and through Node's native `https` module. This is a
//    real, reproducible server-side incompatibility with undici, not a
//    guess, so this client sidesteps it entirely rather than special-casing
//    httpClient.js's fetchJson for one source.
//
// Uljas responses carry a UTF-8 BOM (documented in section 2 of its own API
// manual, "so that programs reading the data know how to show ... special
// characters correctly") -- stripped before JSON.parse on both the fixture
// and real-fetch paths.
//
// Same TRADE_USE_FIXTURE=1 fixture-replay convention as scbClient.js.

const fs = require('fs');
const https = require('https');
const path = require('path');

const BASE_URL = 'https://uljas.tulli.fi/uljas/graph/api.aspx'; // default/fallback, matches country config's own baseUrl
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const BOM = /^﻿/;

function useFixtures() {
  return process.env.TRADE_USE_FIXTURE === '1';
}

function readFixture(name) {
  const raw = fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8');
  return JSON.parse(raw.replace(BOM, ''));
}

// Builds a Uljas query URL from a flat param map. Values whose first
// character is "=" (the =ALL/=FIRST N/=LAST N/=ALLBUT N/=GEN selection
// operators) are appended with that leading "=" left un-encoded -- see the
// module comment above for why; everything else (including the rest of
// such a value, e.g. the "ALL" in "=ALL") is percent-encoded normally.
function buildDataUrl(params, baseUrl = BASE_URL) {
  const query = Object.entries(params)
    .map(([key, value]) => {
      const stringValue = String(value);
      const encodedKey = encodeURIComponent(key);
      if (stringValue.startsWith('=')) {
        return `${encodedKey}=${stringValue[0]}${encodeURIComponent(stringValue.slice(1))}`;
      }
      return `${encodedKey}=${encodeURIComponent(stringValue)}`;
    })
    .join('&');
  return `${baseUrl}?${query}`;
}

function httpsGetText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`Uljas request failed: ${res.statusCode} ${res.statusMessage} for ${url}`));
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

// `params` is a flat map of Uljas query-param name -> value (see
// buildDataUrl); callers (tulliIngest.js) build these explicitly since
// there's no generic dimension-resolution layer to drive it the way
// ingest.js does for PxWeb. Real (non-fixture) responses are Uljas' own
// flat `[{keys:[...], vals:[...]}]` shape for atype=data, or
// `{classification:[...]}` for atype=class -- callers read whichever shape
// their query type returns.
async function fetchUljasData(params, { fixtureName, baseUrl = BASE_URL } = {}) {
  if (useFixtures()) {
    if (!fixtureName) throw new Error(`fetchUljasData(${params.atype || 'data'}): fixtureName required in fixture mode`);
    return readFixture(fixtureName);
  }
  const url = buildDataUrl(params, baseUrl);
  const text = await httpsGetText(url);
  return JSON.parse(text.replace(BOM, ''));
}

module.exports = {
  BASE_URL,
  FIXTURES_DIR,
  useFixtures,
  readFixture,
  buildDataUrl,
  fetchUljasData
};
