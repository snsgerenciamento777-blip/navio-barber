import { z } from "zod";
import { csrfAppointmentsWriteProcedure, csrfAppointmentsFinalizeProcedure, appointmentsReadProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { AppointmentStatus, CustomerStatus } from "@prisma/client";
import { validarShopAcesso } from "../lib/shop-ownership.ts";
import { generateSlots, type WorkingHours, type BookedRange, WEEKDAY_KEYS, parseHHmm } from "../lib/availability.ts";
import { promoDiscountCents } from "../lib/promo.ts";

const MAX_APPOINTMENT_DAYS = 30;
const MIN_APPOINTMENT_HOURS = 2;
const NO_SHOW_MINUTES = 15;

export const appointmentRouter = {
  getAvailableSlots: appointmentsReadProcedure
    .input(
      z.object({
        date: z.string().datetime(),
        professionalId: z.string(),
        serviceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const professional = await ctx.prisma.professional.findUnique({
        where: { id: input.professionalId },
      });
      if (!professional) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profissional não encontrado" });
      }

      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, professional.shopId, userRole);

      const date = new Date(input.date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const service = await ctx.prisma.service.findUnique({
        where: { id: input.serviceId },
      });
      if (!service) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Serviço não encontrado" });
      }

      const professionalFull = await ctx.prisma.professional.findUnique({
        where: { id: input.professionalId },
        select: { workingHours: true },
      });
      const workingHours = professionalFull?.workingHours as WorkingHours | null;

      const existing = await ctx.prisma.appointment.findMany({
        where: {
          professionalId: input.professionalId,
          startAt: { gte: startOfDay, lte: endOfDay },
          status: {
            notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
          },
        },
      });

      const absences = await ctx.prisma.employeeAbsence.findMany({
        where: {
          professionalId: input.professionalId,
          startDate: { lte: endOfDay },
          endDate: { gte: startOfDay },
        },
      });

      const booked: BookedRange[] = existing.map((a) => ({
        start: a.startAt.toISOString(),
        end: a.endAt.toISOString(),
      }));
      const blocked: BookedRange[] = absences.map((a) => ({
        start: a.startDate.toISOString(),
        end: a.endDate.toISOString(),
      }));

      const availableSlots = generateSlots(date, workingHours, service.durationMinutes, booked, blocked);

      return {
        date,
        professionalId: input.professionalId,
        serviceId: input.serviceId,
        availableSlots,
        bookedSlots: existing.map((a) => ({
          id: a.id,
          startAt: a.startAt,
          endAt: a.endAt,
          status: a.status,
        })),
      };
    }),

  getById: appointmentsReadProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          service: true,
          professional: true,
        },
      });
      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agendamento não encontrado" });
      }

      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, appointment.shopId, userRole);
      return appointment;
    }),

  create: csrfAppointmentsWriteProcedure
    .input(
      z.object({
        customerId: z.string(),
        serviceId: z.string(),
        professionalId: z.string(),
        startAt: z.string().datetime(),
        promoCodeId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const startAt = new Date(input.startAt);
      const now = new Date();

      const minStart = new Date(now.getTime() + MIN_APPOINTMENT_HOURS * 60 * 60 * 1000);
      if (startAt < minStart) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Antecedência mínima de ${MIN_APPOINTMENT_HOURS} horas para agendamento`,
        });
      }

      const maxStart = new Date(now.getTime() + MAX_APPOINTMENT_DAYS * 24 * 60 * 60 * 1000);
      if (startAt > maxStart) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Antecedência máxima de ${MAX_APPOINTMENT_DAYS} dias para agendamento`,
        });
      }

      const service = await ctx.prisma.service.findUnique({
        where: { id: input.serviceId },
      });
      if (!service || !service.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Serviço não encontrado ou inativo",
        });
      }

      const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000);

      const conflict = await ctx.prisma.appointment.findFirst({
        where: {
          professionalId: input.professionalId,
          status: {
            notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
          },
          OR: [
            {
              startAt: { lt: endAt },
              endAt: { gt: startAt },
            },
          ],
        },
      });

      if (conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Horário já ocupado por outro agendamento",
        });
      }

      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
      });
      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      }

      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, customer.shopId, userRole);

      const professional = await ctx.prisma.professional.findUnique({
        where: { id: input.professionalId },
      });
      if (!professional) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profissional não encontrado" });
      }
      if (professional.shopId !== customer.shopId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "O profissional não pertence a esta barbearia",
        });
      }

      const professionalFull = await ctx.prisma.professional.findUnique({
        where: { id: input.professionalId },
        select: { workingHours: true },
      });
      const workingHours = professionalFull?.workingHours as WorkingHours | null;
      const startAtDay = new Date(startAt);
      startAtDay.setHours(0, 0, 0, 0);
      const weekdayKey = WEEKDAY_KEYS[startAtDay.getDay()] as string;
      const dayHours = workingHours?.[weekdayKey];
      if (!dayHours) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "O profissional não trabalha neste dia da semana",
        });
      }
      const [open, close] = dayHours;
      const openAt = parseHHmm(startAtDay, open);
      const closeAt = parseHHmm(startAtDay, close);
      if (startAt < openAt || endAt > closeAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Horário fora do expediente do profissional",
        });
      }

      if (customer.status === CustomerStatus.BLOCKED || customer.noShowCount >= 3) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cliente bloqueado devido a no-shows repetidos",
        });
      }

      let discountCents = 0;
      if (input.promoCodeId) {
        const promo = await ctx.prisma.promoCode.findUnique({
          where: { id: input.promoCodeId },
        });
        if (!promo || !promo.active || promo.shopId !== customer.shopId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código promocional inválido para esta loja",
          });
        }
        if (promo.expiresAt && promo.expiresAt < now) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código promocional expirado",
          });
        }
        const priceCents = Number(service.price) * 100;
        discountCents = promoDiscountCents(priceCents, promo.kind === "PERCENT" ? "percent" : "amount", promo.value);
      }

      const totalValue = Number(service.price) - discountCents / 100;

      const appointment = await ctx.prisma.appointment.create({
        data: {
          shopId: customer.shopId,
          professionalId: input.professionalId,
          serviceId: input.serviceId,
          customerId: input.customerId,
          startAt,
          endAt,
          status: AppointmentStatus.PENDING,
          totalValue,
          paymentStatus: "PENDING",
          ...(input.promoCodeId
            ? {
                promoCodeId: input.promoCodeId,
                discountCents,
              }
            : {}),
        },
      });

      return { appointment };
    }),

  updateStatus: csrfAppointmentsWriteProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(AppointmentStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
      });
      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agendamento não encontrado" });
      }

      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, appointment.shopId, userRole);

      const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
        [AppointmentStatus.PENDING]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
        [AppointmentStatus.CONFIRMED]: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED],
        [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
        [AppointmentStatus.COMPLETED]: [],
        [AppointmentStatus.CANCELLED]: [],
        [AppointmentStatus.NO_SHOW]: [],
      };
      const validNext = allowedTransitions[appointment.status] ?? [];
      if (!validNext.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Transição inválida: ${appointment.status} → ${input.status}`,
        });
      }

      const updated = await ctx.prisma.appointment.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      await ctx.prisma.appointmentAuditLog.create({
        data: {
          appointmentId: input.id,
          oldStatus: appointment.status,
          newStatus: input.status,
          reason: "Alteração manual de status",
          source: "MANUAL",
          changedBy: ctx.session?.user.id,
        },
      });

      return { appointment: updated };
    }),

  cancel: csrfAppointmentsWriteProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
      });
      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agendamento não encontrado" });
      }

      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, appointment.shopId, userRole);

      if (
        appointment.status !== AppointmentStatus.PENDING &&
        appointment.status !== AppointmentStatus.CONFIRMED
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Só é possível cancelar agendamentos agendados ou confirmados",
        });
      }

      const updated = await ctx.prisma.appointment.update({
        where: { id: input.id },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelReason: input.reason,
        },
      });

      await ctx.prisma.appointmentAuditLog.create({
        data: {
          appointmentId: input.id,
          oldStatus: appointment.status,
          newStatus: AppointmentStatus.CANCELLED,
          reason: input.reason || "Cancelamento manual",
          source: "MANUAL",
          changedBy: ctx.session?.user.id,
        },
      });

      return { appointment: updated };
    }),

  reschedule: csrfAppointmentsWriteProcedure
    .input(
      z.object({
        id: z.string(),
        newStartAt: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
      });
      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agendamento não encontrado" });
      }

      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, appointment.shopId, userRole);

      const service = await ctx.prisma.service.findUnique({
        where: { id: appointment.serviceId },
      });
      if (!service) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Serviço não encontrado" });
      }
      const endAt = new Date(input.newStartAt);
      endAt.setMinutes(endAt.getMinutes() + service.durationMinutes);

      const conflict = await ctx.prisma.appointment.findFirst({
        where: {
          professionalId: appointment.professionalId,
          id: { not: appointment.id },
          status: {
            notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
          },
          OR: [
            {
              startAt: { lt: endAt },
              endAt: { gt: new Date(input.newStartAt) },
            },
          ],
        },
      });

      if (conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Novo horário já ocupado",
        });
      }

      const updated = await ctx.prisma.appointment.update({
        where: { id: input.id },
        data: {
          startAt: new Date(input.newStartAt),
          endAt,
        },
      });

      await ctx.prisma.appointmentAuditLog.create({
        data: {
          appointmentId: input.id,
          oldStatus: appointment.status,
          newStatus: appointment.status,
          reason: "Remarcação de horário",
          source: "MANUAL",
          changedBy: ctx.session?.user.id,
        },
      });

      return { appointment: updated };
    }),

  getByPeriod: appointmentsReadProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        shopId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);

      const isBarber = userRole === "BARBER";

      let whereClause: {
        shopId: string;
        startAt: {
          gte: Date;
          lte: Date;
        };
        professionalId?: string;
      } = {
        shopId: input.shopId,
        startAt: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
      };

      if (isBarber) {
        const professional = await ctx.prisma.professional.findFirst({
          where: { userId: ctx.session!.user.id },
          select: { id: true },
        });
        if (professional) {
          whereClause.professionalId = professional.id;
        } else {
          whereClause.professionalId = "nonexistent";
        }
      }

      return ctx.prisma.appointment.findMany({
        where: whereClause,
        include: { customer: true, service: true, professional: true },
        orderBy: { startAt: "asc" },
      });
    }),

  finalizePrevious: csrfAppointmentsFinalizeProcedure
    .input(z.object({ shopId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);
      const now = new Date();
      const updated = await ctx.prisma.appointment.updateMany({
        where: {
          shopId: input.shopId,
          status: AppointmentStatus.PENDING,
          startAt: { lt: now },
        },
        data: { status: AppointmentStatus.COMPLETED },
      });

      return { finalizedCount: updated.count };
    }),

  getNoShowCandidates: appointmentsReadProcedure
    .input(z.object({ shopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);

      const now = new Date();
      const noShowThreshold = new Date(now.getTime() - NO_SHOW_MINUTES * 60 * 1000);

      const isBarber = userRole === "BARBER";

      let whereClause: {
        shopId: string;
        status: {
          in: AppointmentStatus[];
        };
        startAt: {
          lt: Date;
        };
        professionalId?: string;
      } = {
        shopId: input.shopId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        startAt: { lt: noShowThreshold },
      };

      if (isBarber) {
        const professional = await ctx.prisma.professional.findFirst({
          where: { userId: ctx.session!.user.id },
          select: { id: true },
        });
        if (professional) {
          whereClause.professionalId = professional.id;
        } else {
          whereClause.professionalId = "nonexistent";
        }
      }

      return ctx.prisma.appointment.findMany({
        where: whereClause,
      });
    }),
};
