/* Vanilla JS only. Avatar swap is pure CSS; publication previews work even without jQuery. */
(() => {
  'use strict';
  const preview = document.getElementById('publication-float-preview');
  const floatingImage = document.getElementById('publication-float-image');
  const dialog = document.getElementById('publication-dialog');
  const modalImage = document.getElementById('publication-dialog-image');
  const modalCaption = document.getElementById('publication-dialog-caption');
  const modalClose = document.getElementById('preview-dialog-close');
  const modalPrev = document.getElementById('preview-dialog-prev');
  const modalNext = document.getElementById('preview-dialog-next');
  const modalControls = document.getElementById('preview-dialog-controls');
  const modalCounter = document.getElementById('preview-dialog-counter');
  const hoverOk = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let activeTrigger = null;
  let lastPointer = { x: 0, y: 0 };
  let galleryItems = [];
  let galleryIndex = 0;
  let galleryTitle = '';

  function hideFloating() {
    if (preview) preview.classList.remove('visible');
    activeTrigger = null;
  }
  function moveFloating(x, y) {
    if (!preview) return;
    const width = Math.min(540, innerWidth - 30);
    const h = Math.min(preview.getBoundingClientRect().height || width * .7, innerHeight * .74);
    const left = x + width + 36 < innerWidth ? x + 18 : x - width - 18;
    preview.style.left = Math.round(Math.max(14, Math.min(innerWidth - width - 14, left))) + 'px';
    preview.style.top = Math.round(Math.max(12, Math.min(innerHeight - h - 12, y - h * .3))) + 'px';
  }
  function showFloating(button, x, y) {
    if (!hoverOk || !preview || !floatingImage || button.dataset.gallerySrcs) return;
    const src = button.dataset.previewSrc;
    if (!src) return;
    activeTrigger = button;
    floatingImage.src = src;
    floatingImage.alt = button.dataset.previewTitle || 'Publication figure';
    preview.classList.add('visible');
    moveFloating(x, y);
    // Reposition once the large image dimensions are known.
    floatingImage.onload = () => { if (activeTrigger === button) moveFloating(lastPointer.x, lastPointer.y); };
  }
  function showGalleryImage(index) {
    if (!modalImage || !galleryItems.length) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    modalImage.src = galleryItems[galleryIndex];
    modalImage.alt = galleryItems.length > 1 ? `${galleryTitle} (${galleryIndex + 1} of ${galleryItems.length})` : galleryTitle;
    if (modalCaption) modalCaption.textContent = galleryTitle;
    const multiple = galleryItems.length > 1;
    if (modalControls) modalControls.hidden = !multiple;
    if (modalCounter) {
      modalCounter.textContent = multiple ? `${galleryIndex + 1} / ${galleryItems.length}` : '';
    }
  }
  document.querySelectorAll('.publication-preview-trigger').forEach(button => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      lastPointer = { x: event.clientX, y: event.clientY };
      showFloating(button, event.clientX, event.clientY);
    });
    button.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      lastPointer = { x: event.clientX, y: event.clientY };
      if (activeTrigger === button) moveFloating(event.clientX, event.clientY);
    });
    button.addEventListener('pointerleave', hideFloating);
    button.addEventListener('focus', () => {
      const r = button.getBoundingClientRect();
      lastPointer = { x: r.right, y: r.top + r.height / 2 };
      showFloating(button, lastPointer.x, lastPointer.y);
    });
    button.addEventListener('blur', hideFloating);
    button.addEventListener('click', () => {
      hideFloating();
      if (!dialog || !modalImage) return;
      galleryItems = (button.dataset.gallerySrcs || '').split('|').filter(Boolean);
      if (!galleryItems.length && button.dataset.previewSrc) galleryItems = [button.dataset.previewSrc];
      galleryTitle = button.dataset.previewTitle || 'Publication figure';
      galleryIndex = 0;
      showGalleryImage(galleryIndex);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else window.open(button.dataset.previewSrc, '_blank', 'noopener');
    });
  });
  modalPrev?.addEventListener('click', () => showGalleryImage(galleryIndex - 1));
  modalNext?.addEventListener('click', () => showGalleryImage(galleryIndex + 1));
  modalClose?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  window.addEventListener('scroll', hideFloating, { passive: true });
  window.addEventListener('resize', hideFloating);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideFloating();
    if (!dialog?.open || galleryItems.length < 2) return;
    if (event.key === 'ArrowLeft') showGalleryImage(galleryIndex - 1);
    if (event.key === 'ArrowRight') showGalleryImage(galleryIndex + 1);
  });

  document.querySelectorAll('.profile-email-link').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const user = (link.dataset.emailUser || '').trim();
      const domain = (link.dataset.emailDomain || '').trim();
      if (user && domain) window.location.href = `mailto:${user}@${domain}`;
    });
  });

  const wechat = document.querySelector('.wechat-profile');
  const wechatTrigger = wechat?.querySelector('.wechat-trigger');
  const wechatPopover = wechat?.querySelector('.wechat-popover');
  function setWechatOpen(open) {
    if (!wechat || !wechatTrigger || !wechatPopover) return;
    wechat.classList.toggle('is-open', open);
    wechatTrigger.setAttribute('aria-expanded', String(open));
    wechatPopover.setAttribute('aria-hidden', String(!open));
  }
  wechatTrigger?.addEventListener('click', event => {
    event.stopPropagation();
    setWechatOpen(!wechat.classList.contains('is-open'));
  });
  document.addEventListener('click', event => {
    if (wechat && !wechat.contains(event.target)) setWechatOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setWechatOpen(false);
  });

  const homeNavItem = Array.from(document.querySelectorAll('.navbar .nav-item')).find(item =>
    item.querySelector('.nav-link')?.textContent.trim().toLowerCase() === 'home'
  );
  const contactNavItem = Array.from(document.querySelectorAll('.navbar .nav-item')).find(item =>
    item.querySelector('.nav-link')?.textContent.trim().toLowerCase() === 'contact'
  );
  const contactSection = document.getElementById('contact');
  if (homeNavItem && contactNavItem && contactSection) {
    let navFramePending = false;
    const updateHomeNav = () => {
      navFramePending = false;
      const navHeight = document.querySelector('.navbar')?.getBoundingClientRect().height || 0;
      const rect = contactSection.getBoundingClientRect();
      const contactIsCurrent = rect.top <= navHeight + 24 && rect.bottom > navHeight + 24;
      [[homeNavItem, !contactIsCurrent], [contactNavItem, contactIsCurrent]].forEach(([item, current]) => {
        item.classList.toggle('active', current);
        item.classList.toggle('zr-current', current);
        const navLink = item.querySelector('.nav-link');
        if (current) navLink.setAttribute('aria-current', 'page');
        else navLink.removeAttribute('aria-current');
      });
    };
    const scheduleHomeNavUpdate = () => {
      if (navFramePending) return;
      navFramePending = true;
      requestAnimationFrame(updateHomeNav);
    };
    updateHomeNav();
    window.addEventListener('scroll', scheduleHomeNavUpdate, { passive: true });
    window.addEventListener('hashchange', scheduleHomeNavUpdate);
    window.addEventListener('pageshow', scheduleHomeNavUpdate);
  }

  const form = document.getElementById('academic-contact-form');
  const status = document.getElementById('contact-status');
  if (form) {
    form.addEventListener('submit', event => {
      const endpoint = (form.dataset.endpoint || '').trim();
      const recipientUser = (form.dataset.recipientUser || '').trim();
      const recipientDomain = (form.dataset.recipientDomain || '').trim();
      const recipient = recipientUser && recipientDomain ? `${recipientUser}@${recipientDomain}` : '';
      if (/^https:\/\/formspree\.io\/f\/[\w-]+$/i.test(endpoint)) {
        form.action = endpoint;
        form.method = 'POST';
        return; // standard browser form submission; real Formspree delivery
      }
      event.preventDefault();
      if (recipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
        const fd = new FormData(form);
        const subject = encodeURIComponent('Academic website inquiry — ' + fd.get('name'));
        const body = encodeURIComponent('Name: ' + fd.get('name') + '\nEmail: ' + fd.get('email') + '\n\n' + fd.get('message'));
        if (status) status.textContent = 'Your email application will open. Please send the message there to complete delivery.';
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      } else {
        if (status) status.textContent = 'Message delivery is not configured yet. Site owner: add a verified email or Formspree form ID in the site settings.';
      }
    });
  }
})();
