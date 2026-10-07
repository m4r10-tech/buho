import { describe, expect, it } from "vitest";
import { SCHEDULE } from "../data/bar.js";
import {
  bookingSlots,
  dayOfDateString,
  daySegments,
  describeNextOpening,
  formatMinutes,
  getStatus
} from "./schedule.js";

const at = (iso) => new Date(iso);

describe("formatMinutes", () => {
  it("formatea y normaliza pasada la medianoche", () => {
    expect(formatMinutes(660)).toBe("11:00");
    expect(formatMinutes(1500)).toBe("01:00");
    expect(formatMinutes(1560)).toBe("02:00");
  });
});

describe("getStatus", () => {
  it("cerrado justo antes de abrir un día laborable", () => {
    const s = getStatus(SCHEDULE, at("2026-10-07T10:59:00+02:00")); // miércoles
    expect(s.open).toBe(false);
    expect(s.secondsLeft).toBe(60);
    expect(describeNextOpening(s.next)).toBe("hoy a las 11:00");
  });

  it("abierto a la hora de apertura", () => {
    const s = getStatus(SCHEDULE, at("2026-10-07T11:00:00+02:00"));
    expect(s.open).toBe(true);
    expect(formatMinutes(s.until)).toBe("01:00");
  });

  it("sigue abierto de madrugada con el horario del día anterior", () => {
    const s = getStatus(SCHEDULE, at("2026-10-08T00:30:00+02:00")); // jueves 00:30
    expect(s.open).toBe(true);
    expect(s.closingSoon).toBe(true);
    expect(s.secondsLeft).toBe(1800);
  });

  it("viernes y sábado cierra a las 02:00", () => {
    expect(getStatus(SCHEDULE, at("2026-10-10T01:30:00+02:00")).open).toBe(true);
    expect(getStatus(SCHEDULE, at("2026-10-10T02:00:00+02:00")).open).toBe(false);
  });

  it("el lunes de madrugada aún cuenta el domingo y luego cierra todo el día", () => {
    expect(getStatus(SCHEDULE, at("2026-10-12T00:59:00+02:00")).open).toBe(true);
    const s = getStatus(SCHEDULE, at("2026-10-12T12:00:00+02:00"));
    expect(s.open).toBe(false);
    expect(describeNextOpening(s.next)).toBe("mañana a las 11:00");
  });

  it("el domingo abre a las 12:00", () => {
    const s = getStatus(SCHEDULE, at("2026-10-11T11:30:00+02:00"));
    expect(s.open).toBe(false);
    expect(describeNextOpening(s.next)).toBe("hoy a las 12:00");
  });

  it("usa la hora de Madrid aunque la fecha venga en UTC", () => {
    // 23:30 UTC del martes = 01:30 del miércoles en Madrid (cerrado)
    expect(getStatus(SCHEDULE, at("2026-10-06T23:30:00Z")).open).toBe(false);
  });

  it("respeta el horario de invierno (UTC+1)", () => {
    // 10:30 UTC del 3 de diciembre = 11:30 en Madrid (abierto)
    expect(getStatus(SCHEDULE, at("2026-12-03T10:30:00Z")).open).toBe(true);
  });
});

describe("daySegments", () => {
  it("incluye la madrugada heredada del día anterior", () => {
    expect(daySegments(SCHEDULE, 6)).toEqual([[0, 120], [660, 1440]]); // sábado
  });
  it("el lunes solo tiene la madrugada del domingo", () => {
    expect(daySegments(SCHEDULE, 1)).toEqual([[0, 60]]);
  });
});

describe("bookingSlots", () => {
  it("detecta el día de la semana de una fecha", () => {
    expect(dayOfDateString("2026-10-12")).toBe(1);
  });

  it("devuelve null los lunes", () => {
    expect(bookingSlots(SCHEDULE, "2026-10-12", at("2026-10-07T12:00:00+02:00"))).toBeNull();
  });

  it("ofrece franjas de 30 min hasta 1 h antes del cierre", () => {
    const slots = bookingSlots(SCHEDULE, "2026-10-09", at("2026-10-07T12:00:00+02:00"));
    expect(slots[0]).toBe("11:00");
    expect(slots.at(-1)).toBe("01:00");
    expect(slots).toHaveLength(29);
  });

  it("hoy solo ofrece horas con al menos 30 min de margen", () => {
    const slots = bookingSlots(SCHEDULE, "2026-10-07", at("2026-10-07T21:10:00+02:00"));
    expect(slots).toEqual(["22:00", "22:30", "23:00", "23:30", "00:00"]);
  });
});
