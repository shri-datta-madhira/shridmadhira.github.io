/* ============================================================
   deck.js — fullscreen section-deck engine + left rail wiring
   Desktop: sections are stacked fullscreen panels; scrolling
   slides the next panel up over the current one.
   Mobile (<= 960px): falls back to normal document scrolling.
   ============================================================ */

const DESKTOP = window.matchMedia('(min-width: 961px)');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  panels: [],
  links: [],
  current: 0,
  locked: false,
  enabled: false,
};

function pad(n) {
  return String(n + 1).padStart(2, '0');
}

function updateRail() {
  const { panels, current } = state;
  state.links.forEach(link => {
    link.classList.toggle('active', link.dataset.deckLink === panels[current].id);
  });
  document.querySelectorAll('.mobile-drawer a').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === panels[current].id);
  });
  const counter = document.getElementById('deck-counter');
  if (counter) counter.textContent = `${pad(current)} / ${pad(panels.length - 1)}`;
  const fill = document.getElementById('deck-progress');
  if (fill) fill.style.width = `${((current + 1) / panels.length) * 100}%`;
}

function apply(instant = false) {
  const { panels, current } = state;
  panels.forEach((p, i) => {
    if (instant) p.style.transition = 'none';
    p.classList.toggle('is-open', i <= current);
    p.classList.toggle('is-active', i === current);
    p.classList.toggle('is-prev', i === current - 1);
    if (instant) {
      void p.offsetHeight;
      p.style.transition = '';
    }
  });
  updateRail();
  document.dispatchEvent(new CustomEvent('panelchange', {
    detail: { id: panels[current].id, index: current },
  }));
}

export function goTo(index, { instant = false } = {}) {
  const max = state.panels.length - 1;
  const target = Math.max(0, Math.min(index, max));
  if (target === state.current) return;
  if (state.locked && !instant) return;

  const dur = REDUCED.matches ? 60 : 820;

  // Panels sliding away keep their content visible for the ride down
  if (target < state.current) {
    state.panels.slice(target + 1, state.current + 1).forEach(p => {
      p.classList.add('is-leaving');
      setTimeout(() => p.classList.remove('is-leaving'), dur);
    });
  }

  state.current = target;
  state.locked = true;
  apply(instant || REDUCED.matches);
  history.replaceState(null, '', `#${state.panels[target].id}`);

  setTimeout(() => { state.locked = false; }, dur);
}

function indexOfId(id) {
  return state.panels.findIndex(p => p.id === id);
}

/* Allow inner scrolling of a tall panel before flipping sections */
function innerScrollConsumes(deltaY) {
  const scroller = state.panels[state.current].querySelector('.panel-scroll');
  if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 2) return false;
  const atTop = scroller.scrollTop <= 1;
  const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
  return (deltaY > 0 && !atBottom) || (deltaY < 0 && !atTop);
}

function overlayOpen() {
  return document.getElementById('details-modal')?.classList.contains('active')
      || document.getElementById('lightbox')?.classList.contains('active');
}

function onWheel(e) {
  if (!state.enabled) return;
  if (e.target.closest('.modal-overlay') || overlayOpen()) return;
  if (innerScrollConsumes(e.deltaY)) return;
  e.preventDefault();
  if (state.locked || Math.abs(e.deltaY) < 8) return;
  goTo(state.current + (e.deltaY > 0 ? 1 : -1));
}

let touchStartY = null;

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

function onTouchEnd(e) {
  if (!state.enabled || touchStartY === null || overlayOpen()) return;
  const dy = touchStartY - e.changedTouches[0].clientY;
  touchStartY = null;
  if (Math.abs(dy) < 55 || innerScrollConsumes(dy)) return;
  goTo(state.current + (dy > 0 ? 1 : -1));
}

function onKey(e) {
  if (!state.enabled) return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (overlayOpen()) return;

  const next = ['ArrowDown', 'PageDown'];
  const prev = ['ArrowUp', 'PageUp'];
  if (next.includes(e.key)) { e.preventDefault(); goTo(state.current + 1); }
  else if (prev.includes(e.key)) { e.preventDefault(); goTo(state.current - 1); }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
  else if (e.key === 'End') { e.preventDefault(); goTo(state.panels.length - 1); }
}

/* ── Mobile fallback: reveal-on-scroll + active nav highlight ── */
let mobileObserver = null;
let sectionObserver = null;

function enableMobileMode() {
  document.body.classList.add('no-deck');
  state.panels.forEach(p => p.classList.remove('is-open', 'is-active', 'is-prev'));

  mobileObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in-view');
        mobileObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach(el => mobileObserver.observe(el));

  sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const id = en.target.id;
        document.querySelectorAll('.mobile-drawer a').forEach(a => {
          a.classList.toggle('active', a.dataset.nav === id);
        });
        document.dispatchEvent(new CustomEvent('panelchange', {
          detail: { id, index: indexOfId(id) },
        }));
      }
    });
  }, { threshold: 0.4 });
  state.panels.forEach(p => sectionObserver.observe(p));
}

function disableMobileMode() {
  document.body.classList.remove('no-deck');
  mobileObserver?.disconnect();
  sectionObserver?.disconnect();
  document.querySelectorAll('[data-reveal].in-view').forEach(el => el.classList.remove('in-view'));
}

function syncMode() {
  const wantDeck = DESKTOP.matches;
  if (wantDeck === state.enabled) return;
  state.enabled = wantDeck;
  if (wantDeck) {
    disableMobileMode();
    apply(true);
  } else {
    enableMobileMode();
  }
}

export function initDeck() {
  state.panels = Array.from(document.querySelectorAll('.panel'));
  state.links = Array.from(document.querySelectorAll('[data-deck-link]'));

  // Stagger delays for [data-reveal] children of each panel
  state.panels.forEach(panel => {
    panel.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--d', `${140 + i * 95}ms`);
    });
  });

  // Rail / in-page deck links
  state.links.forEach(link => {
    link.addEventListener('click', e => {
      if (!state.enabled) return; // mobile: default anchor scroll
      e.preventDefault();
      goTo(indexOfId(link.dataset.deckLink));
    });
  });

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('keydown', onKey);
  DESKTOP.addEventListener('change', syncMode);

  // Initial section from the URL hash
  const initial = Math.max(0, indexOfId(location.hash.slice(1)));
  state.current = initial;
  state.enabled = DESKTOP.matches;

  if (state.enabled) {
    apply(true);
    // Replay the active panel's entrance animation on first load.
    // setTimeout + forced reflow, NOT requestAnimationFrame — rAF never
    // fires in a backgrounded tab, which would leave the panel hidden.
    const p = state.panels[initial];
    p.classList.remove('is-open', 'is-active');
    p.style.transition = 'none';
    void p.offsetHeight;
    setTimeout(() => {
      p.classList.add('is-open', 'is-active');
      void p.offsetHeight;
      p.style.transition = '';
      document.dispatchEvent(new CustomEvent('panelchange', { detail: { id: p.id, index: initial } }));
    }, 60);
  } else {
    enableMobileMode();
    if (initial > 0) state.panels[initial].scrollIntoView();
  }
}
