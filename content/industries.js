// Seven verticals. Pain points describe operational patterns we see repeatedly —
// they are not case studies, and no client is named or implied (Brief §11).

module.exports = {
  meta: {
    title: 'Industries — Norvenzia',
    description:
      'Seven verticals, one operating model. The procurement and supply chain patterns we are built to take on.'
  },

  hero: {
    eyebrow: 'Industries',
    headline: 'Seven verticals, one operating model.',
    body:
      'These are the operational patterns we see repeatedly in mid-market procurement teams. No named clients — just the problems we’re built to take on.'
  },

  items: [
    {
      slug: 'manufacturing',
      name: 'General & Discrete Manufacturing',
      image: '/img/photos/industry-manufacturing.jpg',
      icon: '', // optional: overrides the built-in line icon
      painPoints: [
        'Capex and tooling procurement running through the same ad hoc process as routine MRO spend, with no cost visibility split between the two.',
        'Contract and private-label production commitments made before supplier capacity and lead-time risk are actually confirmed.',
        'Machine parts and spares sourced reactively on breakdown, with no consolidated vendor or lead-time data to plan around.'
      ]
    },
    {
      slug: 'renewable-energy',
      name: 'Renewable Energy',
      image: '/img/photos/industry-renewable-energy.jpg',
      icon: '', // optional: overrides the built-in line icon
      painPoints: [
        'Fast-scaling procurement volume outpacing the internal team that originally set it up.',
        'Multi-region supplier coordination with inconsistent lead-time visibility.',
        'Project-based sourcing that needs faster RFQ turnaround than current headcount supports.'
      ]
    },
    {
      slug: 'electronics-ems',
      name: 'Electronics / EMS',
      image: '/img/photos/industry-electronics-ems.jpg',
      icon: '', // optional: overrides the built-in line icon
      painPoints: [
        'Component sourcing across volatile lead times with no dedicated analyst tracking it.',
        'Supplier onboarding backlog as production lines add new vendors under time pressure.',
        'Spend data locked in ERP exports nobody has time to turn into a usable view.'
      ]
    },
    {
      slug: 'fmcg',
      name: 'FMCG',
      image: '/img/photos/industry-fmcg.jpg',
      icon: '', // optional: overrides the built-in line icon
      painPoints: [
        'High SKU count driving procurement admin a lean team can’t keep pace with.',
        'Demand swings that outrun manual replenishment and inventory tracking.',
        'Vendor performance tracked informally, if at all, across a large supplier base.'
      ]
    },
    {
      slug: 'food-production',
      name: 'Food Production',
      image: '/img/photos/industry-food-production.jpg',
      icon: '', // optional: overrides the built-in line icon
      painPoints: [
        'Supplier onboarding and documentation cycles competing with seasonal production pressure.',
        'Inventory and demand planning done in spreadsheets as volume outgrows the process.',
        'Procurement reporting that can’t answer where cost or supply risk is concentrated.'
      ]
    },
    {
      slug: 'apparel-manufacturing',
      name: 'Apparel Manufacturing',
      image: '/img/photos/industry-apparel-footwear.jpg',
      icon: '', // optional: overrides the built-in line icon
      painPoints: [
        'Seasonal style changes multiplying SKUs across sizes, colours, and materials faster than manual purchasing can track.',
        'Multi-tier sourcing — fabric mills, trims, components — with fragmented supplier data and no consolidated spend view.',
        'Compliance and factory-audit documentation piling up faster than a lean team can process it.'
      ]
    },
    {
      slug: 'footwear-manufacturing',
      name: 'Footwear Manufacturing',
      image: '/img/photos/industry-apparel-footwear.jpg',
      icon: '', // optional: overrides the built-in line icon
      painPoints: [
        'Component sourcing spread across uppers, soles, and outsole suppliers with no consolidated lead-time view.',
        'Last-and-mould-specific tooling procurement running through the same process as routine component reorders.',
        'Factory-audit and compliance documentation piling up faster than a lean team can process it.'
      ]
    }
  ],

  fit: {
    eyebrow: 'Is this a fit?',
    headline: 'Where Norvenzia works best.',
    criteria: [
      'You run 20–500 employees, procurement has outgrown the person who set it up, and you have a defined (or semi-defined) supply chain process to build on.',
      'You’re based in the EU, Norway, the UK, Australia, New Zealand, or the United States.',
      'You’re ready to plug an external team into your existing tools and workflows, not rebuild everything from scratch.',
      'You’d rather buy senior capacity than carry the cost of hiring it in-house.'
    ]
  },

  closing: {
    headline: 'Don’t see your industry?',
    body:
      'If your operation runs on procurement and supply chain, we’d still like to hear from you.',
    cta: { label: 'Book a Call', href: '/contact' }
  }
};
