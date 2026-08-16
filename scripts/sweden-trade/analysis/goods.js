'use strict';

// Goods-category breakdown from TAB3197 rows, restricted by the caller to
// the "TOT" (all trading partners) row and the top-level SITC rev3/rev4
// sections (codes "0".."9" -- the coarsest split, an exhaustive partition
// of all traded goods). This is Sweden's total imports by category, not
// category x country.
//
// Shares here are computed against the sum of the fetched sections, not
// against hero.totalImportsValue (a different SCB table): TAB3197 explicitly
// excludes confidential data (see its own metadata note), so its total runs
// a few percent below TAB3195's adjusted total. build.js's validation step
// checks that gap stays within a known, sane bound rather than silently
// accepting a mismatch.

const { share } = require('./concentration');

function totalGoodsImports(importRows) {
  return importRows.reduce((sum, r) => sum + r.value, 0);
}

// `contentsCodeDim`/`goodsGroupDim` name the row keys holding the import/
// export selector and the goods-category code -- SCB's TAB3197 calls these
// "ContentsCode"/"VarugruppSITCrev3" (the defaults below, unchanged for
// every existing call site); DST's UHM calls them "INDUD"/"POST" instead
// (see countries/denmark.config.js).
function topGoodsCategoriesByImportValue(rows, { importContentsCode, labels, n = 10, contentsCodeDim = 'ContentsCode', goodsGroupDim = 'VarugruppSITCrev3' }) {
  const importRows = rows.filter((r) => r[contentsCodeDim] === importContentsCode && r.value != null);
  const total = totalGoodsImports(importRows);

  return [...importRows]
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
    .map((r) => ({
      code: r[goodsGroupDim],
      label: (labels[r[goodsGroupDim]] || r[goodsGroupDim]).trim(),
      importValue: r.value,
      share: share(r.value, total)
    }));
}

function top5GoodsImportShare(rows, { importContentsCode, n = 5, contentsCodeDim = 'ContentsCode' }) {
  const importRows = rows.filter((r) => r[contentsCodeDim] === importContentsCode && r.value != null);
  const total = totalGoodsImports(importRows);
  const topSum = [...importRows]
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
    .reduce((sum, r) => sum + r.value, 0);
  return share(topSum, total);
}

module.exports = { topGoodsCategoriesByImportValue, top5GoodsImportShare, totalGoodsImports };
