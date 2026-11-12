import http from "http";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { appRouter } from "./routers/_app.ts";
import { prisma } from "@navio-barber/database";
import { auth } from "@navio-barber/auth";

export const PORT = Number(process.env.PORT) || 3001;
export const HOST = process.env.HOST || "0.0.0.0";

export function toHeaders(incomingHeaders: http.IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, values] of Object.entries(incomingHeaders ?? {})) {
    if (Array.isArray(values)) {
      for (const v of values) headers.append(key, v);
    } else if (values !== undefined) {
      headers.set(key, values);
    }
  }
  return headers;
}

export function createRequestListener(
  trpcHandler: http.RequestListener,
): http.RequestListener {
  return (req, res) => {
    const url = req.url ?? "";
    if (url === "/health" || url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, service: "navio-barber-api" }));
      return;
    }
    trpcHandler(req, res);
  };
}

export function createTrpcHandler() {
  return createHTTPHandler({
    router: appRouter,
    createContext: async ({ req }) => {
      const requestHeaders = toHeaders(req.headers);
      let session = null;
      try {
        session = (await auth.api.getSession({ headers: requestHeaders })) ?? null;
      } catch {
        session = null;
      }
      return {
        prisma,
        session,
        headers: requestHeaders,
      };
    },
  });
}

export function createApiServer() {
  const trpcHandler = createTrpcHandler();
  return http.createServer(createRequestListener(trpcHandler));
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("server.ts")) {
  createApiServer().listen(PORT, HOST, () => {
    console.log(
      `Navio Barber API rodando em http://${HOST}:${PORT} (tRPC) | health: /health`,
    );
  });
}
