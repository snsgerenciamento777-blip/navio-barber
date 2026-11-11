import { z } from "zod";
import { protectedProcedure, csrfBarberProcedure, adminProcedure } from "../index.ts";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";
import { auth } from "@navio-barber/auth";

export const authRouter = {
  // Login é gerenciado pelo Better Auth endpoint (fora deste router tRPC).
  // Endpoint `login` removido do tRPC — Better Auth expõe /api/auth/sign-in/email.

  me: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.session.user,
      csrfToken: (ctx.session.user as { csrfToken?: string })?.csrfToken,
    };
  }),

  getCsrfToken: protectedProcedure.query(({ ctx }) => {
    const token = (ctx.session.user as { csrfToken?: string })?.csrfToken;
    if (!token) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "CSRF token não disponível na sessão",
      });
    }
    return { csrfToken: token };
  }),

  // Logout delegado para o mecanismo oficial do Better Auth.
  // Invalida a sessão server-side via auth.api.signOut.
  logout: csrfBarberProcedure.mutation(async ({ ctx }) => {
    if (!ctx.headers) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Cabeçalhos não disponíveis para encerrar sessão",
      });
    }
    await auth.api.signOut({ headers: ctx.headers });
    return { success: true };
  }),

  // Criação de usuário com papel privilegiado (ADMIN ou BARBER).
  // Apenas administradores podem criar usuários com esses papéis.
  // Cadastro público (CUSTOMER) é feito exclusivamente pelo Better Auth.
  //
  // FLUXO DE SENHA PARA USUÁRIOS PRIVILEGIADOS:
  // 1. Admin cria usuário via createUser (sem senha - passwordHash não é definido)
  // 2. Usuário recebe e-mail "esqueci minha senha" (sendResetPassword do Better Auth)
  // 3. Usuário define senha via Better Auth /api/auth/reset-password
  // 4. Better Auth armazena hash no modelo Account (formato Better Auth: scrypt r=16+NFKC)
  //
  // IMPLEMENTAÇÃO sendResetPassword (packages/auth/src/index.ts):
  // - Desenvolvimento: Grava URL de reset em tmp/password-resets/ e loga no console
  // - Produção: Configure EMAIL_PROVIDER via env vars (ex: RESEND_API_KEY, SENDGRID_API_KEY)
  //   e implemente sendResetPassword real usando o provedor escolhido.
  // - Budget: R$ 0,00 (sem serviços pagos em desenvolvimento)
  //
  // IMPORTANTE: Não definir passwordHash diretamente no User.
  // O Better Auth gerencia senhas exclusivamente via modelo Account.
  // A verificação dual (Better Auth r=16+NFKC + legado r=8) é feita em apps/api/src/lib/password.ts
  createUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        role: z.nativeEnum(Role).refine(
          (r) => r === Role.ADMIN || r === Role.BARBER,
          { message: "Apenas ADMIN ou BARBER podem ser criados por este fluxo" },
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "E-mail já cadastrado",
        });
      }

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
        },
      });
      return { user };
    }),
};
