import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../server/routers";
import { createNextTrpcContext, type NextTrpcContext } from "../../../../server/nextTrpcContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createNextTrpcContext(request),
    responseMeta({ ctx }) {
      const cookieHeader = (ctx as NextTrpcContext | undefined)?.cookieHeader;
      return cookieHeader ? { headers: { "set-cookie": cookieHeader } } : {};
    },
  });
}

export { handler as GET, handler as POST };
