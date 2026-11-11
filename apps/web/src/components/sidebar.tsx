"use client";

import Link from "next/link";
import { usePermissions } from "@/lib/permissions";

const ADMIN_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/agendamentos", label: "Agendamentos", icon: "Calendar" },
  { href: "/clientes", label: "Clientes", icon: "Users" },
  { href: "/profissionais", label: "Profissionais", icon: "User" },
  { href: "/servicos", label: "Serviços", icon: "Scissors" },
  { href: "/lojas/novo", label: "Configuração", icon: "Settings" },
];

const BARBER_ITEMS = [
  { href: "/", label: "Meus Agendamentos", icon: "Calendar" },
  { href: "/clientes", label: "Meus Clientes", icon: "Users" },
  { href: "/profissionais", label: "Meu Perfil", icon: "User" },
  { href: "/servicos", label: "Serviços", icon: "Scissors" },
];

export function Sidebar({ className = "" }: { className?: string }) {
  const { isAdmin } = usePermissions();
  const items = isAdmin ? ADMIN_ITEMS : BARBER_ITEMS;

  return (
    <aside className={`${className} hidden md:flex md:w-64 flex-col`}>
      <div className="p-6 border-r border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">⚓ Navio Barber</h2>
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
