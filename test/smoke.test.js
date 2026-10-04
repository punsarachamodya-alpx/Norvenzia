'use strict';

// Boots the real app on an ephemeral port and hits every public route, plus a
// couple of admin-auth edge cases. No new dependency: node:test + node:http are
// built in (Node 18+, matching the CI matrix and package.json's engines field).

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

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

const PUBLIC_ROUTES = [
  '/',
  '/services',
  '/industries',
  '/about-us',
  '/contact',
  '/privacy',
  '/cookies',
  '/terms',
  '/robots.txt',
  '/sitemap.xml'
];

for (const route of PUBLIC_ROUTES) {
  test(`GET ${route} returns 200`, async () => {
    assert.equal(await get(route), 200);
  });
}

test('Home page no longer renders the Launch, Scale, Command engagement tiers', async () => {
  const res = await fetch(base + '/');
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.ok(!body.includes('Pick your entry point'));
  assert.ok(!body.includes('FAST START'));
  assert.ok(!body.includes('Command'));
  assert.ok(body.includes('Galle, Sri Lanka - remote delivery worldwide'));
});

test('About Us shows Our approach after About Norvenzia', async () => {
  const res = await fetch(base + '/about-us');
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.ok(body.includes('Our approach'));
  assert.ok(body.indexOf('ABOUT NORVENZIA') < body.indexOf('Our approach'));
  assert.ok(body.includes('Knowledge Transfer'));
  assert.ok(body.includes('Over years spent in supply chain and procurement leadership'));
  assert.ok(body.includes('I founded Norvenzia to rewrite that narrative.'));
  assert.ok(body.includes('100% operational transparency'));
  assert.ok(!body.includes('I started Norvenzia because I noticed'));
});

test('About Us shows security and FAQ sections after Our approach', async () => {
  const res = await fetch(base + '/about-us');
  const body = await res.text();
  assert.equal(res.status, 200);
  const approach = body.indexOf('Our approach');
  const security = body.indexOf('Data security &amp; compliance');
  const faq = body.indexOf('Frequently asked questions.');
  assert.ok(approach !== -1 && security > approach && faq > security);
  assert.ok(body.includes('ISO 27001 certification'));
  assert.ok(body.includes('Why is Norvenzia so new'));
});

test('About Us no longer renders the divisions roadmap table', async () => {
  const res = await fetch(base + '/about-us');
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.ok(!body.includes('Where this is headed.'));
  assert.ok(!body.includes('Digital &amp; AI'));
  assert.ok(!body.includes('<th scope="col">Division</th>'));
});

test('The Model page and legacy URL are unavailable', async () => {
  assert.equal(await get('/the-model'), 404);
  assert.equal(await get('/how-we-work'), 404);
});

// Old URLs (pre-rename: What We Do/How We Work/Who We Are) must 301 to
// their new pages, not 404 -- existing bookmarks/backlinks/search results
// still point at these.
const RENAMED_REDIRECTS = [
  ['/what-we-do', '/services'],
  ['/who-we-are', '/about-us']
];

function getRedirect(path) {
  return new Promise((resolve, reject) => {
    http
      .get(base + path, (res) => {
        res.resume();
        res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location }));
      })
      .on('error', reject);
  });
}

for (const [oldPath, newPath] of RENAMED_REDIRECTS) {
  test(`GET ${oldPath} redirects 301 to ${newPath}`, async () => {
    const { status, location } = await getRedirect(oldPath);
    assert.equal(status, 301);
    assert.equal(location, newPath);
  });
}

test('unknown route returns 404', async () => {
  assert.equal(await get('/this-page-does-not-exist'), 404);
});

test('/admin redirects unauthenticated visitors to login', async () => {
  const status = await new Promise((resolve, reject) => {
    http
      .get(base + '/admin', (res) => {
        res.resume();
        resolve(res.statusCode);
      })
      .on('error', reject);
  });
  assert.equal(status, 302);
});

test('/admin/login is reachable', async () => {
  assert.equal(await get('/admin/login'), 200);
});
