'use strict';

// Boots the real app and asserts:
//  - /insights/sweden-trade 302-redirects to /insights/trade/se (the legacy
//    single-country URL from before the multi-country generalization)
//  - /insights/trade/se renders 200 from the committed
//    content/trade-data/se.json -- no network calls, no mocked upstream
//    (unlike /intelligence, this route has zero runtime dependency on anything
//    external).
// Also asserts the empty-array beats (topGoodsCategories, balance, trend are
// still pending from the offline job as of this writing) are skipped
// gracefully rather than rendering broken/empty sections.

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ci-test-password-only';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'ci-test-session-secret';

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

test('GET /insights/sweden-trade 302-redirects to /insights/trade/se', async () => {
  const res = await fetch(`${base}/insights/sweden-trade`, { redirect: 'manual' });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/insights/trade/se');
});

test('GET /insights/trade/se returns 200 and renders the story shell', async () => {
  const res = await fetch(`${base}/insights/trade/se`);
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.ok(body.includes('Sweden Trade Intelligence'));
  assert.ok(body.includes('id="story"'));
  assert.ok(body.includes('id="story-data"'));
});

test('GET /insights/trade/se cross-links back to /intelligence', async () => {
  const res = await fetch(`${base}/insights/trade/se`);
  const body = await res.text();
  assert.ok(body.includes('href="/intelligence"'));
});

test('GET /intelligence cross-links to the Sweden trade story', async () => {
  const res = await fetch(`${base}/intelligence`);
  const body = await res.text();
  assert.ok(body.includes('href="/insights/sweden-trade"'));
});

test('renders real hero figures straight from content/trade-data/se.json, never hardcoded', async () => {
  const dataPath = path.join(__dirname, '..', 'content', 'trade-data', 'se.json');
  const tradeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const res = await fetch(`${base}/insights/trade/se`);
  const body = await res.text();

  assert.equal(res.status, 200);
  // The hero beat always renders (hero is never empty per the schema) --
  // its top partner's label must show up somewhere in the readable prose.
  assert.ok(tradeData.topPartners.length > 0);
  assert.ok(body.includes(tradeData.topPartners[0].label));
});

test('gracefully skips beats whose backing array is empty rather than rendering a broken section', async () => {
  const dataPath = path.join(__dirname, '..', 'content', 'trade-data', 'se.json');
  const tradeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const res = await fetch(`${base}/insights/trade/se`);
  const body = await res.text();

  assert.equal(res.status, 200);
  if (!Array.isArray(tradeData.topGoodsCategories) || tradeData.topGoodsCategories.length === 0) {
    assert.ok(!body.includes('data-scene="goods"'));
  }
  if (!Array.isArray(tradeData.balance?.years) || tradeData.balance.years.length === 0) {
    assert.ok(!body.includes('data-scene="balance"'));
  }
  if (!Array.isArray(tradeData.trend?.years) || tradeData.trend.years.length === 0) {
    assert.ok(!body.includes('data-scene="trend"'));
  }
  // The closing "so what" beat never depends on the pending arrays.
  assert.ok(body.includes('data-scene="sowhat"'));
});

test('GET /insights/trade/xx (unknown country) renders the unavailable state, not a 500', async () => {
  const res = await fetch(`${base}/insights/trade/xx`);
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.ok(body.includes('This story is temporarily unavailable'));
});
