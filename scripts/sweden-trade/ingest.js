'use strict';

// Orchestrates one SCB table pull end to end: resolve the requested
// selection against real dimension sizes (metadata), chunk it if it's over
// the cell cap, fetch each chunk (paced to respect the rate limit), and
// decode every chunk into flat rows via the JSON-stat parser.

const { parseJsonStat } = require('./jsonStatParser');
const { planChunks, cellCount } = require('./chunker');
const scbClient = require('./scbClient'); // default client (see the `client` option below) -- preserves every pre-multi-country call site unchanged
const { wait, MIN_CALL_INTERVAL_MS } = require('./httpClient');

const DEFAULT_CELL_CAP = 150000;

// Resolves a selection (dim -> '*' | string[]) into explicit code arrays
// using the table's real dimension categories from metadata. Every
// dimension in the table's `id` list must be present in `selection` --
// SCB 400s on a missing mandatory variable, so we fail the same way here,
// before ever making a network call.
function resolveSelection(metadata, selection) {
  const resolved = {};
  for (const dimId of metadata.id) {
    const requested = selection[dimId];
    if (requested === undefined) {
      throw new Error(`resolveSelection: missing selection for mandatory dimension "${dimId}"`);
    }
    resolved[dimId] = requested === '*' ? Object.keys(metadata.dimension[dimId].category.index) : requested;
  }
  return resolved;
}

function buildLabelsByDimension(metadata) {
  const labels = {};
  for (const dimId of metadata.id) {
    labels[dimId] = metadata.dimension[dimId].category.label || {};
  }
  return labels;
}

// Fetches one table for a given selection, chunking automatically if it's
// over the cell cap, pacing calls between chunks, and parsing every chunk
// into flat rows. Returns { rows, labels, chunkCount, totalCells }.
async function ingestTable(tableId, selection, options = {}) {
  const {
    cellCap = DEFAULT_CELL_CAP,
    preferredChunkDim,
    metadataFixture,
    chunkFixtures, // optional array of fixture names, one per expected chunk (tests / replay)
    baseUrl, // per-country API base URL (see countries/*.config.js); undefined uses the client's own default
    // Which client module drives this pull -- an object shaped like
    // scbClient.js/statbankDkClient.js (fetchTableMetadata + fetchTableDataChunk).
    // Defaults to scbClient so every pre-multi-country call site (including
    // this module's own tests) keeps working unchanged; build.js resolves
    // the right one from country.client (see countries/*.config.js) and
    // passes it in explicitly for every country but Sweden's implicit default.
    client = scbClient
  } = options;

  const metadata = await client.fetchTableMetadata(tableId, { fixtureName: metadataFixture, baseUrl });
  const dimensionCodes = resolveSelection(metadata, selection);
  const chunks = planChunks({ dimensionCodes, cellCap, preferredChunkDim });
  const labels = buildLabelsByDimension(metadata);

  const rows = [];
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await wait(MIN_CALL_INTERVAL_MS);
    const fixtureName = chunkFixtures ? chunkFixtures[i] : undefined;
    const dataset = await client.fetchTableDataChunk(tableId, chunks[i], { fixtureName, baseUrl });
    rows.push(...parseJsonStat(dataset));
  }

  return { rows, labels, metadata, chunkCount: chunks.length, totalCells: cellCount(dimensionCodes) };
}

module.exports = { ingestTable, resolveSelection, buildLabelsByDimension, DEFAULT_CELL_CAP };
