"use client";

import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function ServicoDetalhePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { selectedShopId, hasShops } = useShopContext();

  const serviceQuery = trpc.service.getById.useQuery({ id }, { enabled: !!id });

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <Link href="/lojas/novo" className="text-blue-600 hover:underline">Criar barbearia</Link>
        </div>
      </div>
    );
  }

  if (serviceQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!serviceQuery.data) {
    notFound();
  }

  const svc = serviceQuery.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{svc.name}</h1>
              <p className="mt-1 text-sm text-gray-500">Detalhes do serviço</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/servicos"
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
              >
                Voltar à lista
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 uppercase">Nome</p>
              <p className="font-medium">{svc.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 uppercase">Categoria</p>
              <p className="font-medium">{svc.category ?? "Não informada"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 uppercase">Preço</p>
              <p className="font-medium">R$ {Number(svc.price).toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 uppercase">Duração</p>
              <p className="font-medium">{svc.durationMinutes} min</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 uppercase">Status</p>
              <p className={`font-medium ${svc.isActive ? "text-green-600" : "text-gray-600"}`}>
                {svc.isActive ? "Ativo" : "Inativo"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 uppercase">Barbearia</p>
              <p className="font-medium">{selectedShopId.slice(0, 8)}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
