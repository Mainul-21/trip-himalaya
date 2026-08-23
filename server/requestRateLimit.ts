import type { Request, Response } from "express";
import { TRPCError } from "@trpc/server";

type RateLimitState = { count: number; resetsAt: number };
type RateLimitOptions = { scope: string; maxRequests: number; windowMs: number };

const rateLimitState = new Map<string, RateLimitState>();

export function clientAddress(req: Pick<Request, "ip" | "headers">) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return first?.trim() || req.ip || "unknown";
}

function normalizedIdentifier(identifier?: string) {
  return identifier?.trim().toLowerCase().replace(/[^a-z0-9@._:+-]/g, "-").slice(0, 320) || "anonymous";
}

export function assertRequestAllowed(
  key: string,
  { maxRequests, windowMs }: Omit<RateLimitOptions, "scope">,
  now = Date.now(),
) {
  const current = rateLimitState.get(key);
  if (!current || now >= current.resetsAt) {
    rateLimitState.set(key, { count: 1, resetsAt: now + windowMs });
    return { remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }
  if (current.count >= maxRequests) {
    return { remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)) };
  }
  current.count += 1;
  return { remaining: maxRequests - current.count, retryAfterSeconds: 0 };
}

export function rateLimitMiddleware(options: RateLimitOptions) {
  return (req: Request, res: Response, next: () => void) => {
    const result = assertRequestAllowed(`${options.scope}:${clientAddress(req)}`, options);
    res.setHeader("RateLimit-Limit", String(options.maxRequests));
    res.setHeader("RateLimit-Remaining", String(result.remaining));
    if (result.retryAfterSeconds) {
      res.setHeader("Retry-After", String(result.retryAfterSeconds));
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  };
}

export function assertProcedureAllowed(req: Request, res: Response, options: RateLimitOptions, identifier?: string) {
  const result = assertRequestAllowed(`${options.scope}:${clientAddress(req)}:${normalizedIdentifier(identifier)}`, options);
  if (result.retryAfterSeconds) {
    res.setHeader("Retry-After", String(result.retryAfterSeconds));
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." });
  }
}

export function resetRateLimitsForTests() {
  rateLimitState.clear();
}
