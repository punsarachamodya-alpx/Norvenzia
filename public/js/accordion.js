'use strict';

// FAQ accordion — click a question to open/close its answer via a max-height
// transition (not display:none, so it animates). Only one open at a time.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
    if (!items.length) return;

    function close(item) {
      var trigger = item.querySelector('.faq-item__trigger');
      var panel = item.querySelector('.faq-item__panel');
      trigger.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      panel.style.maxHeight = null;
    }

    function open(item) {
      var trigger = item.querySelector('.faq-item__trigger');
      var panel = item.querySelector('.faq-item__panel');
      trigger.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }

    items.forEach(function (item) {
      var trigger = item.querySelector('.faq-item__trigger');
      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        items.forEach(close);
        if (!isOpen) open(item);
      });
    });
  });
})();
