import { $$, onScrollFrame, prefersReducedMotion } from "../lib/dom.js";

/** Desplaza los elementos [data-parallax] más despacio que el scroll. */
export function initParallax() {
  if (prefersReducedMotion()) return;
  const els = $$("[data-parallax]");
  if (!els.length) return;
  onScrollFrame(() => {
    const y = window.scrollY;
    if (y > window.innerHeight * 1.2) return;
    els.forEach((el) => {
      el.style.transform = `translate3d(0, ${y * parseFloat(el.dataset.parallax)}px, 0)`;
    });
  });
}
