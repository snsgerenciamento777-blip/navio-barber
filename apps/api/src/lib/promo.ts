/**
 * Lógica pura de desconto por código promocional (port de @/lib/promo.ts do Barber App).
 * Unit-testable, sem dependências de framework.
 */

export type PromoKind = "percent" | "amount";

/**
 * O desconto (em centavos) que o promo aplica a `priceCents`.
 * - `percent`: `value` é 0-100.
 * - `amount`: `value` é em reais (convertido para centavos).
 * Nunca excede o preço (não gera totais negativos).
 */
export function promoDiscountCents(priceCents: number, kind: PromoKind, value: number): number {
  const raw = kind === "percent" ? Math.round((priceCents * value) / 100) : value * 100;
  return Math.max(0, Math.min(priceCents, raw));
}

/** Preço após aplicar o desconto promocional. */
export function discountedPrice(priceCents: number, kind: PromoKind, value: number): number {
  return priceCents - promoDiscountCents(priceCents, kind, value);
}
