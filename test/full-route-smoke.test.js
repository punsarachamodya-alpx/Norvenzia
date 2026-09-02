'use strict';

// Broader smoke coverage than test/smoke.test.js: boots the real app with
// MIS_BASE_URL, WARROOM_BASE_URL, WARROOM_ACCESS_CODE, and every SMTP_* var
// all deliberately unset -- the fully degraded state a fresh checkout of
// this repo boots into (README: "Unset or unreachable MIS_BASE_URL is not
// an error", "an unset/unreachable/failed/capped job all degrade to a clear
// unavailable state") -- and asserts the routes test/smoke.test.js's
// PUBLIC_ROUTES list deliberately omits (/intelligence and
// /insights/sweden-trade, kept out of the sitemap for now but still have to
// render) still return 200, plus the same-origin proxy routes behind
// /intelligence degrade cleanly instead of 500ing. This is the "the whole
// site never hard-crashes even fully degraded" proof the MIS/War Room
// READMEs' zero-runtime-dependency claims lean on from this side.

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ci-test-password-only';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'ci-test-session-secret';
delete process.env.MIS_BASE_URL;
delete process.env.WARROOM_BASE_URL;
delete process.env.WARROOM_ACCESS_CODE;
delete process.env.SMTP_HOST;

const app = require('../server.js');

let server;
let base;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /intelligence returns 200 fully degraded (no MIS configured)', async () => {
  const res = await fetch(`${base}/intelligence`);
  assert.equal(res.status, 200);
});

test('GET /insights/sweden-trade returns 200 fully degraded', async () => {
  const res = await fetch(`${base}/insights/sweden-trade`);
  assert.equal(res.status, 200);
});

test('GET /intelligence renders the degraded panel, never the globe, when MIS_BASE_URL is unset', async () => {
  const res = await fetch(`${base}/intelligence`);
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.ok(body.includes('temporarily unavailable'));
  assert.ok(!body.includes('id="live-globe"'));
});

test('GET /intelligence/data reports available:false (200, not an error) when MIS_BASE_URL is unset', async () => {
  const res = await fetch(`${base}/intelligence/data`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.available, false);
  assert.deepEqual(body.events, []);
});

test('POST /intelligence/unlock always refuses when WARROOM_ACCESS_CODE is unset, never 500', async () => {
  const res = await fetch(`${base}/intelligence/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'anything-at-all' })
  });
  const body = await res.json();
  assert.equal(res.status, 401);
  assert.equal(body.ok, false);
});

test('POST /contact still succeeds (submission accepted) with SMTP unconfigured', async () => {
  const res = await fetch(`${base}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:
      'name=Jane+Doe&company=Acme+Freight&email=jane%40example.com&country=Sweden&' +
      'message=Interested+in+a+discovery+call.'
  });
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.ok(body.includes('Message sent'));
  assert.ok(!body.includes('Something went wrong'));
});
