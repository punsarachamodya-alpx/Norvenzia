module.exports = {
  meta: {
    title: 'Services — Norvenzia',
    description:
      'Three divisions live today: Operations, Analytics, and Risk Management.'
  },

  hero: {
    eyebrow: 'Services',
    headline: 'Three divisions, live today.',
    body:
      'Norvenzia runs Operations, Analytics, and Risk Management now.'
  },

  // Single source of truth for the site's five divisions -- server.js exposes
  // this as res.locals.divisions (same pattern as site/nav/appearance) so the
  // homepage and About Us's roadmap table read the same live/roadmap facts
  // instead of each page maintaining its own copy that can drift out of sync.
  divisions: [
    {
      index: '01',
      name: 'Operations',
      href: '/operations',
      status: 'live',
      summary:
        'End-to-end supply chain management operations, run by senior analysts inside the systems you already use.',
      capabilities: [
        'Procurement Operations',
        'Purchase Order Management',
        'Supplier Onboarding',
        'Supplier / Vendor Management',
        'RFQ / RFP Support',
        'Logistics Coordination',
        'Process Mapping and Restructuring'
      ]
    },
    {
      index: '02',
      name: 'Analytics',
      href: '/analytics',
      status: 'live',
      summary:
        'Visibility and decision support layered on top of your operational data, so procurement decisions stop being guesswork.',
      capabilities: [
        'Spend Analysis',
        'Vendor Performance Dashboards',
        'Inventory Analytics',
        'Demand Planning Support',
        'Master Data Management',
        'ERP Administration',
        'Supply Chain Reporting',
        'KPI Dashboards'
      ]
    },
    {
      index: '03',
      name: 'Risk Management',
      href: '/risk-management',
      status: 'live',
      summary:
        'Supplier and supply chain risk mapped and monitored on an ongoing basis, so exposure gets managed before it becomes disruption.',
      capabilities: [
        'Supplier Dependency & Single-Source Mapping',
        'Geographic & Corridor Exposure Mapping',
        'Supplier Financial Health Monitoring',
        'Customer Due-Diligence Questionnaire Response (Inbound)',
        'Supplier Due-Diligence Data Collection (Outbound)',
        'Risk Register Maintenance & Owner-Level Reporting'
      ]
    },
    {
      index: '04',
      name: 'Digital & AI',
      status: 'building',
      summary:
        'Process automation and systems integration across the tools you already run, alongside an AI-powered intelligence capability we’re actively building — global disruption monitoring, applied forecasting, and document processing — to help you act before disruption causes operational failure.',
      capabilities: ['Process Automation', 'Systems Integration', 'Global Disruption Monitoring', 'Applied Forecasting', 'Document Processing']
    },
    {
      index: '05',
      name: 'Advisory',
      status: 'roadmap',
      summary:
        'Strategic sourcing and procurement transformation for teams planning a bigger operating-model shift — planned as the company scales.',
      capabilities: ['Strategic Sourcing', 'Procurement Transformation']
    }
  ],

  // Shown below the three divisions on /services.
  approval: {
    headline: 'What we prepare. What you approve.',
    body:
      'We prepare and run the work. You approve anything that commits your business: contracts, payments, supplier commitments, and data that goes to your customers. Nothing in those four areas goes out without sign-off from a named person on your side.'
  },

  start: {
    headline: 'How an engagement starts',
    steps: [
      {
        title: 'Discovery Call',
        body:
          'A free 30-minute call. We map where your purchasing work gets stuck and agree whether a pilot makes sense.'
      },
      {
        title: 'Fixed-price pilot',
        body:
          'One process, scope agreed in writing, 50% deposit before work starts.'
      },
      {
        title: 'Ongoing operation',
        body:
          'Fixed-price modules, weekly reporting, and any change in scope agreed in writing.'
      }
    ]
  },

  closing: {
    headline: 'Ready to scope your engagement?',
    body:
      'A discovery call is the fastest way to find out whether this model fits your operation.',
    cta: { label: 'Book a Discovery Call', href: '/contact' }
  }
};
