import { $$ } from "../lib/dom.js";

let observer = null;

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  return observer;
}

/** Anima la aparición de los elementos .reveal al hacer scroll. */
export function observeReveal(root = document) {
  const els = $$(".reveal:not(.is-in)", root);
  els.forEach((el) => {
    if (el.dataset.delay) el.style.setProperty("--delay", `${el.dataset.delay}ms`);
  });
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = getObserver();
  els.forEach((el) => io.observe(el));
}
