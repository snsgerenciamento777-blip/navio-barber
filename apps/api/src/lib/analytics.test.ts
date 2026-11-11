import { describe, it, expect } from "vitest";
import { lastNDays, noShowRate, type ShopAnalytics } from "./analytics.ts";

describe("lastNDays (port de @/lib/analytics.ts do Barber App)", () => {
  it("retorna janela de n dias até agora", () => {
    const now = new Date("2026-01-10T12:00:00Z");
    const range = lastNDays(7, now);
    expect(range.to).toEqual(now);
    expect(range.from.getDate()).toBe(3);
    expect(range.from.getMonth()).toBe(0); // janeiro
  });

  it("n=0 retorna from igual a to", () => {
    const now = new Date("2026-01-10T12:00:00Z");
    const range = lastNDays(0, now);
    expect(range.from.getTime()).toBe(range.to.getTime());
  });
});

describe("noShowRate (port de @/lib/analytics.ts do Barber App)", () => {
  it("retorna 0 quando total é 0", () => {
    expect(noShowRate({ no_show: 0, total: 0 })).toBe(0);
    expect(noShowRate({ no_show: 5, total: 0 })).toBe(0);
  });

  it("calcula percentual de no-show", () => {
    expect(noShowRate({ no_show: 2, total: 10 })).toBe(20);
    expect(noShowRate({ no_show: 1, total: 4 })).toBe(25);
    expect(noShowRate({ no_show: 0, total: 100 })).toBe(0);
    expect(noShowRate({ no_show: 10, total: 10 })).toBe(100);
  });

  it("arredonda para inteiro", () => {
    expect(noShowRate({ no_show: 1, total: 3 })).toBe(33);
    expect(noShowRate({ no_show: 2, total: 3 })).toBe(67);
  });
});
