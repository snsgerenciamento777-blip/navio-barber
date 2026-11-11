import { z } from "zod";
import { dashboardReadProcedure } from "../index.ts";
import { validarShopAcesso } from "../lib/shop-ownership.ts";
import { noShowRate, lastNDays } from "../lib/analytics.ts";

export const dashboardRouter = {
  getSummary: dashboardReadProcedure
    .input(z.object({ shopId: z.string(), date: z.string().datetime().optional() }))
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);

      const targetDate = input.date ? new Date(input.date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const appointmentsToday = await ctx.prisma.appointment.findMany({
        where: {
          shopId: input.shopId,
          startAt: { gte: startOfDay, lte: endOfDay },
        },
        include: { service: true, customer: true },
      });

      const totalToday = appointmentsToday.length;
      const completedToday = appointmentsToday.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      const noShowToday = appointmentsToday.filter(
        (a) => a.status === "NO_SHOW"
      ).length;
      const occupancyRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

      const totalWeek = await ctx.prisma.appointment.count({
        where: {
          shopId: input.shopId,
          startAt: {
            gte: new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            lte: endOfDay,
          },
        },
      });
      const totalCustomers = await ctx.prisma.customer.count({
        where: { shopId: input.shopId },
      });

      const revenueToday = appointmentsToday
        .filter((a) => a.paymentStatus === "PAID")
        .reduce((sum, a) => sum + Number(a.totalValue), 0);

      const isBarber = userRole === "BARBER";

      const serviceCounts: Record<string, number> = {};
      appointmentsToday.forEach((a) => {
        if (a.status === "COMPLETED" && a.service?.name) {
          serviceCounts[a.service.name] = (serviceCounts[a.service.name] || 0) + 1;
        }
      });
      const topServicesToday = Object.entries(serviceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const upcomingAppointments = await ctx.prisma.appointment.findMany({
        where: {
          shopId: input.shopId,
          startAt: { gte: new Date(), lte: twoHoursFromNow },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        include: { customer: true, service: true },
        orderBy: { startAt: "asc" },
      });

      const range = lastNDays(7);
      const appointmentsWeek = await ctx.prisma.appointment.findMany({
        where: {
          shopId: input.shopId,
          startAt: { gte: range.from, lte: range.to },
        },
      });
      const weekNoShowRate = noShowRate({
        no_show: appointmentsWeek.filter((a) => a.status === "NO_SHOW").length,
        total: appointmentsWeek.length,
      });

      return {
        cards: {
          appointmentsToday: totalToday,
          customersAttended: completedToday,
          revenueToday: isBarber ? 0 : revenueToday,
          occupancyRate: Math.round(occupancyRate * 100) / 100,
          totalWeek,
          totalCustomers,
        },
        analytics: {
          noShowRateToday: noShowRate({ no_show: noShowToday, total: totalToday }),
          noShowRateWeek: weekNoShowRate,
          topServicesToday: isBarber ? [] : topServicesToday,
        },
        upcomingAppointments,
        alerts: [],
      };
    }),

  getUpcoming: dashboardReadProcedure
    .input(z.object({ shopId: z.string(), hours: z.number().default(2) }))
    .query(async ({ ctx, input }) => {
      const userRole = (ctx.session!.user as { role?: string }).role;
      await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId, userRole);

      const fromNow = new Date(Date.now() + input.hours * 60 * 60 * 1000);
      return ctx.prisma.appointment.findMany({
        where: {
          shopId: input.shopId,
          startAt: { gte: new Date(), lte: fromNow },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        include: { customer: true, service: true, professional: true },
        orderBy: { startAt: "asc" },
      });
    }),
};
