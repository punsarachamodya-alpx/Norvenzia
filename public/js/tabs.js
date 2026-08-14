'use strict';

// Tab component for the homepage's six-module services section. Click a tab
// button -> show the matching panel, hide the rest. On mobile (<768px, see
// styles.css) the horizontal tab strip is hidden by CSS and each panel gets
// its own trigger instead, behaving like a vertical accordion — this file
// drives both from the same underlying "active tab" state.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('[data-tabs]');
    if (!root) return;

    var buttons = Array.prototype.slice.call(root.querySelectorAll('.tabs__btn'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.tabs__panel'));
    var mobileTriggers = Array.prototype.slice.call(
      root.querySelectorAll('.tabs__panel-trigger')
    );

    function activate(index) {
      buttons.forEach(function (btn, i) {
        btn.classList.toggle('tab--active', i === index);
        btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });

      panels.forEach(function (panel, i) {
        var isActive = i === index;
        panel.classList.toggle('tab-panel--active', isActive);
      });

      mobileTriggers.forEach(function (trigger, i) {
        trigger.setAttribute('aria-expanded', i === index ? 'true' : 'false');
      });
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        activate(i);
      });
    });

    mobileTriggers.forEach(function (trigger, i) {
      trigger.addEventListener('click', function () {
        // Toggle: clicking the already-open panel's trigger collapses it by
        // pointing "active" at nothing (-1), matching plain accordion feel.
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        activate(isOpen ? -1 : i);
      });
    });

    activate(0);
  });
})();
