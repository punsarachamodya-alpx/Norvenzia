'use strict';

// Finland-specific ingestion for Finnish Customs' Uljas API
// (tulliClient.js). This is the "pluggable client" counterpart to
// ingest.js's PxWeb-specific ingestTable(): build.js dispatches to these
// functions instead of ingestTable() when a country config's `client` is
// 'tulli' (see countries/finland.config.js). Unlike PxWebApi, Uljas has no
// cell-cap chunker step needed here -- every query below (254 countries, 10
// goods categories, ~270 balance months) is comfortably under Uljas'
// documented 50,000-cell request cap in one call, using its own `==ALL`
// selection operator (see tulliClient.js) instead of PxWeb-style pre-
// resolving '*' against metadata.
//
// Every value below is real data straight from Uljas; only the property/
// code naming is remapped for pipeline compatibility. analysis/partners.js,
// analysis/goods.js and analysis/balance.js were written against SCB's own
// PxWebApi dimension names and hardcode them (Handelspartner/ContentsCode/
// VarugruppSITCrev3/ImportExport/Tid, plus TOTAL_PARTNER_CODE='TOT') rather
// than taking them as a parameter -- this module's row transform uses those
// exact same literal keys (same approach as ukIngest.js) so Finland's data
// flows through that shared, unmodified analysis code rather than forking
// it. Concretely: Uljas' own "AA" ("All countries together") aggregate-
// country code is relabelled to the literal string 'TOT' here, matching
// analysis/partners.js's TOTAL_PARTNER_CODE constant -- the underlying euro
// value is untouched, only the row's label reads as Sweden's TOT row does.
//
// Unit conversion: Uljas' "Value (euro)"/"Value import|export (euro)"
// indicators (V1/V5 -- see finland.config.js) are raw EUR, not thousands or
// millions. Every other figure in this pipeline (and in the shared analysis
// modules) is in *thousands* of the local currency (SCB's own TAB3195/
// TAB3197 convention), with TAB5390-style "balance" figures specifically
// expected in *millions* (analysis/balance.js's own MILLION_TO_THOUSAND=1000
// conversion, applied unconditionally). So: partner/goods values are
// divided by 1,000 here; balance values are divided by 1,000,000 -- both
// exact unit conversions of Uljas' own reported figure, never a rescale or
// estimate, and both rounded to the nearest whole unit purely for display
// hygiene (sub-EUR-thousand precision is meaningless at this scale). This
// mirrors ukIngest.js's GBP_TO_THOUSANDS/GBP_TO_MILLIONS handling exactly.

const { fetchUljasData } = require('./tulliClient');

const TOTAL_PARTNER_CODE = 'TOT'; // matches analysis/partners.js's hardcoded TOTAL_PARTNER_CODE
const EUR_TO_THOUSANDS = 1000;
const EUR_TO_MILLIONS = 1000000;

function round(n) {
  return Math.round(n);
}

// Divides a possibly-null raw-EUR value by `divisor`, preserving null
// (Uljas represents a missing/suppressed cell as JSON `null` -- a real
// "no data", never coerced to zero) rather than fabricating a figure.
function convert(value, divisor) {
  return value == null ? null : round(value / divisor);
}

// Uljas class-text values carry a "(2002--.) " / "(2002--2012) " validity-
// period prefix ahead of the actual name -- real Uljas metadata, not part
// of the country/category name itself, so it's stripped for a clean display
// label (mechanical text hygiene, same spirit as Sweden's own label
// `.trim()` in analysis/partners.js and analysis/goods.js).
function stripValidityPrefix(text) {
  return text.replace(/^\(\d{4}--[.\d]*\)\s*/, '').trim();
}

function buildLabelMap(classData, classificationId) {
  const entry = classData.classification.find((c) => c.id === classificationId);
  if (!entry) throw new Error(`buildLabelMap: classification "${classificationId}" not found in Uljas class response`);
  const labels = {};
  for (const { code, text } of entry.class) labels[code] = stripValidityPrefix(text);
  return labels;
}

function partnersDataParams(t, year, flow) {
  return {
    lang: 'en', atype: 'data', konv: 'json', ifile: t.ifile, Select: 'Codes',
    'Classification of Products SITC1': t.sitcTotalCode,
    Country: '=ALL',
    Year: String(year),
    Flow: flow,
    Indicators: 'V1'
  };
}

// Builds { rows, labels } shaped like ingest.js's PxWeb output but for
// Finland's partner-country totals: one TOT row per flow (Uljas' own "AA"
// all-countries-together aggregate, relabelled) plus one row per real
// partner country, each keyed by literal `Handelspartner`/`ContentsCode`
// fields (see module header for why).
async function ingestPartners(country) {
  const t = country.tables.partners;

  const [importRows, exportRows, classData] = await Promise.all([
    fetchUljasData(partnersDataParams(t, country.latestYear, t.importFlow), {
      fixtureName: `${country.fixturesDir}/${t.importFixture}`,
      baseUrl: country.baseUrl
    }),
    fetchUljasData(partnersDataParams(t, country.latestYear, t.exportFlow), {
      fixtureName: `${country.fixturesDir}/${t.exportFixture}`,
      baseUrl: country.baseUrl
    }),
    fetchUljasData(
      { lang: 'en', atype: 'class', konv: 'json', ifile: t.ifile },
      { fixtureName: `${country.fixturesDir}/${t.classFixture}`, baseUrl: country.baseUrl }
    )
  ]);

  const remapCountry = (code) => (code === t.totalCountryCode ? TOTAL_PARTNER_CODE : code);

  const rows = [];
  for (const { keys, vals } of importRows) {
    rows.push({ Handelspartner: remapCountry(keys[1]), ContentsCode: t.importContentsCode, value: convert(vals[0], EUR_TO_THOUSANDS) });
  }
  for (const { keys, vals } of exportRows) {
    rows.push({ Handelspartner: remapCountry(keys[1]), ContentsCode: t.exportContentsCode, value: convert(vals[0], EUR_TO_THOUSANDS) });
  }

  const countryLabels = buildLabelMap(classData, 'D3');
  countryLabels[TOTAL_PARTNER_CODE] = countryLabels[t.totalCountryCode] || 'All countries together';

  return { rows, labels: { [t.partnerDim]: countryLabels } };
}

function goodsDataParams(t, year, flow) {
  return {
    lang: 'en', atype: 'data', konv: 'json', ifile: t.ifile, Select: 'Codes',
    'Classification of Products SITC1': '=ALL',
    Country: t.totalCountryCode,
    Year: String(year),
    Flow: flow,
    Indicators: 'V1'
  };
}

// Builds { rows, labels } for the 10 top-level SITC1 sections ("0".."9"),
// "AA" (all countries) row, latest year -- the Finland equivalent of
// TAB3197's TOT-partner-row goods breakdown. The "0-9" ALL GROUPS aggregate
// row Uljas also returns is excluded (see finland.config.js comment).
async function ingestGoods(country) {
  const t = country.tables.goods;

  const [importRows, exportRows, classData] = await Promise.all([
    fetchUljasData(goodsDataParams(t, country.latestYear, t.importFlow), {
      fixtureName: `${country.fixturesDir}/${t.importFixture}`,
      baseUrl: country.baseUrl
    }),
    fetchUljasData(goodsDataParams(t, country.latestYear, t.exportFlow), {
      fixtureName: `${country.fixturesDir}/${t.exportFixture}`,
      baseUrl: country.baseUrl
    }),
    fetchUljasData(
      { lang: 'en', atype: 'class', konv: 'json', ifile: t.ifile },
      { fixtureName: `${country.fixturesDir}/${t.classFixture}`, baseUrl: country.baseUrl }
    )
  ]);

  const rows = [];
  for (const { keys, vals } of importRows) {
    if (keys[0] === t.aggregateSitcCode) continue;
    rows.push({ VarugruppSITCrev3: keys[0], ContentsCode: t.importContentsCode, value: convert(vals[0], EUR_TO_THOUSANDS) });
  }
  for (const { keys, vals } of exportRows) {
    if (keys[0] === t.aggregateSitcCode) continue;
    rows.push({ VarugruppSITCrev3: keys[0], ContentsCode: t.exportContentsCode, value: convert(vals[0], EUR_TO_THOUSANDS) });
  }

  const sitcLabels = buildLabelMap(classData, 'D1');
  delete sitcLabels[t.aggregateSitcCode];

  return { rows, labels: { [t.goodsGroupDim]: sitcLabels } };
}

function balanceDataParams(t, indicator) {
  return {
    lang: 'en', atype: 'data', konv: 'json', ifile: t.ifile, Select: 'Codes',
    'Time period': '=ALL',
    Country: t.totalCountryCode,
    Indicators: indicator
  };
}

// Rolls Uljas' monthly ("YYYYMM") rows up into one total per calendar year,
// restricted to *complete* years (12 months present) within
// firstYear..latestYear -- KAUPPATASE's own period range runs past
// latestYear (through whatever the current month is), and a partial year
// would silently understate that year's total rather than reflect real
// annual trade, so it's dropped instead of reported as-is.
function sumCompleteYears(monthlyRows, firstYear, lastYear) {
  const byYear = new Map();
  for (const { keys, vals } of monthlyRows) {
    if (vals[0] == null) continue;
    const period = keys[0]; // "YYYYMM"
    const year = Number(period.slice(0, 4));
    if (year < firstYear || year > lastYear) continue;
    if (!byYear.has(year)) byYear.set(year, { sum: 0, months: 0 });
    const entry = byYear.get(year);
    entry.sum += vals[0];
    entry.months += 1;
  }

  const totals = new Map();
  for (const [year, { sum, months }] of byYear.entries()) {
    if (months !== 12) continue; // incomplete year -- excluded, never reported partial
    totals.set(year, sum);
  }
  return totals;
}

// Builds { rows } for the full firstYear..latestYear yearly balance series --
// the Finland equivalent of TAB5390. Values are converted to *millions* of
// EUR (not thousands) because analysis/balance.js's own MILLION_TO_THOUSAND
// conversion (x1000) is applied unconditionally to every country's balance
// rows -- feeding it millions here is what makes that shared, unmodified
// conversion produce the correct thousands-of-EUR figure (see module header).
async function ingestBalance(country) {
  const t = country.tables.balance;

  const [importMonthly, exportMonthly] = await Promise.all([
    fetchUljasData(balanceDataParams(t, t.importIndicator), {
      fixtureName: `${country.fixturesDir}/${t.importFixture}`,
      baseUrl: country.baseUrl
    }),
    fetchUljasData(balanceDataParams(t, t.exportIndicator), {
      fixtureName: `${country.fixturesDir}/${t.exportFixture}`,
      baseUrl: country.baseUrl
    })
  ]);

  const importByYear = sumCompleteYears(importMonthly, country.firstYear, country.latestYear);
  const exportByYear = sumCompleteYears(exportMonthly, country.firstYear, country.latestYear);

  const rows = [];
  for (const year of importByYear.keys()) {
    if (!exportByYear.has(year)) continue; // never pair an import total with a missing export total
    rows.push({ ImportExport: t.importCode, ContentsCode: t.contentsCode, Tid: String(year), value: convert(importByYear.get(year), EUR_TO_MILLIONS) });
    rows.push({ ImportExport: t.exportCode, ContentsCode: t.contentsCode, Tid: String(year), value: convert(exportByYear.get(year), EUR_TO_MILLIONS) });
  }

  return { rows };
}

module.exports = {
  ingestPartners,
  ingestGoods,
  ingestBalance,
  sumCompleteYears,
  buildLabelMap,
  stripValidityPrefix,
  TOTAL_PARTNER_CODE,
  EUR_TO_THOUSANDS,
  EUR_TO_MILLIONS
};
