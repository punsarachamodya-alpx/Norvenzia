module.exports = {
  meta: {
    title: 'Norvenzia — We run the work.',
    description:
      'Strategy stays with your team in Europe. Execution runs from our delivery hub in Colombo, Sri Lanka. Every day.'
  },

  // 3.1 — Hero. headline is animated by public/js/scramble.js on load
  // (scrambles into place, then settles — see [data-scramble] in hero.ejs).
  hero: {
    eyebrow: '// SUPPLY CHAIN & PROCUREMENT OPERATIONS PARTNER.',
    headline: 'We run the work.',
    body:
      'Strategy stays with your team in Europe. Execution runs from our delivery hub in Colombo, Sri Lanka. Every day.',
    primaryCta: { label: 'Start a conversation', href: '#contact' },
    secondaryCta: { label: 'See what we run', href: '#services' },
    routeLine: { from: 'GOTHENBURG', to: 'COLOMBO' }
  },

  // 3.2 — Social proof strip. Plain-text chips, no client logos (§4 rule).
  socialProof: {
    eyebrow: 'SERVING MID-MARKET INDUSTRIAL COMPANIES ACROSS',
    verticals: [
      'Manufacturing',
      'Medical Devices',
      'Renewable Energy',
      'Automotive Suppliers',
      'Electronics & EMS',
      'FMCG & Food Production',
      'E-commerce'
    ],
    markets: 'Scandinavia · Germany · Netherlands · UK · Australia'
  },

  // 3.3 — Six product modules, tabbed (public/js/tabs.js).
  services: {
    eyebrow: '// WHAT WE RUN',
    headline: 'Six modules. One delivery team.',
    body: 'Start with what you need most. Add the rest when the case builds.',
    tabs: [
      {
        category: 'BUY',
        name: 'Core',
        description:
          'Procurement operations — PO management, supplier onboarding, RFQ and RFP support. Your ops team’s day-to-day, handled.'
      },
      {
        category: 'MOVE',
        name: 'Flow',
        description:
          'Logistics coordination and order management, tracked end to end so nothing falls between systems.'
      },
      {
        category: 'RECORD',
        name: 'Link',
        description:
          'The data layer underneath it all — supplier, PO, and inventory records kept consistent across your stack.'
      },
      {
        category: 'REPORT',
        name: 'Pulse',
        description:
          'Power BI dashboards and KPI reporting, built around how your operation actually runs, not a template.'
      },
      {
        category: 'TRACK',
        name: 'Signal',
        // Kept explicitly as visibility/decision-support language, never
        // forecasting or prediction — see §4 content rules.
        description:
          'Early visibility into supply chain disruption. A faster warning system — not a forecast, decision support.'
      },
      {
        category: 'STAFF',
        name: 'Desk',
        description:
          'A dedicated analyst embedded in your operation. Committed hours, committed output.'
      }
    ]
  },

  // 3.4 — Three entry-point tiers, numbered 01/02/03.
  tiers: {
    eyebrow: '// HOW YOU ENGAGE',
    headline: 'Pick your entry point.',
    items: [
      {
        number: '01',
        label: 'FAST START',
        name: 'Launch',
        body:
          'One or two modules. Defined scope, fixed deliverables, built to prove the model before you commit further.',
        link: { label: 'Start here', href: '#contact' }
      },
      {
        number: '02',
        label: 'GROWING',
        name: 'Scale',
        body:
          'Multiple modules working together across procurement, logistics, and reporting. A delivery team that feels like your own.',
        link: { label: 'See what’s included', href: '#services' }
      },
      {
        number: '03',
        label: 'COMMITTED',
        name: 'Command',
        body:
          'A fully staffed, dedicated operations function. Quoted by engagement. Not signable until we confirm delivery capacity — we’ll tell you honestly where we stand.',
        link: { label: 'Talk to us', href: '#contact' },
        // Honest signal, not a weakness — keep this, per the brief (§3.4 note).
        note: '*Availability subject to delivery capacity. We’ll confirm on enquiry.'
      }
    ]
  },

  // 3.5 — How it works, three steps.
  how: {
    eyebrow: '// THREE STEPS',
    headline: 'No rip-and-replace. No new platform to learn.',
    steps: [
      {
        number: '01',
        title: 'Scope',
        body:
          'We map what’s eating your team’s time. Agree exactly what we take off your plate and what stays with you.'
      },
      {
        number: '02',
        title: 'Onboard',
        body:
          'We plug into your existing ERP, TMS, or spreadsheet stack. Your team keeps working as normal.'
      },
      {
        number: '03',
        title: 'Run',
        body:
          'We execute, track KPIs, and flag disruption as it surfaces. You get reporting, not excuses.'
      }
    ]
  },

  // 3.6 — Stats row. Only real, approved numbers — no fabricated stats (§4).
  stats: {
    items: [
      { value: '8h/week min', label: 'Dedicated delivery time per engagement' },
      { value: '50% deposit', label: 'Always — protects both sides' },
      { value: '6 modules', label: 'Across procurement, logistics, reporting' },
      { value: '5 markets', label: 'Scandinavia, Germany, Netherlands, UK, Australia' }
    ]
  },

  // 3.7 — Editorial statement, not a testimonial — no fabricated attribution
  // (§4). Restyle as real client quotes exist.
  quote: {
    headline: 'The hardest part of scaling operations isn’t strategy. It’s execution.',
    body: 'Built for procurement and supply chain teams that have outgrown their bandwidth.'
  },

  // 3.8 — About.
  about: {
    eyebrow: '// ABOUT NORVENZIA',
    headline: 'Built to be the operations team you haven’t hired yet.',
    body: [
      'Norvenzia (Private) Limited is a supply chain and procurement operations partner registered in Sri Lanka. We give mid-market manufacturers and industrial suppliers across Scandinavia and Europe an operations bench without the overhead of building one in-house.',
      'Client relationships and strategy stay with you, close to your business. Execution runs from our delivery hub in Colombo — where the operational work gets done, every day.'
    ]
  },

  // 3.9 — FAQ accordion (public/js/accordion.js).
  faq: {
    eyebrow: '// COMMON QUESTIONS',
    headline: 'What people ask before they start.',
    items: [
      {
        question: 'What does "KPO" mean in practice?',
        answer:
          'Knowledge Process Outsourcing. Unlike BPO (data entry, call centres), KPO covers skilled, judgement-intensive work — procurement negotiations, supplier management, spend analysis. We run the work that needs supply chain expertise, not just bandwidth.'
      },
      {
        question: 'Do we need to change our ERP or TMS?',
        answer:
          'No. We plug into whatever you’re already using — SAP, Oracle, Business Central, spreadsheets, email. We don’t sell software.'
      },
      {
        question: 'What’s the minimum engagement?',
        answer:
          'We start with a pilot — a scoped diagnostic or one operational module — at a fixed price with a 50% deposit. No long contracts until both sides have proved the model works.'
      },
      {
        question: 'How is this different from hiring a consultant?',
        answer:
          'Consultants deliver recommendations. We deliver execution. The work gets done by our team, tracked against agreed KPIs, reported to you weekly.'
      },
      {
        question: 'Are you based in Europe?',
        answer:
          'Our client relationships and business development hub is in Gothenburg, Sweden. Delivery runs from Colombo, Sri Lanka — that’s the cost structure that makes this commercially viable for mid-market clients.'
      },
      {
        question: 'What’s the pricing model?',
        answer:
          'Fixed-price modules, quoted in outcome units (not hourly rates). Always 50% deposit upfront. Scope is agreed in writing before we start.'
      }
    ]
  },

  // 3.10 — Contact CTA. Email address is intentionally NOT hardcoded here —
  // the brief's copy said hello@norvenzia.com, but the site's actually
  // configured address is site.contactEmail (info@norvenzia.com, see
  // content/site.js). Rendered from site.contactEmail in home.ejs instead, so
  // there's one real inbox, not two. Flagging this substitution rather than
  // silently shipping a second, unmonitored address. The site's real contact
  // form lives at /contact (views/contact.ejs); this section links there
  // rather than duplicating the form.
  contactCta: {
    headline: 'Tell us what’s eating your team’s time.',
    body:
      'One email. We’ll come back with a scoped, honest read on whether Norvenzia is the right fit — not a sales deck.',
    bookingNote: 'Or book a 30-minute call →',
    bookingHref: '#'
  }
};
