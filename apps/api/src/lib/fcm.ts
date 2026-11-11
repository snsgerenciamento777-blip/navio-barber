import { PrismaClient } from "@prisma/client";

export interface FCMSendResult {
  token: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface FCMMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class FCMService {
  constructor(private prisma: PrismaClient) {}

  async getActiveTokens(userId: string): Promise<string[]> {
    const tokens = await this.prisma.fCMToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });
    return tokens.map((t) => t.token);
  }

  async sendToUser(
    userId: string,
    message: FCMMessage,
  ): Promise<{ sent: number; failed: number; results: FCMSendResult[] }> {
    const tokens = await this.getActiveTokens(userId);
    if (tokens.length === 0) {
      return { sent: 0, failed: 0, results: [] };
    }

    const results: FCMSendResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const token of tokens) {
      const result = await this.sendToToken(token, message);
      results.push(result);
      if (result.success) sent++;
      else failed++;
    }

    return { sent, failed, results };
  }

  async sendToTokens(
    tokens: string[],
    message: FCMMessage,
  ): Promise<{ sent: number; failed: number; results: FCMSendResult[] }> {
    const results: FCMSendResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const token of tokens) {
      const result = await this.sendToToken(token, message);
      results.push(result);
      if (result.success) sent++;
      else failed++;
    }

    return { sent, failed, results };
  }

  private async sendToToken(
    token: string,
    _message: FCMMessage,
  ): Promise<FCMSendResult> {
    // Implementação mock (sem servidor Firebase real disponível).
    // Em produção, integrar com Firebase Admin SDK:
    //   await admin.messaging().send({ token, notification: {...} })
    try {
      // Simula envio bem-sucedido
      return {
        token,
        success: true,
        messageId: `fcm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      };
    } catch (error) {
      return {
        token,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  async registerToken(
    userId: string,
    token: string,
    deviceType: "ios" | "android" | "web",
  ) {
    const existing = await this.prisma.fCMToken.findUnique({ where: { token } });
    if (existing) {
      return this.prisma.fCMToken.update({
        where: { id: existing.id },
        data: { userId, deviceType, isActive: true, updatedAt: new Date() },
      });
    }
    return this.prisma.fCMToken.create({
      data: { userId, token, deviceType, isActive: true },
    });
  }

  async unregisterToken(userId: string, token: string) {
    return this.prisma.fCMToken.updateMany({
      where: { userId, token },
      data: { isActive: false },
    });
  }
}
