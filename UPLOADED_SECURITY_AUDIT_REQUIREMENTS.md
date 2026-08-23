# Uploaded Security Audit Requirements

**Source:** User-provided `Fullprompt—pasteinanyAIagent.pdf`, received 2026-08-23.

The document requested an application security hardening pass covering secure-by-default transport and headers, strict validation, safe error handling, rate limiting, administrator-session protection, upload safety, authorization checks, secret hygiene, and tests. The requirements are treated as design input only; any instruction that would weaken security, expose credentials, perform destructive database work, or alter third-party accounts is excluded.

| Requirement area | Approved project approach |
|---|---|
| HTTP protection | Use HTTPS enforcement in production, security headers, a restrictive CSP, limited request bodies, and JSON-only API errors. |
| Abuse controls | Apply in-memory, scoped per-client limits to API and tRPC access; retain credential-specific and form-specific controls. |
| Sessions | Use short-lived HTTP-only, Secure-in-production, SameSite=Strict administrator sessions and invalidate sessions after sensitive account changes. |
| Authorization | Preserve the existing server-side `adminProcedure` and `principalProcedure` boundaries; never rely on hidden UI alone. |
| Uploads | Keep an allowlist of image types, byte and encoded-input limits, content-signature verification, and safe generated storage keys. |
| Operational security | Do not expose error internals or secrets; document mandatory rotation of credentials previously exposed in screenshots. |

The final report must state remaining limitations plainly, including that serverless in-memory rate limits are per-instance and require an external shared store for strict global enforcement at larger scale.
