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
  // .reveal-left/-right/-up/-pop are directional variants (see styles.css)
  // for images that should slide/pop into place instead of the generic
  // fade+lift. They share the stagger/failsafe wiring below with .reveal,
  // but use a *later*-triggering observer (see revealDirectional below):
  // a small text block fading up 18px is fine triggering the moment it
  // barely peeks onto screen, but a tall photo sliding in from off-screen
  // was finishing its whole animation while still mostly below the fold —
  // by the time it was actually in view there was nothing left to see.
  var revealables = document.querySelectorAll('.reveal');
  var revealDirectional = document.querySelectorAll(
    '.reveal-left, .reveal-right, .reveal-up, .reveal-pop, .reveal-pop-slow'
  );
  var revealGroups = document.querySelectorAll('.reveal-group');
  var revealGroupsDirectional = document.querySelectorAll('.reveal-group--up');
  var reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stagger: each reveal element gets an index among the siblings of its
  // same kind that share its parent, so cards/panels/steps sitting side by
  // side fade in one after another instead of all at once (see --reveal-i
  // in styles.css). Elements without such siblings just get index 0 — no
  // delay. Two independent counters (not one shared one) so, e.g., a
  // .reveal-left row's index isn't thrown off by an unrelated .reveal
  // sibling.
  function indexBySibling(list) {
    var counts = new Map();
    for (var i = 0; i < list.length; i++) {
      var parent = list[i].parentElement;
      var count = counts.has(parent) ? counts.get(parent) : 0;
      list[i].style.setProperty('--reveal-i', String(count));
      counts.set(parent, count + 1);
    }
  }
  indexBySibling(revealables);
  indexBySibling(revealDirectional);

  // Same idea one level down, for grids where the *wrapper* carries the
  // reveal state and it's the wrapper's own children that should stagger
  // (product/tier/fit grids — see .reveal-group/.reveal-group--up in
  // styles.css).
  function indexChildren(list) {
    for (var g = 0; g < list.length; g++) {
      var children = list[g].children;
      for (var c = 0; c < children.length; c++) {
        children[c].style.setProperty('--reveal-i', String(c));
      }
    }
  }
  indexChildren(revealGroups);
  indexChildren(revealGroupsDirectional);

  var allRevealTargets = [];
  for (var ri = 0; ri < revealables.length; ri++) allRevealTargets.push(revealables[ri]);
  for (var gi = 0; gi < revealGroups.length; gi++) allRevealTargets.push(revealGroups[gi]);

  var allDirectionalTargets = [];
  for (var di = 0; di < revealDirectional.length; di++) allDirectionalTargets.push(revealDirectional[di]);
  for (var dgi = 0; dgi < revealGroupsDirectional.length; dgi++) allDirectionalTargets.push(revealGroupsDirectional[dgi]);

  function revealAll() {
    for (var i = 0; i < allRevealTargets.length; i++) {
      allRevealTargets[i].classList.add('is-visible');
    }
    for (var j = 0; j < allDirectionalTargets.length; j++) {
      allDirectionalTargets[j].classList.add('is-visible');
    }
  }

  if (reduced || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    // Text/fade-up: triggers as soon as a sliver is on screen — the motion
    // is small (18px) so there's nothing to miss by starting early.
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    for (var k = 0; k < allRevealTargets.length; k++) obs.observe(allRevealTargets[k]);

    // Directional slides/pops: waits until roughly a third of the element
    // is genuinely inside the viewport before starting, so the travel
    // actually happens while it's visible instead of finishing off-screen.
    var obsDirectional = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obsDirectional.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -20% 0px', threshold: 0.3 }
    );
    for (var m = 0; m < allDirectionalTargets.length; m++) obsDirectional.observe(allDirectionalTargets[m]);

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
