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

    var figure = document.querySelector('.profile-photo-switch');
    var alternate = figure && figure.querySelector('img.profile-photo-alternate');
    if (!figure || !alternate) return;

    var floatBox = document.createElement('div');
    floatBox.className = 'zr-portrait-float';
    floatBox.setAttribute('aria-hidden', 'true');
    var floatImage = document.createElement('img');
    floatImage.alt = 'Full photograph of Zhihao Ren';
    floatBox.appendChild(floatImage);
    document.body.appendChild(floatBox); // outside all overflow:hidden ancestors
    var visible = false;

    function placeFloat() {
      if (!visible) return;
      var rect = figure.getBoundingClientRect();
      var nw = floatImage.naturalWidth || 900;
      var nh = floatImage.naturalHeight || 1200;
      var maxW = Math.min(520, window.innerWidth - 36);
      var maxH = Math.min(740, window.innerHeight * 0.78);
      var scale = Math.min(maxW / nw, maxH / nh);
      // No cropping or distortion: retain the natural aspect ratio.
      var imageWidth = Math.round(nw * scale);
      var imageHeight = Math.round(nh * scale);
      var outerW = imageWidth + 14;
      var outerH = imageHeight + 14;
      var left = rect.right + 14;
      if (left + outerW > window.innerWidth - 10) left = rect.left - outerW - 14;
      if (left < 10) left = Math.max(10, (window.innerWidth - outerW) / 2);
      var top = Math.max(10, Math.min(rect.top, window.innerHeight - outerH - 10));
      floatBox.style.width = outerW + 'px';
      floatImage.style.width = imageWidth + 'px';
      floatImage.style.height = imageHeight + 'px';
      floatBox.style.left = Math.round(left) + 'px';
      floatBox.style.top = Math.round(top) + 'px';
    }
    function showFloat() {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      var url = alternate.currentSrc || alternate.src;
      if (!url) return;
      visible = true;
      if (floatImage.src !== url) floatImage.src = url;
      floatBox.classList.add('zr-visible');
      placeFloat();
    }
    function hideFloat() {
      visible = false;
      floatBox.classList.remove('zr-visible');
    }
    figure.addEventListener('pointerenter', showFloat);
    figure.addEventListener('pointerleave', hideFloat);
    figure.addEventListener('focusin', showFloat);
    figure.addEventListener('focusout', hideFloat);
    floatImage.addEventListener('load', placeFloat);
    window.addEventListener('resize', placeFloat);
    window.addEventListener('scroll', placeFloat, { passive: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideFloat(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
}());
