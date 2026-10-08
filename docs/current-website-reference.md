# Norvenzia Website Reference

**Snapshot date:** 8 October 2026
**Purpose:** Page-by-page guide to the website currently implemented in this repository (branch `main`), for use as context — e.g. pasting into a Claude Project's knowledge. This describes the committed source; a deployed site only matches it after deployment.

**Since the last snapshot (3 October 2026):** the site owner made a large round of direct edits on `main` — a new "water glass" (frosted/translucent) visual system, Home and About Us restructured, `/the-model` and `/intelligence` unpublished, legal pages substantially rewritten, a `Home` nav link added, and several dependency security patches (one via an automated Hostinger bot PR). This document reflects all of that.

## Current Navigation

Primary header nav, in order:

1. Home (`/`)
2. Services (`/services`), expandable — Operations, Analytics, Risk Management as children
3. Industries (`/industries`)
4. About Us (`/about-us`)
5. Contact (`/contact`)
6. "Book a Call" button → `/contact`

Footer legal links: Privacy Policy (`/privacy`), Cookie Policy (`/cookies`), Terms of Use (`/terms`).

## Public Pages

### Home — `/`

**Purpose:** Introduce Norvenzia, its expertise areas, how engagements work, and a path to contact.

**Sections, in order:**
1. Hero — "We run the work." with a "Start a conversation" and an "Our Expertise" CTA
2. Social proof marquee — auto-scrolling vertical/market chips
3. Full-bleed photo banner
4. **Our Expertise** — 8 icon-cards, each linking directly to a topic page (see list below)
5. How it works (dark section) — three steps: Scope, Onboard, Run
6. Editorial quote block (dark)
7. FAQ accordion — 6 questions
8. Contact CTA

Engagement tiers (Launch/Scale/Command) and the old divisions photo-rows are **no longer on the homepage** — both were removed in this round of edits (tiers remain on `/services`; the divisions rows were replaced by the Expertise list).

**Expertise links** (absolute URLs in the source data):
- Sourcing & Contracting → `/operations/sourcing-contracting`
- Source-to-Pay Operations → `/operations/source-to-pay`
- Process Optimization → `/operations/process-optimization-topic`
- Spend & Cost Intelligence → `/analytics/spend-cost-intelligence`
- Supplier Performance → `/analytics/supplier-performance-topic`
- Planning & Working Capital → `/analytics/planning-working-capital`
- Supplier Risk & Resilience → `/risk-management/supplier-risk-resilience`
- Regulatory & Sustainability → `/risk-management/regulatory-sustainability`

**Content source:** `content/home.js` · **Template:** `views/home.ejs`
**Note:** `content/home.js` still carries an unused `whoServe` block (no longer rendered by the view) — harmless leftover, not a bug.

### Services — `/services`

**Purpose:** Summarize the three live divisions and the engagement tiers.

**Sections:**
- Services hero
- One block per live division (Operations, Analytics, Risk Management): photo + intro paragraph, then that division's own topic cards nested directly underneath, each linking to the topic page
- Engagement tiers (Launch/Scale/Command)
- Closing contact CTA

All tier-card and topic-card links across this page and the division/topic pages below read **"Explore →"** (renamed from "Learn more →" as of this session). The standalone "Explore {Division}" link that used to sit above the topic cards has been removed — the cards themselves are the way down.

Digital & AI and Advisory (not yet live) are not shown on this page.

**Content source:** `content/what-we-do.js`, with each live division's intro/topics attached by `server.js` · **Template:** `views/what-we-do.ejs`

### Industries — `/industries`

**Sections:** hero → 7 industry cards with pain points → fit criteria → closing CTA.

**Industries:** General & Discrete Manufacturing, Renewable Energy, Electronics / EMS, FMCG, Food Production, Apparel Manufacturing, Footwear Manufacturing.

**Content source:** `content/industries.js` · **Template:** `views/industries.ejs`

### About Us — `/about-us`

**Purpose:** Identity, operating approach, security posture, founder, team.

**Sections, in order:**
1. Hero
2. About Norvenzia — full-width photo backdrop, company intro
3. Our Approach — 5 stages (Onboarding, Knowledge Transfer, SOP Documentation, QA Loop, SLA/TAT Commitments) — **moved here from the former `/the-model` page**
4. Data Security & Compliance — what's in place today vs. roadmap — **also moved from `/the-model`**
5. Banner photo statement
6. Mission statement
7. Founder story (rewritten this round — see below)
8. Team
9. FAQ — **moved here from the homepage's old roadmap-adjacent spot**
10. Closing CTA

**The roadmap table (listing all 5 divisions by status) has been removed entirely**, along with its test coverage.

Founder story is now a 2-paragraph narrative (apparel/telecom/3PL/seafood background, "KPO partner" framing) replacing the previous 3-paragraph version.

**Content source:** `content/who-we-are.js`; the former `content/how-we-work.js` methodology/security content was folded in here · **Template:** `views/who-we-are.ejs`

### Contact — `/contact`

Unchanged. Inquiry form (name, company, work email, country, optional message), response-time commitment, optional booking embed (currently unconfigured), server-side validation.

**Content source:** `content/contact.js`, company details from `content/site.js` · **Template:** `views/contact.ejs`

### Legal Pages — `/privacy`, `/cookies`, `/terms`

**Substantially rewritten this round** (dated October 2026, up from July 2026), now materially more detailed:
- Registered office stated as Galle, Sri Lanka; registration number PV00374811
- Delivery team location (Colombo) and registered office (Galle) now distinguished
- Explicit note that this policy covers website visitors only — signed client engagements are governed by their own data-processing terms
- New "Security" subsection (reasonable measures, no ISO 27001 claim)
- More detailed legal-basis, sharing/international-transfer, and retention language

`counselReviewed: false` is still set for all three documents — the draft-warning banner is disabled in the view, but these still need counsel review before being final.

**Content source:** `content/legal.js` · **Template:** `views/legal.ejs`

## Services Page Hierarchy

Flat URLs: topic pages sit one level under their division, service pages are flat under the same division (not nested under their topic in the URL).

### Operations — `/operations`
*End-to-end supply chain management and procurement operations delivered by senior analysts inside client systems.*
- **Sourcing & Contracting** — `/operations/sourcing-contracting`
  → Category Strategy, Sourcing and RFQ Execution, Negotiation Preparation, Contract Management
- **Source-to-Pay Operations** — `/operations/source-to-pay`
  → Purchase Order and Procure-to-Pay Operations, Master Data Management, Supplier Onboarding and Screening
- **Process Optimization** — `/operations/process-optimization-topic`
  → Process Optimization

### Analytics — `/analytics`
*Turns operational data into decision support, spend visibility, and planning insight.*
- **Spend & Cost Intelligence** — `/analytics/spend-cost-intelligence`
  → Spend and Tail Spend Analytics, Cost Optimization
- **Supplier Performance** — `/analytics/supplier-performance-topic`
  → Supplier Performance Management
- **Planning & Working Capital** — `/analytics/planning-working-capital`
  → Working Capital and Inventory Optimization, Demand Planning and Sales & Operations Planning
- **Advanced Analytics** — `/analytics/advanced-analytics-topic`
  → Advanced Analytics

### Risk Management — `/risk-management`
*Supplier and supply chain risk monitoring, resilience, and compliance support.*
- **Supplier Risk & Resilience** — `/risk-management/supplier-risk-resilience`
  → Supplier Risk Monitoring, Supply Chain Resilience
- **Regulatory & Sustainability** — `/risk-management/regulatory-sustainability`
  → Regulatory and Compliance Cascade, Sustainable Procurement Strategies

Each service page uses a three-part **The Problem / What Norvenzia Does / What You Get** structure.

**Division content:** `content/operations.js`, `content/analytics.js`, `content/risk-management.js`
**Templates:** `views/division.ejs`, `views/division-topic.ejs`, `views/division-service.ejs`

## Data Story

### Sweden Trade Intelligence — `/insights/trade/se`

A scroll-driven story built on the committed Sweden trade dataset (totals, goods categories, trade partners, concentration, balance). `/insights/sweden-trade` redirects here. Reachable directly; not in primary nav or the sitemap list.

**Content:** `content/trade-data/se.json` + `content/trade-data/manifest.json` · **Template:** `views/story.ejs`

## Unpublished / Hidden Pages

- **`/the-model` → 404.** Its old page-level content has been absorbed into About Us (Approach + Security sections above); `content/how-we-work.js`/`views/how-we-work.ejs` still exist but are unrouted.
- **`/how-we-work` → 404** (no longer redirects to `/the-model`).
- **`/intelligence` → 404**, removed from nav. Backend routes (live-data proxy, gated "War Room" investigation API) remain live in `server.js` so the page can be restored without rebuilding them.
- `/what-we-do` → 301 → `/services`
- `/who-we-are` → 301 → `/about-us`

## Company Facts (`content/site.js`)

- Legal entity: Norvenzia (Private) Limited
- Descriptor: "Supply chain & procurement operations partner" (changed from "Procurement & supply chain operations")
- Tagline: "We run the work."
- Delivery hub: Colombo, Sri Lanka
- **Registered/footer location: Galle, Sri Lanka** (new `site.footerLocation` field — footer now reads "Galle, Sri Lanka - remote delivery worldwide")
- Contact email: contact@norvenzia.com (same address used for both the contact form and footer)
- Phone: +46 73 779 5741 *(legacy Swedish number, flagged in source comments as pending a decision)*
- Markets served: EU, Norway, UK, Australia, New Zealand, United States *(Switzerland was removed earlier this session; note the homepage's own `markets` chip line currently omits "UK" while the footer/model copy still includes it — a small inconsistency worth a look)*
- LinkedIn: linkedin.com/company/norvenzia

## Dependencies / Security

- `qs` pinned to `^6.16.0` via `package.json` `overrides` (fixes CVE-2026-82417, CVE-2026-82562) — done this session.
- `multer` bumped to `^2.4.0` and `nodemailer` to `^9.1.1` by an automated Hostinger bot PR (`fix: patch Node.js security vulnerabilities`, merged as PR #27) — **outside this session**, done directly against `main`.
- As of this snapshot, `npm audit` still reports open advisories against `compression`, `ip-address`, `multer`, `nodemailer`, and `proxy-addr` (1 moderate, 3 high, 1 critical) — not yet remediated; flagging for awareness, not yet actioned.

## Shared Site Features

- Shared header/footer/meta/canonical/social tags: `views/layout.ejs`, `views/partials/`
- Visual system: "water glass" — light navy-and-blue branding with site-wide translucent/frosted glass surfaces (`public/css/styles.css`)
- Responsive nav: frosted-glass desktop/mobile header, solid mobile nav panel
- Contact form validation + optional email delivery
- Cookie preference notice + admin session cookie
- Protected `/admin` panel (content editing, backups, image uploads) — disallowed in `robots.txt`
- Server-rendered EJS, progressively enhanced with local JS

## Where to Make Changes

- Page copy/structured content: `content/*.js`
- Homepage layout/order: `views/home.ejs`
- About Us layout: `views/who-we-are.ejs`
- Services layouts: `views/what-we-do.ejs`, `views/division*.ejs`
- Nav labels/order: `content/nav.js`
- Shared design/responsive behavior: `public/css/styles.css`
- Editable admin fields: `lib/schema.js`
- Route registration, public route list, sitemap: `server.js`

The admin panel writes overrides to the git-ignored `data/content.json`; when present, its values can differ from the shipped defaults in `content/*.js`.
