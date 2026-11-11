"use client";

import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { usePermissions } from "@/lib/permissions";
import { Sidebar } from "@/components/sidebar";

function ServicosContent() {
  const { selectedShopId, hasShops } = useShopContext();
  const { isAdmin } = usePermissions();
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  const servicesQuery = trpc.service.list.useQuery(
    { shopId: selectedShopId, isActive: true },
    { enabled: hasShops && !!selectedShopId }
  );

  const updateService = trpc.service.update.useMutation({
    onMutate: (variables) => setToggling({ ...toggling, [variables.id]: true }),
    onSettled: (_, __, variables) => {
      const next = { ...toggling };
      delete next[variables.id];
      setToggling(next);
    },
  });

  const handleToggle = async (svc: any) => {
    await updateService.mutateAsync({ id: svc.id, isActive: !svc.isActive });
  };

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Cadastre uma barbearia para gerenciar serviços.
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
                <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Catálogo de serviços da barbearia
                </p>
              </div>
              {isAdmin && (
                <Link
                  href="/servicos/novo"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  + Novo Serviço
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
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Duração
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
                {servicesQuery.data?.map((svc: any) => (
                  <tr key={svc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {svc.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {svc.category ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {svc.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {svc.durationMinutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(svc)}
                        disabled={toggling[svc.id]}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                          svc.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-70"
                            : "bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-70"
                        }`}
                      >
                        {svc.isActive ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/servicos/${svc.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!servicesQuery.data || servicesQuery.data.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Nenhum serviço encontrado.
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

export default function ServicosPage() {
  return <AuthGuard><ServicosContent /></AuthGuard>;
}
