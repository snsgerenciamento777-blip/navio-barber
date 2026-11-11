import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@navio-barber/database", () => {
  // In-memory mock Prisma
  const store = {
    user: [],
    session: [],
    account: [],
    verification: [],
    rateLimit: [],
  };

  const makeModel = (name) => ({
    create: async ({ data, select }) => {
      const id = Math.random().toString(36).substring(7);
      const record = { id, ...data };
      store[name].push(record);
      return record;
    },
    findFirst: async ({ where, select }) => {
      const records = store[name];
      if (!where) return records[0] || null;
      for (const r of records) {
        let match = true;
        for (const [key, val] of Object.entries(where)) {
          if (key === "AND") {
            for (const cond of val) {
              if (!matchWhere(r, cond)) { match = false; break; }
            }
          } else if (key === "OR") {
            let orMatch = false;
            for (const cond of val) {
              if (matchWhere(r, cond)) { orMatch = true; break; }
            }
            if (!orMatch) match = false;
          } else if (key === "NOT") {
            for (const cond of val) {
              if (matchWhere(r, cond)) { match = false; break; }
            }
          } else {
            if (!matchWhere(r, { [key]: val })) { match = false; break; }
          }
        }
        if (match) return r;
      }
      return null;
    },
    findMany: async ({ where, take, skip, select, orderBy }) => {
      let results = [...store[name]];
      if (where) {
        results = results.filter(r => matchWhereObj(r, where));
      }
      if (skip) results = results.slice(skip);
      if (take) results = results.slice(0, take);
      return results;
    },
    count: async ({ where }) => {
      if (!where) return store[name].length;
      return store[name].filter(r => matchWhereObj(r, where)).length;
    },
    update: async ({ where, data }) => {
      const idx = store[name].findIndex(r => matchWhereObj(r, where));
      if (idx === -1) throw new Error("Record not found");
      store[name][idx] = { ...store[name][idx], ...data };
      return store[name][idx];
    },
    updateMany: async ({ where, data }) => {
      let count = 0;
      for (const r of store[name]) {
        if (matchWhereObj(r, where)) {
          Object.assign(r, data);
          count++;
        }
      }
      return { count };
    },
    delete: async ({ where }) => {
      const idx = store[name].findIndex(r => matchWhereObj(r, where));
      if (idx === -1) throw new Error("Record not found");
      const deleted = store[name].splice(idx, 1);
      return deleted[0];
    },
    deleteMany: async ({ where }) => {
      const before = store[name].length;
      store[name] = store[name].filter(r => !matchWhereObj(r, where));
      return { count: before - store[name].length };
    },
  });

  function matchWhere(r, cond) {
    if (cond.operator === "eq" || !cond.operator) return r[cond.field] === cond.value;
    if (cond.operator === "ne") return r[cond.field] !== cond.value;
    if (cond.operator === "gt") return r[cond.field] > cond.value;
    if (cond.operator === "lt") return r[cond.field] < cond.value;
    if (cond.operator === "gte") return r[cond.field] >= cond.value;
    if (cond.operator === "lte") return r[cond.field] <= cond.value;
    if (cond.operator === "in") return cond.value.includes(r[cond.field]);
    if (cond.operator === "not_in") return !cond.value.includes(r[cond.field]);
    if (cond.operator === "starts_with") return String(r[cond.field]).startsWith(cond.value);
    if (cond.operator === "ends_with") return String(r[cond.field]).endsWith(cond.value);
    return true;
  }

  function matchWhereObj(r, where) {
    for (const [key, val] of Object.entries(where)) {
      if (key === "AND") {
        for (const cond of val) {
          if (!matchWhere(r, cond)) return false;
        }
      } else if (key === "OR") {
        let found = false;
        for (const cond of val) {
          if (matchWhere(r, cond)) { found = true; break; }
        }
        if (!found) return false;
      } else {
        if (r[key] !== val) return false;
      }
    }
    return true;
  }

  const prisma = {
    _runtimeDataModel: {
      models: {
        User: { fields: {} },
        Session: { fields: {} },
        Account: { fields: {} },
        Verification: { fields: {} },
      }
    },
    user: makeModel("user"),
    session: makeModel("session"),
    account: makeModel("account"),
    verification: makeModel("verification"),
    rateLimit: makeModel("ratelimit"),
    $transaction: async (cb) => cb(prisma),
  };

  return { prisma };
});

process.env.BETTER_AUTH_SECRET = "test-secret-key-at-least-32-chars-long";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";

let auth;

beforeEach(async () => {
  const mod = await import("./index");
  auth = mod.auth;
  // Clear mock state between tests
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Better Auth HTTP handler (N-03, N-04)", () => {
  it("deve ter handler como função", () => {
    expect(typeof auth.handler).toBe("function");
  });

  it("deve ter rate limiting habilitado", () => {
    expect(auth.options.rateLimit?.enabled).toBe(true);
  });

  it("deve ter custom rule para sign-in/email com max 5", () => {
    const rule = auth.options.rateLimit?.customRules?.["/sign-in/email"];
    expect(rule).toBeDefined();
    expect(rule.max).toBe(5);
  });

  it("deve ter custom rule para sign-up/email com max 3", () => {
    const rule = auth.options.rateLimit?.customRules?.["/sign-up/email"];
    expect(rule).toBeDefined();
    expect(rule.max).toBe(3);
  });

  it("deve ter trustedProxies vazio", () => {
    expect(auth.options.advanced?.ipAddress?.trustedProxies).toEqual([]);
  });
});
