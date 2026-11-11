import { TRPCError } from "@trpc/server";
import type { Session } from "@navio-barber/auth";

export type Role = "SUPER_ADMIN" | "ADMIN" | "BARBER";

export type Permission =
  | "users:read"
  | "users:write"
  | "users:delete"
  | "shops:read"
  | "shops:write"
  | "shops:delete"
  | "professionals:read"
  | "professionals:write"
  | "professionals:delete"
  | "services:read"
  | "services:write"
  | "services:delete"
  | "customers:read"
  | "customers:write"
  | "customers:delete"
  | "appointments:read"
  | "appointments:write"
  | "appointments:delete"
  | "appointments:finalize"
  | "notifications:read"
  | "notifications:write"
  | "notifications:delete"
  | "fcm:register"
  | "fcm:unregister"
  | "dashboard:read"
  | "audit:read"
  | "promo:read"
  | "promo:write"
  | "waitlist:read"
  | "waitlist:write"
  | "review:read"
  | "review:write"
  | "portfolio:read"
  | "portfolio:write"
  | "super_admin:read"
  | "super_admin:write";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "users:read", "users:write", "users:delete",
    "shops:read", "shops:write", "shops:delete",
    "professionals:read", "professionals:write", "professionals:delete",
    "services:read", "services:write", "services:delete",
    "customers:read", "customers:write", "customers:delete",
    "appointments:read", "appointments:write", "appointments:delete", "appointments:finalize",
    "notifications:read", "notifications:write", "notifications:delete",
    "fcm:register", "fcm:unregister",
    "dashboard:read",
    "audit:read",
    "promo:read", "promo:write",
    "waitlist:read", "waitlist:write",
    "review:read", "review:write",
    "portfolio:read", "portfolio:write",
    "super_admin:read", "super_admin:write",
  ],
  ADMIN: [
    "users:read", "users:write", "users:delete",
    "shops:read", "shops:write", "shops:delete",
    "professionals:read", "professionals:write", "professionals:delete",
    "services:read", "services:write", "services:delete",
    "customers:read", "customers:write", "customers:delete",
    "appointments:read", "appointments:write", "appointments:delete", "appointments:finalize",
    "notifications:read", "notifications:write", "notifications:delete",
    "fcm:register", "fcm:unregister",
    "dashboard:read",
    "audit:read",
    "promo:read",
    "promo:write",
    "waitlist:read",
    "waitlist:write",
    "review:read",
    "review:write",
    "portfolio:read",
    "portfolio:write",
  ],
  BARBER: [
    "users:read",
    "shops:read",
    "professionals:read",
    "services:read",
    "customers:read", "customers:write",
    "appointments:read", "appointments:write", "appointments:finalize",
    "notifications:read", "notifications:write",
    "fcm:register", "fcm:unregister",
    "dashboard:read",
    "promo:read",
    "waitlist:read",
    "waitlist:write",
    "review:read",
    "portfolio:read",
  ],
};

export function hasRole(session: Session | null, role: Role): boolean {
  if (!session?.user) return false;
  return (session.user as { role?: Role }).role === role;
}

export function hasPermission(session: Session | null, permission: Permission): boolean {
  if (!session?.user) return false;
  const userRole = (session.user as { role?: Role }).role;
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole as Role]?.includes(permission) ?? false;
}

export function requireRole(role: Role) {
  return (session: Session | null) => {
    if (!hasRole(session, role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Acesso negado: requer papel ${role}`,
      });
    }
  };
}

export function requirePermission(permission: Permission) {
  return (session: Session | null) => {
    if (!hasPermission(session, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Acesso negado: requer permissão ${permission}`,
      });
    }
  };
}

export function requireShopOwnershipOrAdmin(
  session: Session | null,
  shopOwnerId: string | undefined,
) {
  if (!session?.user) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Não autorizado" });
  }
  const user = session.user as { id: string; role?: Role };
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";
  const isOwner = shopOwnerId && user.id === shopOwnerId;
  if (!isSuperAdmin && !isAdmin && !isOwner) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado: requer ser proprietário da loja, administrador ou super administrador",
    });
  }
}
