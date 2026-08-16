'use strict';

// Splits the hero H1 into one <span> per letter and slides each in from the
// right, staggered left-to-right, on load. Replaces the old scramble/decode
// effect. The element's real text is already in the DOM (see hero.ejs), so
// if this script never runs -- or motion is reduced -- the plain final text
// is exactly what's already there; this only changes how it *arrives*.
//
// Split by word first (each word its own inline-block, nowrap), with a real
// space character between words, so the browser still wraps the headline at
// word boundaries exactly as it would with the plain text -- splitting into
// bare per-letter spans with no real whitespace between them would remove
// every line-break opportunity and the line could overflow instead of
// wrapping.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var el = document.querySelector('[data-letter-reveal]');
    if (!el) return;

    var finalText = el.textContent;

    var reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    var words = finalText.split(' ');
    var frag = document.createDocumentFragment();
    var charIndex = 0;

    words.forEach(function (word, wi) {
      var wordEl = document.createElement('span');
      wordEl.className = 'letter-reveal__word';

      for (var i = 0; i < word.length; i++) {
        var charEl = document.createElement('span');
        charEl.className = 'letter-reveal__char';
        charEl.style.setProperty('--char-i', String(charIndex));
        charEl.textContent = word[i];
        wordEl.appendChild(charEl);
        charIndex += 1;
      }

      frag.appendChild(wordEl);
      if (wi < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });

    el.textContent = '';
    el.appendChild(frag);

    // Two rAFs: the first lets the browser paint the freshly-inserted,
    // still-offscreen spans; only the second frame flips the class that
    // triggers their transition, so it's guaranteed to actually animate
    // instead of the browser coalescing the insert-and-reveal into one
    // paint with nothing to transition from.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        el.classList.add('is-revealed');
      });
    });
  });
})();
