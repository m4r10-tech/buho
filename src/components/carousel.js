import { REVIEWS } from "../data/bar.js";
import { $, $$, escapeHtml, prefersReducedMotion } from "../lib/dom.js";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 40;

/** Carrusel de reseñas con reproducción automática, puntos, flechas y gestos. */
export function initCarousel() {
  const root = $("#carousel");
  const track = $("#carouselTrack");
  const dots = $("#carouselDots");
  const total = REVIEWS.length;

  track.innerHTML = REVIEWS.map(
    (r, i) => `<blockquote class="review" aria-roledescription="opinión" aria-label="${i + 1} de ${total}">
      <div class="review__stars" aria-label="${r.stars} estrellas">${"★".repeat(r.stars)}</div>
      <p class="review__text">${escapeHtml(r.text)}</p>
      <cite class="review__author">— ${escapeHtml(r.author)}</cite>
    </blockquote>`
  ).join("");
  dots.innerHTML = REVIEWS.map((_, i) => `<button type="button" data-go="${i}" aria-label="Ver opinión ${i + 1}"></button>`).join("");

  const slides = $$(".review", track);
  const dotButtons = $$("button", dots);
  let current = 0;
  let timer = null;

  const go = (i) => {
    current = (i + total) % total;
    track.style.transform = `translateX(${-current * 100}%)`;
    dotButtons.forEach((d, k) => d.setAttribute("aria-current", String(k === current)));
    slides.forEach((s, k) => s.setAttribute("aria-hidden", String(k !== current)));
  };
  const stop = () => clearInterval(timer);
  const restart = () => {
    stop();
    if (!prefersReducedMotion()) timer = setInterval(() => go(current + 1), AUTOPLAY_MS);
  };

  dots.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-go]");
    if (!btn) return;
    go(Number(btn.dataset.go));
    restart();
  });
  $$(".carousel__btn", root).forEach((btn) =>
    btn.addEventListener("click", () => {
      go(current + Number(btn.dataset.dir));
      restart();
    })
  );
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", restart);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", restart);

  const viewport = $(".carousel__viewport", root);
  let startX = null;
  viewport.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      stop();
    },
    { passive: true }
  );
  viewport.addEventListener("touchend", (e) => {
    if (startX !== null) {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > SWIPE_THRESHOLD) go(current + (dx < 0 ? 1 : -1));
    }
    startX = null;
    restart();
  });

  go(0);
  restart();
}
