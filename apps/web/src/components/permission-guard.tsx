"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/lib/permissions";

export function PermissionGuard({
  permission,
  children,
  fallback,
  redirectTo,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  const { hasPermission, isLoading } = usePermissions();
  const router = useRouter();
  const denied = !isLoading && !hasPermission(permission as any);

  useEffect(() => {
    if (denied && redirectTo) router.replace(redirectTo);
  }, [denied, redirectTo, router]);

  if (isLoading) return null;
  if (denied) return fallback ?? (redirectTo ? null : <AccessDenied />);
  return <>{children}</>;
}

export function RoleGuard({
  role,
  children,
  fallback,
  redirectTo,
}: {
  role: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  const { hasRole, isLoading } = usePermissions();
  const router = useRouter();
  const roles = Array.isArray(role) ? role : [role];
  const denied = !isLoading && !roles.some((r) => hasRole(r as any));

  useEffect(() => {
    if (denied && redirectTo) router.replace(redirectTo);
  }, [denied, redirectTo, router]);

  if (isLoading) return null;
  if (denied) return fallback ?? (redirectTo ? null : <AccessDenied />);
  return <>{children}</>;
}

export function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
        <p className="mt-2 text-sm text-gray-500">
          Você não possui permissão para acessar esta página.
        </p>
      </div>
    </div>
  );
}
