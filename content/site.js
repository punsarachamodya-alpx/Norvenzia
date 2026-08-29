// Company facts, contact details, base URL.
//
// Operating model (confirmed): Norvenzia is fully remote from a single hub in
// Colombo, Sri Lanka -- no office or physical presence anywhere else. Clients
// are served internationally (wider EU, Norway, Switzerland, UK, Australia,
// New Zealand, United States) entirely through remote delivery, not local
// presence. The former "EU engagement point in Sweden" framing is retired.

module.exports = {
  legalEntity: 'Norvenzia (Private) Limited',
  publicName: 'Norvenzia',
  descriptor: 'Procurement & supply chain operations',
  // Retired "Precision. Partnership. Progress." — generic for the first two,
  // over-claiming for the third. "We run the work." is true today and is the
  // actual differentiator.
  tagline: 'We run the work.',
  description:
    'Norvenzia runs procurement and supply chain operations for mid-market companies — a single Colombo-based team, delivered fully remotely to clients across the EU, Norway, Switzerland, the UK, Australia, New Zealand, and the United States.',
  // Two genuinely separate inboxes — contactEmail is the contact-form
  // destination and the address shown on the contact page / home CTA;
  // footerEmail is a distinct address that only ever appears in the
  // footer. Do not merge these.
  contactEmail: 'contact@norvenzia.com',
  footerEmail: 'contact@norvenzia.com',
  // TODO(founder): this is a legacy Swedish number, kept for now at the
  // founder's explicit instruction even though the business no longer has a
  // Sweden presence. Revisit once a Colombo-based number (or removing phone
  // contact entirely) is decided.
  phone: '+46 73 779 5741',
  registrationLine: 'Norvenzia (Private) Limited. All rights reserved.',
  // Single hub, replacing the former engagementPoint/deliveryHub split (that
  // pair implied two locations; there is only one now).
  hub: 'Colombo, Sri Lanka',
  linkedinUrl: 'https://www.linkedin.com/company/norvenzia',
  baseUrl: process.env.BASE_URL || 'https://www.norvenzia.com'
};
