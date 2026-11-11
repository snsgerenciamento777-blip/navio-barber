import { describe, it, expect } from "vitest";
import { generateSlots } from "./availability.ts";

const MONDAY = new Date(2026, 0, 5, 12, 0, 0); // segunda-feira, horário local
const SUNDAY = new Date(2026, 0, 4, 12, 0, 0); // domingo, horário local
const NOW_PAST = new Date("2020-01-01T00:00:00Z");

const WORKING_HOURS = {
  mon: ["09:00", "18:00"],
  tue: ["09:00", "18:00"],
  wed: ["09:00", "18:00"],
  thu: ["09:00", "18:00"],
  fri: ["09:00", "18:00"],
  sat: ["10:00", "16:00"],
  sun: null,
};

describe("generateSlots (port de @/lib/availability.ts do Barber App)", () => {
  it("gera slots de 30 em 30 min dentro do expediente", () => {
    const slots = generateSlots(MONDAY, WORKING_HOURS, 30, [], [], NOW_PAST);
    const first = slots[0];
    expect(first.start.getHours()).toBe(9);
    expect(first.start.getMinutes()).toBe(0);
    expect(first.end.getHours()).toBe(9);
    expect(first.end.getMinutes()).toBe(30);
    expect(first.available).toBe(true);
  });

  it("não gera slot que ultrapasse o horário de fechamento", () => {
    const slots = generateSlots(MONDAY, WORKING_HOURS, 30, [], [], NOW_PAST);
    const last = slots[slots.length - 1];
    expect(last.end.getHours()).toBe(18);
    expect(last.end.getMinutes()).toBe(0);
    // Não deve haver slot começando às 17:45 porque terminaria às 18:15 (> 18:00)
    const startsAt1745 = slots.some(
      (s) => s.start.getHours() === 17 && s.start.getMinutes() === 45,
    );
    expect(startsAt1745).toBe(false);
  });

  it("domingo sem expediente retorna array vazio", () => {
    const slots = generateSlots(SUNDAY, WORKING_HOURS, 30, [], [], NOW_PAST);
    expect(slots).toEqual([]);
  });

  it("workingHours null retorna array vazio", () => {
    const slots = generateSlots(MONDAY, null, 30, [], [], NOW_PAST);
    expect(slots).toEqual([]);
  });

  it("marca slots ocupados como indisponíveis", () => {
    const booked = [{ start: "2026-01-05T10:00:00", end: "2026-01-05T10:30:00" }];
    const slots = generateSlots(MONDAY, WORKING_HOURS, 30, booked, [], NOW_PAST);
    const slot10 = slots.find((s) => s.start.getHours() === 10 && s.start.getMinutes() === 0);
    expect(slot10?.available).toBe(false);
  });

  it("marca slots bloqueados (ausência) como indisponíveis", () => {
    const blocked = [{ start: "2026-01-05T12:00:00", end: "2026-01-05T13:00:00" }];
    const slots = generateSlots(MONDAY, WORKING_HOURS, 30, [], blocked, NOW_PAST);
    const slot12 = slots.find((s) => s.start.getHours() === 12 && s.start.getMinutes() === 0);
    expect(slot12?.available).toBe(false);
  });

  it("duração de 60 min gera slots de 60 min", () => {
    const slots = generateSlots(MONDAY, WORKING_HOURS, 60, [], [], NOW_PAST);
    const first = slots[0];
    expect(first.end.getTime() - first.start.getTime()).toBe(60 * 60_000);
  });

  it("granularidade de 30 min entre slots", () => {
    const slots = generateSlots(MONDAY, WORKING_HOURS, 30, [], [], NOW_PAST);
    const starts = slots.map((s) => s.start.getMinutes());
    expect(starts.every((m) => m === 0 || m === 30)).toBe(true);
  });
});
