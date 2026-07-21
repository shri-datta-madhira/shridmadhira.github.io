/* ============================================================
   main.js — entry point
   ============================================================ */

import { initDeck } from './deck.js';
import { initTypewriter, initCounters, initSpotlight, initDurationBadges } from './animations.js';
import { initSkills } from './skills.js';
import { initModals } from './modals.js';
import { initTheme } from './theme.js';
import { initHobbies } from './hobbies.js';
import { initSports } from './sports.js';
import { initContactForm } from './contact.js';

function initMobileNav() {
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const openBtn = document.getElementById('hamburger');
  const closeBtn = document.getElementById('drawer-close');
  if (!drawer) return;

  const open = () => { drawer.classList.add('open'); backdrop.classList.add('open'); };
  const close = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); };

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSkills();       // build DOM before the deck measures reveals
  initCounters();
  initDeck();
  initTypewriter();
  initSpotlight();
  initDurationBadges();
  initModals();
  initHobbies();
  initContactForm();
  initMobileNav();
  initSports();

  const year = new Date().getFullYear();
  document.querySelectorAll('#footer-year, #footer-year-m').forEach(el => {
    el.textContent = year;
  });
});
