"use client";

import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { usePermissions } from "@/lib/permissions";
import { Sidebar } from "@/components/sidebar";

function AgendamentosContent() {
  const { selectedShopId, hasShops } = useShopContext();
  const { isAdmin } = usePermissions();

  const appointmentsQuery = trpc.appointment.getByPeriod.useQuery(
    {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      shopId: selectedShopId,
    },
    { enabled: hasShops && !!selectedShopId }
  );

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Cadastre uma barbearia para gerenciar agendamentos.
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
                <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gerenciamento de agendamentos da barbearia
                </p>
              </div>
              {isAdmin && (
                <Link
                  href="/agendamentos/novo"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  + Novo Agendamento
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white overflow-hidden shadow sm:rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointmentsQuery.data?.map((apt: any) => (
                  <tr key={apt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(apt.startAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {apt.customer?.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apt.service?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apt.professional?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full ${
                          apt.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : apt.status === "NO_SHOW"
                            ? "bg-yellow-100 text-yellow-800"
                            : apt.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {apt.status === "COMPLETED"
                          ? "Concluído"
                          : apt.status === "CANCELLED"
                          ? "Cancelado"
                          : apt.status === "NO_SHOW"
                          ? "No-show"
                          : apt.status === "CONFIRMED"
                          ? "Confirmado"
                          : "Pendente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/agendamentos/${apt.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!appointmentsQuery.data || appointmentsQuery.data.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgendamentosPage() {
  return <AuthGuard><AgendamentosContent /></AuthGuard>;
}
