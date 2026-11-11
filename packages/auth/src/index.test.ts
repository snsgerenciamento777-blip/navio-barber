import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@navio-barber/database", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    account: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    verification: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

process.env.BETTER_AUTH_SECRET = "test-secret-key-at-least-32-chars-long";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
(process.env as Record<string, string>).NODE_ENV = "test";

async function importAuth() {
  const mod = await import("./index");
  return mod.auth;
}

describe("Better Auth rate limiting and IP config (N-03, N-04)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("deve ter rate limiting habilitado", async () => {
    const auth = await importAuth();
    expect(auth.options.rateLimit?.enabled).toBe(true);
  });

  it("deve ter janela de rate limit de 60 segundos por padrão", async () => {
    const auth = await importAuth();
    expect(auth.options.rateLimit?.window).toBe(60);
  });

  it("deve ter limite padrão de 10 tentativas", async () => {
    const auth = await importAuth();
    expect(auth.options.rateLimit?.max).toBe(10);
  });

  it("deve ter regra customizada para sign-in/email (5 por minuto)", async () => {
    const auth = await importAuth();
    const rule = auth.options.rateLimit?.customRules?.[
      "/sign-in/email"
    ];
    expect(rule).toBeDefined();
    expect(rule.window).toBe(60);
    expect(rule.max).toBe(5);
  });

  it("deve ter regra customizada para sign-up/email (3 por minuto)", async () => {
    const auth = await importAuth();
    const rule = auth.options.rateLimit?.customRules?.[
      "/sign-up/email"
    ];
    expect(rule).toBeDefined();
    expect(rule.window).toBe(60);
    expect(rule.max).toBe(3);
  });

  it("deve ter trustedProxies configurado para prevenir spoofing de XFF", async () => {
    const auth = await importAuth();
    expect(auth.options.advanced?.ipAddress?.trustedProxies).toEqual([]);
  });

  it("deve exportar instância auth válida com handler", async () => {
    const auth = await importAuth();
    expect(auth).toBeDefined();
    expect(typeof auth.handler).toBe("function");
  });
});
