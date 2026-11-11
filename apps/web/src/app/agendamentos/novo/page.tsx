"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useShopContext } from "@/lib/use-shop-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "cliente" | "servico" | "horario" | "confirmacao";

interface ClienteOption {
  id: string;
  fullName: string;
  phone: string;
}

interface ServicoOption {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

interface ProfissionalOption {
  id: string;
  name: string;
  isActive?: boolean;
}

interface HorarioSlot {
  start: string;
  label: string;
  available: boolean;
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const { selectedShopId, hasShops } = useShopContext();
  const [step, setStep] = useState<Step>("cliente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [selectedCustomer, setSelectedCustomer] = useState<ClienteOption | null>(null);
  const [selectedService, setSelectedService] = useState<ServicoOption | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfissionalOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  // Queries
  const customersQuery = trpc.customer.list.useQuery(
    { shopId: selectedShopId, search: "" },
    { enabled: hasShops && !!selectedShopId }
  );

  const servicesQuery = trpc.service.list.useQuery(
    { shopId: selectedShopId, isActive: true },
    { enabled: hasShops && !!selectedShopId }
  );

  const professionalsQuery = trpc.shop.getProfessionals.useQuery(
    { shopId: selectedShopId, isActive: true },
    { enabled: hasShops && !!selectedShopId }
  );

  const availableSlotsQuery = trpc.appointment.getAvailableSlots.useQuery(
    {
      date: selectedDate,
      professionalId: selectedProfessional?.id ?? "",
      serviceId: selectedService?.id ?? "",
    },
    { enabled: !!selectedDate && !!selectedProfessional?.id && !!selectedService?.id && hasShops }
  );

  const createAppointment = trpc.appointment.create.useMutation({
    onSuccess: () => {
      setStep("confirmacao");
    },
    onError: (err: any) => {
      setError(err.message || "Erro ao criar agendamento");
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!hasShops || !selectedShopId) return;
    // Queries re-fetch automatically when shopId changes
  }, [selectedShopId, hasShops]);

  const progress = step === "cliente" ? 25 : step === "servico" ? 50 : step === "horario" ? 75 : 100;

  const nextStep = () => {
    if (step === "cliente" && selectedCustomer) {
      setStep("servico");
      setError("");
    } else if (step === "servico" && selectedService && selectedProfessional) {
      setStep("horario");
      setError("");
    } else if (step === "horario" && selectedDate) {
      setLoading(true);
    }
  };

  const prevStep = () => {
    if (step === "servico") setStep("cliente");
    else if (step === "horario") setStep("servico");
    else if (step === "confirmacao") setStep("horario");
    setError("");
  };

  const handleCreate = async () => {
    if (!selectedCustomer || !selectedService || !selectedProfessional || !selectedDate) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createAppointment.mutateAsync({
        customerId: selectedCustomer.id,
        serviceId: selectedService.id,
        professionalId: selectedProfessional.id,
        startAt: selectedDate,
      });
    } catch {
      // Error handled in onError
    }
  };

  if (!hasShops) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma barbearia encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Cadastre uma barbearia antes de criar agendamentos.
          </p>
        </div>
      </div>
    );
  }

  const clientes: ClienteOption[] = (customersQuery.data as any[]) ?? [];
  const servicos: ServicoOption[] = (servicesQuery.data as any[]) ?? [];
  const profissionais: ProfissionalOption[] = (professionalsQuery.data as any[]) ?? [];
  const slots: HorarioSlot[] = (availableSlotsQuery.data as any)?.availableSlots ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Agendamento</h1>
              <p className="mt-1 text-sm text-gray-500">
                Agende um atendimento para um cliente
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <span className={`mr-2 ${step === "cliente" ? "text-blue-600" : "text-gray-300"}`}>1</span>
            <span className={`mr-2 ${step === "servico" ? "text-blue-600" : step === "cliente" ? "text-gray-400" : "text-gray-300"}`}>2</span>
            <span className={`mr-2 ${step === "horario" ? "text-blue-600" : (step === "servico" || step === "cliente") ? "text-gray-400" : "text-gray-300"}`}>3</span>
            <span className={`${step === "confirmacao" ? "text-blue-600" : "text-gray-300"}`}>4</span>
          </div>
          <div className="h-1 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step content */}
        {step === "cliente" && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold mb-4">1. Selecionar Cliente</h2>

            <div className="mb-6">
              <div className="text-sm font-medium text-gray-500 mb-2">
                Barbearia: {selectedShopId.slice(0, 8)}...
              </div>
              {customersQuery.isLoading && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              )}

              {!customersQuery.isLoading && clientes.length > 0 && (
                <div className="space-y-2">
                  {clientes.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer({ id: c.id, fullName: c.fullName, phone: c.phone })}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded border transition-colors ${
                        selectedCustomer?.id === c.id
                          ? "bg-blue-50 border-blue-200 text-blue-900"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{c.fullName}</p>
                        <p className="text-sm text-gray-500">{c.phone}</p>
                      </div>
                      {selectedCustomer?.id === c.id && (
                        <span className="text-blue-600 font-medium">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!customersQuery.isLoading && clientes.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  Nenhum cliente encontrado. Cadastre um cliente primeiro.
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => router.push("/clientes/novo")}
                  className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
                >
                  + Novo Cliente
                </button>
                <button
                  onClick={nextStep}
                  disabled={loading || !selectedCustomer}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "servico" && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold mb-4">2. Serviço e Profissional</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serviço *</label>
                <div className="space-y-1">
                  {servicos.length === 0 ? (
                    <div className="p-3 border rounded bg-gray-50 text-gray-500 text-sm">
                      Nenhum serviço disponível
                    </div>
                  ) : (
                    servicos.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedService({ id: s.id, name: s.name, price: s.price, durationMinutes: s.durationMinutes })}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded border transition-colors ${
                          selectedService?.id === s.id
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{s.name}</span>
                        <span className="text-sm font-medium">R$ {s.price.toFixed(2)}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional *</label>
                <div className="space-y-1">
                  {profissionais.length === 0 ? (
                    <div className="p-3 border rounded bg-gray-50 text-gray-500 text-sm">
                      Nenhum profissional disponível
                    </div>
                  ) : (
                    profissionais.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProfessional({ id: p.id, name: p.name, isActive: p.isActive })}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded border transition-colors ${
                          selectedProfessional?.id === p.id
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{p.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            p.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-between">
              <button
                onClick={prevStep}
                className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
              >
                Voltar
              </button>
              <button
                onClick={nextStep}
                disabled={loading || !selectedService || !selectedProfessional}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === "horario" && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold mb-4">3. Data e Horário</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setError("");
                }}
                min={new Date().toISOString().split("T")[0]}
                className="block w-full border rounded px-3 py-2"
              />
            </div>

            {availableSlotsQuery.isLoading && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            )}

            {!availableSlotsQuery.isLoading && slots.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {slots.map((slot: any) => (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedDate(slot.start)}
                    disabled={!slot.available}
                    className={`w-full py-3 rounded border transition-colors text-sm font-medium ${
                      !slot.available
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                        : selectedDate === slot.start
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}

            {!availableSlotsQuery.isLoading && slots.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Nenhum horário disponível para esta data e profissional.
              </div>
            )}

            <div className="mt-6 flex gap-3 justify-between">
              <button
                onClick={prevStep}
                className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
              >
                Voltar
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !selectedDate}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Criando..." : "Confirmar Agendamento"}
              </button>
            </div>
          </div>
        )}

        {step === "confirmacao" && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center py-12">
            <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Criado!</h2>
            <p className="text-gray-600 mb-6">
              O agendamento foi registrado com sucesso.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/agendamentos"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Ver Agendamentos
              </Link>
              <button
                onClick={() => {
                  setStep("cliente");
                  setSelectedCustomer(null);
                  setSelectedService(null);
                  setSelectedProfessional(null);
                  setSelectedDate("");
                  setError("");
                }}
                className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
              >
                Novo Agendamento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
