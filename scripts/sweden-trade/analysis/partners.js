'use strict';

// Partner rankings and concentration from TAB3195-shaped rows (trading
// partner x import/export value, one year). "TOT" is the all-partners
// aggregate row every source table used here includes (SCB's TAB3195, DST's
// KN8Y) -- excluded from rankings so it never masquerades as a real
// country, but used as the reconciliation total.
//
// `partnerDim`/`contentsCodeDim` are the row keys holding the partner code
// and the import/export selector, respectively -- SCB's PxWebApi tables
// literally call these "Handelspartner"/"ContentsCode" (the defaults below,
// preserving every existing call site unchanged), but they're real,
// source-specific dimension ids, not universal constants: DST's tables use
// "LAND"/"INDUD" instead (see countries/denmark.config.js's partnerDim/
// contentsCodeDim). A second source with yet another naming convention
// passes its own via these options -- never hardcode a third literal here.

const { share, herfindahlHirschmanIndex } = require('./concentration');

const TOTAL_PARTNER_CODE = 'TOT';

function findTotalImports(rows, importContentsCode, { partnerDim = 'Handelspartner', contentsCodeDim = 'ContentsCode' } = {}) {
  const totRow = rows.find((r) => r[partnerDim] === TOTAL_PARTNER_CODE && r[contentsCodeDim] === importContentsCode);
  if (!totRow) throw new Error('findTotalImports: no TOT row found for the given import ContentsCode');
  return totRow.value;
}

// Import value per real (non-aggregate) partner, keyed by ISO country code.
function extractImportValuesByPartner(rows, importContentsCode, { partnerDim = 'Handelspartner', contentsCodeDim = 'ContentsCode' } = {}) {
  const byCountry = new Map();
  for (const row of rows) {
    if (row[partnerDim] === TOTAL_PARTNER_CODE) continue;
    if (row[contentsCodeDim] !== importContentsCode) continue;
    if (row.value == null) continue;
    byCountry.set(row[partnerDim], row.value);
  }
  return byCountry;
}

// Import + export value per real partner, keyed by ISO country code.
function extractPartnerValues(rows, { importContentsCode, exportContentsCode, partnerDim = 'Handelspartner', contentsCodeDim = 'ContentsCode' }) {
  const byCountry = new Map();
  for (const row of rows) {
    if (row[partnerDim] === TOTAL_PARTNER_CODE) continue;
    if (row[contentsCodeDim] !== importContentsCode && row[contentsCodeDim] !== exportContentsCode) continue;
    if (!byCountry.has(row[partnerDim])) {
      byCountry.set(row[partnerDim], { importValue: null, exportValue: null });
    }
    const entry = byCountry.get(row[partnerDim]);
    if (row[contentsCodeDim] === importContentsCode) entry.importValue = row.value;
    if (row[contentsCodeDim] === exportContentsCode) entry.exportValue = row.value;
  }
  return byCountry;
}

// Top-N partners by import value, with the label + coordinate lookups the
// schema requires. Throws rather than inventing a lat/lon if a top-N
// partner has no configured coordinates.
function topPartnersByImportValue(rows, { importContentsCode, exportContentsCode, labels, coords, n = 10, partnerDim = 'Handelspartner', contentsCodeDim = 'ContentsCode' }) {
  const totalImports = findTotalImports(rows, importContentsCode, { partnerDim, contentsCodeDim });
  const byCountry = extractPartnerValues(rows, { importContentsCode, exportContentsCode, partnerDim, contentsCodeDim });

  const ranked = [...byCountry.entries()]
    .filter(([, v]) => v.importValue != null)
    .sort((a, b) => b[1].importValue - a[1].importValue)
    .slice(0, n);

  return ranked.map(([code, v]) => {
    const coord = coords[code];
    if (!coord) {
      throw new Error(
        `topPartnersByImportValue: no coordinates configured for partner "${code}" ` +
        `(${labels[code] || 'unknown label'}) -- add it to coords.js, never invent one`
      );
    }
    return {
      code,
      // SCB's own label text, trimmed of incidental whitespace (e.g. "Kingdom
      // of the Netherlands " has a trailing space in the source) -- this is
      // formatting hygiene on a real label, never a rewording of it.
      label: (labels[code] || code).trim(),
      importValue: v.importValue,
      exportValue: v.exportValue,
      share: share(v.importValue, totalImports),
      lat: coord.lat,
      lon: coord.lon
    };
  });
}

// Concentration over ALL real partners (not just the top N), per
// SWEDEN_TRADE_SCHEMA.md.
function partnerConcentration(rows, { importContentsCode, top5N = 5, top10N = 10, partnerDim = 'Handelspartner', contentsCodeDim = 'ContentsCode' }) {
  const totalImports = findTotalImports(rows, importContentsCode, { partnerDim, contentsCodeDim });
  const importValues = [...extractImportValuesByPartner(rows, importContentsCode, { partnerDim, contentsCodeDim }).values()];
  const sorted = [...importValues].sort((a, b) => b - a);

  const top5Sum = sorted.slice(0, top5N).reduce((sum, v) => sum + v, 0);
  const top10Sum = sorted.slice(0, top10N).reduce((sum, v) => sum + v, 0);

  return {
    top5PartnerImportShare: share(top5Sum, totalImports),
    top10PartnerImportShare: share(top10Sum, totalImports),
    hhiPartners: herfindahlHirschmanIndex(importValues, totalImports)
  };
}

module.exports = {
  TOTAL_PARTNER_CODE,
  findTotalImports,
  extractImportValuesByPartner,
  extractPartnerValues,
  topPartnersByImportValue,
  partnerConcentration
};
