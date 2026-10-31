'use strict';

// Lenis smooth scrolling (vendored: public/js/vendor/lenis.min.js, v1.3.23).
// Skipped entirely under prefers-reduced-motion — the browser's native scroll
// is left untouched in that case. Not loaded on /intelligence (see layout.ejs):
// that page's map owns the wheel.
(function () {
  if (!window.Lenis) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.5 });
  window.__lenis = lenis;

  function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // The CSS `scroll-behavior: smooth` that used to animate in-page links is
  // switched off while Lenis is active, so hand those clicks to Lenis.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    var target;
    try { target = document.querySelector(id); } catch (err) { return; }
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target);
    if (window.history && history.pushState) history.pushState(null, '', id);
  });

  // The mobile menu overlay should not scroll the page underneath it.
  var nav = document.getElementById('primaryNav');
  if (nav && 'MutationObserver' in window) {
    new MutationObserver(function () {
      if (nav.classList.contains('is-open')) lenis.stop(); else lenis.start();
    }).observe(nav, { attributes: true, attributeFilter: ['class'] });
  }
})();
