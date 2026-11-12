import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import http from "http";

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "test-secret-at-least-32-characters-long!!";
  process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/test";
});

vi.mock("@navio-barber/database", () => ({
  prisma: {},
}));

vi.mock("@navio-barber/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue(null),
    },
  },
}));

import { createRequestListener, createApiServer } from "./server.ts";

function request(
  server: http.Server,
  path: string,
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      http
        .get({ hostname: "127.0.0.1", port: addr.port, path }, (res) => {
          let body = "";
          res.on("data", (c) => (body += c));
          res.on("end", () => {
            server.close();
            resolve({ status: res.statusCode ?? 0, headers: res.headers, body });
          });
        })
        .on("error", (e) => {
          server.close();
          reject(e);
        });
    });
  });
}

describe("API HTTP server", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("createRequestListener delegates non-health requests to trpc handler function", async () => {
    const trpcHandler = vi.fn((req: http.IncomingMessage, res: http.ServerResponse) => {
      res.writeHead(204);
      res.end();
    });
    const listener = createRequestListener(trpcHandler);
    const server = http.createServer(listener);
    const res = await request(server, "/trpc/some.procedure");
    expect(res.status).toBe(204);
    expect(trpcHandler).toHaveBeenCalledTimes(1);
  });

  it("createRequestListener does not throw when delegating (regression: server object is not callable)", async () => {
    const trpcHandler = vi.fn((req: http.IncomingMessage, res: http.ServerResponse) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
    const listener = createRequestListener(trpcHandler);
    const server = http.createServer(listener);
    const res = await request(server, "/anything");
    expect(res.status).toBe(200);
    expect(typeof trpcHandler).toBe("function");
  });

  it("serves /health with 200 and JSON", async () => {
    const server = createApiServer();
    const res = await request(server, "/health");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
    expect(JSON.parse(res.body)).toEqual({ ok: true, service: "navio-barber-api" });
  });

  it("serves /healthz with 200 and JSON", async () => {
    const server = createApiServer();
    const res = await request(server, "/healthz");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
    expect(JSON.parse(res.body)).toEqual({ ok: true, service: "navio-barber-api" });
  });

  it("delegates tRPC routes to the tRPC handler (not health)", async () => {
    const server = createApiServer();
    const res = await request(server, "/nonexistent.procedure");
    // tRPC responds (e.g. 404/400/405 JSON error) rather than crashing with "not a function"
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.length).toBeGreaterThan(0);
  });
});