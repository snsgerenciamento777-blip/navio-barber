import { TRPCError } from "@trpc/server";
import type { Context } from "../index.ts";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minuto
const DEFAULT_MAX = 100; // 100 requisições por minuto
const AUTH_MAX = 10; // 10 tentativas de auth por minuto

function getClientIp(ctx: Context): string {
  const forwarded = ctx.headers?.get("x-forwarded-for");
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = ctx.headers?.get("x-real-ip");
  if (typeof realIp === "string") return realIp;
  return "unknown";
}

/**
 * Middleware de rate limiting para tRPC.
 * Armazena contagem em memória (Map). Para produção com múltiplas instâncias,
 * substituir por armazenamento distribuído (Redis).
 *
 * @param options.max - Limite máximo de requisições na janela (padrão: 100)
 * @param options.windowMs - Tamanho da janela em ms (padrão: 60000 = 1 min)
 * @param options.key - Função para gerar a chave de rate limit (padrão: IP do cliente)
 */
export function rateLimit(options?: {
  max?: number;
  windowMs?: number;
  key?: (ctx: Context) => string;
}) {
  const max = options?.max ?? DEFAULT_MAX;
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const getKey = options?.key ?? ((ctx) => getClientIp(ctx));

  const middleware = ({ ctx, next }: { ctx: Context; next: (opts?: { ctx: Context }) => unknown }) => {
    const key = getKey(ctx);
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next({ ctx });
    }

    if (entry.count >= max) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Muitas requisições. Tente novamente mais tarde.",
      });
    }

    entry.count++;
    return next({ ctx });
  };
  return middleware as any;
}

export { rateLimitStore, WINDOW_MS, DEFAULT_MAX, AUTH_MAX };
