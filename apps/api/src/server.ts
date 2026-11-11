import http from "http";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./routers/_app.ts";
import { prisma } from "@navio-barber/database";
import { auth } from "@navio-barber/auth";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

function toHeaders(incomingHeaders: http.IncomingHttpHeaders): Headers {
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

const server = createHTTPServer({
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

// Health check simples (fora do prefixo tRPC) para balanceadores/monitores
const originalHandler = server;
http
  .createServer((req, res) => {
    if (req.url === "/health" || req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, service: "navio-barber-api" }));
      return;
    }
    // delega ao handler tRPC standalone (espera req/res Node)
    (originalHandler as any)(req, res);
  })
  .listen(PORT, HOST, () => {
    console.log(`Navio Barber API rodando em http://${HOST}:${PORT} (tRPC) | health: /health`);
  });
