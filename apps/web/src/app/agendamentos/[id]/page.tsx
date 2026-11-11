"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function AgendamentoDetalhePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const appointmentQuery = trpc.appointment.getById.useQuery({ id }, { enabled: !!id });

  const updateStatus = trpc.appointment.updateStatus.useMutation({
    onSuccess: () => {
      router.push("/agendamentos");
    },
    onError: (err: any) => {
      console.error("Erro ao atualizar status", err);
    },
  });

  const cancel = trpc.appointment.cancel.useMutation({
    onSuccess: () => {
      router.push("/agendamentos");
    },
    onError: (err: any) => {
      console.error("Erro ao cancelar", err);
    },
  });

  if (!id) {
    notFound();
  }

  if (appointmentQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointmentQuery.data) {
    notFound();
  }

  const apt = appointmentQuery.data;

  const canFinalize = ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(apt.status);
  const canCancel = apt.status === "PENDING" || apt.status === "CONFIRMED";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agendamento #{id.slice(0, 8)}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Detalhes do atendimento
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/agendamentos"
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
              >
                Voltar à lista
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-bold mb-4">Resumo do Agendamento</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">{apt.customer?.fullName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="font-medium">{apt.customer?.phone}</p>
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
                apt.status === "NO_SHOW" ? "text-yellow-600" :
                "text-blue-600"
              }`}>
                {apt.status === "COMPLETED" ? "Concluído" :
                 apt.status === "CANCELLED" ? "Cancelado" :
                 apt.status === "NO_SHOW" ? "Não compareceu" :
                 apt.status === "CONFIRMED" ? "Confirmado" :
                 "Pendente"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Valor total</p>
              <p className="font-medium">R$ {Number(apt.totalValue ?? 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/agendamentos")}
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              Fechar
            </button>
            {canCancel && (
              <button
                onClick={() => cancel.mutateAsync({ id, reason: "Cancelamento pelo usuário" })}
                disabled={false}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Cancelar Agendamento
              </button>
            )}
            {canFinalize && !canCancel && (
              <button
                onClick={() => updateStatus.mutateAsync({ id, status: "COMPLETED" })}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Marcar como Concluído
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
