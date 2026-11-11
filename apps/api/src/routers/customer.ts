import { z } from "zod";
import { csrfCustomersWriteProcedure, customersReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { CustomerStatus } from "@prisma/client";
import { validarShopAcesso } from "../lib/shop-ownership.ts";

export const customerRouter = {
  list: customersReadProcedure
    .input(
      z.object({
        shopId: z.string(),
        status: z.nativeEnum(CustomerStatus).optional(),
        search: z.string().max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);

      const isBarber = userRole === "BARBER";

      const whereClause: any = {
        shopId: input.shopId,
        ...(input.status ? { status: input.status } : {}),
        ...(input.search
          ? {
              OR: [
                { fullName: { contains: input.search } },
                { phone: { contains: input.search } },
              ],
            }
          : {}),
      };

      if (isBarber) {
        const professional = await ctx.prisma.professional.findFirst({
          where: { userId: ctx.session!.user.id },
          select: { id: true },
        });
        if (professional) {
          whereClause.appointments = {
            some: {
              professional: {
                id: professional.id,
              },
            },
          };
        } else {
          whereClause.appointments = {
            some: {
              professional: {
                id: "nonexistent",
              },
            },
          };
        }
      }

      return ctx.prisma.customer.findMany({
        where: whereClause,
        orderBy: { fullName: "asc" },
        include: {
          _count: { select: { appointments: true } },
        },
      });
    }),

  getById: customersReadProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          appointments: {
            orderBy: { startAt: "desc" },
            take: 10,
            include: { service: true, professional: true },
          },
        },
      });
      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      }

      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, customer.shopId, userRole);

      return customer;
    }),

  create: csrfCustomersWriteProcedure
    .input(
      z.object({
        shopId: z.string(),
        fullName: z.string().min(1),
        phone: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);

      const existing = await ctx.prisma.customer.findFirst({
        where: { shopId: input.shopId, phone: input.phone },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um cliente com este telefone",
        });
      }

      const customer = await ctx.prisma.customer.create({
        data: {
          shopId: input.shopId,
          fullName: input.fullName,
          phone: input.phone,
          status: CustomerStatus.NEW,
          noShowCount: 0,
        },
      });
      return customer;
    }),

  update: csrfCustomersWriteProcedure
    .input(
      z.object({
        id: z.string(),
        fullName: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        email: z.string().email().optional(),
        status: z.nativeEnum(CustomerStatus).optional(),
        preferences: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const customer = await ctx.prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      }
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, customer.shopId, userRole);

      const updated = await ctx.prisma.customer.update({ where: { id }, data });
      return updated;
    }),

  block: csrfCustomersWriteProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const customer = await ctx.prisma.customer.findUnique({ where: { id: input.id } });
    if (!customer) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
    }

    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, customer.shopId, userRole);

    const updated = await ctx.prisma.customer.update({
      where: { id: input.id },
      data: { status: CustomerStatus.BLOCKED },
    });
    return updated;
  }),

  getHistory: customersReadProcedure
    .input(z.object({ customerId: z.string(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
      });
      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      }

      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, customer.shopId, userRole);

      return ctx.prisma.appointment.findMany({
        where: { customerId: input.customerId },
        include: { service: true, professional: true },
        orderBy: { startAt: "desc" },
        take: input.limit,
      });
    }),
};
