import { describe, expect, it } from "vitest";
import { distanceKm, travelMinutes } from "./geo.js";

describe("distanceKm", () => {
  it("es cero para el mismo punto", () => {
    expect(distanceKm([39.86, -3.94], [39.86, -3.94])).toBe(0);
  });
  it("calcula la distancia del Polígono a la catedral de Toledo (~7 km)", () => {
    const km = distanceKm([39.8676933, -3.9420914], [39.8571, -4.0237]);
    expect(km).toBeGreaterThan(6.5);
    expect(km).toBeLessThan(7.5);
  });
});

describe("travelMinutes", () => {
  it("nunca devuelve 0 minutos en coche", () => {
    expect(travelMinutes(0.1).car).toBe(1);
  });
});
