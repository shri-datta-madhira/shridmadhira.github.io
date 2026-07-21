/* ============================================================
   hobbies.js — hobby selector, drawing carousel, travel slides
   ============================================================ */

export function initHobbies() {
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
      d.addEventListener('click', () => go(i));
      dotsWrap.appendChild(d);
    });

    function go(n) {
      slides[cur].classList.remove('active');
      dotsWrap.children[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dotsWrap.children[cur].classList.add('active');
    }

    ss.querySelector('.prev')?.addEventListener('click', () => go(cur - 1));
    ss.querySelector('.next')?.addEventListener('click', () => go(cur + 1));
    setInterval(() => {
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
        d.addEventListener('click', () => go(i));
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

    prevBtn.addEventListener('click', () => go(current - 1));
    nextBtn.addEventListener('click', () => go(current + 1));
    window.addEventListener('resize', () => { measure(); go(current); });
    measure();
    go(0);

    setInterval(() => {
      if (!document.getElementById('panel-drawing')?.classList.contains('active')) return;
      go(current >= max ? 0 : current + 1);
    }, 3500);
  }
}
