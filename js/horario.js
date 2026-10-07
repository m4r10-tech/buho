/* Lógica de horario: calcula si el bar está abierto según la hora de Toledo,
   independientemente de la zona horaria del visitante. */
(function () {
  "use strict";

  const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const WEEK_ORDER = [2, 3, 4, 5, 6, 0, 1]; // martes → lunes
  const TZ = "Europe/Madrid";
  const DAY_MIN = 1440;

  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  });
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  /** Devuelve {day, minutes, seconds} en hora de Madrid. */
  function madridNow(date) {
    const parts = {};
    fmt.formatToParts(date || new Date()).forEach(p => { parts[p.type] = p.value; });
    const h = Number(parts.hour), m = Number(parts.minute), s = Number(parts.second);
    return { day: WD[parts.weekday], minutes: h * 60 + m, seconds: s, h, m, s };
  }

  function fmtMin(min) {
    const m = ((min % DAY_MIN) + DAY_MIN) % DAY_MIN;
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }

  /** Intervalos abiertos en minutos relativos a hoy 00:00, desde ayer hasta dentro de 8 días. */
  function intervals(schedule, today) {
    const out = [];
    for (let k = -1; k <= 8; k++) {
      const d = (((today + k) % 7) + 7) % 7;
      const slot = schedule[d];
      if (slot) out.push({ start: k * DAY_MIN + slot[0], end: k * DAY_MIN + slot[1], day: d, offset: k });
    }
    return out;
  }

  /**
   * Estado actual.
   * open: boolean; secondsLeft: segundos hasta cerrar (si abierto) o hasta abrir (si cerrado).
   */
  function status(schedule, date) {
    const now = madridNow(date);
    const t = now.minutes + now.seconds / 60;
    const list = intervals(schedule, now.day);
    const current = list.find(i => t >= i.start && t < i.end);
    if (current) {
      const secondsLeft = Math.round((current.end - t) * 60);
      return { open: true, closingSoon: secondsLeft <= 3600, until: current.end, secondsLeft, now, current };
    }
    const next = list.find(i => i.start > t);
    const secondsLeft = Math.round((next.start - t) * 60);
    return { open: false, openingSoon: secondsLeft <= 3600, next, secondsLeft, now };
  }

  function nextLabel(next) {
    if (next.offset === 0) return "hoy a las " + fmtMin(next.start);
    if (next.offset === 1) return "mañana a las " + fmtMin(next.start);
    return "el " + DAY_NAMES[next.day].toLowerCase() + " a las " + fmtMin(next.start);
  }

  window.BuhoHorario = { DAY_NAMES, WEEK_ORDER, madridNow, status, fmtMin, nextLabel, intervals };
})();
