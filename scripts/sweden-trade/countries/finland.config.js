'use strict';

// Country config for Finland, sourced from Finnish Customs' (Tulli) Uljas
// international trade statistics database (tilastot.tulli.fi) -- the
// official source for Finland's goods trade by partner country and by SITC
// commodity group. Statistics Finland (StatFin/PxWebApi) only covers
// *services* trade (its `tpulk` folder) -- detailed goods trade by partner
// and commodity is Tulli's, a separate agency, same split as Sweden's SCB
// (goods) vs a different body (services). See
// https://tilastot.tulli.fi/en/uljas-statistical-database/uljas-api.
//
// Uljas is NOT PxWebApi-shaped: it's a four-level query API
// (stats/dims/class/data) with its own selection syntax (e.g. `Country=DE`
// for one value, `Country==ALL` for every value) -- `client: 'tulli'` tells
// build.js to dispatch to tulliIngest.js instead of ingest.js's PxWeb-
// specific ingestTable(). See tulliClient.js/tulliIngest.js for exactly
// what each table's query looks like and why.
//
// analysis/partners.js, analysis/goods.js and analysis/balance.js were
// written against SCB's own PxWebApi dimension names and hardcode them
// (Handelspartner/ContentsCode/VarugruppSITCrev3/ImportExport/Tid, plus
// TOTAL_PARTNER_CODE='TOT') rather than taking them as a parameter --
// tulliIngest.js's row transform uses these exact same literal keys (same
// approach as ukIngest.js) so Finland's data flows through that shared,
// unmodified analysis code. Uljas' own "AA" ("All countries together")
// aggregate-country code is relabelled to 'TOT' for this reason -- see
// tulliIngest.js's module comment.

module.exports = {
  code: 'FI',
  name: 'Finland',
  currency: 'EUR',

  client: 'tulli',
  baseUrl: 'https://uljas.tulli.fi/uljas/graph/api.aspx',

  source: 'Finnish Customs (Tulli) — Uljas international trade statistics',
  sourceUrl: 'https://tilastot.tulli.fi/en/uljas-statistical-database/uljas-api',

  // Uljas' own cubes (Uljas' `atype=stats` listing, checked live) were
  // restructured 30.3.2026: the current-generation SITC cube only covers
  // Jan 2025 (exports) / Jan 2026 (imports) onward. ULJAS_SITC2 and
  // ULJAS_KAUPPATASE are the still-updated legacy cubes that carry full
  // history back to Jan 2002 -- used here instead so 2024 (the latest
  // fully-published, already-audited calendar year; 2025's final figures
  // aren't due until 28.8.2026 per Uljas' own notice) is actually covered.
  // Kept fixed, like Sweden's latestYear, so a re-run reproduces the same
  // figures until this is deliberately rolled forward.
  latestYear: 2024,
  firstYear: 2002, // ULJAS_SITC2's and ULJAS_KAUPPATASE's own earliest available month is 200201

  outputPath: ['content', 'trade-data', 'fi.json'],
  fixturesDir: 'fi',

  tables: {
    // Partner-country breakdown: ULJAS_SITC2, total goods only (SITC1
    // "0-9" = "ALL GROUPS"), every country, latest year, import flow (1)
    // and export flow (2) fetched separately -- the Finland equivalent of
    // TAB3195. `Country==ALL` returns all 254 country/aggregate rows in a
    // single call (well under Uljas' documented 50,000-cell request cap),
    // including the "AA" all-countries-together aggregate that
    // tulliIngest.js relabels to 'TOT' for buildHero()/analysis/partners.js.
    partners: {
      id: 'ULJAS_SITC2-by-country', // not a PxWeb table id -- documents which Uljas query this represents, mirroring TAB#### in meta.tables
      ifile: '/DATABASE/01 ULKOMAANKAUPPATILASTOT/02 SITC/ULJAS_SITC2',
      sitcTotalCode: '0-9',
      totalCountryCode: 'AA',
      importFlow: '1', // "Imports by countries of origin"
      exportFlow: '2', // "Exports by countries of destination"
      partnerDim: 'Handelspartner',
      importContentsCode: 'IMPORT',
      exportContentsCode: 'EXPORT',
      classFixture: 'sitc2-class-raw.json',
      importFixture: 'sitc2-partners-2024-import-raw.json',
      exportFixture: 'sitc2-partners-2024-export-raw.json'
    },

    // Goods breakdown: ULJAS_SITC2's 10 top-level SITC1 sections ("0".."9"),
    // "AA" (all countries) row, latest year, both flows -- the Finland
    // equivalent of TAB3197's top-level SITC split. The "0-9" aggregate row
    // is excluded from this table (matching TAB3197's own selection, which
    // never requests the aggregate either) since analysis/goods.js sums the
    // fetched rows itself.
    goods: {
      id: 'ULJAS_SITC2-by-commodity',
      ifile: '/DATABASE/01 ULKOMAANKAUPPATILASTOT/02 SITC/ULJAS_SITC2',
      totalCountryCode: 'AA',
      aggregateSitcCode: '0-9', // excluded from the row set -- see comment above
      importFlow: '1',
      exportFlow: '2',
      goodsGroupDim: 'VarugruppSITCrev3',
      importContentsCode: 'IMPORT',
      exportContentsCode: 'EXPORT',
      classFixture: 'sitc2-class-raw.json',
      importFixture: 'sitc2-goods-2024-import-raw.json',
      exportFixture: 'sitc2-goods-2024-export-raw.json'
    },

    // Yearly balance series, firstYear..latestYear: ULJAS_KAUPPATASE's
    // monthly "AA" (all countries) import (V1) and export (V5) values,
    // summed to years in tulliIngest.js -- the Finland equivalent of
    // TAB5390. KAUPPATASE only exposes a monthly "Time period" dimension
    // (no yearly alternate classification, unlike ULJAS_SITC2's Year
    // alternate), so both fixtures below are the full monthly series and
    // tulliIngest.js does the year rollup itself, restricted to complete
    // (Jan-Dec) years within firstYear..latestYear.
    balance: {
      id: 'ULJAS_KAUPPATASE-by-month',
      ifile: '/DATABASE/01 ULKOMAANKAUPPATILASTOT/06 KAUPPATASE/ULJAS_KAUPPATASE',
      totalCountryCode: 'AA',
      importIndicator: 'V1', // "Value import (euro)"
      exportIndicator: 'V5', // "Value export (euro)"
      importCode: 'ITOT',
      exportCode: 'ETOT',
      contentsCode: 'VALUE',
      importFixture: 'kauppatase-monthly-import-raw.json',
      exportFixture: 'kauppatase-monthly-export-raw.json'
    }
  }
};
