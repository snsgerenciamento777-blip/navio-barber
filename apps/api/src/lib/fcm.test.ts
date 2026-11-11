import { describe, it, expect, beforeEach, vi } from "vitest";
import { FCMService } from "./fcm.ts";

const mockPrisma = {
  fCMToken: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
};

describe("FCMService", () => {
  let service: FCMService;

  beforeEach(() => {
    service = new FCMService(mockPrisma as any);
    vi.resetAllMocks();
  });

  it("deve retornar lista vazia quando não há tokens ativos", async () => {
    mockPrisma.fCMToken.findMany.mockResolvedValue([]);
    const tokens = await service.getActiveTokens("user-1");
    expect(tokens).toEqual([]);
  });

  it("deve retornar tokens ativos do usuário", async () => {
    mockPrisma.fCMToken.findMany.mockResolvedValue([
      { token: "token-a" },
      { token: "token-b" },
    ]);
    const tokens = await service.getActiveTokens("user-1");
    expect(tokens).toEqual(["token-a", "token-b"]);
    expect(mockPrisma.fCMToken.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1", isActive: true },
      select: { token: true },
    });
  });

  it("deve enviar notificação para usuário com tokens ativos", async () => {
    mockPrisma.fCMToken.findMany.mockResolvedValue([
      { token: "token-a" },
      { token: "token-b" },
    ]);
    const result = await service.sendToUser("user-1", {
      title: "Novo agendamento",
      body: "Você tem um novo agendamento hoje",
    });
    expect(result.sent).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.results.length).toBe(2);
    expect(result.results.every((r) => r.success)).toBe(true);
  });

  it("deve retornar zero quando usuário não tem tokens", async () => {
    mockPrisma.fCMToken.findMany.mockResolvedValue([]);
    const result = await service.sendToUser("user-1", {
      title: "Teste",
      body: "Corpo",
    });
    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.results).toEqual([]);
  });

  it("deve registrar token existente atualizando", async () => {
    mockPrisma.fCMToken.findUnique.mockResolvedValue({
      id: "tok-1",
      token: "token-a",
      userId: "user-1",
    });
    mockPrisma.fCMToken.update.mockResolvedValue({});
    const result = await service.registerToken("user-1", "token-a", "web");
    expect(mockPrisma.fCMToken.update).toHaveBeenCalledWith({
      where: { id: "tok-1" },
      data: { userId: "user-1", deviceType: "web", isActive: true, updatedAt: expect.any(Date) },
    });
    expect(result).toEqual({});
  });

  it("deve criar novo token quando não existe", async () => {
    mockPrisma.fCMToken.findUnique.mockResolvedValue(null);
    mockPrisma.fCMToken.create.mockResolvedValue({ id: "tok-2" });
    const result = await service.registerToken("user-1", "token-novo", "ios");
    expect(mockPrisma.fCMToken.create).toHaveBeenCalledWith({
      data: { userId: "user-1", token: "token-novo", deviceType: "ios", isActive: true },
    });
    expect(result).toEqual({ id: "tok-2" });
  });

  it("deve desativar token ao unregister", async () => {
    mockPrisma.fCMToken.updateMany.mockResolvedValue({ count: 1 });
    const result = await service.unregisterToken("user-1", "token-a");
    expect(mockPrisma.fCMToken.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", token: "token-a" },
      data: { isActive: false },
    });
    expect(result).toEqual({ count: 1 });
  });
});
