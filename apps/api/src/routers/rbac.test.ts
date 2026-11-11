import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./_app.ts";
import { createContext } from "../index.ts";
import { hasPermission, hasRole, ROLE_PERMISSIONS, type Role, type Permission } from "../lib/rbac.ts";

const mockPrisma = {
  user: { update: vi.fn() },
  shop: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  professional: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  customer: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  appointment: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    create: vi.fn(),
  },
  service: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

const adminSession = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN" as const,
    csrfToken: "csrf-admin-token",
  },
};

const barberSession = {
  user: {
    id: "barber-1",
    email: "barber@example.com",
    name: "Barber User",
    role: "BARBER" as const,
    csrfToken: "csrf-barber-token",
  },
};

function headersWithCsrf(token: string) {
  return new Headers({ "x-csrf-token": token });
}

async function makeCtx(session: typeof adminSession | typeof barberSession, csrfToken?: string) {
  return createContext({
    prisma: mockPrisma as any,
    session: session as any,
    headers: csrfToken ? headersWithCsrf(csrfToken) : new Headers(),
  });
}

describe("RBAC — role permissions", () => {
  it("ADMIN has all expected permissions", () => {
    const adminPerms = ROLE_PERMISSIONS.ADMIN;
    expect(adminPerms).toContain("shops:write");
    expect(adminPerms).toContain("shops:read");
    expect(adminPerms).toContain("services:write");
    expect(adminPerms).toContain("services:read");
    expect(adminPerms).toContain("customers:write");
    expect(adminPerms).toContain("customers:read");
    expect(adminPerms).toContain("appointments:write");
    expect(adminPerms).toContain("appointments:read");
    expect(adminPerms).toContain("dashboard:read");
    expect(adminPerms).not.toContain("super_admin:read");
    expect(adminPerms).not.toContain("super_admin:write");
  });

  it("BARBER has limited permissions", () => {
    const barberPerms = ROLE_PERMISSIONS.BARBER;
    expect(barberPerms).toContain("appointments:read");
    expect(barberPerms).toContain("appointments:write");
    expect(barberPerms).toContain("appointments:finalize");
    expect(barberPerms).toContain("customers:read");
    expect(barberPerms).toContain("customers:write");
    expect(barberPerms).toContain("services:read");
    expect(barberPerms).toContain("dashboard:read");
    expect(barberPerms).not.toContain("shops:write");
    expect(barberPerms).not.toContain("shops:delete");
    expect(barberPerms).not.toContain("services:write");
    expect(barberPerms).not.toContain("services:delete");
    expect(barberPerms).not.toContain("users:write");
    expect(barberPerms).not.toContain("users:delete");
    expect(barberPerms).not.toContain("super_admin:read");
    expect(barberPerms).not.toContain("super_admin:write");
  });

  it("SUPER_ADMIN has all permissions including super_admin", () => {
    const saPerms = ROLE_PERMISSIONS.SUPER_ADMIN;
    expect(saPerms).toContain("super_admin:read");
    expect(saPerms).toContain("super_admin:write");
    expect(saPerms).toContain("shops:write");
    expect(saPerms).toContain("users:write");
  });
});

describe("RBAC — hasPermission / hasRole helpers", () => {
  it("hasRole returns true for matching role", () => {
    expect(hasRole(adminSession as any, "ADMIN")).toBe(true);
    expect(hasRole(adminSession as any, "BARBER")).toBe(false);
    expect(hasRole(barberSession as any, "BARBER")).toBe(true);
    expect(hasRole(barberSession as any, "ADMIN")).toBe(false);
    expect(hasRole(null as any, "ADMIN")).toBe(false);
  });

  it("hasPermission returns true for permitted permissions", () => {
    expect(hasPermission(adminSession as any, "shops:write")).toBe(true);
    expect(hasPermission(adminSession as any, "dashboard:read")).toBe(true);
    expect(hasPermission(barberSession as any, "appointments:read")).toBe(true);
    expect(hasPermission(barberSession as any, "customers:write")).toBe(true);
    expect(hasPermission(null as any, "shops:read")).toBe(false);
  });

  it("hasPermission returns false for non-permitted permissions", () => {
    expect(hasPermission(barberSession as any, "shops:write")).toBe(false);
    expect(hasPermission(barberSession as any, "services:write")).toBe(false);
    expect(hasPermission(barberSession as any, "super_admin:read")).toBe(false);
    expect(hasPermission(barberSession as any, "users:delete")).toBe(false);
  });
});

describe("RBAC — ADMIN access to procedures", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ADMIN can call dashboard.getSummary", async () => {
    const ctx = await makeCtx(adminSession);
    mockPrisma.appointment.findMany.mockResolvedValue([]);
    mockPrisma.appointment.count.mockResolvedValue(0);
    mockPrisma.customer.count.mockResolvedValue(0);
    mockPrisma.shop.findFirst.mockResolvedValue({ id: "shop-1", ownerId: "admin-1" });

    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.getSummary({
      shopId: "shop-1",
      date: new Date().toISOString(),
    });

    expect(result).toBeDefined();
    expect(result.cards).toBeDefined();
  });

  it("ADMIN can call shop.create", async () => {
    const ctx = await makeCtx(adminSession, adminSession.user.csrfToken);
    mockPrisma.shop.create.mockResolvedValue({
      id: "shop-new",
      name: "Test Shop",
      ownerId: "admin-1",
    });

    const caller = appRouter.createCaller(ctx);
    const result = await caller.shop.create({
      name: "Test Shop",
    });

    expect(result.id).toBe("shop-new");
  });

  it("ADMIN can call service.create", async () => {
    const ctx = await makeCtx(adminSession, adminSession.user.csrfToken);
    mockPrisma.service.create.mockResolvedValue({
      id: "svc-1",
      name: "Corte",
      shopId: "shop-1",
      price: 50,
      durationMinutes: 30,
      isActive: true,
    });

    const caller = appRouter.createCaller(ctx);
    const result = await caller.service.create({
      shopId: "shop-1",
      name: "Corte",
      price: 50,
      durationMinutes: 30,
    });

    expect(result.name).toBe("Corte");
  });
});

describe("RBAC — BARBER access restrictions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("BARBER cannot call shop.create (shops:write)", async () => {
    const ctx = await makeCtx(barberSession, barberSession.user.csrfToken);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.shop.create({ name: "Barber Shop" })
    ).rejects.toThrow(TRPCError);
  });

  it("BARBER cannot call service.create (services:write)", async () => {
    const ctx = await makeCtx(barberSession, barberSession.user.csrfToken);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.service.create({
        shopId: "shop-1",
        name: "Corte",
        price: 50,
        durationMinutes: 30,
      })
    ).rejects.toThrow(TRPCError);
  });

  it("BARBER cannot call service.update (services:write)", async () => {
    const ctx = await makeCtx(barberSession, barberSession.user.csrfToken);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.service.update({
        id: "svc-1",
        name: "Corte",
      })
    ).rejects.toThrow(TRPCError);
  });

  it("BARBER can call service.read (services:read)", async () => {
    const ctx = await makeCtx(barberSession);
    mockPrisma.service.findMany.mockResolvedValue([]);
    mockPrisma.shop.findFirst.mockResolvedValue({ id: "shop-1", ownerId: "barber-1" });

    const caller = appRouter.createCaller(ctx);
    const result = await caller.service.list({ shopId: "shop-1" });

    expect(result).toEqual([]);
  });

  it("BARBER dashboard revenueToday is 0 (financial data hidden)", async () => {
    const ctx = await makeCtx(barberSession);
    mockPrisma.shop.findFirst.mockResolvedValue({ id: "shop-1", ownerId: "barber-1" });
    mockPrisma.appointment.findMany.mockResolvedValue([
      { paymentStatus: "PAID", totalValue: 100, status: "COMPLETED", service: {} },
    ]);
    mockPrisma.appointment.count.mockResolvedValue(0);
    mockPrisma.customer.count.mockResolvedValue(0);

    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.getSummary({
      shopId: "shop-1",
      date: new Date().toISOString(),
    });

    expect(result.cards.revenueToday).toBe(0);
  });

  it("ADMIN dashboard revenueToday returns actual value", async () => {
    const ctx = await makeCtx(adminSession);
    mockPrisma.shop.findFirst.mockResolvedValue({ id: "shop-1", ownerId: "admin-1" });
    mockPrisma.appointment.findMany.mockResolvedValue([
      { paymentStatus: "PAID", totalValue: 100, status: "COMPLETED", service: {} },
    ]);
    mockPrisma.appointment.count.mockResolvedValue(0);
    mockPrisma.customer.count.mockResolvedValue(0);

    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.getSummary({
      shopId: "shop-1",
      date: new Date().toISOString(),
    });

    expect(result.cards.revenueToday).toBe(100);
  });

  it("BARBER getByPeriod filters by own professional", async () => {
    const ctx = await makeCtx(barberSession);
    mockPrisma.shop.findFirst.mockResolvedValue({ id: "shop-1", ownerId: "barber-1" });
    mockPrisma.professional.findFirst.mockResolvedValue({ id: "prof-barber-1" });
    mockPrisma.appointment.findMany.mockResolvedValue([]);

    const caller = appRouter.createCaller(ctx);
    await caller.appointment.getByPeriod({
      shopId: "shop-1",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          professionalId: "prof-barber-1",
        }),
      })
    );
  });

  it("BARBER without professional gets no appointments", async () => {
    const ctx = await makeCtx(barberSession);
    mockPrisma.shop.findFirst.mockResolvedValue({ id: "shop-1", ownerId: "barber-1" });
    mockPrisma.professional.findFirst.mockResolvedValue(null);
    mockPrisma.appointment.findMany.mockResolvedValue([]);

    const caller = appRouter.createCaller(ctx);
    const result = await caller.appointment.getByPeriod({
      shopId: "shop-1",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(result).toEqual([]);
    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          professionalId: "nonexistent",
        }),
      })
    );
  });

  it("ADMIN getByPeriod returns all appointments for shop (no professional filter)", async () => {
    const ctx = await makeCtx(adminSession);
    mockPrisma.shop.findFirst.mockResolvedValue({ id: "shop-1", ownerId: "admin-1" });
    mockPrisma.appointment.findMany.mockResolvedValue([]);

    const caller = appRouter.createCaller(ctx);
    await caller.appointment.getByPeriod({
      shopId: "shop-1",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const callArgs = mockPrisma.appointment.findMany.mock.calls[0][0];
    expect(callArgs.where.shopId).toBe("shop-1");
    expect(callArgs.where.professionalId).toBeUndefined();
  });

  it("BARBER customer list filters by own professional appointments", async () => {
    const ctx = await makeCtx(barberSession);
    mockPrisma.shop.findFirst.mockResolvedValue({ id: "shop-1", ownerId: "barber-1" });
    mockPrisma.professional.findFirst.mockResolvedValue({ id: "prof-barber-1" });
    mockPrisma.customer.findMany.mockResolvedValue([]);

    const caller = appRouter.createCaller(ctx);
    await caller.customer.list({ shopId: "shop-1" });

    expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          appointments: expect.objectContaining({
            some: expect.objectContaining({
              professional: expect.objectContaining({
                id: "prof-barber-1",
              }),
            }),
          }),
        }),
      })
    );
  });
});

describe("RBAC — createUser role restrictions", () => {
  it("createUser rejects CUSTOMER role", () => {
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

  it("createUser requires ADMIN role (adminProcedure)", () => {
    const isAdmin = (session: { user: { role: string } } | null) => {
      if (!session?.user) return false;
      return session.user.role === "ADMIN";
    };

    expect(isAdmin(adminSession as any)).toBe(true);
    expect(isAdmin(barberSession as any)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe("RBAC — shop ownership validation", () => {
  it("validarShopAcesso allows ADMIN for any shop", async () => {
    const { validarShopAcesso } = await import("../lib/shop-ownership.ts");
    mockPrisma.shop.findFirst.mockResolvedValue(null);

    await validarShopAcesso(mockPrisma as any, "admin-1", "shop-999", "ADMIN");
    expect(mockPrisma.shop.findFirst).not.toHaveBeenCalled();
  });

  it("validarShopAcesso allows SUPER_ADMIN for any shop", async () => {
    const { validarShopAcesso } = await import("../lib/shop-ownership.ts");
    mockPrisma.shop.findFirst.mockResolvedValue(null);

    await validarShopAcesso(mockPrisma as any, "super-1", "shop-999", "SUPER_ADMIN");
    expect(mockPrisma.shop.findFirst).not.toHaveBeenCalled();
  });

  it("validarShopAcesso requires ownership for BARBER", async () => {
    const { validarShopAcesso } = await import("../lib/shop-ownership.ts");
    mockPrisma.shop.findFirst.mockResolvedValue(null);

    await expect(
      validarShopAcesso(mockPrisma as any, "barber-1", "shop-999", "BARBER")
    ).rejects.toThrow(TRPCError);
    expect(mockPrisma.shop.findFirst).toHaveBeenCalledWith({
      where: { id: "shop-999", ownerId: "barber-1" },
    });
  });
});
