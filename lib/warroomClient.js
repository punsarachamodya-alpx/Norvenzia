'use strict';

// Server-side client for the War Room investigation service (a separate,
// independently deployed Python/LangGraph microservice -- see
// docs/internal/WARROOM_BUILD_PLAN.md and WARROOM_API_CONTRACT.md). Same
// doctrine as lib/misClient.js: every call here is designed to never throw
// and never leak WARROOM_BASE_URL to the caller. War Room being unset, down,
// slow, not yet deployed, or rejecting the request (e.g. an API key
// mismatch) all still collapse to the same `{ available: false }` shape to
// the *caller* -- server.js's route handlers just check that flag and
// degrade cleanly, same as they already do for MIS. But those causes are
// no longer indistinguishable to whoever is debugging: each is logged
// server-side (console.error, `[warroom]` prefix) with which one it was,
// so "down" and "up but rejecting us" don't both read as a mystery outage.

const DEFAULT_TIMEOUT_MS = 5000;

async function requestJson(
  url,
  { method = 'GET', body, apiKey, timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (apiKey) headers['X-API-Key'] = apiKey;
    const res = await fetchImpl(url, {
      method,
      headers: Object.keys(headers).length ? headers : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    let json = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { status: res.status, json };
  } catch (err) {
    // Network error, timeout, DNS failure, connection refused -- the one
    // failure mode that's genuinely "War Room isn't reachable." Logged
    // here, distinctly from logUnexpectedStatus() below, so a real outage
    // is never confused in the logs with War Room being reachable but
    // rejecting the request (e.g. a WARROOM_API_KEY mismatch) -- both used
    // to collapse into the same silent `{ available: false }` with nothing
    // in the logs to tell them apart.
    console.error(`[warroom] ${method} ${url} — network error: ${err.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Logs a response that came back from War Room (so it's reachable and
// answering) but wasn't one of the statuses the caller explicitly handles.
// Never thrown, never surfaced to the browser -- purely so an operator can
// tell "War Room is down" apart from "War Room is up but rejecting us"
// (wrong/missing WARROOM_API_KEY, or WARROOM_API_CONTRACT.md's documented
// 503 when War Room's own key isn't configured) from the server logs,
// instead of both looking identical to a real outage.
function logUnexpectedStatus(action, result) {
  if (result.status === 401 || result.status === 403) {
    console.error(`[warroom] ${action} got ${result.status} from War Room — check WARROOM_API_KEY.`);
  } else if (result.status === 503) {
    console.error(`[warroom] ${action} got 503 — War Room is reachable but its own API key isn't configured.`);
  } else {
    console.error(`[warroom] ${action} got an unexpected response (status ${result.status}).`);
  }
}

// Kicks off a job. Never throws; the shape below is what server.js's route
// handlers branch on.
async function createInvestigation(baseUrl, payload, opts) {
  if (!baseUrl) return { available: false };

  const result = await requestJson(`${baseUrl}/api/v1/investigations`, { method: 'POST', body: payload, ...opts });
  if (!result) return { available: false };

  if (result.status === 429) return { available: true, rateLimited: true };
  if (result.status === 400) return { available: true, invalid: true };
  if (!result.json || typeof result.json.jobId !== 'string') {
    logUnexpectedStatus('createInvestigation', result);
    return { available: false };
  }

  return {
    available: true,
    jobId: result.json.jobId,
    status: result.json.status,
    cachedFrom: result.json.cachedFrom || null
  };
}

// Polls job status/result. Never throws; returns the War Room response body
// verbatim (already validated to be JSON) alongside `available: true`, or
// `{ available: false }` on any failure.
async function getInvestigation(baseUrl, jobId, opts) {
  if (!baseUrl) return { available: false };

  const result = await requestJson(`${baseUrl}/api/v1/investigations/${encodeURIComponent(jobId)}`, opts);
  if (!result || result.status === 404) return { available: false };
  // Anything other than 200 (401/403/503/5xx/...) means War Room answered
  // but didn't return a real job-status body -- even if it happens to be
  // JSON (e.g. `{"detail": "invalid or missing API key"}`), spreading it
  // into the response would forward `available: true` with no recognizable
  // `status` field, which the client currently renders as "This
  // investigation failed" -- misleading for what's actually an auth/config
  // problem no retry will fix.
  if (result.status !== 200 || !result.json) {
    logUnexpectedStatus('getInvestigation', result);
    return { available: false };
  }

  return { available: true, ...result.json };
}

module.exports = { createInvestigation, getInvestigation, requestJson, DEFAULT_TIMEOUT_MS };
