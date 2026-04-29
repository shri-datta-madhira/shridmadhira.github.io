/* ============================================================
   main.js — Portfolio JavaScript
   Sections:
     1.  Config
     2.  Theme toggle
     3.  Navigation (smooth scroll, mobile menu, hide-on-scroll)
     4.  Section indicator
     5.  Modal
     6.  Experience card wiring
     7.  Edge-hover auto-scroll + chevrons
     8.  Experience duration badges
     9.  EmailJS contact form
     10. Hobby selector + slideshows
     11. Live sports data
         - Barcelona: football-data.org (free, needs free API key)
         - Ferrari F1: Jolpica/Ergast (100% free, no key needed)
     12. Back to top
     13. Footer year
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. CONFIG
   ─────────────────────────────────────────────────────────────
   FOOTBALL_API_KEY: Get free key at https://www.football-data.org/client/register
   EmailJS keys:     Get at https://www.emailjs.com
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  FOOTBALL_API_KEY:  'YOUR_FOOTBALL_DATA_ORG_KEY',
  EMAILJS_PUBLIC_KEY:  'YOUR_PUBLIC_KEY',
  EMAILJS_SERVICE_ID:  'YOUR_SERVICE_ID',
  EMAILJS_TEMPLATE_ID: 'YOUR_TEMPLATE_ID',
  BARCA_TEAM_ID: 81,
};

/* ─────────────────────────────────────────────────────────────
   2. THEME TOGGLE
   ───────────────────────────────────────────────────────────── */
function initTheme() {
  const toggle   = document.getElementById('theme-toggle');
  const iconMoon = document.getElementById('icon-moon');
  const iconSun  = document.getElementById('icon-sun');
  if (!toggle) return;

  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    iconMoon.classList.add('hidden');
    iconSun.classList.remove('hidden');
  }

  toggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    iconMoon.classList.toggle('hidden', isLight);
    iconSun.classList.toggle('hidden', !isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

/* ─────────────────────────────────────────────────────────────
   3. NAVIGATION
   ───────────────────────────────────────────────────────────── */
function initNav() {
  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });

  // Mobile hamburger
  const btn  = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));

  // Hide nav links bar on scroll
  const navBar = document.getElementById('nav-links-bar');
  window.addEventListener('scroll', () => {
    if (navBar) navBar.classList.toggle('hidden-nav', window.scrollY > 60);
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────────────
   4. SECTION INDICATOR
   ───────────────────────────────────────────────────────────── */
function initSectionIndicator() {
  const indicator     = document.getElementById('section-indicator');
  const indicatorText = document.getElementById('section-indicator-text');
  const nameBar       = document.getElementById('name-bar');
  if (!indicator || !indicatorText) return;

  const LABELS = {
    'about':           'About',
    'experience-home': 'Experience',
    'education':       'Education',
    'skills-home':     'Skills',
    'projects-home':   'Projects',
    'hobbies':         'Hobbies',
    'contact':         'Contact',
  };

  function positionIndicator() {
    indicator.style.top = ((nameBar ? nameBar.offsetHeight : 56) + 6) + 'px';
  }
  positionIndicator();
  window.addEventListener('resize', positionIndicator);

  const sections = Array.from(document.querySelectorAll('section[id]'));
  let lastSection = '';

  function update() {
    const midpoint = window.scrollY + window.innerHeight * 0.4;
    const active = sections.find(
      s => midpoint >= s.offsetTop && midpoint < s.offsetTop + s.offsetHeight
    );
    const id = active?.id;
    if (!id || id === lastSection) return;
    lastSection = id;
    if (id === 'about') {
      indicator.classList.remove('visible');
    } else {
      indicatorText.textContent = LABELS[id] || id;
      indicator.classList.add('visible');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────────────────────────────
   5. MODAL
   ───────────────────────────────────────────────────────────── */
function initModal() {
  const overlay  = document.getElementById('details-modal');
  const body     = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close');

  function openModal(contentId) {
    const src = document.getElementById(contentId);
    if (!src) return;
    body.innerHTML = src.innerHTML;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      body.querySelectorAll('.tech-dock').forEach(d => setupEdgeScroll(d, 60, 8));
    });
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    body.innerHTML = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  return openModal;
}

/* ─────────────────────────────────────────────────────────────
   6. EXPERIENCE CARD WIRING
   ───────────────────────────────────────────────────────────── */
function initExperienceCards(openModal) {
  document.querySelectorAll('.card[data-modal-target]').forEach(card => {
    card.addEventListener('click', function () {
      if (!this.closest('#skills-home')) openModal(this.dataset.modalTarget);
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   7. EDGE-HOVER AUTO-SCROLL + CHEVRONS
   ───────────────────────────────────────────────────────────── */
const CHEVRON_R = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
  stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
const CHEVRON_L = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
  stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;

function setupEdgeScroll(el, edgeZone = 100, maxSpeed = 10) {
  let rafId = null;

  // Inject chevrons into nearest scroll-fade-wrap
  const wrap = el.closest('.scroll-fade-wrap');
  if (wrap && !wrap.querySelector('.scroll-chevron')) {
    const lc = Object.assign(document.createElement('div'), { className: 'scroll-chevron left',  innerHTML: CHEVRON_L });
    const rc = Object.assign(document.createElement('div'), { className: 'scroll-chevron right', innerHTML: CHEVRON_R });
    wrap.append(lc, rc);
  }

  // Update fade / chevron visibility on scroll
  function updateFades() {
    if (!wrap) return;
    wrap.classList.toggle('at-start', el.scrollLeft <= 2);
    wrap.classList.toggle('at-end',   el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
  }
  el.addEventListener('scroll', updateFades, { passive: true });
  requestAnimationFrame(updateFades);

  // Edge-speed calculation
  function speed(mouseX) {
    const { left, right } = el.getBoundingClientRect();
    const dl = mouseX - left, dr = right - mouseX;
    if (dl < edgeZone) return -maxSpeed * (1 - dl / edgeZone);
    if (dr < edgeZone) return  maxSpeed * (1 - dr / edgeZone);
    return 0;
  }

  function onMove(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const s = speed(x);
    cancelAnimationFrame(rafId);
    if (s !== 0) (function step() { el.scrollLeft += s; rafId = requestAnimationFrame(step); })();
  }
  function onLeave() { cancelAnimationFrame(rafId); }

  el.addEventListener('mousemove',  onMove);
  el.addEventListener('mouseleave', onLeave);
  el.addEventListener('touchmove',  onMove,  { passive: true });
  el.addEventListener('touchend',   onLeave);

  // Auto-nudge peek on page load
  function autoNudge() {
    if (el.scrollLeft > 0) return;
    const peek = 90, dur = 600;
    let t0 = null;
    const ease = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const containers = document.querySelectorAll('.horizontal-scroll-container');
    const delay = 600 + Array.from(containers).indexOf(el) * 200;
    function out(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      el.scrollLeft = peek * ease(p);
      p < 1 ? requestAnimationFrame(out) : (t0 = null, requestAnimationFrame(back));
    }
    function back(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      el.scrollLeft = peek * (1 - ease(p));
      if (p < 1) requestAnimationFrame(back);
    }
    setTimeout(() => requestAnimationFrame(out), delay);
  }
  window.addEventListener('load', autoNudge, { once: true });
}

function initEdgeScroll() {
  document.querySelectorAll('.horizontal-scroll-container').forEach(el => setupEdgeScroll(el));
}

/* ─────────────────────────────────────────────────────────────
   8. EXPERIENCE DURATION BADGES
   ───────────────────────────────────────────────────────────── */
function initDurationBadges() {
  document.querySelectorAll('.exp-duration').forEach(el => {
    const [sy, sm] = el.dataset.start.split('-').map(Number);
    let ey, em;
    if (el.dataset.end === 'present') {
      const now = new Date(); ey = now.getFullYear(); em = now.getMonth() + 1;
    } else {
      [ey, em] = el.dataset.end.split('-').map(Number);
    }
    const months  = (ey - sy) * 12 + (em - sm);
    const label   = months < 12
      ? (months === 1 ? '1 mo' : `${months} mos`)
      : (() => { const r = Math.round(months / 12 * 2) / 2; return r === 1 ? '1 yr' : `${r} yrs`; })();
    el.textContent = '· ' + label;
  });
}

/* ─────────────────────────────────────────────────────────────
   9. EMAILJS CONTACT FORM
   ───────────────────────────────────────────────────────────── */
function initContactForm() {
  if (typeof emailjs === 'undefined') return;
  emailjs.init({ publicKey: CONFIG.EMAILJS_PUBLIC_KEY });

  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    feedback.className = 'hidden';

    emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, {
      from_name:  document.getElementById('name').value.trim(),
      from_email: document.getElementById('email').value.trim(),
      message:    document.getElementById('message').value.trim(),
      to_email:   'sridattamadhira1919@gmail.com',
    })
    .then(() => {
      feedback.textContent = "✅ Message sent! I'll get back to you soon.";
      feedback.className = 'mt-3 text-center text-sm text-green-400';
      form.reset();
    })
    .catch(err => {
      console.error('EmailJS error:', err);
      feedback.textContent = '❌ Something went wrong. Please try again.';
      feedback.className = 'mt-3 text-center text-sm text-red-400';
    })
    .finally(() => { btn.disabled = false; btn.textContent = 'Send Message'; });
  });
}

/* ─────────────────────────────────────────────────────────────
   10. HOBBY SELECTOR + SLIDESHOWS
   ───────────────────────────────────────────────────────────── */
function initHobbies() {
  // Panel selector
  document.querySelectorAll('.hobby-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.hobby-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.hobby-panel').forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('panel-' + item.dataset.hobby)?.classList.add('active');
    });
  });

  // Generic slideshow factory
  function makeSlideshow(ssId, dotsId) {
    const ss = document.getElementById(ssId);
    if (!ss) return;
    const slides   = ss.querySelectorAll('.hobby-slide');
    const dotsWrap = document.getElementById(dotsId);
    let cur = 0;

    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'hobby-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    });

    function goTo(n) {
      slides[cur].classList.remove('active');
      dotsWrap.children[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dotsWrap.children[cur].classList.add('active');
    }

    ss.querySelector('.prev')?.addEventListener('click', () => goTo(cur - 1));
    ss.querySelector('.next')?.addEventListener('click', () => goTo(cur + 1));
    setInterval(() => {
      if (ss.closest('.hobby-panel')?.classList.contains('active')) goTo(cur + 1);
    }, 4000);
  }

  makeSlideshow('drawing-slideshow', 'drawing-dots');
  makeSlideshow('travel-slideshow',  'travel-dots');
}

/* ─────────────────────────────────────────────────────────────
   11. LIVE SPORTS DATA
   ─────────────────────────────────────────────────────────────

   BARCELONA — football-data.org
   --------------------------------
   Free tier includes La Liga + Champions League.
   Sign up: https://www.football-data.org/client/register
   Set CONFIG.FOOTBALL_API_KEY to your token.

   F1 FERRARI — Jolpica (maintained Ergast successor)
   --------------------------------
   Completely free, no API key required.
   Docs: https://api.jolpi.ca/

   Both update automatically every time someone loads the page.
   If the API key is missing, the static fallback text is shown.
   ───────────────────────────────────────────────────────────── */

// ── Utilities ────────────────────────────
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function winLoss(match, teamId) {
  const home = match.homeTeam.id === teamId;
  const gs = home ? match.score.fullTime.home  : match.score.fullTime.away;
  const ga = home ? match.score.fullTime.away  : match.score.fullTime.home;
  if (gs === null) return null;
  return gs > ga ? 'W' : gs < ga ? 'L' : 'D';
}

// ── football-data.org fetch ───────────────
async function footballFetch(path) {
  const key = CONFIG.FOOTBALL_API_KEY;
  if (!key || key === 'YOUR_FOOTBALL_DATA_ORG_KEY') return null;
  try {
    const res = await fetch(`https://api.football-data.org/v4/${path}`, {
      headers: { 'X-Auth-Token': key }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.warn('football-data.org:', e.message);
    return null;
  }
}

// ── Barcelona ─────────────────────────────
async function updateBarcelona() {
  const [recentData, nextData] = await Promise.all([
    footballFetch(`teams/${CONFIG.BARCA_TEAM_ID}/matches?status=FINISHED&limit=10`),
    footballFetch(`teams/${CONFIG.BARCA_TEAM_ID}/matches?status=SCHEDULED&limit=1`),
  ]);
  if (!recentData?.matches) return;

  const matches = recentData.matches;
  const laLiga  = matches.filter(m => m.competition.code === 'PD').slice(-1)[0];
  const ucl     = matches.filter(m => m.competition.code === 'CL').slice(-1)[0];
  const next    = nextData?.matches?.[0];

  function buildScoreHTML(match) {
    if (!match) return null;
    const home    = match.homeTeam.id === CONFIG.BARCA_TEAM_ID;
    const opp     = home ? match.awayTeam.name : match.homeTeam.name;
    const bG      = home ? match.score.fullTime.home : match.score.fullTime.away;
    const oG      = home ? match.score.fullTime.away : match.score.fullTime.home;
    const bWon    = bG > oG;
    const barcaClass = bWon ? 'hobby-result-winner' : '';
    const oppClass   = !bWon && bG !== oG ? 'hobby-result-winner' : '';
    return {
      score: `<span class="hobby-result-team ${barcaClass}">FC Barcelona</span>
              <span class="hobby-result-nums">${bG} – <strong>${oG}</strong></span>
              <span class="hobby-result-team ${oppClass}">${opp}</span>`,
      date: fmtDate(match.utcDate),
    };
  }

  const llInfo  = buildScoreHTML(laLiga);
  const uclInfo = buildScoreHTML(ucl);

  if (llInfo) {
    document.getElementById('soccer-ll-result')?.querySelector('.hobby-result-score')
      ?.insertAdjacentHTML('afterend', '');
    const llCard = document.getElementById('soccer-ll-result');
    if (llCard) {
      llCard.querySelector('.hobby-result-score').innerHTML = llInfo.score;
      llCard.querySelector('.hobby-result-date').textContent = llInfo.date;
    }
  }

  if (uclInfo) {
    const uclCard = document.getElementById('soccer-ucl-result');
    if (uclCard) {
      uclCard.querySelector('.hobby-result-score').innerHTML = uclInfo.score;
      const detail = ucl.stage ? ` · ${ucl.stage.replace(/_/g,' ')}` : '';
      uclCard.querySelector('.hobby-result-date').textContent = uclInfo.date + detail;
    }
  }

  if (next) {
    const home = next.homeTeam.id === CONFIG.BARCA_TEAM_ID;
    const opp  = home ? next.awayTeam.name : next.homeTeam.name;
    const nextCard = document.getElementById('soccer-next');
    if (nextCard) {
      nextCard.querySelector('.hobby-next-text').innerHTML =
        `${home ? 'FC Barcelona' : opp} <span style="opacity:0.5">vs</span> ${home ? opp : 'FC Barcelona'} — ${fmtDate(next.utcDate)}`;
      const probEl = nextCard.querySelector('.hobby-win-prob');
      if (probEl) probEl.style.display = 'none'; // live API doesn't give odds on free tier
    }
  }
}

// ── Ferrari F1 (Jolpica — no key needed) ──
async function updateFerrari() {
  try {
    const [raceRes, standRes] = await Promise.all([
      fetch('https://api.jolpi.ca/ergast/f1/current/last/results.json'),
      fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json'),
    ]);

    // Race result
    if (raceRes.ok) {
      const raceData = await raceRes.json();
      const race     = raceData?.MRData?.RaceTable?.Races?.[0];
      if (race) {
        const results    = race.Results || [];
        const leclerc    = results.find(r => r.Driver.familyName === 'Leclerc');
        const hamilton   = results.find(r => r.Driver.familyName === 'Hamilton');

        const labelEl = document.getElementById('f1-race-label');
        if (labelEl) labelEl.textContent = `Latest Race · ${race.raceName}`;

        const dateEl = document.getElementById('f1-race-date');
        if (dateEl) dateEl.textContent = fmtDate(race.date);

        const resultsEl = document.getElementById('f1-results');
        if (resultsEl) {
          const rows = [leclerc, hamilton].filter(Boolean).map(d => {
            const pos = parseInt(d.position);
            const cls = pos === 1 ? 'p1' : pos === 2 ? 'p2' : pos === 3 ? 'p3' : 'p-other';
            return `<div class="hobby-f1-row">
                      <span class="hobby-f1-pos ${cls}">P${pos}</span>
                      <span>${d.Driver.familyName}</span>
                    </div>`;
          }).join('');
          if (rows) resultsEl.innerHTML = rows;
        }
      }
    }

    // Constructor standing
    if (standRes.ok) {
      const standData  = await standRes.json();
      const standings  = standData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
      const ferrari    = standings.find(s => s.Constructor.name === 'Ferrari');
      const standEl    = document.getElementById('f1-constructor-standing');
      if (ferrari && standEl) {
        standEl.textContent = `P${ferrari.position} in Constructors · ${ferrari.points} pts`;
      }
    }
  } catch (e) {
    console.warn('F1 update failed:', e.message);
  }
}

async function initLiveSports() {
  await Promise.allSettled([updateBarcelona(), updateFerrari()]);
}

/* ─────────────────────────────────────────────────────────────
   12. BACK TO TOP
   ───────────────────────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─────────────────────────────────────────────────────────────
   13. FOOTER YEAR
   ───────────────────────────────────────────────────────────── */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────────────────────
   BOOT
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initSectionIndicator();
  const openModal = initModal();
  initExperienceCards(openModal);
  initEdgeScroll();
  initDurationBadges();
  initContactForm();
  initHobbies();
  initBackToTop();
  initFooterYear();
  initLiveSports(); // non-blocking live data
});
