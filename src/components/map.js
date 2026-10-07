import { BAR } from "../data/bar.js";
import { $, onceVisible } from "../lib/dom.js";

const ZOOM = 16;

function googleEmbedFallback(el) {
  el.innerHTML = `<iframe class="map-fallback" title="Mapa de El Búho" loading="lazy"
    src="https://maps.google.com/maps?q=${BAR.coords.join(",")}&z=${ZOOM}&output=embed"></iframe>`;
}

async function buildMap(el) {
  // Leaflet se descarga solo cuando el mapa está cerca de la pantalla
  const [{ default: L }] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);

  const map = L.map(el, { scrollWheelZoom: false, zoomControl: false }).setView(BAR.coords, ZOOM);
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const icon = L.divIcon({
    className: "",
    iconSize: [54, 54],
    iconAnchor: [27, 50],
    popupAnchor: [0, -46],
    html: '<div class="owl-marker"><svg viewBox="0 0 120 120"><use href="#owl"/></svg><span class="owl-marker__pulse"></span></div>'
  });
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${BAR.coords.join(",")}`;
  L.marker(BAR.coords, { icon, title: BAR.name })
    .addTo(map)
    .bindPopup(
      `<strong>El Búho</strong><br>${BAR.address}<br><a href="${directions}" target="_blank" rel="noopener">Cómo llegar →</a>`,
      { maxWidth: 240, autoPanPadding: [24, 24] }
    )
    .openPopup();

  // La rueda del ratón solo hace zoom después de hacer clic en el mapa
  el.addEventListener("click", () => map.scrollWheelZoom.enable(), { once: true });
  new IntersectionObserver(([e]) => e.isIntersecting && map.invalidateSize()).observe(el);
}

export function initMap() {
  const el = $("#map");
  if (!el) return;
  onceVisible(
    el,
    () => {
      buildMap(el).catch((err) => {
        console.error("No se pudo cargar el mapa:", err);
        googleEmbedFallback(el);
      });
    },
    { rootMargin: "300px" }
  );
}
