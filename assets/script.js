/* Progressive enhancements only: content, routes, FAQ, map and QR need no JavaScript. */
(() => {
  'use strict';
  const header = document.querySelector('header');
  const menu = document.querySelector('.mobile-nav');
  const summary = menu?.querySelector('summary');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  const closeMenu = (focus = false) => {
    if (!menu?.open) return;
    menu.open = false;
    if (focus) summary.focus();
  };
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (menu?.open && !menu.contains(event.target)) closeMenu();
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
  // Preserve the visible section while changing languages, without storing a preference.
  document.querySelectorAll('.language-switch a').forEach(link => {
    link.addEventListener('click', () => {
      const hash = window.location.hash || document.querySelector('.nav-link[aria-current="location"]')?.hash;
      if (hash && document.getElementById(hash.slice(1))) link.hash = hash;
    });
  });
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        document.querySelectorAll('.nav-link').forEach(link => {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['products', 'services', 'approach', 'about', 'contact'].forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
    // Only hide content after the observer is successfully installed.
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    document.documentElement.classList.add('motion-ready');
  }
  const canvas = document.querySelector('#top canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0, height = 0, frame = 0, visible = true, px = 0, py = 0;
  const nodes = Array.from({ length: window.innerWidth < 768 ? 34 : 70 }, () => ({
    x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00018,
    vy: (Math.random() - 0.5) * 0.00018, r: Math.random() * 1.6 + 0.6, z: Math.random() * 0.8 + 0.2,
  }));
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const pts = nodes.map(n => ({ x: n.x * width + px * 18 * n.z, y: n.y * height + py * 18 * n.z, n }));
    const max = Math.min(170, width / 6);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < max) {
          ctx.strokeStyle = `rgba(103,232,249,${(1 - distance / max) * 0.22})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      ctx.fillStyle = `rgba(125,211,252,${0.35 + p.n.z * 0.55})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.n.r * p.n.z + 0.4, 0, Math.PI * 2); ctx.fill();
    }
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  };
  const tick = () => {
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -0.05 || n.x > 1.05) n.vx *= -1;
      if (n.y < -0.05 || n.y > 1.05) n.vy *= -1;
    }
    draw(); frame = requestAnimationFrame(tick);
  };
  const start = () => {
    cancelAnimationFrame(frame);
    if (!media.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
    else draw();
  };
  resize(); start();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }).observe(canvas);
  }
  document.addEventListener('visibilitychange', start);
  media.addEventListener('change', () => { px = py = 0; start(); });
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' && !media.matches) {
      px = event.clientX / window.innerWidth - 0.5; py = event.clientY / window.innerHeight - 0.5;
    }
  }, { passive: true });
})();
