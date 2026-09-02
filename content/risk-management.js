// Risk Management division: landing page + its topic pages + their service
// pages, sourced verbatim from Norvenzia_Website_Content_for_Claude_Code.docx.
// See content/operations.js's header comment for the shared shape/routing
// convention this and content/analytics.js also follow.
//
// Distinct from (but thematically overlapping) the terser "Resilience"
// capability list on the /services page (content/what-we-do.js) -- that
// division was renamed to "Risk Management" and its tile now links here;
// see server.js/views/what-we-do.ejs.

module.exports = {
  slug: 'risk-management',
  meta: {
    title: 'Risk Management — Norvenzia',
    description:
      'Proactive supplier risk monitoring, supply chain resilience, and compliance support for mid-market industrial companies.'
  },
  h1: 'Risk Management',
  body:
    'Global supply chains face constant market volatility, operational exposure, and complex regulatory demands. Norvenzia’s Risk practice protects your organization by continually monitoring vendor stability, mapping structural dependencies, and managing complex regulatory requirements.',

  topics: [
    {
      slug: 'supplier-risk-resilience',
      meta: {
        title: 'Supplier Risk & Resilience — Norvenzia',
        description:
          'Comprehensive risk intelligence, single-point-of-failure mitigation, and supply continuity architecture.'
      },
      h1: 'Supplier Risk & Resilience',
      body:
        'Building resilience requires early risk detection. We systematically map critical vulnerabilities, monitor vendor health, and design dual-sourcing contingency strategies to ensure operational continuity under any market conditions.',
      services: [
        {
          slug: 'supplier-risk-monitoring',
          meta: {
            title: 'Supplier Risk Monitoring — Norvenzia',
            description:
              'Proactive financial monitoring and operational risk indicators for critical tier-one supplier portfolios.'
          },
          h1: 'Supplier Risk Monitoring',
          cardBlurb: 'Multi-source financial health tracking and operational risk detection for critical vendors.',
          problem:
            'Suppliers rarely disclose financial distress until distress impacts production—leaving you vulnerable to sudden, catastrophic supply disruptions.',
          whatWeDo:
            'We continually monitor your critical suppliers using independent third-party risk indicators: corporate registry filings, credit rating shifts, court records, payment trend metrics, and global news monitoring.',
          whatYouGet:
            'Early warning indicators on vendor distress, allowing you to execute mitigation strategies long before a supply line fails.'
        },
        {
          slug: 'supply-chain-resilience',
          meta: {
            title: 'Supply Chain Resilience — Norvenzia',
            description:
              'Dependency mapping, geographic risk exposure mitigation, and secondary supplier qualification strategies.'
          },
          h1: 'Supply Chain Resilience',
          cardBlurb: 'Mapping your supplier dependencies and geographic exposure, with alternate sources identified in advance.',
          problem:
            'Single-source dependencies and geographic concentration risks are often overlooked until a disruption shuts down operations.',
          whatWeDo:
            'We perform multi-tier risk assessments to identify single points of failure, map geopolitical and geographic exposures, pre-qualify alternate suppliers, and establish clear emergency response playbooks for key spend categories.',
          whatYouGet:
            'An enterprise supply chain risk register and actionable continuity plans, ensuring business continuity during market disruptions.'
        }
      ],
      cardBlurb: 'Real-time supplier financial monitoring, dependency mapping, and continuity planning.'
    },

    {
      slug: 'regulatory-sustainability',
      meta: {
        title: 'Regulatory & Sustainability — Norvenzia',
        description:
          'Supply chain compliance governance, ESG disclosure tracking, and customer audit readiness solutions.'
      },
      h1: 'Regulatory & Sustainability',
      body:
        'Evolving customer expectations and regulatory demands require structured supply chain transparency. We turn compliance and sustainability disclosures into a repeatable, audit-ready operational framework.',
      services: [
        {
          slug: 'regulatory-compliance-cascade',
          meta: {
            title: 'Regulatory and Compliance Cascade — Norvenzia',
            description:
              'End-to-end management of complex regulatory, customer compliance, and due-diligence questionnaire requests.'
          },
          h1: 'Regulatory and Compliance Cascade',
          cardBlurb:
            'Handling end-to-end administration of customer due-diligence demands, and the ones you need to send your own suppliers.',
          problem:
            'A due-diligence questionnaire from a major customer, with a tight deadline, lands on a desk with no dedicated owner and no established process to answer it.',
          whatWeDo:
            'We manage the full compliance cascade. We issue, collect, evaluate, and archive mandatory compliance document packages across your supply base, assembling complete, auditable responses for your corporate customers.',
          whatYouGet:
            'Rapid, professional compliance handling that strengthens customer trust and eliminates internal administrative burden.'
        },
        {
          slug: 'sustainable-procurement',
          meta: {
            title: 'Sustainable Procurement Strategies — Norvenzia',
            description:
              'Proactive ESG compliance tracking, vendor sustainability metrics, and audit-ready documentation repositories.'
          },
          h1: 'Sustainable Procurement Strategies',
          cardBlurb: 'Structured ESG data management, supplier sustainability scoring, and evidence repositories.',
          problem:
            'Scrambling to gather supplier environmental, social, and governance (ESG) evidence under tight deadlines leads to incomplete submissions and reputational exposure.',
          whatWeDo:
            'We maintain a centralized, continually updated supplier sustainability registry. We track vendor certifications, carbon disclosures, and labor standards against your corporate governance framework, verifying evidence annually.',
          whatYouGet:
            'An audit-ready ESG repository that satisfies regulatory audits, strengthens tenders, and highlights your commitment to sustainable procurement.'
        }
      ],
      cardBlurb: 'Complete compliance assurance, ESG evidence gathering, and customer audit readiness.'
    }
  ]
};
