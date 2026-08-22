import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { TrpcContext } from "./_core/context";
import { sdk } from "./_core/sdk";

export type NextTrpcContext = TrpcContext & { cookieHeader?: string };

function serialize(name: string, value: string, options: { httpOnly?: boolean; path?: string; sameSite?: "lax" | "strict" | "none"; secure?: boolean; maxAge?: number }) {
  const attributes = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path ?? "/"}`];
  if (options.httpOnly) attributes.push("HttpOnly");
  if (options.secure) attributes.push("Secure");
  if (options.sameSite) attributes.push(`SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`);
  if (typeof options.maxAge === "number") attributes.push(`Max-Age=${options.maxAge}`);
  return attributes.join("; ");
}

function nextRequestToExpressLike(request: Request) {
  const headers: Record<string, string | undefined> = {
    authorization: request.headers.get("authorization") ?? undefined,
    cookie: request.headers.get("cookie") ?? undefined,
    "x-forwarded-proto": request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", ""),
  };
  return { headers, protocol: headers["x-forwarded-proto"]?.split(",")[0]?.trim() } as unknown as ExpressRequest;
}

function createResponseCollector() {
  let cookieHeader: string | undefined;
  const response = {
    cookie(name: string, value: string, options: Record<string, unknown> = {}) {
      cookieHeader = serialize(name, value, {
        httpOnly: Boolean(options.httpOnly),
        path: typeof options.path === "string" ? options.path : "/",
        sameSite: options.sameSite === "none" || options.sameSite === "lax" || options.sameSite === "strict" ? options.sameSite : undefined,
        secure: Boolean(options.secure),
        maxAge: typeof options.maxAge === "number" ? Math.max(0, Math.floor(options.maxAge / 1000)) : undefined,
      });
      return response;
    },
    clearCookie(name: string, options: Record<string, unknown> = {}) {
      cookieHeader = serialize(name, "", {
        httpOnly: Boolean(options.httpOnly),
        path: typeof options.path === "string" ? options.path : "/",
        sameSite: options.sameSite === "none" || options.sameSite === "lax" || options.sameSite === "strict" ? options.sameSite : undefined,
        secure: Boolean(options.secure),
        maxAge: 0,
      });
      return response;
    },
  } as unknown as ExpressResponse;
  return { response, getCookieHeader: () => cookieHeader };
}

export async function createNextTrpcContext(request: Request): Promise<NextTrpcContext> {
  const req = nextRequestToExpressLike(request);
  const collector = createResponseCollector();
  let user = null;
  try {
    user = await sdk.authenticateRequest(req);
  } catch {
    user = null;
  }
  return { req, res: collector.response, user, get cookieHeader() { return collector.getCookieHeader(); } };
}
