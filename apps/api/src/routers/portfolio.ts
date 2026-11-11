import { z } from "zod";
import { csrfPortfolioWriteProcedure, portfolioReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { validarShopAcesso } from "../lib/shop-ownership.ts";

export const portfolioRouter = {
  list: portfolioReadProcedure
    .input(
      z.object({
        shopId: z.string(),
        professionalId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      return ctx.prisma.portfolio.findMany({
        where: {
          shopId: input.shopId,
          ...(input.professionalId ? { professionalId: input.professionalId } : {}),
        },
        include: { professional: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: portfolioReadProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const item = await ctx.prisma.portfolio.findUnique({ where: { id: input.id } });
    if (!item) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Item do portfólio não encontrado" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, item.shopId, userRole);
    return item;
  }),

  create: csrfPortfolioWriteProcedure
    .input(
      z.object({
        shopId: z.string(),
        professionalId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      const item = await ctx.prisma.portfolio.create({
        data: {
          shopId: input.shopId,
          professionalId: input.professionalId,
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
        },
      });
      return item;
    }),

  update: csrfPortfolioWriteProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const item = await ctx.prisma.portfolio.findUnique({ where: { id } });
      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item do portfólio não encontrado" });
      }
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, item.shopId, userRole);
      const updated = await ctx.prisma.portfolio.update({ where: { id }, data });
      return updated;
    }),

  delete: csrfPortfolioWriteProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.portfolio.findUnique({ where: { id: input.id } });
    if (!item) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Item do portfólio não encontrado" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, item.shopId, userRole);
    await ctx.prisma.portfolio.delete({ where: { id: input.id } });
    return { deleted: true };
  }),
};
