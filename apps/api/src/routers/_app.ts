import { createTRPCRouter } from "../index.ts";
import { authRouter } from "./auth.ts";
import { appointmentRouter } from "./appointment.ts";
import { serviceRouter } from "./service.ts";
import { customerRouter } from "./customer.ts";
import { dashboardRouter } from "./dashboard.ts";
import { shopRouter } from "./shop.ts";
import { notificationRouter } from "./notification.ts";
import { promoRouter } from "./promo.ts";
import { waitlistRouter } from "./waitlist.ts";
import { reviewRouter } from "./review.ts";
import { portfolioRouter } from "./portfolio.ts";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  appointment: appointmentRouter,
  service: serviceRouter,
  customer: customerRouter,
  dashboard: dashboardRouter,
  shop: shopRouter,
  notification: notificationRouter,
  promo: promoRouter,
  waitlist: waitlistRouter,
  review: reviewRouter,
  portfolio: portfolioRouter,
});

export type AppRouter = typeof appRouter;