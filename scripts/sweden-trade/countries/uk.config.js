'use strict';

// Country config for the United Kingdom, sourced from HM Revenue & Customs'
// UK Trade Info OData API (api.uktradeinfo.com) -- the official source for
// UK Overseas Trade in Goods Statistics (OTS): imports/exports by partner
// country and by SITC commodity group, monthly, no auth/key required. See
// https://www.uktradeinfo.com/api-documentation.
//
// `code` is the real ISO 3166-1 alpha-2 code (GB) since that's what
// coords.js/analysis output use to identify the UK as a *partner* in other
// countries' data. `outputPath`/`fixturesDir`/manifest `slug`, by contrast,
// use "uk" -- that's the URL slug and the name this business (see
// content/industries.js: "based in Scandinavia, the EU, the UK,
// Switzerland, or Australia") and its visitors actually use, even though
// it's not the ISO code.
//
// Unlike Sweden's PxWebApi source, uktradeinfo's API is a plain OData v4
// service (resource + $filter/$apply query strings, not table/dimension
// selection) -- `client: 'uktradeinfo'` tells build.js to dispatch to
// ukIngest.js instead of ingest.js's PxWeb-specific ingestTable(). See
// ukIngest.js for exactly what each table's query looks like and why.

module.exports = {
  code: 'GB', // real ISO 3166-1 alpha-2 -- used wherever UK appears as a *partner* (coords.js, other countries' topPartners)
  slug: 'uk', // --country= value / URL slug / manifest slug this site actually uses (see build.js#loadCountryConfig)
  name: 'United Kingdom',
  currency: 'GBP',

  client: 'uktradeinfo',
  baseUrl: 'https://api.uktradeinfo.com',

  source: 'HM Revenue & Customs (HMRC) — UK Trade Info (Overseas Trade in Goods Statistics)',
  sourceUrl: 'https://www.uktradeinfo.com/api-documentation',

  // OTS's own MonthId range runs 200001..202605 as of this writing (verified
  // via $apply=aggregate(MonthId with min/max as ...)); 2025 is therefore the
  // latest fully-covered calendar year. Kept fixed, like Sweden's latestYear,
  // so a re-run reproduces the same already-audited figures until this is
  // deliberately rolled forward.
  latestYear: 2025,
  firstYear: 2000, // OTS's own earliest available month is 200001

  outputPath: ['content', 'trade-data', 'uk.json'],
  fixturesDir: 'uk',

  tables: {
    // Partner-country breakdown: OTS grouped by (CountryId, FlowTypeId) for
    // the latest year, plus an independently-fetched all-country total (the
    // UK equivalent of SCB's own TAB3195 "TOT" row -- see
    // ukIngest.js#fetchAllCountryTotal). FlowTypeId 1/3 = EU/non-EU imports,
    // 2/4 = EU/non-EU exports; ukIngest.js combines these into a single
    // import/export total per partner.
    //
    // `partnerDim`/`importContentsCode`/`exportContentsCode` are literal
    // field names analysis/partners.js hardcodes (it was written against
    // SCB's PxWebApi dimension names and doesn't take them as a parameter) --
    // ukIngest.js's row transform uses these exact same literal keys so UK
    // data flows through that shared, unmodified analysis code.
    partners: {
      // Not a PxWeb table id (uktradeinfo has no table-selection concept) --
      // this documents which OTS query this table represents in
      // meta.tables, mirroring what Sweden's TAB#### ids do there.
      id: 'OTS-by-country',
      partnerDim: 'Handelspartner',
      importContentsCode: 'IMPORT',
      exportContentsCode: 'EXPORT',
      countriesFixture: 'countries.json',
      totalFixture: 'ots-total-2025.json',
      byCountryFixture: 'ots-by-country-2025.json'
    },

    // Goods breakdown: OTS grouped by (CommoditySitcId, FlowTypeId) for the
    // latest year, rolled up from HMRC's ~3,600 5-digit SITC codes to their
    // 10 top-level sections (Sitc1Code "0".."9") via the /SITC reference
    // table -- the UK equivalent of TAB3197's top-level SITC rev3 split.
    goods: {
      id: 'OTS-by-sitc',
      goodsGroupDim: 'VarugruppSITCrev3', // see partners.partnerDim comment -- same forced-literal-key situation, this time from analysis/goods.js
      importContentsCode: 'IMPORT',
      exportContentsCode: 'EXPORT',
      sitcFixture: 'sitc.json',
      byCommodityFixture: 'ots-by-sitc-2025.json'
    },

    // Yearly balance series, firstYear..latestYear: OTS grouped by
    // (MonthId, FlowTypeId) then summed to years in ukIngest.js -- the UK
    // equivalent of TAB5390. Pulled in 5-year windows
    // (ukIngest.js#planBalanceChunks) because the full 26-year range times
    // out server-side as a single query.
    balance: {
      id: 'OTS-by-month',
      importCode: 'ITOT',
      exportCode: 'ETOT',
      contentsCode: 'VALUE',
      monthlyFixtures: ['ots-monthly-2000-2004.json', 'ots-monthly-2005-2009.json', 'ots-monthly-2010-2014.json', 'ots-monthly-2015-2019.json', 'ots-monthly-2020-2025.json']
    }
  }
};
