/* ═══════════════════════════════════════════════════════════════
   Adittya Portfolio — main.js
   Handles: parallax on sculpture, nav scroll state, mobile menu
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Elements ──
  const header    = document.getElementById('main-header');
  const menuBtn   = document.getElementById('mobile-menu-btn');
  const sculpture = document.querySelector('.sculpture-wrapper');
  const panels    = document.querySelectorAll('.glass-panel');

  // ── Nav: scroll class ──
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = y;
  }, { passive: true });

  // ── Mobile menu toggle ──
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      header.classList.toggle('nav-open');
    });
  }

  // ── Parallax tilt on glass sculpture ──
  const heroSection = document.getElementById('hero');
  if (sculpture && heroSection) {
    let rafId = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;   // -0.5 → 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      targetRotateY =  x * 18;   // ±9 degrees
      targetRotateX = -y * 12;   // ±6 degrees

      if (!rafId) rafId = requestAnimationFrame(animateTilt);
    });

    heroSection.addEventListener('mouseleave', () => {
      targetRotateX = 0;
      targetRotateY = 0;
      if (!rafId) rafId = requestAnimationFrame(animateTilt);
    });

    function animateTilt() {
      currentRotateX += (targetRotateX - currentRotateX) * 0.08;
      currentRotateY += (targetRotateY - currentRotateY) * 0.08;

      sculpture.style.transform =
        `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;

      // keep animating until close enough
      if (
        Math.abs(targetRotateX - currentRotateX) > 0.05 ||
        Math.abs(targetRotateY - currentRotateY) > 0.05
      ) {
        rafId = requestAnimationFrame(animateTilt);
      } else {
        rafId = null;
      }
    }
  }

  // ── Smooth‑anchor scrolling for same‑page links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        header.classList.remove('nav-open');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Staggered panel entrance ──
  function animatePanels() {
    panels.forEach((panel, i) => {
      panel.style.opacity = '0';
      panel.style.transition = `opacity 0.7s ${i * 0.12}s ease-out, transform 0.7s ${i * 0.12}s ease-out`;
      // force reflow
      void panel.offsetWidth;
      panel.style.opacity = '1';
    });
  }
  animatePanels();

  // ── Scroll-reveal for project cards ──
  const revealCards = document.querySelectorAll('.reveal-card');
  if (revealCards.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealCards.forEach(card => observer.observe(card));
  }

  // ── Project Details Modal ──
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalCloses   = document.querySelectorAll('[data-modal-close]');
  const activeModals  = document.querySelectorAll('.modal-overlay');

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.removeAttribute('hidden');
    void modal.offsetWidth; // trigger reflow for smooth animation
    modal.classList.add('modal-active');
    document.body.classList.add('modal-open');
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('modal-active');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      if (!modal.classList.contains('modal-active')) {
        modal.setAttribute('hidden', '');
      }
    }, 320);
  }

  modalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-modal-target');
      if (targetId) openModal(targetId);
    });
  });

  modalCloses.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = btn.closest('.modal-overlay');
      closeModal(modal);
    });
  });

  activeModals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.modal-overlay.modal-active');
      if (openModalEl) closeModal(openModalEl);
    }
  });

})();
