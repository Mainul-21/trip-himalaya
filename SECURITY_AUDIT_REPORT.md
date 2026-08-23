# Trip Himalaya Security Hardening Report

**Scope:** Requirements extracted from the uploaded security-audit prompt and applied to the active Vite, Express, tRPC, and Vercel deployment architecture.

## Implemented controls

| Area | Implementation |
|---|---|
| Transport and headers | Production HTTPS redirect logic, HSTS, clickjacking prevention, `nosniff`, Referrer Policy, Permissions Policy, and a restrictive Content Security Policy are applied at the Express/Vercel entry point. |
| Error handling | Unexpected production tRPC failures are returned with a generic message and without a stack trace. |
| Request abuse controls | Scoped per-client request limits protect public, administrator, and principal procedure layers. Existing public-form and credential-specific limits remain in place. Limit responses provide a retry time. |
| Sessions | Administrator JWTs are limited to 30 minutes, are HTTP-only, Secure in HTTPS deployments, and SameSite=Strict. Sensitive account changes and logout advance `lastSignedIn`, invalidating prior administrator tokens. |
| Account changes | Changing a personal email address or password requires the current password. These changes clear the current session and require sign-in again. Principal changes to an administrator’s email, password, or access status invalidate that administrator’s active sessions. |
| Upload boundary | Administrator image uploads use an allowlist, encoded and decoded size limits, image-file signature checks, strict canonical Base64 decoding, and managed storage paths. |
| Authorization | Server-side `adminProcedure` and `principalProcedure` remain the authority for protected actions; client visibility is not used as access control. |

## Validation performed

`npm test`, `npm run check`, and `npm run build` completed successfully after the changes. The regression suite includes header, request-limit, session-cookie, administrator boundary, upload, and deployment-bundle coverage.

## Required owner action

The `DATABASE_URL`, `JWT_SECRET`, and `CLOUDINARY_URL` values were previously exposed in screenshots. Rotate all three values immediately, enter the replacements in Vercel Environment Variables for **Production**, **Preview**, and **Development**, then redeploy. Never commit these values to the repository.

## Remaining limitation

Request limiting is intentionally in memory, so rate-limit state is per serverless instance. For a high-traffic, multi-instance deployment, move limit counters to a shared service such as Redis before depending on limits as a global abuse-control boundary.
