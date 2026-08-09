'use strict';

// Thin JSON-over-HTTP wrapper shared by every country client (scbClient.js's
// GET-only PxWebApi v2 calls, statbankDkClient.js's POST-based DST StatBank
// calls) with real backoff/pacing -- not a busy-loop. Retries sleep via
// setTimeout with exponential backoff; callers making several calls in a
// batch should pace them with `wait(MIN_CALL_INTERVAL_MS)` between calls to
// stay under each source's documented rate limit (SCB: ~30 calls / 10s per
// IP -- see docs/internal/SWEDEN_TRADE_BUILD_INSTRUCTIONS.md Appendix).

const MIN_CALL_INTERVAL_MS = 400; // ~25 calls/10s -- under SCB's ~30/10s limit with margin
const MAX_RETRIES = 4;
const RETRY_BASE_DELAY_MS = 1000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Shared retry/backoff loop -- `init` is an optional fetch() RequestInit
// (undefined for a plain GET, {method:'POST',...} for a POST body). `label`
// only affects the thrown error's prefix so failures are traceable to the
// source that produced them.
async function requestWithRetry(url, init, { retries = MAX_RETRIES, label = 'HTTP' } = {}) {
  let attempt = 0;
  for (;;) {
    const res = await fetch(url, init);
    if (res.ok) return res.json();

    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retries) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `${label} request failed: ${res.status} ${res.statusText} for ${url}` +
        (body ? ` -- ${body.slice(0, 500)}` : '')
      );
    }
    const delay = RETRY_BASE_DELAY_MS * 2 ** attempt;
    console.warn(`[${label.toLowerCase()}] ${res.status} on attempt ${attempt + 1}, retrying in ${delay}ms: ${url}`);
    await wait(delay);
    attempt += 1;
  }
}

async function fetchJson(url, { retries = MAX_RETRIES } = {}) {
  return requestWithRetry(url, undefined, { retries, label: 'SCB' });
}

// DST's StatBank API is POST-based (see statbankDkClient.js): the selection
// goes in a JSON request body, not query-string valuecodes[] params like
// SCB's GET-only PxWebApi v2.
async function postJson(url, body, { retries = MAX_RETRIES, label = 'DST' } = {}) {
  return requestWithRetry(
    url,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    { retries, label }
  );
}

module.exports = { fetchJson, postJson, wait, MIN_CALL_INTERVAL_MS };
