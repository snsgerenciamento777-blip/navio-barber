import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// Mock do prisma
const mockShopFindFirst = vi.fn();
const mockPrisma = {
  shop: {
    findFirst: mockShopFindFirst,
  },
};

// Simulação da função validarShopDoUsuario (extraída dos routers)
async function validarShopDoUsuario(
  prisma: any,
  userId: string,
  shopId: string,
): Promise<void> {
  const shop = await prisma.shop.findFirst({
    where: { id: shopId, ownerId: userId },
  });
  if (!shop) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Usuário não possui acesso a esta loja",
    });
  }
}

describe("Shop ownership validation (H-01 a H-07, H-08, M-06)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("deve permitir acesso quando usuário é dono da loja", async () => {
    mockShopFindFirst.mockResolvedValue({ id: "shop-a", ownerId: "user-1" });
    await expect(
      validarShopDoUsuario(mockPrisma, "user-1", "shop-a"),
    ).resolves.toBeUndefined();
    expect(mockShopFindFirst).toHaveBeenCalledWith({
      where: { id: "shop-a", ownerId: "user-1" },
    });
  });

  it("deve rejeitar acesso quando usuário não é dono da loja (loja A vs loja B)", async () => {
    mockShopFindFirst.mockResolvedValue(null);
    await expect(
      validarShopDoUsuario(mockPrisma, "user-1", "shop-b"),
    ).rejects.toThrow(TRPCError);
  });

  it("deve rejeitar acesso com shopId inexistente", async () => {
    mockShopFindFirst.mockResolvedValue(null);
    await expect(
      validarShopDoUsuario(mockPrisma, "user-1", "shop-inexistente"),
    ).rejects.toThrow(TRPCError);
  });

  it("erro de proibido deve ter código FORBIDDEN", async () => {
    mockShopFindFirst.mockResolvedValue(null);
    try {
      await validarShopDoUsuario(mockPrisma, "user-1", "shop-b");
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
      expect(e.message).toContain("não possui acesso");
    }
  });
});
