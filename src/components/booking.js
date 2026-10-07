import { BAR, SCHEDULE } from "../data/bar.js";
import { $, $$, escapeHtml, restartAnimation } from "../lib/dom.js";
import { bookingSlots, dayOfDateString, madridDateString } from "../lib/schedule.js";
import { closeModal, openModal } from "./modal.js";
import { toast } from "./toast.js";

const MIN_PEOPLE = 1;
const MAX_PEOPLE = 20;
const DEFAULT_PEOPLE = 2;
const BOOKING_WINDOW_DAYS = 60;

const ERRORS = {
  name: "Dinos tu nombre",
  phone: "Teléfono no válido (mín. 9 dígitos)",
  date: "Elige un día válido",
  dateClosed: "Los lunes cerramos",
  time: "Elige una hora"
};

/** Formulario de reserva: valida, muestra un resumen y genera el mensaje de WhatsApp. */
export function initBooking() {
  const form = $("#bookingForm");
  const date = $("#fDate");
  const time = $("#fTime");
  const phone = $("#fPhone");
  const people = $("#fPeople");
  const notes = $("#fNotes");
  const notesCount = $("#notesCount");
  const required = $$("input[required], select[required]", form);

  const today = madridDateString();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);
  date.min = today;
  date.max = madridDateString(maxDate);

  const fillTimes = () => {
    const option = (label, value = "") => time.add(new Option(label, value));
    time.innerHTML = "";
    if (!date.value) return option("Elige primero el día");
    const slots = bookingSlots(SCHEDULE, date.value);
    if (slots === null) return option("Ese día cerramos (lunes)");
    if (!slots.length) return option("No quedan horas ese día");
    option("Elige una hora");
    slots.forEach((s) => option(s, s));
  };

  let count = DEFAULT_PEOPLE;
  const setPeople = (n) => {
    count = n;
    people.value = String(n);
    people.textContent = String(n);
  };
  $$("[data-step]", form).forEach((btn) =>
    btn.addEventListener("click", () => {
      const next = Math.max(MIN_PEOPLE, Math.min(MAX_PEOPLE, count + Number(btn.dataset.step)));
      if (next === count) {
        toast(count === MIN_PEOPLE ? "Mínimo 1 persona" : "Para más de 20 personas, llámanos");
        return;
      }
      setPeople(next);
      restartAnimation(people, "bump");
    })
  );
  notes.addEventListener("input", () => (notesCount.textContent = notes.value.length));

  const setError = (el, message) => {
    const field = el.closest(".field");
    field.classList.toggle("is-invalid", Boolean(message));
    field.querySelector(".field__error").textContent = message;
    return !message;
  };

  const validate = (el) => {
    if (!el.checkValidity()) return setError(el, ERRORS[el.name]);
    if (el === date) {
      if (date.value < today || date.value > date.max) return setError(el, ERRORS.date);
      if (!SCHEDULE[dayOfDateString(date.value)]) return setError(el, ERRORS.dateClosed);
    }
    if (el === phone && phone.value.replace(/\D/g, "").length < 9) return setError(el, ERRORS.phone);
    return setError(el, "");
  };

  required.forEach((el) => {
    el.addEventListener("blur", () => el.value && validate(el));
    el.addEventListener("input", () => el.closest(".field").classList.contains("is-invalid") && validate(el));
  });
  date.addEventListener("change", () => {
    fillTimes();
    validate(date);
  });

  const reset = () => {
    form.reset();
    setPeople(DEFAULT_PEOPLE);
    notesCount.textContent = "0";
    required.forEach((el) => setError(el, ""));
    fillTimes();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const invalid = required.filter((el) => !validate(el));
    if (invalid.length) {
      invalid[0].focus();
      toast("Revisa los campos marcados");
      return;
    }

    const fd = new FormData(form);
    const day = new Date(`${fd.get("date")}T12:00:00Z`).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC"
    });
    const summary = {
      Nombre: fd.get("name").trim(),
      Teléfono: fd.get("phone").trim(),
      Día: day,
      Hora: fd.get("time"),
      Personas: count,
      Zona: fd.get("zone"),
      Comentarios: fd.get("notes").trim() || "—"
    };
    const message = `¡Hola El Búho! Quiero reservar:\n${Object.entries(summary)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join("\n")}`;
    const whatsappUrl = `https://wa.me/${BAR.whatsapp}?text=${encodeURIComponent(message)}`;

    openModal(
      "Revisa tu reserva",
      `<ul class="summary-list">${Object.entries(summary)
        .map(([k, v]) => `<li><span>${k}</span><b>${escapeHtml(v)}</b></li>`)
        .join("")}</ul>
      <p class="modal__muted modal__small">Pulsa el botón para enviarnos la reserva por WhatsApp. Te confirmaremos lo antes posible.</p>
      <div class="modal__actions">
        <a class="btn btn--gold" href="${whatsappUrl}" target="_blank" rel="noopener" id="waLink">Enviar por WhatsApp</a>
        <a class="btn btn--ghost" href="tel:${BAR.phone}">Llamar</a>
      </div>`
    );
    $("#waLink").addEventListener("click", () => {
      closeModal();
      reset();
      toast("¡Gracias! Te esperamos");
    });
  });

  fillTimes();
}
