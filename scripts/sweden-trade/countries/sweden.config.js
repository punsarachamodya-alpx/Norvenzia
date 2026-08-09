'use strict';

// Country config for Sweden, sourced from Statistics Sweden's (SCB) key-free
// PxWebApi v2. This is the only populated country as of this writing --
// build.js is a generic runner that takes a config shaped like this one via
// `node scripts/sweden-trade/build.js --country=se` (se is also the
// default). Adding a second country later means adding a sibling config
// file here (and, if its source isn't PxWeb-shaped, a new `client` module --
// out of scope until that's actually needed).
//
// `fixturesDir` is relative to scbClient.js's own fixtures root
// (scripts/sweden-trade/fixtures/) -- build.js joins it onto each fixture
// filename below before handing the combined path to ingestTable, so
// scbClient.js itself never needs to know about per-country subfolders.

module.exports = {
  code: 'SE',
  name: 'Sweden',
  currency: 'SEK',

  // Which HTTP client module drives ingestion for this country. Today only
  // 'pxweb' (scbClient.js) exists; a future country whose statistics office
  // doesn't speak PxWebApi would need a new client module and a new value
  // here -- not built in this phase.
  client: 'pxweb',
  baseUrl: 'https://statistikdatabasen.scb.se/api/v2',

  source: 'Statistics Sweden (SCB)',
  sourceUrl: 'https://www.scb.se/en/services/open-data-api/pxwebapi/',

  // Kept fixed rather than re-derived from "now" so a re-run always
  // reproduces the same, already-audited 2024 figures until this is
  // deliberately rolled forward to a newer completed year.
  latestYear: 2024,
  firstYear: 1998, // earliest year TAB3195 (partner breakdown) covers

  outputPath: ['content', 'trade-data', 'se.json'], // joined against repo root by build.js
  fixturesDir: 'se',

  tables: {
    // TAB3195: import/export value by trading partner, latest year only.
    partners: {
      id: 'TAB3195',
      // Tid (year) is added by build.js from latestYear -- every other
      // dimension TAB3195 has must be explicit here.
      selection: { Handelspartner: '*', ContentsCode: '*' },
      importContentsCode: 'HA0201J8',
      exportContentsCode: 'HA0201J9',
      partnerDim: 'Handelspartner',
      metadataFixture: 'tab3195-metadata.json',
      chunkFixtures: ['tab3195-2024-raw.json']
    },

    // TAB3197: import/export value by SITC rev3 goods category (top-level
    // sections only), "TOT" (all partners) row, latest year only.
    goods: {
      id: 'TAB3197',
      selection: {
        Handelspartner: ['TOT'],
        VarugruppSITCrev3: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      },
      importContentsCode: 'HA0201CE',
      exportContentsCode: 'HA0201CG',
      goodsGroupDim: 'VarugruppSITCrev3',
      metadataFixture: 'tab3197-metadata.json',
      chunkFixtures: ['tab3197-2024-raw.json']
    },

    // TAB5390: total imports/exports/net trade, one row per year, full
    // history from firstYear to latestYear.
    balance: {
      id: 'TAB5390',
      selection: { ImportExport: '*', ContentsCode: '*' }, // Tid added by build.js from firstYear..latestYear
      importCode: 'ITOT',
      exportCode: 'ETOT',
      contentsCode: 'HA0201A1',
      metadataFixture: 'tab5390-metadata.json',
      chunkFixtures: ['tab5390-1998-2024-raw.json']
    }
  }
};
