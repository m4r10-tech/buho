import { $, prefersReducedMotion } from "../lib/dom.js";

const MAX_FLIES = 70;
const AREA_PER_FLY = 22000;
const MOUSE_RADIUS = 120;

/** Luciérnagas en canvas que flotan y huyen del cursor. Se pausan fuera de pantalla. */
export function initFireflies() {
  const canvas = $("#fireflies");
  if (!canvas || prefersReducedMotion()) return;
  const ctx = canvas.getContext("2d");
  const mouse = { x: -999, y: -999 };
  let width = 0;
  let height = 0;
  let flies = [];
  let running = false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(MAX_FLIES, (width * height) / AREA_PER_FLY));
    flies = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.6,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.35 + 0.1,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const wrap = (v, max) => (v < -10 ? max + 10 : v > max + 10 ? -10 : v);

  const draw = (t) => {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    for (const f of flies) {
      f.angle += (Math.random() - 0.5) * 0.2;
      f.x += Math.cos(f.angle) * f.speed;
      f.y += Math.sin(f.angle) * f.speed - 0.08;
      const dx = f.x - mouse.x;
      const dy = f.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < MOUSE_RADIUS) {
        f.x += (dx / dist) * 1.5;
        f.y += (dy / dist) * 1.5;
      }
      f.x = wrap(f.x, width);
      f.y = wrap(f.y, height);

      const glow = 0.45 + 0.55 * Math.sin(t / 600 + f.phase);
      const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
      gradient.addColorStop(0, `rgba(255, 210, 110, ${0.9 * glow})`);
      gradient.addColorStop(1, "rgba(255, 210, 110, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  const host = canvas.parentElement;
  host.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  host.addEventListener("mouseleave", () => {
    mouse.x = mouse.y = -999;
  });

  new IntersectionObserver(([entry]) => {
    const wasRunning = running;
    running = entry.isIntersecting;
    if (running && !wasRunning) requestAnimationFrame(draw);
  }).observe(canvas);
}
