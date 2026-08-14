'use strict';

// Sticky nav: on the homepage the header starts transparent over the dark
// hero (see .header--transparent in header.ejs/styles.css) and needs to
// become solid white with a border once the visitor scrolls past it. Every
// other page has no dark hero behind the header, so it's solid white from
// the start and this only adds a shadow once scrolled — harmless there.
//
// Mobile hamburger toggle already lives in main.js (id navToggle/primaryNav,
// .is-open) and is left as-is; this file only owns the scroll-driven state.
(function () {
  var header = document.querySelector('.header');
  if (!header) return;

  var isTransparent = header.classList.contains('header--transparent');
  var logo = isTransparent ? header.querySelector('.header__logo img') : null;
  var lightSrc = logo ? logo.getAttribute('data-logo-light') : null;
  var darkSrc = logo ? logo.getAttribute('data-logo-dark') : null;

  var THRESHOLD = 80;
  var scrolled = false;

  function update() {
    var shouldBeScrolled = window.scrollY > THRESHOLD;
    if (shouldBeScrolled === scrolled) return;
    scrolled = shouldBeScrolled;
    header.classList.toggle('nav--scrolled', scrolled);

    if (logo && lightSrc && darkSrc) {
      logo.src = scrolled ? lightSrc : darkSrc;
    }
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
})();
