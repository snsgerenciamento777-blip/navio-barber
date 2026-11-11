import { z } from "zod";
import { csrfWaitlistWriteProcedure, waitlistReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { WaitlistStatus } from "@prisma/client";
import { validarShopAcesso } from "../lib/shop-ownership.ts";

export const waitlistRouter = {
  list: waitlistReadProcedure
    .input(
      z.object({
        shopId: z.string(),
        professionalId: z.string().optional(),
        status: z.nativeEnum(WaitlistStatus).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      return ctx.prisma.waitlist.findMany({
        where: {
          shopId: input.shopId,
          ...(input.professionalId ? { professionalId: input.professionalId } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
        include: { customer: true, service: true, professional: true },
        orderBy: { createdAt: "asc" },
      });
    }),

  getById: waitlistReadProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const entry = await ctx.prisma.waitlist.findUnique({ where: { id: input.id } });
    if (!entry) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Entrada da lista de espera não encontrada" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, entry.shopId, userRole);
    if (
      ctx.session!.user.id !== entry.customerId &&
      ctx.session!.user.id !== entry.professionalId
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Acesso negado a esta entrada da lista de espera",
      });
    }
    return entry;
  }),

  create: csrfWaitlistWriteProcedure
    .input(
      z.object({
        shopId: z.string(),
        customerId: z.string(),
        professionalId: z.string(),
        serviceId: z.string(),
        desiredDate: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      if (ctx.session!.user.id !== input.customerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Somente o próprio cliente pode se inscrever na lista de espera",
        });
      }
      const existing = await ctx.prisma.waitlist.findFirst({
        where: {
          shopId: input.shopId,
          customerId: input.customerId,
          professionalId: input.professionalId,
          desiredDate: input.desiredDate,
          status: { not: WaitlistStatus.CANCELLED },
        },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe uma entrada na lista de espera para este profissional/data",
        });
      }
      const entry = await ctx.prisma.waitlist.create({
        data: {
          shopId: input.shopId,
          customerId: input.customerId,
          professionalId: input.professionalId,
          serviceId: input.serviceId,
          desiredDate: new Date(input.desiredDate),
          status: WaitlistStatus.WAITING,
        },
      });
      return entry;
    }),

  updateStatus: csrfWaitlistWriteProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(WaitlistStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.waitlist.findUnique({ where: { id: input.id } });
      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Entrada da lista de espera não encontrada" });
      }
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, entry.shopId, userRole);
      const isOwner = ctx.session!.user.id === entry.customerId;
      const isProfessional = ctx.session!.user.id === entry.professionalId;
      if (!isOwner && !isProfessional) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Acesso negado para alterar esta entrada",
        });
      }
      if (isOwner && input.status !== WaitlistStatus.CANCELLED) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "O cliente só pode cancelar sua própria entrada",
        });
      }
      const updated = await ctx.prisma.waitlist.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      return updated;
    }),

  delete: csrfWaitlistWriteProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const entry = await ctx.prisma.waitlist.findUnique({ where: { id: input.id } });
    if (!entry) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Entrada da lista de espera não encontrada" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, entry.shopId, userRole);
    if (ctx.session!.user.id !== entry.customerId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Somente o próprio cliente pode remover sua entrada",
      });
    }
    await ctx.prisma.waitlist.delete({ where: { id: input.id } });
    return { deleted: true };
  }),
};
