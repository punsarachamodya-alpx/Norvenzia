// Operations division: landing page + its topic pages + their service pages,
// all sourced verbatim from Norvenzia_Website_Content_for_Claude_Code.docx
// (SLUG/META DESCRIPTION/H1/PARENT/BODY blocks). Nesting mirrors the doc's
// PARENT field exactly -- URLs stay flat (/operations/<slug>) for every
// child regardless of whether it's a topic or a service; server.js resolves
// which by searching this tree, and each level's own PARENT is what drives
// the "back to..." link, not the URL depth.
//
// Digital and AI / Advisory and Transformation are deliberately absent from
// the source document and must not be added here.

module.exports = {
  slug: 'operations',
  meta: {
    title: 'Operations — Norvenzia',
    description:
      'End-to-end procurement and supply chain execution for industrial leaders, delivered seamlessly by dedicated operational experts.'
  },
  h1: 'Operations',
  body:
    'Operations forms the operational foundation of your supply chain. Norvenzia integrates directly into your business to manage strategic sourcing, procurement execution, contract lifecycles, and vendor onboarding with daily rigor and institutional discipline.',

  topics: [
    {
      slug: 'sourcing-contracting',
      meta: {
        title: 'Sourcing & Contracting — Norvenzia',
        description:
          'From strategic category management to final execution—end-to-end commercial sourcing designed for mid-market industrial leadership.'
      },
      h1: 'Sourcing & Contracting',
      body:
        'Transforming procurement from tactical buying into a strategic value center. We manage the complete front-end sourcing architecture, aligning category strategy, market intelligence, structured negotiations, and contractual governance.',
      services: [
        {
          slug: 'category-strategy',
          meta: {
            title: 'Category Strategy — Norvenzia',
            description:
              'Category-by-category procurement strategy for mid-market industrial buyers, delivering sustainable commercial advantage.'
          },
          h1: 'Category Strategy',
          cardBlurb: 'Category-by-category procurement strategy for mid-market enterprise growth.',
          problem:
            'Mid-market industrial companies often execute spend reactively on an ad-hoc basis. Without structured category strategies, purchasing decisions rely on historical bias, supplier inertia, and fragmented transaction habits—leaving significant margin on the table.',
          whatWeDo:
            'We architect actionable, enterprise-grade category strategies for every major spend bucket. We analyze supply market dynamics, evaluate demand patterns, map value levers, and deliver a formal strategic roadmap reviewed biannually to capture changing market conditions.',
          whatYouGet:
            'A clear, dynamic category roadmap that converts spend into strategic advantage, backed by executive alignment and accountable delivery milestones.'
        },
        {
          slug: 'sourcing-rfq',
          meta: {
            title: 'Sourcing and RFQ Execution — Norvenzia',
            description:
              'End-to-end competitive sourcing and RFQ management delivering rigorous supplier selection and measurable bottom-line value.'
          },
          h1: 'Sourcing and RFQ Execution',
          cardBlurb:
            'End-to-end sourcing and RFQ execution, shortlist, evaluate, and drive true commercial total-cost optimization.',
          problem:
            'Conducting rigorous, competitive sourcing events requires dedicated market intelligence and administrative bandwidth. Internal teams, stretched thin by daily operations, frequently default to incumbent suppliers without market testing.',
          whatWeDo:
            'We lead end-to-end market engagement, score them against a consistent five-point checklist covering quality, service, cost, innovation, and regulatory fit, run the request for quote, and normalize complex commercial bids on a true Total Cost of Ownership (TCO) basis, and evaluate proposals across a multi-metric governance framework.',
          whatYouGet:
            'An auditable, institutionally defensible market selection process that provides clear commercial recommendations while leaving final executive approval entirely in your hands.'
        },
        {
          slug: 'negotiation-preparation',
          meta: {
            title: 'Negotiation Preparation — Norvenzia',
            description:
              'Data-driven negotiation intelligence, supplier leverage analysis, and target positioning for high-stakes supplier engagements.'
          },
          h1: 'Negotiation Preparation',
          cardBlurb: 'Data-backed negotiation intelligence, leverage mapping, and actionable walk-away thresholds.',
          problem:
            'Walking into a supplier negotiation without a clear number in mind, or without knowing your actual leverage, gives the advantage away before negotiations even begin.',
          whatWeDo:
            'We equip your leadership team with analytical dominance. We construct price volume trends, analyze supplier cost structures, establish game-theoretic leverage models, and deliver an executive briefing detailing target pricing, concession strategies, and precise walk-away thresholds.',
          whatYouGet:
            'An actionable, high-impact negotiation playbook. You maintain full control of executive conversations, powered by our preparation and commercial intelligence.'
        },
        {
          slug: 'contract-management',
          meta: {
            title: 'Contract Management — Norvenzia',
            description:
              'Active contract lifecycle management and governance to prevent automatic renewals, mitigate exposure, and protect profit margins.'
          },
          h1: 'Contract Management',
          cardBlurb: 'Active contract lifecycle management and value preservation to eliminate margin leakage.',
          problem:
            'Unmonitored commercial agreements lead to auto-renewals at unfavorable rates, uncaptured rebate terms, and escalating supplier risk.',
          whatWeDo:
            'We establish and maintain a centralized, active contract governance repository. Our team tracks all contractual obligations, service-level compliance, termination windows, and expiration milestones, providing proactive alerts 60 to 90 days ahead of critical decision points.',
          whatYouGet:
            'Complete visibility and active governance across your contractual footprint—ensuring no supplier commitment quietly auto-renews or expires unexamined.'
        }
      ],
      cardBlurb:
        'Strategic category design through execution, driving commercial value across your supplier portfolio.'
    },

    {
      slug: 'source-to-pay',
      meta: {
        title: 'Source-to-Pay Operations — Norvenzia',
        description:
          'Enterprise Source-to-Pay operational management delivering administrative precision, master data governance, and compliance.'
      },
      h1: 'Source-to-Pay Operations',
      body:
        'Operational excellence depends on transactional integrity. We manage your daily transactional procurement workflows—from order creation and master data governance to vendor compliance screening, ensuring faultless execution in the background.',
      services: [
        {
          slug: 'procure-to-pay',
          meta: {
            title: 'Purchase Order and Procure-to-Pay Operations — Norvenzia',
            description:
              'Seamless, full-lifecycle Procure-to-Pay (P2P) management, ensuring transactional velocity and operational clarity.'
          },
          h1: 'Purchase Order and Procure-to-Pay Operations',
          cardBlurb: 'High-precision P2P workflow administration and rapid resolution of operational friction.',
          problem:
            'The daily grind of raising orders, chasing confirmations, and answering “where’s my order” questions consumes hours your team could spend elsewhere.',
          whatWeDo:
            'We run your daily operational P2P cycle. We convert approved requisitions into accurate purchase orders, track order fulfillment, manage supplier delivery commitments, reconcile receipt exceptions, and act as a single, accountable point of contact for vendor inquiries.',
          whatYouGet:
            'A highly efficient transactional engine that runs predictably, allowing your internal teams to focus strictly on strategic growth.'
        },
        {
          slug: 'master-data-management',
          meta: {
            title: 'Master Data Management — Norvenzia',
            description:
              'Rigorous procurement and supply chain master data governance to power precise reporting and enterprise automation.'
          },
          h1: 'Master Data Management',
          cardBlurb: 'Governance and standardization of core supplier and item catalogs—the bedrock of operational scaling.',
          problem:
            'Corrupted, duplicate, or unstandardized procurement data compromises ERP functionality, distorts financial reporting, and undermines executive decision-making.',
          whatWeDo:
            'We perform systematic data cleansing and establish governance protocols across your vendor master, item taxonomies, and purchasing catalogs. We execute a thorough initial remediation followed by continuous quarterly maintenance to preserve data hygiene.',
          whatYouGet:
            'A clean, single source of data truth that unlocks reliable analytics, smooth reporting, and scalable automation.'
        },
        {
          slug: 'supplier-onboarding-screening',
          meta: {
            title: 'Supplier Onboarding and Screening — Norvenzia',
            description:
              'Comprehensive vendor onboarding, regulatory compliance, and sanctions screening to safeguard corporate reputation.'
          },
          h1: 'Supplier Onboarding and Screening',
          cardBlurb:
            'New supplier onboarding with a documented sanctions and compliance screening step before anything is approved.',
          problem:
            'Adding a new supplier without checking who you’re actually dealing with is a risk most SMEs carry without realizing it and, increasingly, one your own customers will ask you about.',
          whatWeDo:
            'We collect the supplier’s details, screen them against public sanctions lists and adverse media, and keep a dated record of every check. Anything unclear gets flagged back to you; we never make that call for you.',
          whatYouGet:
            'An auditable, fully compliant vendor registry that withstands third-party customer audits and regulatory scrutiny.'
        }
      ],
      cardBlurb:
        'Seamless procure-to-pay administration, master data integrity, and compliance-driven vendor onboarding.'
    },

    {
      slug: 'process-optimization-topic',
      meta: {
        title: 'Process Optimization — Norvenzia',
        description:
          'Process re-engineering and workflow optimization to eliminate supply chain bottlenecks and maximize efficiency.'
      },
      h1: 'Process Optimization',
      body:
        'Finding exactly where your procurement process slows down. We apply lean methodologies to analyze your end-to-end supply chain processes, target bottlenecks, and redesign workflows for structural efficiency.',
      services: [
        {
          slug: 'process-optimization',
          meta: {
            title: 'Process Optimization — Norvenzia',
            description:
              'Targeted process re-engineering for industrial procurement workflows, driving speed, compliance, and cost containment.'
          },
          h1: 'Process Optimization',
          cardBlurb:
            'Mapping your procurement process end to end to find where it slows down, with specific fixes, not general advice.',
          problem:
            'Supply chain processes degrade over time—accumulating redundant approval loops, manual handoffs, and hidden lead-time delays that internal teams accept as normal.',
          whatWeDo:
            'We map your complete operational workflows from requisition to settlement. We pinpoint precise structural bottlenecks, quantify procedural costs, and implement streamlined workflows engineered to reduce cycle times and enhance operational control.',
          whatYouGet:
            'A lean, documented, high-velocity operational model with clear performance metrics, reviewed annually for continuous improvement.'
        }
      ],
      cardBlurb: 'Process re-engineering to eliminate friction, reduce lead times, and optimize operating costs.'
    }
  ]
};
