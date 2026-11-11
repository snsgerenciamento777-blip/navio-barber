"use client";

import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { usePermissions } from "@/lib/permissions";
import { Sidebar } from "@/components/sidebar";

function AdminDashboardContent() {
  const { shops, selectedShopId, setSelectedShopId, hasShops } = useShopContext();
  const { logout } = usePermissions();

  const summary = trpc.dashboard.getSummary.useQuery(
    { shopId: selectedShopId, date: new Date().toISOString() },
    { enabled: hasShops && !!selectedShopId }
  );

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (!res.ok) {
        console.error("Erro ao fazer logout", res.status);
      }
    } catch (err) {
      console.error("Erro ao fazer logout", err);
    }
    logout();
  };

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Você não possui nenhuma barbearia cadastrada. Cadastre-se como proprietário para começar.
          </p>
          <div className="mt-6">
            <Link
              href="/lojas/novo"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              + Criar Barbearia
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  ⚓ Navio Barber 2.0
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="ml-4 block w-full md:w-auto border rounded px-3 py-2 text-sm bg-white"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="p-6">
          <h2 className="text-3xl font-bold mb-6">Dashboard Administrativo</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Agendamentos Hoje</h3>
              <p className="text-3xl font-bold">
                {summary.data?.cards.appointmentsToday ?? 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Clientes Atendidos</h3>
              <p className="text-3xl font-bold">
                {summary.data?.cards.customersAttended ?? 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Receita do Dia</h3>
              <p className="text-3xl font-bold">
                R$ {summary.data?.cards.revenueToday?.toFixed(2) ?? "0,00"}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Ocupação</h3>
              <p className="text-3xl font-bold">
                {summary.data?.cards.occupancyRate ?? 0}%
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-bold mb-4">Próximos Atendimentos</h3>
            {(summary.data?.upcomingAppointments?.length ?? 0) > 0 ? (
              <ul className="space-y-3">
                {summary.data?.upcomingAppointments.map((a: any) => (
                  <li key={a.id} className="flex justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{a.customer.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {a.service.name} • {a.professional.name}
                      </p>
                    </div>
                    <p className="font-mono text-sm">
                      {new Date(a.startAt).toLocaleTimeString("pt-BR")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum agendamento nas próximas 2 horas.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function BarberDashboardContent() {
  const { selectedShopId, hasShops } = useShopContext();
  const { logout } = usePermissions();

  const summary = trpc.dashboard.getSummary.useQuery(
    { shopId: selectedShopId, date: new Date().toISOString() },
    { enabled: hasShops && !!selectedShopId }
  );

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (!res.ok) {
        console.error("Erro ao fazer logout", res.status);
      }
    } catch (err) {
      console.error("Erro ao fazer logout", err);
    }
    logout();
  };

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Você não possui nenhuma barbearia vinculada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  ⚓ Navio Barber 2.0
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="p-6">
          <h2 className="text-3xl font-bold mb-6">Meus Agendamentos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Agendamentos Hoje</h3>
              <p className="text-3xl font-bold">
                {summary.data?.cards.appointmentsToday ?? 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Clientes Atendidos</h3>
              <p className="text-3xl font-bold">
                {summary.data?.cards.customersAttended ?? 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Ocupação</h3>
              <p className="text-3xl font-bold">
                {summary.data?.cards.occupancyRate ?? 0}%
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-bold mb-4">Próximos Atendimentos</h3>
            {(summary.data?.upcomingAppointments?.length ?? 0) > 0 ? (
              <ul className="space-y-3">
                {summary.data?.upcomingAppointments.map((a: any) => (
                  <li key={a.id} className="flex justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{a.customer.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {a.service.name} • {new Date(a.startAt).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum agendamento nas próximas 2 horas.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { isAdmin } = usePermissions();

  return isAdmin ? <AdminDashboardContent /> : <BarberDashboardContent />;
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
