import { $, $$ } from "../lib/dom.js";

const MAX_WAIT_MS = 2600;

/** Divide los títulos [data-split] en letras para animarlas una a una. */
function splitTitles() {
  $$("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch === " " ? " " : ch;
      span.style.transitionDelay = `${i * 60}ms`;
      span.setAttribute("aria-hidden", "true");
      el.appendChild(span);
    });
  });
}

/** Pantalla de carga; al terminar arranca la intro del hero y respeta el #ancla de la URL. */
export function initPreloader() {
  splitTitles();
  const pre = $("#preloader");
  const bar = $("#preloaderBar");
  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 18, 92);
    bar.style.width = `${progress}%`;
  }, 120);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(interval);
    bar.style.width = "100%";
    setTimeout(() => {
      pre.classList.add("is-done");
      document.body.classList.remove("is-loading");
      $$("[data-split]").forEach((el) => el.classList.add("is-in"));
      const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      target?.scrollIntoView({ behavior: "auto" });
    }, 300);
  };

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish);
  setTimeout(finish, MAX_WAIT_MS);
}
