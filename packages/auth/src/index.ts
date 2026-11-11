import { betterAuth } from "better-auth";
import { prisma } from "@navio-barber/database";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
if (!betterAuthSecret || betterAuthSecret.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET deve ser definido com pelo menos 32 caracteres",
  );
}

// Wrapper para crypto.scrypt com callback (evita problemas de tipo com promisify)
async function scryptHash(
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

// --- Legacy password verification (r=8, no NFKC) ---
// Suporta hashes gerados pela implementação customizada anterior
// (apps/api/src/lib/password.ts) para login de usuários existentes.
async function legacyVerifyPassword(hash: string, password: string): Promise<boolean> {
  const parts = hash.split(":");
  if (parts.length !== 2) return false;
  const [salt, key] = parts as [string, string];
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = await scryptHash(password, salt, 64, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 128 * 16384 * 8 * 2,
    });
    if (keyBuffer.length !== derivedKey.length) return false;
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

async function hybridVerifyPassword({ hash, password }: { hash: string; password: string }): Promise<boolean> {
  // 1. Tentar verificação nativa do Better Auth (scrypt r=16, NFKC)
  try {
    const { verifyPassword } = await import("@better-auth/utils/password");
    const nativeResult = await verifyPassword(hash, password);
    if (nativeResult) return true;
  } catch {
    // Ignora erro e tenta legacy
  }
  // 2. Tentar verificação legacy (scrypt r=8, sem NFKC)
  return legacyVerifyPassword(hash, password);
}

// --- sendResetPassword (sem serviço pago, orçamento R$ 0,00) ---
// Grava a URL de redefinição no console e em arquivo local para recuperação em desenvolvimento.
const RESET_URLS_DIR = join(process.cwd(), "tmp", "password-resets");
if (!existsSync(RESET_URLS_DIR)) {
  mkdirSync(RESET_URLS_DIR, { recursive: true });
}

let resetUrlCounter = 0;

async function sendResetPassword({
  user,
  url,
  token,
}: { user: { id: string; email: string; name?: string }; url: string; token: string }): Promise<void> {
  resetUrlCounter += 1;
  const fileName = `reset-${user.id}-${Date.now()}.txt`;
  const filePath = join(RESET_URLS_DIR, fileName);
  const content = `Password Reset Request
User: ${user.name ?? user.email} (${user.email})
User ID: ${user.id}
Token: ${token}
Reset URL: ${url}
Generated at: ${new Date().toISOString()}
Instrucao: acesse a URL acima para redefinir a senha. Em producao, configure um provedor de email real.
`;
  try {
    writeFileSync(filePath, content, "utf-8");
  } catch {
    // Nao crítico: o console.log abaixo ainda disponibiliza a URL
  }
  console.log(
    `[Better Auth sendResetPassword] Usuario: ${user.email} | Token: ${token} | URL: ${url} | Arquivo: ${filePath}`,
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { usePlural: false, provider: "postgresql" }),
  secret: betterAuthSecret,
  baseURL: process.env.BETTER_AUTH_URL!,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword,
    password: {
      verify: hybridVerifyPassword,
    },
    onPasswordReset: async ({ user }) => {
      console.log(`[Better Auth onPasswordReset] Senha redefinida para usuario: ${user.email}`);
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CUSTOMER",
      },
    },
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
