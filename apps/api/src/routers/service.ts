import { z } from "zod";
import { csrfServicesWriteProcedure, servicesReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { validarShopAcesso } from "../lib/shop-ownership.ts";

const MIN_DURATION_MINUTES = 15;

export const serviceRouter = {
  list: servicesReadProcedure
    .input(z.object({ shopId: z.string().optional(), isActive: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.shopId) {
        const userRole = (ctx.session!.user as { role?: string }).role;
        await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      }

      return ctx.prisma.service.findMany({
        where: {
          shopId: input.shopId,
          isActive: input.isActive,
        },
        orderBy: { name: "asc" },
      });
    }),

  getById: servicesReadProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const service = await ctx.prisma.service.findUnique({ where: { id: input.id } });
    if (!service) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Serviço não encontrado" });
    }

    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, service.shopId, userRole);
    return service;
  }),

  create: csrfServicesWriteProcedure
    .input(
      z.object({
        shopId: z.string(),
        name: z.string().min(1),
        category: z.string().optional(),
        price: z.number().positive(),
        durationMinutes: z.number().min(MIN_DURATION_MINUTES),
        commissionPercent: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      const service = await ctx.prisma.service.create({
        data: {
          shopId: input.shopId,
          name: input.name,
          category: input.category,
          price: input.price,
          durationMinutes: input.durationMinutes,
          commissionPercent: input.commissionPercent,
          isActive: true,
        },
      });
      return service;
    }),

  update: csrfServicesWriteProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        category: z.string().optional(),
        price: z.number().positive().optional(),
        durationMinutes: z.number().min(MIN_DURATION_MINUTES).optional(),
        commissionPercent: z.number().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const service = await ctx.prisma.service.findUnique({ where: { id } });
      if (!service) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Serviço não encontrado" });
      }
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, service.shopId, userRole);

      const updated = await ctx.prisma.service.update({ where: { id }, data });
      return updated;
    }),

  deactivate: csrfServicesWriteProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const service = await ctx.prisma.service.findUnique({ where: { id: input.id } });
    if (!service) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Serviço não encontrado" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, service.shopId, userRole);

    const updated = await ctx.prisma.service.update({
      where: { id: input.id },
      data: { isActive: false },
    });
    return updated;
  }),
};
