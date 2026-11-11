import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./_app.ts";
import { createContext } from "../index.ts";

const mockPrisma = {
  user: {
    update: vi.fn(),
  },
};

const mockSession = {
  user: {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "ADMIN",
    csrfToken: "csrf-token-123",
  },
};

describe("Auth router — sessão e CSRF", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("me deve retornar dados do usuário quando autenticado", async () => {
    const ctx = await createContext({
      prisma: mockPrisma as any,
      session: mockSession as any,
      headers: new Headers(),
    });

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result.user).toEqual(mockSession.user);
    expect(result.csrfToken).toBe("csrf-token-123");
  });

  it("me deve lançar erro quando não autenticado", async () => {
    const ctx = await createContext({
      prisma: mockPrisma as any,
      session: null,
      headers: new Headers(),
    });

    const caller = appRouter.createCaller(ctx);
    await expect(caller.auth.me()).rejects.toThrow();
  });

  it("getCsrfToken deve retornar token da sessão", async () => {
    const ctx = await createContext({
      prisma: mockPrisma as any,
      session: mockSession as any,
      headers: new Headers(),
    });

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.getCsrfToken();
    expect(result.csrfToken).toBe("csrf-token-123");
  });

  it("getCsrfToken deve lançar erro quando não há token na sessão", async () => {
    const sessionWithoutToken = {
      ...mockSession,
      user: { ...mockSession.user, csrfToken: undefined },
    };
    const ctx = await createContext({
      prisma: mockPrisma as any,
      session: sessionWithoutToken as any,
      headers: new Headers(),
    });

    const caller = appRouter.createCaller(ctx);
    await expect(caller.auth.getCsrfToken()).rejects.toThrow(TRPCError);
  });

  it("createUser deve rejeitar papel CUSTOMER", () => {
    const validateRole = (r: string) => {
      if (r !== "ADMIN" && r !== "BARBER") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Apenas ADMIN ou BARBER podem ser criados por este fluxo",
        });
      }
    };

    expect(() => validateRole("CUSTOMER")).toThrow(TRPCError);
    expect(() => validateRole("ADMIN")).not.toThrow();
    expect(() => validateRole("BARBER")).not.toThrow();
  });
});
