import { $$, prefersReducedMotion } from "../lib/dom.js";

const DURATION_MS = 2000;
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const format = (v) =>
    v.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  if (prefersReducedMotion()) {
    el.textContent = format(target);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / DURATION_MS, 1);
    el.textContent = format(target * easeOutExpo(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Números que cuentan hasta su valor y estrellas que se rellenan al entrar en pantalla. */
export function initCounters() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.dataset.count) animateCount(el);
        if (el.dataset.stars) {
          el.querySelector("span").style.width = `${(parseFloat(el.dataset.stars) / 5) * 100}%`;
        }
        io.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  $$("[data-count], [data-stars]").forEach((el) => io.observe(el));
}
