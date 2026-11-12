import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@navio-barber/api";
import { httpLink, loggerLink } from "@trpc/client";

export const trpc = createTRPCReact<AppRouter>();

// Armazena o CSRF token da sessão (preenchido após login / getCsrfToken).
let csrfTokenStore: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfTokenStore = token;
}

export function createTRPCCLIENT() {
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpLink({
        // Always use the Next.js proxy route from the browser so auth cookies/CSRF
        // stay same-origin and the API URL is not exposed to client-side CORS.
        url: "/api/trpc",
        headers: () => {
          const headers: Record<string, string> = {};
          if (csrfTokenStore) {
            headers["x-csrf-token"] = csrfTokenStore;
          }
          return headers;
        },
      }),
    ],
  });
}
