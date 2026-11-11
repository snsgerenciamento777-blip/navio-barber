import { initTRPC } from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import type { Session } from "@navio-barber/auth";
import type { AppRouter } from "./routers/_app.ts";
import { TRPCError } from "@trpc/server";
import {
  hasPermission,
  hasRole,
  requirePermission,
  requireRole,
  requireShopOwnershipOrAdmin,
  type Permission,
  type Role,
} from "./lib/rbac.ts";
import { rateLimit, AUTH_MAX } from "./lib/rate-limit.ts";

export interface CreateContextOptions {
  prisma: PrismaClient;
  session: Session | null;
  headers: Headers | null;
}

export async function createContext(opts: CreateContextOptions) {
  return {
    prisma: opts.prisma,
    session: opts.session,
    headers: opts.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
export type { AppRouter };

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new Error("Não autorizado");
  }
  return next({
    ctx: {
      session: ctx.session,
      headers: ctx.headers,
    },
  });
});

// CSRF protection: valida token sincronizador via header X-CSRF-Token em mutations
export const csrfProtectedProcedure = t.procedure.use(({ ctx, next, type }) => {
  if (type === "mutation") {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Não autorizado",
      });
    }

    const csrfToken = ctx.headers?.get("x-csrf-token");
    const sessionToken = (ctx.session.user as { csrfToken?: string })?.csrfToken;

    if (!csrfToken) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "CSRF token ausente no cabeçalho X-CSRF-Token",
      });
    }

    if (!sessionToken) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "CSRF token da sessão não encontrado. Faça login novamente.",
      });
    }

    if (csrfToken !== sessionToken) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "CSRF token inválido",
      });
    }
  }
  return next({
    ctx,
  });
});

// CSRF + Admin: valida CSRF token e papel de admin em mutations (usa RBAC)
export const csrfAdminProcedure = csrfProtectedProcedure.use(({ ctx, next }) => {
  requireRole("ADMIN")(ctx.session);
  return next();
});

// CSRF + Barber: valida CSRF token e papel de barbeiro em mutations
export const csrfBarberProcedure = csrfProtectedProcedure.use(({ ctx, next }) => {
  requireRole("BARBER")(ctx.session);
  return next();
});

// CSRF + Permission: valida CSRF token e permiss\u00e3o granular em mutations
export function csrfPermissionProcedure(permission: Permission) {
  return csrfProtectedProcedure.use(({ ctx, next }) => {
    requirePermission(permission)(ctx.session);
    return next();
  });
}

// RBAC: procedures parametrizadas por papel e permissão
export function roleProcedure(role: Role) {
  return protectedProcedure.use(({ ctx, next }) => {
    requireRole(role)(ctx.session);
    return next();
  });
}

export function permissionProcedure(permission: Permission) {
  return protectedProcedure.use(({ ctx, next }) => {
    requirePermission(permission)(ctx.session);
    return next();
  });
}

// Aliases de conveniência para roles existentes
export const adminProcedure = roleProcedure("ADMIN");
export const barberProcedure = roleProcedure("BARBER");

// Aliases de conveniência para permissões comuns
export const shopsWriteProcedure = permissionProcedure("shops:write");
export const shopsReadProcedure = permissionProcedure("shops:read");
export const professionalsWriteProcedure = permissionProcedure("professionals:write");
export const professionalsReadProcedure = permissionProcedure("professionals:read");
export const updateProfessionalProcedure = permissionProcedure("professionals:write");
export const servicesWriteProcedure = permissionProcedure("services:write");
export const servicesReadProcedure = permissionProcedure("services:read");
export const customersWriteProcedure = permissionProcedure("customers:write");
export const customersReadProcedure = permissionProcedure("customers:read");
export const appointmentsWriteProcedure = permissionProcedure("appointments:write");
export const appointmentsReadProcedure = permissionProcedure("appointments:read");
export const appointmentsFinalizeProcedure = permissionProcedure("appointments:finalize");
export const notificationsWriteProcedure = permissionProcedure("notifications:write");
export const notificationsReadProcedure = permissionProcedure("notifications:read");
export const fcmRegisterProcedure = permissionProcedure("fcm:register");
export const fcmUnregisterProcedure = permissionProcedure("fcm:unregister");
export const dashboardReadProcedure = permissionProcedure("dashboard:read");
export const auditReadProcedure = permissionProcedure("audit:read");
export const promoReadProcedure = permissionProcedure("promo:read");
export const promoWriteProcedure = permissionProcedure("promo:write");
export const waitlistReadProcedure = permissionProcedure("waitlist:read");
export const waitlistWriteProcedure = permissionProcedure("waitlist:write");
export const reviewReadProcedure = permissionProcedure("review:read");
export const reviewWriteProcedure = permissionProcedure("review:write");
export const portfolioReadProcedure = permissionProcedure("portfolio:read");
export const portfolioWriteProcedure = permissionProcedure("portfolio:write");

// Aliases de conveni\u00eancia para CSRF + permiss\u00f5es comuns (mutations)
export const csrfShopsWriteProcedure = csrfPermissionProcedure("shops:write");
export const csrfShopsReadProcedure = csrfPermissionProcedure("shops:read");
export const csrfProfessionalsWriteProcedure = csrfPermissionProcedure("professionals:write");
export const csrfProfessionalsReadProcedure = csrfPermissionProcedure("professionals:read");
export const csrfServicesWriteProcedure = csrfPermissionProcedure("services:write");
export const csrfServicesReadProcedure = csrfPermissionProcedure("services:read");
export const csrfCustomersWriteProcedure = csrfPermissionProcedure("customers:write");
export const csrfCustomersReadProcedure = csrfPermissionProcedure("customers:read");
export const csrfAppointmentsWriteProcedure = csrfPermissionProcedure("appointments:write");
export const csrfAppointmentsReadProcedure = csrfPermissionProcedure("appointments:read");
export const csrfAppointmentsFinalizeProcedure = csrfPermissionProcedure("appointments:finalize");
export const csrfNotificationsWriteProcedure = csrfPermissionProcedure("notifications:write");
export const csrfNotificationsReadProcedure = csrfPermissionProcedure("notifications:read");
export const csrfFcmRegisterProcedure = csrfPermissionProcedure("fcm:register");
export const csrfFcmUnregisterProcedure = csrfPermissionProcedure("fcm:unregister");
export const csrfDashboardReadProcedure = csrfPermissionProcedure("dashboard:read");
export const csrfAuditReadProcedure = csrfPermissionProcedure("audit:read");
export const csrfPromoReadProcedure = csrfPermissionProcedure("promo:read");
export const csrfPromoWriteProcedure = csrfPermissionProcedure("promo:write");
export const csrfWaitlistReadProcedure = csrfPermissionProcedure("waitlist:read");
export const csrfWaitlistWriteProcedure = csrfPermissionProcedure("waitlist:write");
export const csrfReviewReadProcedure = csrfPermissionProcedure("review:read");
export const csrfReviewWriteProcedure = csrfPermissionProcedure("review:write");
export const csrfPortfolioReadProcedure = csrfPermissionProcedure("portfolio:read");
export const csrfPortfolioWriteProcedure = csrfPermissionProcedure("portfolio:write");

// Rate limiting procedures
export const publicRateLimitProcedure = publicProcedure.use(rateLimit({ max: 100 }));
export const rateLimitProcedure = protectedProcedure.use(
  rateLimit({
    max: 100,
    key: (ctx) => `user:${ctx.session?.user.id ?? getClientIp(ctx)}`,
  })
);
export const authRateLimitProcedure = publicProcedure.use(
  rateLimit({ max: AUTH_MAX, windowMs: 60 * 1000 })
);

function getClientIp(ctx: Context): string {
  const forwarded = ctx.headers?.get("x-forwarded-for");
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = ctx.headers?.get("x-real-ip");
  if (typeof realIp === "string") return realIp;
  return "unknown";
}

export {
  hasRole,
  hasPermission,
  requireRole,
  requirePermission,
  requireShopOwnershipOrAdmin,
  type Role,
  type Permission,
};
