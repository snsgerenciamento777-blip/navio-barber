"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovoProfissionalPage() {
  const router = useRouter();
  const { selectedShopId, hasShops } = useShopContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createProfessional = trpc.shop.createProfessional.useMutation({
    onSuccess: () => {
      router.push("/profissionais");
    },
    onError: (err: any) => {
      setError(err.message || "Erro ao criar profissional");
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!hasShops || !selectedShopId) {
      setError("Nenhuma barbearia selecionada");
      setLoading(false);
      return;
    }

    try {
      await createProfessional.mutateAsync({
        shopId: selectedShopId,
        name,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Cadastre uma barbearia antes de adicionar profissionais.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Profissional</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cadastre um novo profissional na barbearia
              </p>
            </div>
            <Link
              href="/profissionais"
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Voltar à lista
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome completo *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Nome do profissional"
            />
          </div>
          <div>
            <label htmlFor="shopId" className="block text-sm font-medium text-gray-700">
              Barbearia *
            </label>
            <input
              id="shopId"
              name="shopId"
              type="text"
              value={selectedShopId}
              readOnly
              className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/profissionais")}
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar Profissional"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
