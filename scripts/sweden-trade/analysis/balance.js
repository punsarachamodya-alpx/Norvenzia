'use strict';

// Trade-balance time series from TAB5390 rows (Imports/Exports/Net Trade
// totals, one row per year per ImportExport code).

const MILLION_TO_THOUSAND = 1000;

// TAB5390 reports its native unit in millions; every other figure in the
// output file (TAB3195/TAB3197-derived) is in thousands, so we convert here
// once, x1000 exactly (lossless), to keep the whole file in one consistent
// unit. This is a unit conversion of a table's own reported number, not a
// rescale or estimate of it. `unitMultiplier` makes that conversion factor
// explicit rather than assuming every source reports in millions: it
// defaults to MILLION_TO_THOUSAND (SCB's TAB5390), but DST's KN8Y reports
// raw DKK (not millions) for the balance series, so
// countries/denmark.config.js passes 0.001 instead (see its own comment for
// the real-data confirmation). `importExportDim` is the row key holding the
// import/export selector -- "ImportExport" for SCB's TAB5390 (default,
// unchanged), "INDUD" for DST's KN8Y.
function buildBalanceSeries(rows, { importCode = 'ITOT', exportCode = 'ETOT', contentsCode, unitMultiplier = MILLION_TO_THOUSAND, importExportDim = 'ImportExport', contentsCodeDim = 'ContentsCode' }) {
  const byYear = new Map();
  for (const row of rows) {
    if (row[contentsCodeDim] !== contentsCode) continue;
    if (row[importExportDim] !== importCode && row[importExportDim] !== exportCode) continue;
    if (!byYear.has(row.Tid)) byYear.set(row.Tid, {});
    const entry = byYear.get(row.Tid);
    if (row[importExportDim] === importCode) entry.importsValue = row.value * unitMultiplier;
    if (row[importExportDim] === exportCode) entry.exportsValue = row.value * unitMultiplier;
  }

  const years = [...byYear.keys()].sort((a, b) => Number(a) - Number(b));
  const importsValue = [];
  const exportsValue = [];
  const balanceValue = [];

  for (const year of years) {
    const entry = byYear.get(year);
    if (entry.importsValue == null || entry.exportsValue == null) {
      throw new Error(`buildBalanceSeries: year ${year} is missing an imports or exports value`);
    }
    importsValue.push(entry.importsValue);
    exportsValue.push(entry.exportsValue);
    balanceValue.push(entry.exportsValue - entry.importsValue);
  }

  return { years: years.map(Number), importsValue, exportsValue, balanceValue };
}

// Year-over-year % change: (thisYear - lastYear) / lastYear, per
// SWEDEN_TRADE_SCHEMA.md. The first year has no prior-year comparison so
// it's omitted entirely, never backfilled with a fabricated 0.
function buildTrendSeries(balance) {
  const years = [];
  const importGrowthPct = [];
  const exportGrowthPct = [];

  for (let i = 1; i < balance.years.length; i++) {
    const prevImports = balance.importsValue[i - 1];
    const prevExports = balance.exportsValue[i - 1];
    years.push(balance.years[i]);
    importGrowthPct.push((balance.importsValue[i] - prevImports) / prevImports);
    exportGrowthPct.push((balance.exportsValue[i] - prevExports) / prevExports);
  }

  return { years, importGrowthPct, exportGrowthPct };
}

module.exports = { buildBalanceSeries, buildTrendSeries, MILLION_TO_THOUSAND };
