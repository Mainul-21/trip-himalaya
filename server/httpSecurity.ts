import type { Request } from "express";

type HeaderResponse = { setHeader(name: string, value: string): void };

export const PUBLIC_BODY_LIMIT = "1mb";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.manus.space",
  "connect-src 'self' https://api.manus.im https://*.manus.space",
  "media-src 'self' https://res.cloudinary.com https://*.manus.space",
].join("; ");

export function isSecureRequest(req: Pick<Request, "protocol" | "headers">) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const values = Array.isArray(forwardedProto)
    ? forwardedProto
    : typeof forwardedProto === "string"
      ? forwardedProto.split(",")
      : [];
  return values.some(value => value.trim().toLowerCase() === "https");
}

export function applySecurityHeaders(res: HeaderResponse, isProduction: boolean) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  if (isProduction) {
    res.setHeader("Content-Security-Policy", `${CONTENT_SECURITY_POLICY}; upgrade-insecure-requests`);
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}
