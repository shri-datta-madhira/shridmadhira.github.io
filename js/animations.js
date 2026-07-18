/* ============================================================
   animations.js — typewriter, count-up numbers, spotlight hover
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ── Typewriter in the hero ── */
const PHRASES = [
  'cloud-native systems.',
  'event-driven microservices.',
  'payment infrastructure at scale.',
  'fault-tolerant backends.',
  'products people rely on.',
];

export function initTypewriter() {
  const el = document.getElementById('typed');
  if (!el) return;

  if (REDUCED.matches) {
    el.textContent = PHRASES[0];
    return;
  }

  let phrase = 0;
  let chars = 0;
  let deleting = false;

  function tick() {
    const text = PHRASES[phrase];
    chars += deleting ? -1 : 1;
    el.textContent = text.slice(0, chars);

    let delay = deleting ? 34 : 62;
    if (!deleting && chars === text.length) {
      delay = 2100;
      deleting = true;
    } else if (deleting && chars === 0) {
      deleting = false;
      phrase = (phrase + 1) % PHRASES.length;
      delay = 380;
    }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 700);
}

/* ── Count-up numbers (run when their panel becomes active) ── */
function runCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';

  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1400;

  if (REDUCED.matches) {
    el.textContent = prefix + target.toFixed(decimals) + suffix;
    return;
  }

  const t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);

  function frame(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = prefix + (target * ease(p)).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export function initCounters() {
  document.addEventListener('panelchange', e => {
    const panel = document.getElementById(e.detail.id);
    panel?.querySelectorAll('[data-count]').forEach(runCounter);
  });
}

/* ── Spotlight hover position on cards ── */
export function initSpotlight() {
  document.addEventListener('pointermove', e => {
    const card = e.target.closest?.('.spotlight');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

/* ── Experience duration badges ── */
export function initDurationBadges() {
  document.querySelectorAll('.exp-duration').forEach(el => {
    const [sy, sm] = el.dataset.start.split('-').map(Number);
    let ey, em;
    if (el.dataset.end === 'present') {
      const now = new Date();
      ey = now.getFullYear();
      em = now.getMonth() + 1;
    } else {
      [ey, em] = el.dataset.end.split('-').map(Number);
    }
    const months = (ey - sy) * 12 + (em - sm);
    const label = months < 12
      ? (months === 1 ? '1 mo' : `${months} mos`)
      : (() => { const r = Math.round(months / 12 * 2) / 2; return r === 1 ? '1 yr' : `${r} yrs`; })();
    el.textContent = '· ' + label;
  });
}
