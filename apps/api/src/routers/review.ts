import { z } from "zod";
import { csrfReviewWriteProcedure, reviewReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { validarShopAcesso } from "../lib/shop-ownership.ts";

export const reviewRouter = {
  list: reviewReadProcedure
    .input(
      z.object({
        shopId: z.string(),
        professionalId: z.string().optional(),
        serviceId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      return ctx.prisma.review.findMany({
        where: {
          shopId: input.shopId,
          ...(input.professionalId ? { professionalId: input.professionalId } : {}),
          ...(input.serviceId ? { serviceId: input.serviceId } : {}),
        },
        include: { customer: true, service: true, professional: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: reviewReadProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const review = await ctx.prisma.review.findUnique({ where: { id: input.id } });
    if (!review) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, review.shopId, userRole);
    return review;
  }),

  create: csrfReviewWriteProcedure
    .input(
      z.object({
        shopId: z.string(),
        customerId: z.string(),
        professionalId: z.string().optional(),
        serviceId: z.string().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      if (ctx.session!.user.id !== input.customerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Somente o próprio cliente pode criar uma avaliação",
        });
      }
      const review = await ctx.prisma.review.create({
        data: {
          shopId: input.shopId,
          customerId: input.customerId,
          professionalId: input.professionalId,
          serviceId: input.serviceId,
          rating: input.rating,
          comment: input.comment,
        },
      });
      return review;
    }),

  update: csrfReviewWriteProcedure
    .input(
      z.object({
        id: z.string(),
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const review = await ctx.prisma.review.findUnique({ where: { id } });
      if (!review) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada" });
      }
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, review.shopId, userRole);
      if (ctx.session!.user.id !== review.customerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Somente o próprio cliente pode editar sua avaliação",
        });
      }
      const updated = await ctx.prisma.review.update({ where: { id }, data });
      return updated;
    }),

  delete: csrfReviewWriteProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const review = await ctx.prisma.review.findUnique({ where: { id: input.id } });
    if (!review) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada" });
    }
    const userRole = (ctx.session!.user as { role?: string }).role;
    await validarShopAcesso(ctx.prisma, ctx.session!.user.id, review.shopId, userRole);
    if (ctx.session!.user.id !== review.customerId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Somente o próprio cliente pode deletar sua avaliação",
      });
    }
    await ctx.prisma.review.delete({ where: { id: input.id } });
    return { deleted: true };
  }),
};
