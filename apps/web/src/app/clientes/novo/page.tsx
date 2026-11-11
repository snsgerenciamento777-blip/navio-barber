"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovoClientePage() {
  const router = useRouter();
  const { selectedShopId, hasShops } = useShopContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createClient = trpc.customer.create.useMutation({
    onSuccess: () => {
      router.push("/clientes");
    },
    onError: (err: any) => {
      setError(err.message || "Erro ao criar cliente");
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;

    if (!hasShops || !selectedShopId) {
      setError("Nenhuma barbearia selecionada");
      setLoading(false);
      return;
    }

    try {
      await createClient.mutateAsync({
        shopId: selectedShopId,
        fullName,
        phone,
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
            Cadastre uma barbearia antes de adicionar clientes.
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
              <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cadastre um novo cliente na barbearia
              </p>
            </div>
            <Link
              href="/clientes"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nome completo *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail (opcional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/clientes")}
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar Cliente"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Conforme o escopo MVP, o cadastro de cliente coleta apenas nome e telefone.
        </p>
      </div>
    </div>
  );
}
