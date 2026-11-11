import { z } from "zod";
import { csrfShopsWriteProcedure, csrfProfessionalsWriteProcedure, shopsReadProcedure, professionalsReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { validarShopAcesso } from "../lib/shop-ownership.ts";

export const shopRouter = {
  getSettings: shopsReadProcedure.input(z.object({ shopId: z.string() })).query(async ({ ctx, input }) => {
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
    const shop = await ctx.prisma.shop.findUnique({
      where: { id: input.shopId },
      include: { professionals: true, services: true },
    });
    if (!shop) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Barbearia não encontrada" });
    }
    return shop;
  }),

  updateSettings: csrfShopsWriteProcedure
    .input(
      z.object({
        shopId: z.string(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        category: z.string().optional(),
        logoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      const { shopId, ...data } = input;
      const shop = await ctx.prisma.shop.update({ where: { id: shopId }, data });
      return shop;
    }),

  getProfessionals: professionalsReadProcedure
    .input(z.object({ shopId: z.string(), isActive: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      return ctx.prisma.professional.findMany({
        where: { shopId: input.shopId, isActive: input.isActive },
        orderBy: { name: "asc" },
      });
    }),

  createProfessional: csrfProfessionalsWriteProcedure
    .input(
      z.object({
        shopId: z.string(),
        name: z.string().min(1),
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      const professional = await ctx.prisma.professional.create({
        data: {
          shopId: input.shopId,
          name: input.name,
          userId: input.userId,
          isActive: true,
        },
      });
      return professional;
    }),

  updateProfessional: csrfProfessionalsWriteProcedure
    .input(
      z.object({
        professionalId: z.string(),
        shopId: z.string(),
        name: z.string().min(1).optional(),
        userId: z.string().optional(),
        isActive: z.boolean().optional(),
        workingHours: z.record(z.string(), z.object({ open: z.string(), close: z.string() }).nullable().optional()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);

      const professional = await ctx.prisma.professional.findUnique({
        where: { id: input.professionalId },
      });
      if (!professional) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profissional não encontrado" });
      }
      if (professional.shopId !== input.shopId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Profissional não pertence a esta barbearia" });
      }

      const data: {
        name?: string;
        userId?: string | null;
        isActive?: boolean;
        workingHours?: Record<string, [string, string] | null>;
      } = {};

      if (input.name !== undefined) data.name = input.name;
      if (input.userId !== undefined) data.userId = input.userId;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (input.workingHours !== undefined) {
        data.workingHours = Object.fromEntries(
          Object.entries(input.workingHours).map(([day, val]) => [
            day,
            val ? [val.open, val.close] : null,
          ])
        );
      }

      const updated = await ctx.prisma.professional.update({
        where: { id: input.professionalId },
        data,
      });
      return updated;
    }),

  create: csrfShopsWriteProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        category: z.string().optional(),
        logoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id;
      const shop = await ctx.prisma.shop.create({
        data: {
          name: input.name,
          address: input.address,
          phone: input.phone,
          email: input.email,
          category: input.category,
          logoUrl: input.logoUrl,
          ownerId: userId,
        },
      });
      return shop;
    }),

  getSetupStatus: shopsReadProcedure.input(z.object({ shopId: z.string() })).query(async ({ ctx, input }) => {
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
    const shop = await ctx.prisma.shop.findUnique({
      where: { id: input.shopId },
      include: {
        professionals: true,
        services: { where: { isActive: true } },
      },
    });
    if (!shop) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Barbearia não encontrada" });
    }

    const steps = [
      { id: "account", name: "Conta", completed: !!shop.ownerId },
      { id: "company", name: "Empresa", completed: !!shop.name && !!shop.address },
      { id: "branch", name: "Filial", completed: !!shop.phone },
      { id: "category", name: "Categoria", completed: !!shop.category },
      { id: "service", name: "Serviço", completed: shop.services.length > 0 },
      { id: "logo", name: "Logo", completed: !!shop.logoUrl },
    ];

    const completedSteps = steps.filter((s) => s.completed).length;
    const totalSteps = steps.length;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    const schedulingReady = completedSteps === totalSteps;

    return {
      progress,
      completedSteps,
      totalSteps,
      completed: schedulingReady,
      schedulingReady,
      steps,
    };
  }),

  getUserShops: shopsReadProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user.id;
    const userRole = (ctx.session!.user as { role?: string }).role;

    const ownedShops = await ctx.prisma.shop.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true },
    });

    let professionalShops: { id: string; name: string }[] = [];
    if (userRole === "BARBER" || userRole === "ADMIN") {
      const professionals = await ctx.prisma.professional.findMany({
        where: { userId },
        select: { shop: { select: { id: true, name: true } } },
      });
      professionalShops = professionals.map((p) => p.shop);
    }

    const byId = new Map<string, { id: string; name: string }>();
    for (const s of [...ownedShops, ...professionalShops]) {
      if (!byId.has(s.id)) byId.set(s.id, s);
    }

    return { shops: Array.from(byId.values()) };
  }),
};
