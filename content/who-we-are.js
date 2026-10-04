module.exports = {
  meta: {
    title: 'About Us — Norvenzia',
    description:
      'A specialist procurement and supply chain operation, built deliberately small. Senior attention on your operation, not scale we don’t have yet.'
  },

  hero: {
    eyebrow: 'About us',
    headline: 'A specialist operation, built deliberately small.',
    body:
      'Norvenzia is early. We’d rather tell you that plainly than dress it up — what we offer is senior attention on your procurement operation, not scale we don’t have yet.'
  },

  about: {
    eyebrow: '// ABOUT NORVENZIA',
    headline: 'Built to be the operations team you haven’t hired yet.',
    photoHint: 'Photo: the Norvenzia team or delivery hub, Colombo — /img/photos/about.jpg',
    body: [
      'Norvenzia (Private) Limited is a supply chain and procurement operations partner registered in Sri Lanka. We give mid-market manufacturers and industrial suppliers across Scandinavia and Europe an operations bench without the overhead of building one in-house.',
      'Client relationships and strategy stay with you, close to your business. Execution runs from our delivery hub in Colombo — where the operational work gets done, every day.'
    ]
  },

  approach: {
    eyebrow: 'Our approach',
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

  founder: {
    eyebrow: 'Founder',
    headline: 'Why this exists.',
    name: 'Punsara Wimalasena',
    role: 'Founder, Norvenzia',
    photo: '/img/photos/founder-punsara.jpg',
    linkedin: 'https://www.linkedin.com/in/punsara-wimalasena',
    // Signed off by the founder — the story below reads as finished, so no
    // visible review marker. Setting this to a non-empty string brings the
    // notice back (see views/who-we-are.ejs).
    draftNotice: '',
    story: [
      'Over years spent in supply chain and procurement leadership across apparel, telecom, 3PL warehousing, and seafood, I saw a recurring pattern: supply chain is the lifeblood of a business controlling upwards of 60% of its working capital and operational cash flow yet most companies struggle to run it efficiently. Managing end-to-end logistics demands immense capital, time, and specialized talent, taking focus away from a company’s core mission.',
      'I founded Norvenzia to rewrite that narrative.',
      'Norvenzia is a specialized Knowledge Process Outsourcing (KPO) partner engineered to run end-to-end supply chain operations with precision. We don’t assign theorists or textbook consultants; our team consists of operators who have managed real supply chains on the ground. Powered by Sri Lanka’s top-tier logistics talent and operated with 100% operational transparency and direct, real-time client integration, we give global companies the speed, strategy, and cost advantage to scale effortlessly.'
    ]
  },

  team: {
    eyebrow: 'The team',
    headline: 'Who’s behind the work.',
    members: [
      {
        name: 'Viraj Bulugahapitiya',
        role: 'AI and Data Engineer',
        // TODO(founder): upload a headshot; initials render until then.
        photo: '',
        quote: '',
        linkedin: 'https://www.linkedin.com/in/viraj97'
      }
    ]
  },

  mission: {
    statement:
      'To give SMEs & mid-market companies senior-led procurement and supply chain operations, without the overhead of building that team in-house.'
  },

  // divisions shown in this section's table come from res.locals.divisions
  // (the Services page's data, see server.js) -- only the section's own
  // intro copy lives here.
  closing: {
    headline: 'Let’s talk about your operation.',
    body:
      'A discovery call costs you half an hour and tells us both whether there’s a fit.',
    cta: { label: 'Book a Call', href: '/contact' }
  }
};
