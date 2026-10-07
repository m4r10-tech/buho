import { $ } from "../lib/dom.js";

let lastFocus = null;

export function openModal(title, html) {
  lastFocus = document.activeElement;
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  $("#modal").hidden = false;
  document.body.classList.add("no-scroll");
  $("#modal [data-modal-close]").focus();
}

export function closeModal() {
  $("#modal").hidden = true;
  document.body.classList.remove("no-scroll");
  lastFocus?.focus();
}

export function initModal() {
  const modal = $("#modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-modal-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}
