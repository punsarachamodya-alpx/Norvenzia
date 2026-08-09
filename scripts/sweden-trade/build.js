'use strict';

// Offline analysis job (see docs/internal/SWEDEN_TRADE_BUILD_INSTRUCTIONS.md
// §4, §9 Stage 2): ingest -> parse -> analyse -> validate -> atomic-write
// content/trade-data/<code>.json for one configured country. Run with
// `npm run data:sweden-trade` (defaults to Sweden), or pass a country
// explicitly with `node scripts/sweden-trade/build.js --country=se`, or
// `TRADE_USE_FIXTURE=1 npm run data:sweden-trade` to replay from the
// committed fixtures instead of calling the source API (deterministic,
// network-free).
//
// This is a generic runner: every Sweden-specific value (table ids,
// dimension names, content codes, years, output path, fixtures) lives in a
// country config under ./countries/ (see countries/sweden.config.js) --
// this file only knows how to drive the ingest/analysis pipeline given one
// of those configs. Sweden is the only populated country as of this
// writing; adding a second country is a new config file, not a change here.
//
// The live site has zero runtime dependency on the source API -- this
// script is the only thing that ever talks to it, and its only output is
// the static file the story page reads.

const fs = require('fs');
const path = require('path');

const { ingestTable } = require('./ingest');
const { ingestUkPartners, ingestUkGoods, ingestUkBalance } = require('./ukIngest');
const { ingestPartners: ingestFinlandPartners, ingestGoods: ingestFinlandGoods, ingestBalance: ingestFinlandBalance } = require('./tulliIngest');
const { topPartnersByImportValue, partnerConcentration } = require('./analysis/partners');
const { topGoodsCategoriesByImportValue, top5GoodsImportShare } = require('./analysis/goods');
const { buildBalanceSeries, buildTrendSeries } = require('./analysis/balance');
const { assertValid } = require('./validate');
const coords = require('./coords');

const REPO_ROOT = path.join(__dirname, '..', '..');
const DEFAULT_COUNTRY = 'se';

// Which client module drives ingestion for a given country.client value
// (see countries/*.config.js's own `client` field). 'pxweb' is SCB's
// PxWebApi v2 (scbClient.js); 'statbank-dk' is DST's differently-shaped
// StatBank API (statbankDkClient.js) -- see that module's header comment
// for exactly how its raw responses differ from PxWebApi's.
const CLIENTS = {
  pxweb: require('./scbClient'),
  'statbank-dk': require('./statbankDkClient')
};

function resolveClient(country) {
  const client = CLIENTS[country.client];
  if (!client) throw new Error(`resolveClient: no client module registered for country.client="${country.client}"`);
  return client;
}

function parseCountryArg(argv) {
  const flag = argv.find((a) => a.startsWith('--country='));
  return (flag ? flag.slice('--country='.length) : DEFAULT_COUNTRY).toLowerCase();
}

// Config filenames are the country's full name (sweden.config.js), not its
// ISO code, since --country= takes the short code (se) a visitor sees in
// the URL (/insights/trade/se) -- this scans every *.config.js in
// ./countries and matches on the config's own `code` field rather than
// requiring the two to be spelled the same way.
//
// A config may also declare an explicit `slug` when the URL/CLI short name
// visitors actually use isn't the real ISO 3166-1 alpha-2 code -- e.g. the
// UK's config keeps `code: 'GB'` (the real ISO code, needed anywhere UK
// appears as a *partner* in another country's data) but `slug: 'uk'` (what
// this site and `--country=` both call it). `slug` wins when present;
// falls back to `code` for every config that doesn't need the distinction.
function loadCountryConfig(countryCode) {
  const countriesDir = path.join(__dirname, 'countries');
  const files = fs.readdirSync(countriesDir).filter((f) => f.endsWith('.config.js'));
  for (const file of files) {
    const config = require(path.join(countriesDir, file));
    const matchKey = String(config.slug || config.code).toLowerCase();
    if (matchKey === countryCode) return config;
  }
  throw new Error(`No country config found for code "${countryCode}" in ${countriesDir}`);
}

function yearRange(first, last) {
  const years = [];
  for (let y = first; y <= last; y++) years.push(String(y));
  return years;
}

// A table can override the default Tid selection (bare year strings) via a
// `tidValues(country)` function in its own config -- needed when a source's
// time dimension isn't year-granular, e.g. DST's UHM only publishes monthly
// figures ("2025M01".."2025M12"), so countries/denmark.config.js's goods
// table supplies its own tidValues instead of relying on the bare-year
// default every other table uses.
function resolveTid(table, country, defaultTid) {
  return typeof table.tidValues === 'function' ? table.tidValues(country) : defaultTid;
}

// Sums rows sharing every dimension key except Tid/value into one row per
// remaining-key combination. Used when a table's config sets
// `collapseTid: true` because its only available time granularity is finer
// than the output needs -- e.g. DST doesn't publish an annual goods-by-
// category table on a live/current table (see countries/denmark.config.js's
// goods table comment for the real-data confirmation that summing 12 real
// published monthly DKK figures reproduces DST's own annual total). A no-op
// for every table that doesn't set the flag, which is every existing one.
function collapseTimeDimension(rows) {
  const byKey = new Map();
  for (const row of rows) {
    const { Tid, value, ...rest } = row;
    const key = JSON.stringify(rest);
    if (!byKey.has(key)) byKey.set(key, { ...rest, value: 0 });
    if (value != null) byKey.get(key).value += value;
  }
  return [...byKey.values()];
}

// Rescales every row's value by a fixed multiplier -- used when a source
// table's native unit differs from the thousands-of-currency-unit
// convention every figure in the output file follows (e.g. DST's KN8Y
// reports raw DKK, not thousands; see countries/denmark.config.js's
// `valueScale` fields). A no-op for every table that doesn't set
// `valueScale`, which is every existing one -- their source units already
// match the convention.
function scaleRows(rows, multiplier) {
  if (!multiplier || multiplier === 1) return rows;
  return rows.map((r) => (r.value == null ? r : { ...r, value: r.value * multiplier }));
}

// Fixture filenames in a country config are bare (e.g. "tab3195-metadata.json");
// this joins on the config's fixturesDir subfolder (e.g. "se") so scbClient.js
// itself never needs to know about per-country layout.
function fixtureName(country, name) {
  return `${country.fixturesDir}/${name}`;
}

// Every country config declares which HTTP client drives its ingestion
// (`client: 'pxweb'`, `'uktradeinfo'` or `'tulli'`, see countries/*.config.js)
// -- PxWeb-shaped sources go through ingest.js's generic table/dimension
// ingestTable(); uktradeinfo (OData, no table-selection concept) goes
// through ukIngest.js's own per-table queries, and tulli (Finnish Customs'
// Uljas API, also no table-selection concept) goes through tulliIngest.js's
// own per-table queries. ukIngest.js/tulliIngest.js each resolve their own
// config's bare fixture names onto fixturesDir internally, so the country
// config is passed through unmodified here, same as the 'pxweb' branch
// receives it as-authored. All three branches return the same
// { rows, labels } shape build.js's analysis calls below expect.
async function ingestPartners(country) {
  if (country.client === 'uktradeinfo') return ingestUkPartners(country);
  if (country.client === 'tulli') return ingestFinlandPartners(country);

  const t = country.tables.partners;
  return ingestTable(
    t.id,
    { ...t.selection, Tid: resolveTid(t, country, [String(country.latestYear)]) },
    {
      baseUrl: country.baseUrl,
      client: resolveClient(country),
      metadataFixture: fixtureName(country, t.metadataFixture),
      chunkFixtures: t.chunkFixtures.map((f) => fixtureName(country, f))
    }
  );
}

async function ingestGoods(country) {
  if (country.client === 'uktradeinfo') return ingestUkGoods(country);
  if (country.client === 'tulli') return ingestFinlandGoods(country);

  const t = country.tables.goods;
  // Which row key selects import vs export -- SCB's tables call it
  // "ContentsCode" (the default, unchanged for Sweden); DST's UHM calls it
  // "INDUD" instead (see countries/denmark.config.js's goods.contentsCodeDim).
  const contentsCodeDim = t.contentsCodeDim || 'ContentsCode';
  const result = await ingestTable(
    t.id,
    { ...t.selection, [contentsCodeDim]: [t.importContentsCode, t.exportContentsCode], Tid: resolveTid(t, country, [String(country.latestYear)]) },
    {
      baseUrl: country.baseUrl,
      client: resolveClient(country),
      metadataFixture: fixtureName(country, t.metadataFixture),
      chunkFixtures: t.chunkFixtures.map((f) => fixtureName(country, f))
    }
  );
  // See collapseTimeDimension's own comment: only DST's monthly-only UHM
  // sets this flag today.
  return t.collapseTid ? { ...result, rows: collapseTimeDimension(result.rows) } : result;
}

async function ingestBalance(country) {
  if (country.client === 'uktradeinfo') return ingestUkBalance(country);
  if (country.client === 'tulli') return ingestFinlandBalance(country);

  const t = country.tables.balance;
  return ingestTable(
    t.id,
    { ...t.selection, Tid: resolveTid(t, country, yearRange(country.firstYear, country.latestYear)) },
    {
      baseUrl: country.baseUrl,
      client: resolveClient(country),
      metadataFixture: fixtureName(country, t.metadataFixture),
      chunkFixtures: t.chunkFixtures.map((f) => fixtureName(country, f))
    }
  );
}

// buildHero reads the partners table's TOT row keyed by its own
// partnerDim/contentsCodeDim (config-driven -- "Handelspartner"/
// "ContentsCode" for SCB's TAB3195, "LAND"/"INDUD" for DST's KN8Y, see
// countries/*.config.js). The 'TOT' aggregate-row code itself is treated as
// a real constant across every source used so far (matches
// analysis/partners.js's own TOTAL_PARTNER_CODE) -- a source using a
// different total-row code would need its own equivalent, not a config knob
// here.
function buildHero(country, partnerRows) {
  const t = country.tables.partners;
  const contentsCodeDim = t.contentsCodeDim || 'ContentsCode';
  const totRow = partnerRows.find((r) => r[t.partnerDim] === 'TOT' && r[contentsCodeDim] === t.importContentsCode);
  const totExportRow = partnerRows.find((r) => r[t.partnerDim] === 'TOT' && r[contentsCodeDim] === t.exportContentsCode);
  if (!totRow || !totExportRow) throw new Error('buildHero: TAB3195 TOT rows not found for the configured ContentsCode');
  return {
    year: country.latestYear,
    totalImportsValue: totRow.value,
    totalExportsValue: totExportRow.value,
    tradeBalanceValue: totExportRow.value - totRow.value
  };
}

function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, filePath);
}

function formatCurrency(thousands, currencyCode) {
  const units = thousands * 1000;
  return `${currencyCode} ${(units / 1e9).toFixed(1)}bn`;
}

async function main() {
  const countryCode = parseCountryArg(process.argv.slice(2));
  const country = loadCountryConfig(countryCode);
  const outputPath = path.join(REPO_ROOT, ...country.outputPath);

  const [partners, goods, balanceSource] = await Promise.all([
    ingestPartners(country),
    ingestGoods(country),
    ingestBalance(country)
  ]);

  const partnersTable = country.tables.partners;
  const goodsTable = country.tables.goods;
  const balanceTable = country.tables.balance;

  // See scaleRows's own comment: a no-op unless a table sets `valueScale`
  // (only DST's KN8Y/UHM-sourced tables do, to reach the thousands-of-
  // currency-unit convention every other figure in the file follows).
  const partnerRows = scaleRows(partners.rows, partnersTable.valueScale);
  const goodsRows = scaleRows(goods.rows, goodsTable.valueScale);

  const hero = buildHero(country, partnerRows);

  const topPartners = topPartnersByImportValue(partnerRows, {
    importContentsCode: partnersTable.importContentsCode,
    exportContentsCode: partnersTable.exportContentsCode,
    labels: partners.labels[partnersTable.partnerDim],
    coords,
    n: 10,
    partnerDim: partnersTable.partnerDim,
    contentsCodeDim: partnersTable.contentsCodeDim
  });

  const partnerConc = partnerConcentration(partnerRows, {
    importContentsCode: partnersTable.importContentsCode,
    partnerDim: partnersTable.partnerDim,
    contentsCodeDim: partnersTable.contentsCodeDim
  });

  const topGoodsCategories = topGoodsCategoriesByImportValue(goodsRows, {
    importContentsCode: goodsTable.importContentsCode,
    labels: goods.labels[goodsTable.goodsGroupDim],
    n: 10,
    contentsCodeDim: goodsTable.contentsCodeDim,
    goodsGroupDim: goodsTable.goodsGroupDim
  });

  const goodsShare5 = top5GoodsImportShare(goodsRows, {
    importContentsCode: goodsTable.importContentsCode,
    n: 5,
    contentsCodeDim: goodsTable.contentsCodeDim
  });

  const balance = buildBalanceSeries(balanceSource.rows, {
    importCode: balanceTable.importCode,
    exportCode: balanceTable.exportCode,
    contentsCode: balanceTable.contentsCode,
    unitMultiplier: balanceTable.unitMultiplier,
    importExportDim: balanceTable.importExportDim,
    contentsCodeDim: balanceTable.contentsCodeDim
  });
  const trend = buildTrendSeries(balance);

  const dataset = {
    meta: {
      country: country.name,
      countryCode: country.code,
      currency: country.currency,
      source: country.source,
      sourceUrl: country.sourceUrl,
      tables: [partnersTable.id, goodsTable.id, balanceTable.id],
      generatedAt: new Date().toISOString(),
      latestYear: country.latestYear,
      yearsCovered: balance.years
    },
    hero,
    topGoodsCategories,
    topPartners,
    concentration: {
      top5PartnerImportShare: partnerConc.top5PartnerImportShare,
      top10PartnerImportShare: partnerConc.top10PartnerImportShare,
      hhiPartners: partnerConc.hhiPartners,
      top5GoodsImportShare: goodsShare5
    },
    balance,
    trend
  };

  const { warnings } = assertValid(dataset);

  atomicWriteJson(outputPath, dataset);

  console.log(`\nWrote ${outputPath}`);
  console.log(`Validation: 0 errors, ${warnings.length} warning(s).`);

  console.log(
    `\nHero ${country.latestYear}: imports ${formatCurrency(hero.totalImportsValue, country.currency)}, ` +
      `exports ${formatCurrency(hero.totalExportsValue, country.currency)}, ` +
      `balance ${hero.tradeBalanceValue >= 0 ? '+' : ''}${formatCurrency(hero.tradeBalanceValue, country.currency)} ` +
      `(${hero.tradeBalanceValue >= 0 ? 'surplus' : 'deficit'})`
  );

  const lastTrendIdx = trend.years.length - 1;
  if (lastTrendIdx >= 0) {
    const importGrowth = (trend.importGrowthPct[lastTrendIdx] * 100).toFixed(1);
    const exportGrowth = (trend.exportGrowthPct[lastTrendIdx] * 100).toFixed(1);
    console.log(`YoY ${trend.years[lastTrendIdx]} vs ${trend.years[lastTrendIdx] - 1}: imports ${importGrowth}%, exports ${exportGrowth}%`);
  }

  console.log('\nTop goods categories by import value:');
  topGoodsCategories.forEach((g, i) => {
    console.log(`  ${i + 1}. [${g.code}] ${g.label}: ${formatCurrency(g.importValue, country.currency)} (${(g.share * 100).toFixed(1)}%)`);
  });
}

main().catch((err) => {
  console.error(`\ntrade-data build failed: ${err.message}`);
  process.exitCode = 1;
});
