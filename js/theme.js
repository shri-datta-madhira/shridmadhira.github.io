/* ============================================================
   theme.js — light / dark toggle (persisted in localStorage)
   ============================================================ */

export function initTheme() {
  const toggles = document.querySelectorAll('[data-theme-toggle]');

  function render() {
    const isLight = document.body.classList.contains('light-mode');
    toggles.forEach(t => {
      t.querySelector('.icon-moon')?.classList.toggle('hidden', isLight);
      t.querySelector('.icon-sun')?.classList.toggle('hidden', !isLight);
    });
  }

  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
  }
  render();

  toggles.forEach(t => t.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    render();
  }));
}
