import { describe, it, expect } from "vitest";
import { loyaltyProgress, LOYALTY_THRESHOLD, type LoyaltyProgress } from "./loyalty.ts";

describe("loyaltyProgress (port de @/lib/loyalty.ts do Barber App)", () => {
  it("threshold padrão é 10", () => {
    expect(LOYALTY_THRESHOLD).toBe(10);
  });

  it("0 concluídos => sem progresso, sem recompensa", () => {
    const p: LoyaltyProgress = loyaltyProgress(0);
    expect(p.completed).toBe(0);
    expect(p.inCard).toBe(0);
    expect(p.remaining).toBe(10);
    expect(p.rewardReady).toBe(false);
  });

  it("5 concluídos => 5 no cartão, 5 restantes", () => {
    const p = loyaltyProgress(5);
    expect(p.completed).toBe(5);
    expect(p.inCard).toBe(5);
    expect(p.remaining).toBe(5);
    expect(p.rewardReady).toBe(false);
  });

  it("10 concluídos => recompensa pronta, cartão completo", () => {
    const p = loyaltyProgress(10);
    expect(p.completed).toBe(10);
    expect(p.inCard).toBe(10);
    expect(p.remaining).toBe(0);
    expect(p.rewardReady).toBe(true);
  });

  it("15 concluídos => 5 no novo cartão, recompensa pronta (10 completou um)", () => {
    const p = loyaltyProgress(15);
    expect(p.completed).toBe(15);
    expect(p.inCard).toBe(5);
    expect(p.remaining).toBe(5);
    expect(p.rewardReady).toBe(false);
  });

  it("20 concluídos => recompensa pronta novamente (2 cartões completos)", () => {
    const p = loyaltyProgress(20);
    expect(p.completed).toBe(20);
    expect(p.inCard).toBe(10);
    expect(p.remaining).toBe(0);
    expect(p.rewardReady).toBe(true);
  });

  it("valor negativo tratado como 0", () => {
    const p = loyaltyProgress(-5);
    expect(p.completed).toBe(0);
    expect(p.rewardReady).toBe(false);
  });

  it("threshold customizado", () => {
    const p = loyaltyProgress(5, 5);
    expect(p.inCard).toBe(5);
    expect(p.rewardReady).toBe(true);
    expect(p.remaining).toBe(0);
  });
});
