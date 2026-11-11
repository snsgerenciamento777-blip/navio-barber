"use client";

import { ReactNode, useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { trpc, setCsrfToken, createTRPCCLIENT } from "@/lib/trpc";

function CsrfTokenInitializer() {
  const csrfQuery = trpc.auth.getCsrfToken.useQuery(undefined, {
    enabled: true,
  });

  useEffect(() => {
    if (csrfQuery.data?.csrfToken) {
      setCsrfToken(csrfQuery.data.csrfToken);
    }
  }, [csrfQuery.data?.csrfToken, csrfQuery.error]);

  return null;
}

export function TrpcProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createTRPCCLIENT());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <CsrfTokenInitializer />
      {children}
    </trpc.Provider>
  );
}
