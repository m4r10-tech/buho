import { MENU } from "../data/bar.js";
import { $, $$, escapeHtml, formatEuro } from "../lib/dom.js";
import { addTilt } from "./pointer-fx.js";

const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function dishCard(item, index) {
  const card = document.createElement("article");
  card.className = "dish";
  card.style.setProperty("--d", `${Math.min(index * 0.05, 0.6)}s`);
  card.innerHTML = `
    <div class="dish__img">
      <img src="${item.img}" alt="${escapeHtml(item.name)}" loading="lazy" width="1100" height="688">
      ${item.tag ? `<span class="dish__tag">${escapeHtml(item.tag)}</span>` : ""}
    </div>
    <div class="dish__body">
      <div class="dish__head">
        <h3 class="dish__name">${escapeHtml(item.name)}</h3>
        <span class="dish__price">${formatEuro(item.price)}</span>
      </div>
      <p class="dish__desc">${escapeHtml(item.desc)}</p>
    </div>`;
  addTilt(card, 8);
  return card;
}

/** Carta con pestañas por categoría (con indicador animado) y buscador. */
export function initMenu() {
  const grid = $("#menuGrid");
  const tabs = $("#menuTabs");
  const ink = $(".menu__tabs-ink", tabs);
  const search = $("#menuSearch");
  const empty = $("#menuEmpty");
  const buttons = $$("button[data-filter]", tabs);
  let filter = "all";
  let query = "";

  const render = () => {
    const q = normalize(query.trim());
    const items = MENU.filter(
      (it) => (filter === "all" || it.cat === filter) && (!q || normalize(`${it.name} ${it.desc}`).includes(q))
    );
    grid.replaceChildren(...items.map(dishCard));
    empty.hidden = items.length > 0;
  };

  const moveInk = (btn) => {
    const r = btn.getBoundingClientRect();
    const pr = tabs.getBoundingClientRect();
    ink.style.width = `${r.width}px`;
    ink.style.height = `${r.height}px`;
    ink.style.top = `${r.top - pr.top}px`;
    ink.style.transform = `translateX(${r.left - pr.left}px)`;
  };
  const selected = () => buttons.find((b) => b.getAttribute("aria-selected") === "true");

  const select = (btn) => {
    buttons.forEach((b) => {
      b.setAttribute("aria-selected", String(b === btn));
      b.tabIndex = b === btn ? 0 : -1;
    });
    filter = btn.dataset.filter;
    moveInk(btn);
    render();
  };

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (btn) select(btn);
  });
  tabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = buttons.indexOf(selected());
    const next = buttons[(i + (e.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length];
    next.focus();
    select(next);
  });

  let debounce;
  search.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      query = search.value;
      render();
    }, 150);
  });

  const reInk = () => moveInk(selected());
  window.addEventListener("resize", reInk);
  document.fonts?.ready.then(reInk);

  select(selected() ?? buttons[0]);
}
