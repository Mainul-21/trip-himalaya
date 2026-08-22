"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import { useState } from "react";
import App from "../client/src/App";
import { trpc } from "../client/src/lib/trpc";
import { startLogin } from "../client/src/const";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "../shared/const";

function readPreviewAuthorizationHeader() {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    if (!raw) return {};
    const prefix = `${COOKIE_NAME}=`;
    const token = raw.split(";").find((part) => part.trim().startsWith(prefix))?.trim().slice(prefix.length);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export default function LegacyBrowserApp() {
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    const redirectIfUnauthenticated = (error: unknown) => {
      if (error instanceof TRPCClientError && error.message === UNAUTHED_ERR_MSG) startLogin();
    };
    client.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") redirectIfUnauthenticated(event.query.state.error);
    });
    client.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") redirectIfUnauthenticated(event.mutation.state.error);
    });
    return client;
  });
  const [trpcClient] = useState(() => trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson, headers: readPreviewAuthorizationHeader, fetch: (input, init) => globalThis.fetch(input, { ...(init ?? {}), credentials: "include" }) })] }));

  return <trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><App /></QueryClientProvider></trpc.Provider>;
}
