// Three legal documents, one template. Each carries counselReviewed: false by default,
// which renders a visible "Draft — pending legal review" notice on the live page.
// TODO(founder): have counsel review all three, then set counselReviewed: true.

const privacy = {
  slug: 'privacy',
  title: 'Privacy Policy',
  intro:
    'This Privacy Policy explains how Norvenzia (Private) Limited handles personal data when you visit this website or contact us. It covers website visitors; data processed for a signed client engagement is governed by that engagement\'s own data-processing terms.',
  updated: 'October 2026',
  counselReviewed: false,
  sections: [
    {
      heading: 'Who we are',
      body: [
        'Norvenzia (Private) Limited ("Norvenzia", "we", "us" or "our") is registered in Sri Lanka under registration number PV00374811, with its registered office in Galle, Sri Lanka. Our delivery team operates from Colombo, Sri Lanka.',
        'Norvenzia is the controller of personal data collected through this website. This notice does not cover personal data we process for a client while delivering a signed engagement; that processing is governed by the relevant client agreement.',
        'For questions about this policy or personal data we hold, contact contact@norvenzia.com.'
      ]
    },
    {
      heading: 'Personal data we collect',
      body: [
        'When you submit an inquiry, we collect the information you provide in the form: your name, company, work email, country, and message. Please do not include confidential or commercially sensitive sourcing information in an unsolicited inquiry; see the Terms of Use.',
        'Our website infrastructure may record technical request data, such as IP address, request time, and browser information, for security, diagnosis, and reliable operation of the site.',
        'This site currently has no content-download form, third-party analytics, advertising pixels, or LinkedIn Insight Tag.'
      ]
    },
    {
      heading: 'How we use personal data',
      body: [
        'We use inquiry details to respond to you, discuss a potential engagement, and take steps you request before entering into a contract.',
        'We use technical request data to operate, protect, and troubleshoot the website, and to detect misuse or security incidents.',
        'We may process information when necessary to meet legal, tax, regulatory, or record-keeping obligations. We do not sell personal data or use inquiry submissions for unrelated marketing.'
      ]
    },
    {
      heading: 'Legal basis',
      body: [
        'Where the GDPR or UK GDPR applies, we process inquiry information to take steps at your request before a contract and, where appropriate, on our legitimate interest in responding to business inquiries and securing the website. We process information to meet legal obligations where required.',
        'The site currently uses only cookies and similar storage needed for essential site functions. If non-essential analytics or marketing technologies are introduced, they will be used only where required consent has been obtained. See the Cookie Policy.'
      ]
    },
    {
      heading: 'Who we share data with and international transfers',
      body: [
        'We do not sell personal data. We may share it with website hosting, email-delivery, and technical support providers where needed to operate the site or respond to your inquiry, and with public authorities where disclosure is required by law.',
        'Personal data may be accessed by our team in Sri Lanka. Sri Lanka does not currently benefit from an EU adequacy decision. Where data-protection law requires a transfer mechanism, the transfer must be supported by appropriate safeguards. Access is limited to people who need the information for their work; a Data Processing Agreement is available on request.'
      ]
    },
    {
      heading: 'How long we keep it',
      body: [
        'Inquiry information that does not lead to an engagement is generally kept for up to 24 months, then deleted, unless it is needed for an ongoing conversation or legal claim.',
        'Information connected to a client engagement is kept according to the record-keeping terms of that engagement and applicable legal obligations. Technical logs are retained only as long as reasonably needed for security and diagnostics.'
      ]
    },
    {
      heading: 'Security',
      body: [
        'We use reasonable technical and organizational measures to protect personal data against unauthorized access, loss, or misuse. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
        'Norvenzia does not currently hold ISO 27001 or an equivalent security certification.'
      ]
    },
    {
      heading: 'Your rights',
      body: [
        'Depending on the law that applies to you, you may have rights to access, correct, or erase your personal data; restrict or object to its processing; receive a portable copy; and withdraw consent where processing is based on consent.',
        'People in the EU/EEA or UK may also complain to their local data-protection supervisory authority. Sri Lanka\'s Personal Data Protection Act No. 9 of 2022, as amended, provides rights subject to the commencement and application of its provisions.',
        'To make a request, contact contact@norvenzia.com. We may need to verify your identity before responding.'
      ]
    },
    {
      heading: 'Children',
      body: [
        'This website is intended for business visitors and is not directed at children. We do not knowingly collect personal data from anyone under 18.'
      ]
    },
    {
      heading: 'Changes to this policy',
      body: [
        'We may update this policy from time to time. The date at the top identifies the latest version. We will highlight material changes on the website where appropriate.'
      ]
    },
    {
      heading: 'Contact us',
      body: [
        'Norvenzia (Private) Limited, Galle, Sri Lanka. For questions or privacy requests, email contact@norvenzia.com.'
      ]
    }
  ]
};

const cookies = {
  slug: 'cookies',
  title: 'Cookie Policy',
  intro:
    'This policy explains what cookies are used on the Norvenzia website, why they are needed, and how you can manage them.',
  updated: 'October 2026',
  counselReviewed: false,
  sections: [
    {
      heading: 'What cookies are',
      body: [
        'Cookies are small files stored by your browser when you visit a website. Similar browser storage can also remember a choice or support a site function.'
      ]
    },
    {
      heading: 'Cookies used on this site',
      body: [
        'Strictly necessary: the site remembers your cookie choice so the notice does not keep reappearing. This is needed for the preference control to work.',
        'Administration session: if an administrator signs in, an HTTP-only session cookie keeps that administrator signed in. It is set only after successful login and expires after eight hours.',
        'The public site currently has no Google Analytics, LinkedIn Insight Tag, advertising pixel, or other non-essential analytics or marketing cookie. Cookie names and technical details may change as the site is maintained.'
      ]
    },
    {
      heading: 'Consent and managing your choice',
      body: [
        'The cookie notice lets you accept or reject non-essential cookies. The site currently does not set non-essential analytics or marketing cookies. If that changes, those technologies will be activated only after consent where required.',
        'You can reopen the cookie notice using the Cookie preferences control in the footer. You can also clear or block cookies in your browser settings. Blocking necessary cookies may affect the preference control or administrator sign-in.'
      ]
    },
    {
      heading: 'Third-party services',
      body: [
        'The site serves its fonts and scripts from its own domain. It currently does not load Google Analytics or LinkedIn advertising tracking. If third-party analytics or advertising services are added, this policy will be updated with their purposes and relevant details before activation.'
      ]
    },
    {
      heading: 'Changes to this policy',
      body: [
        'We may update this Cookie Policy when the site or its use of cookies changes. Please check this page periodically for the latest version.'
      ]
    },
    {
      heading: 'Contact us',
      body: [
        'Questions about this Cookie Policy: contact@norvenzia.com.'
      ]
    }
  ]
};

const terms = {
  slug: 'terms',
  title: 'Terms of Use',
  intro:
    'These Terms of Use govern access to and use of www.norvenzia.com (the "Site"). They do not govern a client engagement, which is covered by a separate signed agreement.',
  updated: 'October 2026',
  counselReviewed: false,
  sections: [
    {
      heading: 'Acceptance of terms',
      body: [
        'The Site is operated by Norvenzia (Private) Limited ("Norvenzia", "we" or "us"), registration number PV00374811, with its registered office in Galle, Sri Lanka. By accessing or using the Site, you agree to these Terms. If you do not agree, please do not use the Site.'
      ]
    },
    {
      heading: 'About Norvenzia',
      body: [
        'Norvenzia provides procurement and supply chain operations to mid-market companies. Our delivery team operates from Colombo, Sri Lanka, and serves clients remotely.'
      ]
    },
    {
      heading: 'Information only, not professional advice',
      body: [
        'Site content, including service descriptions and the Global Disruption Monitor, is for general information only. It is not procurement, supply chain, tax, legal, or other professional advice. Do not act or refrain from acting based on Site content without advice appropriate to your circumstances.'
      ]
    },
    {
      heading: 'Claims and client information',
      body: [
        'Client names, logos, case studies, or performance results are published only with the client\'s prior written consent and where the information is genuine and verifiable. We do not intend to publish invented or exaggerated credentials or capabilities.'
      ]
    },
    {
      heading: 'Intellectual property',
      body: [
        'The Site, including its text, design, logo, names, and graphics, is owned by or licensed to Norvenzia and protected by applicable intellectual property laws. You may view and print pages for personal, non-commercial use. You may not reproduce, republish, distribute, or commercially use Site content without our prior written consent.'
      ]
    },
    {
      heading: 'Acceptable use',
      body: [
        'You may use the Site only for lawful purposes. You agree not to damage, disable, or impair the Site; attempt unauthorized access to the Site, its servers, or connected systems; scrape or use bots to extract Site content or disruption-monitor outputs for republication or resale without consent; or use Norvenzia\'s name, logo, or branding to imply an affiliation that does not exist.'
      ]
    },
    {
      heading: 'Third-party links',
      body: [
        'The Site may link to third-party websites for convenience. We do not control and are not responsible for their content, accuracy, availability, or privacy practices.'
      ]
    },
    {
      heading: 'Accuracy and availability',
      body: [
        'We take reasonable care to keep Site content accurate and up to date, but do not warrant that it is complete, current, or error-free. The Global Disruption Monitor depends on upstream data sources and may be delayed, incomplete, or unavailable. Its information is for general awareness, is not a substitute for engagement-level due diligence, and should not be the sole basis for a sourcing or supply chain decision.',
        'We may suspend, withdraw, or change the Site or any feature at any time.'
      ]
    },
    {
      heading: 'Enquiries submitted through the Site',
      body: [
        'Submitting an inquiry does not create a client relationship, retainer, or duty of confidentiality. An engagement begins only when confirmed in writing through a signed proposal or statement of work.',
        'Please do not send confidential or commercially sensitive information, such as supplier lists, pricing, or sourcing strategy, through the inquiry form before a formal agreement and any necessary confidentiality terms are in place.'
      ]
    },
    {
      heading: 'Limitation of liability',
      body: [
        'To the fullest extent permitted by applicable law, Norvenzia excludes liability for indirect, incidental, or consequential loss arising from your use of, or inability to use, the Site, including decisions made in reliance on Site content or the Global Disruption Monitor instead of a formal engagement. Nothing in these Terms excludes liability that cannot lawfully be excluded.'
      ]
    },
    {
      heading: 'Indemnity',
      body: [
        'You agree to indemnify Norvenzia against claims, losses, or expenses arising from your misuse of the Site or breach of these Terms, to the extent permitted by applicable law.'
      ]
    },
    {
      heading: 'Governing law and jurisdiction',
      body: [
        'These Terms are governed by the laws of Sri Lanka, and the courts of Sri Lanka have exclusive jurisdiction over disputes arising from them, subject to any mandatory rights or protections that applicable law does not permit the parties to exclude. Visitors accessing the Site from outside Sri Lanka do so on their own initiative and are responsible for compliance with local laws that apply to them.'
      ]
    },
    {
      heading: 'Changes to these Terms',
      body: [
        'We may update these Terms from time to time. The date at the top identifies the latest version. Continued use of the Site after an update means you accept the revised Terms, to the extent permitted by law.'
      ]
    },
    {
      heading: 'Contact us',
      body: [
        'Norvenzia (Private) Limited, Galle, Sri Lanka. Questions about these Terms: contact@norvenzia.com.'
      ]
    }
  ]
};

module.exports = {
  all: [privacy, cookies, terms],
  privacy,
  cookies,
  terms
};
