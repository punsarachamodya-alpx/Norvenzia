'use strict';

// UK-specific ingestion for HMRC's UK Trade Info OData API (uktradeClient.js).
// This is the "pluggable client" counterpart to ingest.js's PxWeb-specific
// ingestTable(): build.js dispatches to these functions instead of
// ingestTable() when a country config's `client` is 'uktradeinfo' (see
// countries/uk.config.js). Unlike PxWebApi, OData has no fixed table shape
// to select against, so there's no metadata/chunker step -- each function
// below issues an explicit $apply=filter(...)/groupby(...) query and lets
// HMRC's own server do the year-level summation, then reshapes the result
// into rows carrying the *same literal field names* analysis/partners.js,
// analysis/goods.js and analysis/balance.js already hardcode (Handelspartner,
// VarugruppSITCrev3, ContentsCode, ImportExport, Tid) -- those modules were
// written against SCB's PxWebApi dimension names and don't take the field
// name as a parameter, so this is the adapter that lets UK data flow through
// the same shared analysis code unmodified rather than forking it.
//
// Real UK OTS `Value` is raw GBP (verified against known trade figures, e.g.
// UK-France goods imports ~GBP 2.86bn for Jan 2024 alone -- consistent with
// published ~GBP 30-40bn/year). Every other figure in this pipeline (and in
// the shared analysis modules) is in *thousands* of the local currency
// (SCB's own TAB3195/TAB3197 convention) with TAB5390-style "balance" figures
// specifically expected in *millions* (analysis/balance.js's own
// MILLION_TO_THOUSAND=1000 conversion). So: partner/goods values are divided
// by 1,000 here; balance values are divided by 1,000,000 -- both are exact
// unit conversions of HMRC's own reported figure, never a rescale/estimate,
// and both are rounded to the nearest whole unit purely for display hygiene
// (sub-GBP-thousand precision is meaningless at this scale).

const { fetchOdata } = require('./uktradeClient');
const { wait, MIN_CALL_INTERVAL_MS } = require('./httpClient');

const IMPORT_CONTENTS_CODE = 'IMPORT';
const EXPORT_CONTENTS_CODE = 'EXPORT';
const TOTAL_PARTNER_CODE = 'TOT'; // matches analysis/partners.js's hardcoded TOTAL_PARTNER_CODE

// FlowTypeId is HMRC's own OTS dimension: 1=EU Imports, 2=EU Exports,
// 3=Non-EU Imports, 4=Non-EU Exports (legacy EU/non-EU split, still how OTS
// itself is structured post-Brexit) -- combined here into a single
// import/export total per partner/category/month, same as how a visitor
// reads "imports" regardless of EU/non-EU origin.
const IMPORT_FLOW_TYPE_IDS = [1, 3];
const EXPORT_FLOW_TYPE_IDS = [2, 4];

// Non-country OTS rows: adjustment/aggregate entries HMRC includes in OTS
// alongside real trading partners (verified via GET /Country -- see
// fixtures/uk/countries.json). These never represent a real country so they
// must never be attributed to one, but their value is still real UK trade
// value -- it's included in the independent all-country total this module
// fetches separately (fetchAllCountryTotal), just excluded from the
// per-partner breakdown, exactly like SCB's confidential-data carve-out.
const EXCLUDED_COUNTRY_IDS = new Set([
  6, // UK itself (CountryId 6, alpha GB) -- a country can't be its own trading partner
  951, // "Stores & Provis." (EU)
  952, // "Stores & Provis." (non-EU)
  958, // "Low Value Non EU"
  959, // "Estimates" (EU)
  962, // "Low Value Trd EU"
  977, // "Confidential Country"
  1001, // "Other Asia and Oceania"
  1002, // "Other Eastern Europe"
  1003, // "Other Latin American and the Caribbean"
  1004, // "Other Middle East and North Africa"
  1005, // "Other North America"
  1006, // "Other Sub-Saharan Africa"
  1007 // "Other Western Europe"
]);

const GBP_TO_THOUSANDS = 1000;
const GBP_TO_MILLIONS = 1000000;

function round(n) {
  return Math.round(n);
}

function monthRangeFilter(firstYear, lastYear) {
  return `MonthId ge ${firstYear}01 and MonthId le ${lastYear}12`;
}

function isImportFlow(flowTypeId) {
  return IMPORT_FLOW_TYPE_IDS.includes(flowTypeId);
}

function isExportFlow(flowTypeId) {
  return EXPORT_FLOW_TYPE_IDS.includes(flowTypeId);
}

// Config fixture names are bare (e.g. "countries.json"), same convention as
// build.js's own fixtureName() for the 'pxweb' client -- resolved here
// (rather than by the caller) so every ingestUk*() function can be called
// with the country config exactly as authored, no pre-processing step
// required of build.js or of tests.
function fixturePath(country, name) {
  return name ? `${country.fixturesDir}/${name}` : undefined;
}

async function fetchCountries(country) {
  const t = country.tables.partners;
  const data = await fetchOdata('Country?$top=1000', {
    fixtureName: fixturePath(country, t.countriesFixture),
    baseUrl: country.baseUrl
  });
  return data.value;
}

async function fetchSitc(country) {
  const t = country.tables.goods;
  const data = await fetchOdata('SITC?$top=5000', {
    fixtureName: fixturePath(country, t.sitcFixture),
    baseUrl: country.baseUrl
  });
  return data.value;
}

// Independent all-country total for the year, from its own $apply query (not
// derived by summing the per-country rows) -- the UK equivalent of SCB's own
// TAB3195 "TOT" row, used the same way by build.js's buildHero().
async function fetchAllCountryTotal(country) {
  const t = country.tables.partners;
  const resource =
    `OTS?$apply=filter(${monthRangeFilter(country.latestYear, country.latestYear)})` +
    `/groupby((FlowTypeId),aggregate(Value with sum as TotalValue))`;
  const data = await fetchOdata(resource, { fixtureName: fixturePath(country, t.totalFixture), baseUrl: country.baseUrl });
  return data.value;
}

async function fetchPartnerTotals(country) {
  const t = country.tables.partners;
  const resource =
    `OTS?$apply=filter(${monthRangeFilter(country.latestYear, country.latestYear)})` +
    `/groupby((CountryId,FlowTypeId),aggregate(Value with sum as TotalValue))`;
  const data = await fetchOdata(resource, { fixtureName: fixturePath(country, t.byCountryFixture), baseUrl: country.baseUrl });
  return data.value;
}

async function fetchGoodsTotals(country) {
  const t = country.tables.goods;
  const resource =
    `OTS?$apply=filter(${monthRangeFilter(country.latestYear, country.latestYear)})` +
    `/groupby((CommoditySitcId,FlowTypeId),aggregate(Value with sum as TotalValue))`;
  const data = await fetchOdata(resource, { fixtureName: fixturePath(country, t.byCommodityFixture), baseUrl: country.baseUrl });
  return data.value;
}

// The full firstYear..latestYear monthly series times out server-side as a
// single $apply query (verified against the live API: a 2000-2025 request
// returned a 500 "An error has occurred", while every window up to 6 years
// succeeded), so it's pulled in ~5-year windows and concatenated -- same
// motivation as chunker.js's cell-cap chunking for SCB, different mechanism
// (HMRC has no documented cell cap to plan against, so this uses a flat
// window size proven to succeed rather than a computed one). A short
// trailing remainder (< a full window) is merged into the previous window
// rather than issued as its own tiny request, since windows up to 6 years
// are already proven to work.
const BALANCE_CHUNK_YEARS = 5;

function planBalanceChunks(firstYear, lastYear) {
  const chunks = [];
  let start = firstYear;
  while (start <= lastYear) {
    let end = Math.min(start + BALANCE_CHUNK_YEARS - 1, lastYear);
    if (end !== lastYear && lastYear - end < BALANCE_CHUNK_YEARS) end = lastYear;
    chunks.push({ start, end });
    start = end + 1;
  }
  return chunks;
}

async function fetchBalanceMonthly(country) {
  const t = country.tables.balance;
  const chunks = planBalanceChunks(country.firstYear, country.latestYear);
  if (t.monthlyFixtures && t.monthlyFixtures.length !== chunks.length) {
    throw new Error(
      `fetchBalanceMonthly: monthlyFixtures has ${t.monthlyFixtures.length} entries but firstYear/latestYear needs ${chunks.length} (${BALANCE_CHUNK_YEARS}-year windows)`
    );
  }

  const rows = [];
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await wait(MIN_CALL_INTERVAL_MS);
    const { start, end } = chunks[i];
    const resource = `OTS?$apply=filter(${monthRangeFilter(start, end)})/groupby((MonthId,FlowTypeId),aggregate(Value with sum as TotalValue))`;
    const fixtureName = fixturePath(country, t.monthlyFixtures ? t.monthlyFixtures[i] : undefined);
    const data = await fetchOdata(resource, { fixtureName, baseUrl: country.baseUrl });
    rows.push(...data.value);
  }
  return rows;
}

// Builds { rows, labels } shaped like ingest.js's PxWeb output but for UK
// partner-country totals: one TOT row per flow (the independent all-country
// total) plus one row per real partner country, each keyed by literal
// `Handelspartner`/`ContentsCode` fields (see module header for why).
async function ingestUkPartners(country) {
  const [countries, totalRows, partnerRows] = await Promise.all([fetchCountries(country), fetchAllCountryTotal(country), fetchPartnerTotals(country)]);

  const countryById = new Map(countries.map((c) => [c.CountryId, c]));
  const labels = {};
  const rows = [];

  let totImport = 0;
  let totExport = 0;
  for (const r of totalRows) {
    if (r.TotalValue == null) continue;
    if (isImportFlow(r.FlowTypeId)) totImport += r.TotalValue;
    if (isExportFlow(r.FlowTypeId)) totExport += r.TotalValue;
  }
  rows.push({ Handelspartner: TOTAL_PARTNER_CODE, ContentsCode: IMPORT_CONTENTS_CODE, value: round(totImport / GBP_TO_THOUSANDS) });
  rows.push({ Handelspartner: TOTAL_PARTNER_CODE, ContentsCode: EXPORT_CONTENTS_CODE, value: round(totExport / GBP_TO_THOUSANDS) });

  const byCountry = new Map(); // CountryId -> { imp, exp }
  for (const r of partnerRows) {
    if (r.TotalValue == null) continue;
    if (EXCLUDED_COUNTRY_IDS.has(r.CountryId)) continue;
    const meta = countryById.get(r.CountryId);
    if (!meta || !meta.CountryCodeAlpha) continue; // no real ISO alpha-2 -> not a nameable partner, exclude rather than guess
    if (!byCountry.has(r.CountryId)) byCountry.set(r.CountryId, { code: meta.CountryCodeAlpha, name: meta.CountryName, imp: 0, exp: 0 });
    const entry = byCountry.get(r.CountryId);
    if (isImportFlow(r.FlowTypeId)) entry.imp += r.TotalValue;
    if (isExportFlow(r.FlowTypeId)) entry.exp += r.TotalValue;
  }

  for (const { code, name, imp, exp } of byCountry.values()) {
    labels[code] = name;
    if (imp > 0) rows.push({ Handelspartner: code, ContentsCode: IMPORT_CONTENTS_CODE, value: round(imp / GBP_TO_THOUSANDS) });
    if (exp > 0) rows.push({ Handelspartner: code, ContentsCode: EXPORT_CONTENTS_CODE, value: round(exp / GBP_TO_THOUSANDS) });
  }

  return { rows, labels: { Handelspartner: labels } };
}

// Builds { rows, labels } for the 10 top-level SITC sections (0-9), summed
// across every partner country for the year -- the UK equivalent of
// TAB3197's TOT-partner-row goods breakdown. CommoditySitcId values with no
// entry in the SITC reference table (~0.03-0.04% of total value in the 2025
// pull -- adjustment/estimate rows, same shape as the partner side's
// EXCLUDED_COUNTRY_IDS) are excluded rather than guessed at, same as SCB's
// own documented confidential-data carve-out that validate.js already
// tolerates via RECONCILE_TOLERANCE.GOODS_WARN/GOODS_ERROR.
async function ingestUkGoods(country) {
  const [sitc, commodityRows] = await Promise.all([fetchSitc(country), fetchGoodsTotals(country)]);

  const sitcById = new Map(sitc.map((s) => [s.CommoditySitcId, s]));
  const bySection = new Map(); // '0'..'9' -> { imp, exp, desc }

  for (const r of commodityRows) {
    if (r.TotalValue == null) continue;
    const meta = sitcById.get(r.CommoditySitcId);
    if (!meta) continue; // unmapped adjustment/estimate row -- excluded, not guessed
    const section = meta.Sitc1Code;
    if (!bySection.has(section)) bySection.set(section, { imp: 0, exp: 0, desc: meta.Sitc1Desc });
    const entry = bySection.get(section);
    if (isImportFlow(r.FlowTypeId)) entry.imp += r.TotalValue;
    if (isExportFlow(r.FlowTypeId)) entry.exp += r.TotalValue;
  }

  const labels = {};
  const rows = [];
  for (const [section, { imp, exp, desc }] of bySection.entries()) {
    labels[section] = desc;
    rows.push({ VarugruppSITCrev3: section, ContentsCode: IMPORT_CONTENTS_CODE, value: round(imp / GBP_TO_THOUSANDS) });
    rows.push({ VarugruppSITCrev3: section, ContentsCode: EXPORT_CONTENTS_CODE, value: round(exp / GBP_TO_THOUSANDS) });
  }

  return { rows, labels: { VarugruppSITCrev3: labels } };
}

// Builds { rows } for the full firstYear..latestYear yearly balance series --
// the UK equivalent of TAB5390. Values are converted to *millions* of GBP
// (not thousands) because analysis/balance.js's own MILLION_TO_THOUSAND
// conversion (x1000) is applied unconditionally to every country's balance
// rows -- feeding it millions here, exactly like SCB's TAB5390 natively
// reports, is what makes that shared, unmodified conversion produce the
// correct thousands-of-GBP figure.
async function ingestUkBalance(country) {
  const t = country.tables.balance;
  const monthlyRows = await fetchBalanceMonthly(country);

  const byYear = new Map(); // year -> { imp, exp }
  for (const r of monthlyRows) {
    if (r.TotalValue == null) continue;
    const year = String(Math.floor(r.MonthId / 100));
    if (!byYear.has(year)) byYear.set(year, { imp: 0, exp: 0 });
    const entry = byYear.get(year);
    if (isImportFlow(r.FlowTypeId)) entry.imp += r.TotalValue;
    if (isExportFlow(r.FlowTypeId)) entry.exp += r.TotalValue;
  }

  const rows = [];
  for (const [year, { imp, exp }] of byYear.entries()) {
    rows.push({ ImportExport: t.importCode, ContentsCode: t.contentsCode, Tid: year, value: round(imp / GBP_TO_MILLIONS) });
    rows.push({ ImportExport: t.exportCode, ContentsCode: t.contentsCode, Tid: year, value: round(exp / GBP_TO_MILLIONS) });
  }

  return { rows };
}

module.exports = {
  ingestUkPartners,
  ingestUkGoods,
  ingestUkBalance,
  planBalanceChunks,
  BALANCE_CHUNK_YEARS,
  EXCLUDED_COUNTRY_IDS,
  IMPORT_FLOW_TYPE_IDS,
  EXPORT_FLOW_TYPE_IDS,
  isImportFlow,
  isExportFlow
};
