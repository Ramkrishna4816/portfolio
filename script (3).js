/* ==========================================================================
   Ramkrishna — Portfolio interactions
   Sections: icons, nav, reveal-on-scroll, signal rail, hero canvas ping,
             project card 3D tilt, tech pill float stagger, contact form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Lucide icons ---- */
  if (window.lucide) lucide.createIcons();

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav: scrolled state + mobile burger ---- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('navMobile');

  const onScrollNav = () => {
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
    });
  }

  /* ---- Reveal-on-scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---- Signal rail: scroll-linked telemetry readout (signature element) ---- */
  const railFill = document.getElementById('railFill');
  const railSignal = document.getElementById('railSignal');
  const railSection = document.getElementById('railSection');
  const railLat = document.getElementById('railLat');
  const sections = Array.from(document.querySelectorAll('main > section'));

  const updateRail = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

    if (railFill) railFill.style.height = pct + '%';

    if (railSignal) {
      const signal = Math.round(80 + Math.sin(scrollTop / 180) * 12 + (pct / 100) * 8);
      railSignal.textContent = Math.min(99, Math.max(60, signal)) + '%';
    }

    if (railSection) {
      let activeIndex = 0;
      sections.forEach((sec, i) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) activeIndex = i;
      });
      railSection.textContent = String(activeIndex).padStart(2, '0') + ' / ' + String(sections.length - 1).padStart(2, '0');
    }

    if (railLat) {
      const lat = (12.92 + (pct / 100) * 0.6).toFixed(2);
      railLat.textContent = lat + '°N';
    }
  };
  updateRail();
  window.addEventListener('scroll', updateRail, { passive: true });
  window.addEventListener('resize', updateRail);

  /* ---- Hero canvas: faint "ping" particles drifting like GPS pulses ---- */
  const canvas = document.getElementById('pingCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, particles;
    const PARTICLE_COUNT = 46;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth * devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
        vy: (Math.random() * 0.15 + 0.05) * devicePixelRatio,
        alpha: Math.random() * 0.5 + 0.15,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const LINK_DIST = 130 * devicePixelRatio;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Graph edges: connect nearby particles, like a weighted-graph / mesh-network
      // visualization — a quiet nod to graph theory and connected-fleet telemetry.
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const lineAlpha = (1 - dist / LINK_DIST) * 0.16;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(69, 232, 196, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.y -= p.vy;
        p.pulse += 0.02;
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(69, 232, 196, ${a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resize();
    initParticles();
    if (!reduceMotion) requestAnimationFrame(draw);
    else draw(); // draw once, static
    window.addEventListener('resize', () => { resize(); initParticles(); });
  }

  /* ---- Project cards: subtle 3D tilt on pointer move ---- */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  const isFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isFineHover) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /* ---- Contact form: lightweight client-side handling ---- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      if (!name) return;
      formNote.textContent = `Thanks, ${name.split(' ')[0]} — connect an email service (e.g. Formspree) to receive this. For now, message this to your inbox via the mailto link above.`;
      form.reset();
    });
  }

});
