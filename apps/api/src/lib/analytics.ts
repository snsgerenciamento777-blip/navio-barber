/**
 * Helpers de analytics puros (port de @/lib/analytics.ts do Barber App).
 * Unit-testable, sem dependências de framework.
 */

export type AnalyticsRange = { from: Date; to: Date };

export type ShopAnalytics = {
  revenue_cents: number;
  completed: number;
  cancelled: number;
  no_show: number;
  total: number;
  top_services: { name: string; count: number }[];
};

/** Uma janela [now - n days, now]. */
export function lastNDays(n: number, now: Date = new Date()): AnalyticsRange {
  const to = new Date(now);
  const from = new Date(now);
  from.setDate(from.getDate() - n);
  return { from, to };
}

/** Percentual de no-show (0-100), guardando contra range vazio. */
export function noShowRate(a: Pick<ShopAnalytics, "no_show" | "total">): number {
  return a.total === 0 ? 0 : Math.round((a.no_show / a.total) * 100);
}
