'use strict';

// Country config for Denmark, sourced from Statistics Denmark's (DST)
// StatBank API (api.statbank.dk/v1) -- public, key-free, but NOT PxWebApi-
// shaped (POST-based table/data queries with different JSON field names and
// nesting than SCB's GET-based PxWebApi v2 -- see statbankDkClient.js's own
// header comment for the exact shape differences). `client: 'statbank-dk'`
// tells build.js/ingest.js to dispatch through statbankDkClient.js instead
// of scbClient.js; both still flow through ingest.js's generic
// table/dimension ingestTable(), unlike the UK/Finland configs' fully
// separate ingest modules, since DST's real selection/response shape (once
// adapted) fits that same generic pipeline.
//
// Real DST tables investigated before choosing these two (see
// scripts/sweden-trade/fixtures/dk/ for the actual committed API responses
// this was built from):
//
//   - UHV1..UHV7 (Denmark's older "Total external trade" family, including
//     UHV4 which DOES have both a partner-country AND an SITC breakdown in
//     one table) all stopped being updated in 2024-05 (their own `updated`
//     metadata field, confirmed live) -- genuinely real data, but stale by
//     2+ years, so not used here in favour of tables DST is still
//     publishing.
//   - KN8Y ("Imports and exports CN (EU Combined Nomenclature)", live,
//     updated through 2026) has a full real partner-country breakdown (267
//     LAND codes, real ISO alpha-2 -- ~250 genuine countries plus a "TOT"
//     aggregate and a handful of historical/region pseudo-codes never
//     ranked in Denmark's real top 10) and full annual history back to
//     1988, but its own commodity dimension (VARE) is ~19,000 raw 8-digit
//     CN codes with no pre-aggregated top-level grouping -- too granular
//     for a "top goods categories" breakdown, so KN8Y is used here for the
//     partners and balance tables only (VARE pinned to 'TOT' for both).
//   - UHM ("External trade monthly", live, updated through 2026) has a
//     pre-built ~9-category top-level goods classification (POST) matching
//     the same conceptual grain as SCB's 10 top-level SITC sections, plus a
//     LAND dimension -- but LAND has no "TOT"/all-countries code the way
//     KN8Y does. Its "W1" code, despite being labelled "REST OF THE WORLD"
//     by DST's own English translation, was confirmed by a live pull to be
//     numerically identical to the true all-countries total (same figures
//     as omitting LAND from the query entirely, which DST's API also
//     supports for elimination-flagged dimensions) -- so LAND:['W1'] is
//     used here as UHM's "TOT"-equivalent, not a client-side guess.
//     UHM only publishes monthly figures, so the goods table's `tidValues`
//     below requests all 12 months of latestYear and `collapseTid: true`
//     sums them into one annual row per category in build.js -- verified
//     against UHM's own "1.A.A.1.Z" (GOODS THAT CROSSES DANISH BORDERS,
//     i.e. the true all-goods total) that this sum reproduces DST's own
//     annual total to within 0.05%, well inside validate.js's existing
//     SAME_TABLE tolerance.
//
// Units: KN8Y reports raw DKK (ENHED '99'); UHM reports million DKK (ENHED
// '93'). Every other country's dataset in this pipeline is in thousands of
// its own currency (SCB's SEK thousand), so `valueScale` converts each
// table into that same convention: KN8Y's raw DKK x0.001 -> thousand DKK,
// UHM's million DKK x1000 -> thousand DKK. The balance table's own unit
// conversion is handled by analysis/balance.js's `unitMultiplier` param
// instead (see below), matching how it already owns TAB5390's
// million->thousand conversion for Sweden.

function monthCodesForYear(year) {
  const codes = [];
  for (let m = 1; m <= 12; m++) codes.push(`${year}M${String(m).padStart(2, '0')}`);
  return codes;
}

const GOODS_CATEGORY_CODES = [
  '1.A.A.1.0-4X2-3', // Live animals, Food, Beverages And Tobacco
  '1.A.A.1.2', // Crude Materials, Inedible, Except Fuels
  '1.A.A.1.3', // Mineral Fuels, Lubricants And Related Materials
  '1.A.A.1.5', // Chemicals And Related Products
  '1.A.A.1.6', // Manufactured Goods Classified Chiefly By Material
  '1.A.A.1.7X78-79', // Machinery (excl. Transport Equipment)
  '1.A.A.1.78-79', // Transport Equipment (excl. Vessels, aircraft etc.)
  '1.A.A.1.SOGF', // Vessels, aircraft etc.
  '1.A.A.1.8-9' // Miscellaneous Manufactured Articles
];

module.exports = {
  code: 'DK',
  name: 'Denmark',
  currency: 'DKK',

  client: 'statbank-dk',
  baseUrl: 'https://api.statbank.dk/v1',

  source: 'Statistics Denmark (Danmarks Statistik / DST) — StatBank',
  sourceUrl: 'https://www.dst.dk/en/Statistik/statistikbanken',

  // KN8Y's own annual Tid coverage runs 1988-2025 (verified live); 2025 is
  // DST's latest fully-published calendar year as of this writing. Kept
  // fixed, like every other country's latestYear here, so a re-run
  // reproduces the same already-audited figures until deliberately rolled
  // forward.
  latestYear: 2025,
  firstYear: 1988, // KN8Y's own earliest available year

  outputPath: ['content', 'trade-data', 'dk.json'],
  fixturesDir: 'dk',

  tables: {
    // KN8Y: import/export value by trading partner, all commodities
    // (VARE='TOT'), latest year only -- the Denmark equivalent of TAB3195.
    partners: {
      id: 'KN8Y',
      // Unlike the goods table below, build.js's ingestPartners() doesn't
      // inject an import/export selection for the partners table (mirrors
      // Sweden's own TAB3195 config, which lists ContentsCode explicitly
      // here too) -- so INDUD is listed explicitly, not injected.
      selection: { VARE: ['TOT'], LAND: '*', INDUD: ['1', '2'], ENHED: ['99'] }, // ENHED '99' = DKK (not Kg/supplementary-unit, DST's other two ENHED options)
      importContentsCode: '1', // DST's INDUD dimension: 1 = Imports
      exportContentsCode: '2', // 2 = Exports
      partnerDim: 'LAND',
      contentsCodeDim: 'INDUD', // DST's real import/export selector; NOT the auto-injected "ContentsCode" dim DST's /data response always includes (see statbankDkClient.js) -- that one is always just the table id, unrelated to import/export
      valueScale: 0.001, // KN8Y is raw DKK -> thousand DKK
      metadataFixture: 'kn8y-metadata.json',
      chunkFixtures: ['kn8y-partners-2025-raw.json']
    },

    // UHM: import/export value by top-level goods category, all countries
    // (LAND='W1', see module comment), latest year's 12 months (collapsed
    // to one annual figure per category in build.js) -- the Denmark
    // equivalent of TAB3197.
    goods: {
      id: 'UHM',
      selection: { LAND: ['W1'], ENHED: ['93'], 'SÆSON': ['1'], POST: GOODS_CATEGORY_CODES }, // ENHED '93' = Million DKK; SÆSON '1' = non-seasonally-adjusted
      importContentsCode: '1',
      exportContentsCode: '2',
      goodsGroupDim: 'POST',
      contentsCodeDim: 'INDUD',
      valueScale: 1000, // UHM is million DKK -> thousand DKK
      collapseTid: true, // sum the 12 fetched months into one annual row per category (see module comment)
      tidValues: (country) => monthCodesForYear(country.latestYear),
      metadataFixture: 'uhm-metadata.json',
      chunkFixtures: ['uhm-goods-2025-raw.json']
    },

    // KN8Y again: import/export value, all commodities, all countries
    // (VARE='TOT', LAND='TOT'), one row per year, full history -- the
    // Denmark equivalent of TAB5390. Reuses KN8Y rather than UHM/UHQ
    // because KN8Y is the only one of the three with a genuine annual
    // (not monthly) time series, avoiding a 38-year x12-month collapse.
    balance: {
      id: 'KN8Y',
      // Same "not injected by build.js" situation as the partners table --
      // INDUD listed explicitly (mirrors Sweden's TAB5390 config listing
      // ImportExport explicitly here too).
      selection: { VARE: ['TOT'], LAND: ['TOT'], INDUD: ['1', '2'], ENHED: ['99'] },
      importCode: '1',
      exportCode: '2',
      contentsCode: 'KN8Y', // DST's auto-injected ContentsCode dim's only value is the table id itself (see statbankDkClient.js's adaptDataset comment)
      importExportDim: 'INDUD',
      unitMultiplier: 0.001, // KN8Y is raw DKK -> thousand DKK (analysis/balance.js's own conversion knob, mirroring how it already owns TAB5390's million->thousand conversion)
      metadataFixture: 'kn8y-metadata.json', // same table/metadata as the partners table above -- KN8Y's schema doesn't change between selections
      chunkFixtures: ['kn8y-balance-1988-2025-raw.json']
    }
  }
};
