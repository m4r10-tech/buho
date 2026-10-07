import { $ } from "../lib/dom.js";

let timer;

/** Muestra un aviso breve en la parte inferior de la pantalla. */
export function toast(message, duration = 2800) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("is-visible"), duration);
}
