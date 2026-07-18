/* ============================================================
   modals.js — experience detail modal
   ============================================================ */

export function initModals() {
  const overlay = document.getElementById('details-modal');
  const body = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close');
  if (!overlay || !body) return;

  function open(contentId) {
    const src = document.getElementById(contentId);
    if (!src) return;
    body.innerHTML = src.innerHTML;
    overlay.classList.add('active');
  }

  function close() {
    overlay.classList.remove('active');
    setTimeout(() => { body.innerHTML = ''; }, 320);
  }

  document.querySelectorAll('[data-modal-target]').forEach(card => {
    card.addEventListener('click', () => open(card.dataset.modalTarget));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(card.dataset.modalTarget);
      }
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) close();
  });
}
