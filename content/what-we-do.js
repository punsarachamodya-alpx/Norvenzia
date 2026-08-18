module.exports = {
  meta: {
    title: 'Services — Norvenzia',
    description:
      'Two divisions live today: Operations and Analytics. AI is in active development (Nexus GeoTracer). Digital and Advisory are roadmap divisions — we don’t sell them yet.'
  },

  hero: {
    eyebrow: 'Services',
    headline: 'Two divisions, live today.',
    body:
      'Norvenzia runs Operations and Analytics now. AI is in active development. Digital and Advisory are roadmap divisions for when the company scales — we don’t sell them yet.'
  },

  // Single source of truth for the site's five divisions -- server.js exposes
  // this as res.locals.divisions (same pattern as site/nav/appearance) so the
  // homepage and About Us's roadmap table read the same live/roadmap facts
  // instead of each page maintaining its own copy that can drift out of sync.
  divisions: [
    {
      index: '01',
      name: 'Operations',
      status: 'live',
      summary:
        'End-to-end supply chain management operations, run by senior analysts inside the systems you already use.',
      capabilities: [
        'Procurement Operations',
        'Purchase Order Management',
        'Supplier Onboarding',
        'RFQ / RFP Support',
        'Logistics Coordination',
        'Supply Chain Reporting',
        'KPI Dashboards'
      ]
    },
    {
      index: '02',
      name: 'Analytics',
      status: 'live',
      summary:
        'Visibility and decision support layered on top of your operational data, so procurement decisions stop being guesswork.',
      capabilities: [
        'Spend Analysis',
        'Vendor Performance Dashboards',
        'Inventory Analytics',
        'Demand Planning Support',
        'Master Data Management',
        'ERP Administration'
      ]
    },
    {
      index: '03',
      name: 'Digital',
      status: 'roadmap',
      summary:
        'Process automation and systems integration across the tools you already run — planned for when the delivery model scales.',
      capabilities: ['Process Automation', 'Systems Integration']
    },
    {
      index: '04',
      name: 'AI',
      status: 'building',
      summary:
        'We’re currently building Nexus GeoTracer — an AI-powered enterprise intelligence tool that monitors global supply chain ecosystems in real time, detecting and analyzing disruptions against real-world conditions to help you act before they cause operational failure.',
      capabilities: ['Nexus GeoTracer — Global Disruption Monitoring', 'Applied Forecasting', 'Document Processing']
    },
    {
      index: '05',
      name: 'Advisory',
      status: 'roadmap',
      summary:
        'Strategic sourcing and procurement transformation for teams planning a bigger operating-model shift — planned for Year 2 and beyond.',
      capabilities: ['Strategic Sourcing', 'Procurement Transformation']
    }
  ],

  tiers: {
    eyebrow: 'Engagement tiers',
    headline: 'Launch, Scale, Command.',
    body:
      'Every engagement is scoped and priced against your actual process, so we don’t publish rate cards. Tell us what you run today and we’ll come back with a scoped proposal.',
    items: [
      {
        name: 'Launch',
        summary:
          'For teams starting with a single defined process (PO management or supplier onboarding, for example).',
        includes: [
          'One core process',
          'Dedicated analyst',
          'Monthly reporting',
          'Documented SOP + QA loop'
        ]
      },
      {
        name: 'Scale',
        summary:
          'For teams running several procurement and analytics workflows in parallel.',
        includes: [
          'Multiple processes',
          'Dedicated analyst team',
          'Quarterly business reviews',
          'Custom KPI dashboards'
        ]
      },
      {
        name: 'Command',
        summary:
          'For teams that want Norvenzia embedded across procurement and analytics end to end.',
        includes: [
          'Full Operations + Analytics scope',
          'Embedded delivery team',
          'Quarterly business reviews',
          'Master data & ERP administration'
        ]
      }
    ],
    ctaLabel: 'Contact us'
  },

  closing: {
    headline: 'Ready to scope your engagement?',
    body:
      'A discovery call is the fastest way to find out whether this model fits your operation.',
    cta: { label: 'Book a Call', href: '/contact' }
  }
};
