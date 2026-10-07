import { $, $$, hasFinePointer, prefersReducedMotion } from "../lib/dom.js";

const GLOW_RADIUS = 210;
const enabled = () => hasFinePointer() && !prefersReducedMotion();

/** Inclinación 3D de una tarjeta siguiendo el ratón. */
export function addTilt(el, maxDeg = 10) {
  if (!enabled()) return;
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * maxDeg}deg) rotateX(${-py * maxDeg}deg) translateY(-4px)`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
}

/** Botones que se desplazan ligeramente hacia el cursor. */
function addMagnetic(btn) {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
}

/** Halo de luz que sigue al cursor con inercia. */
function initCursorGlow() {
  const glow = $("#cursorGlow");
  let gx = 0;
  let gy = 0;
  let tx = 0;
  let ty = 0;
  let raf = null;

  const loop = () => {
    gx += (tx - gx) * 0.15;
    gy += (ty - gy) * 0.15;
    glow.style.transform = `translate(${gx - GLOW_RADIUS}px, ${gy - GLOW_RADIUS}px)`;
    raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : null;
  };
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    glow.classList.add("is-on");
    raf ??= requestAnimationFrame(loop);
  });
  document.addEventListener("mouseleave", () => glow.classList.remove("is-on"));
}

export function initPointerFx() {
  if (!enabled()) return;
  initCursorGlow();
  $$(".magnetic").forEach(addMagnetic);
  $$("[data-tilt]").forEach((el) => addTilt(el));
}
