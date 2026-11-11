"use client";

import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { usePermissions } from "@/lib/permissions";
import { Sidebar } from "@/components/sidebar";

function ProfissionaisContent() {
  const { selectedShopId, hasShops } = useShopContext();
  const { isAdmin } = usePermissions();

  const professionalsQuery = trpc.shop.getProfessionals.useQuery(
    { shopId: selectedShopId, isActive: true },
    { enabled: hasShops && !!selectedShopId }
  );

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Cadastre uma barbearia para gerenciar profissionais.
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
                <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gerenciamento de profissionais da barbearia
                </p>
              </div>
              {isAdmin && (
                <Link
                  href="/profissionais/novo"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  + Novo Profissional
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
                    Nome
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
                {professionalsQuery.data?.map((prof: any) => (
                  <tr key={prof.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prof.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full ${
                          prof.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {prof.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/profissionais/${prof.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!professionalsQuery.data || professionalsQuery.data.length === 0) ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Nenhum profissional encontrado.
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

export default function ProfissionaisPage() {
  return <AuthGuard><ProfissionaisContent /></AuthGuard>;
}
