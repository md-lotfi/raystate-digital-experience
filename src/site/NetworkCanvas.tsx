import { useEffect, useRef } from "react";

/** Lightweight cyan node network inspired by the RayState banner. */
export function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0,
      h = 0,
      raf = 0,
      visible = true,
      px = 0,
      py = 0;
    const count = small ? 34 : 70;
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      r: Math.random() * 1.6 + 0.6,
      z: Math.random() * 0.8 + 0.2,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const pts = nodes.map((n) => ({
        x: n.x * w + px * 18 * n.z,
        y: n.y * h + py * 18 * n.z,
        n,
      }));
      const max = Math.min(170, w / 6);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i]!, b2 = pts[j]!;
          const dx = a.x - b2.x,
            dy = a.y - b2.y;
          const d = Math.hypot(dx, dy);
          if (d < max) {
            ctx.strokeStyle = `rgba(103,232,249,${(1 - d / max) * 0.22})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = `rgba(125,211,252,${0.35 + p.n.z * 0.55})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.n.r * p.n.z + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -0.05 || n.x > 1.05) n.vx *= -1;
        if (n.y < -0.05 || n.y > 1.05) n.vy *= -1;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };

    resize();
    draw();
    start();

    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
      start();
    });
    io.observe(canvas);
    const onVis = () => start();
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
    };
    const onResize = () => {
      resize();
      draw();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    if (!reduced && window.matchMedia("(pointer: fine)").matches)
      window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
