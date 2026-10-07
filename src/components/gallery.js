import { GALLERY } from "../data/bar.js";
import { $, $$, escapeHtml } from "../lib/dom.js";
import { observeReveal } from "./reveal.js";

const SWIPE_THRESHOLD = 50;

function renderGrid(grid) {
  grid.innerHTML = GALLERY.map(
    (g, i) => `<button type="button" class="g-item reveal${g.size ? ` ${g.size}` : ""}"
      data-index="${i}" data-delay="${(i % 4) * 80}" data-caption="${escapeHtml(g.alt)}"
      aria-label="Ampliar foto: ${escapeHtml(g.alt)}">
      <img src="${g.src}" alt="${escapeHtml(g.alt)}" loading="lazy">
    </button>`
  ).join("");
  observeReveal(grid);
}

/** Galería en mosaico con visor a pantalla completa (teclado, botones y gestos). */
export function initGallery() {
  const grid = $("#galleryGrid");
  renderGrid(grid);

  const box = $("#lightbox");
  const img = $("#lightboxImg");
  const caption = $("#lightboxCap");
  let index = 0;
  let lastFocus = null;

  const show = (i) => {
    index = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[index];
    img.style.animation = "none";
    void img.offsetWidth;
    img.style.animation = "";
    img.src = g.src;
    img.alt = g.alt;
    caption.textContent = `${g.alt} · ${index + 1}/${GALLERY.length}`;
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.classList.add("no-scroll");
    $(".lightbox__close", box).focus();
  };
  const close = () => {
    box.hidden = true;
    document.body.classList.remove("no-scroll");
    lastFocus?.focus();
  };

  grid.addEventListener("click", (e) => {
    const item = e.target.closest(".g-item");
    if (item) open(Number(item.dataset.index));
  });
  box.addEventListener("click", (e) => {
    const action = e.target.closest("[data-lb]")?.dataset.lb;
    if (action === "close") close();
    else if (action) show(index + (action === "next" ? 1 : -1));
    else if (e.target === box) close();
  });
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "Tab") {
      // Mantener el foco dentro del visor
      const focusables = $$("button", box);
      const first = focusables[0];
      const last = focusables.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  let startX = null;
  box.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
}
