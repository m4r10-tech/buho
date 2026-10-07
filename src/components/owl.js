import { $, $$ } from "../lib/dom.js";
import { toast } from "./toast.js";

const HOOTS = ["¡Uhu, uhu!", "¿Una caña con tapa?", "El búho nunca duerme… bueno, los lunes sí.", "¡Prueba las migas!"];
const MAX_PUPIL_OFFSET = 9;

/** Búho del hero: sus ojos siguen al cursor, parpadea y "habla" al hacer clic. */
export function initOwl() {
  const owl = $("#heroOwl");
  if (!owl) return;

  const movable = [...$$("[data-pupil]", owl), ...$$("[data-pupil-shine]", owl)].map((el) => ({
    el,
    cx: Number(el.getAttribute("cx")),
    cy: Number(el.getAttribute("cy"))
  }));

  const lookAt = (x, y) => {
    const r = owl.getBoundingClientRect();
    const ox = r.left + r.width / 2;
    const oy = r.top + r.height / 2;
    const angle = Math.atan2(y - oy, x - ox);
    const dist = Math.min(Math.hypot(x - ox, y - oy) / 40, MAX_PUPIL_OFFSET);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    movable.forEach((p) => {
      p.el.setAttribute("cx", p.cx + dx);
      p.el.setAttribute("cy", p.cy + dy);
    });
  };
  window.addEventListener("mousemove", (e) => lookAt(e.clientX, e.clientY), { passive: true });
  window.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (t) lookAt(t.clientX, t.clientY);
    },
    { passive: true }
  );

  const blinkOnce = () => {
    owl.classList.add("is-blinking");
    setTimeout(() => owl.classList.remove("is-blinking"), 160);
  };
  const scheduleBlink = () => {
    setTimeout(() => {
      blinkOnce();
      scheduleBlink();
    }, 2500 + Math.random() * 4000);
  };
  scheduleBlink();

  let hoot = 0;
  owl.addEventListener("click", () => {
    toast(HOOTS[hoot++ % HOOTS.length]);
    blinkOnce();
  });
}
