"use client";

import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { usePermissions } from "@/lib/permissions";
import { Sidebar } from "@/components/sidebar";

function ClientesContent() {
  const { selectedShopId, hasShops } = useShopContext();
  const { isAdmin } = usePermissions();
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  const clientsQuery = trpc.customer.list.useQuery(
    { shopId: selectedShopId, search },
    { enabled: hasShops && !!selectedShopId }
  );

  const updateCustomer = trpc.customer.update.useMutation({
    onMutate: (variables) => setToggling({ ...toggling, [variables.id]: true }),
    onSettled: (_, __, variables) => {
      const next = { ...toggling };
      delete next[variables.id];
      setToggling(next);
    },
  });

  const handleBlock = async (customer: any) => {
    await updateCustomer.mutateAsync({
      id: customer.id,
      status: customer.status === "BLOCKED" ? "ACTIVE" : "BLOCKED",
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Cadastre uma barbearia para gerenciar clientes.
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
                <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gerenciamento de clientes da barbearia
                </p>
              </div>
              {isAdmin && (
                <Link
                  href="/clientes/novo"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  + Novo Cliente
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative w-full lg:w-1/2">
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow sm:rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atendimentos
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientsQuery.data?.map((customer: any) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/clientes/${customer.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        {customer.fullName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full ${
                          customer.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : customer.status === "BLOCKED"
                            ? "bg-red-100 text-red-800"
                            : customer.status === "INACTIVE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.status === "ACTIVE"
                          ? "Ativo"
                          : customer.status === "BLOCKED"
                          ? "Bloqueado"
                          : customer.status === "INACTIVE"
                          ? "Inativo"
                          : "Novo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer._count?.appointments ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium gap-2 flex items-center justify-end">
                      <Link
                        href={`/clientes/${customer.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver detalhes
                      </Link>
                      <button
                        onClick={() => handleBlock(customer)}
                        disabled={toggling[customer.id]}
                        className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                          customer.status === "BLOCKED"
                            ? "bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-70"
                            : "bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-70"
                        }`}
                      >
                        {customer.status === "BLOCKED" ? "Desbloquear" : "Bloquear"}
                      </button>
                    </td>
                  </tr>
                ))}
                {(!clientsQuery.data || clientsQuery.data.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Nenhum cliente encontrado.
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

export default function ClientesPage() {
  return <AuthGuard><ClientesContent /></AuthGuard>;
}
