import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: vi.fn(() => ({
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
    PUT: vi.fn(),
    DELETE: vi.fn(),
  })),
}));

vi.mock("@navio-barber/auth", () => {
  const auth = { handler: vi.fn() };
  return { auth };
});

process.env.BETTER_AUTH_SECRET = "test-secret-key-at-least-32-chars-long";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
(process.env as Record<string, string>).NODE_ENV = "test";

async function importRoute() {
  return await import("./[...]/route");
}

describe("Next.js route handler para Better Auth (N-03)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("deve exportar handler GET", async () => {
    const mod = await importRoute();
    expect(typeof mod.GET).toBe("function");
  });

  it("deve exportar handler POST", async () => {
    const mod = await importRoute();
    expect(typeof mod.POST).toBe("function");
  });

  it("deve exportar handler PATCH", async () => {
    const mod = await importRoute();
    expect(typeof mod.PATCH).toBe("function");
  });

  it("deve exportar handler PUT", async () => {
    const mod = await importRoute();
    expect(typeof mod.PUT).toBe("function");
  });

  it("deve exportar handler DELETE", async () => {
    const mod = await importRoute();
    expect(typeof mod.DELETE).toBe("function");
  });
});
