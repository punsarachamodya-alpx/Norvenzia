// Phase-1 navigation only. Insights/blog and Careers are Phase 2 (Brief §11) and
// are absent by design until there is a real content pipeline or active hiring.

module.exports = {
  primary: [
    { label: 'Services', href: '/services' },
    { label: 'Industries', href: '/industries' },
    { label: 'The Model', href: '/the-model' },
    { label: 'Intelligence', href: '/intelligence' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact', href: '/contact' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Terms', href: '/terms' }
  ],
  // CTA label throughout the site (Brief §9). Lands on the contact form, which
  // sets the right expectation until a real calendar link is wired up
  // (contact.bookingEmbedUrl is still empty).
  ctaLabel: 'Book a Call',
  ctaHref: '/contact'
};
