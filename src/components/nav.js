import { $, $$, onScrollFrame } from "../lib/dom.js";

const DESKTOP_MIN_WIDTH = 960;

/** Cabecera fija: barra de progreso, ocultar al bajar, menú móvil y enlace activo. */
export function initNav() {
  const nav = $("#nav");
  const burger = $("#burger");
  const links = $("#navLinks");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  let lastY = window.scrollY;

  const isMenuOpen = () => links.classList.contains("is-open");

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("is-scrolled", y > 30);
    nav.classList.toggle("is-hidden", !isMenuOpen() && y > lastY && y > 400);
    toTop.classList.toggle("is-visible", y > 700);
    lastY = y;
  };
  onScrollFrame(update);
  update();

  const setMenu = (open) => {
    links.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("no-scroll", open);
  };
  burger.addEventListener("click", () => setMenu(!isMenuOpen()));
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen()) setMenu(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > DESKTOP_MIN_WIDTH && isMenuOpen()) setMenu(false);
  });

  // Enlace activo según la sección visible
  const sections = new Map();
  $$("a[href^='#']:not(.btn)", links).forEach((a) => {
    const section = document.getElementById(a.getAttribute("href").slice(1));
    if (section) sections.set(section, a);
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const link = sections.get(e.target);
        if (!link || !e.isIntersecting) return;
        $$("a.is-active", links).forEach((x) => x.classList.remove("is-active"));
        link.classList.add("is-active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((_, section) => io.observe(section));
}
