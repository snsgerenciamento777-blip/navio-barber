import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

/**
 * Valida que o usuário autenticado é proprietário da loja informada.
 * Função centralizada para evitar duplicação entre routers.
 *
 * @param prisma - Instância do Prisma Client
 * @param userId - ID do usuário autenticado
 * @param shopId - ID da loja a ser validada
 */
export async function validarShopAcesso(
  prisma: PrismaClient,
  userId: string,
  shopId: string,
  userRole?: string | null,
): Promise<void> {
  // SUPER_ADMIN / ADMIN acessa qualquer loja
  if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
    return;
  }

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
