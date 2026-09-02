'use strict';

// "Battle" tests: adversarial/degraded conditions the other test files don't
// specifically target -- malformed upstream responses, slow upstreams,
// brute-force login attempts, hostile form input, and tampered admin
// sessions. Every upstream here is either an injected fetchImpl (no real
// network) or an in-process fake HTTP server, same doctrine as
// test/live.test.js and test/warroom.test.js.

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ci-test-password-only';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'ci-test-session-secret';

const misClient = require('../lib/misClient');
const warroomClient = require('../lib/warroomClient');

// ---------------------------------------------------------- malformed body

test('getHealth returns null (never throws) when MIS returns a body that is not JSON at all', async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON at position 0');
    },
  });
  assert.equal(await misClient.getHealth('http://mis.local', { fetchImpl }), null);
});

test('getDisruptions returns null (never throws) when MIS returns malformed JSON', async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => {
      throw new SyntaxError('Unexpected end of JSON input');
    },
  });
  assert.equal(await misClient.getDisruptions('http://mis.local', { fetchImpl }), null);
});

test('getDisruptions returns null when MIS returns valid JSON of the wrong shape (a bare array, not {events: [...]})', async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => [1, 2, 3] });
  assert.equal(await misClient.getDisruptions('http://mis.local', { fetchImpl }), null);
});

test('createInvestigation returns {available:false} (never throws) when War Room returns malformed JSON', async () => {
  const fetchImpl = async () => ({
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected token in JSON');
    },
  });
  const result = await warroomClient.createInvestigation('http://warroom.local', { incidentId: 'e' }, { fetchImpl });
  assert.deepEqual(result, { available: false });
});

// End-to-end version of the same scenario through the real app + a real
// (fake) MIS server, so this proves the whole /intelligence path, not just
// the client library in isolation.
test('GET /intelligence degrades gracefully (200) when MIS returns garbage instead of JSON', async () => {
  const fakeMis = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end('this is not { valid json');
  });
  await new Promise((resolve) => fakeMis.listen(0, resolve));
  const misPort = fakeMis.address().port;

  delete require.cache[require.resolve('../server.js')];
  process.env.MIS_BASE_URL = `http://127.0.0.1:${misPort}`;
  const app = require('../server.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    const res = await fetch(`${base}/intelligence`);
    const body = await res.text();
    assert.equal(res.status, 200);
    assert.ok(body.includes('temporarily unavailable'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => fakeMis.close(resolve));
    delete process.env.MIS_BASE_URL;
  }
});

// ------------------------------------------------------- slow upstream/timeout

// A short, injected timeoutMs plus a fetchImpl that actually honors
// AbortSignal (the way the real global fetch does) proves the timeout
// wiring itself works, without a multi-second real-time sleep in the test
// suite: the mock never resolves on its own, so the only way this test
// finishes is the library's own abort firing.
function neverResolvingButAbortable() {
  return (url, { signal } = {}) =>
    new Promise((resolve, reject) => {
      if (!signal) return; // would hang forever -- only correct if the caller always passes one
      signal.addEventListener('abort', () => reject(new Error('AbortError')));
    });
}

test('getHealth resolves to null quickly when MIS is slow, instead of hanging until the caller times out', async () => {
  const fetchImpl = neverResolvingButAbortable();
  const start = Date.now();
  const result = await misClient.getHealth('http://mis.local', { fetchImpl, timeoutMs: 50 });
  const elapsed = Date.now() - start;
  assert.equal(result, null);
  assert.ok(elapsed < 1000, `expected the 50ms timeout to bound this, took ${elapsed}ms`);
});

test('getDisruptions resolves to null quickly when MIS is slow', async () => {
  const fetchImpl = neverResolvingButAbortable();
  const start = Date.now();
  const result = await misClient.getDisruptions('http://mis.local', { fetchImpl, timeoutMs: 50 });
  const elapsed = Date.now() - start;
  assert.equal(result, null);
  assert.ok(elapsed < 1000, `expected the 50ms timeout to bound this, took ${elapsed}ms`);
});

test('createInvestigation resolves to {available:false} quickly when War Room is slow', async () => {
  const fetchImpl = neverResolvingButAbortable();
  const start = Date.now();
  const result = await warroomClient.createInvestigation(
    'http://warroom.local',
    { incidentId: 'e' },
    { fetchImpl, timeoutMs: 50 },
  );
  const elapsed = Date.now() - start;
  assert.deepEqual(result, { available: false });
  assert.ok(elapsed < 1000, `expected the 50ms timeout to bound this, took ${elapsed}ms`);
});

test('getInvestigation resolves to {available:false} quickly when War Room is slow', async () => {
  const fetchImpl = neverResolvingButAbortable();
  const start = Date.now();
  const result = await warroomClient.getInvestigation('http://warroom.local', 'wrj_x', { fetchImpl, timeoutMs: 50 });
  const elapsed = Date.now() - start;
  assert.deepEqual(result, { available: false });
  assert.ok(elapsed < 1000, `expected the 50ms timeout to bound this, took ${elapsed}ms`);
});

// --------------------------------------------------- hostile contact input

test('POST /contact with a single field over MAX_FIELD_LENGTH is a clean 422, not a 500', async () => {
  delete require.cache[require.resolve('../server.js')];
  const app = require('../server.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    const overlong = 'x'.repeat(5000); // over the 4000-char MAX_FIELD_LENGTH, under the 100kb body cap
    const res = await fetch(`${base}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `name=Test&company=Test+Co&email=test%40example.com&country=Sweden&message=${overlong}`
    });
    const body = await res.text();
    assert.equal(res.status, 422);
    assert.ok(body.includes('characters'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// Regression test for a real bug found while writing this suite: an
// oversized raw request body (over body-parser's 100kb default limit, e.g.
// one enormous field) makes express.urlencoded() throw entity.too.large
// synchronously, before server.js's own MAX_FIELD_LENGTH validation ever
// runs and before the res.locals.site/nav/appearance middleware used to run
// (it sat after the parser). That middleware never ran, so the generic
// error handler's own res.locals.site.publicName reference crashed a
// second time, and Express's built-in fallback returned a raw stack trace
// -- including local filesystem paths -- to the client. Fixed by moving
// the res.locals.site/nav/appearance middleware ahead of body parsing
// (server.js) and by handling entity.too.large explicitly with a plain 413
// instead of falling through to the generic 500 page (also server.js).
test('POST /contact with a body over the parser size limit is a clean 413, not a 500 or a leaked stack trace', async () => {
  delete require.cache[require.resolve('../server.js')];
  const app = require('../server.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    const huge = 'a'.repeat(200 * 1024); // over body-parser's 100kb default limit
    const res = await fetch(`${base}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `name=Test&company=Test+Co&email=test%40example.com&country=Sweden&message=${huge}`
    });
    const body = await res.text();
    assert.equal(res.status, 413);
    assert.ok(!body.includes('at Object.'), 'must never leak a JS stack trace to the client');
    assert.ok(!body.toLowerCase().includes('c:\\users'), 'must never leak a local filesystem path');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ------------------------------------------------ tampered admin sessions

test('GET /admin with a garbage/forged session cookie redirects to login, not a crash', async () => {
  delete require.cache[require.resolve('../server.js')];
  const app = require('../server.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    const res = await fetch(`${base}/admin`, {
      redirect: 'manual',
      headers: { Cookie: 'mxg.sid=s%3Aforged-not-a-real-session-id.garbage-signature' }
    });
    assert.equal(res.status, 302);
    assert.match(res.headers.get('location') || '', /\/admin\/login/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /admin/edit/:section without a CSRF token is refused (403), not applied and not a crash', async () => {
  delete require.cache[require.resolve('../server.js')];
  const app = require('../server.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    // Log in for real first so this is a genuine authenticated-but-missing-
    // CSRF-token case, not just an unauthenticated one (already covered by
    // requireAuth elsewhere).
    const loginRes = await fetch(`${base}/admin/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `password=${encodeURIComponent(process.env.ADMIN_PASSWORD)}`
    });
    const cookie = (loginRes.headers.get('set-cookie') || '').split(';')[0];
    assert.ok(cookie.startsWith('mxg.sid='), 'login should have set a session cookie');

    const res = await fetch(`${base}/admin/edit/site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie },
      body: 'f:publicName=Hijacked' // no _csrf field at all
    });
    assert.equal(res.status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// -------------------------------------------------- admin brute-force lockout
//
// Deliberately the LAST test in this file: lib/auth.js's lockout state is a
// module-level singleton (in-memory by design -- see its docstring) that
// persists across every require('../server.js') within this same process,
// regardless of require.cache resets on server.js itself. Locking out
// 127.0.0.1 here would otherwise fail every subsequent real login this file
// attempts (the CSRF and tampered-cookie tests above both log in for real).

test('rapid-fire wrong admin passwords lock out the attacker (429), and the lockout blocks even the correct password', async () => {
  delete require.cache[require.resolve('../server.js')];
  const app = require('../server.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    let lastStatus;
    // LOCKOUT_THRESHOLD is 6 -- fire well past it, back to back, from the
    // same client (same loopback source -- the lockout keys on req.ip).
    for (let i = 0; i < 8; i++) {
      const res = await fetch(`${base}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'password=definitely-wrong'
      });
      lastStatus = res.status;
    }
    assert.equal(lastStatus, 429, 'the 8th rapid-fire wrong attempt should be locked out, not just rejected');

    // Even the real password is refused while locked out -- the lockout
    // gates the attempt itself, not just wrong-password responses.
    const withCorrectPassword = await fetch(`${base}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `password=${encodeURIComponent(process.env.ADMIN_PASSWORD)}`
    });
    assert.equal(withCorrectPassword.status, 429);
    const body = await withCorrectPassword.text();
    assert.ok(body.includes('Too many attempts'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
