/* ============================================================
   hobbies.js — hobby selector, drawing carousel, travel slides
   ============================================================ */

/* ── Auto-advance pause ──
   The drawing carousel and travel slideshow auto-advance on their own.
   Once the user takes manual control (a nav button, a dot, or opening an
   image), auto-advance stops and only resumes after a full minute of no
   activity anywhere on the page. */
const AUTO_RESUME_MS = 60000;
let autoPaused = false;
let resumeTimer = null;
let lastActivity = 0;

function scheduleResume() {
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => { autoPaused = false; }, AUTO_RESUME_MS);
}

function pauseAuto() {
  autoPaused = true;
  scheduleResume();
}

function bindActivityReset() {
  const onActivity = () => {
    if (!autoPaused) return;
    const now = Date.now();
    if (now - lastActivity < 1000) return; // throttle resets to ~1/s
    lastActivity = now;
    scheduleResume();
  };
  ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'].forEach(ev => {
    window.addEventListener(ev, onActivity, { passive: true });
  });
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  if (!lb || !img) return;

  function open(src, alt) {
    img.src = src;
    img.alt = alt || 'Full size image';
    lb.classList.add('active');
  }

  function close() {
    lb.classList.remove('active');
    setTimeout(() => { img.src = ''; }, 320);
  }

  document.querySelectorAll('.drawing-card img, .hobby-slide img').forEach(el => {
    el.addEventListener('click', () => { pauseAuto(); open(el.src, el.alt); });
  });

  lb.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('active')) close();
  });
}

export function initHobbies() {
  initLightbox();
  bindActivityReset();

  // Panel selector
  document.querySelectorAll('.hobby-item').forEach(item => {
    function activate() {
      document.querySelectorAll('.hobby-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.hobby-panel').forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('panel-' + item.dataset.hobby)?.classList.add('active');
    }
    item.addEventListener('click', activate);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  // Travel slideshow
  const ss = document.getElementById('travel-slideshow');
  if (ss) {
    const slides = ss.querySelectorAll('.hobby-slide');
    const dotsWrap = document.getElementById('travel-dots');
    let cur = 0;

    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'hobby-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => { pauseAuto(); go(i); });
      dotsWrap.appendChild(d);
    });

    function go(n) {
      slides[cur].classList.remove('active');
      dotsWrap.children[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dotsWrap.children[cur].classList.add('active');
    }

    ss.querySelector('.prev')?.addEventListener('click', () => { pauseAuto(); go(cur - 1); });
    ss.querySelector('.next')?.addEventListener('click', () => { pauseAuto(); go(cur + 1); });
    setInterval(() => {
      if (autoPaused) return;
      if (ss.closest('.hobby-panel')?.classList.contains('active')) go(cur + 1);
    }, 4000);
  }

  // Drawing carousel
  const carousel = document.getElementById('drawing-carousel');
  const prevBtn = document.getElementById('drawing-prev');
  const nextBtn = document.getElementById('drawing-next');
  const dots = document.getElementById('drawing-dots');

  if (carousel && prevBtn && nextBtn) {
    const cards = carousel.querySelectorAll('.drawing-card');
    let current = 0;
    let max = 1;

    function step() {
      return cards[0].getBoundingClientRect().width + 12; // card width + gap
    }

    function measure() {
      const visible = Math.max(1, Math.floor(carousel.clientWidth / step()));
      max = Math.max(0, cards.length - visible);
      dots.innerHTML = '';
      for (let i = 0; i <= max; i++) {
        const d = document.createElement('div');
        d.className = 'hobby-dot' + (i === current ? ' active' : '');
        d.addEventListener('click', () => { pauseAuto(); go(i); });
        dots.appendChild(d);
      }
    }

    function go(n) {
      current = Math.max(0, Math.min(n, max));
      carousel.scrollTo({ left: current * step(), behavior: 'smooth' });
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= max;
      [...dots.children].forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prevBtn.addEventListener('click', () => { pauseAuto(); go(current - 1); });
    nextBtn.addEventListener('click', () => { pauseAuto(); go(current + 1); });
    window.addEventListener('resize', () => { measure(); go(current); });
    measure();
    go(0);

    setInterval(() => {
      if (autoPaused) return;
      if (!document.getElementById('panel-drawing')?.classList.contains('active')) return;
      go(current >= max ? 0 : current + 1);
    }, 3500);
  }
}
