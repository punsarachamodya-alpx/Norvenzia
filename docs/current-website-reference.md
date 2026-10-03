# Norvenzia Website Reference

**Snapshot date:** 3 October 2026  
**Purpose:** Page-by-page guide to the website currently implemented in this repository. This describes the local source state; a deployed site changes only after the code is deployed and the server is restarted.

## Current Navigation

The primary header navigation is ordered as follows:

1. Home (`/`)
2. Services (`/services`), with Operations, Analytics, and Risk Management as expandable children
3. Industries (`/industries`)
4. About Us (`/about-us`)
5. Contact (`/contact`)
6. Book a Call button, which currently opens `/contact`

Footer legal links lead to Privacy Policy (`/privacy`), Cookie Policy (`/cookies`), and Terms of Use (`/terms`).

## Public Pages

### Home — `/`

**Purpose:** Introduces Norvenzia, its delivery model, expertise, engagement options, and contact path.

**Sections, in page order:**

- Hero: “We run the work.” with conversation and expertise links
- Market and industry strip
- Full-width photo banner
- Our Expertise: eight linked functions with icons
- Engagement tiers: Launch, Scale, Command
- Three-step “How it works” section: Scope, Onboard, Run
- Editorial statement
- Frequently asked questions
- Contact call to action

**Expertise links:**

- Sourcing & Contracting → `/operations/sourcing-contracting`
- Source-to-Pay Operations → `/operations/source-to-pay`
- Process Optimization → `/operations/process-optimization-topic`
- Spend & Cost Intelligence → `/analytics/spend-cost-intelligence`
- Supplier Performance → `/analytics/supplier-performance-topic`
- Planning & Working Capital → `/analytics/planning-working-capital`
- Supplier Risk & Resilience → `/risk-management/supplier-risk-resilience`
- Regulatory & Sustainability → `/risk-management/regulatory-sustainability`

**Content source:** `content/home.js`  
**Template:** `views/home.ejs`

### Services — `/services`

**Purpose:** Summarizes live divisions and engagement tiers.

**Sections:**

- Services hero
- Live Operations, Analytics, and Risk Management divisions, with topic links
- Engagement tiers
- Closing contact call to action

Digital & AI is marked as building and Advisory as roadmap in the source data; the Services page focuses its main division rows on live divisions.

**Content source:** `content/what-we-do.js`, with division details attached by `server.js`  
**Template:** `views/what-we-do.ejs`

### Industries — `/industries`

**Purpose:** Describes the industries Norvenzia serves and the operational patterns it addresses.

**Sections:**

- Industries hero
- Seven industry cards with typical operational pain points
- Fit criteria
- Closing contact call to action

**Industries:** General & Discrete Manufacturing, Renewable Energy, Electronics / EMS, FMCG, Food Production, Apparel Manufacturing, and Footwear Manufacturing.

**Content source:** `content/industries.js`  
**Template:** `views/industries.ejs`

### About Us — `/about-us`

**Purpose:** Explains Norvenzia’s identity, operating approach, security posture, roadmap, and team.

**Sections, in page order:**

- About Us hero
- About Norvenzia: full-width photo backdrop, company introduction
- Our approach: five stages (Onboarding, Knowledge Transfer, SOP Documentation, QA Loop, SLA / TAT Commitments)
- Data security & compliance: practices currently in place and items explicitly not yet held
- Frequently asked questions
- Photo statement band
- Mission statement
- Roadmap table for the five divisions
- Founder story
- Team
- Closing contact call to action

**Content source:** `content/who-we-are.js`; division roadmap rows come from `content/what-we-do.js`  
**Template:** `views/who-we-are.ejs`

### Contact — `/contact`

**Purpose:** Accepts business inquiries.

**Sections and behavior:**

- Contact hero and inquiry form
- Fields: name, company, work email, country, and optional message
- Response-time commitment and company contact details
- Optional booking embed appears only when configured
- Server-side validation and success state

**Content source:** `content/contact.js`, company details from `content/site.js`  
**Template:** `views/contact.ejs`

### Legal Pages

All three pages use the same legal template and render from `content/legal.js`.

- **Privacy Policy — `/privacy`:** Controller identity, data collected, purposes and legal bases, sharing and international transfers, retention, security, rights, children, policy changes, contact.
- **Cookie Policy — `/cookies`:** Cookie overview, cookies currently used, consent controls, third-party services, policy changes, contact.
- **Terms of Use — `/terms`:** Acceptance, company information, informational-only disclaimer, claims, intellectual property, acceptable use, third-party links, service availability, inquiries, liability, indemnity, governing law, changes, contact.

The source data still records `counselReviewed: false` for these documents. The public draft-warning banner is currently disabled in `views/legal.ejs`; the policies still need counsel review before being treated as final legal documents.

**Template:** `views/legal.ejs`

## Services Page Hierarchy

Division, topic, and service detail pages are rendered from the three division content modules using shared templates. Topic URLs are one level under the division; service URLs are also flat under their division.

### Operations — `/operations`

**Division summary:** End-to-end supply chain management and procurement operations delivered by senior analysts inside client systems.

- **Sourcing & Contracting — `/operations/sourcing-contracting`**
  - Category Strategy — `/operations/category-strategy`
  - Sourcing and RFQ Execution — `/operations/sourcing-rfq`
  - Negotiation Preparation — `/operations/negotiation-preparation`
  - Contract Management — `/operations/contract-management`
- **Source-to-Pay Operations — `/operations/source-to-pay`**
  - Purchase Order and Procure-to-Pay Operations — `/operations/procure-to-pay`
  - Master Data Management — `/operations/master-data-management`
  - Supplier Onboarding and Screening — `/operations/supplier-onboarding-screening`
- **Process Optimization — `/operations/process-optimization-topic`**
  - Process Optimization — `/operations/process-optimization`

### Analytics — `/analytics`

**Division summary:** Turns operational data into decision support, spend visibility, and planning insight.

- **Spend & Cost Intelligence — `/analytics/spend-cost-intelligence`**
  - Spend and Tail Spend Analytics — `/analytics/spend-analytics`
  - Cost Optimization — `/analytics/cost-optimization`
- **Supplier Performance — `/analytics/supplier-performance-topic`**
  - Supplier Performance Management — `/analytics/supplier-performance`
- **Planning & Working Capital — `/analytics/planning-working-capital`**
  - Working Capital and Inventory Optimization — `/analytics/working-capital`
  - Demand Planning and Sales & Operations Planning — `/analytics/demand-planning`
- **Advanced Analytics — `/analytics/advanced-analytics-topic`**
  - Advanced Analytics — `/analytics/advanced-analytics`

### Risk Management — `/risk-management`

**Division summary:** Supplier and supply chain risk monitoring, resilience, and compliance support.

- **Supplier Risk & Resilience — `/risk-management/supplier-risk-resilience`**
  - Supplier Risk Monitoring — `/risk-management/supplier-risk-monitoring`
  - Supply Chain Resilience — `/risk-management/supply-chain-resilience`
- **Regulatory & Sustainability — `/risk-management/regulatory-sustainability`**
  - Regulatory and Compliance Cascade — `/risk-management/regulatory-compliance-cascade`
  - Sustainable Procurement Strategies — `/risk-management/sustainable-procurement`

**Division content:** `content/operations.js`, `content/analytics.js`, `content/risk-management.js`  
**Templates:** `views/division.ejs`, `views/division-topic.ejs`, `views/division-service.ejs`

A division-service page uses the three-part structure **The Problem / What Norvenzia Does / What You Get**. Its text area is widened to 1,216px on desktop and remains responsive on smaller screens.

## Data Story

### Sweden Trade Intelligence — `/insights/trade/se`

A scroll-driven story using the committed Sweden trade dataset. It covers trade totals, goods categories, trade partners, concentration, and balance where the underlying dataset supports those sections.

The legacy URL `/insights/sweden-trade` redirects to `/insights/trade/se`. The country data is in `content/trade-data/se.json`, with the country manifest in `content/trade-data/manifest.json`.

The route is accessible directly but is not in the primary navigation or current sitemap list.

**Template:** `views/story.ejs`

## Temporarily Hidden Pages and Redirects

- `/the-model` returns 404. Its former page content remains in `content/how-we-work.js` and `views/how-we-work.ejs` but is not publicly routed or linked from navigation.
- `/how-we-work` also returns 404; the former redirect to `/the-model` was removed when The Model was unpublished.
- `/intelligence` returns 404 and is absent from navigation. Its live-data and gated investigation API routes remain in `server.js`; this allows the public page to be restored without rebuilding those services.
- `/what-we-do` permanently redirects to `/services`.
- `/who-we-are` permanently redirects to `/about-us`.

Hidden-page code is retained intentionally and should not be confused with a page currently available to site visitors.

## Shared Site Features

- Shared header, footer, metadata, canonical URLs, and social-sharing tags: `views/layout.ejs` and `views/partials/`
- Current visual system: light navy-and-blue branding with site-wide translucent glass surfaces; the public stylesheet is `public/css/styles.css`
- Responsive navigation, with a frosted-glass desktop/mobile header and a solid readable mobile navigation panel
- Contact form validation and optional email delivery
- Cookie preference notice and administrator session cookie
- Protected `/admin` panel for content editing, backups, and image uploads
- Server-rendered EJS pages with progressive enhancement from local JavaScript

## Where to Make Changes

- Page copy and structured page content: `content/*.js`
- Homepage and section order/layout: `views/home.ejs`
- About Us layout: `views/who-we-are.ejs`
- Services layouts: `views/what-we-do.ejs`, `views/division*.ejs`
- Navigation labels/order: `content/nav.js`
- Shared design and responsive behavior: `public/css/styles.css`
- Editable admin fields: `lib/schema.js`
- Route registration, public route list, and sitemap: `server.js`

The admin panel writes overrides to the git-ignored `data/content.json`; when that file exists, its values may differ from the shipped defaults in `content/*.js`.
