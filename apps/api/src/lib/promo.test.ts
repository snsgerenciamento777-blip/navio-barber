import { describe, it, expect } from "vitest";
import { promoDiscountCents, discountedPrice, type PromoKind } from "./promo.ts";

describe("promoDiscountCents (port de @/lib/promo.ts do Barber App)", () => {
  it("percent: desconto de 10% em R$100,00 = R$10,00 (1000 centavos)", () => {
    expect(promoDiscountCents(10000, "percent", 10)).toBe(1000);
  });

  it("percent: desconto de 50% em R$50,00 = R$25,00 (2500 centavos)", () => {
    expect(promoDiscountCents(5000, "percent", 50)).toBe(2500);
  });

  it("amount: desconto de R$20,00 em R$100,00 = R$20,00 (2000 centavos)", () => {
    expect(promoDiscountCents(10000, "amount", 20)).toBe(2000);
  });

  it("percent: valor 0 não dá desconto", () => {
    expect(promoDiscountCents(10000, "percent", 0)).toBe(0);
  });

  it("amount: valor 0 não dá desconto", () => {
    expect(promoDiscountCents(10000, "amount", 0)).toBe(0);
  });

  it("percent: desconto não excede o preço (cap em 100%)", () => {
    expect(promoDiscountCents(10000, "percent", 100)).toBe(10000);
    expect(promoDiscountCents(10000, "percent", 150)).toBe(10000);
  });

  it("amount: desconto não excede o preço (cap)", () => {
    expect(promoDiscountCents(5000, "amount", 100)).toBe(5000);
  });

  it("priceCents 0 => desconto 0", () => {
    expect(promoDiscountCents(0, "percent", 50)).toBe(0);
    expect(promoDiscountCents(0, "amount", 100)).toBe(0);
  });
});

describe("discountedPrice (port de @/lib/promo.ts do Barber App)", () => {
  it("percent: preço final após desconto", () => {
    expect(discountedPrice(10000, "percent", 10)).toBe(9000);
  });

  it("amount: preço final após desconto", () => {
    expect(discountedPrice(10000, "amount", 20)).toBe(8000);
  });

  it("desconto não resulta em preço negativo", () => {
    expect(discountedPrice(1000, "amount", 1000)).toBe(0);
  });
});
