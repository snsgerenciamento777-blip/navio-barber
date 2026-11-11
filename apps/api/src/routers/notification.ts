import { z } from "zod";
import { csrfNotificationsWriteProcedure, csrfFcmRegisterProcedure, csrfFcmUnregisterProcedure, notificationsReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
export const notificationRouter = {
  list: notificationsReadProcedure
    .input(
      z.object({
        userId: z.string(),
        isRead: z.boolean().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Validar que o usuário só acessa suas próprias notificações
      if (input.userId !== ctx.session!.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuário só pode acessar suas próprias notificações",
        });
      }

      return ctx.prisma.notification.findMany({
        where: {
          userId: input.userId,
          isRead: input.isRead,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  markAsRead: csrfNotificationsWriteProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId !== ctx.session!.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuário só pode marcar suas próprias notificações como lidas",
        });
      }
      const notification = await ctx.prisma.notification.findUnique({
        where: { id: input.id },
      });
      if (!notification) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notificação não encontrada" });
      }
      if (notification.userId !== input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuário não possui acesso a esta notificação",
        });
      }

      return ctx.prisma.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });
    }),

  registerFcmToken: csrfFcmRegisterProcedure
    .input(
      z.object({
        token: z.string().min(1),
        deviceType: z.enum(["ios", "android", "web"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.fCMToken.findUnique({
        where: { token: input.token },
      });
      if (existing) {
        return ctx.prisma.fCMToken.update({
          where: { id: existing.id },
          data: {
            userId: ctx.session!.user.id,
            deviceType: input.deviceType,
            isActive: true,
            updatedAt: new Date(),
          },
        });
      }
      return ctx.prisma.fCMToken.create({
        data: {
          userId: ctx.session!.user.id,
          token: input.token,
          deviceType: input.deviceType,
          isActive: true,
        },
      });
    }),

  unregisterFcmToken: csrfFcmUnregisterProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.fCMToken.updateMany({
        where: {
          userId: ctx.session!.user.id,
          token: input.token,
        },
        data: { isActive: false },
      });
    }),

  createNotification: csrfNotificationsWriteProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(1000),
        typeKey: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Apenas admin pode criar notificações para outros usuários
      const callerRole = (ctx.session!.user as { role?: string }).role;
      if (input.userId !== ctx.session!.user.id && callerRole !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar notificações para outros usuários",
        });
      }

      return ctx.prisma.notification.create({
        data: {
          userId: input.userId,
          title: input.title,
          message: input.message,
          typeKey: input.typeKey,
          isRead: false,
        },
      });
    }),

  getUnreadCount: notificationsReadProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.userId !== ctx.session!.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuário só pode acessar suas próprias notificações",
        });
      }

      return ctx.prisma.notification.count({
        where: { userId: input.userId, isRead: false },
      });
    }),
};
