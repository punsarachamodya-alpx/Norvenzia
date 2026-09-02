// Analytics division: landing page + its topic pages + their service pages,
// sourced verbatim from Norvenzia_Website_Content_for_Claude_Code.docx.
// See content/operations.js's header comment for the shared shape/routing
// convention this and content/risk-management.js also follow.

module.exports = {
  slug: 'analytics',
  meta: {
    title: 'Analytics — Norvenzia',
    description:
      'Advanced supply chain analytics, spend visibility, working capital optimization, and predictive planning for mid-market leaders.'
  },
  h1: 'Analytics',
  body:
    'Data only creates value when it informs strategy. Norvenzia’s Analytics platform turns raw operational data into actionable intelligence—identifying cost-saving opportunities, measuring vendor performance, and releasing cash trapped in working capital.',

  topics: [
    {
      slug: 'spend-cost-intelligence',
      meta: {
        title: 'Spend & Cost Intelligence — Norvenzia',
        description:
          'Enterprise spend analytics and advanced cost modeling designed to unlock margin expansion across all purchase categories.'
      },
      h1: 'Spend & Cost Intelligence',
      body:
        'Achieving cost excellence requires true cost transparency. We analyze your full financial spend, evaluate supplier cost drivers, and build defensible cost models that strengthen your commercial positioning.',
      services: [
        {
          slug: 'spend-analytics',
          meta: {
            title: 'Spend and Tail Spend Analytics — Norvenzia',
            description:
              'Comprehensive spend taxonomy, tail-spend consolidation, and prioritized cost-reduction roadmaps.'
          },
          h1: 'Spend and Tail Spend Analytics',
          cardBlurb: 'Complete spend visibility and systematic value extraction across unmanaged tail spend.',
          problem:
            'Significant capital is lost across unmanaged “tail spend”—hundreds of fragmented supplier purchases that fall below standard sourcing thresholds and escape scrutiny.',
          whatWeDo:
            'We categorize 100% of your transactional spend into a standardized taxonomy. We identify pricing variances, rogue spend, and consolidation opportunities, providing you with a prioritized monthly value-realization dashboard.',
          whatYouGet:
            'Complete spend transparency and a prioritized pipeline of savings opportunities across your business.'
        },
        {
          slug: 'cost-optimization',
          meta: {
            title: 'Cost Optimization — Norvenzia',
            description:
              'Sophisticated should-cost modeling and engineering specification reviews to drive fair-market pricing.'
          },
          h1: 'Cost Optimization',
          cardBlurb: 'Should-cost modeling, bill-of-materials analysis, and global index benchmarking.',
          problem:
            'Without detailed insight into underlying raw material, labor, and overhead structures, buyers are forced to accept price adjustments without a clear basis for comparison.',
          whatWeDo:
            'We build bottom-up should-cost models based on market benchmarks, commodity indexes, and manufacturing cost structures. We evaluate technical specifications against commercial requirements to highlight cost drivers and uncover savings.',
          whatYouGet:
            'An objective, highly defensible target cost model that gives you complete confidence and strategic leverage during vendor negotiations.'
        }
      ],
      cardBlurb: 'Full spend visibility, tail-spend capture, and clean shoulder-cost financial models.'
    },

    {
      slug: 'supplier-performance-topic',
      meta: {
        title: 'Supplier Performance — Norvenzia',
        description:
          'Strategic supplier performance management frameworks to enforce accountabilities and elevate vendor capabilities.'
      },
      h1: 'Supplier Performance',
      body:
        'Supplier relationships must yield predictable operational and financial value. We build objective performance measurement systems that pinpoint underperformance early and maximize vendor value creation.',
      services: [
        {
          slug: 'supplier-performance',
          meta: {
            title: 'Supplier Performance Management — Norvenzia',
            description:
              'Objective KPI tracking, quarterly scorecard reviews, and vendor governance frameworks for key strategic suppliers.'
          },
          h1: 'Supplier Performance Management',
          cardBlurb: 'Data-driven quarterly performance scorecards and vendor governance frameworks.',
          problem:
            'Treating all suppliers identically dilutes executive focus. Without objective performance data, critical performance issues are addressed reactively through subjective complaints rather than quantitative facts.',
          whatWeDo:
            'We segment your vendor base by risk and business impact, then deploy quarterly scorecards tracking key performance indicators: On-Time In-Full (OTIF) delivery, quality rates, commercial competitiveness, and operational agility.',
          whatYouGet:
            'Clear performance scorecards that highlight high-performing partners and provide hard data to correct underperforming vendors.'
        }
      ],
      cardBlurb: 'Scorecards and performance frameworks to actively manage vendor accountability.'
    },

    {
      slug: 'planning-working-capital',
      meta: {
        title: 'Planning & Working Capital — Norvenzia',
        description:
          'Working capital optimization, inventory rightsizing, and structured S&OP processes to maximize free cash flow.'
      },
      h1: 'Planning & Working Capital',
      body:
        'Excess inventory directly ties up valuable operating cash flow. We integrate robust demand forecasting with inventory control strategies to release tied-up capital while maintaining high service levels.',
      services: [
        {
          slug: 'working-capital',
          meta: {
            title: 'Working Capital and Inventory Optimization — Norvenzia',
            description:
              'Quantitative inventory optimization strategies to release trapped cash while protecting service levels and stock availability.'
          },
          h1: 'Working Capital and Inventory Optimization',
          cardBlurb: 'Data-driven inventory rightsizing, excess-stock reduction, and cash optimization.',
          problem:
            'Excess, aging, and slow-moving inventory consumes critical working capital and increases holding costs, often hiding on the balance sheet until write-downs become unavoidable.',
          whatWeDo:
            'We perform deep inventory segmentation (ABC/XYZ analysis), establish dynamic safety-stock targets, identify slow-moving stock, and deliver specific disposition plans—such as revised order thresholds, vendor-managed arrangements, or structured liquidation.',
          whatYouGet:
            'A clear monthly roadmap to release trapped cash, improve inventory turns, and optimize working capital without compromising customer delivery expectations.'
        },
        {
          slug: 'demand-planning',
          meta: {
            title: 'Demand Planning and Sales & Operations Planning — Norvenzia',
            description:
              'Executive S&OP alignment and demand planning models that balance supply, demand, and operational capacity.'
          },
          h1: 'Demand Planning and Sales & Operations Planning',
          cardBlurb:
            'Structured monthly Sales & Operations Planning cycles that align commercial demand with operational supply.',
          problem:
            'Misalignment between sales projections and operations leads to stockouts, costly expediting fees, or expensive excess inventory.',
          whatWeDo:
            'We manage a monthly five-stage Sales & Operations Planning (S&OP) cadence: demand forecast consensus, supply capacity balancing, gap reconciliation, financial alignment, and executive sign-off.',
          whatYouGet:
            'A disciplined, predictable monthly planning cycle that eliminates cross-departmental silos, improves forecast accuracy, and resolves supply constraints early.'
        }
      ],
      cardBlurb: 'Integrated demand planning, S&OP cycles, and targeted inventory optimization.'
    },

    {
      slug: 'advanced-analytics-topic',
      meta: {
        title: 'Advanced Analytics — Norvenzia',
        description:
          'Predictive spend modeling, anomaly detection, and advanced risk intelligence for modern supply chain management.'
      },
      h1: 'Advanced Analytics',
      body:
        'Moving from historical reporting to predictive intelligence. We combine data-driven modeling with expert human analysis to identify operational anomalies, forecast spend variations, and flag risks before they hit your financials.',
      services: [
        {
          slug: 'advanced-analytics',
          meta: {
            title: 'Advanced Analytics — Norvenzia',
            description:
              'Forward-looking spend forecasting and algorithmic anomaly detection reviewed by supply chain experts.'
          },
          h1: 'Advanced Analytics',
          cardBlurb: 'Predictive spend forecasting, algorithmic anomaly detection, and expert-curated operational alerts.',
          problem:
            'Traditional historical reporting shows what has already gone wrong. By the time rogue spending, price inflation, or operational bottlenecks appear on quarterly reviews, the financial loss is already locked in.',
          whatWeDo:
            'We layer predictive forecasting models and statistical anomaly algorithms over your operational transaction streams. Our domain specialists review automated alerts to eliminate false positives and highlight material cost and risk variances early.',
          whatYouGet:
            'Proactive risk and spend intelligence, giving leadership time to intervene before costs escalate.'
        }
      ],
      cardBlurb: 'Predictive spend forecasting, anomaly detection, and expert-led risk analysis.'
    }
  ]
};
