/* Norvenzia — progressive enhancement only.
   Every page renders, every link works, and the contact form validates and submits
   server-side without any of this. This file adds the mobile menu, scroll reveals,
   and the cookie banner. Nothing here is load-bearing. */

(function () {
  'use strict';

  // ------------------------------------------------------------ mobile nav
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close on Escape so keyboard users aren't trapped behind the overlay.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // --------------------------------------------------------- scroll reveal
  var revealables = document.querySelectorAll('.reveal');
  var revealGroups = document.querySelectorAll('.reveal-group');
  var reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stagger: each .reveal element gets an index among the .reveal siblings
  // that share its parent, so cards/panels/steps sitting side by side fade
  // in one after another instead of all at once (see --reveal-i in
  // styles.css). Elements without such siblings just get index 0 — no delay.
  var siblingCounts = new Map();
  for (var s = 0; s < revealables.length; s++) {
    var parent = revealables[s].parentElement;
    var count = siblingCounts.has(parent) ? siblingCounts.get(parent) : 0;
    revealables[s].style.setProperty('--reveal-i', String(count));
    siblingCounts.set(parent, count + 1);
  }

  // Same idea one level down, for grids where the *wrapper* carries
  // .reveal-group and it's the wrapper's own children that should stagger
  // (product/tier/fit grids — see .reveal-group in styles.css).
  for (var g = 0; g < revealGroups.length; g++) {
    var children = revealGroups[g].children;
    for (var c = 0; c < children.length; c++) {
      children[c].style.setProperty('--reveal-i', String(c));
    }
  }

  var allRevealTargets = [];
  for (var ri = 0; ri < revealables.length; ri++) allRevealTargets.push(revealables[ri]);
  for (var gi = 0; gi < revealGroups.length; gi++) allRevealTargets.push(revealGroups[gi]);

  function revealAll() {
    for (var i = 0; i < allRevealTargets.length; i++) {
      allRevealTargets[i].classList.add('is-visible');
    }
  }

  if (reduced || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    for (var j = 0; j < allRevealTargets.length; j++) observer.observe(allRevealTargets[j]);

    // Failsafe: reveal everything after 2s regardless of whether the observer
    // fired, so content can never end up permanently invisible.
    window.setTimeout(revealAll, 2000);
  }

  // -------------------------------------------------------------- parallax
  // Any element carrying data-parallax drifts a few px as it passes through
  // the viewport (translate3d via --parallax-y — see [data-parallax] in
  // styles.css). The attribute's value is the max travel in px either way;
  // blank/invalid falls back to 24. Skipped entirely under reduced motion,
  // same as every other motion effect on this page.
  var parallaxEls = document.querySelectorAll('[data-parallax]');

  if (parallaxEls.length && !reduced) {
    var parallaxRaf = null;

    function updateParallax() {
      parallaxRaf = null;
      var vh = window.innerHeight;
      for (var p = 0; p < parallaxEls.length; p++) {
        var el = parallaxEls[p];
        var rect = el.getBoundingClientRect();
        var centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh; // ~ -1..1
        var clamped = Math.max(-1, Math.min(1, centerOffset));
        var strength = parseFloat(el.getAttribute('data-parallax')) || 24;
        el.style.setProperty('--parallax-y', (clamped * strength).toFixed(1) + 'px');
      }
    }

    function queueParallax() {
      if (parallaxRaf) return;
      parallaxRaf = window.requestAnimationFrame(updateParallax);
    }

    updateParallax();
    window.addEventListener('scroll', queueParallax, { passive: true });
    window.addEventListener('resize', queueParallax);
  }

  // ---------------------------------------------------------- section cross-fade
  // Top-level page sections dissolve into one another as they cross the
  // viewport edges, instead of a hard cut — opacity ramps down only in a
  // band near the top/bottom of the viewport (see --section-fade in
  // styles.css), so a section is fully opaque for however long it fills the
  // middle of the screen and only fades during the handoff to its neighbor.
  // Opacity only, deliberately no scale/transform: /live's MapLibre map
  // lives inside one of these sections, and a transform on an ancestor of a
  // map canvas is a known source of click/resize coordinate bugs in map
  // libraries -- not worth it for a purely decorative flourish.
  // Scoped to direct children of <main> so it never reaches into the
  // scroll-pinned trade-story graphic (that's a <div>, not a <section>, and
  // has its own dedicated scroll mechanics in story.js).
  var fadeSections = document.querySelectorAll('main > section');

  if (fadeSections.length && !reduced) {
    var fadeRaf = null;
    var FADE_ZONE = 0.4; // fraction of viewport height used for each edge's ramp
    var FADE_FLOOR = 0.35; // never fades all the way to invisible

    function updateSectionFade() {
      fadeRaf = null;
      var vh = window.innerHeight;
      var zone = vh * FADE_ZONE;
      for (var i = 0; i < fadeSections.length; i++) {
        var rect = fadeSections[i].getBoundingClientRect();
        var fadeIn = zone ? Math.max(0, Math.min(1, (vh - rect.top) / zone)) : 1;
        var fadeOut = zone ? Math.max(0, Math.min(1, rect.bottom / zone)) : 1;
        var factor = Math.min(fadeIn, fadeOut);
        var opacity = FADE_FLOOR + (1 - FADE_FLOOR) * factor;
        fadeSections[i].style.setProperty('--section-fade', opacity.toFixed(3));
      }
    }

    function queueSectionFade() {
      if (fadeRaf) return;
      fadeRaf = window.requestAnimationFrame(updateSectionFade);
    }

    updateSectionFade();
    window.addEventListener('scroll', queueSectionFade, { passive: true });
    window.addEventListener('resize', queueSectionFade);
  }

  // ------------------------------------------------- hero cursor interaction
  // Cursor-follow spotlight + depth parallax on the homepage hero. Fine
  // pointers only (no jank chasing a finger on touch) and only when motion
  // isn't reduced. Everything else about the hero — copy, CTAs, the figure
  // itself — renders and works identically without this.
  var hero = document.querySelector('.hero');
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  if (hero && finePointer && !reduced) {
    hero.classList.add('has-pointer');

    var heroRaf = null;
    var lastPointerEvent = null;

    function applyHeroPointer(clientX, clientY) {
      var rect = hero.getBoundingClientRect();
      var mx = ((clientX - rect.left) / rect.width) * 100;
      var my = ((clientY - rect.top) / rect.height) * 100;
      var px = (clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      var py = (clientY - rect.top) / rect.height - 0.5;

      hero.style.setProperty('--hero-mx', mx + '%');
      hero.style.setProperty('--hero-my', my + '%');
      hero.style.setProperty('--hero-px', String(px * 2)); // -1..1
      hero.style.setProperty('--hero-py', String(py * 2));
    }

    hero.addEventListener('pointermove', function (e) {
      lastPointerEvent = e;
      if (heroRaf) return;
      heroRaf = window.requestAnimationFrame(function () {
        if (lastPointerEvent) applyHeroPointer(lastPointerEvent.clientX, lastPointerEvent.clientY);
        heroRaf = null;
      });
    });

    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--hero-mx', '50%');
      hero.style.setProperty('--hero-my', '38%');
      hero.style.setProperty('--hero-px', '0');
      hero.style.setProperty('--hero-py', '0');
    });
  }

  // ------------------------------------------- data-tunnel band interaction
  // Cursor glow + depth parallax over the full-bleed motion band. The
  // travelling data-flow sheen is pure CSS and runs regardless; this only adds
  // the pointer-driven layer, under the same fine-pointer / motion-allowed
  // conditions as the hero.
  var band = document.querySelector('.motion-band');

  if (band && finePointer && !reduced) {
    band.classList.add('has-pointer');

    var bandRaf = null;
    var lastBandEvent = null;

    function applyBandPointer(clientX, clientY) {
      var rect = band.getBoundingClientRect();
      var px = (clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      var py = (clientY - rect.top) / rect.height - 0.5;

      band.style.setProperty('--band-mx', ((clientX - rect.left) / rect.width) * 100 + '%');
      band.style.setProperty('--band-my', ((clientY - rect.top) / rect.height) * 100 + '%');
      band.style.setProperty('--band-px', String(px * 2)); // -1..1
      band.style.setProperty('--band-py', String(py * 2));
    }

    band.addEventListener('pointermove', function (e) {
      lastBandEvent = e;
      if (bandRaf) return;
      bandRaf = window.requestAnimationFrame(function () {
        if (lastBandEvent) applyBandPointer(lastBandEvent.clientX, lastBandEvent.clientY);
        bandRaf = null;
      });
    });

    band.addEventListener('pointerleave', function () {
      band.style.setProperty('--band-mx', '50%');
      band.style.setProperty('--band-my', '50%');
      band.style.setProperty('--band-px', '0');
      band.style.setProperty('--band-py', '0');
    });
  }

  // --------------------------------------------------------- cookie banner
  var STORAGE_KEY = 'mxg.cookie-consent';
  var banner = document.getElementById('cookieBanner');
  var accept = document.getElementById('cookieAccept');
  var reject = document.getElementById('cookieReject');
  var reopen = document.getElementById('cookieReopen');

  function readConsent() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null; // private mode / storage disabled — banner simply shows again
    }
  }

  function writeConsent(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* nothing to persist to; the choice still applies to this page view */
    }
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    // Next frame, so the slide-up transition actually runs.
    window.requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    window.setTimeout(function () {
      banner.hidden = true;
    }, 450);
  }

  if (banner && !readConsent()) showBanner();

  if (accept) {
    accept.addEventListener('click', function () {
      writeConsent('accepted');
      hideBanner();
    });
  }

  if (reject) {
    reject.addEventListener('click', function () {
      writeConsent('rejected');
      hideBanner();
    });
  }

  if (reopen) {
    reopen.addEventListener('click', function () {
      showBanner();
    });
  }
})();
