module.exports = {
  meta: {
    title: 'The Model — Norvenzia',
    description:
      'A single Colombo-based team delivering senior-led procurement and supply chain operations remotely to clients across the EU, Norway, Switzerland, the UK, Australia, and New Zealand.'
  },

  hero: {
    eyebrow: 'The model',
    headline: 'A deliberate design, not an outsourcing euphemism.',
    body:
      'A senior, Colombo-based team running your procurement and supply chain operations remotely — not a detail we hide in the footer.'
  },

  // Norvenzia is fully remote from a single Colombo hub -- no office or
  // physical presence anywhere else (see content/site.js). These two panels
  // are two facets of that one model (where the work happens, who it reaches),
  // not two locations -- "The reach" panel deliberately carries no image/place,
  // since there is no second office to show.
  model: {
    eyebrow: 'The model',
    headline: 'One hub, one accountable team.',
    body: [
      'Colombo, Sri Lanka is where the work happens — and where you reach us. Senior supply chain and procurement analysts, not a rotating call-centre desk, working inside your existing tools and processes.',
      'We serve clients across the wider EU, Norway, Switzerland, the UK, Australia, and New Zealand entirely remotely, on Colombo time — with no local office in any of those markets, though the founder travels to meet clients in person when it’s useful.',
      'That’s the structure that makes senior-led delivery commercially viable for mid-market clients: proven enterprise-grade practice, applied to a segment usually priced out of it.'
    ],
    panels: [
      {
        label: 'The hub',
        place: 'Colombo, Sri Lanka',
        image: '/img/regions/lk-06.png',
        body: 'Senior analysts running your day-to-day procurement operations, in one accountable team.'
      },
      {
        label: 'The reach',
        place: 'Remote, by design',
        image: '',
        body: 'Clients across the EU, Norway, Switzerland, the UK, Australia, and New Zealand — served remotely, with no local office in any of them.'
      }
    ]
  },

  methodology: {
    eyebrow: 'Methodology',
    headline: 'Documented process, not tribal knowledge.',
    body:
      'Every engagement follows the same five stages. The point is that quality survives staff changes, holidays, and volume spikes — because the process is written down, not carried in someone’s head.',
    stages: [
      {
        number: '01',
        title: 'Onboarding',
        body:
          'We map your current tools, workflows, and reporting cadence before any task moves.'
      },
      {
        number: '02',
        title: 'Knowledge Transfer',
        body:
          'Structured handover sessions capture the context a new team needs to work inside your existing process — not around it.'
      },
      {
        number: '03',
        title: 'SOP Documentation',
        body:
          'Every recurring process is written up as a standard operating procedure, reviewed with you before it goes live.'
      },
      {
        number: '04',
        title: 'QA Loop',
        body:
          'Work is checked against the documented SOP before it reaches you — not after something breaks.'
      },
      {
        number: '05',
        title: 'SLA / TAT Commitments',
        body:
          'Turnaround and service-level commitments are agreed upfront and tracked per engagement.'
      }
    ]
  },

  security: {
    eyebrow: 'Data security & compliance',
    headline: 'What’s actually in place today.',
    body:
      'We write this section around what is genuinely true right now, rather than borrowing enterprise-vendor language we haven’t earned. If you need something here that isn’t listed, ask us directly and we’ll give you a straight answer.',
    inPlaceLabel: 'In place today',
    inPlace: [
      'GDPR-aligned data handling practices across the engagement.',
      'A Data Processing Agreement (DPA) available on request.',
      'A Non-Disclosure Agreement (NDA) signed before any sensitive data or documentation changes hands.',
      'Confidentiality terms in every engagement agreement.',
      'Access limited to the analysts assigned to your account.'
    ],
    roadmapLabel: 'On the roadmap — not yet true',
    roadmap: [
      'ISO 27001 certification is a planned trust-building step, not a credential we hold today.',
      'We do not claim SOC 2, and won’t until an audit is actually complete.'
    ]
  },

  // Pre-empts the objections a skeptical EU buyer has before they'll book a
  // call. Two further questions — the engagement-size floor and the list of
  // systems we work inside — are pending founder input and are deliberately
  // absent rather than answered vaguely; add them here when confirmed.
  faq: {
    eyebrow: 'Questions',
    headline: 'Frequently asked questions.',
    items: [
      {
        question: 'Why is Norvenzia so new — should that concern me?',
        answer:
          'It’s a fair question, so here’s a straight answer: we’re early, and we’ve said so throughout this site rather than dressing it up. What you get today is senior attention on your operation, run by someone with hands-on supply chain and procurement experience across telecom, garments, seafood, and logistics — not scale we haven’t earned yet. A discovery call costs you thirty minutes and tells you directly whether that trade-off works for your operation.'
      },
      {
        question: 'Where is our data actually handled?',
        answer:
          'Everything runs through our Colombo team. Access is limited to the analysts assigned to your account, under confidentiality terms in every engagement agreement, with a Data Processing Agreement available on request. Full detail is in the data security section above.'
      },
      {
        question: 'Do you replace our procurement team, or work alongside it?',
        answer:
          'Alongside, by default. Most engagements start with one defined process — PO management or supplier onboarding, for example — running inside your existing tools, not replacing your systems or your team.'
      },
      {
        question: 'How is pricing structured?',
        answer:
          'Every engagement is scoped and priced against your actual process — we don’t publish a rate card because a generic one wouldn’t reflect what you actually need. Tell us what you run today and we’ll come back with a scoped proposal.'
      }
    ]
  },

  closing: {
    headline: 'Want to see how this maps to your operation?',
    body:
      'We’ll walk through your current process and show you exactly where the model would slot in.',
    cta: { label: 'Book a Call', href: '/contact' }
  }
};
