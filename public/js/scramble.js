'use strict';

// Scrambles the hero H1 from random characters into the real text on load,
// then removes itself — no looping, no library. The element's real text is
// already in the DOM (see hero.ejs), so if this script never runs the
// headline is still correct; this only changes how it *arrives*.
(function () {
  var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#';
  var DURATION_MS = 800;
  var FRAME_MS = 20;

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.querySelector('[data-scramble]');
    if (!el) return;

    var finalText = el.textContent;

    var reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.textContent = finalText;
      return;
    }

    var length = finalText.length;
    var frameCount = Math.max(1, Math.round(DURATION_MS / FRAME_MS));
    var frame = 0;

    var interval = window.setInterval(function () {
      frame += 1;
      // Locks in real characters left-to-right as frames progress, random
      // noise for everything not yet locked — the "decode" read.
      var revealCount = Math.floor((frame / frameCount) * length);

      var out = '';
      for (var i = 0; i < length; i++) {
        var ch = finalText[i];
        if (i < revealCount || ch === ' ') {
          out += ch;
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      el.textContent = out;

      if (frame >= frameCount) {
        window.clearInterval(interval);
        el.textContent = finalText;
      }
    }, FRAME_MS);
  });
})();
