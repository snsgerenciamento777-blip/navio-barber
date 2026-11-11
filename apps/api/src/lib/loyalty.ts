/**
 * Progresso de fidelidade tipo cartão de punções (port de @/lib/loyalty.ts do Barber App).
 * Unit-testable, sem dependências de framework.
 */

export const LOYALTY_THRESHOLD = 10;

export type LoyaltyProgress = {
  completed: number;
  threshold: number;
  /** Punções no cartão atual (0..threshold). */
  inCard: number;
  /** Punções restantes até a próxima recompensa. */
  remaining: number;
  /** True quando uma recompensa foi atingida (cartão completo). */
  rewardReady: boolean;
};

export function loyaltyProgress(completed: number, threshold = LOYALTY_THRESHOLD): LoyaltyProgress {
  const safeCompleted = Math.max(0, completed);
  const inCard = safeCompleted % threshold;
  const rewardReady = safeCompleted > 0 && inCard === 0;
  return {
    completed: safeCompleted,
    threshold,
    inCard: rewardReady ? threshold : inCard,
    remaining: rewardReady ? 0 : threshold - inCard,
    rewardReady,
  };
}
