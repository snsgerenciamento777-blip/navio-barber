"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

const DAYS = [
  { key: "mon", label: "Segunda" },
  { key: "tue", label: "Terça" },
  { key: "wed", label: "Quarta" },
  { key: "thu", label: "Quinta" },
  { key: "fri", label: "Sexta" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

type WorkingHoursInput = {
  open: string;
  close: string;
} | null;

export default function ProfissionalEditarPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { selectedShopId, hasShops } = useShopContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const professionalsQuery = trpc.shop.getProfessionals.useQuery(
    { shopId: selectedShopId, isActive: undefined },
    { enabled: hasShops && !!selectedShopId }
  );

  const updateProfessional = trpc.shop.updateProfessional.useMutation({
    onSuccess: () => {
      router.push("/profissionais");
    },
    onError: (err: any) => {
      setError(err.message || "Erro ao atualizar profissional");
      setLoading(false);
    },
  });

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

  const professional = professionalsQuery.data?.find((p: any) => p.id === id);

  if (!professional) {
    notFound();
  }

  const [workingHours, setWorkingHours] = useState<Record<string, WorkingHoursInput>>(
    (professional.workingHours as Record<string, { open: string; close: string } | null> | null) ?? {}
  );

  const [isActive, setIsActive] = useState(professional.isActive);
  const [name, setName] = useState(professional.name);

  useEffect(() => {
    const wh = (professional.workingHours as Record<string, { open: string; close: string } | null> | null) ?? {};
    const hours: Record<string, WorkingHoursInput> = {};
    for (const day of DAYS) {
      hours[day.key] = wh[day.key] ?? null;
    }
    setWorkingHours(hours);
  }, [professional]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedShopId) {
      setError("Nenhuma barbearia selecionada");
      setLoading(false);
      return;
    }

    try {
      await updateProfessional.mutateAsync({
        professionalId: id,
        shopId: selectedShopId,
        name: name || undefined,
        isActive,
        workingHours,
      });
    } catch {
      // Error handled in onError
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Profissional</h1>
              <p className="mt-1 text-sm text-gray-500">
                Configure horários de trabalho e status do profissional
              </p>
            </div>
            <Link
              href={`/profissionais/${id}`}
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Voltar aos detalhes
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

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow border border-gray-200">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome completo *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center gap-3">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Profissional ativo
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Horário de funcionamento
            </label>
            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day.key} className="border rounded p-3 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{day.label}</span>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={workingHours[day.key] === null}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWorkingHours({ ...workingHours, [day.key]: null });
                          } else {
                            setWorkingHours({
                              ...workingHours,
                              [day.key]: { open: "09:00", close: "18:00" },
                            });
                          }
                        }}
                        className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      {workingHours[day.key] === null ? "Fechado" : "Aberto"}
                    </label>
                  </div>
                  {workingHours[day.key] !== null && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Abre</label>
                        <input
                          type="time"
                          value={workingHours[day.key]?.open ?? ""}
                          onChange={(e) =>
                            setWorkingHours({
                              ...workingHours,
                              [day.key]: { open: e.target.value, close: workingHours[day.key]?.close ?? "18:00" },
                            })
                          }
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                        <input
                          type="time"
                          value={workingHours[day.key]?.close ?? ""}
                          onChange={(e) =>
                            setWorkingHours({
                              ...workingHours,
                              [day.key]: { open: workingHours[day.key]?.open ?? "09:00", close: e.target.value },
                            })
                          }
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push(`/profissionais/${id}`)}
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
