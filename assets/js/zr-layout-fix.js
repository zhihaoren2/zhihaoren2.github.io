/* Isolated additions: active navigation and uncropped full-image portrait hover. */
(function () {
  'use strict';

  function ready() {
    var navItems = Array.prototype.slice.call(document.querySelectorAll('.navbar .nav-item'));
    function itemName(li) {
      var a = li.querySelector('.nav-link');
      return a ? a.textContent.trim().toLowerCase() : '';
    }
    function updateNav() {
      if (!navItems.length) return;
      var path = window.location.pathname.toLowerCase().replace(/\/+$/, '').replace(/\.html$/, '');
      var hash = window.location.hash.toLowerCase();
      var isPublication = /(^|\/)publications$/.test(path);
      var activeName = isPublication ? 'publications' : 'home';
      if (!isPublication) {
        var contact = document.querySelector('#contact');
        var contactVisible = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.6 &&
          contact.getBoundingClientRect().bottom > 90;
        if (hash === '#contact' || contactVisible) activeName = 'contact';
      }
      navItems.forEach(function (li) {
        var selected = itemName(li) === activeName;
        li.classList.toggle('active', selected);
        li.classList.toggle('zr-current', selected);
        var link = li.querySelector('.nav-link');
        if (!link) return;
        if (selected) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }
    updateNav();
    window.addEventListener('hashchange', updateNav);
    window.addEventListener('pageshow', updateNav);
    var scrollPending = false;
    window.addEventListener('scroll', function () {
      if (scrollPending) return;
      scrollPending = true;
      window.requestAnimationFrame(function () { scrollPending = false; updateNav(); });
    }, { passive: true });
    // Portrait swap is handled by existing apple-custom.css (no floating preview).
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
}());
