/* ============================================================
   contact.js — EmailJS contact form
   Keys: https://www.emailjs.com (public key, safe to expose)
   ============================================================ */

const EMAILJS_PUBLIC_KEY = 'mrzIQKi35AKDjkUVL';
const EMAILJS_SERVICE_ID = 'service_rt72dtj';
const EMAILJS_TEMPLATE_ID = 'template_o9z0m4t';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (typeof emailjs === 'undefined') {
      feedback.textContent = '❌ Email service failed to load. Please email me directly.';
      feedback.className = 'form-feedback err';
      return;
    }
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    feedback.className = 'form-feedback hidden';

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: document.getElementById('name').value.trim(),
      from_email: document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim(),
      to_email: 'sridattamadhira1919@gmail.com',
    })
    .then(() => {
      feedback.textContent = "✅ Message sent! I'll get back to you soon.";
      feedback.className = 'form-feedback ok';
      form.reset();
    })
    .catch(err => {
      console.error('EmailJS error:', err);
      feedback.textContent = '❌ Something went wrong. Please try again.';
      feedback.className = 'form-feedback err';
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    });
  });
}
