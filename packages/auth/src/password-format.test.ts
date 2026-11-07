import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@navio-barber/database", () => {
  const store: Record<string, any[]> = {
    user: [],
    session: [],
    account: [],
    verification: [],
    rateLimit: [],
  };

  const makeModel = (name: string) => ({
    create: async ({ data }: { data: Record<string, any>; select?: any }) => {
      const id = Math.random().toString(36).substring(7);
      const record = { id, ...data };
      store[name].push(record);
      return record;
    },
    findFirst: async ({ where }: { where?: any; select?: any }) => {
      const records = store[name];
      if (!where) return records[0] || null;
      for (const r of records) {
        if (matchWhereObj(r, where)) return r;
      }
      return null;
    },
    findMany: async ({ where, take, skip }: { where?: any; take?: number; skip?: number; select?: any }) => {
      let results = [...store[name]];
      if (where) results = results.filter(r => matchWhereObj(r, where));
      if (skip) results = results.slice(skip);
      if (take) results = results.slice(0, take);
      return results;
    },
    count: async ({ where }: { where?: any }) => {
      if (!where) return store[name].length;
      return store[name].filter(r => matchWhereObj(r, where)).length;
    },
    update: async ({ where, data }: { where: any; data: Record<string, any> }) => {
      const idx = store[name].findIndex(r => matchWhereObj(r, where));
      if (idx === -1) throw new Error("Record not found");
      store[name][idx] = { ...store[name][idx], ...data };
      return store[name][idx];
    },
    updateMany: async ({ where, data }: { where: any; data: Record<string, any> }) => {
      let count = 0;
      for (const r of store[name]) {
        if (matchWhereObj(r, where)) {
          Object.assign(r, data);
          count++;
        }
      }
      return { count };
    },
    delete: async ({ where }: { where: any }) => {
      const idx = store[name].findIndex(r => matchWhereObj(r, where));
      if (idx === -1) throw new Error("Record not found");
      const deleted = store[name].splice(idx, 1);
      return deleted[0];
    },
    deleteMany: async ({ where }: { where: any }) => {
      const before = store[name].length;
      store[name] = store[name].filter(r => !matchWhereObj(r, where));
      return { count: before - store[name].length };
    },
  });

  function matchWhere(r: any, cond: any): boolean {
    const field = r[cond.field];
    if (cond.operator === "eq" || !cond.operator) return field === cond.value;
    if (cond.operator === "ne") return field !== cond.value;
    if (cond.operator === "gt") return field > cond.value;
    if (cond.operator === "lt") return field < cond.value;
    if (cond.operator === "gte") return field >= cond.value;
    if (cond.operator === "lte") return field <= cond.value;
    if (cond.operator === "in") return Array.isArray(cond.value) && cond.value.includes(field);
    if (cond.operator === "not_in") return Array.isArray(cond.value) && !cond.value.includes(field);
    if (cond.operator === "starts_with") return String(field).startsWith(cond.value);
    if (cond.operator === "ends_with") return String(field).endsWith(cond.value);
    return true;
  }

  function matchWhereObj(r: any, where: any): boolean {
    for (const [key, val] of Object.entries(where)) {
      if (key === "AND") {
        for (const cond of val) if (!matchWhere(r, cond)) return false;
      } else if (key === "OR") {
        let found = false;
        for (const cond of val) if (matchWhere(r, cond)) { found = true; break; }
        if (!found) return false;
      } else if (r[key] !== val) {
        return false;
      }
    }
    return true;
  }

  return {
    prisma: {
      _runtimeDataModel: {
        models: {
          User: { fields: [{ name: "id", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "email", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "name", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "emailVerified", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "image", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "role", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "passwordHash", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "createdAt", kind: "scalar", isRequired: true, hasDefaultValue: true, isUpdatedAt: false }, { name: "updatedAt", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: true }] },
          Session: { fields: [{ name: "id", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "token", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "userId", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "expiresAt", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "ipAddress", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "userAgent", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "createdAt", kind: "scalar", isRequired: true, hasDefaultValue: true, isUpdatedAt: false }, { name: "updatedAt", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: true }] },
          Account: { fields: [{ name: "id", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "userId", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "accountId", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "providerId", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "accessToken", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "refreshToken", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "idToken", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "accessTokenExpiresAt", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "refreshTokenExpiresAt", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "scope", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "password", kind: "scalar", isRequired: false, hasDefaultValue: false, isUpdatedAt: false }, { name: "createdAt", kind: "scalar", isRequired: true, hasDefaultValue: true, isUpdatedAt: false }, { name: "updatedAt", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: true }] },
          Verification: { fields: [{ name: "id", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "identifier", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "value", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "expiresAt", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: false }, { name: "createdAt", kind: "scalar", isRequired: true, hasDefaultValue: true, isUpdatedAt: false }, { name: "updatedAt", kind: "scalar", isRequired: true, hasDefaultValue: false, isUpdatedAt: true }] },
        }
      },
      user: makeModel("user"),
      session: makeModel("session"),
      account: makeModel("account"),
      verification: makeModel("verification"),
      rateLimit: makeModel("rateLimit"),
      $transaction: async (cb: any) => cb({
        user: makeModel("user"),
        session: makeModel("session"),
        account: makeModel("account"),
        verification: makeModel("verification"),
        rateLimit: makeModel("rateLimit"),
      }),
    },
  };
});

process.env.BETTER_AUTH_SECRET = "test-secret-key-at-least-32-chars-long";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";

let auth: any;

beforeEach(async () => {
  vi.resetModules();

  const { prisma } = await import("@navio-barber/database");
  const { betterAuth } = await import("better-auth/minimal");
  const { prismaAdapter } = await import("@better-auth/prisma-adapter");

  auth = betterAuth({
    database: prismaAdapter(prisma, { usePlural: false }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
    emailAndPassword: { enabled: true, requireEmailVerification: false, minPasswordLength: 8 },
    session: { expiresIn: 60 * 60 * 24 },
    account: { accountLinking: { enabled: false } },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 10,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
      },
    },
    advanced: {
      defaultCookieAttributes: {
        secure: false,
        sameSite: "strict",
        path: "/",
      },
      ipAddress: { trustedProxies: [] },
    },
  });
});

async function makeRequest(method: string, path: string, body?: any, headers?: Record<string, string>) {
  const url = `http://localhost:3000/api/auth${path}`;
  const init: any = { method, headers: {} as Record<string, string> };
  if (body) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  if (headers) Object.assign(init.headers, headers);
  const res = await auth.handler(new Request(url, init));
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text, json: () => JSON.parse(text || "{}") };
}

describe("Better Auth Password Hash Format Analysis", () => {
  it("should expose password hash format from signup", async () => {
    const email = "hash-test@example.com";
    const password = "TestPassword123!";
    const name = "Hash Test User";

    const res = await makeRequest("POST", "/sign-up/email", { email, password, name });
    expect(res.status).toBe(200);
    const data = res.json();

    console.log("=== SIGNUP RESPONSE ===");
    console.log("User:", JSON.stringify(data.user, null, 2));
    console.log("Session:", JSON.stringify(data.session, null, 2));
    console.log("Token:", data.token);

    // Check account table for password hash
    const { prisma } = await import("@navio-barber/database");
    const accounts = await prisma.account.findMany({ where: { userId: data.user.id } });
    console.log("=== ACCOUNTS ===");
    console.log(JSON.stringify(accounts, null, 2));

    if (accounts.length > 0) {
      const acc = accounts[0];
      console.log("=== PASSWORD HASH ANALYSIS ===");
      console.log("Password field:", acc.password);
      console.log("Password length:", acc.password?.length);
      console.log("Starts with $:", acc.password?.startsWith("$"));
      console.log("Contains :", acc.password?.includes(":"));

      if (acc.password?.startsWith("$")) {
        const parts = acc.password.split("$");
        console.log("Envelope parts:", parts);
      } else if (acc.password?.includes(":")) {
        const [salt, hash] = acc.password.split(":");
        console.log("Salt length:", salt.length, "chars =", salt.length/2, "bytes");
        console.log("Hash length:", hash.length, "chars =", hash.length/2, "bytes");
        console.log("Salt (hex):", salt);
        console.log("Hash (hex):", hash.substring(0, 32) + "...");
      }
    }
  });

  it("should verify password using Better Auth internal verify", async () => {
    const email = "verify-test@example.com";
    const password = "TestPassword123!";
    const name = "Verify Test User";

    const res = await makeRequest("POST", "/sign-up/email", { email, password, name });
    expect(res.status).toBe(200);
    const data = res.json();

    // Get the stored hash
    const { prisma } = await import("@navio-barber/database");
    const accounts = await prisma.account.findMany({ where: { userId: data.user.id } });
    const storedHash = accounts[0]?.password;

    console.log("=== VERIFICATION TEST ===");
    console.log("Stored hash:", storedHash?.substring(0, 50) + "...");

    // Test internal password API
    console.log("=== TESTING password API ===");
    const { verifyPassword, hashPassword } = await import("@better-auth/utils/password");
    const verifyResult = await verifyPassword(storedHash!, password);
    console.log("Verify correct password:", verifyResult);
    expect(verifyResult).toBe(true);

    const verifyWrong = await verifyPassword(storedHash!, "WrongPassword!");
    console.log("Verify wrong password:", verifyWrong);
    expect(verifyWrong).toBe(false);

    const newHash = await hashPassword(password);
    console.log("New hash for same password:", newHash?.substring(0, 50) + "...");
    console.log("New hash length:", newHash?.length);

    const verifyNew = await verifyPassword(newHash!, password);
    console.log("Verify new hash:", verifyNew);
    expect(verifyNew).toBe(true);
  });
});