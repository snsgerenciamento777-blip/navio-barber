import { betterAuth } from "better-auth";
import { prisma } from "@navio-barber/database";
import { randomBytes } from "crypto";

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
if (!betterAuthSecret || betterAuthSecret.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET deve ser definido com pelo menos 32 caracteres",
  );
}

function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export const auth = betterAuth({
  database: prisma,
  secret: betterAuthSecret,
  baseURL: process.env.BETTER_AUTH_URL!,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60,
  },

  account: {
    accountLinking: {
      enabled: false,
    },
  },

  callbacks: {
    async signIn({ user }: { user: any }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });
      return { user };
    },

    async session({ session }: { session: any }) {
      if (!session.csrfToken) {
        session.csrfToken = generateCsrfToken();
      }
      return session;
    },
  },

  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    },
    ipAddress: {
      trustedProxies: [],
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
});

export type Session = typeof auth.$Infer.Session;