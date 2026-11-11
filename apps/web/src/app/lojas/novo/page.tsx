"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { PermissionGuard } from "@/components/permission-guard";
import { Sidebar } from "@/components/sidebar";

function NovaLojaContent() {
  const router = useRouter();
  const { hasShops } = useShopContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasShops) {
      router.push("/");
    }
  }, [hasShops, router]);

  const createShop = trpc.shop.create.useMutation({
    onSuccess: () => {
      router.push("/");
    },
    onError: (err: any) => {
      setError(err.message || "Erro ao criar barbearia");
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const category = formData.get("category") as string;

    try {
      await createShop.mutateAsync({
        name,
        address: address || undefined,
        phone: phone || undefined,
        email: email || undefined,
        category: category || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64">
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Barbearia</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cadastre sua barbearia para começar a usar o Navio Barber
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Já tem uma conta? Faça login
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da barbearia *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full border rounded px-3 py-2"
                placeholder="Ex: Navio Barber Central"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Categoria
              </label>
              <input
                id="category"
                name="category"
                type="text"
                className="mt-1 block w-full border rounded px-3 py-2"
                placeholder="Ex: Barberia tradicional"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Endereço
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Ex: Rua das Flores, 123"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="mt-1 block w-full border rounded px-3 py-2"
                placeholder="Ex: (11) 99999-9999"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="mt-1 block w-full border rounded px-3 py-2"
                placeholder="Ex: contato@barbearia.com"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar Barbearia"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Após criar a barbearia, você será redirecionado para o dashboard. Cadastre
          profissionais e serviços para começar a agendar atendimentos.
        </p>
      </div>
      </div>
    </div>
  );
}

export default function NovaLojaPage() {
  return (
    <AuthGuard>
      <PermissionGuard permission="shops:write" redirectTo="/login">
        <NovaLojaContent />
      </PermissionGuard>
    </AuthGuard>
  );
}
