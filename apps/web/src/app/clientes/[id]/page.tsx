"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const clientQuery = trpc.customer.getById.useQuery({ id }, { enabled: !!id });
  const historyQuery = trpc.customer.getHistory.useQuery(
    { customerId: id, limit: 10 },
    { enabled: !!id }
  );

  if (!id) {
    notFound();
  }

  if (clientQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clientQuery.data) {
    notFound();
  }

  const client = clientQuery.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.fullName}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Histórico de atendimentos
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/clientes"
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
              >
                Voltar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 uppercase">Nome</h2>
            <p className="mt-1 text-lg font-medium text-gray-900">{client.fullName}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 uppercase">Telefone</h2>
            <p className="mt-1 text-lg font-medium text-gray-900">{client.phone}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 uppercase">E-mail</h2>
            <p className="mt-1 text-lg font-medium text-gray-900">
              {client.email ?? "Não informado"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-bold mb-4">Atendimentos</h2>
          {historyQuery.isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : historyQuery.data?.length === 0 ? (
            <p className="text-gray-500">Nenhum atendimento registrado.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyQuery.data?.map((apt: any) => (
                  <tr key={apt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(apt.startAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {apt.service?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apt.professional?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          apt.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : apt.status === "NO_SHOW"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {apt.status === "COMPLETED"
                          ? "Concluído"
                          : apt.status === "CANCELLED"
                          ? "Cancelado"
                          : apt.status === "NO_SHOW"
                          ? "No-show"
                          : "Pendente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      R$ {apt.totalValue?.toFixed(2) ?? "0,00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
