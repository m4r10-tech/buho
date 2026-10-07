/** Utilidades de DOM compartidas por los componentes. */

export const $ = (selector, ctx = document) => ctx.querySelector(selector);
export const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const pad2 = (n) => String(n).padStart(2, "0");

export const formatEuro = (n) =>
  `${n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

/** Reinicia una animación CSS quitando y volviendo a poner la clase. */
export function restartAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

/** Ejecuta `fn` como mucho una vez por frame en eventos de scroll. */
export function onScrollFrame(fn) {
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
    },
    { passive: true }
  );
}

/** Llama a `fn` una sola vez cuando `el` entra (o se acerca) al viewport. */
export function onceVisible(el, fn, options = {}) {
  if (!("IntersectionObserver" in window)) {
    fn();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      fn();
    }
  }, options);
  io.observe(el);
}
