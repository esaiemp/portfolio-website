'use strict';

// EmailJS configuration reused from the Daily Spark Tech website.
// The public key is designed to be used in browser code.
const EMAILJS_CONFIG = Object.freeze({
  publicKey: 'RWgOZtGwwVGx89AV_',
  serviceId: 'service_pki456n',
  templateId: 'template_9gfy4mw'
});

document.addEventListener('DOMContentLoaded', () => {
  initializeYear();
  initializeMobileNavigation();
  initializeRevealAnimations();
  initializeContactForm();
});

function initializeYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}

function initializeMobileNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (!menuToggle || !mainNav) return;

  const closeMenu = () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

function initializeRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((element) => observer.observe(element));
}

function initializeContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const formNote = document.getElementById('formNote');

  if (!submitButton || !formNote) {
    console.error('The contact form is missing its submit button or status element.');
    return;
  }

  if (!window.emailjs) {
    showFormMessage(formNote, 'error', 'The email service could not be loaded. Please refresh the page or email me directly.');
    submitButton.disabled = true;
    return;
  }

  window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (submitButton.disabled) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    showFormMessage(formNote, '', '');

    try {
      await window.emailjs.sendForm(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        form
      );

      showFormMessage(
        formNote,
        'success',
        'Thank you! Your message has been sent successfully. I’ll get back to you shortly.'
      );
      form.reset();
    } catch (error) {
      console.error('EmailJS error:', error);
      showFormMessage(
        formNote,
        'error',
        'Sorry, your message could not be sent. Please try again or contact me directly by email.'
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

function showFormMessage(element, status, message) {
  element.textContent = message;
  element.classList.remove('form-note-success', 'form-note-error');

  if (status === 'success') element.classList.add('form-note-success');
  if (status === 'error') element.classList.add('form-note-error');
}
