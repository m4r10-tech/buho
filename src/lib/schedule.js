/**
 * Lógica de horario. Funciones puras (sin DOM) para poder testearlas.
 * Todas las horas se calculan en la zona horaria de Toledo (Europe/Madrid),
 * independientemente de la zona del visitante.
 *
 * Un horario es un objeto { [díaSemana]: [aperturaMin, cierreMin] | null },
 * con 0 = domingo … 6 = sábado y minutos desde las 00:00. Un cierre > 1440
 * significa que el local cierra pasada la medianoche.
 */

export const TIME_ZONE = "Europe/Madrid";
export const DAY_MINUTES = 1440;
export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
/** Orden de la semana en la tabla: de martes a lunes. */
export const WEEK_ORDER = [2, 3, 4, 5, 6, 0, 1];

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23"
});

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

/** Hora actual en Madrid: { day, minutes, seconds, h, m, s }. */
export function madridNow(date = new Date()) {
  const parts = {};
  for (const p of clockFormat.formatToParts(date)) parts[p.type] = p.value;
  const h = Number(parts.hour);
  const m = Number(parts.minute);
  const s = Number(parts.second);
  return { day: WEEKDAY_INDEX[parts.weekday], minutes: h * 60 + m, seconds: s, h, m, s };
}

/** Fecha en Madrid como "YYYY-MM-DD". */
export function madridDateString(date = new Date()) {
  return dateFormat.format(date);
}

/** Día de la semana (0-6) de una fecha "YYYY-MM-DD". */
export function dayOfDateString(str) {
  return new Date(`${str}T12:00:00Z`).getUTCDay();
}

/** 90 → "01:30"; 1500 → "01:00". */
export function formatMinutes(min) {
  const m = ((min % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Tramos abiertos en minutos relativos a hoy 00:00, desde ayer hasta dentro de 8 días. */
export function openIntervals(schedule, today) {
  const out = [];
  for (let offset = -1; offset <= 8; offset++) {
    const day = (((today + offset) % 7) + 7) % 7;
    const slot = schedule[day];
    if (slot) {
      out.push({ start: offset * DAY_MINUTES + slot[0], end: offset * DAY_MINUTES + slot[1], day, offset });
    }
  }
  return out;
}

/**
 * Estado del local en un instante.
 * - Abierto: { open: true, until, secondsLeft, closingSoon }
 * - Cerrado: { open: false, next, secondsLeft, openingSoon }
 * `secondsLeft` son los segundos hasta el cierre o hasta la próxima apertura.
 */
export function getStatus(schedule, date = new Date()) {
  const now = madridNow(date);
  const t = now.minutes + now.seconds / 60;
  const list = openIntervals(schedule, now.day);

  const current = list.find((i) => t >= i.start && t < i.end);
  if (current) {
    const secondsLeft = Math.round((current.end - t) * 60);
    return { open: true, closingSoon: secondsLeft <= 3600, until: current.end, secondsLeft, now };
  }

  const next = list.find((i) => i.start > t);
  if (!next) return { open: false, openingSoon: false, next: null, secondsLeft: 0, now };
  const secondsLeft = Math.round((next.start - t) * 60);
  return { open: false, openingSoon: secondsLeft <= 3600, next, secondsLeft, now };
}

/** "hoy a las 11:00" | "mañana a las 11:00" | "el martes a las 11:00". */
export function describeNextOpening(next) {
  if (!next) return "pronto";
  const time = formatMinutes(next.start);
  if (next.offset === 0) return `hoy a las ${time}`;
  if (next.offset === 1) return `mañana a las ${time}`;
  return `el ${DAY_NAMES[next.day].toLowerCase()} a las ${time}`;
}

/** Tramos abiertos que caen dentro de las 24 h del día indicado (para la barra del día). */
export function daySegments(schedule, day) {
  const segs = [];
  const prev = schedule[(day + 6) % 7];
  if (prev && prev[1] > DAY_MINUTES) segs.push([0, prev[1] - DAY_MINUTES]);
  const cur = schedule[day];
  if (cur) segs.push([cur[0], Math.min(cur[1], DAY_MINUTES)]);
  return segs;
}

/**
 * Horas reservables (cada 30 min, hasta 1 h antes del cierre) para una fecha "YYYY-MM-DD".
 * Si la fecha es hoy, solo se ofrecen horas con al menos 30 min de margen.
 * Devuelve null si ese día está cerrado.
 */
export function bookingSlots(schedule, dateStr, now = new Date()) {
  const slot = schedule[dayOfDateString(dateStr)];
  if (!slot) return null;
  let from = slot[0];
  if (dateStr === madridDateString(now)) {
    const n = madridNow(now);
    from = Math.max(from, Math.ceil((n.minutes + 30) / 30) * 30);
  }
  const slots = [];
  for (let m = from; m <= slot[1] - 60; m += 30) slots.push(formatMinutes(m));
  return slots;
}
