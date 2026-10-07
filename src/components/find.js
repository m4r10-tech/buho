import { BAR } from "../data/bar.js";
import { $, $$ } from "../lib/dom.js";
import { distanceKm, travelMinutes } from "../lib/geo.js";
import { toast } from "./toast.js";

function describeDistance(km) {
  const { walk, car } = travelMinutes(km);
  if (km < 1) return `Estás a <b>${Math.round(km * 1000)} m</b> · unos ${walk} min andando`;
  const kmText = km.toLocaleString("es-ES", { maximumFractionDigits: 1 });
  return `Estás a <b>${kmText} km</b> · ~${car} min en coche${km < 4 ? ` · ${walk} min andando` : ""}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/** "Cómo encontrarnos": distancia desde la ubicación del usuario y copiar dirección. */
export function initFindTools() {
  const out = $("#distanceText");
  $("#distanceBtn").addEventListener("click", () => {
    if (!navigator.geolocation) {
      out.textContent = "Tu navegador no permite la geolocalización.";
      return;
    }
    out.textContent = "Buscando tu ubicación…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        out.innerHTML = describeDistance(distanceKm([pos.coords.latitude, pos.coords.longitude], BAR.coords));
      },
      () => (out.textContent = "No hemos podido obtener tu ubicación."),
      { timeout: 10000 }
    );
  });

  $$("[data-copy]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      toast((await copyText(text)) ? "Dirección copiada" : text);
    })
  );
}
