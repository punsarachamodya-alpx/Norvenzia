'use strict';

// POST-based client for Statistics Denmark's (DST) StatBank API
// (https://api.statbank.dk/v1) -- no auth, no key, same "public, key-free"
// posture as SCB's PxWebApi v2, but NOT PxWebApi-shaped: DST's own
// /tableinfo and /data responses use different field names and nesting than
// SCB's, so every response is adapted into the same
// { id, dimension: { <dimId>: { category: { index, label } } } } shape
// jsonStatParser.js / ingest.js already expect from scbClient.js -- verified
// against real DST responses (see scripts/sweden-trade/fixtures/dk/), never
// guessed:
//
//   DST /tableinfo/{id}?lang=en  ->  { id, text, variables: [{ id, text,
//     elimination, time, values: [{ id, text }] }] }               (no
//     `dimension` key at all -- a flat `variables` array instead)
//
//   DST POST /data              ->  { dataset: { dimension: { <dimId>: {...},
//     ..., id: [...], size: [...], role: {...} }, value: [...] } }  (SCB
//     puts `id`/`size` as siblings of `dimension`; DST nests them INSIDE it,
//     and wraps the whole thing in an outer "dataset" key)
//
// Every dimension DST calls "eliminable" (elimination:true in /tableinfo)
// genuinely has an explicit "all values" category in practice for every
// table this build uses (KN8Y's LAND has a real "TOT" code, UHM's LAND has
// "W1" -- confirmed by a live pull returning byte-identical totals to
// omitting the dimension entirely, see RUNBOOK.md-equivalent notes in
// countries/denmark.config.js), so ingest.js's existing
// "every dimension needs an explicit selection" contract is honoured as-is
// -- no elimination-by-omission special case needed here.
//
// Fixture-replay mode mirrors scbClient.js exactly (same TRADE_USE_FIXTURE
// env var, same fixtures root, country subfolder supplied by build.js via
// fixtureName) -- fixtures store DST's raw, un-adapted response so the
// commit is a genuine, auditable copy of what the API actually returned;
// adaptation runs identically whether the raw payload came from a live call
// or a replayed fixture.

const { readFixture, useFixtures } = require('./scbClient');
const { postJson, fetchJson } = require('./httpClient');

const BASE_URL = 'https://api.statbank.dk/v1'; // default/fallback; countries/denmark.config.js's own baseUrl is authoritative

// DST's /tableinfo shape -> the { id, dimension } shape resolveSelection()/
// buildLabelsByDimension() (ingest.js) expect.
function adaptMetadata(raw) {
  const id = [];
  const dimension = {};
  for (const variable of raw.variables) {
    id.push(variable.id);
    const index = {};
    const label = {};
    variable.values.forEach((value, position) => {
      index[value.id] = position;
      label[value.id] = value.text;
    });
    dimension[variable.id] = { category: { index, label } };
  }
  return { id, dimension };
}

// DST's POST /data shape -> the flat JSON-stat2 { id, size, dimension, value }
// shape jsonStatParser.parseJsonStat() expects (identical to what SCB
// returns natively). DST nests `id`/`size`/`role` inside `dataset.dimension`
// itself (alongside the per-dimension category objects, under distinct
// keys -- no collision, since real dimension ids like "LAND"/"INDUD" never
// equal the literals "id"/"size"/"role").
function adaptDataset(raw) {
  const ds = raw.dataset;
  return { id: ds.dimension.id, size: ds.dimension.size, dimension: ds.dimension, value: ds.value };
}

function buildDataRequestBody(tableId, dimensionCodes) {
  return {
    table: tableId,
    format: 'JSONSTAT',
    lang: 'en',
    variables: Object.entries(dimensionCodes).map(([code, values]) => ({ code, values }))
  };
}

async function fetchTableMetadata(tableId, { fixtureName, baseUrl = BASE_URL } = {}) {
  if (useFixtures()) {
    if (!fixtureName) throw new Error(`fetchTableMetadata(${tableId}): fixtureName required in fixture mode`);
    return adaptMetadata(readFixture(fixtureName));
  }
  const raw = await fetchJson(`${baseUrl}/tableinfo/${tableId}?lang=en`);
  return adaptMetadata(raw);
}

async function fetchTableDataChunk(tableId, dimensionCodes, { fixtureName, baseUrl = BASE_URL } = {}) {
  if (useFixtures()) {
    if (!fixtureName) throw new Error(`fetchTableDataChunk(${tableId}): fixtureName required in fixture mode`);
    return adaptDataset(readFixture(fixtureName));
  }
  const raw = await postJson(`${baseUrl}/data`, buildDataRequestBody(tableId, dimensionCodes), { label: 'DST' });
  return adaptDataset(raw);
}

module.exports = {
  BASE_URL,
  adaptMetadata,
  adaptDataset,
  buildDataRequestBody,
  fetchTableMetadata,
  fetchTableDataChunk
};
