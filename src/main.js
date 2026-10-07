/**
 * Bar Bocatería El Búho — punto de entrada.
 * Cada componente se encarga de una sección de la página (src/components/).
 */
import "./styles/main.css";

import { initBooking } from "./components/booking.js";
import { initCarousel } from "./components/carousel.js";
import { initCounters } from "./components/counters.js";
import { initCredits } from "./components/credits.js";
import { initFindTools } from "./components/find.js";
import { initFireflies } from "./components/fireflies.js";
import { initGallery } from "./components/gallery.js";
import { initHours } from "./components/hours.js";
import { initMap } from "./components/map.js";
import { initMenu } from "./components/menu.js";
import { initModal } from "./components/modal.js";
import { initNav } from "./components/nav.js";
import { initOwl } from "./components/owl.js";
import { initParallax } from "./components/parallax.js";
import { initPointerFx } from "./components/pointer-fx.js";
import { initPreloader } from "./components/preloader.js";
import { observeReveal } from "./components/reveal.js";

const components = [
  initPreloader,
  initNav,
  initHours,
  initPointerFx,
  initMenu,
  initGallery,
  initCarousel,
  initBooking,
  initModal,
  initCredits,
  initMap,
  initFindTools,
  initCounters,
  initParallax,
  initFireflies,
  initOwl,
  observeReveal
];

// Un fallo en un componente no debe dejar el resto de la página sin funcionar
for (const init of components) {
  try {
    init();
  } catch (err) {
    console.error(`Error al iniciar ${init.name}:`, err);
  }
}

document.getElementById("year").textContent = String(new Date().getFullYear());
