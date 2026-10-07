import { CREDITS } from "../data/bar.js";
import { $, escapeHtml } from "../lib/dom.js";
import { openModal } from "./modal.js";

export function initCredits() {
  $("#creditsBtn").addEventListener("click", () => {
    const items = CREDITS.map(
      (c) =>
        `<li><b>${escapeHtml(c.file)}</b> — ${escapeHtml(c.author)} · ${escapeHtml(c.license)} · ` +
        `<a href="${escapeHtml(c.source)}" target="_blank" rel="noopener">fuente</a></li>`
    ).join("");
    openModal(
      "Créditos de las fotos",
      `<p class="modal__muted">Fotografías de Wikimedia Commons usadas bajo sus licencias libres:</p>
       <ul>${items}</ul>
       <p class="modal__muted modal__small">Mapa: © colaboradores de OpenStreetMap.</p>`
    );
  });
}
