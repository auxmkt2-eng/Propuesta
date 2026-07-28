(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. Navegación del deck
  --------------------------------------------------------------------- */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;

  const dotsWrap = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressFill = document.getElementById('progressFill');
  const slideCurrentEl = document.getElementById('slideCurrent');
  const slideTotalEl = document.getElementById('slideTotal');

  slideTotalEl.textContent = total;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.classList.toggle('is-prev', i < current);
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    progressFill.style.width = ((current + 1) / total * 100) + '%';
    slideCurrentEl.textContent = current + 1;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(total - 1, index));
    render();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'Home') goTo(0);
    if (e.key === 'End') goTo(total - 1);
  });

  // Soporte de swipe táctil
  let touchStartX = null;
  window.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  // Botón CTA de cierre — feedback visual (sin enlace real, se define con el cliente)
  const ctaButton = document.getElementById('ctaButton');
  if (ctaButton) {
    ctaButton.addEventListener('click', () => {
      ctaButton.textContent = '¡Contactaremos a Dra. Joca en breve!';
    });
  }

  const hashSlide = parseInt((location.hash || '').replace('#', ''), 10);
  if (!isNaN(hashSlide) && hashSlide >= 1 && hashSlide <= total) {
    current = hashSlide - 1;
  }
  render();

  /* ---------------------------------------------------------------------
     2. Fondo de red de nodos (elemento de firma de marca NODE)
     Se usa solo en portada y cierre — con moderación, como firma, no como
     decoración repetida en todas las diapositivas.
  --------------------------------------------------------------------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1600, H = 900;
  const COUNT = 22;

  function buildNodeField(svg) {
    const nodes = [];
    for (let i = 0; i < COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 2 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12
      });
    }

    const circleEls = nodes.map((n) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', n.r);
      svg.appendChild(c);
      return c;
    });

    const MAX_DIST = 190;
    let lineEls = [];

    function connections() {
      lineEls.forEach((l) => l.remove());
      lineEls = [];
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const line = document.createElementNS(NS, 'line');
            line.setAttribute('x1', nodes[i].x);
            line.setAttribute('y1', nodes[i].y);
            line.setAttribute('x2', nodes[j].x);
            line.setAttribute('y2', nodes[j].y);
            line.setAttribute('opacity', (1 - dist / MAX_DIST) * 0.28);
            svg.insertBefore(line, svg.firstChild);
            lineEls.push(line);
          }
        }
      }
    }

    function tick() {
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        circleEls[i].setAttribute('cx', n.x);
        circleEls[i].setAttribute('cy', n.y);
      });
      connections();
      if (!reduceMotion) requestAnimationFrame(tick);
    }

    requestAnimationFrame(() => {
      svg.classList.add('is-visible');
      tick();
    });
  }

  document.querySelectorAll('.node-field').forEach(buildNodeField);
})();
