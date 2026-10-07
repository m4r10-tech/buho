import { SCHEDULE } from "../data/bar.js";
import { $, $$, onceVisible, pad2, prefersReducedMotion, restartAnimation } from "../lib/dom.js";
import {
  DAY_MINUTES,
  DAY_NAMES,
  WEEK_ORDER,
  daySegments,
  describeNextOpening,
  formatMinutes,
  getStatus,
  madridNow
} from "../lib/schedule.js";
import { toast } from "./toast.js";

const STATE_CLASSES = ["is-open", "is-closed", "is-soon"];

function renderWeek() {
  const list = $("#weekList");
  const today = madridNow().day;
  list.innerHTML = WEEK_ORDER.map((day, idx) => {
    const slot = SCHEDULE[day];
    const classes = ["week__item", day === today && "is-today", !slot && "is-closed"].filter(Boolean).join(" ");
    const tag = day === today ? ' <span class="week__today-tag">Hoy</span>' : "";
    const time = slot ? `${formatMinutes(slot[0])} – ${formatMinutes(slot[1])}` : "Cerrado";
    return `<li class="${classes}" style="--d:${idx * 0.07}s">
      <span class="week__day">${DAY_NAMES[day]}${tag}</span><span class="week__time">${time}</span></li>`;
  }).join("");
  const week = list.closest(".week");
  onceVisible(week, () => week.classList.add("is-in"), { threshold: 0.2 });
}

function renderFooterHours() {
  const rows = [
    ["Mar – Jue", SCHEDULE[2]],
    ["Vie – Sáb", SCHEDULE[5]],
    ["Domingo", SCHEDULE[0]],
    ["Lunes", SCHEDULE[1]]
  ];
  $("#footerHours").innerHTML = rows
    .map(([label, slot]) => `<b>${label}</b><span>${slot ? `${formatMinutes(slot[0])} – ${formatMinutes(slot[1])}` : "Cerrado"}</span>`)
    .join("");
}

function createDayline() {
  const track = $(".dayline__track");
  const nowMark = $("[data-dayline-now]");
  const template = $("[data-dayline-open]");
  let paintedDay = -1;

  const paint = (day) => {
    $$(".dayline__open", track).forEach((el) => el !== template && el.remove());
    const segments = daySegments(SCHEDULE, day);
    template.style.width = "0";
    segments.forEach(([from, to], i) => {
      const el = i === 0 ? template : template.cloneNode();
      el.style.left = `${(from / DAY_MINUTES) * 100}%`;
      el.style.width = `${((to - from) / DAY_MINUTES) * 100}%`;
      if (i > 0) track.insertBefore(el, nowMark);
    });
    requestAnimationFrame(() => $$(".dayline__open", track).forEach((el) => el.classList.add("is-in")));
  };

  return (now) => {
    nowMark.style.left = `calc(${((now.minutes + now.seconds / 60) / DAY_MINUTES) * 100}% - 1.5px)`;
    if (paintedDay !== now.day) {
      paint(now.day);
      paintedDay = now.day;
    }
  };
}

function createCountdown() {
  const els = { h: $("[data-cd='h']"), m: $("[data-cd='m']"), s: $("[data-cd='s']") };
  const label = $("[data-cd-label]");
  const animate = !prefersReducedMotion();
  const set = (key, value) => {
    const el = els[key];
    if (el.textContent === value) return;
    el.textContent = value;
    if (animate) restartAnimation(el, "tick");
  };
  return (seconds, open) => {
    set("h", pad2(Math.floor(seconds / 3600)));
    set("m", pad2(Math.floor((seconds % 3600) / 60)));
    set("s", pad2(seconds % 60));
    label.textContent = open ? "para el cierre" : "para abrir";
  };
}

function describe(status) {
  if (status.open) {
    return {
      cls: status.closingSoon ? "is-soon" : "is-open",
      short: status.closingSoon ? "Cierra pronto" : "Abierto",
      long: status.closingSoon ? "¡Date prisa, cerramos pronto!" : "¡Estamos abiertos! Pásate.",
      sub: `Hoy cerramos a las ${formatMinutes(status.until)}.`
    };
  }
  return {
    cls: status.openingSoon ? "is-soon" : "is-closed",
    short: status.openingSoon ? "Abre pronto" : "Cerrado",
    long: "Ahora mismo estamos cerrados",
    sub: `Abrimos ${describeNextOpening(status.next)}.`
  };
}

/** Estado abierto/cerrado en vivo: píldora de la cabecera, tarjeta del hero, panel, cuenta atrás y barra del día. */
export function initHours() {
  renderWeek();
  renderFooterHours();

  const updateDayline = createDayline();
  const updateCountdown = createCountdown();
  const clock = $("#liveClock");
  const stateEls = $$("[data-status-pill], [data-status-card], [data-status-panel], [data-status-badge]");
  const shortEls = $$("[data-status-short]");
  const longEls = $$("[data-status-long]");
  const subEls = $$("[data-status-sub]");
  let lastOpen = null;

  const update = () => {
    const status = getStatus(SCHEDULE);
    const text = describe(status);
    stateEls.forEach((el) => {
      el.classList.remove(...STATE_CLASSES);
      el.classList.add(text.cls);
    });
    shortEls.forEach((el) => (el.textContent = text.short));
    longEls.forEach((el) => (el.textContent = text.long));
    subEls.forEach((el) => (el.textContent = text.sub));

    updateCountdown(status.secondsLeft, status.open);
    const n = status.now;
    clock.textContent = `${pad2(n.h)}:${pad2(n.m)}:${pad2(n.s)}`;
    updateDayline(n);

    if (lastOpen !== null && lastOpen !== status.open) {
      toast(status.open ? "¡Acabamos de abrir!" : "Acabamos de cerrar. ¡Hasta mañana!");
    }
    lastOpen = status.open;
  };

  update();
  setInterval(update, 1000);
}
