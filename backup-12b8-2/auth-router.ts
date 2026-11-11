import { z } from "zod";
import { protectedProcedure, csrfBarberProcedure, authRateLimitProcedure } from "../index";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";
import { hashPassword } from "../lib/password";
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

  logout: csrfBarberProcedure.mutation(async () => {
    // Logout delegado para Better Auth
    return { success: true };
  }),

  register: authRateLimitProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        role: z.nativeEnum(Role).default(Role.BARBER),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          passwordHash: await hashPassword(input.password),
          name: input.name,
          role: input.role,
        },
      });
      return { user };
    }),
};