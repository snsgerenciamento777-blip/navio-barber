"use client";

import { useAuth } from "@/lib/auth";

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

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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

export function usePermissions() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const role = (user?.role as Role) ?? null;

  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  };

  const hasRole = (userRole: Role): boolean => {
    return role === userRole;
  };

  const isAdmin = hasRole("ADMIN") || hasRole("SUPER_ADMIN");
  const isBarber = hasRole("BARBER");

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    isAdmin,
    isBarber,
    hasPermission,
    hasRole,
    logout,
  };
}
