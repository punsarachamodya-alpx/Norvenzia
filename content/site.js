// Company facts, contact details, base URL.
// TODO(founder): confirm registrationLine wording and the Sweden engagement-point framing.

// publicName/tagline/description are the operating brand (Norvenzia) shown
// to visitors. legalEntity/registrationLine/contactEmail/linkedinUrl/baseUrl
// are NOT changed as part of the Norvenzia rebrand copy pass: they are
// still-unconfirmed legal/registration wording (see the TODO above and
// README's "Outstanding founder TODOs") and live infrastructure identifiers
// (the actual registered domain, mailbox, and LinkedIn company page) rather
// than page copy -- changing them here would silently break real mail
// delivery/links or assert an unconfirmed legal fact. Update them only once
// those are actually confirmed/migrated.
module.exports = {
  legalEntity: 'MassifyX Global (Private) Limited',
  publicName: 'Norvenzia',
  tagline: 'Precision. Partnership. Progress.',
  description:
    'Norvenzia is a knowledge process outsourcing partner running procurement and supply chain operations for mid-market companies - an EU-based engagement point paired with senior-led delivery from Sri Lanka.',
  contactEmail: 'info@massifyx.com',
  registrationLine:
    'MassifyX Global (Private) Limited — registered in Sri Lanka',
  engagementPoint: 'Sweden',
  deliveryHub: 'Sri Lanka',
  linkedinUrl: 'https://www.linkedin.com/company/massifyx-global/',
  baseUrl: process.env.BASE_URL || 'https://www.massifyx.com'
};
