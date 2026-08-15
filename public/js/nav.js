'use strict';

// Sticky nav: on the homepage (and every other page that starts over a dark
// hero) the header starts fully transparent and, past a scroll threshold,
// gains a translucent dark tint + blur (see .header--transparent.nav--scrolled
// in styles.css) — it stays see-through the whole time, it just deepens
// slightly so the white nav text keeps contrast over whatever's now behind
// it. The logo stays the white/dark-bg variant throughout for the same
// reason, so there's no swap to do here anymore.
//
// Pages with no dark hero are solid glass from the start and this only adds
// the deeper tint once scrolled — harmless there.
//
// Mobile hamburger toggle already lives in main.js (id navToggle/primaryNav,
// .is-open) and is left as-is; this file only owns the scroll-driven state.
(function () {
  var header = document.querySelector('.header');
  if (!header) return;

  var THRESHOLD = 80;
  var scrolled = false;

  function update() {
    var shouldBeScrolled = window.scrollY > THRESHOLD;
    if (shouldBeScrolled === scrolled) return;
    scrolled = shouldBeScrolled;
    header.classList.toggle('nav--scrolled', scrolled);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
})();
