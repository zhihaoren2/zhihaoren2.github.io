/* Vanilla JS only. Avatar swap is pure CSS; publication previews work even without jQuery. */
(() => {
  'use strict';
  const preview = document.getElementById('publication-float-preview');
  const floatingImage = document.getElementById('publication-float-image');
  const dialog = document.getElementById('publication-dialog');
  const modalImage = document.getElementById('publication-dialog-image');
  const modalCaption = document.getElementById('publication-dialog-caption');
  const modalClose = document.getElementById('preview-dialog-close');
  const hoverOk = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let activeTrigger = null;
  let lastPointer = { x: 0, y: 0 };

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
    if (!hoverOk || !preview || !floatingImage) return;
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
      modalImage.src = button.dataset.previewSrc;
      modalImage.alt = button.dataset.previewTitle || 'Publication figure';
      if (modalCaption) modalCaption.textContent = button.dataset.previewTitle || '';
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else window.open(button.dataset.previewSrc, '_blank', 'noopener');
    });
  });
  modalClose?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  window.addEventListener('scroll', hideFloating, { passive: true });
  window.addEventListener('resize', hideFloating);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideFloating(); });

  const form = document.getElementById('academic-contact-form');
  const status = document.getElementById('contact-status');
  if (form) {
    form.addEventListener('submit', event => {
      const endpoint = (form.dataset.endpoint || '').trim();
      const recipient = (form.dataset.recipient || '').trim();
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
