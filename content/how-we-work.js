module.exports = {
  meta: {
    title: 'The Model — Norvenzia',
    description:
      'A single Colombo-based team delivering senior-led procurement and supply chain operations remotely to clients across the EU, Norway, the UK, Australia, New Zealand, and the United States.'
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
      'We serve clients across the wider EU, Norway, the UK, Australia, New Zealand, and the United States entirely remotely, on Colombo time — with no local office in any of those markets.',
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
        body: 'Clients across the EU, Norway, the UK, Australia, New Zealand, and the United States — served remotely, with no local office in any of them.'
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
