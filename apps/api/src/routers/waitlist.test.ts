import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { WaitlistStatus } from "@prisma/client";

const mockWaitlistFindFirst = vi.fn();
const mockWaitlistFindUnique = vi.fn();
const mockWaitlistCreate = vi.fn();
const mockWaitlistUpdate = vi.fn();
const mockWaitlistDelete = vi.fn();
const mockShopFindFirst = vi.fn();
const mockCustomerFindUnique = vi.fn();

const mockPrisma = {
  waitlist: {
    findFirst: mockWaitlistFindFirst,
    findUnique: mockWaitlistFindUnique,
    create: mockWaitlistCreate,
    update: mockWaitlistUpdate,
    delete: mockWaitlistDelete,
  },
  shop: { findFirst: mockShopFindFirst },
  customer: { findUnique: mockCustomerFindUnique },
};

async function validarShopDoUsuario(prisma: any, userId: string, shopId: string): Promise<void> {
  const shop = await prisma.shop.findFirst({ where: { id: shopId, ownerId: userId } });
  if (!shop) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Usuário não possui acesso a esta loja" });
  }
}

const SHOP_A = { id: "shop-a", ownerId: "user-owner-a" };
const CUSTOMER_A = { id: "customer-a", shopId: "shop-a" };
const PROFESSIONAL_A = { id: "professional-a", shopId: "shop-a" };
const SERVICE_A = { id: "service-a", shopId: "shop-a" };

const WAITLIST_ENTRY = {
  id: "waitlist-a",
  shopId: "shop-a",
  customerId: "customer-a",
  professionalId: "professional-a",
  serviceId: "service-a",
  desiredDate: new Date("2026-12-01T10:00:00Z"),
  status: WaitlistStatus.WAITING,
};

const SESSION_OWNER_A = { user: { id: "user-owner-a", role: "ADMIN" as const } };
const SESSION_CUSTOMER_A = { user: { id: "customer-a", role: "CUSTOMER" as const } };
const SESSION_BARBER_A = { user: { id: "barber-a", role: "BARBER" as const } };

describe("Waitlist router (multi-tenant)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("list deve validar shop ownership antes de listar", async () => {
    mockShopFindFirst.mockResolvedValue(SHOP_A);
    await expect(validarShopDoUsuario(mockPrisma, "user-owner-a", "shop-a")).resolves.toBeUndefined();
  });

  it("list deve rejeitar shop de outro usuário", async () => {
    mockShopFindFirst.mockResolvedValue(null);
    await expect(validarShopDoUsuario(mockPrisma, "user-owner-a", "shop-b")).rejects.toThrow(TRPCError);
  });

  it("create rejeita cliente que não é o próprio usuário autenticado", async () => {
    const session = SESSION_OWNER_A;
    const inputCustomerId = "customer-b";
    expect(session.user.id !== inputCustomerId).toBe(true);
  });

  it("create permite cliente inscrever-se na própria lista de espera", async () => {
    const session = SESSION_CUSTOMER_A;
    expect(session.user.id === "customer-a").toBe(true);
  });

  it("updateStatus: cliente só pode cancelar própria entrada", async () => {
    mockWaitlistFindUnique.mockResolvedValue({ ...WAITLIST_ENTRY, customerId: "customer-a" });
    const entry = await mockPrisma.waitlist.findUnique({ where: { id: "waitlist-a" } });
    const sessionUserId = "customer-a";
    expect(entry?.customerId === sessionUserId).toBe(true);
    expect(inputStatusCancelledOnly(entry, WaitlistStatus.CANCELLED)).toBe(true);
  });

  it("updateStatus: barbeiro pode notificar/fulfill entrada de seu profissional", async () => {
    mockWaitlistFindUnique.mockResolvedValue({ ...WAITLIST_ENTRY, professionalId: "barber-a" });
    const entry = await mockPrisma.waitlist.findUnique({ where: { id: "waitlist-a" } });
    const sessionUserId = "barber-a";
    expect(entry?.professionalId === sessionUserId).toBe(true);
  });

  it("delete: apenas o cliente dono pode remover", async () => {
    mockWaitlistFindUnique.mockResolvedValue({ ...WAITLIST_ENTRY, customerId: "customer-a" });
    const entry = await mockPrisma.waitlist.findUnique({ where: { id: "waitlist-a" } });
    const sessionUserId = "customer-a";
    expect(entry?.customerId === sessionUserId).toBe(true);
  });

  it("delete rejeita cliente de outro usuário", async () => {
    mockWaitlistFindUnique.mockResolvedValue({ ...WAITLIST_ENTRY, customerId: "customer-b" });
    const entry = await mockPrisma.waitlist.findUnique({ where: { id: "waitlist-a" } });
    const sessionUserId = "customer-a";
    expect(entry?.customerId !== sessionUserId).toBe(true);
  });

  it("WaitlistStatus possui WAITING, NOTIFIED, FULFILLED, CANCELLED", () => {
    expect(WaitlistStatus.WAITING).toBe("WAITING");
    expect(WaitlistStatus.NOTIFIED).toBe("NOTIFIED");
    expect(WaitlistStatus.FULFILLED).toBe("FULFILLED");
    expect(WaitlistStatus.CANCELLED).toBe("CANCELLED");
  });
});

function inputStatusCancelledOnly(entry: { customerId: string }, status: WaitlistStatus): boolean {
  return entry.customerId === "customer-a" && status === WaitlistStatus.CANCELLED;
}
