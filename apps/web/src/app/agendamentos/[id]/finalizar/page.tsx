"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FinalizarAgendamentoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { id } = params;

  const appointmentQuery = trpc.appointment.getById.useQuery({ id }, { enabled: !!id });

  const updateStatus = trpc.appointment.updateStatus.useMutation({
    onSuccess: () => {
      router.push("/agendamentos");
    },
    onError: (err: any) => {
      setError(err.message || "Erro ao finalizar agendamento");
      setLoading(false);
    },
  });

  const handleFinalize = async () => {
    setLoading(true);
    setError("");
    try {
      await updateStatus.mutateAsync({
        id,
        status: "COMPLETED",
      });
    } catch {
      // Error handled in onError
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Agendamento não encontrado</h1>
          <Link
            href="/agendamentos"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Voltar à lista
          </Link>
        </div>
      </div>
    );
  }

  if (appointmentQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointmentQuery.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Agendamento não encontrado</h1>
          <Link
            href="/agendamentos"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Voltar à lista
          </Link>
        </div>
      </div>
    );
  }

  const apt = appointmentQuery.data;

  const canFinalize = ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(apt.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finalizar Atendimento</h1>
              <p className="mt-1 text-sm text-gray-500">
                Marque este agendamento como concluído
              </p>
            </div>
            <Link
              href="/agendamentos"
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

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-bold mb-4">Resumo do Agendamento</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">{apt.customer?.fullName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Serviço</p>
              <p className="font-medium">{apt.service?.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Profissional</p>
              <p className="font-medium">{apt.professional?.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Data/Hora</p>
              <p className="font-medium">
                {new Date(apt.startAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Status atual</p>
              <p className={`font-medium ${
                apt.status === "COMPLETED" ? "text-green-600" :
                apt.status === "CANCELLED" ? "text-red-600" :
                "text-blue-600"
              }`}>
                {apt.status === "COMPLETED" ? "Concluído" :
                 apt.status === "CANCELLED" ? "Cancelado" :
                 apt.status === "NO_SHOW" ? "No-show" :
                 "Pendente"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Valor total</p>
              <p className="font-medium">R$ {Number(apt.totalValue ?? 0).toFixed(2)}</p>
            </div>
          </div>

          {!canFinalize && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded mb-6">
              <p className="text-sm text-amber-800">
                Este agendamento não pode ser finalizado (status: {apt.status}).
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/agendamentos")}
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleFinalize}
              disabled={loading || !canFinalize}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Finalizando..." : "Marcar como Concluído"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
