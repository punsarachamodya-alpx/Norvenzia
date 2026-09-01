'use strict';

// Broader smoke coverage than test/smoke.test.js: boots the real app with
// MIS_BASE_URL, WARROOM_BASE_URL, WARROOM_ACCESS_CODE, and every SMTP_* var
// all deliberately unset -- the fully degraded state a fresh checkout of
// this repo boots into (README: "Unset or unreachable MIS_BASE_URL is not
// an error", "an unset/unreachable/failed/capped job all degrade to a clear
// unavailable state") -- and asserts every real route still returns 200 (or
// the correct redirect/404), including /live and /insights/sweden-trade,
// which test/smoke.test.js's PUBLIC_ROUTES list deliberately omits (they're
// kept out of the sitemap for now, but still have to render). This is the
// "the whole site never hard-crashes even fully degraded" proof the MIS/
// War Room READMEs' zero-runtime-dependency claims lean on from this side.

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

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get(base + path, (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode));
      })
      .on('error', reject);
  });
}

// Every page a visitor can actually reach today, degraded state included --
// deliberately including /live and /insights/sweden-trade even though they
// are not (yet) in PUBLIC_ROUTES/sitemap.xml (server.js's own comments on
// both routes).
const ALL_REAL_ROUTES = [
  '/',
  '/what-we-do',
  '/industries',
  '/how-we-work',
  '/who-we-are',
  '/contact',
  '/privacy',
  '/cookies',
  '/terms',
  '/live',
  '/insights/sweden-trade',
  '/robots.txt',
  '/sitemap.xml',
  '/admin/login'
];

for (const route of ALL_REAL_ROUTES) {
  test(`GET ${route} returns 200 fully degraded (no MIS/WarRoom/SMTP configured)`, async () => {
    assert.equal(await get(route), 200);
  });
}

test('/admin returns a redirect (302) fully degraded, not a crash', async () => {
  assert.equal(await get('/admin'), 302);
});

test('GET /live renders the degraded panel, never the globe, when MIS_BASE_URL is unset', async () => {
  const res = await fetch(`${base}/live`);
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.ok(body.includes('temporarily unavailable'));
  assert.ok(!body.includes('id="live-globe"'));
});

test('GET /live/data reports available:false (200, not an error) when MIS_BASE_URL is unset', async () => {
  const res = await fetch(`${base}/live/data`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.available, false);
  assert.deepEqual(body.events, []);
});

test('POST /live/unlock always refuses when WARROOM_ACCESS_CODE is unset, never 500', async () => {
  const res = await fetch(`${base}/live/unlock`, {
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

test('unknown route returns 404 fully degraded, not a crash', async () => {
  assert.equal(await get('/this-route-truly-does-not-exist'), 404);
});
