// Company facts, contact details, base URL.
// TODO(founder): confirm the exact Sweden engagement-point framing and the
// registered-company wording for the footer.

module.exports = {
  legalEntity: 'Norvenzia (Private) Limited',
  publicName: 'Norvenzia',
  descriptor: 'Procurement & supply chain operations',
  // Retired "Precision. Partnership. Progress." — generic for the first two,
  // over-claiming for the third. "We run the work." is true today and is the
  // actual differentiator.
  tagline: 'We run the work.',
  description:
    'Norvenzia runs procurement and supply chain operations for mid-market companies — an EU engagement point in Sweden with senior-led delivery from Colombo.',
  // Two genuinely separate inboxes — contactEmail is the contact-form
  // destination and the address shown on the contact page / home CTA;
  // footerEmail is a distinct address that only ever appears in the
  // footer. Do not merge these.
  contactEmail: 'info@norvenzia.com',
  footerEmail: 'contact@norvenzia.com',
  phone: '+46 73 779 5741',
  registrationLine: 'Norvenzia (Private) Limited. All rights reserved.',
  engagementPoint: 'Sweden',
  deliveryHub: 'Colombo, Sri Lanka',
  linkedinUrl: 'https://www.linkedin.com/company/norvenzia',
  baseUrl: process.env.BASE_URL || 'https://www.norvenzia.com'
};
