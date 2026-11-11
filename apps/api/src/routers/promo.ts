import { z } from "zod";
import { PromoKind as PrismaPromoKind } from "@prisma/client";
import { csrfPromoWriteProcedure, promoReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { validarShopAcesso } from "../lib/shop-ownership.ts";
import { promoDiscountCents, type PromoKind } from "../lib/promo.ts";

function prismaKindToLocal(kind: PrismaPromoKind): PromoKind {
  return kind === PrismaPromoKind.PERCENT ? "percent" : "amount";
}

export const promoRouter = {
  list: promoReadProcedure
    .input(z.object({ shopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      return ctx.prisma.promoCode.findMany({
        where: { shopId: input.shopId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: promoReadProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const promo = await ctx.prisma.promoCode.findUnique({ where: { id: input.id } });
    if (!promo) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Código promocional não encontrado" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, promo.shopId, userRole);
    return promo;
  }),

  create: csrfPromoWriteProcedure
    .input(
      z.object({
        shopId: z.string(),
        code: z.string().min(1).max(50),
        kind: z.nativeEnum(PrismaPromoKind),
        value: z.number().positive(),
        active: z.boolean().optional(),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      const existing = await ctx.prisma.promoCode.findFirst({
        where: {
          shopId: input.shopId,
          code: { equals: input.code, mode: "insensitive" },
        },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um código promocional com este nome nesta loja",
        });
      }
      const promo = await ctx.prisma.promoCode.create({
        data: {
          shopId: input.shopId,
          code: input.code,
          kind: input.kind,
          value: input.value,
          active: input.active ?? true,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        },
      });
      return promo;
    }),

  update: csrfPromoWriteProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().min(1).max(50).optional(),
        kind: z.nativeEnum(PrismaPromoKind).optional(),
        value: z.number().positive().optional(),
        active: z.boolean().optional(),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promo = await ctx.prisma.promoCode.findUnique({ where: { id: input.id } });
      if (!promo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Código promocional não encontrado" });
      }
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, promo.shopId, userRole);
      const { id, ...data } = input;
      const updated = await ctx.prisma.promoCode.update({ where: { id }, data });
      return updated;
    }),

  deactivate: csrfPromoWriteProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const promo = await ctx.prisma.promoCode.findUnique({ where: { id: input.id } });
    if (!promo) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Código promocional não encontrado" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, promo.shopId, userRole);
    const updated = await ctx.prisma.promoCode.update({
      where: { id: input.id },
      data: { active: false },
    });
    return updated;
  }),

  redeem: promoReadProcedure
    .input(
      z.object({
        shopId: z.string(),
        code: z.string().min(1),
        priceCents: z.number().nonnegative(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      const now = new Date();
      const promo = await ctx.prisma.promoCode.findFirst({
        where: {
          shopId: input.shopId,
          code: { equals: input.code, mode: "insensitive" },
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      });
      if (!promo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Código promocional inválido ou expirado",
        });
      }
      const discountCents = promoDiscountCents(input.priceCents, prismaKindToLocal(promo.kind), promo.value);
      return {
        promoId: promo.id,
        code: promo.code,
        kind: prismaKindToLocal(promo.kind),
        value: promo.value,
        discountCents,
        finalPriceCents: input.priceCents - discountCents,
      };
    }),
};
