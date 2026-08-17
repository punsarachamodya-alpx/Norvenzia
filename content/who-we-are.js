module.exports = {
  meta: {
    title: 'Who We Are — Norvenzia',
    description:
      'A specialist procurement and supply chain operation, built deliberately small. Senior attention on your operation, not scale we don’t have yet.'
  },

  hero: {
    eyebrow: 'Who we are',
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
      'I started Norvenzia because I noticed that during the years I spent in supply chain and procurement operations across telecom, garments, seafood, and logistics, good mid-market companies choose between two bad options: overpaying for a full in-house procurement team they don’t need year-round, or underpaying for outsourced labour that never really understands the work.',
      'There’s a third option: Norvenzia runs on people who’ve actually done this work, not people trained to sound like they have — delivered from Colombo, owned from Gothenburg, with a single person accountable for it in your time zone. No layers between the judgment and the job.',
      'That’s the starting point, not the ceiling. Where we’re going is a KPO shaped for how supply chains actually run now, senior judgment first, technology built to sharpen it, never to replace it.'
    ]
  },

  team: {
    eyebrow: 'The team',
    headline: 'Who’s behind the work.',
    members: [
      {
        name: 'Viraj Bulugahapitiya',
        role: 'AI Engineer and Data Scientist, At Norvenzia',
        // TODO(founder): upload a headshot; initials render until then.
        photo: '',
        quote: '',
        linkedin: 'https://www.linkedin.com/in/viraj97'
      }
    ]
  },

  mission: {
    statement:
      'To give mid-market companies senior-led procurement and supply chain operations, without the overhead of building that team in-house.'
  },

  roadmap: {
    eyebrow: 'Roadmap',
    headline: 'Where this is headed.',
    body:
      'We publish this so there’s no ambiguity about what you can buy today. Operations and Analytics are live. The rest is direction, not a menu.',
    divisions: [
      {
        name: 'Operations',
        status: 'live',
        scope: 'Procurement, PO management, supplier onboarding, reporting.'
      },
      {
        name: 'Analytics',
        status: 'live',
        scope:
          'Spend analysis, vendor dashboards, inventory and demand planning.'
      },
      {
        name: 'Digital',
        status: 'roadmap',
        scope: 'Process automation and systems integration — Year 2+.'
      },
      {
        name: 'AI',
        status: 'roadmap',
        scope: 'Applied forecasting and document processing — Year 2+.'
      },
      {
        name: 'Advisory',
        status: 'roadmap',
        scope: 'Strategic sourcing and procurement transformation — Year 2+.'
      }
    ]
  },

  closing: {
    headline: 'Let’s talk about your operation.',
    body:
      'A discovery call costs you half an hour and tells us both whether there’s a fit.',
    cta: { label: 'Book a Call', href: '/contact' }
  }
};
