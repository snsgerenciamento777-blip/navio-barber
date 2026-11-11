import { betterAuth } from "better-auth";

const prisma = {
  _runtimeDataModel: {
    models: {
      User: { fields: { id: { kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, email: { kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false } } },
      Session: { fields: { id: { kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false } } },
      Account: { fields: { id: { kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false } } },
      Verification: { fields: { id: { kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false } } },
    }
  },
  user: { create: async () => ({}), findFirst: async () => null, findMany: async () => [], count: async () => 0, update: async () => ({}), updateMany: async () => ({ count: 0 }), delete: async () => ({}), deleteMany: async () => ({ count: 0 }) },
  session: { create: async () => ({}), findFirst: async () => null, findMany: async () => [], count: async () => 0, update: async () => ({}), updateMany: async () => ({ count: 0 }), delete: async () => ({}), deleteMany: async () => ({ count: 0 }) },
  account: { create: async () => ({}), findFirst: async () => null, findMany: async () => [], count: async () => 0, update: async () => ({}), updateMany: async () => ({ count: 0 }), delete: async () => ({}), deleteMany: async () => ({ count: 0 }) },
  verification: { create: async () => ({}), findFirst: async () => null, findMany: async () => [], count: async () => 0, update: async () => ({}), updateMany: async () => ({ count: 0 }), delete: async () => ({}), deleteMany: async () => ({ count: 0 }) },
  rateLimit: { create: async () => ({}), findFirst: async () => null, findMany: async () => [], count: async () => 0, update: async () => ({}), updateMany: async () => ({ count: 0 }), delete: async () => ({}), deleteMany: async () => ({ count: 0 }) },
  $transaction: async (cb) => cb(prisma),
};

process.env.BETTER_AUTH_SECRET = "test-secret-key-at-least-32-chars-long";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";

try {
  const auth = betterAuth({
    database: prisma,
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true, requireEmailVerification: false, minPasswordLength: 8 },
    session: { expiresIn: 60 * 60 * 24 },
    account: { accountLinking: { enabled: false } },
    rateLimit: { enabled: true, window: 60, max: 10, customRules: { "/sign-in/email": { window: 60, max: 5 }, "/sign-up/email": { window: 60, max: 3 } } },
    advanced: { ipAddress: { trustedProxies: [] } },
  });
  console.log("SUCCESS: betterAuth initialized");
  console.log("Handler type:", typeof auth.handler);
  console.log("RateLimit enabled:", auth.options.rateLimit?.enabled);
  console.log("RateLimit max:", auth.options.rateLimit?.max);
  console.log("Custom rules:", JSON.stringify(auth.options.rateLimit?.customRules));
  console.log("Trusted proxies:", JSON.stringify(auth.options.advanced?.ipAddress?.trustedProxies));
} catch (e) {
  console.error("FAILED:", e.message);
}
